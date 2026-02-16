export type ContributionInput = {
  followers: number;
  emailList: number;
  dailyFootTraffic: number;
  distributionChannelStrength: number;
  productWholesaleValue: number;
  marketingEffort: number;
  exclusiveCategoryPartner: boolean;
  durationMonths: number;
};

export type EquityScenario = "equal" | "moderate" | "significant" | "major";

export type EquityAssessment = {
  businessAPercent: number;
  businessBPercent: number;
  scenario: EquityScenario;
  redFlag: boolean;
  suggestedStructures: string[];
  benchmark: string;
  successPredictor: string;
};

const scoreBusiness = (input: ContributionInput) => {
  const REACH_FOLLOWERS_WEIGHT = 0.0006;
  const REACH_EMAIL_WEIGHT = 0.0012;
  const REACH_FOOT_TRAFFIC_WEIGHT = 0.08;
  const DISTRIBUTION_WEIGHT = 15;
  const PRODUCT_VALUE_WEIGHT = 0.14;
  const MARKETING_WEIGHT = 12;
  const EXCLUSIVITY_BONUS = 28;
  const MAX_DURATION_MONTHS = 24;
  const DURATION_WEIGHT = 2.2;

  const reachScore =
    input.followers * REACH_FOLLOWERS_WEIGHT +
    input.emailList * REACH_EMAIL_WEIGHT +
    input.dailyFootTraffic * REACH_FOOT_TRAFFIC_WEIGHT;
  const distributionScore = input.distributionChannelStrength * DISTRIBUTION_WEIGHT;
  const productScore = input.productWholesaleValue * PRODUCT_VALUE_WEIGHT;
  const marketingScore = input.marketingEffort * MARKETING_WEIGHT;
  const exclusivityBonus = input.exclusiveCategoryPartner ? EXCLUSIVITY_BONUS : 0;
  const durationBonus = Math.min(input.durationMonths, MAX_DURATION_MONTHS) * DURATION_WEIGHT;
  return reachScore + distributionScore + productScore + marketingScore + exclusivityBonus + durationBonus;
};

const scenarioSuggestions: Record<EquityScenario, string[]> = {
  equal: [
    "Revenue split: 50/50 on bundled products and campaigns.",
    "Cross-promotion: equal social posts and in-store signage commitments.",
    "Shared KPI review every 30 days to keep the partnership balanced.",
  ],
  moderate: [
    "Tiered revenue split with stronger contributor taking lower take-rate on bundle revenue.",
    "Compensation offset through discounted product or waived placement fees.",
    "Document clear minimum marketing deliverables for both sides.",
  ],
  significant: [
    "Commission model where lower-contribution side pays performance-based access fees.",
    "Wholesale plus marketing fee structure for premium placement.",
    "Use milestone-based review checkpoints before extending terms.",
  ],
  major: [
    "Flat fee for access and distribution exposure.",
    "Consignment model with back-end revenue share after sales clear threshold.",
    "Trial period with reduced terms for first 30 days to validate fit.",
  ],
};

const benchmarkByScenario: Record<EquityScenario, string> = {
  equal: "Similar local category partnerships usually settle around 50/50 to 55/45 terms.",
  moderate: "Comparable bakery-coffee and retail-popup partnerships commonly land near 60/40.",
  significant: "Placement-driven collaborations in this range often use 70/30 terms plus support fees.",
  major: "High-leverage distribution deals typically require a platform fee plus protective trial clauses.",
};

const successPredictorByScenario: Record<EquityScenario, string> = {
  equal: "Estimated success predictor: 85% when both parties sustain equal activation effort.",
  moderate: "Estimated success predictor: 76% when compensation offsets are explicit.",
  significant: "Estimated success predictor: 64% with clear commission accounting and monthly reviews.",
  major: "Estimated success predictor: 51% unless trial outcomes and exit clauses are agreed early.",
};

export const assessPartnershipEquity = (
  businessA: ContributionInput,
  businessB: ContributionInput,
): EquityAssessment => {
  const scoreA = scoreBusiness(businessA);
  const scoreB = scoreBusiness(businessB);
  const total = scoreA + scoreB || 1;
  const businessAPercent = Math.round((scoreA / total) * 100);
  const businessBPercent = 100 - businessAPercent;
  const dominant = Math.max(businessAPercent, businessBPercent);
  const gap = Math.abs(businessAPercent - businessBPercent);

  const scenario: EquityScenario =
    dominant <= 55 ? "equal" : dominant <= 70 ? "moderate" : dominant <= 85 ? "significant" : "major";

  return {
    businessAPercent,
    businessBPercent,
    scenario,
    redFlag: gap >= 55,
    suggestedStructures: scenarioSuggestions[scenario],
    benchmark: benchmarkByScenario[scenario],
    successPredictor: successPredictorByScenario[scenario],
  };
};

export const fairnessCheck = (proposedSplitForA: number, equityForA: number) => {
  const delta = proposedSplitForA - equityForA;
  if (Math.abs(delta) <= 8) return "Proposed terms are closely aligned with contribution balance.";
  if (delta > 8) return "Business A appears over-allocated versus measured contribution. Consider rebalancing.";
  return "Business A appears under-allocated versus measured contribution. Consider compensation offsets.";
};

export const negotiationStarter = (equityForA: number, equityForB: number, scenario: EquityScenario) =>
  `Based on our Partnership Builder, a fair starting point is ${equityForA}/${equityForB}. Current scenario: ${scenario}. We can pair this with performance checkpoints and adjust terms after the first review period.`;
