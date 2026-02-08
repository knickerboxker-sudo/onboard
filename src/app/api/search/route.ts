import { NextRequest, NextResponse } from "next/server";
import {
  DateRangeKey,
  fetchRecallResults,
  RecallResult,
} from "@/src/lib/api-fetcher";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const source = url.searchParams.get("source") || undefined;
    const refresh = url.searchParams.get("refresh") === "1";
    const dateRange = (url.searchParams.get("dateRange") ||
      undefined) as DateRangeKey | undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const { results: fetchedResults, fetchedAt } = await fetchRecallResults({
        query,
        signal: controller.signal,
        refresh,
        dateRange: dateRange === "all" ? "all" : undefined,
      });
      let results = fetchedResults;

      if (category) {
        results = results.filter((item) => item.category === category);
      }
      if (source) {
        results = results.filter((item) => item.source === source);
      }
      results = results.sort(
        (a: RecallResult, b: RecallResult) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );

      return NextResponse.json({
        results,
        total: results.length,
        fetchedAt,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Search timed out" },
        { status: 504 }
      );
    }
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
