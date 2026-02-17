export interface SuccessStory {
  id: string;
  businessA: string;
  businessB: string;
  partnershipType: string;
  revenueImpactPercent: number;
  testimonialQuote: string;
  timeframe: string;
  keyMetric: string;
}

// No success stories yet — will be populated after launch with real partner results
export const successStories: SuccessStory[] = [];
