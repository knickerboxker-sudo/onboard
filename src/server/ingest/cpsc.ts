import {
  IngestContext,
  IngestStats,
  fetchWithRetry,
  upsertRawAndEvent,
} from "./common";

const CPSC_API_URL =
  "https://www.saferproducts.gov/RestWebServices/Recall?format=json";

interface CpscRecall {
  RecallID: number;
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  URL: string;
  Title: string;
  ConsumerContact: string;
  LastPublishDate: string;
  Products: Array<{
    Name: string;
    Description: string;
    Type: string;
    CategoryID: string;
    NumberOfUnits: string;
  }>;
  Hazards: Array<{
    Name: string;
    HazardType: string;
    HazardTypeID: string;
  }>;
  Manufacturers: Array<{
    Name: string;
    CompanyID: string;
  }>;
  Retailers: Array<{ Name: string }>;
  Distributors: Array<{ Name: string }>;
  Images: Array<{ URL: string }>;
  Remedies: Array<{ Name: string }>;
}

export async function ingestCpsc(ctx: IngestContext): Promise<IngestStats> {
  const stats: IngestStats = {
    source: "CPSC",
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const res = await fetchWithRetry(CPSC_API_URL);
    if (!res.ok) {
      throw new Error(`CPSC API returned ${res.status}`);
    }

    const data: CpscRecall[] = await res.json();
    stats.fetched = data.length;

    for (const recall of data.slice(0, 200)) {
      const recallId = recall.RecallNumber || String(recall.RecallID);
      const companyName =
        recall.Manufacturers?.[0]?.Name ||
        recall.Distributors?.[0]?.Name ||
        null;
      const brandNames = recall.Products?.map((p) => p.Name).filter(Boolean) || [];
      const hazard =
        recall.Hazards?.map((h) => h.Name).join("; ") || null;

      let publishedAt: Date | null = null;
      try {
        publishedAt = recall.RecallDate ? new Date(recall.RecallDate) : null;
      } catch {
        // ignore
      }

      await upsertRawAndEvent(
        ctx,
        {
          source: "CPSC",
          sourceRecordId: recallId,
          title: recall.Title || recall.Description || "CPSC Recall",
          publishedAt,
          raw: recall,
          category: "consumer",
          summary: recall.Description || "",
          hazard,
          recallClass: null,
          companyName,
          brandNames,
          productKeywords:
            recall.Products?.map((p) => p.Description).filter(Boolean) || [],
          identifiers: null,
          sourceUrl: recall.URL || `https://www.cpsc.gov/Recalls/${recallId}`,
          locations: [],
        },
        stats
      );
    }
  } catch (err) {
    stats.errors++;
    console.error("CPSC ingestion error:", err);
  }

  return stats;
}
