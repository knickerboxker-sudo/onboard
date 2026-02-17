import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export async function GET(
  _request: Request,
  { params }: { params: { city: string } }
) {
  try {
    const city = decodeURIComponent(params.city);
    
    // Only accept ann-arbor-area
    const normalizedCity = city.toLowerCase().replace(/\s+/g, '-');
    if (normalizedCity !== 'ann-arbor-area') {
      return NextResponse.json(
        { error: "City not found. Sortir is currently only launching in the Ann Arbor Area." },
        { status: 404 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pre_launch_signups")
      .select("id, business_name, business_type, city, created_at")
      .eq("city", "Ann Arbor Area")
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
