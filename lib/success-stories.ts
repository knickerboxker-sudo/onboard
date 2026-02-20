export interface SuccessStory {
  id: string;
  businessA: string;
  businessB: string;
  partnershipType: string;
  revenueImpactPercent: number;
  testimonialQuote: string;
  timeframe: string;
  keyMetric: string;
  // Extended fields
  businessAType: string;
  businessBType: string;
  city: string;
  summary: string;
  result: string;
  quotedPerson: string;
}

export const successStories: SuccessStory[] = [];

