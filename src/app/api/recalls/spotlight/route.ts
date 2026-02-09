import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DateRangeKey,
  fetchRecallResults,
  RecallResult,
} from "@/src/lib/api-fetcher";
import { checkRateLimit, getClientIp } from "@/src/lib/rate-limit";

const spotlightQuerySchema = z.object({
  dateRange: z.enum(["1y", "2y", "5y", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(["most", "least"]).optional(),
});

export interface CompanyRecallCount {
  company: string;
  count: number;
  categories: string[];
  sources: string[];
  latestRecall: string;
}

/**
 * Normalize a company name for grouping. Strips common corporate
 * suffixes, collapses whitespace, and lower-cases the result.
 */
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.'"""'']/g, "")
    .replace(
      /\b(inc|incorporated|corp|corporation|co|company|ltd|limited|llc|plc|lp|llp|holdings|group|intl|international)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick the best display-name from all raw variants seen for a single
 * normalised key (longest variant is typically the most complete).
 */
function pickDisplayName(variants: string[]): string {
  return variants.reduce((best, v) => (v.length > best.length ? v : best), variants[0]);
}

function aggregateCompanies(results: RecallResult[]): CompanyRecallCount[] {
  const map = new Map<
    string,
    {
      variants: string[];
      count: number;
      categories: Set<string>;
      sources: Set<string>;
      latestRecall: string;
    }
  >();

  for (const recall of results) {
    const raw = recall.companyName?.trim();
    if (!raw) continue;
    const key = normalizeCompanyName(raw);
    if (!key) continue;

    const entry = map.get(key) ?? {
      variants: [],
      count: 0,
      categories: new Set<string>(),
      sources: new Set<string>(),
      latestRecall: "",
    };

    entry.variants.push(raw);
    entry.count += 1;
    entry.categories.add(recall.category);
    entry.sources.add(recall.source);

    if (
      !entry.latestRecall ||
      new Date(recall.publishedAt).getTime() > new Date(entry.latestRecall).getTime()
    ) {
      entry.latestRecall = recall.publishedAt;
    }

    map.set(key, entry);
  }

  return Array.from(map.values()).map((entry) => ({
    company: pickDisplayName(entry.variants),
    count: entry.count,
    categories: Array.from(entry.categories),
    sources: Array.from(entry.sources),
    latestRecall: entry.latestRecall,
  }));
}

/**
 * Map the spotlight-specific dateRange values to the ones supported
 * by fetchRecallResults.  "5y" is handled by fetching "all" and then
 * filtering client-side.
 */
function toFetchDateRange(range?: string): DateRangeKey {
  if (range === "1y") return "1y";
  if (range === "2y") return "2y";
  // "5y" and "all" both fetch everything; 5y is filtered afterwards
  return "all";
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`spotlight:${clientIp}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rateLimit.resetIn} seconds.` },
      { status: 429 }
    );
  }

  const url = new URL(req.url);
  const params = {
    dateRange: url.searchParams.get("dateRange") || undefined,
    limit: url.searchParams.get("limit") || undefined,
    sort: url.searchParams.get("sort") || undefined,
  };

  const validation = spotlightQuerySchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid parameters." },
      { status: 400 }
    );
  }

  const { dateRange = "2y", limit = 20, sort = "most" } = validation.data;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const { results, fetchedAt } = await fetchRecallResults({
        signal: controller.signal,
        dateRange: toFetchDateRange(dateRange),
      });

      let filtered = results;

      // Handle the "5y" case by filtering client-side
      if (dateRange === "5y") {
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        filtered = results.filter((r) => {
          const t = new Date(r.publishedAt).getTime();
          return !Number.isNaN(t) && t >= fiveYearsAgo.getTime();
        });
      }

      const companies = aggregateCompanies(filtered);

      // Sort by recall count
      if (sort === "most") {
        companies.sort((a, b) => b.count - a.count);
      } else {
        // "least" – show companies with fewest recalls (but at least 1)
        companies.sort((a, b) => a.count - b.count);
      }

      const sliced = companies.slice(0, limit);

      return NextResponse.json({
        companies: sliced,
        totalCompanies: companies.length,
        totalRecalls: filtered.length,
        dateRange,
        fetchedAt,
        /** Clarifies what each "count" represents. */
        countLabel: "enforcement actions",
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out." },
        { status: 504 }
      );
    }
    console.error("Spotlight API error:", err);
    return NextResponse.json(
      { error: "Failed to load spotlight data." },
      { status: 500 }
    );
  }
}
