import { computeMetrics, ExperienceLevel, percentileForExperience } from "@/lib/market";

type WageSet = { p10: number; p25: number; p50: number; p75: number; p90: number };
type GeographyKey = "national" | "state-ca" | "metro-nyc";

const OCCUPATIONS = [
  { soc: "15-1252", title: "Software Developers" },
  { soc: "29-1141", title: "Registered Nurses" },
  { soc: "43-4051", title: "Customer Service Representatives" },
] as const;

const SNAPSHOT = {
  source: "BLS",
  updated: {
    oews: "2025-05-01",
    projections: "2025-08-01",
    historical: "2025-05-01",
  },
  nationalAverageGrowthPct: 2.8,
  records: {
    "15-1252": {
      currentEmployment: 1634000,
      projectedGrowthPct: 17.9,
      projectedChange: 292900,
      historicalWageStart: 105590,
      historicalWageEnd: 138110,
      inflationMultiplier: 1.18,
      wages: {
        national: { p10: 79340, p25: 100120, p50: 138110, p75: 168370, p90: 208620 },
        "state-ca": { p10: 98000, p25: 129500, p50: 173780, p75: 210450, p90: 244000 },
        "metro-nyc": { p10: 92000, p25: 120400, p50: 161700, p75: 197500, p90: 231800 },
      } satisfies Record<GeographyKey | "national", WageSet>,
    },
    "29-1141": {
      currentEmployment: 3172000,
      projectedGrowthPct: 5.6,
      projectedChange: 177400,
      historicalWageStart: 70820,
      historicalWageEnd: 86070,
      inflationMultiplier: 1.18,
      wages: {
        national: { p10: 64750, p25: 75100, p50: 86070, p75: 103990, p90: 132680 },
        "state-ca": { p10: 89960, p25: 110230, p50: 133340, p75: 157890, p90: 191450 },
        "metro-nyc": { p10: 88100, p25: 106800, p50: 124230, p75: 149000, p90: 179900 },
      } satisfies Record<GeographyKey | "national", WageSet>,
    },
    "43-4051": {
      currentEmployment: 2892000,
      projectedGrowthPct: -5.0,
      projectedChange: -145600,
      historicalWageStart: 36110,
      historicalWageEnd: 43200,
      inflationMultiplier: 1.18,
      wages: {
        national: { p10: 29960, p25: 35220, p50: 43200, p75: 54530, p90: 69990 },
        "state-ca": { p10: 35020, p25: 41250, p50: 50300, p75: 63340, p90: 80310 },
        "metro-nyc": { p10: 33600, p25: 40120, p50: 48210, p75: 61000, p90: 78900 },
      } satisfies Record<GeographyKey | "national", WageSet>,
    },
  } as const,
};

export type AnalyzeRequest = {
  occupation: string;
  geography: GeographyKey;
  experience: ExperienceLevel;
};

const normalize = (value: string) => value.toLowerCase().trim();

export function findOccupation(query: string) {
  const q = normalize(query);
  const exact = OCCUPATIONS.find((item) => item.soc === query || normalize(item.title) === q);
  if (exact) return exact;
  return OCCUPATIONS.find((item) => normalize(item.title).includes(q));
}

export function analyzeMarket(input: AnalyzeRequest) {
  const occupation = findOccupation(input.occupation);
  if (!occupation) {
    return { error: "Occupation not found in current BLS SOC mapping.", options: OCCUPATIONS };
  }

  const record = SNAPSHOT.records[occupation.soc as keyof typeof SNAPSHOT.records];
  const percentile = percentileForExperience(input.experience);
  const selectedWage = record.wages[input.geography][percentile];
  const nationalWage = record.wages.national[percentile];

  const metrics = computeMetrics({
    projectedGrowthPct: record.projectedGrowthPct,
    nationalProjectedGrowthPct: SNAPSHOT.nationalAverageGrowthPct,
    currentEmployment: record.currentEmployment,
    projectedChange: record.projectedChange,
    selectedWage,
    nationalWage,
    historicalWageStart: record.historicalWageStart,
    historicalWageEnd: record.historicalWageEnd,
    inflationMultiplier: record.inflationMultiplier,
  });

  const limitations: string[] = [];
  if (metrics.confidence === "limited") {
    limitations.push("Historical wage series was insufficient for a full inflation-adjusted trend comparison.");
  }

  return {
    source: SNAPSHOT.source,
    updated: SNAPSHOT.updated,
    occupation,
    geography: input.geography,
    experience: input.experience,
    percentile,
    selectedWage,
    nationalWage,
    currentEmployment: record.currentEmployment,
    projectedGrowthPct: record.projectedGrowthPct,
    projectedChange: record.projectedChange,
    nationalAverageGrowthPct: SNAPSHOT.nationalAverageGrowthPct,
    metrics,
    limitations,
  };
}

export const occupationOptions = OCCUPATIONS;
