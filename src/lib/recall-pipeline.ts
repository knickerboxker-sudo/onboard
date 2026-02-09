import { RecallResult, RecallSource, RecallCategory } from "@/src/lib/api-fetcher";

export type Sector =
  | "FOOD"
  | "DRUGS"
  | "MEDICAL_DEVICE"
  | "CONSUMER_PRODUCT"
  | "VEHICLE"
  | "MARITIME"
  | "ENVIRONMENTAL"
  | "OTHER";

export type CompanyRole =
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "IMPORTER"
  | "BRAND_OWNER"
  | "RETAILER"
  | "OTHER";

export type RecallOccurrence = {
  id: string;
  sourceAgency: RecallSource;
  sourceRecallId: string;
  sourceUrl: string;
  recalledAt: string;
  publishedAt: string;
  title: string;
  summary: string;
  status?: string;
  classification?: string;
  hazard?: string;
  sector: Sector;
  products: RecallProduct[];
  companyLinks: RecallCompanyLink[];
};

export type RecallProduct = {
  id: string;
  recallId: string;
  sourceProductId?: string;
  productName: string;
  productDescription?: string;
  brand?: string;
  model?: string;
  lotCodes?: string;
  upcGtin?: string;
  quantityAffected?: string;
};

export type Company = {
  id: string;
  canonicalName: string;
};

export type RecallCompanyLink = {
  id: string;
  recallId: string;
  companyId: string;
  role: CompanyRole;
  rawCompanyName: string;
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

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\bco\b/gi, "company")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token && !CORPORATE_SUFFIXES.has(token))
    .join(" ")
    .trim();
}

export function buildCompanyId(normalizedName: string): string {
  return `co_${Buffer.from(normalizedName || "unknown").toString("base64url")}`;
}

export function buildRecallOccurrenceId(
  sourceAgency: RecallSource,
  sourceRecallId: string
): string {
  return `rec_${Buffer.from(`${sourceAgency}::${sourceRecallId}`).toString("base64url")}`;
}

export function parseRecallOccurrenceId(id: string): {
  sourceAgency: RecallSource;
  sourceRecallId: string;
} | null {
  if (!id.startsWith("rec_")) return null;
  try {
    const decoded = Buffer.from(id.slice(4), "base64url").toString("utf-8");
    const [sourceAgency, sourceRecallId] = decoded.split("::");
    if (!sourceAgency || !sourceRecallId) return null;
    return { sourceAgency: sourceAgency as RecallSource, sourceRecallId };
  } catch {
    return null;
  }
}

export function mapSector(
  source: RecallSource,
  category?: RecallCategory
): Sector {
  switch (source) {
    case "FDA":
      if (category === "device") return "MEDICAL_DEVICE";
      if (category === "drug") return "DRUGS";
      if (category === "food") return "FOOD";
      return "DRUGS";
    case "FSIS":
      return "FOOD";
    case "CPSC":
      return "CONSUMER_PRODUCT";
    case "NHTSA":
      return "VEHICLE";
    case "USCG":
      return "MARITIME";
    case "EPA":
      return "ENVIRONMENTAL";
    default:
      return "OTHER";
  }
}

export function buildRecallDataset(results: RecallResult[]) {
  const recallMap = new Map<string, RecallOccurrence>();
  const companyMap = new Map<string, Company>();
  const companyLinks: RecallCompanyLink[] = [];

  for (const recall of results) {
    const sourceRecallId = recall.sourceRecallId || recall.id;
    if (!sourceRecallId) continue;

    const recallId = buildRecallOccurrenceId(recall.source, sourceRecallId);
    const existing = recallMap.get(recallId);
    if (existing) continue;

    const products = buildProducts(recall, recallId);
    const links = buildCompanyLinks(recall, recallId, companyMap);

    const occurrence: RecallOccurrence = {
      id: recallId,
      sourceAgency: recall.source,
      sourceRecallId,
      sourceUrl: recall.url,
      recalledAt: recall.recalledAt || recall.publishedAt,
      publishedAt: recall.publishedAt,
      title: recall.title,
      summary: recall.summary,
      status: recall.status,
      classification: recall.classification,
      hazard: recall.hazard,
      sector: mapSector(recall.source, recall.category),
      products,
      companyLinks: links,
    };

    recallMap.set(recallId, occurrence);
    companyLinks.push(...links);
  }

  return {
    recalls: Array.from(recallMap.values()),
    companies: Array.from(companyMap.values()),
    companyLinks,
  };
}

function buildProducts(recall: RecallResult, recallId: string): RecallProduct[] {
  const name = recall.title?.trim();
  const description = recall.summary?.trim();
  if (!name && !description) return [];

  const product: RecallProduct = {
    id: `prod_${Buffer.from(`${recallId}:${name || description || ""}`).toString("base64url")}`,
    recallId,
    sourceProductId: recall.sourceProductId,
    productName: name || "Unknown product",
    productDescription: description || undefined,
    brand: recall.brand,
    model: recall.model,
    lotCodes: recall.lotCodes,
    upcGtin: recall.upcGtin,
    quantityAffected: recall.productQuantity,
  };

  return [product];
}

function buildCompanyLinks(
  recall: RecallResult,
  recallId: string,
  companyMap: Map<string, Company>
): RecallCompanyLink[] {
  const rawCompanyName = recall.companyName?.trim();
  if (!rawCompanyName) return [];

  const normalized = normalizeCompanyName(rawCompanyName);
  const companyId = buildCompanyId(normalized || rawCompanyName.toLowerCase());

  if (!companyMap.has(companyId)) {
    companyMap.set(companyId, {
      id: companyId,
      canonicalName: rawCompanyName,
    });
  }

  return [
    {
      id: `link_${Buffer.from(`${recallId}:${companyId}`).toString("base64url")}`,
      recallId,
      companyId,
      role: "MANUFACTURER",
      rawCompanyName,
    },
  ];
}
