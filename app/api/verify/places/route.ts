import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/verify/places
 *
 * Verifies a brick-and-mortar business against the Google Places API.
 * Returns a confidence score (0–1) and the matched place name.
 *
 * Body: { businessName: string; address: string }
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rl = await rateLimit(clientIp, 10, 60 * 60 * 1000); // 10 requests per hour
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  // Require authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const businessName: string = body?.businessName?.trim() ?? "";
  const address: string = body?.address?.trim() ?? "";

  if (!businessName || !address) {
    return NextResponse.json({ error: "businessName and address are required." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Gracefully degrade: no API key configured — skip verification
    return NextResponse.json({ verified: false, confidence: null, message: "Places verification not configured." });
  }

  try {
    const query = encodeURIComponent(`${businessName} ${address}`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=name,formatted_address,place_id,business_status&key=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 0 } });
    const data = await response.json();

    if (!response.ok || data.status === "REQUEST_DENIED") {
      console.error("Google Places API error:", data.error_message ?? data.status);
      return NextResponse.json({ verified: false, confidence: null, message: "Places lookup failed." });
    }

    const candidates = data.candidates ?? [];
    if (candidates.length === 0) {
      return NextResponse.json({ verified: false, confidence: 0, message: "No matching business found in Google Places." });
    }

    const topMatch = candidates[0];
    // Simple name similarity check
    const nameSimilarity = computeNameSimilarity(businessName.toLowerCase(), (topMatch.name ?? "").toLowerCase());

    const isOperational = topMatch.business_status === "OPERATIONAL" || topMatch.business_status === undefined;
    const confidence = Math.round(nameSimilarity * (isOperational ? 1.0 : 0.6) * 100) / 100;

    return NextResponse.json({
      verified: confidence >= 0.6,
      confidence,
      matchedName: topMatch.name,
      matchedAddress: topMatch.formatted_address,
    });
  } catch (err) {
    console.error("Places verification error:", err);
    return NextResponse.json({ verified: false, confidence: null, message: "Verification temporarily unavailable." });
  }
}

/** Naive token-overlap similarity score between two strings (0–1). */
function computeNameSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  const tokensB = new Set(b.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}
