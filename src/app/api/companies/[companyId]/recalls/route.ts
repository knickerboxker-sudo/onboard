import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRecallResults, DateRangeKey } from "@/src/lib/api-fetcher";
import {
  buildRecallDataset,
  Sector,
} from "@/src/lib/recall-pipeline";

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
  sector: z.enum(sectorOptions).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
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

function resolveRecallTime(recall: { publishedAt: string; recalledAt?: string }) {
  const publishedTime = new Date(recall.publishedAt).getTime();
  if (!Number.isNaN(publishedTime)) return publishedTime;
  if (recall.recalledAt) {
    const recalledTime = new Date(recall.recalledAt).getTime();
    if (!Number.isNaN(recalledTime)) return recalledTime;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const url = new URL(req.url);
  const validation = querySchema.safeParse({
    timeframe: url.searchParams.get("timeframe") || undefined,
    sector: url.searchParams.get("sector") || undefined,
    page: url.searchParams.get("page") || undefined,
    pageSize: url.searchParams.get("pageSize") || undefined,
  });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  const { timeframe = "2y", sector = "all", page = 1, pageSize = 10 } =
    validation.data;

  try {
    const { results } = await fetchRecallResults({
      dateRange: timeframeToFetchRange(timeframe),
    });

    const { recalls, companies } = buildRecallDataset(results);
    const company = companies.find((c) => c.id === params.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const start = timeframeStart(timeframe);
    const end = new Date();
    const filteredRecalls = recalls.filter((recall) => {
      const publishedTime = resolveRecallTime(recall);
      if (publishedTime === null) return false;
      if (publishedTime < start.getTime() || publishedTime > end.getTime()) {
        return false;
      }
      if (sector !== "all" && recall.sector !== (sector as Sector)) {
        return false;
      }
      return recall.companyLinks.some(
        (link) => link.companyId === company.id
      );
    });

    const sortedRecalls = filteredRecalls.sort((a, b) => {
      const aTime = resolveRecallTime(a) ?? 0;
      const bTime = resolveRecallTime(b) ?? 0;
      return bTime - aTime;
    });

    const startIndex = (page - 1) * pageSize;
    const pageRecalls = sortedRecalls.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.canonicalName,
      },
      recalls: pageRecalls.map((recall) => ({
        recall_id: recall.id,
        source_agency: recall.sourceAgency,
        source_recall_id: recall.sourceRecallId,
        title: recall.title,
        published_at: recall.publishedAt,
        recalled_at: recall.recalledAt,
        sector: recall.sector,
        classification: recall.classification,
        status: recall.status,
        source_url: recall.sourceUrl,
        product_count: recall.products.length,
      })),
      metadata: {
        total_recalls: filteredRecalls.length,
        page,
        pageSize,
      },
    });
  } catch (err) {
    console.error("Company recalls API error:", err);
    return NextResponse.json(
      { error: "Failed to load company recalls." },
      { status: 500 }
    );
  }
}
