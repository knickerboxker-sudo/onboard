import {
  haversineMiles,
  complementarityScore,
  audienceOverlapScore,
  matchQualityScore,
  getTrustBadges,
  getTemplatesForType,
  calculatePartnershipROI,
  collaborationIntentScore,
  calculateProfileCompletion,
  getPartnershipIdeasByCategory,
  generatePartnershipInsights,
  buildActivityFeed,
  PARTNERSHIP_TEMPLATES,
  PARTNERSHIP_IDEAS,
  PROPOSAL_TEMPLATES,
} from "@/lib/matching";
import type { PartnershipDataForInsights, RawActivityData } from "@/lib/matching";
import type { BusinessRecord } from "@/lib/types";
import { PARTNERSHIP_INTEREST_TAGS } from "@/lib/types";

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

describe("matching helpers", () => {
  it("calculates haversine distance in miles", () => {
    const miles = haversineMiles(40.7128, -74.006, 40.73061, -73.935242);
    expect(miles).toBeGreaterThan(3);
    expect(miles).toBeLessThan(5);
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

  it("scores expanded complementary pairs high", () => {
    expect(complementarityScore("restaurant", "winery")).toBe(95);
    expect(complementarityScore("real estate", "mortgage broker")).toBe(95);
    expect(complementarityScore("auto repair", "car wash")).toBe(95);
    expect(complementarityScore("coworking space", "coffee shop")).toBe(95);
    expect(complementarityScore("pet store", "veterinarian")).toBe(95);
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

describe("collaboration intent scoring", () => {
  it("returns 0 when either side has no intents", () => {
    expect(collaborationIntentScore([], ["sell"])).toBe(0);
    expect(collaborationIntentScore(["sell"], [])).toBe(0);
    expect(collaborationIntentScore([], [])).toBe(0);
  });

  it("scores complementary intents positively", () => {
    const score = collaborationIntentScore(["sell"], ["promote"]);
    expect(score).toBeGreaterThan(0);
  });

  it("scores co-brand with co-brand positively", () => {
    const score = collaborationIntentScore(["co-brand"], ["co-brand"]);
    expect(score).toBeGreaterThan(0);
  });

  it("caps at 30 maximum", () => {
    const score = collaborationIntentScore(
      ["sell", "promote", "supply", "co-brand", "refer"],
      ["sell", "promote", "supply", "co-brand", "refer"],
    );
    expect(score).toBeLessThanOrEqual(30);
  });

  it("returns 0 for non-complementary intents", () => {
    const score = collaborationIntentScore(["sell"], ["sell"]);
    expect(score).toBe(0);
  });
});

describe("match quality score with collaboration intents", () => {
  it("scores higher when collaboration intents align", () => {
    const candidateBase: BusinessRecord = {
      ...origin,
      id: "b",
      business_type: "Bakery",
    };
    const candidateWithIntents: BusinessRecord = {
      ...candidateBase,
      collaboration_intents: ["promote"],
    };
    const originWithIntents: BusinessRecord = {
      ...origin,
      collaboration_intents: ["sell"],
    };
    const scoreWithout = matchQualityScore(origin, candidateBase, 5);
    const scoreWith = matchQualityScore(originWithIntents, candidateWithIntents, 5);
    expect(scoreWith).toBeGreaterThanOrEqual(scoreWithout);
  });
});

describe("profile completion", () => {
  it("returns 0% for empty business", () => {
    const empty: BusinessRecord = {
      id: "x",
      owner_id: "o",
      name: "",
      description: null,
      business_type: "",
      address: "",
      lat: null,
      lng: null,
      photos: [],
      products: [],
      partnership_types: [],
    };
    expect(calculateProfileCompletion(empty)).toBe(0);
  });

  it("returns higher completion for filled profiles", () => {
    const partial: BusinessRecord = {
      ...origin,
      description: "A nice cafe",
      website: "https://example.com",
      photos: ["photo1.jpg"],
      years_in_operation: 5,
      looking_for: ["Cross-promotion partners"],
      can_offer: ["Store shelf space"],
      partnership_interest_tags: ["Events"],
    };
    const score = calculateProfileCompletion(partial);
    expect(score).toBeGreaterThan(40);
  });

  it("returns 100% for fully filled profile", () => {
    const full: BusinessRecord = {
      ...origin,
      description: "Great cafe",
      products: ["Coffee", "Pastries"],
      partnership_types: ["cross-promotion"],
      collaboration_intents: ["sell"],
      photos: ["photo.jpg"],
      website: "https://example.com",
      social_links: ["https://instagram.com/cafe"],
      follower_count: 5000,
      monthly_foot_traffic: 10000,
      years_in_operation: 5,
      operating_hours: "9-5",
      looking_for: ["Partners"],
      can_offer: ["Space"],
      partnership_interest_tags: ["Events"],
      business_story: "Founded in 2020",
    };
    expect(calculateProfileCompletion(full)).toBe(100);
  });
});

describe("partnership ideas", () => {
  it("has ideas for all categories", () => {
    const categories = ["Food & Beverage", "Retail", "Services", "Health & Wellness", "Arts & Entertainment", "Professional Services"] as const;
    for (const cat of categories) {
      const ideas = getPartnershipIdeasByCategory(cat);
      expect(ideas.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns all ideas when no category specified", () => {
    const all = getPartnershipIdeasByCategory();
    expect(all.length).toBe(PARTNERSHIP_IDEAS.length);
    expect(all.length).toBeGreaterThan(10);
  });

  it("all ideas have required fields", () => {
    for (const idea of PARTNERSHIP_IDEAS) {
      expect(idea.id).toBeTruthy();
      expect(idea.businessA).toBeTruthy();
      expect(idea.businessB).toBeTruthy();
      expect(idea.idea).toBeTruthy();
      expect(idea.description.length).toBeGreaterThan(10);
    }
  });
});

describe("partnership interest tags", () => {
  it("has all expected tags", () => {
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Events");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Cross-Promotion");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Revenue Share");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Bulk Purchasing");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("In-Store Display");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Consignment Sales");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Newsletter Feature");
    expect(PARTNERSHIP_INTEREST_TAGS).toContain("Physical Referral");
    expect(PARTNERSHIP_INTEREST_TAGS.length).toBe(13);
  });
});

describe("proposal templates", () => {
  it("has templates for key partnership types", () => {
    expect(PROPOSAL_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    const types = PROPOSAL_TEMPLATES.map((t) => t.partnershipType);
    expect(types).toContain("event-collab");
    expect(types).toContain("cross-promotion");
    expect(types).toContain("product-bundle");
    expect(types).toContain("wholesale");
  });

  it("all templates have required fields", () => {
    for (const template of PROPOSAL_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.title).toBeTruthy();
      expect(template.description.length).toBeGreaterThan(10);
      expect(template.terms.length).toBeGreaterThanOrEqual(1);
      expect(template.nextSteps.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// --- Partnership Insights Engine Tests ---

describe("generatePartnershipInsights", () => {
  const now = new Date("2026-01-15");

  it("suggests starting first partnership when no partnerships exist", () => {
    const insights = generatePartnershipInsights([], now);
    expect(insights).toHaveLength(1);
    expect(insights[0].type).toBe("growth_opportunity");
    expect(insights[0].priority).toBe("high");
    expect(insights[0].actionHref).toBe("/discover");
  });

  it("identifies top revenue-generating partnership type", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 5000, customers_acquired: 20, start_date: "2025-12-01", end_date: null },
      { partnership_type: "cross-promotion", status: "completed", revenue_generated: 3000, customers_acquired: 15, start_date: "2025-10-01", end_date: "2025-12-01" },
      { partnership_type: "wholesale", status: "active", revenue_generated: 1000, customers_acquired: 5, start_date: "2025-11-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const topType = insights.find((i) => i.type === "top_type");
    expect(topType).toBeDefined();
    expect(topType!.title).toContain("cross-promotion");
    expect(topType!.description).toContain("8x");
  });

  it("does not generate top_type insight when revenue difference is small", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 1000, customers_acquired: 10, start_date: "2025-12-01", end_date: null },
      { partnership_type: "wholesale", status: "active", revenue_generated: 900, customers_acquired: 5, start_date: "2025-11-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const topType = insights.find((i) => i.type === "top_type");
    expect(topType).toBeUndefined();
  });

  it("detects dormant activity when no partnerships started recently", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "completed", revenue_generated: 2000, customers_acquired: 10, start_date: "2025-06-01", end_date: "2025-09-01" },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const dormant = insights.find((i) => i.type === "dormant_alert");
    expect(dormant).toBeDefined();
    expect(dormant!.priority).toBe("high");
    expect(dormant!.actionHref).toBe("/discover");
  });

  it("does not trigger dormant alert when partnership started recently", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 500, customers_acquired: 5, start_date: "2026-01-05", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const dormant = insights.find((i) => i.type === "dormant_alert");
    expect(dormant).toBeUndefined();
  });

  it("suggests diversifying when all partnerships are same type", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "wholesale", status: "active", revenue_generated: 500, customers_acquired: 5, start_date: "2026-01-05", end_date: null },
      { partnership_type: "wholesale", status: "completed", revenue_generated: 800, customers_acquired: 8, start_date: "2025-10-01", end_date: "2025-12-15" },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const diversify = insights.find((i) => i.type === "diversify");
    expect(diversify).toBeDefined();
    expect(diversify!.description).toContain("wholesale");
    expect(diversify!.actionHref).toBe("/partnership-ideas");
  });

  it("highlights high-performing active partnerships", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "event-collab", status: "active", revenue_generated: 3500, customers_acquired: 25, start_date: "2025-12-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const highPerformer = insights.find((i) => i.type === "high_performer");
    expect(highPerformer).toBeDefined();
    expect(highPerformer!.description).toContain("$3,500");
    expect(highPerformer!.description).toContain("25 customers");
  });

  it("suggests milestones for active partnerships", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 100, customers_acquired: 3, start_date: "2026-01-01", end_date: null },
      { partnership_type: "wholesale", status: "active", revenue_generated: 200, customers_acquired: 5, start_date: "2026-01-10", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const milestone = insights.find((i) => i.type === "milestone_suggestion");
    expect(milestone).toBeDefined();
    expect(milestone!.description).toContain("2 active partnerships");
  });

  it("sorts insights by priority (high first)", () => {
    const partnerships: PartnershipDataForInsights[] = [
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 5000, customers_acquired: 20, start_date: "2025-06-01", end_date: null },
      { partnership_type: "wholesale", status: "active", revenue_generated: 500, customers_acquired: 5, start_date: "2025-06-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    expect(insights.length).toBeGreaterThan(1);
    const priorities = insights.map((i) => i.priority);
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < priorities.length; i++) {
      expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(priorityOrder[priorities[i - 1]]);
    }
  });

  it("detects declining revenue trend", () => {
    const partnerships: PartnershipDataForInsights[] = [
      // Older: high revenue
      { partnership_type: "cross-promotion", status: "completed", revenue_generated: 5000, customers_acquired: 30, start_date: "2025-06-01", end_date: "2025-09-01" },
      { partnership_type: "wholesale", status: "completed", revenue_generated: 4000, customers_acquired: 20, start_date: "2025-07-01", end_date: "2025-10-01" },
      // Recent: low revenue
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 500, customers_acquired: 5, start_date: "2025-11-01", end_date: null },
      { partnership_type: "wholesale", status: "active", revenue_generated: 400, customers_acquired: 3, start_date: "2025-12-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const trend = insights.find((i) => i.type === "revenue_trend");
    expect(trend).toBeDefined();
    expect(trend!.title).toContain("declining");
    expect(trend!.priority).toBe("high");
  });

  it("detects growing revenue trend", () => {
    const partnerships: PartnershipDataForInsights[] = [
      // Older: low revenue
      { partnership_type: "cross-promotion", status: "completed", revenue_generated: 500, customers_acquired: 5, start_date: "2025-06-01", end_date: "2025-09-01" },
      // Recent: high revenue
      { partnership_type: "cross-promotion", status: "active", revenue_generated: 5000, customers_acquired: 30, start_date: "2025-11-01", end_date: null },
    ];
    const insights = generatePartnershipInsights(partnerships, now);
    const trend = insights.find((i) => i.type === "revenue_trend");
    expect(trend).toBeDefined();
    expect(trend!.title).toContain("growing");
    expect(trend!.priority).toBe("medium");
  });
});

// --- Activity Feed Tests ---

describe("buildActivityFeed", () => {
  it("returns empty array when no data provided", () => {
    const feed = buildActivityFeed({ partnerships: [], matches: [], recentMessages: [] });
    expect(feed).toEqual([]);
  });

  it("creates feed items for active partnerships", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p1", partnership_type: "cross-promotion", status: "active", revenue_generated: 500, customers_acquired: 5, start_date: "2025-12-01", end_date: null },
      ],
      matches: [],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    expect(feed.length).toBeGreaterThanOrEqual(1);
    const started = feed.find((f) => f.type === "partnership_started");
    expect(started).toBeDefined();
    expect(started!.description).toContain("cross-promotion");
  });

  it("creates feed items for completed partnerships with revenue", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p2", partnership_type: "wholesale", status: "completed", revenue_generated: 2500, customers_acquired: 15, start_date: "2025-10-01", end_date: "2025-12-15" },
      ],
      matches: [],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    const completed = feed.find((f) => f.type === "partnership_completed");
    expect(completed).toBeDefined();
    expect(completed!.description).toContain("$2,500");
  });

  it("creates revenue milestone items for high-revenue partnerships", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p3", partnership_type: "event-collab", status: "active", revenue_generated: 3500, customers_acquired: 5, start_date: "2025-11-01", end_date: null },
      ],
      matches: [],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    const milestone = feed.find((f) => f.type === "revenue_milestone");
    expect(milestone).toBeDefined();
    expect(milestone!.title).toContain("$3,000");
  });

  it("creates customer milestone items for partnerships with many customers", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p4", partnership_type: "cross-promotion", status: "active", revenue_generated: 500, customers_acquired: 25, start_date: "2025-11-01", end_date: null },
      ],
      matches: [],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    const milestone = feed.find((f) => f.type === "customer_milestone");
    expect(milestone).toBeDefined();
    expect(milestone!.title).toContain("20 customers");
  });

  it("includes match events in the feed", () => {
    const data: RawActivityData = {
      partnerships: [],
      matches: [
        { id: "m1", created_at: "2025-12-20T10:00:00Z" },
      ],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    expect(feed).toHaveLength(1);
    expect(feed[0].type).toBe("new_match");
    expect(feed[0].actionHref).toBe("/messages");
  });

  it("includes message events and truncates long content", () => {
    const longContent = "A".repeat(100);
    const data: RawActivityData = {
      partnerships: [],
      matches: [],
      recentMessages: [
        { id: "msg1", match_id: "m1", content: longContent, created_at: "2025-12-21T10:00:00Z", sender_name: "Bakery Co" },
      ],
    };
    const feed = buildActivityFeed(data);
    expect(feed).toHaveLength(1);
    expect(feed[0].type).toBe("message_received");
    expect(feed[0].title).toContain("Bakery Co");
    expect(feed[0].description.length).toBeLessThanOrEqual(80);
    expect(feed[0].description).toContain("…");
  });

  it("does not truncate short messages", () => {
    const data: RawActivityData = {
      partnerships: [],
      matches: [],
      recentMessages: [
        { id: "msg2", match_id: "m1", content: "Hello!", created_at: "2025-12-21T10:00:00Z" },
      ],
    };
    const feed = buildActivityFeed(data);
    expect(feed[0].description).toBe("Hello!");
  });

  it("sorts feed items by timestamp descending (newest first)", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p1", partnership_type: "wholesale", status: "active", revenue_generated: 100, customers_acquired: 2, start_date: "2025-10-01", end_date: null },
      ],
      matches: [
        { id: "m1", created_at: "2025-12-20T10:00:00Z" },
      ],
      recentMessages: [
        { id: "msg1", match_id: "m1", content: "Hi!", created_at: "2025-12-25T10:00:00Z" },
      ],
    };
    const feed = buildActivityFeed(data);
    for (let i = 1; i < feed.length; i++) {
      expect(new Date(feed[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(feed[i].timestamp).getTime(),
      );
    }
  });

  it("limits feed to specified number of items", () => {
    const data: RawActivityData = {
      partnerships: [],
      matches: Array.from({ length: 30 }, (_, i) => ({
        id: `m${i}`,
        created_at: new Date(2025, 11, (i % 28) + 1, 10).toISOString(),
      })),
      recentMessages: [],
    };
    const feed = buildActivityFeed(data, 5);
    expect(feed).toHaveLength(5);
  });

  it("creates paused partnership feed items", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p5", partnership_type: "event-collab", status: "paused", revenue_generated: 0, customers_acquired: 0, start_date: "2025-11-01", end_date: null, updated_at: "2025-12-15T10:00:00Z" },
      ],
      matches: [],
      recentMessages: [],
    };
    const feed = buildActivityFeed(data);
    const paused = feed.find((f) => f.type === "partnership_paused");
    expect(paused).toBeDefined();
    expect(paused!.description).toContain("paused");
  });

  it("combines all event types and maintains order", () => {
    const data: RawActivityData = {
      partnerships: [
        { id: "p1", partnership_type: "cross-promotion", status: "active", revenue_generated: 2000, customers_acquired: 15, start_date: "2025-11-01", end_date: null },
        { id: "p2", partnership_type: "wholesale", status: "completed", revenue_generated: 1500, customers_acquired: 10, start_date: "2025-09-01", end_date: "2025-12-01" },
      ],
      matches: [
        { id: "m1", created_at: "2025-12-10T10:00:00Z" },
      ],
      recentMessages: [
        { id: "msg1", match_id: "m1", content: "Let's collaborate!", created_at: "2025-12-20T10:00:00Z", sender_name: "Coffee Co" },
      ],
    };
    const feed = buildActivityFeed(data);
    expect(feed.length).toBeGreaterThanOrEqual(4);

    const types = new Set(feed.map((f) => f.type));
    expect(types.has("partnership_started")).toBe(true);
    expect(types.has("partnership_completed")).toBe(true);
    expect(types.has("new_match")).toBe(true);
    expect(types.has("message_received")).toBe(true);
  });
});
