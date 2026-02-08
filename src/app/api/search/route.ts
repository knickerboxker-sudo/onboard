import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DateRangeKey,
  fetchRecallResults,
  RecallResult,
  RecallSource,
  RecallCategory,
} from "@/src/lib/api-fetcher";
import { checkRateLimit, getClientIp } from "@/src/lib/rate-limit";

// Validation schemas
const dateRangeSchema = z.enum(["30d", "3m", "6m", "1y", "2y", "all"]);
const categorySchema = z.enum(["consumer", "vehicle", "food", "drug", "device", "environmental", "marine"]);
const sourceSchema = z.enum(["CPSC", "NHTSA", "FSIS", "FDA", "EPA", "USCG"]);

const searchQuerySchema = z.object({
  q: z.string().max(200, "Search query must be less than 200 characters").optional(),
  category: categorySchema.optional(),
  source: sourceSchema.optional(),
  refresh: z.enum(["1", "true"]).optional(),
  dateRange: dateRangeSchema.optional(),
});

// Prohibited content patterns for search queries
const prohibitedPatterns: RegExp[] = [
  /\b(?:child\s?porn|sexual\s?assault|sex\s?trafficking)\b/i,
  /\b(?:hate\s?speech|racial\s?slur)\b/i,
];

/**
 * Checks if search query contains prohibited content.
 */
function containsProhibitedContent(query: string): boolean {
  return prohibitedPatterns.some((pattern) => pattern.test(query));
}

/**
 * Sanitizes search query to prevent injection attacks.
 */
function sanitizeQuery(query: string): string {
  // Remove potential SQL injection patterns
  return query
    .replace(/[;<>]/g, "")
    .trim();
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting - 10 requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`search:${clientIp}`, {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          error: `Too many search requests. Please try again in ${rateLimit.resetIn} seconds.`,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetIn?.toString() || "60",
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
      refresh: url.searchParams.get("refresh") || undefined,
      dateRange: url.searchParams.get("dateRange") || undefined,
    };

    const validation = searchQuerySchema.safeParse(params);
    
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      
      console.log(`Validation error for IP ${clientIp}:`, errors);
      
      return NextResponse.json(
        { error: `Invalid search parameters: ${errors}` },
        { status: 400 }
      );
    }

    const { q: query, category, source, refresh, dateRange } = validation.data;

    // Check for prohibited content in search query
    if (query && containsProhibitedContent(query)) {
      console.log(`Prohibited content detected for IP ${clientIp}: ${query}`);
      return NextResponse.json(
        { error: "Invalid search terms. Please revise your query." },
        { status: 400 }
      );
    }

    // Sanitize query
    const sanitizedQuery = query ? sanitizeQuery(query) : undefined;

    // Set up abort controller with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const { results: fetchedResults, fetchedAt } = await fetchRecallResults({
        query: sanitizedQuery,
        signal: controller.signal,
        refresh: refresh === "1" || refresh === "true",
        dateRange: dateRange as DateRangeKey | undefined,
      });
      
      let results = fetchedResults;

      // Apply filters
      if (category) {
        results = results.filter((item) => item.category === category);
      }
      if (source) {
        results = results.filter((item) => item.source === source);
      }
      
      // Sort by date
      results = results.sort(
        (a: RecallResult, b: RecallResult) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );

      const duration = Date.now() - startTime;
      console.log(
        `Search completed for IP ${clientIp} in ${duration}ms: ${results.length} results` +
        (query ? ` for "${sanitizedQuery}"` : "")
      );

      return NextResponse.json(
        {
          results,
          total: results.length,
          fetchedAt,
        },
        {
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        console.error(`Search timeout after ${duration}ms:`, err.message);
        return NextResponse.json(
          { error: "Search timed out. Please try again." },
          { status: 504 }
        );
      }
      
      // Log error but don't expose details to user
      console.error(`Search error after ${duration}ms:`, {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
    } else {
      console.error(`Unknown search error after ${duration}ms:`, err);
    }
    
    return NextResponse.json(
      { error: "Search failed. Please try again later." },
      { status: 500 }
    );
  }
}
