/**
 * SEC EDGAR client — handles fetching, throttling, caching, and retries.
 */

import { getCache } from "./cache";

const SEC_BASE = "https://data.sec.gov";
const SEC_ARCHIVES = "https://www.sec.gov/Archives/edgar/data";

function getUserAgent(): string {
  return (
    process.env.SEC_USER_AGENT ??
    "edgar-per-employee/1.0 (contact: dev@example.com)"
  );
}

/* ── Token-bucket throttle ────────────────────────────── */

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 120; // ~8 req/s max, well within SEC 10/s guideline

async function throttle(): Promise<void> {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastRequestTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();
}

/* ── Core fetch with retry / backoff ─────────────────── */

interface SecFetchOptions {
  ttlSeconds?: number;
  forceRefresh?: boolean;
  maxBytes?: number;
}

export async function secFetch<T>(
  url: string,
  opts: SecFetchOptions = {}
): Promise<T> {
  const { ttlSeconds = 86400, forceRefresh = false, maxBytes } = opts;
  const cache = getCache();

  if (!forceRefresh) {
    const cached = await cache.get<T>(url);
    if (cached !== null) return cached;
  }

  const maxRetries = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    await throttle();
    attempt++;
    try {
      const controller = maxBytes ? new AbortController() : undefined;
      const res = await fetch(url, {
        headers: {
          "User-Agent": getUserAgent(),
          Accept: "application/json, text/html, */*",
          "Accept-Encoding": "gzip, deflate",
        },
        signal: controller?.signal,
        next: { revalidate: ttlSeconds } as any,
      });

      if (res.status === 429 || res.status >= 500) {
        const backoff = Math.min(1000 * 2 ** attempt, 16000) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, backoff));
        lastError = new Error(`SEC responded ${res.status}`);
        continue;
      }
      if (!res.ok) {
        throw new Error(`SEC fetch failed: ${res.status} ${res.statusText}`);
      }

      let data: T;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("json")) {
        data = (await res.json()) as T;
      } else {
        // Text/HTML response
        if (maxBytes) {
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");
          const chunks: Uint8Array[] = [];
          let totalBytes = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalBytes += value.length;
            if (totalBytes > maxBytes) {
              controller?.abort();
              break;
            }
          }
          const decoder = new TextDecoder();
          data = chunks.map((c) => decoder.decode(c, { stream: true })).join("") as unknown as T;
        } else {
          data = (await res.text()) as unknown as T;
        }
      }

      await cache.set(url, data, ttlSeconds);
      return data;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // maxBytes limit reached, still return partial data if available
      }
      lastError = err as Error;
      if (attempt >= maxRetries) break;
      const backoff = Math.min(1000 * 2 ** attempt, 16000) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastError ?? new Error(`SEC fetch failed for ${url}`);
}

/* ── Helper URLs ──────────────────────────────────────── */

export function submissionsUrl(cik: string): string {
  return `${SEC_BASE}/submissions/CIK${cik}.json`;
}

export function companyFactsUrl(cik: string): string {
  return `${SEC_BASE}/api/xbrl/companyfacts/CIK${cik}.json`;
}

export function filingDocUrl(cik: string, accessionNoDashes: string, primaryDoc: string): string {
  return `${SEC_ARCHIVES}/${cik.replace(/^0+/, "")}/${accessionNoDashes}/${primaryDoc}`;
}

export function tickerMappingUrl(): string {
  return "https://www.sec.gov/files/company_tickers.json";
}
