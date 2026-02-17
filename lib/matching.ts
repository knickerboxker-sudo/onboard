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
    dailySwipes: 3,
    canSeeWhoLiked: false,
    canSeeProfileViews: 0,
    prioritySearch: false,
    advancedAnalytics: false,
    partnershipTemplates: 2,
    exportData: false,
    removeBranding: false,
  },
  starter: {
    dailySwipes: 15,
    canSeeWhoLiked: false,
    canSeeProfileViews: 10,
    prioritySearch: false,
    advancedAnalytics: false,
    partnershipTemplates: 5,
    exportData: true,
    removeBranding: true,
  },
  professional: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    canSeeProfileViews: Infinity,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: Infinity,
    exportData: true,
    removeBranding: true,
  },
  business: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    canSeeProfileViews: Infinity,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: Infinity,
    exportData: true,
    removeBranding: true,
    boostProfile: true,
    featuredInDiscovery: true,
    dedicatedSupport: true,
  },
  // Legacy tier aliases (backward compatibility)
  pro: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: Infinity,
    boostProfile: false,
  },
  premium: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    prioritySearch: true,
    advancedAnalytics: true,
    partnershipTemplates: Infinity,
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

// --- Profile Completion ---

/** Calculate profile completion percentage for a business. */
export function calculateProfileCompletion(business: BusinessRecord): number {
  const checks = [
    !!business.name,
    !!business.business_type,
    !!business.address,
    !!business.description,
    (business.products ?? []).length > 0,
    (business.partnership_types ?? []).length > 0,
    (business.collaboration_intents ?? []).length > 0,
    (business.photos ?? []).length > 0,
    !!business.website,
    (business.social_links ?? []).length > 0,
    !!business.follower_count,
    !!business.monthly_foot_traffic,
    !!business.years_in_operation,
    !!business.operating_hours,
    (business.looking_for ?? []).length > 0,
    (business.can_offer ?? []).length > 0,
    (business.partnership_interest_tags ?? []).length > 0,
    !!business.business_story,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

// --- Partnership Idea Examples ---

export type PartnershipIdeaCategory =
  | "Food & Beverage"
  | "Retail"
  | "Services"
  | "Health & Wellness"
  | "Arts & Entertainment"
  | "Professional Services";

export type PartnershipIdea = {
  id: string;
  category: PartnershipIdeaCategory;
  businessA: string;
  businessB: string;
  idea: string;
  description: string;
};

export const PARTNERSHIP_IDEAS: PartnershipIdea[] = [
  // Food & Beverage
  { id: "fb-1", category: "Food & Beverage", businessA: "Gym", businessB: "Meal Prep Service", idea: "Member nutrition package", description: "Gym offers discounted meal prep plans to members, meal prep service gets consistent bulk orders." },
  { id: "fb-2", category: "Food & Beverage", businessA: "Brewery", businessB: "Food Truck", idea: "Weekend food & beer pairing events", description: "Brewery hosts food truck weekends, splitting event promotion and attracting each other's audiences." },
  { id: "fb-3", category: "Food & Beverage", businessA: "Coffee Shop", businessB: "Bakery", idea: "Fresh pastry supply partnership", description: "Bakery supplies fresh pastries daily, coffee shop gets unique offerings without a kitchen." },
  { id: "fb-4", category: "Food & Beverage", businessA: "Restaurant", businessB: "Local Farm", idea: "Farm-to-table menu feature", description: "Restaurant features locally-sourced ingredients, farm gets reliable wholesale buyer and brand exposure." },
  // Retail
  { id: "rt-1", category: "Retail", businessA: "Bookstore", businessB: "Coffee Shop", idea: "Reading events with refreshments", description: "Monthly book club events with coffee pairings, driving foot traffic to both businesses." },
  { id: "rt-2", category: "Retail", businessA: "Boutique", businessB: "Jewelry Store", idea: "Complete outfit styling packages", description: "Joint styling sessions where customers get a complete look from head to accessories." },
  { id: "rt-3", category: "Retail", businessA: "Gift Shop", businessB: "Florist", idea: "Custom gift bundles", description: "Pre-made gift bundles combining unique gifts with fresh flower arrangements." },
  { id: "rt-4", category: "Retail", businessA: "Pet Store", businessB: "Dog Groomer", idea: "New pet welcome package", description: "Pet store refers new pet owners for grooming, groomer recommends products from the store." },
  // Services
  { id: "sv-1", category: "Services", businessA: "Auto Shop", businessB: "Car Wash", idea: "Full service maintenance deal", description: "Customers get a free car wash with every service, car wash refers customers needing repairs." },
  { id: "sv-2", category: "Services", businessA: "Real Estate Agent", businessB: "Interior Designer", idea: "Move-in makeover package", description: "New homeowners get a discounted design consultation, designer gets a steady referral pipeline." },
  { id: "sv-3", category: "Services", businessA: "Landscaper", businessB: "Garden Center", idea: "Design & plant package", description: "Landscaper designs and installs, garden center supplies plants at wholesale with brand signage." },
  { id: "sv-4", category: "Services", businessA: "Photography Studio", businessB: "Event Planner", idea: "Event media package", description: "Bundled photography and event planning for weddings, corporate events, and celebrations." },
  // Health & Wellness
  { id: "hw-1", category: "Health & Wellness", businessA: "Salon", businessB: "Boutique", idea: "Style makeover packages", description: "Complete transformation packages — new hair, new outfit — promoted as the ultimate self-care day." },
  { id: "hw-2", category: "Health & Wellness", businessA: "Yoga Studio", businessB: "Juice Bar", idea: "Post-class refresh deal", description: "Yoga members get a discount at the juice bar, juice bar promotes class schedules." },
  { id: "hw-3", category: "Health & Wellness", businessA: "Spa", businessB: "Hotel", idea: "Guest relaxation package", description: "Hotel guests get discounted spa treatments, spa gets consistent bookings from travelers." },
  { id: "hw-4", category: "Health & Wellness", businessA: "Dentist", businessB: "Orthodontist", idea: "Smile transformation referrals", description: "Cross-referral system where general dental care and orthodontic needs are seamlessly connected." },
  // Arts & Entertainment
  { id: "ae-1", category: "Arts & Entertainment", businessA: "Art Gallery", businessB: "Wine Bar", idea: "Art & wine evening events", description: "Monthly art opening nights with wine pairings, attracting culture-loving audiences." },
  { id: "ae-2", category: "Arts & Entertainment", businessA: "Music School", businessB: "Instrument Store", idea: "Learn & play starter bundle", description: "New students get a discount on their first instrument, store refers aspiring musicians to lessons." },
  { id: "ae-3", category: "Arts & Entertainment", businessA: "Theater", businessB: "Restaurant", idea: "Dinner & show package", description: "Pre-show dinner deals that drive traffic to both venues on performance nights." },
  { id: "ae-4", category: "Arts & Entertainment", businessA: "Craft Studio", businessB: "Party Venue", idea: "Creative celebration packages", description: "Birthday parties and team events that combine crafting activities with venue rental." },
  // Professional Services
  { id: "ps-1", category: "Professional Services", businessA: "Accountant", businessB: "Attorney", idea: "Business startup bundle", description: "New businesses get legal formation and accounting setup as a discounted package." },
  { id: "ps-2", category: "Professional Services", businessA: "Coworking Space", businessB: "Coffee Shop", idea: "Workspace & caffeine membership", description: "Coworking members get coffee credits, coffee shop gets a steady professional crowd." },
  { id: "ps-3", category: "Professional Services", businessA: "Marketing Agency", businessB: "Web Designer", idea: "Full digital presence package", description: "Complete branding, website, and marketing strategy offered as a single service." },
  { id: "ps-4", category: "Professional Services", businessA: "Print Shop", businessB: "Graphic Designer", idea: "Design-to-print pipeline", description: "Designer handles creative, print shop handles production — seamless client handoff." },
];

/** Get partnership ideas filtered by category. */
export function getPartnershipIdeasByCategory(category?: PartnershipIdeaCategory): PartnershipIdea[] {
  if (!category) return PARTNERSHIP_IDEAS;
  return PARTNERSHIP_IDEAS.filter((idea) => idea.category === category);
}

// --- Proposal Templates ---

export type ProposalTemplate = {
  id: string;
  title: string;
  partnershipType: string;
  description: string;
  terms: string[];
  nextSteps: string[];
};

export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: "pt-event",
    title: "Event Collaboration Proposal",
    partnershipType: "event-collab",
    description: "A proposal for co-hosting an event that brings together both businesses' audiences for a shared experience.",
    terms: [
      "Both parties share event costs equally (venue, marketing, supplies)",
      "Revenue from ticket sales or vendor fees split 50/50",
      "Each party promotes the event through their channels",
      "Post-event debrief within 1 week to review results",
    ],
    nextSteps: [
      "Agree on event date, location, and theme",
      "Create a shared budget and responsibility matrix",
      "Design joint marketing materials",
      "Set success metrics (attendance, revenue, new customers)",
    ],
  },
  {
    id: "pt-cross-promo",
    title: "Cross-Promotion Proposal",
    partnershipType: "cross-promotion",
    description: "A mutual marketing agreement where both businesses promote each other through their respective channels.",
    terms: [
      "Each party posts about the other at least 2x per month on social media",
      "In-store signage and flyer display at each location",
      "Monthly email newsletter feature for each other",
      "90-day trial period with option to extend",
    ],
    nextSteps: [
      "Exchange brand guidelines and approved messaging",
      "Create a shared content calendar",
      "Set up tracking for referral metrics",
      "Schedule monthly check-in calls",
    ],
  },
  {
    id: "pt-product-placement",
    title: "Product Placement Proposal",
    partnershipType: "product-bundle",
    description: "An arrangement for one business to display and sell another business's products in their space.",
    terms: [
      "Products provided at wholesale cost with agreed markup",
      "Minimum shelf/display space of [X] square feet",
      "Monthly sales reporting and payment within 30 days",
      "Unsold inventory returned or discounted after 60 days",
    ],
    nextSteps: [
      "Select initial product assortment",
      "Agree on pricing and margin structure",
      "Set up display and point-of-sale materials",
      "Schedule first inventory review after 30 days",
    ],
  },
  {
    id: "pt-revenue-share",
    title: "Revenue Share Agreement",
    partnershipType: "wholesale",
    description: "A partnership where both businesses share revenue generated from collaborative activities.",
    terms: [
      "Revenue split of [X]% / [Y]% based on contribution assessment",
      "Monthly revenue reporting with transparent accounting",
      "Minimum 6-month commitment with quarterly reviews",
      "Either party can exit with 30 days written notice",
    ],
    nextSteps: [
      "Complete equity assessment using Partnership Builder",
      "Draft formal agreement with legal review",
      "Set up shared tracking for revenue attribution",
      "Define KPIs and success benchmarks",
    ],
  },
  {
    id: "pt-referral",
    title: "Referral Partnership Proposal",
    partnershipType: "cross-promotion",
    description: "A structured referral program where businesses recommend each other's services to their customers.",
    terms: [
      "Commission of [X]% on referred customer's first purchase",
      "Unique referral codes or tracking links provided",
      "Monthly payout of earned commissions",
      "Quarterly review of referral quality and volume",
    ],
    nextSteps: [
      "Set up referral tracking system (codes or links)",
      "Train staff on partner's offerings and referral process",
      "Create referral materials (cards, digital assets)",
      "Establish monthly reporting cadence",
    ],
  },
];

