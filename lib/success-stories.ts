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

export const successStories: SuccessStory[] = [
  {
    id: "1",
    businessA: "Hearth & Flour Bakery",
    businessAType: "Bakery",
    businessB: "Bloom & Co. Florist",
    businessBType: "Florist",
    city: "Austin, TX",
    partnershipType: "Cross-Promotion",
    summary:
      "Hearth & Flour and Bloom & Co. created a joint 'Gifting Bundle' for local events and weddings. Each shop displayed the other's products and printed referral cards at checkout. The partnership quickly became their top referral channel.",
    result: "32% revenue increase in 3 months",
    revenueImpactPercent: 32,
    keyMetric: "+32% revenue in 3 months",
    testimonialQuote:
      "We started handing out Bloom's cards with every celebration cake and the referrals just kept coming. It felt effortless — like we'd been business partners for years.",
    quotedPerson: "Maria Santos, Owner — Hearth & Flour Bakery",
    timeframe: "3 months",
  },
  {
    id: "2",
    businessA: "Iron & Oak Gym",
    businessAType: "Fitness Studio",
    businessB: "Verde Nutrition Bar",
    businessBType: "Health Food Café",
    city: "Denver, CO",
    partnershipType: "Referral Program",
    summary:
      "Iron & Oak Gym and Verde Nutrition Bar launched a member-exclusive discount exchange: gym members received 15% off Verde smoothies, and Verde customers got a free week at the gym. Both businesses saw a surge in new customer sign-ups within weeks.",
    result: "58 new gym memberships and 40+ new Verde regulars in 6 weeks",
    revenueImpactPercent: 24,
    keyMetric: "58 new members in 6 weeks",
    testimonialQuote:
      "Sortir matched us with Verde in under 48 hours. Six weeks later, we had 58 new memberships directly attributed to the partnership. It's the best ROI we've seen from any marketing channel.",
    quotedPerson: "James Okafor, Co-founder — Iron & Oak Gym",
    timeframe: "6 weeks",
  },
  {
    id: "3",
    businessA: "Little Sun Montessori Toys",
    businessAType: "Children's Retailer",
    businessB: "Cozy Reads Children's Bookshop",
    businessBType: "Bookshop",
    city: "Portland, OR",
    partnershipType: "In-Store Display",
    summary:
      "Little Sun placed a curated selection of educational toys inside Cozy Reads, and the bookshop stocked a 'Toys to Match Your Books' table. Both experienced meaningful increases in average basket size from families discovering complementary products.",
    result: "Average transaction value up 21%; 500+ product units moved",
    revenueImpactPercent: 21,
    keyMetric: "+21% basket value",
    testimonialQuote:
      "Parents come in for a picture book and leave with a wooden puzzle that goes with it — and vice versa. We moved over 500 units in the first season alone. This is exactly what local retail should look like.",
    quotedPerson: "Priya Nair, Founder — Little Sun Montessori Toys",
    timeframe: "One retail season",
  },
  {
    id: "4",
    businessA: "The Copper Kettle Café",
    businessAType: "Coffee Shop",
    businessB: "Monday Morning Media",
    businessBType: "Marketing Agency",
    city: "Nashville, TN",
    partnershipType: "Joint Marketing",
    summary:
      "The Copper Kettle Café partnered with Monday Morning Media, a small local agency, to run monthly Instagram takeovers and a joint email newsletter spotlighting Nashville small businesses. The café handled content creation and the agency handled distribution, tripling both parties' social reach.",
    result: "Email list grew from 1,200 to 3,800 subscribers; 3× social reach",
    revenueImpactPercent: 18,
    keyMetric: "3× social reach",
    testimonialQuote:
      "We each had an audience the other wanted. Pooling our newsletters felt risky at first, but three months in our list tripled and we barely spent a dollar on paid ads.",
    quotedPerson: "Theo Williams, Owner — The Copper Kettle Café",
    timeframe: "3 months",
  },
  {
    id: "5",
    businessA: "Stitch & Thread Alterations",
    businessAType: "Tailor & Alterations",
    businessB: "Second Chapter Consignment",
    businessBType: "Consignment Boutique",
    city: "Chicago, IL",
    partnershipType: "Consignment Sales",
    summary:
      "Second Chapter Consignment began tagging every donated garment that needed repairs with a referral card for Stitch & Thread. In return, Stitch & Thread displayed a small rack of Second Chapter's pre-loved pieces in their waiting area. Both businesses gained loyal new customers through each other's existing traffic.",
    result: "Stitch & Thread gained 90 new alteration clients; Second Chapter sold 120 additional consignment pieces",
    revenueImpactPercent: 27,
    keyMetric: "90 new alteration clients",
    testimonialQuote:
      "Our customers are already thinking about clothing when they walk in. Partnering with Stitch & Thread was the most natural thing in the world — and the numbers proved it.",
    quotedPerson: "Dana Kowalski, Owner — Second Chapter Consignment",
    timeframe: "2 months",
  },
];

