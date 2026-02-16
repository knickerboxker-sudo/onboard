import type { BusinessRecord, SwipeFilters, TrustBadge, TierLimits, SubscriptionTier, IcebreakerPrompt, PartnershipType, PartnershipTemplate, CollaborationIntent } from "@/lib/types";

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (value: number) => (value * Math.PI) / 180;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return EARTH_RADIUS_MILES * c;
}

export function buildMatchPair(businessA: string, businessB: string): [string, string] {
  return businessA < businessB ? [businessA, businessB] : [businessB, businessA];
}

export function filterBusinessesForSwipe(
  origin: BusinessRecord,
  candidates: BusinessRecord[],
  swipedBusinessIds: Set<string>,
  filters: SwipeFilters,
): Array<BusinessRecord & { distanceMiles: number | null }> {
  return candidates
    .filter((candidate) => candidate.id !== origin.id)
    .filter((candidate) => !swipedBusinessIds.has(candidate.id))
    .map((candidate) => {
      if (origin.lat == null || origin.lng == null || candidate.lat == null || candidate.lng == null) {
        return { ...candidate, distanceMiles: null };
      }
      return {
        ...candidate,
        distanceMiles: haversineMiles(origin.lat, origin.lng, candidate.lat, candidate.lng),
      };
    })
    .filter((candidate) => candidate.distanceMiles == null || candidate.distanceMiles <= filters.radiusMiles)
    .filter((candidate) => filters.categories.length === 0 || filters.categories.includes(candidate.business_type))
    .filter(
      (candidate) =>
        filters.partnershipTypes.length === 0 ||
        (candidate.partnership_types ?? []).some((type) => filters.partnershipTypes.includes(type)),
    )
    .sort((a, b) => {
      if (a.distanceMiles == null) return 1;
      if (b.distanceMiles == null) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
}

// --- Enhanced Matching: Complementarity Scoring ---

/** Known complementary business type pairs that score highly together. */
const COMPLEMENTARY_PAIRS: [string, string][] = [
  // Food & Beverage
  ["cafe", "bakery"],
  ["restaurant", "brewery"],
  ["restaurant", "winery"],
  ["restaurant", "farm"],
  ["coffee shop", "bakery"],
  ["coffee shop", "bookstore"],
  ["juice bar", "gym"],
  ["juice bar", "yoga studio"],
  ["ice cream shop", "candy store"],
  ["catering", "event planner"],
  ["food truck", "brewery"],
  // Health & Wellness
  ["gym", "juice bar"],
  ["gym", "supplement store"],
  ["gym", "physical therapy"],
  ["yoga studio", "health food store"],
  ["yoga studio", "meditation center"],
  ["salon", "spa"],
  ["salon", "nail studio"],
  ["spa", "hotel"],
  ["dentist", "orthodontist"],
  // Retail & Fashion
  ["clothing boutique", "jewelry store"],
  ["clothing boutique", "tailor"],
  ["shoe store", "clothing boutique"],
  ["vintage shop", "furniture store"],
  ["gift shop", "florist"],
  // Home & Services
  ["florist", "event planner"],
  ["florist", "wedding venue"],
  ["interior designer", "furniture store"],
  ["real estate", "mortgage broker"],
  ["real estate", "interior designer"],
  ["hardware store", "contractor"],
  ["landscaper", "garden center"],
  // Creative & Media
  ["photography studio", "event planner"],
  ["photography studio", "wedding venue"],
  ["graphic designer", "print shop"],
  ["web designer", "marketing agency"],
  ["music school", "instrument store"],
  ["art gallery", "frame shop"],
  // Kids & Family
  ["toy store", "children's clothing"],
  ["daycare", "pediatrician"],
  ["tutoring center", "bookstore"],
  // Pets
  ["pet store", "dog groomer"],
  ["pet store", "veterinarian"],
  ["dog groomer", "veterinarian"],
  // Professional
  ["accountant", "attorney"],
  ["coworking space", "coffee shop"],
  ["coworking space", "print shop"],
  // Auto
  ["auto repair", "car wash"],
  ["auto repair", "tire shop"],
  ["car dealership", "auto insurance"],
];

/** Complementary collaboration intent pairs that enhance partnership potential. */
const COMPLEMENTARY_INTENTS: [CollaborationIntent, CollaborationIntent][] = [
  ["sell", "promote"],
  ["supply", "sell"],
  ["co-brand", "co-brand"],
  ["promote", "refer"],
  ["supply", "co-brand"],
];

/**
 * Scores how complementary two sets of collaboration intents are.
 * Returns 0-30 bonus points for matching intent alignment.
 */
export function collaborationIntentScore(intentsA: string[], intentsB: string[]): number {
  if (intentsA.length === 0 || intentsB.length === 0) return 0;

  let matchCount = 0;
  for (const a of intentsA) {
    for (const b of intentsB) {
      const isMatch = COMPLEMENTARY_INTENTS.some(
        ([x, y]) => (a === x && b === y) || (a === y && b === x),
      );
      if (isMatch) matchCount++;
    }
  }

  return Math.min(matchCount * 10, 30);
}

/**
 * Scores how complementary two business types are.
 * Returns 0-100 where 100 = perfect complement, 0 = direct competitor.
 */
export function complementarityScore(typeA: string, typeB: string): number {
  const a = typeA.toLowerCase().trim();
  const b = typeB.toLowerCase().trim();

  // Direct competitors score low
  if (a === b) return 10;

  // Check known complementary pairs
  const isComplementary = COMPLEMENTARY_PAIRS.some(
    ([x, y]) => (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x)),
  );
  if (isComplementary) return 95;

  // Default moderate score for different types
  return 50;
}

/**
 * Analyze audience overlap between two businesses based on demographics.
 * Returns 0-100 where 100 = perfect overlap in target audience.
 */
export function audienceOverlapScore(businessA: BusinessRecord, businessB: BusinessRecord): number {
  let score = 50; // base score

  // Age range overlap
  const aMin = businessA.target_age_min ?? 18;
  const aMax = businessA.target_age_max ?? 65;
  const bMin = businessB.target_age_min ?? 18;
  const bMax = businessB.target_age_max ?? 65;
  const overlapStart = Math.max(aMin, bMin);
  const overlapEnd = Math.min(aMax, bMax);
  const totalRange = Math.max(aMax, bMax) - Math.min(aMin, bMin);
  if (totalRange > 0 && overlapEnd > overlapStart) {
    const overlap = (overlapEnd - overlapStart) / totalRange;
    score += overlap * 25;
  }

  // Income bracket match
  if (
    businessA.target_income_bracket &&
    businessB.target_income_bracket &&
    businessA.target_income_bracket === businessB.target_income_bracket
  ) {
    score += 15;
  }

  // Customer interests overlap
  const interestsA = new Set((businessA.customer_interests ?? []).map((i) => i.toLowerCase()));
  const interestsB = new Set((businessB.customer_interests ?? []).map((i) => i.toLowerCase()));
  if (interestsA.size > 0 && interestsB.size > 0) {
    const intersection = [...interestsA].filter((i) => interestsB.has(i)).length;
    const union = new Set([...interestsA, ...interestsB]).size;
    score += (intersection / union) * 10;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate a combined match quality score (0-100) for ranking candidates.
 */
export function matchQualityScore(
  origin: BusinessRecord,
  candidate: BusinessRecord,
  distanceMiles: number | null,
): number {
  const complementarity = complementarityScore(origin.business_type, candidate.business_type);
  const audienceOverlap = audienceOverlapScore(origin, candidate);
  const intentBonus = collaborationIntentScore(
    origin.collaboration_intents ?? [],
    candidate.collaboration_intents ?? [],
  );

  // Distance score (closer = higher)
  let distanceScore = 50;
  if (distanceMiles != null) {
    distanceScore = Math.max(0, 100 - distanceMiles * 2);
  }

  // Partnership history bonus
  const historyBonus = Math.min((candidate.successful_partnerships_count ?? 0) * 5, 20);

  // Verification trust bonus
  const verifiedBonus = candidate.verified ? 10 : 0;

  // Weighted combination
  return Math.min(
    Math.round(
      complementarity * 0.3 +
        audienceOverlap * 0.25 +
        distanceScore * 0.25 +
        historyBonus +
        verifiedBonus +
        intentBonus * 0.15,
    ),
    100,
  );
}

// --- Trust & Verification ---

/** Generate trust badges for a business based on its profile data. */
export function getTrustBadges(business: BusinessRecord): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (business.verified) {
    badges.push({
      type: "verified",
      label: "Verified Business",
      description: "Business registration and identity have been verified.",
    });
  }

  if (business.years_in_operation != null && business.years_in_operation >= 3) {
    badges.push({
      type: "established",
      label: `${business.years_in_operation}+ Years`,
      description: `Established business operating for ${business.years_in_operation} years.`,
    });
  }

  if ((business.successful_partnerships_count ?? 0) >= 5) {
    badges.push({
      type: "top_partner",
      label: "Top Partner",
      description: `Completed ${business.successful_partnerships_count} successful partnerships.`,
    });
  }

  if (business.avg_response_time_minutes != null && business.avg_response_time_minutes <= 120) {
    badges.push({
      type: "fast_responder",
      label: "Fast Responder",
      description: "Usually responds within 2 hours.",
    });
  }

  return badges;
}

// --- Subscription / Monetization ---

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    dailySwipes: 5,
    canSeeWhoLiked: false,
    prioritySearch: false,
    advancedAnalytics: false,
    partnershipTemplates: false,
    boostProfile: false,
  },
  pro: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: true,
    boostProfile: false,
  },
  premium: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: true,
    boostProfile: true,
  },
};

