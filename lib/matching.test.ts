import {
  buildMatchPair,
  filterBusinessesForSwipe,
  haversineMiles,
  complementarityScore,
  audienceOverlapScore,
  matchQualityScore,
  getTrustBadges,
  canSwipe,
  getIcebreakers,
  getTemplatesForType,
  calculatePartnershipROI,
  TIER_LIMITS,
  PARTNERSHIP_TEMPLATES,
  ICEBREAKER_PROMPTS,
} from "@/lib/matching";
import type { BusinessRecord, SwipeFilters } from "@/lib/types";

const origin: BusinessRecord = {
  id: "a",
  owner_id: "owner-a",
  name: "Origin",
  description: "",
  business_type: "Cafe",
  address: "A",
  lat: 40.7128,
  lng: -74.006,
  photos: [],
  products: [],
  partnership_types: ["cross-promotion"],
};

const filters: SwipeFilters = {
  radiusMiles: 10,
  categories: [],
  partnershipTypes: [],
};

describe("matching helpers", () => {
  it("calculates haversine distance in miles", () => {
    const miles = haversineMiles(40.7128, -74.006, 40.73061, -73.935242);
    expect(miles).toBeGreaterThan(3);
    expect(miles).toBeLessThan(5);
  });

  it("normalizes match pair ordering", () => {
    expect(buildMatchPair("zz", "aa")).toEqual(["aa", "zz"]);
  });

  it("filters swiped businesses and radius", () => {
    const nearby: BusinessRecord = {
      id: "nearby",
      owner_id: "owner-b",
      name: "Nearby",
      description: "",
      business_type: "Bakery",
      address: "B",
      lat: 40.73061,
      lng: -73.935242,
      photos: [],
      products: [],
      partnership_types: ["event-collab"],
    };

    const far: BusinessRecord = {
      ...nearby,
      id: "far",
      lat: 34.0522,
      lng: -118.2437,
    };

    const result = filterBusinessesForSwipe(origin, [nearby, far], new Set(["far"]), filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nearby");
  });
});

describe("complementarity scoring", () => {
  it("scores same business type low (competitors)", () => {
    expect(complementarityScore("Cafe", "Cafe")).toBe(10);
  });

  it("scores known complementary pairs high", () => {
    expect(complementarityScore("cafe", "bakery")).toBe(95);
    expect(complementarityScore("Bakery", "Cafe")).toBe(95);
    expect(complementarityScore("gym", "juice bar")).toBe(95);
  });

  it("scores unrelated types at moderate level", () => {
    const score = complementarityScore("Plumber", "Dentist");
    expect(score).toBe(50);
  });
});

describe("audience overlap scoring", () => {
  it("returns base score when no demographics set", () => {
    const a: BusinessRecord = { ...origin };
    const b: BusinessRecord = { ...origin, id: "b" };
    const score = audienceOverlapScore(a, b);
    expect(score).toBeGreaterThanOrEqual(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores higher with matching demographics", () => {
    const a: BusinessRecord = {
      ...origin,
      target_age_min: 25,
      target_age_max: 45,
      target_income_bracket: "middle",
      customer_interests: ["coffee", "books", "art"],
    };
    const b: BusinessRecord = {
      ...origin,
      id: "b",
      target_age_min: 25,
      target_age_max: 45,
      target_income_bracket: "middle",
      customer_interests: ["coffee", "pastries", "art"],
    };
    const score = audienceOverlapScore(a, b);
    expect(score).toBeGreaterThan(70);
  });

  it("scores lower with non-overlapping age ranges", () => {
    const a: BusinessRecord = {
      ...origin,
      target_age_min: 18,
      target_age_max: 25,
    };
    const b: BusinessRecord = {
      ...origin,
      id: "b",
      target_age_min: 55,
      target_age_max: 75,
    };
    const score = audienceOverlapScore(a, b);
    expect(score).toBeLessThanOrEqual(55);
  });
});

describe("match quality scoring", () => {
  it("returns a score between 0 and 100", () => {
    const candidate: BusinessRecord = {
      ...origin,
      id: "b",
      business_type: "Bakery",
      verified: true,
      successful_partnerships_count: 3,
    };
    const score = matchQualityScore(origin, candidate, 2.5);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores verified businesses with history higher", () => {
    const unverified: BusinessRecord = {
      ...origin,
      id: "b",
      business_type: "Bakery",
      verified: false,
      successful_partnerships_count: 0,
    };
    const verified: BusinessRecord = {
      ...origin,
      id: "c",
      business_type: "Bakery",
      verified: true,
      successful_partnerships_count: 5,
    };
    const scoreUnverified = matchQualityScore(origin, unverified, 5);
    const scoreVerified = matchQualityScore(origin, verified, 5);
    expect(scoreVerified).toBeGreaterThan(scoreUnverified);
  });
});

describe("trust badges", () => {
  it("returns empty array for basic business", () => {
    const badges = getTrustBadges(origin);
    expect(badges).toHaveLength(0);
  });

  it("returns verified badge for verified business", () => {
    const business: BusinessRecord = { ...origin, verified: true };
    const badges = getTrustBadges(business);
    expect(badges.some((b) => b.type === "verified")).toBe(true);
  });

  it("returns established badge for 3+ years", () => {
    const business: BusinessRecord = { ...origin, years_in_operation: 5 };
    const badges = getTrustBadges(business);
    expect(badges.some((b) => b.type === "established")).toBe(true);
  });

  it("returns top partner badge for 5+ successful partnerships", () => {
    const business: BusinessRecord = { ...origin, successful_partnerships_count: 7 };
    const badges = getTrustBadges(business);
    expect(badges.some((b) => b.type === "top_partner")).toBe(true);
  });

  it("returns fast responder badge for ≤2 hour response time", () => {
    const business: BusinessRecord = { ...origin, avg_response_time_minutes: 90 };
    const badges = getTrustBadges(business);
    expect(badges.some((b) => b.type === "fast_responder")).toBe(true);
  });

  it("returns all badges when all criteria met", () => {
    const business: BusinessRecord = {
      ...origin,
      verified: true,
      years_in_operation: 10,
      successful_partnerships_count: 8,
      avg_response_time_minutes: 60,
    };
    const badges = getTrustBadges(business);
    expect(badges).toHaveLength(4);
  });
});

describe("subscription tier limits", () => {
  it("free tier has 5 daily swipes", () => {
    expect(TIER_LIMITS.free.dailySwipes).toBe(5);
    expect(TIER_LIMITS.free.canSeeWhoLiked).toBe(false);
  });

  it("pro tier has unlimited swipes", () => {
    expect(TIER_LIMITS.pro.dailySwipes).toBe(Infinity);
    expect(TIER_LIMITS.pro.canSeeWhoLiked).toBe(true);
  });

  it("canSwipe returns true for pro users", () => {
    const business: BusinessRecord = {
      ...origin,
      subscription_tier: "pro",
      daily_swipes_used: 100,
    };
    expect(canSwipe(business)).toBe(true);
  });

  it("canSwipe returns false for free user at limit on same day", () => {
    const today = new Date().toISOString().split("T")[0];
    const business: BusinessRecord = {
      ...origin,
      subscription_tier: "free",
      daily_swipes_used: 5,
      last_swipe_reset_at: today,
    };
    expect(canSwipe(business)).toBe(false);
  });

  it("canSwipe returns true for free user on a new day", () => {
    const business: BusinessRecord = {
      ...origin,
      subscription_tier: "free",
      daily_swipes_used: 5,
      last_swipe_reset_at: "2020-01-01",
    };
    expect(canSwipe(business)).toBe(true);
  });
});

describe("icebreaker prompts", () => {
  it("returns prompts for overlapping partnership types", () => {
    const prompts = getIcebreakers(["cross-promotion", "event-collab"], ["cross-promotion"]);
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((p) => p.partnershipType === "cross-promotion")).toBe(true);
  });

  it("falls back to origin types when no overlap", () => {
    const prompts = getIcebreakers(["wholesale"], ["social-media-collab"]);
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((p) => p.partnershipType === "wholesale")).toBe(true);
  });

  it("all prompts have required fields", () => {
    for (const prompt of ICEBREAKER_PROMPTS) {
      expect(prompt.id).toBeTruthy();
      expect(prompt.partnershipType).toBeTruthy();
      expect(prompt.prompt.length).toBeGreaterThan(20);
    }
  });
});

