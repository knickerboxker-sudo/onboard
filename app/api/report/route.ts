import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { ReportSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 reports per hour per user
  const rateLimitResult = await rateLimit(`report:${user.id}`, 5, 60 * 60 * 1000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetInSeconds} seconds.` },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { reported_business_id, reason, details, is_block } = parsed.data;

  // Get reporter's business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("reports").insert({
    reporter_business_id: business.id,
    reported_business_id,
    reason,
    details: details ?? null,
    is_block: is_block ?? false,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
