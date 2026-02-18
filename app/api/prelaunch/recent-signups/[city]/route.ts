import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeString } from "@/lib/rate-limit";

export const revalidate = 30;

export async function GET(
  _request: Request,
  { params }: { params: { city: string } }
) {
  try {
    const rawCity = decodeURIComponent(params.city);
    const cityName = sanitizeString(rawCity, 100);

    if (!cityName) {
      return NextResponse.json({ error: "City name is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pre_launch_signups")
      .select("id, business_name, business_type, city, created_at")
      .ilike("city", cityName)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch signups" },
        { status: 500 }
      );
    }

    return NextResponse.json({ signups: data || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
