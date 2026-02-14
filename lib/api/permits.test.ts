import { describe, expect, it } from "vitest";
import { getPermits, getPermitStats } from "@/lib/api/permits";

describe("permit api", () => {
  it("filters permits by search, city, zip code, and type", async () => {
    const all = await getPermits();
    const candidate = all[0];

    const filtered = await getPermits({
      search: candidate.address.split(" ")[0],
      city: candidate.city,
      zipCode: candidate.zipCode,
      type: candidate.permitType,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((permit) => permit.city === candidate.city)).toBe(true);
    expect(filtered.every((permit) => permit.zipCode === candidate.zipCode)).toBe(true);
    expect(filtered.every((permit) => permit.permitType === candidate.permitType)).toBe(true);
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
