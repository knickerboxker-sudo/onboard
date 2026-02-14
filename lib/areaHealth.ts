export type AreaMetric = {
  location: string;
  airQualityPm25: number | null;
  unemploymentRate: number | null;
  foodAccessScore: number | null;
  drugRecallCount: number | null;
  notes: string[];
};

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: AreaMetric }>();

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchOpenAq(location: string): Promise<number | null> {
  const data = await fetchJson<{ results?: Array<{ value?: number }> }>(
    `https://api.openaq.org/v3/locations?limit=1&order_by=lastUpdated&sort=desc&city=${encodeURIComponent(location)}`,
  );
  return data?.results?.[0]?.value ?? null;
}

async function fetchFredUnemployment(location: string): Promise<number | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const seriesId = "UNRATE";
  const data = await fetchJson<{ observations?: Array<{ value?: string }> }>(
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`,
  );
  const raw = data?.observations?.[0]?.value;
  if (!raw || raw === ".") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchUsdaFoodAccess(location: string): Promise<number | null> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) return null;

  const data = await fetchJson<{ totalHits?: number }>(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(location)}&pageSize=1`,
  );
  return typeof data?.totalHits === "number" ? data.totalHits : null;
}

async function fetchOpenFdaRecalls(location: string): Promise<number | null> {
  const data = await fetchJson<{ meta?: { results?: { total?: number } } }>(
    `https://api.fda.gov/drug/enforcement.json?search=state:${encodeURIComponent(location)}&limit=1`,
  );
  return data?.meta?.results?.total ?? null;
}

export async function fetchAreaMetric(location: string): Promise<AreaMetric> {
  const key = location.trim().toLowerCase();
  const fromCache = cache.get(key);
  if (fromCache && fromCache.expiresAt > Date.now()) return fromCache.value;

  const [airQualityPm25, unemploymentRate, foodAccessScore, drugRecallCount] =
    await Promise.all([
      fetchOpenAq(location),
      fetchFredUnemployment(location),
      fetchUsdaFoodAccess(location),
      fetchOpenFdaRecalls(location),
    ]);

  const notes: string[] = [];
  if (airQualityPm25 == null) notes.push("Air quality data unavailable.");
  if (unemploymentRate == null) notes.push("Economic data unavailable.");
  if (foodAccessScore == null) notes.push("Food access data unavailable.");
  if (drugRecallCount == null) notes.push("Drug safety data unavailable.");

  const value: AreaMetric = {
    location,
    airQualityPm25,
    unemploymentRate,
    foodAccessScore,
    drugRecallCount,
    notes,
  };

  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}

export function summarizeMetric(metric: AreaMetric): string {
  const pm = metric.airQualityPm25 != null ? `${metric.airQualityPm25} µg/m³` : "n/a";
  const unemployment =
    metric.unemploymentRate != null ? `${metric.unemploymentRate}%` : "n/a";
  const food = metric.foodAccessScore != null ? `${metric.foodAccessScore}` : "n/a";
  const recalls =
    metric.drugRecallCount != null ? `${metric.drugRecallCount}` : "n/a";
  return `${metric.location}: PM2.5 ${pm}, unemployment ${unemployment}, food access ${food}, drug recalls ${recalls}.`;
}
