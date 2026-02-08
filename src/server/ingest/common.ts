import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import {
  normalizeName,
  buildSearchText,
  extractKeywords,
} from "@/src/server/normalize/utils";

export interface IngestStats {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface IngestContext {
  prisma: PrismaClient;
  runId: string;
}

export function hashRaw(raw: unknown): string {
  return createHash("sha256").update(JSON.stringify(raw)).digest("hex");
}

export async function upsertRawAndEvent(
  ctx: IngestContext,
  record: {
    source: string;
    sourceRecordId: string;
    title: string | null;
    publishedAt: Date | null;
    raw: unknown;
    category: string;
    summary: string;
    hazard: string | null;
    recallClass: string | null;
    companyName: string | null;
    brandNames: string[];
    productKeywords: string[];
    identifiers: unknown;
    sourceUrl: string | null;
    locations: string[];
  },
  stats: IngestStats
): Promise<void> {
  try {
    const hash = hashRaw(record.raw);

    const existing = await ctx.prisma.rawRecallRecord.findUnique({
      where: {
        source_sourceRecordId: {
          source: record.source,
          sourceRecordId: record.sourceRecordId,
        },
      },
    });

    if (existing && existing.hash === hash) {
      stats.skipped++;
      return;
    }

    const rawRecord = await ctx.prisma.rawRecallRecord.upsert({
      where: {
        source_sourceRecordId: {
          source: record.source,
          sourceRecordId: record.sourceRecordId,
        },
      },
      update: {
        raw: record.raw as object,
        hash,
        fetchedAt: new Date(),
        title: record.title,
        publishedAt: record.publishedAt,
      },
      create: {
        source: record.source,
        sourceRecordId: record.sourceRecordId,
        raw: record.raw as object,
        hash,
        title: record.title,
        publishedAt: record.publishedAt,
      },
    });

    const companyNormalized = normalizeName(record.companyName);
    const eventData = {
      source: record.source,
      sourceUrl: record.sourceUrl,
      category: record.category,
      title: record.title || "Untitled Recall",
      summary: record.summary || "",
      hazard: record.hazard,
      recallClass: record.recallClass,
      publishedAt: record.publishedAt || new Date(),
      companyName: record.companyName,
      companyNormalized: companyNormalized || null,
      brandNames: record.brandNames,
      productKeywords:
        record.productKeywords.length > 0
          ? record.productKeywords
          : extractKeywords(record.summary),
      identifiers: record.identifiers as object | undefined,
      locations: record.locations,
      rawRecordId: rawRecord.id,
      searchText: "",
    };

    eventData.searchText = buildSearchText(eventData);

    // Find existing event for this raw record
    const existingEvent = await ctx.prisma.recallEvent.findFirst({
      where: { rawRecordId: rawRecord.id },
    });

    if (existingEvent) {
      await ctx.prisma.recallEvent.update({
        where: { id: existingEvent.id },
        data: eventData,
      });
      stats.updated++;
    } else {
      await ctx.prisma.recallEvent.create({
        data: eventData,
      });
      stats.inserted++;
    }

    // Update search vector via raw SQL
    await ctx.prisma.$executeRawUnsafe(
      `UPDATE recall_events SET "searchVector" = to_tsvector('english', "searchText") WHERE "rawRecordId" = $1`,
      rawRecord.id
    );
  } catch (err) {
    stats.errors++;
    console.error(
      `Error upserting ${record.source}/${record.sourceRecordId}:`,
      err
    );
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, backoff * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, backoff * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export { fetchWithRetry };
