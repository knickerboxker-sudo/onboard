/**
 * SEC data parsing — submissions, company facts, employee extraction.
 */

import { normalizeCik } from "./cik";
import { secFetch, submissionsUrl, companyFactsUrl, filingDocUrl } from "./sec-client";
import type { Company, Filing, MetricSnapshot, MetricNotes, TTMSummary, CompanyMetrics } from "./types";

/* ── Submissions parsing ──────────────────────────────── */

interface RawFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
}

interface SubmissionsResponse {
  cik: number;
  entityType: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
    };
  };
}

export async function fetchCompany(cik: string): Promise<{ company: Company; filings: Filing[] }> {
  const paddedCik = normalizeCik(cik);
  const data = await secFetch<SubmissionsResponse>(submissionsUrl(paddedCik));

  const company: Company = {
    cik: normalizeCik(data.cik),
    ticker: data.tickers?.[0],
    name: data.name,
  };

  const recent = data.filings.recent;
  const filings: Filing[] = [];

  for (let i = 0; i < recent.form.length; i++) {
    const form = recent.form[i];
    if (form !== "10-K" && form !== "10-Q") continue;
    const accNo = recent.accessionNumber[i];
    const accNoDashes = accNo.replace(/-/g, "");
    filings.push({
      formType: form as "10-K" | "10-Q",
      accessionNo: accNo,
      filingDate: recent.filingDate[i],
      periodEndDate: recent.reportDate[i],
      primaryDocumentUrl: filingDocUrl(paddedCik, accNoDashes, recent.primaryDocument[i]),
    });
  }

  return { company, filings };
}

/* ── Company facts parsing ────────────────────────────── */

// Dividend tags in order of preference
const DIVIDEND_TAGS = [
  "PaymentsOfDividends",
  "PaymentsOfDividendsCommonStock",
  "DividendsPaid",
];

// Buyback tags in order of preference
const BUYBACK_TAGS = [
  "PaymentsForRepurchaseOfCommonStock",
  "PaymentsForRepurchaseOfEquity",
  "RepurchaseOfCommonStock",
];

const EMPLOYEE_TAGS = [
  "EntityNumberOfEmployees",
  "NumberOfEmployees",
];

interface FactUnit {
  start?: string;
  end: string;
  val: number;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
}

interface CompanyFacts {
  facts: {
    [taxonomy: string]: {
      [concept: string]: {
        units: {
          [unit: string]: FactUnit[];
        };
      };
    };
  };
}

function findFactValue(
  facts: CompanyFacts,
  tags: string[],
  formType: string,
  periodEnd: string
): { value: number | null; tagUsed: string | null; warnings: string[] } {
  const warnings: string[] = [];

  for (const tag of tags) {
    // Search across taxonomies
    for (const taxonomy of ["us-gaap", "dei"]) {
      const concept = facts.facts?.[taxonomy]?.[tag];
      if (!concept) continue;

      // Check USD units first, then pure
      for (const unit of ["USD", "pure"]) {
        const entries = concept.units?.[unit];
        if (!entries) continue;

        // Find matching entries for this filing period
        const matches = entries.filter(
          (e) => e.form === formType && e.end === periodEnd
        );

        if (matches.length > 0) {
          // Use the most recently filed value
          const sorted = [...matches].sort(
            (a, b) => b.filed.localeCompare(a.filed)
          );
          const val = Math.abs(sorted[0].val); // Normalize sign: always positive outflow
          if (tag.includes("Equity") && !tag.includes("Common")) {
            warnings.push(
              `Used broader "${tag}" tag which may include preferred stock repurchases`
            );
          }
          return { value: val, tagUsed: tag, warnings };
        }
      }
    }
  }
  return { value: null, tagUsed: null, warnings };
}

function findEmployeeCount(
  facts: CompanyFacts,
  formType: string,
  periodEnd: string
): { count: number | null; tagUsed: string | null } {
  for (const tag of EMPLOYEE_TAGS) {
    for (const taxonomy of ["dei", "us-gaap"]) {
      const concept = facts.facts?.[taxonomy]?.[tag];
      if (!concept) continue;

      for (const unit of Object.keys(concept.units || {})) {
        const entries = concept.units[unit];
        const matches = entries.filter(
          (e) => e.form === formType && e.end === periodEnd
        );
        if (matches.length > 0) {
          const sorted = [...matches].sort(
            (a, b) => b.filed.localeCompare(a.filed)
          );
          return { count: sorted[0].val, tagUsed: tag };
        }
      }
    }
  }
  return { count: null, tagUsed: null };
}

/* ── Employee text extraction ─────────────────────────── */

