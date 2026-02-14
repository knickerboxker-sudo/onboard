import { describe, expect, it } from "vitest";
import { getPermits, getPermitStats } from "@/lib/api/permits";

describe("permit api", () => {
  it("filters permits by search, city, and type", async () => {
    const all = await getPermits();
    const candidate = all[0];

    const filtered = await getPermits({
      search: candidate.address.split(" ")[0],
      city: candidate.city,
      type: candidate.permitType,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((permit) => permit.city === candidate.city)).toBe(true);
    expect(filtered.every((permit) => permit.permitType === candidate.permitType)).toBe(true);
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
