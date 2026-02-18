import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeString } from "@/lib/rate-limit";

export const revalidate = 60;

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

    // Call Haversine RPC to get nearby cities within 50 miles
    const { data: nearbyCities, error: rpcError } = await supabase
      .rpc("get_nearby_cities", { p_city: cityName, p_radius_miles: 50 });

    if (rpcError) {
      console.error("get_nearby_cities RPC error:", rpcError);
      return NextResponse.json({ error: "Failed to fetch nearby cities" }, { status: 500 });
    }

    if (!nearbyCities || nearbyCities.length === 0) {
      return NextResponse.json({ nearby_cities: [] });
    }

    // For each nearby city, fetch up to 5 recent pre_launch_signups
    const citiesWithSignups = await Promise.all(
      nearbyCities.map(async (nc: {
        city: string;
        state: string;
        current_count: number;
        threshold: number;
        launched: boolean;
        distance_miles: number;
      }) => {
        const { data: signups } = await supabase
          .from("pre_launch_signups")
          .select("business_name, business_type, city")
          .ilike("city", nc.city)
          .order("created_at", { ascending: false })
          .limit(5);

        return {
          city: nc.city,
          state: nc.state,
          current_count: nc.current_count,
          threshold: nc.threshold,
          launched: nc.launched,
          distance_miles: Math.round(nc.distance_miles * 10) / 10,
          recent_signups: signups ?? [],
        };
      })
    );

    return NextResponse.json({ nearby_cities: citiesWithSignups });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
