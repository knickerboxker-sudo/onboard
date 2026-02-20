import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, sanitizeString } from "@/lib/rate-limit";
import crypto from "crypto";

const emailSchema = z.string().email();

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLen = chars.length; // 62
  const maxUnbiased = Math.floor(256 / charsLen) * charsLen; // 248 — reject bytes >= this
  let code = "";
  while (code.length < 8) {
    const bytes = crypto.randomBytes(16);
    for (const byte of bytes) {
      if (code.length >= 8) break;
      if (byte < maxUnbiased) {
        code += chars[byte % charsLen];
      }
    }
  }
  return code;
}

export async function POST(request: Request) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, 10);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { business_name, email, business_type, city, state, partnership_interests, referred_by } = body;

    if (!business_name || !email || !business_type || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanBusinessName = sanitizeString(String(business_name), 200);
    const cleanEmail = sanitizeString(String(email), 254);
    const cleanBusinessType = sanitizeString(String(business_type), 100);
    const cleanCity = sanitizeString(String(city), 100);
    const cleanState = sanitizeString(String(state), 50);
    const cleanReferredBy = referred_by ? sanitizeString(String(referred_by), 20) : null;
    const cleanInterests = Array.isArray(partnership_interests)
      ? partnership_interests.map((i: unknown) => sanitizeString(String(i), 100)).slice(0, 10)
      : [];

    const supabase = await createClient();

    // Check if email already registered
    const { data: existing } = await supabase
      .from("pre_launch_signups")
      .select("id, referral_code")
      .eq("email", cleanEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already on the waitlist", referral_code: existing.referral_code },
        { status: 409 }
      );
    }

    // Generate unique referral code
    let referral_code = generateReferralCode();
    let codeExists = true;
    while (codeExists) {
      const { data: codeCheck } = await supabase
        .from("pre_launch_signups")
        .select("id")
        .eq("referral_code", referral_code)
        .single();
      if (!codeCheck) {
        codeExists = false;
      } else {
        referral_code = generateReferralCode();
      }
    }

    // Create signup record
    const { data: signup, error: signupError } = await supabase
      .from("pre_launch_signups")
      .insert({
        business_name: cleanBusinessName,
        email: cleanEmail,
        business_type: cleanBusinessType,
        city: cleanCity,
        state: cleanState,
        partnership_interests: cleanInterests,
        referral_code,
        referred_by: cleanReferredBy,
        status: "waiting",
      })
      .select()
      .single();

    if (signupError) {
      console.error("Signup insert error:", signupError);
      return NextResponse.json(
        { error: "Failed to create signup" },
        { status: 500 }
      );
    }

    // Ensure city_launch_status record exists (trigger handles it, but upsert as safety net)
    const { data: cityRow } = await supabase
      .from("city_launch_status")
      .upsert(
        { city: cleanCity, state: cleanState, threshold: 50, current_count: 0, launched: false },
        { onConflict: "city", ignoreDuplicates: true },
      )
      .select("lat, lng")
      .single();

    // Geocode the city if coordinates are missing
    if (!cityRow?.lat || !cityRow?.lng) {
      try {
        const geocodeUrl = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
        geocodeUrl.searchParams.set("address", `${cleanCity}, ${cleanState}`);
        geocodeUrl.searchParams.set("benchmark", "Public_AR_Current");
        geocodeUrl.searchParams.set("format", "json");

        const geoRes = await fetch(geocodeUrl.toString(), { signal: AbortSignal.timeout(5000) });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const match = geoData?.result?.addressMatches?.[0];
          if (match?.coordinates) {
            const lat = parseFloat(match.coordinates.y);
            const lng = parseFloat(match.coordinates.x);
            if (!isNaN(lat) && !isNaN(lng)) {
              await supabase
                .from("city_launch_status")
                .update({ lat, lng })
                .ilike("city", cleanCity);
            }
          }
        }
      } catch (geoErr) {
        // Non-fatal: coordinates will be populated on a future signup
        console.warn("Geocoding failed for", cleanCity, geoErr);
      }
    }

    // If referred, atomically increment referrer's count
    if (cleanReferredBy) {
      const { error: rpcError } = await supabase.rpc("increment_referral_count", { referral_code_input: cleanReferredBy });
      if (rpcError) {
        console.error("Failed to increment referral count:", rpcError);
      }
    }

    return NextResponse.json({
      success: true,
      referral_code: signup.referral_code,
      city: signup.city,
    });
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
