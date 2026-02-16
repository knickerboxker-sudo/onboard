import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { city: string } }
) {
  try {
    const city = decodeURIComponent(params.city);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("city_launch_status")
      .select("*")
      .eq("city", city)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }

    const percentage = Math.min(
      Math.round((data.current_count / data.threshold) * 100),
      100
    );

    // Estimate launch date based on 7-day signup velocity
    let estimated_days: number | null = null;
    if (!data.launched && data.current_count > 0) {
      const remaining = data.threshold - data.current_count;
      // Get signups from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await supabase
        .from("pre_launch_signups")
        .select("id", { count: "exact", head: true })
        .eq("city", city)
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