/** Check if a business can still swipe today based on their tier. */
export function canSwipe(business: BusinessRecord): boolean {
  const tier = business.subscription_tier ?? "free";
  const limits = TIER_LIMITS[tier];
  if (limits.dailySwipes === Infinity) return true;

  const today = new Date().toISOString().split("T")[0];
  const lastReset = business.last_swipe_reset_at?.split("T")[0] ?? "";
  if (lastReset !== today) return true; // reset hasn't happened yet, so count is 0

  return (business.daily_swipes_used ?? 0) < limits.dailySwipes;
}

// --- Engagement: Icebreaker Prompts ---

export const ICEBREAKER_PROMPTS: IcebreakerPrompt[] = [
  { id: "cp-1", partnershipType: "cross-promotion", prompt: "I love what you're doing with your brand. I think our customers would really enjoy discovering your products — want to explore a cross-promotion?" },
  { id: "cp-2", partnershipType: "cross-promotion", prompt: "We have a lot of foot traffic from a similar demographic. Would you be interested in swapping flyers or doing a social media shoutout exchange?" },
  { id: "pb-1", partnershipType: "product-bundle", prompt: "I think our products would pair really well together as a bundle. Have you ever done a joint offering with another local business?" },
  { id: "pb-2", partnershipType: "product-bundle", prompt: "I had an idea for a collaboration bundle — your [product] with our [product]. Want to brainstorm the details?" },
  { id: "ec-1", partnershipType: "event-collab", prompt: "We're planning a community event next month. Would you be interested in co-hosting or having a presence there?" },
  { id: "ec-2", partnershipType: "event-collab", prompt: "Pop-up events have been great for us. Want to team up for a joint event that brings both our customers together?" },
  { id: "ws-1", partnershipType: "wholesale", prompt: "I'd love to carry some of your products in our store. What does your wholesale pricing look like?" },
  { id: "ws-2", partnershipType: "wholesale", prompt: "We're always looking for quality local products to stock. Would you be open to a consignment or wholesale arrangement?" },
  { id: "sm-1", partnershipType: "social-media-collab", prompt: "I really enjoy your social media content! Would you be open to doing a joint Instagram Live or collaborative post series?" },
  { id: "sm-2", partnershipType: "social-media-collab", prompt: "We're growing our social presence and I think a collab could benefit both of us. Want to plan some content together?" },
];

