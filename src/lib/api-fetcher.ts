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
  /** Free-text quantity from the FDA enforcement API (e.g. "5,000 bottles"). */
  productQuantity?: string;
  sourceRecallId?: string;
  recalledAt?: string;
  status?: string;
  classification?: string;
  hazard?: string;
  sourceProductId?: string;
  brand?: string;
  model?: string;
  lotCodes?: string;
  upcGtin?: string;
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
const DEFAULT_NHTSA_MAKES = [
  "Ford", "Toyota", "Honda", "Chevrolet", "Nissan",
  "BMW", "Mercedes-Benz", "Volkswagen", "Hyundai", "Kia",
  "Subaru", "Mazda", "Dodge", "Ram", "Jeep",
  "GMC", "Buick", "Tesla", "Volvo", "Audi",
  "Lexus", "Acura", "Infiniti", "Porsche", "Genesis",
  "Chrysler", "Lincoln", "Mitsubishi", "Cadillac", "Alfa Romeo",
  "Fiat", "Mini", "Land Rover", "Jaguar", "Maserati",
  "Bentley", "Rolls-Royce", "Aston Martin", "Lamborghini", "Ferrari",
  "McLaren", "Rivian", "Lucid", "Polestar", "Fisker",
  "Harley-Davidson", "Indian", "Polaris", "Kawasaki", "Yamaha",
];

const VEHICLE_MAKE_NORMALIZED_MAP = new Map(
  DEFAULT_NHTSA_MAKES.map((make) => [normalizeSearchText(make), make])
);

const VEHICLE_MAKE_LOOKUP = new Set(
  DEFAULT_NHTSA_MAKES.map((make) => normalizeSearchText(make))
);

/** Pre-compiled word-boundary patterns for each vehicle make (avoids regex
 *  re-compilation on every resolveNhtsaMakes call). */
