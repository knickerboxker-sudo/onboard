import {
  IngestContext,
  IngestStats,
  fetchWithRetry,
  upsertRawAndEvent,
} from "./common";

const FDA_BASE = "https://api.fda.gov";

interface FdaEnforcementResult {
  recall_number: string;
  recalling_firm: string;
  product_description: string;
  reason_for_recall: string;
  classification: string;
  recall_initiation_date: string;
  report_date: string;
  product_type: string;
  city: string;
  state: string;
  country: string;
  distribution_pattern: string;
  voluntary_mandated: string;
  status: string;
  openfda?: Record<string, unknown>;
}

interface FdaResponse {
  meta: { results: { skip: number; limit: number; total: number } };
  results: FdaEnforcementResult[];
}

type FdaDataset = "drug" | "device" | "food";

async function ingestFdaDataset(
  ctx: IngestContext,
  dataset: FdaDataset,
  category: string,
  stats: IngestStats
): Promise<void> {
  const limit = 100;
  let skip = 0;
  let total = 0;
  let fetched = 0;
  const maxRecords = 200;

  do {
    try {
      const url = `${FDA_BASE}/${dataset}/enforcement.json?limit=${limit}&skip=${skip}`;
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        if (res.status === 404) break;
        throw new Error(`FDA ${dataset} API returned ${res.status}`);
      }

      const data: FdaResponse = await res.json();
      total = Math.min(data.meta.results.total, maxRecords);
      const results = data.results || [];
      fetched += results.length;
      stats.fetched += results.length;

      for (const item of results) {
        const recallId = item.recall_number;
        if (!recallId) {
          stats.errors++;
          continue;
        }

        let publishedAt: Date | null = null;
        try {
          if (item.recall_initiation_date) {
            // FDA dates are YYYYMMDD format
            const d = item.recall_initiation_date;
            publishedAt = new Date(
              `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
            );
          } else if (item.report_date) {
            const d = item.report_date;
            publishedAt = new Date(
              `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
            );
          }
        } catch {
          // ignore
        }

        const locations: string[] = [];
        if (item.distribution_pattern) {
          locations.push(item.distribution_pattern);
        }
        if (item.state) locations.push(item.state);

        await upsertRawAndEvent(
          ctx,
          {
            source: "FDA",
            sourceRecordId: `${dataset}-${recallId}`,
            title:
              `${item.recalling_firm} - ${item.product_description}`.slice(
                0,
                500
              ),
            publishedAt,
            raw: item,
            category,
            summary: item.reason_for_recall || item.product_description || "",
            hazard: item.reason_for_recall || null,
            recallClass: item.classification || null,
            companyName: item.recalling_firm || null,
            brandNames: [],
            productKeywords: item.product_description
              ? item.product_description
                  .split(/[\s,;]+/)
                  .filter((w) => w.length > 3)
                  .slice(0, 10)
              : [],
            identifiers: {
              recallNumber: item.recall_number,
              classification: item.classification,
              status: item.status,
              voluntaryMandated: item.voluntary_mandated,
            },
            sourceUrl: null,
            locations,
          },
          stats
        );
      }

      skip += limit;
    } catch (err) {
      stats.errors++;
      console.error(`FDA ${dataset} ingestion error at skip=${skip}:`, err);
      break;
    }
  } while (fetched < total && fetched < maxRecords);
}

export async function ingestFda(ctx: IngestContext): Promise<IngestStats> {
  const stats: IngestStats = {
    source: "FDA",
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  await ingestFdaDataset(ctx, "drug", "drug", stats);
  await ingestFdaDataset(ctx, "device", "device", stats);
  await ingestFdaDataset(ctx, "food", "food", stats);

  return stats;
}