export function extractEmployeeCountFromText(text: string): {
  count: number | null;
  sentence: string | null;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Strip HTML tags
  const cleaned = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ");

  // Patterns for employee count
  const patterns = [
    /(?:approximately|about|roughly|over|more than)?\s*([\d,]+)\s*(?:full[\s-]?time)?\s*employees/gi,
    /(?:we|the company)\s+(?:employed|had|have)\s+(?:approximately|about|roughly|over|more than)?\s*([\d,]+)\s+(?:full[\s-]?time\s+)?(?:employees|people|associates|team members)/gi,
    /(?:as of [^,]+,?\s*)?(?:we|the company)\s+had\s+(?:approximately|about)?\s*([\d,]+)\s+employees/gi,
    /(?:employee|headcount|workforce)\s+(?:count|total|of)\s+(?:was|is|of)?\s*(?:approximately|about)?\s*([\d,]+)/gi,
    /(?:total of|totaling)\s+(?:approximately|about)?\s*([\d,]+)\s+employees/gi,
  ];

  const candidates: { count: number; sentence: string }[] = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleaned)) !== null) {
      const numStr = match[1].replace(/,/g, "");
      const num = parseInt(numStr, 10);
      if (num < 10 || num > 10_000_000) continue; // Sanity bounds

      // Get surrounding context (sentence)
      const start = Math.max(0, match.index - 100);
      const end = Math.min(cleaned.length, match.index + match[0].length + 100);
      const context = cleaned.slice(start, end).trim();

      // Avoid false positives
      const lower = context.toLowerCase();
      if (
        lower.includes("customer") ||
        lower.includes("supplier") ||
        lower.includes("contractor") ||
        lower.includes("third party") ||
        lower.includes("third-party")
      ) {
        continue;
      }

      candidates.push({ count: num, sentence: context });
    }
  }

  if (candidates.length === 0) {
    return { count: null, sentence: null, warnings };
  }

  if (candidates.length > 1) {
    warnings.push(
      `Multiple employee count candidates found (${candidates.length}); using largest value`
    );
  }

  // Use the largest count (most likely total employees)
  candidates.sort((a, b) => b.count - a.count);
  return {
    count: candidates[0].count,
    sentence: candidates[0].sentence,
    warnings,
  };
}

/* ── Full metrics computation ─────────────────────────── */

export async function computeMetrics(
  cik: string,
  forceRefresh = false
): Promise<CompanyMetrics> {
  const paddedCik = normalizeCik(cik);
  const { company, filings } = await fetchCompany(paddedCik);

  let facts: CompanyFacts | null = null;
  try {
    facts = await secFetch<CompanyFacts>(companyFactsUrl(paddedCik), {
      forceRefresh,
    });
  } catch {
    // Company facts might not be available for all companies
  }

  // Limit to recent filings
  const recentFilings = filings.slice(0, 20);
  const snapshots: MetricSnapshot[] = [];

  for (const filing of recentFilings) {
    const notes: MetricNotes = {
      tagsUsed: [],
      usedXbrl: false,
      fallbacks: [],
      warnings: [],
    };

    let dividendsPaidUSD: number | null = null;
    let shareRepurchaseUSD: number | null = null;
    let employeeCount: number | null = null;
    let employeeCountSource: "reported" | "unknown" = "unknown";

    if (facts) {
      const divResult = findFactValue(facts, DIVIDEND_TAGS, filing.formType, filing.periodEndDate);
      dividendsPaidUSD = divResult.value;
      if (divResult.tagUsed) notes.tagsUsed.push(divResult.tagUsed);
      notes.warnings.push(...divResult.warnings);

      const buyResult = findFactValue(facts, BUYBACK_TAGS, filing.formType, filing.periodEndDate);
      shareRepurchaseUSD = buyResult.value;
      if (buyResult.tagUsed) notes.tagsUsed.push(buyResult.tagUsed);
      notes.warnings.push(...buyResult.warnings);

      // Employee count from XBRL
      const empResult = findEmployeeCount(facts, filing.formType, filing.periodEndDate);
      if (empResult.count !== null) {
        employeeCount = empResult.count;
        employeeCountSource = "reported";
        if (empResult.tagUsed) notes.tagsUsed.push(empResult.tagUsed);
        notes.usedXbrl = true;
      }
    }

    // Fallback: text extraction for employee count (only for 10-K)
    if (employeeCount === null && filing.formType === "10-K") {
      try {
        notes.fallbacks.push("employee-text-extraction");
        const html = await secFetch<string>(filing.primaryDocumentUrl, {
          maxBytes: 5 * 1024 * 1024,
          ttlSeconds: 86400 * 7, // Cache filing HTML for 7 days
        });
        const result = extractEmployeeCountFromText(html);
        if (result.count !== null) {
          employeeCount = result.count;
          employeeCountSource = "reported";
          notes.warnings.push(...result.warnings);
          notes.evidence = {
            matchedSentence: result.sentence ?? "",
            url: filing.primaryDocumentUrl,
          };
        }
      } catch {
        notes.warnings.push("Failed to fetch filing document for employee extraction");
      }
    }

    const totalReturnedUSD =
      dividendsPaidUSD !== null || shareRepurchaseUSD !== null
        ? (dividendsPaidUSD ?? 0) + (shareRepurchaseUSD ?? 0)
        : null;

    const perEmployeeBuybacksUSD =
      employeeCount && employeeCount > 0 && shareRepurchaseUSD !== null
        ? Math.round(shareRepurchaseUSD / employeeCount)
        : null;
    const perEmployeeDividendsUSD =
      employeeCount && employeeCount > 0 && dividendsPaidUSD !== null
        ? Math.round(dividendsPaidUSD / employeeCount)
        : null;
    const perEmployeeTotalUSD =
      employeeCount && employeeCount > 0 && totalReturnedUSD !== null
        ? Math.round(totalReturnedUSD / employeeCount)
        : null;

    snapshots.push({
      filing,
      dividendsPaidUSD,
      shareRepurchaseUSD,
      totalReturnedUSD,
      employeeCount,
      employeeCountSource,
      perEmployeeBuybacksUSD,
      perEmployeeDividendsUSD,
      perEmployeeTotalUSD,
      notes,
    });
  }

  // Compute TTM
  const ttm = computeTTM(snapshots);

  return {
    company,
    snapshots,
    ttm,
    lastUpdated: new Date().toISOString(),
  };
}

