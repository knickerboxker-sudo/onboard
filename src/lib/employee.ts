/**
 * Employee count extraction from SEC filing text.
 *
 * Rules:
 * - Only SEC filing text is a valid source.
 * - If a direct quote cannot be produced, count is null and source is "unknown".
 */

import type { EmployeeEvidence } from "./types";

const MIN_EMPLOYEE_COUNT = 10;
const MAX_EMPLOYEE_COUNT = 10_000_000;

/** Regex patterns for employee counts. */
const EMPLOYEE_PATTERNS = [
  /(?:approximately|about|roughly|over|more than)?\s*([\d,]+)\s*(?:full[\s-]?time\s+(?:equivalent\s+)?)?\s*employees/gi,
  /(?:we|the company)\s+(?:employed|had|have)\s+(?:approximately|about|roughly|over|more than)?\s*([\d,]+)\s+(?:full[\s-]?time\s+)?(?:employees|people|associates|team members)/gi,
  /(?:as of [^,]+,?\s*)?(?:we|the company)\s+had\s+(?:approximately|about)?\s*([\d,]+)\s+employees/gi,
  /(?:employee|headcount|workforce)\s+(?:count|total|of)\s+(?:was|is|of)?\s*(?:approximately|about)?\s*([\d,]+)/gi,
  /(?:total of|totaling)\s+(?:approximately|about)?\s*([\d,]+)\s+employees/gi,
];

/** False-positive guard words checked in surrounding context. */
const FALSE_POSITIVE_WORDS = [
  "customer",
  "supplier",
  "contractor",
  "third party",
  "third-party",
];

export interface EmployeeExtractionResult {
  employeeCount: number | null;
  source: "reported" | "unknown";
  evidence?: EmployeeEvidence;
  warnings: string[];
}

/**
 * Extract employee count from the plain text of an SEC filing document.
 *
 * @param text  Plain text (already HTML-stripped) of the filing.
 * @param meta  Filing metadata used to populate evidence fields.
 */
export function extractEmployeeCountFromFiling(args: {
  text: string;
  url: string;
  accessionNo: string;
  formType: "10-K" | "10-Q";
  periodEndDate?: string;
}): EmployeeExtractionResult {
  const { text, url, accessionNo, formType, periodEndDate } = args;
  const warnings: string[] = [];

  const candidates: {
    count: number;
    quote: string;
    start: number;
    end: number;
  }[] = [];

  for (const pattern of EMPLOYEE_PATTERNS) {
    // Reset lastIndex so every pattern starts from position 0
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, "");
      const num = parseInt(numStr, 10);
      if (num < MIN_EMPLOYEE_COUNT || num > MAX_EMPLOYEE_COUNT) continue;

      // Context window for false-positive filtering
      const ctxStart = Math.max(0, match.index - 100);
      const ctxEnd = Math.min(text.length, match.index + match[0].length + 100);
      const context = text.slice(ctxStart, ctxEnd).trim();

      const lower = context.toLowerCase();
      if (FALSE_POSITIVE_WORDS.some((w) => lower.includes(w))) continue;

      candidates.push({
        count: num,
        quote: context,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  if (candidates.length === 0) {
    return { employeeCount: null, source: "unknown", warnings };
  }

  if (candidates.length > 1) {
    warnings.push(
      `Multiple employee count candidates found (${candidates.length}); using largest value`
    );
  }

  // Pick the largest (most likely total headcount)
  candidates.sort((a, b) => b.count - a.count);
  const best = candidates[0];

  return {
    employeeCount: best.count,
    source: "reported",
    evidence: {
      url,
      accessionNo,
      formType,
      periodEndDate,
      quote: best.quote,
      method: "regex",
      matchSpan: { start: best.start, end: best.end },
    },
    warnings,
  };
}
