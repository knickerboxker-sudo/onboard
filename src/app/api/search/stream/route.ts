import { NextRequest } from "next/server";
import { z } from "zod";
import {
  DateRangeKey,
  getSourceFetchers,
  RecallResult,
  RecallSource,
  filterByQuery,
  sortRecallsByDate,
} from "@/src/lib/api-fetcher";
import { checkRateLimit, getClientIp } from "@/src/lib/rate-limit";

// Validation schemas
const dateRangeSchema = z.enum(["30d", "3m", "6m", "1y", "2y", "all"]);
const categorySchema = z.enum(["consumer", "vehicle", "food", "drug", "device", "environmental", "marine"]);
const sourceSchema = z.enum(["CPSC", "NHTSA", "FSIS", "FDA", "EPA", "USCG"]);

const searchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  category: categorySchema.optional(),
  source: sourceSchema.optional(),
  dateRange: dateRangeSchema.optional(),
});

type StreamEvent = 
  | { type: "start"; sources: RecallSource[] }
  | { type: "source_start"; source: RecallSource }
  | { type: "source_complete"; source: RecallSource; count: number; duration: number }
  | { type: "source_error"; source: RecallSource; error: string }
  | { type: "results"; results: RecallResult[]; total: number }
  | { type: "complete"; total: number; duration: number }
  | { type: "error"; error: string };

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Rate limiting - 10 requests per minute per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`search-stream:${clientIp}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    console.log(`Streaming search rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({
        error: `Too many search requests. Please try again in ${rateLimit.resetIn} seconds.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Parse and validate query parameters
  const url = new URL(req.url);
  const params = {
    q: url.searchParams.get("q") || undefined,
    category: url.searchParams.get("category") || undefined,
    source: url.searchParams.get("source") || undefined,
    dateRange: url.searchParams.get("dateRange") || undefined,
  };

  const validation = searchQuerySchema.safeParse(params);
  
  if (!validation.success) {
    const errors = validation.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    
    console.log(`Streaming search validation error for IP ${clientIp}:`, errors);
    
    return new Response(
      JSON.stringify({ error: `Invalid search parameters: ${errors}` }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { q: query, category, source, dateRange } = validation.data;

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
          dateRange: dateRange as DateRangeKey | undefined,
        });

        const sources = sourceFetchers.map((sf) => sf.source);
        sendEvent({ type: "start", sources });
        
        console.log(
          `Streaming search started for IP ${clientIp}` +
          (query ? ` with query "${query}"` : "")
        );

        const allResults: RecallResult[] = [];

        // Fetch from each source independently and stream results
        await Promise.allSettled(
          sourceFetchers.map(async (fetcher) => {
            const sourceStart = Date.now();
            sendEvent({ type: "source_start", source: fetcher.source });

            try {
              const results = await fetcher.fetch();
              const duration = Date.now() - sourceStart;
              
              console.log(
                `${fetcher.source} returned ${results.length} results in ${duration}ms`
              );
              
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
              const duration = Date.now() - sourceStart;
              const errorMsg = error instanceof Error ? error.message : "Unknown error";
              
              console.error(
                `${fetcher.source} failed after ${duration}ms:`,
                errorMsg
              );
              
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
        
        console.log(
          `Streaming search completed for IP ${clientIp} in ${totalDuration}ms: ` +
          `${sorted.length} total results`
        );
        
        sendEvent({
          type: "complete",
          total: sorted.length,
          duration: totalDuration,
        });
        
        controller.close();
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Streaming search error after ${duration}ms:`, error);
        
        sendEvent({
          type: "error",
          error: "Search failed. Please try again.",
        });
        
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    },
  });
}
