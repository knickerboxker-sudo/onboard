import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/verify/manual
 *
 * Submits a manual verification request for online, freelancer, or entrepreneur businesses.
 * The owner will manually review these requests.
 *
 * Body: { website?: string; notes?: string }
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rl = rateLimit(clientIp, 5, 60 * 60 * 1000); // 5 per hour
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Get the user's business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, business_category, website, verification_status")
    .eq("owner_id", user.id)
    .single();

  if (bizError || !business) {
    return NextResponse.json({ error: "Business profile not found. Complete onboarding first." }, { status: 404 });
  }

  if (business.verification_status === "verified") {
    return NextResponse.json({ message: "Your business is already verified." });
  }

  const body = await request.json().catch(() => ({}));
  const website: string = body?.website?.trim() ?? business.website ?? "";
  const notes: string = body?.notes?.trim() ?? "";

  // For online/freelancer/entrepreneur, a website is required
  const requiresWebsite = ["online", "freelancer", "entrepreneur"].includes(business.business_category ?? "");
  if (requiresWebsite && !website) {
    return NextResponse.json({ error: "A website or portfolio URL is required for verification." }, { status: 400 });
  }

  // Upsert the verification request
  const { error: upsertError } = await supabase
    .from("manual_verification_requests")
    .upsert({
      business_id: business.id,
      business_category: business.business_category ?? "unknown",
      website: website || null,
      notes: notes || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "business_id" });

  if (upsertError) {
    console.error("Manual verification upsert error:", upsertError);
    return NextResponse.json({ error: "Failed to submit verification request." }, { status: 500 });
  }

  // Update business verification_status to "pending"
  await supabase
    .from("businesses")
    .update({ verification_status: "pending" })
    .eq("id", business.id);

  return NextResponse.json({ success: true, message: "Verification request submitted. We'll review it within 1–2 business days." });
}
