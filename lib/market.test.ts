import { computeMetrics, percentileForExperience } from "@/lib/market";

describe("computeMetrics", () => {
  it("classifies declining markets deterministically", () => {
    const metrics = computeMetrics({
      projectedGrowthPct: -2,
      nationalProjectedGrowthPct: 3,
      currentEmployment: 500000,
      projectedChange: -10000,
      selectedWage: 50000,
      nationalWage: 52000,
      historicalWageStart: 40000,
      historicalWageEnd: 52000,
      inflationMultiplier: 1.2,
    });

    expect(metrics.marketSignal).toBe("Declining");
    expect(metrics.demandScore).toBeTypeOf("number");
    expect(metrics.saturationScore).toBeTypeOf("number");
  });

  it("maps experience to fixed wage percentiles", () => {
    expect(percentileForExperience("entry")).toBe("p10");
    expect(percentileForExperience("median")).toBe("p50");
    expect(percentileForExperience("senior")).toBe("p90");
  });
});