describe("partnership templates", () => {
  it("has templates for all partnership types", () => {
    const types = ["cross-promotion", "wholesale", "event-collab", "product-bundle", "social-media-collab"];
    for (const type of types) {
      const templates = getTemplatesForType(type);
      expect(templates.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all templates have required fields", () => {
    for (const template of PARTNERSHIP_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description.length).toBeGreaterThan(10);
      expect(template.terms.length).toBeGreaterThanOrEqual(1);
      expect(template.suggestedSplit).toBeTruthy();
    }
  });
});

describe("ROI calculator", () => {
  it("calculates positive ROI correctly", () => {
    const result = calculatePartnershipROI({
      revenueGenerated: 5000,
      customersAcquired: 50,
      timeInvestedHours: 20,
      marketingSpend: 500,
      partnershipDurationMonths: 3,
    });
    expect(result.totalRevenue).toBe(5000);
    expect(result.totalCost).toBe(1500); // 500 + 20*50
    expect(result.netProfit).toBe(3500);
    expect(result.roi).toBeGreaterThan(200);
    expect(result.revenuePerMonth).toBeCloseTo(1666.67, 1);
    expect(result.costPerCustomer).toBe(30);
    expect(result.verdict).toContain("Exceptional");
  });

  it("calculates negative ROI correctly", () => {
    const result = calculatePartnershipROI({
      revenueGenerated: 200,
      customersAcquired: 5,
      timeInvestedHours: 40,
      marketingSpend: 1000,
      partnershipDurationMonths: 1,
    });
    expect(result.netProfit).toBeLessThan(0);
    expect(result.roi).toBeLessThan(0);
    expect(result.verdict).toContain("Negative");
  });

  it("handles zero cost gracefully", () => {
    const result = calculatePartnershipROI({
      revenueGenerated: 1000,
      customersAcquired: 10,
      timeInvestedHours: 0,
      marketingSpend: 0,
      partnershipDurationMonths: 1,
    });
    expect(result.roi).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it("handles zero customers gracefully", () => {
    const result = calculatePartnershipROI({
      revenueGenerated: 1000,
      customersAcquired: 0,
      timeInvestedHours: 10,
      marketingSpend: 100,
      partnershipDurationMonths: 1,
    });
    expect(result.costPerCustomer).toBe(0);
  });
});
