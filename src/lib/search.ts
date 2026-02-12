/**
 * Ticker / company name search using SEC's company_tickers.json.
 */

import { secFetch, tickerMappingUrl } from "./sec-client";
import { normalizeCik } from "./cik";
import type { SearchResult } from "./types";

interface TickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

type TickerMapping = Record<string, TickerEntry>;

let cachedMapping: SearchResult[] | null = null;
let cacheTime = 0;
const MAPPING_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getMapping(): Promise<SearchResult[]> {
  if (cachedMapping && Date.now() - cacheTime < MAPPING_TTL_MS) {
    return cachedMapping;
  }

  const data = await secFetch<TickerMapping>(tickerMappingUrl(), {
    ttlSeconds: 7 * 24 * 60 * 60,
  });

  cachedMapping = Object.values(data).map((entry) => ({
    cik: normalizeCik(entry.cik_str),
    ticker: entry.ticker,
    name: entry.title,
  }));
  cacheTime = Date.now();

  return cachedMapping;
}

export async function searchCompanies(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const mapping = await getMapping();
  const q = query.trim().toUpperCase();

  // If short query, prioritize ticker match
  if (q.length <= 6) {
    const tickerExact = mapping.filter((m) => m.ticker === q);
    if (tickerExact.length > 0) return tickerExact.slice(0, 10);

    const tickerStarts = mapping.filter((m) => m.ticker.startsWith(q));
    if (tickerStarts.length > 0) return tickerStarts.slice(0, 10);
  }

  // Name contains search
  const nameMatches = mapping.filter(
    (m) =>
      m.name.toUpperCase().includes(q) ||
      m.ticker.toUpperCase().includes(q)
  );

  return nameMatches.slice(0, 10);
}
