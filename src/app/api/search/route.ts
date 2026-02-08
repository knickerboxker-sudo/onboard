import { NextRequest, NextResponse } from "next/server";
import { fetchRecallResults, RecallResult } from "@/src/lib/api-fetcher";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const source = url.searchParams.get("source") || undefined;

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

      results = results
        .sort(
          (a: RecallResult, b: RecallResult) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .slice(0, 50);

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
