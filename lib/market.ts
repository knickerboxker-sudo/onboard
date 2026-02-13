export type ExperienceLevel = "entry" | "median" | "senior";

export type RawMarketInputs = {
  projectedGrowthPct: number;
  nationalProjectedGrowthPct: number;
  currentEmployment: number;
  projectedChange: number;
  selectedWage: number;
  nationalWage: number;
  historicalWageStart?: number;
  historicalWageEnd?: number;
  inflationMultiplier?: number;
};

export type DerivedMetrics = {
  demandScore: number;
  saturationScore: number;
  wageMomentum: number | null;
  regionalOpportunityDelta: number;
  marketSignal: "Undersupplied" | "Balanced" | "Oversupplied" | "Declining";
  confidence: "high" | "limited";
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function computeMetrics(input: RawMarketInputs): DerivedMetrics {
  const growthDiff = input.projectedGrowthPct - input.nationalProjectedGrowthPct;
  const demandScore = clamp(50 + growthDiff * 4, 0, 100);

  const growthToSize = input.currentEmployment > 0 ? (input.projectedChange / input.currentEmployment) * 100 : 0;
  const crowdPenalty = input.currentEmployment > 300_000 && input.projectedGrowthPct < input.nationalProjectedGrowthPct ? 15 : 0;
  const saturationScore = clamp(50 + growthToSize * 6 - crowdPenalty, 0, 100);

  const hasWageHistory =
    typeof input.historicalWageStart === "number" &&
    typeof input.historicalWageEnd === "number" &&
    typeof input.inflationMultiplier === "number";

  const adjustedBaseline = hasWageHistory ? input.historicalWageStart! * input.inflationMultiplier! : null;
  const wageMomentum = adjustedBaseline ? ((input.historicalWageEnd! - adjustedBaseline) / adjustedBaseline) * 100 : null;

  const regionalOpportunityDelta = input.selectedWage - input.nationalWage;

  let marketSignal: DerivedMetrics["marketSignal"] = "Balanced";
  if (input.projectedGrowthPct < 0) {
    marketSignal = "Declining";
  } else if (demandScore >= 60 && saturationScore >= 60) {
    marketSignal = "Undersupplied";
  } else if (demandScore <= 45 || saturationScore <= 40) {
    marketSignal = "Oversupplied";
  }

  return {
    demandScore: Number(demandScore.toFixed(1)),
    saturationScore: Number(saturationScore.toFixed(1)),
    wageMomentum: wageMomentum === null ? null : Number(wageMomentum.toFixed(1)),
    regionalOpportunityDelta: Number(regionalOpportunityDelta.toFixed(0)),
    marketSignal,
    confidence: wageMomentum === null ? "limited" : "high",
  };
}

export function percentileForExperience(level: ExperienceLevel): "p10" | "p50" | "p90" {
  if (level === "entry") return "p10";
  if (level === "senior") return "p90";
  return "p50";
}
