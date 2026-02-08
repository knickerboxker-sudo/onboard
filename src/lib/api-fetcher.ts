export type RecallSource = "CPSC" | "NHTSA" | "FSIS" | "FDA" | "EPA" | "USCG";
export type RecallCategory = "consumer" | "vehicle" | "food" | "drug" | "device" | "environmental" | "marine";

export interface RecallResult {
  id: string;
  title: string;
  summary: string;
  source: RecallSource;
  category: RecallCategory;
  publishedAt: string;
  url: string;
  companyName?: string;
  matchReason?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { timestamp: number; data: RecallResult[] }>();

const CPSC_URL = "https://www.saferproducts.gov/RestWebServices/Recall?format=json";
const NHTSA_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle?make=";
const FSIS_URL = "https://www.fsis.usda.gov/fsis/api/recall/v/1";
const FDA_URL = "https://api.fda.gov/drug/enforcement.json";
// EPA ECHO enforcement case search API – returns enforcement actions including recalls.
const EPA_URL = "https://echodata.epa.gov/echo/case_rest_services.get_cases";
// USCG does not expose a JSON API; we use the CPSC feed filtered for boating/marine products
// as a proxy, since CPSC covers many marine consumer products.
const USCG_CPSC_URL = "https://www.saferproducts.gov/RestWebServices/Recall?format=json";

const DEFAULT_DATE_RANGE_YEARS = 2;
const DEFAULT_NHTSA_MAKES = ["Ford", "Toyota", "Honda", "Chevrolet", "Nissan"];

const COMPANY_ALIASES: Record<string, string[]> = {
  tyson: [
    "tyson foods",
    "tyson foodservice",
    "hillshire farm",
    "hillshire brands",
    "jimmy dean",
    "state fair",
    "ball park",
    "aidells",
    "ibp",
  ],
};

const BRAND_FAMILIES: Record<
  string,
  { brands: string[]; strictRetailer?: boolean }
> = {
  walmart: {
    brands: [
      "great value",
      "equate",
      "sam's choice",
      "parents choice",
      "mainstays",
      "george",
      "no boundaries",
      "onn",
    ],
    strictRetailer: true,
  },
  costco: {
    brands: ["kirkland", "kirkland signature"],
    strictRetailer: true,
  },
  target: {
    brands: [
      "up & up",
      "good & gather",
      "threshold",
      "cat & jack",
      "room essentials",
      "heyday",
    ],
    strictRetailer: true,
  },
  ikea: {
    brands: ["ikea"],
    strictRetailer: true,
  },
  tyson: {
    brands: [
      "tyson foods",
      "tyson",
      "hillshire farm",
      "jimmy dean",
      "state fair",
      "ball park",
      "aidells",
      "ibp",
    ],
  },
};

const CORPORATE_SUFFIXES = new Set([
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "co",
  "company",
  "ltd",
  "limited",
  "llc",
  "plc",
  "lp",
  "llp",
  "holdings",
  "group",
  "intl",
  "international",
]);

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

export type SourceFetcher = {
  source: RecallSource;
  fetch: () => Promise<RecallResult[]>;
};

export function getSourceFetchers({
  query,
  signal,
  dateRange,
}: SearchInput): SourceFetcher[] {
  const dateRangeStart = getDateRangeStart(dateRange);
  
  return [
    {
      source: "CPSC",
      fetch: () => fetchCpsc(dateRangeStart, signal),
    },
    {
      source: "NHTSA",
      fetch: () => fetchNhtsa(query, dateRangeStart, signal),
    },
    {
      source: "FSIS",
      fetch: () => fetchFsis(dateRangeStart, signal),
    },
    {
      source: "FDA",
      fetch: () => fetchFda(query, dateRangeStart, signal),
    },
    {
      source: "EPA",
      fetch: () => fetchEpa(query, dateRangeStart, signal),
    },
    {
      source: "USCG",
      fetch: () => fetchUscg(dateRangeStart, signal),
    },
  ];
}

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
  
