import { NextResponse } from "next/server";
import { fetchAreaMetric } from "@/lib/areaHealth";
import { MAX_LOCATIONS, MIN_LOCATIONS, parseLocationsParam } from "@/lib/location";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLocations = parseLocationsParam(searchParams.get("locations"));

  if (rawLocations.length < MIN_LOCATIONS || rawLocations.length > MAX_LOCATIONS) {
    return NextResponse.json(
      { error: "Provide between 2 and 4 locations." },
      { status: 400 },
    );
  }

  const metrics = await Promise.all(rawLocations.map(fetchAreaMetric));
  return NextResponse.json({ metrics });
}
