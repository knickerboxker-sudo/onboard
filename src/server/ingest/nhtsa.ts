import {
  IngestContext,
  IngestStats,
  fetchWithRetry,
  upsertRawAndEvent,
} from "./common";

const NHTSA_API_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle";
const NHTSA_RECENT_URL =
  "https://api.nhtsa.gov/recalls/recallsByVehicle?make=&model=&modelYear=";

interface NhtsaRecall {
  NHTSACampaignNumber: string;
  Manufacturer: string;
  Make: string;
  Model: string;
  ModelYear: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  ParkIt: boolean;
  NHTSAActionNumber: string;
}

export async function ingestNhtsa(ctx: IngestContext): Promise<IngestStats> {
  const stats: IngestStats = {
    source: "NHTSA",
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Fetch recent recalls for popular makes
    const makes = ["Ford", "Toyota", "Honda", "Chevrolet", "Tesla", "BMW"];
    const currentYear = new Date().getFullYear();

    for (const make of makes) {
      try {
        const url = `${NHTSA_API_URL}?make=${encodeURIComponent(make)}&model=&modelYear=${currentYear}`;
        const res = await fetchWithRetry(url);
        if (!res.ok) continue;

        const data = await res.json();
        const results: NhtsaRecall[] = data.results || [];
        stats.fetched += results.length;

        for (const recall of results.slice(0, 50)) {
          const recallId =
            recall.NHTSACampaignNumber || recall.NHTSAActionNumber;
          if (!recallId) continue;

          let publishedAt: Date | null = null;
          try {
            publishedAt = recall.ReportReceivedDate
              ? new Date(recall.ReportReceivedDate)
              : null;
          } catch {
            // ignore
          }

          await upsertRawAndEvent(
            ctx,
            {
              source: "NHTSA",
              sourceRecordId: recallId,
              title: `${recall.ModelYear} ${recall.Make} ${recall.Model} - ${recall.Component}`,
              publishedAt,
              raw: recall,
              category: "vehicle",
              summary: recall.Summary || "",
              hazard: recall.Consequence || null,
              recallClass: null,
              companyName: recall.Manufacturer || recall.Make || null,
              brandNames: [recall.Make].filter(Boolean),
              productKeywords: [
                recall.Model,
                recall.Component,
                recall.Make,
              ].filter(Boolean),
              identifiers: {
                campaignNumber: recall.NHTSACampaignNumber,
                make: recall.Make,
                model: recall.Model,
                modelYear: recall.ModelYear,
              },
              sourceUrl: `https://www.nhtsa.gov/recalls?nhtsaId=${recallId}`,
              locations: [],
            },
            stats
          );
        }
      } catch (err) {
        console.error(`NHTSA error for make ${make}:`, err);
        stats.errors++;
      }
    }
  } catch (err) {
    stats.errors++;
    console.error("NHTSA ingestion error:", err);
  }

  return stats;
}
