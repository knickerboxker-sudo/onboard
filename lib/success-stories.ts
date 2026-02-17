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

// PLACEHOLDER: Replace with real testimonials before public launch
export const successStories: SuccessStory[] = [
  {
    id: "cafe-bakery",
    businessA: "Morningside Cafe",
    businessB: "Artisan Bread Co.",
    partnershipType: "Cross-Promotion",
    revenueImpactPercent: 35,
    testimonialQuote:
      "Partnering with Artisan Bread Co. transformed our breakfast menu overnight. Their sourdough became our best-selling toast option, and we send dozens of customers their way each week. It has been a genuine win for both sides.",
    timeframe: "6 months",
    keyMetric: "35% revenue increase",
  },
  {
    id: "gym-juice",
    businessA: "Peak Fitness Studio",
    businessB: "GreenPulse Juice Bar",
    partnershipType: "Co-Location",
    revenueImpactPercent: 42,
    testimonialQuote:
      "Having GreenPulse set up inside our lobby was the best decision we made last year. Members love grabbing a post-workout smoothie, and GreenPulse doubled their weekday foot traffic. Our retention rate climbed noticeably.",
    timeframe: "8 months",
    keyMetric: "42% revenue increase",
  },
  {
    id: "florist-planner",
    businessA: "Bloom & Vine Florals",
    businessB: "Milestone Event Planning",
    partnershipType: "Referral Partnership",
    revenueImpactPercent: 28,
    testimonialQuote:
      "Every wedding Milestone books is a new arrangement order for us, and every bride who walks into our shop hears about Milestone. We stopped spending on ads entirely because the referrals are so consistent.",
    timeframe: "12 months",
    keyMetric: "28% revenue increase",
  },
  {
    id: "bookstore-roaster",
    businessA: "Chapter & Verse Books",
    businessB: "Fireside Roasters",
    partnershipType: "Joint Events",
    revenueImpactPercent: 31,
    testimonialQuote:
      "Our monthly author readings paired with Fireside coffee tastings draw three times the crowd either of us could attract alone. Weekend revenue jumped and we have built a loyal community around both brands.",
    timeframe: "9 months",
    keyMetric: "31% revenue increase",
  },
  {
    id: "salon-boutique",
    businessA: "Lux Hair Studio",
    businessB: "ThreadLine Boutique",
    partnershipType: "Bundle Deals",
    revenueImpactPercent: 24,
    testimonialQuote:
      "Our 'New Look' package, a haircut plus a personal styling session at ThreadLine, is consistently our top seller. Clients love the full experience, and average spend per visit increased across both stores.",
    timeframe: "5 months",
    keyMetric: "24% revenue increase",
  },
  {
    id: "photographer-venue",
    businessA: "Ember Photography",
    businessB: "The Garden Loft Venue",
    partnershipType: "Preferred Vendor",
    revenueImpactPercent: 52,
    testimonialQuote:
      "Becoming the preferred photographer at The Garden Loft filled my calendar for the entire season. They get consistently high-quality photos for their portfolio, and I get a steady pipeline of bookings without cold outreach.",
    timeframe: "10 months",
    keyMetric: "52% revenue increase",
  },
  {
    id: "pet-groomer-vet",
    businessA: "Happy Tails Grooming",
    businessB: "Riverside Veterinary Clinic",
    partnershipType: "Cross-Referral",
    revenueImpactPercent: 38,
    testimonialQuote:
      "Riverside recommends us for grooming after every wellness visit, and we flag health concerns we spot and send clients their way. Pet owners trust the connection, and both businesses have grown steadily because of it.",
    timeframe: "7 months",
    keyMetric: "38% revenue increase",
  },
];
