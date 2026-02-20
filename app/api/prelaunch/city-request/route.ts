import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, sanitizeString } from "@/lib/rate-limit";

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
    const { city, state, email } = body;

    if (!city || !state || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanCity = sanitizeString(String(city), 100);
    const cleanState = sanitizeString(String(state), 50);
    const cleanEmail = sanitizeString(String(email), 254);

    const supabase = await createClient();

    const { error } = await supabase
      .from("city_requests")
      .insert({ city: cleanCity, state: cleanState, email: cleanEmail });

    if (error) {
      console.error("City request insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("City request API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