  /**
   * Helper to log fetch errors with source name and timestamp
   */
  const logFetchError = (source: RecallSource, error: unknown) => {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${timestamp}] ${source} fetch failed:`, errorMessage);
    return [];
  };
  
  const tasks = [
    fetchCpsc(dateRangeStart, signal).catch((err) => logFetchError("CPSC", err)),
    fetchNhtsa(query, dateRangeStart, signal).catch((err) => logFetchError("NHTSA", err)),
    fetchFsis(dateRangeStart, signal).catch((err) => logFetchError("FSIS", err)),
    fetchFda(query, dateRangeStart, signal).catch((err) => logFetchError("FDA", err)),
    fetchEpa(query, dateRangeStart, signal).catch((err) => logFetchError("EPA", err)),
    fetchUscg(dateRangeStart, signal).catch((err) => logFetchError("USCG", err)),
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
  let url = CPSC_URL;
  if (dateRangeStart) {
    url += `&RecallDateStart=${encodeURIComponent(formatCpscDate(dateRangeStart))}`;
    url += `&RecallDateEnd=${encodeURIComponent(formatCpscDate(new Date()))}`;
  }
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
  // FSIS API v1 supports server-side date filtering and sorting.
  let url = FSIS_URL;
  const params = new URLSearchParams();
  params.set("sort", "-field_recall_date");
  if (dateRangeStart) {
    params.set("filter[field_recall_date][operator]", ">=");
    params.set("filter[field_recall_date][value]", formatCpscDate(dateRangeStart));
  }
  url += `?${params.toString()}`;

  const data = await fetchJson(url, signal);
  const items = Array.isArray(data) ? data : [];

  return items
    .map((item) => {
      const publishedAt = normalizeDate(item?.field_recall_date);
      const title = safeString(item?.field_title);
      const summary = safeString(item?.field_recall_reason || item?.field_product_description);
      const recallNumber = safeString(item?.field_recall_number);
      const pressRelease = safeString(item?.field_press_release);
      let itemUrl = "https://www.fsis.usda.gov/recalls";
      if (pressRelease) {
        itemUrl = pressRelease;
      } else if (recallNumber) {
        itemUrl = `https://www.fsis.usda.gov/recalls-alerts/${encodeURIComponent(recallNumber)}`;
      }
      const recall: RecallResult = {
        id: recallNumber || cryptoRandomId("fsis"),
        title,
        summary,
        source: "FSIS",
        category: "food",
        publishedAt,
        url: itemUrl,
        companyName:
          safeString(item?.field_recalling_firm || item?.field_company_name) || undefined,
      };

      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item: RecallResult) =>
      isWithinDateRange(item.publishedAt, dateRangeStart)
    )
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
    .filter((item: RecallResult) =>
      isWithinDateRange(item.publishedAt, dateRangeStart)
    )
    .filter((item: RecallResult) => item.title || item.summary);
}

async function fetchEpa(
  query?: string,
  dateRangeStart?: Date,
  signal?: AbortSignal
) {
  // EPA ECHO enforcement case search returns enforcement actions and recall-related cases.
  // The API returns JSON when output=JSON and supports keyword search via p_case_summary.
  const params = new URLSearchParams({
    output: "JSON",
    responseset: "100",
  });
  if (query) {
    params.set("p_case_summary", query);
  }
  if (dateRangeStart) {
    params.set("p_activity_date", `>=${formatCpscDate(dateRangeStart)}`);
  }
  const url = `${EPA_URL}?${params.toString()}`;
  const data = await fetchJson(url, signal);
  const rows: Record<string, string>[] =
    Array.isArray(data?.Results?.CaseResults) ? data.Results.CaseResults : [];

  return rows
    .map((item) => {
      const caseName = safeString(item?.CaseName || item?.case_name);
      const summary = safeString(
        item?.ActivityDescription || item?.activity_description || caseName
      );
      const publishedAt = normalizeDate(
        item?.SettlementDate ||
          item?.settlement_date ||
          item?.ActivityDate ||
          item?.activity_date
      );
      const caseNumber = safeString(item?.CaseNumber || item?.case_number);
      const url = caseNumber
        ? `https://echo.epa.gov/enforcement-compliance-history/enforcement-case-report?case_id=${encodeURIComponent(caseNumber)}`
        : "https://www.epa.gov/recalls";
      const recall: RecallResult = {
        id: caseNumber || cryptoRandomId("epa"),
        title: caseName || summary,
        summary,
        source: "EPA",
        category: "environmental",
        publishedAt,
        url,
        companyName: safeString(item?.FacilityName || item?.facility_name) || undefined,
      };
      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item: RecallResult) =>
      isWithinDateRange(item.publishedAt, dateRangeStart)
    )
    .filter((item: RecallResult) => item.title || item.summary);
}

