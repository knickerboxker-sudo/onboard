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

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { timestamp: number; data: RecallResult[] }>();

const CPSC_URL = "https://www.saferproducts.gov/RestWebServices/Recall?format=json";
const NHTSA_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle?make=";
const FSIS_URL = "https://www.fsis.usda.gov/sites/default/files/media_file/recall-data.json";
const FDA_URL = "https://api.fda.gov/drug/enforcement.json";

const DEFAULT_DATE_RANGE_YEARS = 2;
const DEFAULT_NHTSA_MAKES = ["Ford", "Toyota", "Honda", "Chevrolet", "Nissan"];

const SEARCH_FIELDS = ["title", "summary", "companyName"] as const satisfies ReadonlyArray<
  keyof RecallResult
>;

type SearchInput = {
  query?: string;
  signal?: AbortSignal;
  refresh?: boolean;
  dateRange?: DateRangeKey;
};

export type DateRangeKey = "30d" | "3m" | "6m" | "1y" | "2y" | "all";

export async function fetchRecallResults({
  query,
  signal,
  refresh,
  dateRange,
}: SearchInput) {
  const cacheKey = `${(query || "").trim().toLowerCase()}::${
    dateRange || "2y"
  }`;
  const cached = cache.get(cacheKey);
  if (!refresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { results: cached.data, fetchedAt: cached.timestamp };
  }

  const dateRangeStart = getDateRangeStart(dateRange);
  const tasks = [
    fetchCpsc(dateRangeStart, signal).catch(() => []),
    fetchNhtsa(query, dateRangeStart, signal).catch(() => []),
    fetchFsis(dateRangeStart, signal).catch(() => []),
    fetchFda(query, dateRangeStart, signal).catch(() => []),
  ];

  const results = (await Promise.all(tasks)).flat();
  if (signal?.aborted) {
    throw new DOMException("Search aborted", "AbortError");
  }
  const filtered = query ? filterByQuery(results, query) : results;
  const sorted = sortRecallsByDate(filtered);

  const fetchedAt = Date.now();
  cache.set(cacheKey, { timestamp: fetchedAt, data: sorted });
  return { results: sorted, fetchedAt };
}

export function encodeRecallId(recall: RecallResult) {
  const payload = JSON.stringify(recall);
  return Buffer.from(payload).toString("base64url");
}

export function decodeRecallId(id: string) {
  const payload = Buffer.from(id, "base64url").toString("utf-8");
  return JSON.parse(payload) as RecallResult;
}

async function fetchCpsc(dateRangeStart?: Date, signal?: AbortSignal) {
  const url = dateRangeStart
    ? `${CPSC_URL}&RecallDateStart=${encodeURIComponent(
        formatCpscDate(dateRangeStart)
      )}`
    : CPSC_URL;
  // CPSC does not document a reliable sort parameter, so we sort client-side.
  const data = await fetchJson(url, signal);
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
    .filter((item: RecallResult) =>
      isWithinDateRange(item.publishedAt, dateRangeStart)
    )
    .filter((item) => item.title || item.summary);
}

async function fetchNhtsa(
  query?: string,
  dateRangeStart?: Date,
  signal?: AbortSignal
) {
  const makes = query ? [query] : DEFAULT_NHTSA_MAKES;
  if (makes.length === 0) return [];

  const tasks = makes.map(async (make) => {
    // NHTSA recallsByVehicle does not expose date filtering or sorting.
    const url = `${NHTSA_URL}${encodeURIComponent(make)}`;
    const data = await fetchJson(url, signal);
    const results = Array.isArray(data?.results) ? data.results : [];

    return results.map((item: Record<string, string>) => {
      const makeName = safeString(item?.Make);
      const model = safeString(item?.Model);
      const campaign = safeString(item?.NHTSACampaignNumber);
      const summary = safeString(item?.Summary);
      const publishedAt = normalizeDate(
        item?.ReportReceivedDate || item?.RecallDate || item?.LastUpdatedDate
      );
      const title = [makeName, model].filter(Boolean).join(" ") || summary;
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
    });
  });

  const recallGroups = await Promise.all(tasks);
  const flattened = recallGroups.flat();
  const unique = new Map<string, RecallResult>();
  flattened.forEach((item) => {
    if (item.title || item.summary) {
      unique.set(item.id, item);
    }
  });

  return Array.from(unique.values()).filter((item) =>
    isWithinDateRange(item.publishedAt, dateRangeStart)
  );
}

async function fetchFsis(dateRangeStart?: Date, signal?: AbortSignal) {
  // FSIS provides a static JSON feed without date parameters.
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
    .filter((item) => isWithinDateRange(item.publishedAt, dateRangeStart))
    .filter((item) => item.title || item.summary);
}

async function fetchFda(
  query?: string,
  dateRangeStart?: Date,
  signal?: AbortSignal
) {
  const searchQuery = buildFdaSearchQuery(query, dateRangeStart);
  if (!searchQuery) return [];
  const url = `${FDA_URL}?search=${encodeURIComponent(
    searchQuery
  )}&sort=report_date:desc&limit=100`;
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
    .filter((item) => isWithinDateRange(item.publishedAt, dateRangeStart))
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
  if (!value) return "";
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
  return "";
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

function getDateRangeStart(range?: DateRangeKey) {
  if (range === "all") return undefined;
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(start.getMonth() - 6);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "2y":
    default:
      start.setFullYear(start.getFullYear() - DEFAULT_DATE_RANGE_YEARS);
      break;
  }
  return start;
}

function isWithinDateRange(publishedAt: string, startDate?: Date) {
  if (!startDate) return true;
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) return false;
  return publishedTime >= startDate.getTime();
}

function formatCpscDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatFdaDate(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function buildFdaSearchQuery(query?: string, startDate?: Date) {
  const cleanedQuery = safeString(query).replace(/"/g, "");
  const effectiveStartDate = startDate ?? (cleanedQuery ? undefined : new Date(0));
  const clauses: string[] = [];
  if (cleanedQuery) {
    clauses.push(`(${cleanedQuery})`);
  }
  if (effectiveStartDate) {
    const start = formatFdaDate(effectiveStartDate);
    const end = formatFdaDate(new Date());
    clauses.push(`report_date:[${start}+TO+${end}]`);
  }
  return clauses.join("+AND+");
}

function sortRecallsByDate(results: RecallResult[]) {
  return results
    .slice()
    .sort(
      (a, b) =>
        normalizeTime(b.publishedAt) - normalizeTime(a.publishedAt)
    );
}

function normalizeTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
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