/* ── TTM calculation ──────────────────────────────────── */

export function computeTTM(snapshots: MetricSnapshot[]): TTMSummary | null {
  // Get last 4 quarters (10-Q) — 10-K covers full year so we don't double-count
  const quarters = snapshots
    .filter((s) => s.filing.formType === "10-Q")
    .slice(0, 4);

  if (quarters.length < 4) {
    // Try using the most recent 10-K as a fallback
    const annual = snapshots.find((s) => s.filing.formType === "10-K");
    if (annual) {
      return {
        available: true,
        reason: "Based on latest annual filing (10-K)",
        dividendsPaidUSD: annual.dividendsPaidUSD,
        shareRepurchaseUSD: annual.shareRepurchaseUSD,
        totalReturnedUSD: annual.totalReturnedUSD,
        employeeCount: annual.employeeCount,
        employeeCountSource: annual.employeeCountSource,
        perEmployeeBuybacksUSD: annual.perEmployeeBuybacksUSD,
        perEmployeeDividendsUSD: annual.perEmployeeDividendsUSD,
        perEmployeeTotalUSD: annual.perEmployeeTotalUSD,
        quartersUsed: 0,
      };
    }
    return {
      available: false,
      reason: `Only ${quarters.length} quarters available; need 4 for TTM`,
      dividendsPaidUSD: null,
      shareRepurchaseUSD: null,
      totalReturnedUSD: null,
      employeeCount: null,
      employeeCountSource: "unknown",
      perEmployeeBuybacksUSD: null,
      perEmployeeDividendsUSD: null,
      perEmployeeTotalUSD: null,
      quartersUsed: quarters.length,
    };
  }

  const dividendsPaidUSD = sumNullable(quarters.map((q) => q.dividendsPaidUSD));
  const shareRepurchaseUSD = sumNullable(quarters.map((q) => q.shareRepurchaseUSD));
  const totalReturnedUSD =
    dividendsPaidUSD !== null || shareRepurchaseUSD !== null
      ? (dividendsPaidUSD ?? 0) + (shareRepurchaseUSD ?? 0)
      : null;

  // Use employee count from most recent quarter or annual
  const empQ = quarters.find((q) => q.employeeCount !== null);
  const empAnnual = snapshots.find(
    (s) => s.filing.formType === "10-K" && s.employeeCount !== null
  );
  const employeeCount = empQ?.employeeCount ?? empAnnual?.employeeCount ?? null;
  const employeeCountSource =
    empQ?.employeeCountSource ?? empAnnual?.employeeCountSource ?? "unknown";

  const perEmployeeBuybacksUSD =
    employeeCount && employeeCount > 0 && shareRepurchaseUSD !== null
      ? Math.round(shareRepurchaseUSD / employeeCount)
      : null;
  const perEmployeeDividendsUSD =
    employeeCount && employeeCount > 0 && dividendsPaidUSD !== null
      ? Math.round(dividendsPaidUSD / employeeCount)
      : null;
  const perEmployeeTotalUSD =
    employeeCount && employeeCount > 0 && totalReturnedUSD !== null
      ? Math.round(totalReturnedUSD / employeeCount)
      : null;

  return {
    available: true,
    reason: "Sum of last 4 quarterly (10-Q) filings",
    dividendsPaidUSD,
    shareRepurchaseUSD,
    totalReturnedUSD,
    employeeCount,
    employeeCountSource,
    perEmployeeBuybacksUSD,
    perEmployeeDividendsUSD,
    perEmployeeTotalUSD,
    quartersUsed: 4,
  };
}

function sumNullable(values: (number | null)[]): number | null {
  const nonNull = values.filter((v): v is number => v !== null);
  if (nonNull.length === 0) return null;
  return nonNull.reduce((a, b) => a + b, 0);
}
