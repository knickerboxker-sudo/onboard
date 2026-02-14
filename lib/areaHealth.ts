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

async function fetchOpenMeteoPm25(location: string): Promise<number | null> {
  const geo = await fetchJson<{
    results?: Array<{ latitude: number; longitude: number }>;
  }>(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(location)}`);

  const first = geo?.results?.[0];
  if (!first) return null;

  const air = await fetchJson<{
    current?: { pm2_5?: number | null };
    hourly?: { pm2_5?: Array<number | null> };
  }>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${first.latitude}&longitude=${first.longitude}&current=pm2_5&hourly=pm2_5`,
  );

  const current = air?.current?.pm2_5;
  if (typeof current === "number") return current;

  const hourly = air?.hourly?.pm2_5?.find((item): item is number => typeof item === "number");
  return hourly ?? null;
}

async function fetchFredUnemployment(location: string): Promise<number | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const search = await fetchJson<{ seriess?: Array<{ id?: string }> }>(
    `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(`${location} unemployment rate`)}&api_key=${apiKey}&file_type=json&limit=1`,
  );
  const seriesId = search?.seriess?.[0]?.id ?? "UNRATE";
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
  const trimmed = location.trim();
  const parts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  const city = parts[0]?.toUpperCase();
  const state = parts[1]?.toUpperCase();
  const zip = trimmed.match(/\b\d{5}\b/)?.[0];
  const terms = [
    city ? `city:\"${city}\"` : null,
    state ? `state:${state}` : null,
    zip ? `postal_code:${zip}` : null,
  ].filter(Boolean);
  if (!terms.length) return null;

  const data = await fetchJson<{ meta?: { results?: { total?: number } } }>(
    `https://api.fda.gov/drug/enforcement.json?search=${encodeURIComponent(terms.join("+OR+"))}&limit=1`,
  );
  return data?.meta?.results?.total ?? null;
}

export async function fetchAreaMetric(location: string): Promise<AreaMetric> {
  const key = location.trim().toLowerCase();
  const fromCache = cache.get(key);
  if (fromCache && fromCache.expiresAt > Date.now()) return fromCache.value;

  const [airQualityPm25, unemploymentRate, foodAccessScore, drugRecallCount] =
    await Promise.all([
      fetchOpenMeteoPm25(location),
      fetchFredUnemployment(location),
      fetchUsdaFoodAccess(location),
      fetchOpenFdaRecalls(location),
    ]);

  const notes: string[] = [];
  if (airQualityPm25 == null) notes.push("Air quality data unavailable.");
  if (unemploymentRate == null) notes.push("Economic data unavailable (set FRED_API_KEY).");
  if (foodAccessScore == null) notes.push("Food access data unavailable (set USDA_API_KEY).");
  if (foodAccessScore != null) {
    notes.push("Food access uses USDA FoodData Central search-hit proxy.");
  }
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
