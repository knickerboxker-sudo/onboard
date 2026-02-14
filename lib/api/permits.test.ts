import { describe, expect, it } from "vitest";
import { getPermits, getPermitStats } from "@/lib/api/permits";

describe("permit api", () => {
  it("filters permits by city and zip code", async () => {
    const all = await getPermits();
    const candidate = all[0];

    const filtered = await getPermits({
      city: candidate.city,
      zipCode: candidate.zipCode,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((permit) => permit.city === candidate.city)).toBe(true);
    expect(filtered.every((permit) => permit.zipCode === candidate.zipCode)).toBe(true);
  });

  it("filters permits by filed date range", async () => {
    const all = await getPermits();
    const target = all[Math.floor(all.length / 2)];

    const filtered = await getPermits({
      dateFrom: target.filedDate,
      dateTo: target.filedDate,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((permit) => permit.filedDate === target.filedDate)).toBe(true);
  });

  it("sorts permits by estimated value", async () => {
    const highToLow = await getPermits({ sortBy: "value-high" });
    const lowToHigh = await getPermits({ sortBy: "value-low" });

    expect(highToLow[0].estimatedValue).toBeGreaterThanOrEqual(highToLow[1].estimatedValue);
    expect(lowToHigh[0].estimatedValue).toBeLessThanOrEqual(lowToHigh[1].estimatedValue);
  });

  it("returns non-negative computed stats", async () => {
    const all = await getPermits();
    const stats = getPermitStats(all);

    expect(stats.totalThisWeek).toBeGreaterThanOrEqual(0);
    expect(stats.averageValue).toBeGreaterThan(0);
    expect(stats.hotLeads).toBeGreaterThanOrEqual(0);
    expect(stats.newValueThisWeek).toBeGreaterThanOrEqual(0);
  });
});
