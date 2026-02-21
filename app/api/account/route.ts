import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(_request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Soft-delete the business (set deleted_at).
  // Note: soft-deleted businesses must be filtered out in all discovery, matching,
  // and connection queries using .is("deleted_at", null).
  const { data: softDeletedBusiness } = await admin
    .from("businesses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("owner_id", user.id)
    .select("deleted_at")
    .single();

  // Guard: if the soft-delete did not succeed (business row not found), abort to
  // prevent orphaned auth users with no cleaned-up business row.
  if (!softDeletedBusiness?.deleted_at) {
    return NextResponse.json({ error: "Failed to soft-delete business. Account deletion aborted." }, { status: 500 });
  }

  // Permanently delete the auth user
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
