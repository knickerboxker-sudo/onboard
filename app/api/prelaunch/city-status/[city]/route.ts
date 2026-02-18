import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeString } from "@/lib/rate-limit";

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
      .from("city_launch_status")
      .select("*")
      .ilike("city", cityName)
      .single();

    if (error || !data) {
      // Return a not-yet-launched record for unknown cities
      return NextResponse.json({
        city: cityName,
        state: null,
        current_count: 0,
        threshold: 50,
        launched: false,
        percentage: 0,
        estimated_days: null,
        target_launch_date: null,
      });
    }

    const percentage = Math.min(
      Math.round((data.current_count / data.threshold) * 100),
      100
    );

    // Estimate launch date based on 7-day signup velocity
    let estimated_days: number | null = null;
    if (!data.launched && data.current_count > 0) {
      const remaining = data.threshold - data.current_count;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await supabase
        .from("pre_launch_signups")
        .select("id", { count: "exact", head: true })
        .ilike("city", cityName)
        .gte("created_at", sevenDaysAgo.toISOString());

      if (count && count > 0) {
        const dailyRate = count / 7;
        estimated_days = Math.ceil(remaining / dailyRate);
      }
    }

    return NextResponse.json({
      city: data.city,
      state: data.state,
      current_count: data.current_count,
      threshold: data.threshold,
      launched: data.launched,
      percentage,
      estimated_days,
      target_launch_date: data.target_launch_date,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