/** Get relevant icebreaker prompts for overlapping partnership types. */
export function getIcebreakers(originTypes: string[], candidateTypes: string[]): IcebreakerPrompt[] {
  const overlap = originTypes.filter((t) => candidateTypes.includes(t));
  const types = overlap.length > 0 ? overlap : originTypes;
  return ICEBREAKER_PROMPTS.filter((p) => types.includes(p.partnershipType));
}

/**
 * Generate a contextual icebreaker prompt based on two businesses' types.
 * Returns a personalized suggestion when possible, or null otherwise.
 */
export function getContextualIcebreaker(
  originType: string,
  candidateType: string,
  candidateName: string,
): string | null {
  const a = originType.toLowerCase().trim();
  const b = candidateType.toLowerCase().trim();

  const isComplementary = COMPLEMENTARY_PAIRS.some(
    ([x, y]) => (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x)),
  );

  if (!isComplementary) return null;

  const templates = [
    `I think ${a} and ${b} make a perfect pairing! Would ${candidateName} be interested in exploring a partnership?`,
    `Our ${a} customers would love what you offer at ${candidateName}. Want to brainstorm a collaboration?`,
    `I've been thinking about how a ${a} × ${b} partnership could benefit our shared audience. Interested in chatting?`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// --- Post-Match: Partnership Templates ---

export const PARTNERSHIP_TEMPLATES: PartnershipTemplate[] = [
  {
    id: "consignment",
    name: "Consignment Agreement",
    type: "wholesale",
    description: "Partner provides products on consignment — payment after sale, unsold items returned.",
    terms: [
      "Products provided on consignment basis",
      "Payment within 30 days of sale",
      "Unsold inventory returned after agreed period",
      "Minimum display/shelf space guaranteed",
    ],
    suggestedSplit: "60/40 (product provider / retailer)",
  },
  {
    id: "commission-split",
    name: "Commission Split",
    type: "cross-promotion",
    description: "Revenue share on referred customers. Each side earns commission on sales driven by the other.",
    terms: [
      "Track referrals via unique codes or links",
      "Commission paid monthly on verified referrals",
      "Minimum 90-day trial period",
      "Monthly performance review",
    ],
    suggestedSplit: "10-20% commission per referral",
  },
  {
    id: "cross-promo",
    name: "Cross-Promotion Agreement",
    type: "cross-promotion",
    description: "Mutual marketing exchange — each side promotes the other through their channels.",
    terms: [
      "Equal number of social media posts per month",
      "In-store signage and flyer exchange",
      "Email newsletter features (1x per month each)",
      "Quarterly review of reach and engagement metrics",
    ],
    suggestedSplit: "50/50 equal effort",
  },
  {
    id: "event-collab",
    name: "Event Collaboration",
    type: "event-collab",
    description: "Joint event hosting with shared costs, responsibilities, and revenue.",
    terms: [
      "Costs split proportionally based on contribution",
      "Joint marketing and promotion responsibilities",
      "Revenue from ticket sales or vendors split equally",
      "Post-event debrief and ROI review",
    ],
    suggestedSplit: "50/50 or proportional to contribution",
  },
  {
    id: "product-bundle",
    name: "Product Bundle Partnership",
    type: "product-bundle",
    description: "Create a joint product or service bundle combining offerings from both businesses.",
    terms: [
      "Bundle pricing agreed upon jointly",
      "Each business provides their product at wholesale cost",
      "Marketing costs shared equally",
      "Revenue split based on wholesale cost ratio",
    ],
    suggestedSplit: "Based on wholesale cost contribution",
  },
  {
    id: "social-collab",
    name: "Social Media Collaboration",
    type: "social-media-collab",
    description: "Structured social media content partnership — joint lives, takeovers, and content series.",
    terms: [
      "Agreed content calendar with posting schedule",
      "Cross-tagging and story sharing requirements",
      "Minimum engagement benchmarks",
      "30-day trial with option to extend",
    ],
    suggestedSplit: "50/50 equal content contribution",
  },
];

/** Get templates relevant to a specific partnership type. */
export function getTemplatesForType(type: string): PartnershipTemplate[] {
  return PARTNERSHIP_TEMPLATES.filter((t) => t.type === type);
}

// --- ROI Calculator ---

export type ROIInput = {
  revenueGenerated: number;
  customersAcquired: number;
  timeInvestedHours: number;
  marketingSpend: number;
  partnershipDurationMonths: number;
  hourlyRate?: number;
};

export type ROIResult = {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  revenuePerMonth: number;
  costPerCustomer: number;
  verdict: string;
};

/** Calculate ROI for a partnership. */
export function calculatePartnershipROI(input: ROIInput): ROIResult {
  const hourlyRate = input.hourlyRate ?? 50;
  const totalCost = input.marketingSpend + input.timeInvestedHours * hourlyRate;
  const netProfit = input.revenueGenerated - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const revenuePerMonth =
    input.partnershipDurationMonths > 0
      ? input.revenueGenerated / input.partnershipDurationMonths
      : input.revenueGenerated;
  const costPerCustomer =
    input.customersAcquired > 0 ? totalCost / input.customersAcquired : 0;

  let verdict: string;
  if (roi >= 200) verdict = "Exceptional ROI — this partnership is a strong revenue driver.";
  else if (roi >= 100) verdict = "Great ROI — the partnership is clearly profitable.";
  else if (roi >= 50) verdict = "Good ROI — positive returns with room to optimize.";
  else if (roi >= 0) verdict = "Break-even — consider ways to increase revenue or reduce costs.";
  else verdict = "Negative ROI — review partnership terms or consider restructuring.";

  return {
    totalRevenue: input.revenueGenerated,
    totalCost: Math.round(totalCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    revenuePerMonth: Math.round(revenuePerMonth * 100) / 100,
    costPerCustomer: Math.round(costPerCustomer * 100) / 100,
    verdict,
  };
}
