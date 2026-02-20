import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { action, reviewer_notes } = body as { action: "approve" | "reject"; reviewer_notes?: string };

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();
  const newStatus = action === "approve" ? "approved" : "rejected";

  const { data: verification, error: verErr } = await admin
    .from("verifications")
    .update({
      status: newStatus,
      verified_at: action === "approve" ? new Date().toISOString() : null,
      reviewer_notes: reviewer_notes ?? null,
    })
    .eq("id", id)
    .select("business_id")
    .single();

  if (verErr || !verification) {
    return NextResponse.json({ error: verErr?.message ?? "Not found" }, { status: 404 });
  }

  if (action === "approve") {
    await admin
      .from("businesses")
      .update({ verified: true })
      .eq("id", verification.business_id);
  }

  return NextResponse.json({ success: true, status: newStatus });
}
