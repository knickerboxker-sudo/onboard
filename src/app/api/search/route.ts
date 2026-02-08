import { NextRequest, NextResponse } from "next/server";
import { fetchRecallResults, RecallResult } from "@/src/lib/api-fetcher";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const source = url.searchParams.get("source") || undefined;
    const yearParam = url.searchParams.get("year") || undefined;
    const rangeParam = url.searchParams.get("range") || undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      let results = await fetchRecallResults({ query, signal: controller.signal });

      if (category) {
        results = results.filter((item) => item.category === category);
      }
      if (source) {
        results = results.filter((item) => item.source === source);
      }
      if (yearParam) {
        const startYear = Number(yearParam);
        const rangeYears = Math.max(1, Number(rangeParam) || 1);
        if (!Number.isNaN(startYear)) {
          const start = Date.UTC(startYear, 0, 1, 0, 0, 0, 0);
          const endYear = startYear + rangeYears - 1;
          const end = Date.UTC(endYear, 11, 31, 23, 59, 59, 999);
          results = results.filter((item) => {
            const publishedTime = new Date(item.publishedAt).getTime();
            return publishedTime >= start && publishedTime <= end;
          });
        }
      }

      results = results.sort(
        (a: RecallResult, b: RecallResult) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );

      return NextResponse.json({
        results,
        total: results.length,
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
