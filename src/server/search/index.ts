import { prisma } from "@/src/server/db/prisma";
import { normalizeName } from "@/src/server/normalize/utils";
import { Prisma } from "@prisma/client";

export interface SearchParams {
  q?: string;
  category?: string;
  source?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: Date;
  companyName: string | null;
  companyNormalized: string | null;
  brandNames: string[];
  sourceUrl: string | null;
  rank?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchEvents(
  params: SearchParams
): Promise<SearchResponse> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const q = params.q?.trim() || "";
  const normalizedQuery = normalizeName(q);

  // Build WHERE conditions
  const conditions: string[] = ["1=1"];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (params.category) {
    conditions.push(`category = $${paramIdx}`);
    values.push(params.category);
    paramIdx++;
  }

  if (params.source) {
    conditions.push(`source = $${paramIdx}`);
    values.push(params.source);
    paramIdx++;
  }

  if (params.from) {
    conditions.push(`"publishedAt" >= $${paramIdx}::timestamp`);
    values.push(params.from);
    paramIdx++;
  }

  if (params.to) {
    conditions.push(`"publishedAt" <= $${paramIdx}::timestamp`);
    values.push(params.to);
    paramIdx++;
  }

  const whereClause = conditions.join(" AND ");

  if (!q) {
    // No query: return latest events
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM recall_events WHERE ${whereClause}`,
      ...values
    );
    const total = Number(countResult[0].count);

    const results = await prisma.$queryRawUnsafe<SearchResult[]>(
      `SELECT id, title, summary, category, source, "publishedAt", "companyName", "companyNormalized", "brandNames", "sourceUrl"
       FROM recall_events
       WHERE ${whereClause}
       ORDER BY "publishedAt" DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      ...values,
      pageSize,
      offset
    );

    return {
      results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // FTS search with ranking
  const tsQueryParam = `$${paramIdx}`;
  values.push(q);
  paramIdx++;

  const normalizedParam = `$${paramIdx}`;
  values.push(normalizedQuery);
  paramIdx++;

  const ilikeParam = `$${paramIdx}`;
  values.push(`%${q}%`);
  paramIdx++;

  // Check for alias expansions
  let aliasBoost = "";
  try {
    const aliases = await prisma.entityAlias.findMany({
      where: {
        normalizedAlias: normalizedQuery,
      },
    });
    if (aliases.length > 0) {
      const canonicals = aliases.map((a) => a.canonical);
      for (const canonical of canonicals) {
        const cParam = `$${paramIdx}`;
        values.push(canonical);
        paramIdx++;
        aliasBoost += ` + CASE WHEN "companyNormalized" = ${cParam} THEN 0.5 ELSE 0.0 END`;
      }
    }
  } catch {
    // aliases table might not exist yet
  }

  const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*) as count FROM recall_events
     WHERE ${whereClause}
     AND (
       "searchVector" @@ plainto_tsquery('english', ${tsQueryParam})
       OR "companyNormalized" = ${normalizedParam}
       OR title ILIKE ${ilikeParam}
     )`,
    ...values.slice(0, paramIdx - 1)
  );
  const total = Number(countResult[0].count);

  const limitParam = `$${paramIdx}`;
  values.push(pageSize);
  paramIdx++;

  const offsetParam = `$${paramIdx}`;
  values.push(offset);
  paramIdx++;

  const results = await prisma.$queryRawUnsafe<SearchResult[]>(
    `SELECT id, title, summary, category, source, "publishedAt", "companyName", "companyNormalized", "brandNames", "sourceUrl",
       (
         ts_rank_cd("searchVector", plainto_tsquery('english', ${tsQueryParam}))
         + CASE WHEN "companyNormalized" = ${normalizedParam} THEN 1.0 ELSE 0.0 END
         ${aliasBoost}
       ) as rank
     FROM recall_events
     WHERE ${whereClause}
     AND (
       "searchVector" @@ plainto_tsquery('english', ${tsQueryParam})
       OR "companyNormalized" = ${normalizedParam}
       OR title ILIKE ${ilikeParam}
     )
     ORDER BY rank DESC, "publishedAt" DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    ...values
  );

  return {
    results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
