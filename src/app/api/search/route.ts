import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/src/server/search";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = {
      q: url.searchParams.get("q") || undefined,
      category: url.searchParams.get("category") || undefined,
      source: url.searchParams.get("source") || undefined,
      from: url.searchParams.get("from") || undefined,
      to: url.searchParams.get("to") || undefined,
      page: url.searchParams.get("page")
        ? parseInt(url.searchParams.get("page")!)
        : undefined,
      pageSize: url.searchParams.get("pageSize")
        ? parseInt(url.searchParams.get("pageSize")!)
        : undefined,
    };

    const results = await searchEvents(params);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
