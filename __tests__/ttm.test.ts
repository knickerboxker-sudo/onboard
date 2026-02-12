import { describe, it, expect } from "vitest";
import { computeTTM } from "../src/lib/metrics";
import type { MetricSnapshot } from "../src/lib/types";

function makeSnapshot(
  formType: "10-K" | "10-Q",
  periodEndDate: string,
  overrides: Partial<MetricSnapshot> = {}
): MetricSnapshot {
  return {
    filing: {
      formType,
      accessionNo: "0000000000-00-000000",
      filingDate: periodEndDate,
      periodEndDate,
      primaryDocumentUrl: "https://example.com/doc",
    },
    dividendsPaidUSD: null,
    shareRepurchaseUSD: null,
    totalReturnedUSD: null,
    employeeCount: null,
    employeeCountSource: "unknown",
    perEmployeeBuybacksUSD: null,
    perEmployeeDividendsUSD: null,
    perEmployeeTotalUSD: null,
    notes: { tagsUsed: [], usedXbrl: false, fallbacks: [], warnings: [] },
    ...overrides,
  };
}

describe("computeTTM", () => {
  it("returns unavailable when fewer than 4 quarters and no 10-K", () => {
    const snapshots = [
      makeSnapshot("10-Q", "2024-03-31"),
      makeSnapshot("10-Q", "2023-12-31"),
    ];
    const ttm = computeTTM(snapshots);
    expect(ttm).not.toBeNull();
    expect(ttm!.available).toBe(false);
    expect(ttm!.quartersUsed).toBe(2);
  });

  it("sums 4 quarters for TTM", () => {
    const snapshots = [
      makeSnapshot("10-Q", "2024-03-31", { shareRepurchaseUSD: 1000, dividendsPaidUSD: 500 }),
      makeSnapshot("10-Q", "2023-12-31", { shareRepurchaseUSD: 2000, dividendsPaidUSD: 600 }),
      makeSnapshot("10-Q", "2023-09-30", { shareRepurchaseUSD: 1500, dividendsPaidUSD: 400 }),
      makeSnapshot("10-Q", "2023-06-30", { shareRepurchaseUSD: 3000, dividendsPaidUSD: 700 }),
    ];
    const ttm = computeTTM(snapshots);
    expect(ttm).not.toBeNull();
    expect(ttm!.available).toBe(true);
    expect(ttm!.shareRepurchaseUSD).toBe(7500);
    expect(ttm!.dividendsPaidUSD).toBe(2200);
    expect(ttm!.totalReturnedUSD).toBe(9700);
    expect(ttm!.quartersUsed).toBe(4);
  });

  it("uses most recent employee count for per-employee TTM", () => {
    const snapshots = [
      makeSnapshot("10-Q", "2024-03-31", {
        shareRepurchaseUSD: 1000,
        dividendsPaidUSD: 0,
        employeeCount: 100,
        employeeCountSource: "reported",
      }),
      makeSnapshot("10-Q", "2023-12-31", { shareRepurchaseUSD: 1000, dividendsPaidUSD: 0 }),
      makeSnapshot("10-Q", "2023-09-30", { shareRepurchaseUSD: 1000, dividendsPaidUSD: 0 }),
      makeSnapshot("10-Q", "2023-06-30", { shareRepurchaseUSD: 1000, dividendsPaidUSD: 0 }),
    ];
    const ttm = computeTTM(snapshots);
    expect(ttm!.employeeCount).toBe(100);
    expect(ttm!.perEmployeeBuybacksUSD).toBe(40); // 4000/100
    expect(ttm!.perEmployeeTotalUSD).toBe(40);
  });

  it("falls back to 10-K when insufficient quarters", () => {
    const snapshots = [
      makeSnapshot("10-Q", "2024-03-31", { shareRepurchaseUSD: 500 }),
      makeSnapshot("10-K", "2023-12-31", {
        shareRepurchaseUSD: 10000,
        dividendsPaidUSD: 5000,
        employeeCount: 200,
        employeeCountSource: "reported",
      }),
    ];
    const ttm = computeTTM(snapshots);
    expect(ttm!.available).toBe(true);
    expect(ttm!.reason).toContain("annual filing");
    expect(ttm!.shareRepurchaseUSD).toBe(10000);
  });

  it("handles all null values gracefully", () => {
    const snapshots = [
      makeSnapshot("10-Q", "2024-03-31"),
      makeSnapshot("10-Q", "2023-12-31"),
      makeSnapshot("10-Q", "2023-09-30"),
      makeSnapshot("10-Q", "2023-06-30"),
    ];
    const ttm = computeTTM(snapshots);
    expect(ttm!.available).toBe(true);
    expect(ttm!.shareRepurchaseUSD).toBeNull();
    expect(ttm!.dividendsPaidUSD).toBeNull();
    expect(ttm!.totalReturnedUSD).toBeNull();
  });
});
