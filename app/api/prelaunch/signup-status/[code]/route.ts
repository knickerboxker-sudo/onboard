import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = await createClient();

    const { data: signup, error } = await supabase
      .from("pre_launch_signups")
      .select("referral_code, business_name, city, state, referral_count, created_at")
      .eq("referral_code", params.code)
      .single();

    if (error || !signup) {
      return NextResponse.json(
        { error: "Signup not found" },
        { status: 404 }
      );
    }

    // Calculate position (how many signed up before in same city)
    const { count } = await supabase
      .from("pre_launch_signups")
      .select("id", { count: "exact", head: true })
      .eq("city", signup.city)
      .lte("created_at", signup.created_at);

    return NextResponse.json({
      referral_code: signup.referral_code,
      business_name: signup.business_name,
      city: signup.city,
      state: signup.state,
      referral_count: signup.referral_count,
      position: count || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
