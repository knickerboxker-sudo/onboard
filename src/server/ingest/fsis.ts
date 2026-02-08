import {
  IngestContext,
  IngestStats,
  fetchWithRetry,
  upsertRawAndEvent,
} from "./common";

const FSIS_API_URL =
  "https://www.fsis.usda.gov/sites/default/files/media_file/recall-data.json";

interface FsisRecall {
  Recall_Number: string;
  Recall_Date: string;
  Establishment: string;
  Recall_Reason: string;
  Recall_Class: string;
  Product: string;
  Production_Dates: string;
  Distribution: string;
  Quantity: string;
  URL: string;
}

export async function ingestFsis(ctx: IngestContext): Promise<IngestStats> {
  const stats: IngestStats = {
    source: "FSIS",
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const res = await fetchWithRetry(FSIS_API_URL);
    if (!res.ok) {
      throw new Error(`FSIS API returned ${res.status}`);
    }

    const data: FsisRecall[] = await res.json();
    stats.fetched = data.length;

    for (const recall of data.slice(0, 200)) {
      const recallId = recall.Recall_Number;
      if (!recallId) {
        stats.errors++;
        continue;
      }

      let publishedAt: Date | null = null;
      try {
        publishedAt = recall.Recall_Date
          ? new Date(recall.Recall_Date)
          : null;
      } catch {
        // ignore
      }

      await upsertRawAndEvent(
        ctx,
        {
          source: "FSIS",
          sourceRecordId: recallId,
          title: `${recall.Establishment} - ${recall.Product}`.slice(0, 500),
          publishedAt,
          raw: recall,
          category: "food",
          summary: recall.Recall_Reason || recall.Product || "",
          hazard: recall.Recall_Reason || null,
          recallClass: recall.Recall_Class || null,
          companyName: recall.Establishment || null,
          brandNames: [],
          productKeywords: recall.Product
            ? recall.Product.split(/[,;]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          identifiers: {
            recallNumber: recall.Recall_Number,
            productionDates: recall.Production_Dates,
            quantity: recall.Quantity,
          },
          sourceUrl:
            recall.URL ||
            `https://www.fsis.usda.gov/recalls-alerts/${recallId}`,
          locations: recall.Distribution
            ? recall.Distribution.split(/[,;]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
        stats
      );
    }
  } catch (err) {
    stats.errors++;
    console.error("FSIS ingestion error:", err);
  }

  return stats;
}