async function fetchUscg(dateRangeStart?: Date, signal?: AbortSignal) {
  // USCG does not provide a public JSON API for boat recalls.
  // As a practical approach, we query the CPSC API for boat/marine-related products
  // and re-label them as USCG/marine recalls. This captures many marine product recalls
  // that overlap between CPSC and USCG jurisdiction.
  const boatKeywords = ["boat", "kayak", "canoe", "marine", "watercraft", "life jacket", "personal flotation"];
  let url = USCG_CPSC_URL;
  if (dateRangeStart) {
    url += `&RecallDateStart=${encodeURIComponent(formatCpscDate(dateRangeStart))}`;
    url += `&RecallDateEnd=${encodeURIComponent(formatCpscDate(new Date()))}`;
  }
  const data = await fetchJson(url, signal);
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => {
      const title = safeString(item?.Title).toLowerCase();
      const desc = safeString(item?.Description).toLowerCase();
      const product = safeString(item?.ProductName).toLowerCase();
      const combined = `${title} ${desc} ${product}`;
      return boatKeywords.some((kw) => combined.includes(kw));
    })
    .map((item) => {
      const recallDate = normalizeDate(item?.RecallDate);
      const recall: RecallResult = {
        id: String(item?.RecallID || cryptoRandomId("uscg")),
        title: safeString(item?.Title),
        summary: safeString(item?.Description),
        source: "USCG",
        category: "marine",
        publishedAt: recallDate,
        url: safeString(item?.URL) || "https://uscgboating.org/content/recalls.php",
        companyName: safeString(item?.CompanyName) || undefined,
      };
      return { ...recall, id: encodeRecallId(recall) };
    })
    .filter((item: RecallResult) =>
      isWithinDateRange(item.publishedAt, dateRangeStart)
    )
    .filter((item) => item.title || item.summary);
}

export function filterByQuery(results: RecallResult[], query: string) {
  const context = buildQueryContext(query);
  return results
    .filter((item) => {
      const title = normalizeSearchText(safeString(item.title));
      const summary = normalizeSearchText(safeString(item.summary));
      const company = normalizeSearchText(safeString(item.companyName));
      const combined = [title, summary, company].filter(Boolean).join(" ").trim();
      const strippedCombined = stripCorporateSuffixes(combined);
      const words = combined.split(" ").filter(Boolean);
      const strippedWords = strippedCombined.split(" ").filter(Boolean);
      const matchesText = matchesQueryContext(
        context,
        combined,
        strippedCombined,
        words,
        strippedWords
      );
      const matchesAlias = matchesAliases(
        context,
        combined,
        strippedCombined
      );

      if (!context.strictRetailer) {
        return matchesText || matchesAlias;
      }

      const primaryCombined = [title, company].filter(Boolean).join(" ").trim();
      const strippedPrimary = stripCorporateSuffixes(primaryCombined);
      const primaryWords = primaryCombined.split(" ").filter(Boolean);
      const strippedPrimaryWords = strippedPrimary.split(" ").filter(Boolean);
      const matchesPrimary = matchesQueryContext(
        context,
        primaryCombined,
        strippedPrimary,
        primaryWords,
        strippedPrimaryWords
      );
      const matchesPrimaryAlias = matchesAliases(
        context,
        primaryCombined,
        strippedPrimary
      );

      return matchesPrimary || matchesPrimaryAlias || matchesAlias;
    })
    .map((item) => ({
      ...item,
      matchReason: getMatchReason(item, query, context),
    }));
}

/**
 * A mapping from each source to the types of products it covers.
 * Used to explain why a source returned no results (i.e. it is not
 * applicable to the search) instead of labelling it as "Failed".
 */
export const SOURCE_SCOPE: Record<RecallSource, string> = {
  CPSC: "Consumer products",
  NHTSA: "Vehicles & auto parts",
  FSIS: "Meat, poultry & egg products",
  FDA: "Drugs, medical devices & food",
  EPA: "Environmental enforcement",
  USCG: "Boats & marine equipment",
};