// --- Retention Feature 1: Partnership Insights Engine ---

export type PartnershipInsightType =
  | "top_type"
  | "revenue_trend"
  | "dormant_alert"
  | "milestone_suggestion"
  | "diversify"
  | "high_performer"
  | "growth_opportunity";

export type PartnershipInsight = {
  type: PartnershipInsightType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionLabel?: string;
  actionHref?: string;
};

export type PartnershipDataForInsights = {
  partnership_type: string;
  status: string;
  revenue_generated: number;
  customers_acquired: number;
  start_date: string;
  end_date: string | null;
};

/**
 * Analyze a business's partnership history and produce actionable insights
 * that encourage return visits and deeper platform engagement.
 */
export function generatePartnershipInsights(
  partnerships: PartnershipDataForInsights[],
  now: Date = new Date(),
): PartnershipInsight[] {
  const insights: PartnershipInsight[] = [];

  if (partnerships.length === 0) {
    insights.push({
      type: "growth_opportunity",
      title: "Start your first partnership",
      description: "Businesses with at least one active partnership see 40% more profile views. Start swiping to find your perfect match!",
      priority: "high",
      actionLabel: "Find Partners",
      actionHref: "/swipe",
    });
    return insights;
  }

  // --- Top performing partnership type ---
  const revenueByType: Record<string, number> = {};
  const countByType: Record<string, number> = {};
  for (const p of partnerships) {
    revenueByType[p.partnership_type] = (revenueByType[p.partnership_type] || 0) + (Number(p.revenue_generated) || 0);
    countByType[p.partnership_type] = (countByType[p.partnership_type] || 0) + 1;
  }

  const sortedTypes = Object.entries(revenueByType).sort((a, b) => b[1] - a[1]);
  if (sortedTypes.length >= 2 && sortedTypes[0][1] > 0) {
    const topType = sortedTypes[0][0];
    const topRevenue = sortedTypes[0][1];
    const secondRevenue = sortedTypes[1][1] || 1;
    const multiplier = Math.round((topRevenue / secondRevenue) * 10) / 10;
    if (multiplier >= 1.5) {
      insights.push({
        type: "top_type",
        title: `${topType} is your revenue powerhouse`,
        description: `Your ${topType} partnerships generate ${multiplier}x more revenue than your next best type. Consider doubling down on this category.`,
        priority: "high",
        actionLabel: "Find More Partners",
        actionHref: "/swipe",
      });
    }
  }

  // --- Revenue trend (recent vs older) ---
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 90);
  const recent = partnerships.filter((p) => new Date(p.start_date) >= cutoff);
  const older = partnerships.filter((p) => new Date(p.start_date) < cutoff);

  if (recent.length > 0 && older.length > 0) {
    const recentAvg = recent.reduce((s, p) => s + (Number(p.revenue_generated) || 0), 0) / recent.length;
    const olderAvg = older.reduce((s, p) => s + (Number(p.revenue_generated) || 0), 0) / older.length;

    if (olderAvg > 0) {
      const changePercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      if (changePercent > 20) {
        insights.push({
          type: "revenue_trend",
          title: "Revenue per partnership is growing",
          description: `Your recent partnerships earn ${changePercent}% more on average than earlier ones. Your strategy is working!`,
          priority: "medium",
        });
      } else if (changePercent < -20) {
        insights.push({
          type: "revenue_trend",
          title: "Revenue per partnership is declining",
          description: `Recent partnerships are earning ${Math.abs(changePercent)}% less on average. Review your partnership terms or try a different partnership type.`,
          priority: "high",
          actionLabel: "Partnership Builder",
          actionHref: "/partnership-builder",
        });
      }
    }
  }

  // --- Dormant alert (no new partnerships recently) ---
  const latestStartDate = partnerships.reduce((latest, p) => {
    const d = new Date(p.start_date);
    return d > latest ? d : latest;
  }, new Date(0));
  const daysSinceLast = Math.floor((now.getTime() - latestStartDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLast > 30) {
    insights.push({
      type: "dormant_alert",
      title: `${daysSinceLast} days since your last partnership`,
      description: "Staying active helps you appear in more searches. Swipe through new businesses to keep your momentum going.",
      priority: "high",
      actionLabel: "Discover Partners",
      actionHref: "/swipe",
    });
  }

  // --- Diversify suggestion ---
  const typeKeys = Object.keys(countByType);
  if (typeKeys.length === 1 && partnerships.length >= 2) {
    insights.push({
      type: "diversify",
      title: "Diversify your partnership types",
      description: `All ${partnerships.length} of your partnerships are ${typeKeys[0]}. Businesses with diverse partnership types report 25% higher overall satisfaction.`,
      priority: "medium",
      actionLabel: "Explore Ideas",
      actionHref: "/partnership-ideas",
    });
  }

  // --- High performer shoutout ---
  const highPerformers = partnerships.filter(
    (p) => p.status === "active" && (Number(p.revenue_generated) || 0) > 0 && (Number(p.customers_acquired) || 0) > 0,
  );
  if (highPerformers.length > 0) {
    const best = highPerformers.sort(
      (a, b) => (Number(b.revenue_generated) || 0) - (Number(a.revenue_generated) || 0),
    )[0];
    insights.push({
      type: "high_performer",
      title: "You have a star partnership",
      description: `Your top active partnership has generated $${Number(best.revenue_generated).toLocaleString()} in revenue and acquired ${best.customers_acquired} customers. Keep it going!`,
      priority: "low",
    });
  }

  // --- Milestone suggestion for active partnerships ---
  const activeCount = partnerships.filter((p) => p.status === "active").length;
  if (activeCount > 0) {
    insights.push({
      type: "milestone_suggestion",
      title: "Set milestones for your active partnerships",
      description: `You have ${activeCount} active partnership${activeCount > 1 ? "s" : ""}. Setting milestones helps track progress and celebrate wins together.`,
      priority: "medium",
      actionLabel: "View Partnerships",
      actionHref: "/partnerships",
    });
  }

  return insights.sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// --- Retention Feature 2: Activity Feed ---

export type ActivityFeedItemType =
  | "partnership_started"
  | "partnership_completed"
  | "partnership_paused"
  | "revenue_milestone"
  | "customer_milestone"
  | "new_match"
  | "message_received";

export type ActivityFeedItem = {
  id: string;
  type: ActivityFeedItemType;
  title: string;
  description: string;
  timestamp: string;
  icon: ActivityFeedItemType;
  actionHref?: string;
};

export type RawActivityData = {
  partnerships: Array<{
    id: string;
    partnership_type: string;
    status: string;
    revenue_generated: number;
    customers_acquired: number;
    start_date: string;
    end_date: string | null;
    updated_at?: string;
  }>;
  matches: Array<{
    id: string;
    created_at: string;
  }>;
  recentMessages: Array<{
    id: string;
    match_id: string;
    content: string;
    created_at: string;
    sender_name?: string;
  }>;
};

/**
 * Build a chronological activity feed from raw partnership, match, and message data.
 * Creates a "home feed" experience that encourages daily visits.
 */
export function buildActivityFeed(
  data: RawActivityData,
  limit: number = 20,
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  // Partnership events
  for (const p of data.partnerships) {
    const revenue = Number(p.revenue_generated) || 0;
    const customers = Number(p.customers_acquired) || 0;

    if (p.status === "active") {
      items.push({
        id: `p-started-${p.id}`,
        type: "partnership_started",
        title: "Partnership started",
        description: `Your ${p.partnership_type} partnership is now active.`,
        timestamp: p.start_date,
        icon: "partnership_started",
        actionHref: "/partnerships",
      });
    }

    if (p.status === "completed" && p.end_date) {
      items.push({
        id: `p-completed-${p.id}`,
        type: "partnership_completed",
        title: "Partnership completed",
        description: `Your ${p.partnership_type} partnership wrapped up${revenue > 0 ? ` with $${revenue.toLocaleString()} in revenue` : ""}.`,
        timestamp: p.end_date,
        icon: "partnership_completed",
        actionHref: "/partnerships",
      });
    }

    if (p.status === "paused" && p.updated_at) {
      items.push({
        id: `p-paused-${p.id}`,
        type: "partnership_paused",
        title: "Partnership paused",
        description: `Your ${p.partnership_type} partnership has been paused.`,
        timestamp: p.updated_at,
        icon: "partnership_paused",
        actionHref: "/partnerships",
      });
    }

    // Revenue milestones
    if (revenue >= 1000) {
      const milestoneAmount = Math.floor(revenue / 1000) * 1000;
      items.push({
        id: `rev-${p.id}-${milestoneAmount}`,
        type: "revenue_milestone",
        title: `$${milestoneAmount.toLocaleString()} revenue milestone`,
        description: `Your ${p.partnership_type} partnership crossed $${milestoneAmount.toLocaleString()} in total revenue!`,
        timestamp: p.updated_at ?? p.start_date,
        icon: "revenue_milestone",
        actionHref: "/partnerships",
      });
    }

    // Customer milestones
    if (customers >= 10) {
      const milestoneCount = Math.floor(customers / 10) * 10;
      items.push({
        id: `cust-${p.id}-${milestoneCount}`,
        type: "customer_milestone",
        title: `${milestoneCount} customers acquired`,
        description: `Your ${p.partnership_type} partnership has brought in ${milestoneCount}+ new customers.`,
        timestamp: p.updated_at ?? p.start_date,
        icon: "customer_milestone",
        actionHref: "/partnerships",
      });
    }
  }

  // Match events
  for (const m of data.matches) {
    items.push({
      id: `match-${m.id}`,
      type: "new_match",
      title: "New match!",
      description: "You have a new business match. Start a conversation to explore partnership opportunities.",
      timestamp: m.created_at,
      icon: "new_match",
      actionHref: "/messages",
    });
  }

  // Message events
  for (const msg of data.recentMessages) {
    items.push({
      id: `msg-${msg.id}`,
      type: "message_received",
      title: msg.sender_name ? `Message from ${msg.sender_name}` : "New message",
      description: msg.content.length > 80 ? msg.content.slice(0, 77) + "…" : msg.content,
      timestamp: msg.created_at,
      icon: "message_received",
      actionHref: `/messages`,
    });
  }

  // Sort by timestamp descending (newest first) and limit
  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
