import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;

  let targetCity: string | null = null;

  try {
    const supabase = createAdminClient();

    // Look up the referral code in prelaunch_signups
    const { data: signup } = await supabase
      .from("prelaunch_signups")
      .select("city, referral_code")
      .eq("referral_code", code)
      .maybeSingle();

    if (signup) {
      targetCity = signup.city;

      // Increment click count (fire-and-forget)
      void supabase.rpc("increment_referral_count", { referral_code_input: code });

      // Set attribution cookie (30 days)
      const cookieStore = await cookies();
      cookieStore.set("sb_ref", code, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }
  } catch {
    // Admin client unavailable — proceed gracefully
  }

  if (!targetCity) {
    redirect("/?ref_invalid=1");
  }

  redirect(`/prelaunch/city/${encodeURIComponent(targetCity)}?ref=${encodeURIComponent(code)}`);
}

