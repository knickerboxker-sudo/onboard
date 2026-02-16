import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, email, business_type, city, state, partnership_interests, referred_by } = body;

    if (!business_name || !email || !business_type || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if email already registered
    const { data: existing } = await supabase
      .from("pre_launch_signups")
      .select("id, referral_code")
      .eq("email", email)
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
        business_name,
        email,
        business_type,
        city,
        state,
        partnership_interests: partnership_interests || [],
        referral_code,
        referred_by: referred_by || null,
        status: "waiting",
      })
      .select()
      .single();

    if (signupError) {
      return NextResponse.json(
        { error: "Failed to create signup" },
        { status: 500 }
      );
    }

    // Increment city count
    const { data: cityData } = await supabase
      .from("city_launch_status")
      .select("current_count")
      .eq("city", city)
      .single();

    if (cityData) {
      await supabase
        .from("city_launch_status")
        .update({ current_count: cityData.current_count + 1 })
        .eq("city", city);
    }

    // If referred, increment referrer's count
    if (referred_by) {
      const { data: referrer } = await supabase
        .from("pre_launch_signups")
        .select("id, referral_count")
        .eq("referral_code", referred_by)
        .single();

      if (referrer) {
        await supabase
          .from("pre_launch_signups")
          .update({ referral_count: referrer.referral_count + 1 })
          .eq("id", referrer.id);
      }
    }

    return NextResponse.json({
      success: true,
      referral_code: signup.referral_code,
      city: signup.city,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
