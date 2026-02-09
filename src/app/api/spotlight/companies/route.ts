import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRecallResults, DateRangeKey } from "@/src/lib/api-fetcher";
import {
  buildRecallDataset,
  Sector,
} from "@/src/lib/recall-pipeline";
import { checkRateLimit, getClientIp } from "@/src/lib/rate-limit";

const sectorOptions = [
  "all",
  "FOOD",
  "DRUGS",
  "MEDICAL_DEVICE",
  "CONSUMER_PRODUCT",
  "VEHICLE",
  "MARITIME",
  "ENVIRONMENTAL",
  "OTHER",
] as const;

const querySchema = z.object({
  timeframe: z.enum(["30d", "90d", "1y", "2y", "all"]).optional(),
  sort: z.enum(["most", "fewest"]).optional(),
  sector: z.enum(sectorOptions).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

function timeframeToFetchRange(timeframe: string): DateRangeKey {
  switch (timeframe) {
    case "30d":
      return "30d";
    case "90d":
      return "3m";
    case "1y":
      return "1y";
    case "2y":
      return "2y";
    case "all":
    default:
      return "all";
  }
}

function timeframeStart(timeframe: string): Date {
  const now = new Date();
  const start = new Date(now);
  switch (timeframe) {
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "2y":
      start.setFullYear(start.getFullYear() - 2);
      break;
    case "all":
    default:
      start.setTime(0);
      break;
  }
  return start;
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`spotlight:companies:${clientIp}`, {
    maxRequests: 12,
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
    timeframe: url.searchParams.get("timeframe") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    sector: url.searchParams.get("sector") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  };

  const validation = querySchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  const {
    timeframe = "2y",
    sort = "most",
    sector = "all",
    limit = 20,
  } = validation.data;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const { results, fetchedAt } = await fetchRecallResults({
        signal: controller.signal,
        dateRange: timeframeToFetchRange(timeframe),
      });

      const { recalls, companies } = buildRecallDataset(results);
      const start = timeframeStart(timeframe);
      const end = new Date();

      const filteredRecalls = recalls.filter((recall) => {
        const publishedTime = new Date(recall.publishedAt).getTime();
        if (Number.isNaN(publishedTime)) return false;
        if (publishedTime < start.getTime() || publishedTime > end.getTime()) {
          return false;
        }
        if (sector !== "all" && recall.sector !== (sector as Sector)) {
          return false;
        }
        return true;
      });

      const companyLookup = new Map(companies.map((c) => [c.id, c.canonicalName]));
      const companyCounts = new Map<
        string,
        { recallIds: Set<string>; name: string }
      >();

      for (const recall of filteredRecalls) {
        for (const link of recall.companyLinks) {
          const name =
            companyLookup.get(link.companyId) || link.rawCompanyName;
          const entry = companyCounts.get(link.companyId) || {
            recallIds: new Set<string>(),
            name,
          };
          entry.recallIds.add(recall.id);
          companyCounts.set(link.companyId, entry);
        }
      }

      const companiesList = Array.from(companyCounts.entries()).map(
        ([companyId, data]) => ({
          company_id: companyId,
          company_name: data.name,
          recall_count: data.recallIds.size,
        })
      );

      companiesList.sort((a, b) =>
        sort === "most"
          ? b.recall_count - a.recall_count
          : a.recall_count - b.recall_count
      );

      return NextResponse.json({
        companies: companiesList.slice(0, limit),
        metadata: {
          timeframe_start: start.toISOString(),
          timeframe_end: end.toISOString(),
          sector,
          total_companies: companyCounts.size,
          total_recalls: filteredRecalls.length,
        },
        fetchedAt,
        countLabel: "recall occurrences",
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out." }, { status: 504 });
    }
    console.error("Spotlight companies API error:", err);
    return NextResponse.json(
      { error: "Failed to load spotlight data." },
      { status: 500 }
    );
  }
}
