import { describe, it, expect } from "vitest";
import { extractEmployeeCountFromFiling } from "../src/lib/employee";

const BASE_ARGS = {
  url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000006/aapl-20231230.htm",
  accessionNo: "0000320193-24-000006",
  formType: "10-K" as const,
  periodEndDate: "2023-12-30",
};

describe("extractEmployeeCountFromFiling", () => {
  it("extracts employee count and returns full evidence", () => {
    const text =
      "As of September 30, 2023, the Company had approximately 161,000 full-time equivalent employees.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBe(161000);
    expect(result.source).toBe("reported");
    expect(result.evidence).toBeDefined();
    expect(result.evidence!.url).toBe(BASE_ARGS.url);
    expect(result.evidence!.accessionNo).toBe(BASE_ARGS.accessionNo);
    expect(result.evidence!.formType).toBe("10-K");
    expect(result.evidence!.periodEndDate).toBe("2023-12-30");
    expect(result.evidence!.quote).toContain("161,000");
    expect(result.evidence!.method).toBe("regex");
    expect(result.evidence!.matchSpan).toBeDefined();
    expect(result.evidence!.matchSpan!.start).toBeGreaterThanOrEqual(0);
    expect(result.evidence!.matchSpan!.end).toBeGreaterThan(result.evidence!.matchSpan!.start);
  });

  it("returns unknown when no employee count found", () => {
    const text = "This filing discusses revenue and operating expenses only.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBeNull();
    expect(result.source).toBe("unknown");
    expect(result.evidence).toBeUndefined();
    expect(result.warnings).toEqual([]);
  });

  it("avoids false positives with customer context", () => {
    const text =
      "We serve approximately 100,000 employees of our customers across the globe.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBeNull();
    expect(result.source).toBe("unknown");
  });

  it("avoids false positives with contractor context", () => {
    const text = "Our contractor employed 25,000 employees in their facilities.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBeNull();
  });

  it("handles multiple candidates and picks the largest", () => {
    const text =
      "We had approximately 10,000 employees in our US offices. Total of approximately 50,000 employees worldwide.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBe(50000);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("Multiple");
  });

  it("rejects counts below minimum threshold", () => {
    const text = "We had 5 employees as of year end.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBeNull();
    expect(result.source).toBe("unknown");
  });

  it("rejects counts above maximum threshold", () => {
    const text = "We had 99,000,000 employees globally.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBeNull();
    expect(result.source).toBe("unknown");
  });

  it("works with 10-Q form type", () => {
    const text = "As of June 30, 2024, the company employed approximately 75,000 employees.";
    const result = extractEmployeeCountFromFiling({
      ...BASE_ARGS,
      formType: "10-Q",
      text,
    });
    expect(result.employeeCount).toBe(75000);
    expect(result.source).toBe("reported");
    expect(result.evidence!.formType).toBe("10-Q");
  });

  it("populates matchSpan correctly", () => {
    const text = "We had approximately 30,000 employees.";
    const result = extractEmployeeCountFromFiling({ ...BASE_ARGS, text });
    expect(result.employeeCount).toBe(30000);
    const span = result.evidence!.matchSpan!;
    // The matched substring should be within the text bounds
    expect(span.start).toBeGreaterThanOrEqual(0);
    expect(span.end).toBeLessThanOrEqual(text.length);
  });
});
