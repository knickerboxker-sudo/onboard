export type RecallSource = "CPSC" | "NHTSA" | "FSIS" | "FDA";
export type RecallCategory = "consumer" | "vehicle" | "food" | "drug" | "device";

export interface RecallResult {
  id: string;
  title: string;
  summary: string;
  source: RecallSource;
  category: RecallCategory;
  publishedAt: string;
  url: string;
  companyName?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { timestamp: number; data: RecallResult[] }>();

const CPSC_URL = "https://www.saferproducts.gov/RestWebServices/Recall?format=json";
const NHTSA_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle?make=";
const FSIS_URL = "https://www.fsis.usda.gov/sites/default/files/media_file/recall-data.json";
const FDA_URL = "https://api.fda.gov/drug/enforcement.json?search=";

const SEARCH_FIELDS = ["title", "summary", "companyName"] as const satisfies ReadonlyArray<
  keyof RecallResult
>;

type SearchInput = {
  query?: string;
  signal?: AbortSignal;
};

export async function fetchRecallResults({ query, signal }: SearchInput) {
  const cacheKey = (query || "").trim().toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const tasks = [
    fetchCpsc(query, signal).catch(() => []),
    fetchNhtsa(query, signal).catch(() => []),
    fetchFsis(query, signal).catch(() => []),
    fetchFda(query, signal).catch(() => []),
  ];

  const results = (await Promise.all(tasks)).flat();
  if (signal?.aborted) {
    throw new DOMException("Search aborted", "AbortError");
  }
  const filtered = query ? filterByQuery(results, query) : results;

  cache.set(cacheKey, { timestamp: Date.now(), data: filtered });
  return filtered;
}

export function encodeRecallId(recall: RecallResult) {
  const payload = JSON.stringify(recall);
  return Buffer.from(payload).toString("base64url");
}

export function decodeRecallId(id: string) {
  const payload = Buffer.from(id, "base64url").toString("utf-8");
  return JSON.parse(payload) as RecallResult;
}

async function fetchCpsc(_query?: string, signal?: AbortSignal) {
  const data = await fetchJson(CPSC_URL, signal);
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const recallDate = normalizeDate(item?.RecallDate);
      const recall: RecallResult = {
        id: String(item?.RecallID || cryptoRandomId("cpsc")),
        title: safeString(item?.Title),
        summary: safeString(item?.Description),
        source: "CPSC",
        category: "consumer",
        publishedAt: recallDate,
        url: safeString(item?.URL),
        companyName: safeString(item?.CompanyName) || undefined,
      };
      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item) => item.title || item.summary);
}

async function fetchNhtsa(query?: string, signal?: AbortSignal) {
  if (!query) return [];
  const url = `${NHTSA_URL}${encodeURIComponent(query)}`;
  const data = await fetchJson(url, signal);
  const results = Array.isArray(data?.results) ? data.results : [];

  return results
    .map((item: Record<string, string>) => {
      const make = safeString(item?.Make);
      const model = safeString(item?.Model);
      const campaign = safeString(item?.NHTSACampaignNumber);
      const summary = safeString(item?.Summary);
      const publishedAt = normalizeDate(
        item?.ReportReceivedDate || item?.RecallDate || item?.LastUpdatedDate
      );
      const title = [make, model].filter(Boolean).join(" ") || summary;
      const url = campaign
        ? `https://www.nhtsa.gov/recalls?nhtsaId=${encodeURIComponent(campaign)}`
        : "https://www.nhtsa.gov/recalls";

      const recall: RecallResult = {
        id: campaign || cryptoRandomId("nhtsa"),
        title,
        summary,
        source: "NHTSA",
        category: "vehicle",
        publishedAt,
        url,
        companyName: safeString(item?.Manufacturer) || undefined,
      };

      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item: RecallResult) => item.title || item.summary);
}

async function fetchFsis(_query?: string, signal?: AbortSignal) {
  const data = await fetchJson(FSIS_URL, signal);
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const publishedAt = normalizeDate(item?.Recall_Date || item?.RecallDate);
      const title = safeString(item?.Product || item?.Recall_Title);
      const summary = safeString(item?.Recall_Reason || item?.Summary);
      const url = safeString(item?.Recall_URL || item?.RecallUrl || "https://www.fsis.usda.gov/recalls");
      const recall: RecallResult = {
        id:
          safeString(item?.Recall_Number || item?.RecallNumber) ||
          cryptoRandomId("fsis"),
        title,
        summary,
        source: "FSIS",
        category: "food",
        publishedAt,
        url,
        companyName: safeString(item?.Establishment) || undefined,
      };

      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item) => item.title || item.summary);
}

async function fetchFda(query?: string, signal?: AbortSignal) {
  if (!query) return [];
  const url = `${FDA_URL}${encodeURIComponent(query)}`;
  const data = await fetchJson(url, signal);
  const results = Array.isArray(data?.results) ? data.results : [];

  return results
    .map((item: Record<string, string>) => {
      const summary = safeString(item?.reason_for_recall || item?.product_description);
      const title = safeString(item?.product_description || item?.recall_number);
      const publishedAt = normalizeDate(item?.report_date || item?.recall_initiation_date);
      const url = "https://www.fda.gov/safety/recalls";
      const recall: RecallResult = {
        id: safeString(item?.recall_number) || cryptoRandomId("fda"),
        title,
        summary,
        source: "FDA",
        category: inferFdaCategory(item),
        publishedAt,
        url,
        companyName: safeString(item?.recalling_firm) || undefined,
      };
      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item: RecallResult) => item.title || item.summary);
}

function filterByQuery(results: RecallResult[], query: string) {
  const normalized = query.toLowerCase();
  return results.filter((item) =>
    SEARCH_FIELDS.some((field) =>
      safeString(item[field])
        .toLowerCase()
        .includes(normalized)
    )
  );
}

function safeString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeDate(value?: string) {
  if (!value) return new Date(0).toISOString();
  const trimmed = value.trim();
  if (/^\d{8}$/.test(trimmed)) {
    const year = trimmed.slice(0, 4);
    const month = trimmed.slice(4, 6);
    const day = trimmed.slice(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date(0).toISOString();
}

function inferFdaCategory(item: Record<string, string>): RecallCategory {
  const productType = safeString(item?.product_type).toLowerCase();
  if (productType.includes("device")) return "device";
  if (productType.includes("drug")) return "drug";
  return "drug";
}

function cryptoRandomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function fetchJson(url: string, signal?: AbortSignal) {
  const response = await fetchWithTimeout(url, 10000, signal);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  signal?: AbortSignal
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
