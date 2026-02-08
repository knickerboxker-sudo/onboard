import { NextRequest } from "next/server";
import {
  DateRangeKey,
  getSourceFetchers,
  RecallResult,
  RecallSource,
  filterByQuery,
  sortRecallsByDate,
} from "@/src/lib/api-fetcher";

type StreamEvent = 
  | { type: "start"; sources: RecallSource[] }
  | { type: "source_start"; source: RecallSource }
  | { type: "source_complete"; source: RecallSource; count: number; duration: number }
  | { type: "source_error"; source: RecallSource; error: string }
  | { type: "results"; results: RecallResult[]; total: number }
  | { type: "complete"; total: number; duration: number };

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const source = url.searchParams.get("source") || undefined;
  const dateRange = (url.searchParams.get("dateRange") || undefined) as DateRangeKey | undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: StreamEvent) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        const abortController = new AbortController();
        const sourceFetchers = getSourceFetchers({
          query,
          signal: abortController.signal,
          dateRange,
        });

        const sources = sourceFetchers.map((sf) => sf.source);
        sendEvent({ type: "start", sources });

        const startTime = Date.now();
        const allResults: RecallResult[] = [];

        // Fetch from each source independently and stream results
        await Promise.allSettled(
          sourceFetchers.map(async (fetcher) => {
            const sourceStart = Date.now();
            sendEvent({ type: "source_start", source: fetcher.source });

            try {
              const results = await fetcher.fetch();
              const duration = Date.now() - sourceStart;
              
              sendEvent({
                type: "source_complete",
                source: fetcher.source,
                count: results.length,
                duration,
              });

              // Apply filters and add to results
              let filtered = results;
              if (category) {
                filtered = filtered.filter((r) => r.category === category);
              }
              if (source && fetcher.source !== source) {
                filtered = [];
              }
              if (query) {
                filtered = filterByQuery(filtered, query);
              }

              allResults.push(...filtered);

              // Send current results after each source completes
              const sorted = sortRecallsByDate(allResults);
              sendEvent({
                type: "results",
                results: sorted,
                total: allResults.length,
              });
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : "Unknown error";
              sendEvent({
                type: "source_error",
                source: fetcher.source,
                error: errorMsg,
              });
            }
          })
        );

        const totalDuration = Date.now() - startTime;
        const sorted = sortRecallsByDate(allResults);
        sendEvent({
          type: "complete",
          total: sorted.length,
          duration: totalDuration,
        });
        
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
