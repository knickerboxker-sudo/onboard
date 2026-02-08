import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/server/db/prisma";
import { ingestCpsc } from "@/src/server/ingest/cpsc";
import { ingestNhtsa } from "@/src/server/ingest/nhtsa";
import { ingestFsis } from "@/src/server/ingest/fsis";
import { ingestFda } from "@/src/server/ingest/fda";
import { IngestStats } from "@/src/server/ingest/common";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const triggeredBy =
    url.searchParams.get("trigger") === "cron" ? "CRON" : "MANUAL";
  const sourcesParam = url.searchParams.get("sources");
  const requestedSources = sourcesParam
    ? sourcesParam.split(",").map((s) => s.trim().toUpperCase())
    : ["CPSC", "NHTSA", "FSIS", "FDA"];

  const run = await prisma.sourceJobRun.create({
    data: {
      status: "RUNNING",
      triggeredBy,
      sourcesRun: requestedSources,
    },
  });

  const allStats: Record<string, IngestStats> = {};

  try {
    const ingesters: Record<
      string,
      (ctx: { prisma: typeof prisma; runId: string }) => Promise<IngestStats>
    > = {
      CPSC: ingestCpsc,
      NHTSA: ingestNhtsa,
      FSIS: ingestFsis,
      FDA: ingestFda,
    };

    for (const source of requestedSources) {
      const ingester = ingesters[source];
      if (!ingester) {
        allStats[source] = {
          source,
          fetched: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
        };
        continue;
      }

      try {
        const stats = await ingester({ prisma, runId: run.id });
        allStats[source] = stats;
      } catch (err) {
        console.error(`Job error for ${source}:`, err);
        allStats[source] = {
          source,
          fetched: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
        };
      }
    }

    await prisma.sourceJobRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        stats: allStats as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      runId: run.id,
      status: "SUCCESS",
      stats: allStats,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await prisma.sourceJobRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        stats: allStats as unknown as Prisma.InputJsonValue,
        error: errorMsg,
      },
    });

    return NextResponse.json(
      {
        runId: run.id,
        status: "FAILED",
        error: errorMsg,
        stats: allStats,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