const VEHICLE_MAKE_PATTERNS = new Map(
  Array.from(VEHICLE_MAKE_NORMALIZED_MAP.entries()).map(
    ([normalized, make]) => [make, new RegExp(`\\b${escapeRegExp(normalized)}\\b`)]
  )
);

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
  { brands: string[] }
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
  },
  costco: {
    brands: ["kirkland", "kirkland signature"],
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
  },
  ikea: {
    brands: ["ikea"],
  },
  amazon: {
    brands: [
      "amazon basics",
      "kindle",
      "ring",
      "blink",
      "eero",
      "whole foods 365",
      "happy belly",
      "solimo",
      "presto",
      "amazon essentials",
      "amazonfresh",
    ],
  },
  "home depot": {
    brands: [
      "hdx",
      "husky",
      "vigoro",
      "glacier bay",
      "home decorators collection",
      "lifeproof",
    ],
  },
  autozone: {
    brands: ["duralast", "valucraft", "surestart"],
  },
  cvs: {
    brands: ["cvs health", "cvs pharmacy", "gold emblem"],
  },
  walgreens: {
    brands: ["walgreens", "nice", "wal phed"],
  },
  kroger: {
    brands: ["kroger", "simple truth", "private selection", "home chef"],
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

// Bound regex caches to avoid unbounded growth from many unique queries; 50 covers typical session usage.
const PATTERN_CACHE_LIMIT = 50;

type QueryVariantPattern = { variant: string; pattern: RegExp };
type AliasPattern = { normalizedAlias: string; pattern: RegExp };

const QUERY_PATTERN_CACHE = new Map<
  string,
  { queryVariantPatterns: QueryVariantPattern[]; aliasPatterns: AliasPattern[] }
>();

function getPatternCacheEntry(cacheKey: string, context: QueryContext) {
  const existing = QUERY_PATTERN_CACHE.get(cacheKey);
  if (existing) return existing;

  const buildWholeWordPattern = (value: string) =>
    new RegExp(`(?:^|\\s)${escapeRegExp(value)}(?:$|\\s)`);

  const queryVariantPatterns = context.queryVariants
    .filter(Boolean)
    .map((variant) => ({ variant, pattern: buildWholeWordPattern(variant) }));

  const aliasPatterns = context.aliases
    .map((alias) => normalizeSearchText(alias))
    .filter(Boolean)
    .map((normalizedAlias) => ({
      normalizedAlias,
      pattern: buildWholeWordPattern(normalizedAlias),
    }));

  const entry = { queryVariantPatterns, aliasPatterns };
  QUERY_PATTERN_CACHE.set(cacheKey, entry);
  trimCache(QUERY_PATTERN_CACHE);
  return entry;
}

function trimCache(map: Map<string, unknown>) {
  while (map.size > PATTERN_CACHE_LIMIT) {
    const firstKey = map.keys().next().value;
    if (firstKey === undefined) break;
    map.delete(firstKey);
  }
}

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
  let url = `${CPSC_URL}&limit=1000`;
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
      const recallId = String(item?.RecallID || cryptoRandomId("cpsc"));
      const recall: RecallResult = {
        id: recallId,
        title: safeString(item?.Title),
        summary: safeString(item?.Description),
        source: "CPSC",
        category: "consumer",
        publishedAt: recallDate,
        url: safeString(item?.URL),
        companyName: safeString(item?.CompanyName) || undefined,
        sourceRecallId: recallId,
        recalledAt: recallDate,
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
  const makes = resolveNhtsaMakes(query);
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
      const recalledAt = normalizeDate(item?.RecallDate || item?.ReportReceivedDate);
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
        sourceRecallId: campaign || undefined,
        recalledAt,
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

function resolveNhtsaMakes(query?: string) {
  if (!query) return DEFAULT_NHTSA_MAKES;
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const directMatch = VEHICLE_MAKE_NORMALIZED_MAP.get(normalizedQuery);
  if (directMatch) return [directMatch];

  // Check if any known make appears as a whole word anywhere in the query.
  // This handles queries like "ford recalls", "dodge problems", or
  // "ford and toyota recalls" (returns multiple makes).
  const found: string[] = [];
  for (const [make, pattern] of VEHICLE_MAKE_PATTERNS.entries()) {
    if (pattern.test(normalizedQuery)) {
      found.push(make);
    }
  }
  return found;
}

async function fetchFsis(dateRangeStart?: Date, signal?: AbortSignal) {
  // FSIS API v1 supports server-side date filtering and sorting.
  let url = FSIS_URL;
  const params = new URLSearchParams();
  params.set("sort", "-field_recall_date");
  params.set("page[limit]", "1000");
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
        sourceRecallId: recallNumber || undefined,
        recalledAt: publishedAt,
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
  )}&sort=report_date:desc&limit=1000`;
  const data = await fetchJson(url, signal);
  const results = Array.isArray(data?.results) ? data.results : [];

  return results
    .map((item: Record<string, string>) => {
      const summary = safeString(item?.reason_for_recall || item?.product_description);
      const title = safeString(item?.product_description || item?.recall_number);
      const publishedAt = normalizeDate(item?.report_date || item?.recall_initiation_date);
      const recalledAt = normalizeDate(item?.recall_initiation_date || item?.report_date);
      const url = "https://www.fda.gov/safety/recalls";
      const recallNumber = safeString(item?.recall_number);
      const recall: RecallResult = {
        id: recallNumber || cryptoRandomId("fda"),
        title,
        summary,
        source: "FDA",
        category: inferFdaCategory(item),
        publishedAt,
        url,
        companyName: safeString(item?.recalling_firm) || undefined,
        productQuantity: safeString(item?.product_quantity) || undefined,
        sourceRecallId: recallNumber || undefined,
        recalledAt,
        status: safeString(item?.status) || undefined,
        classification: safeString(item?.classification) || undefined,
        hazard: safeString(item?.reason_for_recall) || undefined,
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
    responseset: "1000",
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
        sourceRecallId: caseNumber || undefined,
        recalledAt: publishedAt,
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
      const recallId = String(item?.RecallID || cryptoRandomId("uscg"));
      const recall: RecallResult = {
        id: recallId,
        title: safeString(item?.Title),
        summary: safeString(item?.Description),
        source: "USCG",
        category: "marine",
        publishedAt: recallDate,
        url: safeString(item?.URL) || "https://uscgboating.org/content/recalls.php",
        companyName: safeString(item?.CompanyName) || undefined,
        sourceRecallId: recallId,
        recalledAt: recallDate,
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
  const normalizedQueryText = normalizeSearchText(query);
  const { queryVariantPatterns, aliasPatterns } = getPatternCacheEntry(
    normalizedQueryText,
    context
  );
  const vehicleMakesInQuery = Array.from(VEHICLE_MAKE_PATTERNS.entries())
    .filter(([, pattern]) => pattern.test(normalizedQueryText))
    .map(([make]) => make);
  return results
    .filter((item) => {
      const normalizedCompany = normalizeSearchText(safeString(item.companyName));
      const normalizedBrand = normalizeSearchText(safeString(item.brand));
      const normalizedTitle = normalizeSearchText(safeString(item.title));
      const normalizedSummary = normalizeSearchText(safeString(item.summary));

      // MATCH TYPE 1: Exact company name match (whole-word)
      const companyMatch = queryVariantPatterns.some(
        ({ variant, pattern }) =>
          normalizedCompany === variant || pattern.test(normalizedCompany)
      );

      // MATCH TYPE 2: Brand family or alias match
      const brandMatch = aliasPatterns.some(({ pattern }) => {
        return pattern.test(normalizedCompany) || pattern.test(normalizedBrand);
      });

      // MATCH TYPE 3: Query phrase appears in title as whole words
      const titleMatch = queryVariantPatterns.some(({ pattern }) =>
        pattern.test(normalizedTitle)
      );

      // MATCH TYPE 4: Vehicle make match (only for vehicle category)
      const vehicleMakeMatch =
        item.category === "vehicle" &&
        vehicleMakesInQuery.length > 0 &&
        vehicleMakesInQuery.some((make) => {
          const pattern = VEHICLE_MAKE_PATTERNS.get(make);
          return pattern ? pattern.test(normalizedTitle) : false;
        });

      const isRetailMention =
        !companyMatch &&
        !brandMatch &&
        mentionsAsRetailLocation(
          query,
          normalizedSummary,
          normalizedTitle,
          item.companyName
        );

      if (isRetailMention) return false;

      return companyMatch || brandMatch || titleMatch || vehicleMakeMatch;
    })
    .map((item) => ({
      ...item,
      matchReason: getMatchReason(item, query, context, queryVariantPatterns, aliasPatterns),
    }));
}

/**
 * Detects when a company is mentioned only as a retail location (e.g.
 * "sold at Walmart") rather than as the responsible party for the recall.
 *
 * Returns true when the company name appears near retail-indicator phrases
 * in the summary/title but is NOT listed as the companyName (responsible
 * party) on the recall record.
 */
function mentionsAsRetailLocation(
  query: string,
  summary: string,
  title: string,
  companyName?: string
): boolean {
  const normalizedQuery = normalizeSearchText(query);

  // If company name matches query, they're responsible (not just retail)
  if (companyName) {
    const normalizedCompany = normalizeSearchText(companyName);
    if (normalizedCompany.includes(normalizedQuery)) return false;
  }

  const combined = normalizeSearchText(`${summary} ${title}`);

  // Retail indicator phrases
  const retailRegexes = getRetailRegexes(normalizedQuery);
  return retailRegexes.some((regex) => regex.test(combined));
}

const RETAIL_REGEX_CACHE = new Map<string, RegExp[]>();

function getRetailRegexes(normalizedQuery: string) {
  const cached = RETAIL_REGEX_CACHE.get(normalizedQuery);
  if (cached) return cached;

  const q = escapeRegExp(normalizedQuery);
  const retailPatterns = [
    `\\b(?:sold at|available at|distributed through|purchased from|found at)\\b[^\\n\\.]{0,80}\\b${q}\\b`,
    `\\b(?:retailers including|stores such as)\\b[^\\n\\.]{0,80}\\b${q}\\b`,
    `\\b${q}\\b[^\\n\\.]{0,80}\\bstores\\b`,
    `\\b${q}\\b[^\\n\\.]{0,80}\\blocations\\b`,
  ];

  const retailRegexes = retailPatterns.map((pattern) => new RegExp(pattern, "i"));
  RETAIL_REGEX_CACHE.set(normalizedQuery, retailRegexes);
  trimCache(RETAIL_REGEX_CACHE);
  return retailRegexes;
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
  context: QueryContext,
  queryVariantPatterns: QueryVariantPattern[],
  aliasPatterns: AliasPattern[]
): string | undefined {
  const normalizedCompany = normalizeSearchText(safeString(item.companyName));
  const normalizedTitle = normalizeSearchText(safeString(item.title));

  // If query matches company name, no explanation needed
  if (
    queryVariantPatterns.some(({ pattern }) => pattern.test(normalizedCompany))
  ) {
    return undefined;
  }

  // If brand match
  for (const { pattern } of aliasPatterns) {
    if (pattern.test(normalizedCompany)) {
      return `Related to "${query}" — brand owned by this company`;
    }
  }

  // If title match
  if (context.queryVariants.some((v) => v && normalizedTitle.includes(v))) {
    return undefined;
  }

  return undefined;
}

type QueryContext = {
  queryVariants: string[];
  aliases: string[];
  companyIntent: boolean;
};

function buildQueryContext(query: string): QueryContext {
  const normalized = normalizeSearchText(query);
  const stripped = stripCorporateSuffixes(normalized);
  const queryVariants = Array.from(new Set([normalized, stripped].filter(Boolean)));

  const aliasSet = new Set<string>();
  for (const variant of queryVariants) {
    (COMPANY_ALIASES[variant] || []).forEach((alias) => aliasSet.add(alias));
    const family = BRAND_FAMILIES[variant];
    if (family) {
      family.brands.forEach((brand) => aliasSet.add(brand));
    }
  }

  const normalizedAliases = Array.from(aliasSet)
    .map((alias) => normalizeSearchText(alias))
    .filter(Boolean);

  const hasCorporateSuffix = normalized
    .split(" ")
    .some((token) => token && CORPORATE_SUFFIXES.has(token));

  return {
    queryVariants,
    aliases: Array.from(new Set(normalizedAliases)),
    companyIntent: hasCorporateSuffix || normalizedAliases.length > 0,
  };
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripCorporateSuffixes(value: string) {
  if (!value) return "";
  return value
    .split(" ")
    .filter((token) => token && !CORPORATE_SUFFIXES.has(token))
    .join(" ");
}

function buildIsoDate(year: number, month: number, day: number) {
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }
  return date.toISOString();
}

function resolveYear(value: string) {
  if (value.length === 4) return Number(value);
  const year = Number(value);
  if (!Number.isFinite(year)) return year;
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;
  const candidate = currentCentury + year;
  const fallback = currentCentury - 100 + year;
  return Math.abs(candidate - currentYear) <= Math.abs(fallback - currentYear)
    ? candidate
    : fallback;
}

function monthFromText(value: string) {
  const normalized = value.toLowerCase();
  const months: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  return months[normalized];
}

function normalizeDate(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{8}$/.test(trimmed)) {
    const year = trimmed.slice(0, 4);
    const month = trimmed.slice(4, 6);
    const day = trimmed.slice(6, 8);
    return buildIsoDate(Number(year), Number(month), Number(day));
  }
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    return buildIsoDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdyMatch) {
    const year = resolveYear(mdyMatch[3]);
    return buildIsoDate(year, Number(mdyMatch[1]), Number(mdyMatch[2]));
  }
  const textMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (textMatch) {
    const month = monthFromText(textMatch[2]);
    if (month) {
      const year = resolveYear(textMatch[3]);
      return buildIsoDate(year, month, Number(textMatch[1]));
    }
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