function getMatchReason(
  item: RecallResult,
  query: string,
  context: QueryContext
): string | undefined {
  const normalizedQuery = normalizeSearchText(query);

  // Check if the query appears directly in the title or company name
  const title = normalizeSearchText(safeString(item.title));
  const company = normalizeSearchText(safeString(item.companyName));

  if (title.includes(normalizedQuery) || company.includes(normalizedQuery)) {
    return undefined; // Direct match – no explanation needed
  }

  // Check alias / brand-family match
  if (context.aliases.length > 0) {
    const combined = [title, normalizeSearchText(safeString(item.summary)), company]
      .filter(Boolean)
      .join(" ");
    for (const alias of context.aliases) {
      if (combined.includes(alias)) {
        return `Related to "${query}" — matches known brand "${alias}"`;
      }
    }
  }

  // Check token match (partial / keyword match)
  if (context.tokens.length > 0) {
    const summary = normalizeSearchText(safeString(item.summary));
    for (const token of context.tokens) {
      if (summary.includes(token) && !title.includes(token) && !company.includes(token)) {
        return `Mentions "${token}" in recall details`;
      }
    }
  }

  return undefined;
}

type QueryContext = {
  queryVariants: string[];
  compactQueryVariants: string[];
  tokens: string[];
  aliases: string[];
  strictRetailer: boolean;
};

function buildQueryContext(query: string): QueryContext {
  const normalized = normalizeSearchText(query);
  const stripped = stripCorporateSuffixes(normalized);
  const tokens = Array.from(
    new Set(
      [normalized, stripped]
        .filter(Boolean)
        .flatMap((variant) => variant.split(" "))
        .filter(Boolean)
    )
  );
  const family =
    BRAND_FAMILIES[normalized] ||
    BRAND_FAMILIES[stripped] ||
    BRAND_FAMILIES[tokens[0] || ""];
  const aliases = [
    ...(COMPANY_ALIASES[normalized] || []),
    ...(COMPANY_ALIASES[stripped] || []),
    ...(family?.brands || []),
  ];
  const normalizedAliases = Array.from(
    new Set(aliases.map((alias) => normalizeSearchText(alias)).filter(Boolean))
  );

  return {
    queryVariants: [normalized, stripped].filter(Boolean),
    compactQueryVariants: [
      compactSearchText(normalized),
      compactSearchText(stripped),
    ].filter(Boolean),
    tokens,
    aliases: normalizedAliases,
    strictRetailer: Boolean(family?.strictRetailer),
  };
}

function matchesQueryContext(
  context: QueryContext,
  normalizedCombined: string,
  strippedCombined: string,
  words: string[],
  strippedWords: string[]
) {
  const matchesDirect =
    context.queryVariants.length > 0
      ? context.queryVariants.some(
          (variant) =>
            normalizedCombined.includes(variant) ||
            strippedCombined.includes(variant)
        )
      : false;
  const matchesTokens =
    context.tokens.length > 0 &&
    context.tokens.every(
      (token) =>
        words.some((word) => word === token || word.startsWith(token)) ||
        strippedWords.some((word) => word === token || word.startsWith(token))
    );
  const matchesAdjacent =
    context.compactQueryVariants.length > 0 &&
    context.compactQueryVariants.some((variant) => {
      if (!variant) return false;
      const checkAdjacent = (list: string[]) =>
        list.some(
          (word, index) =>
            index < list.length - 1 && `${word}${list[index + 1]}` === variant
        );
      return checkAdjacent(words) || checkAdjacent(strippedWords);
    });

  return matchesDirect || matchesTokens || matchesAdjacent;
}

function matchesAliases(
  context: QueryContext,
  normalizedCombined: string,
  strippedCombined: string
) {
  if (context.aliases.length === 0) return false;
  return context.aliases.some((alias) => {
    const strippedAlias = stripCorporateSuffixes(alias);
    return (
      normalizedCombined.includes(alias) ||
      strippedCombined.includes(strippedAlias)
    );
  });
}

function safeString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactSearchText(value: string) {
  return value.replace(/\s+/g, "");
}

function stripCorporateSuffixes(value: string) {
  if (!value) return "";
  return value
    .split(" ")
    .filter((token) => token && !CORPORATE_SUFFIXES.has(token))
    .join(" ");
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
    clauses.push(`report_date:[${start} TO ${end}]`);
  }
  return clauses.join(" AND ");
}

export function sortRecallsByDate(results: RecallResult[]) {
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
