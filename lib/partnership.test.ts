import { assessPartnershipEquity, fairnessCheck, negotiationStarter } from "@/lib/partnership";

describe("partnership equity assessment", () => {
  it("returns equal scenario for similar contributions", () => {
    const assessment = assessPartnershipEquity(
      {
        followers: 3000,
        emailList: 900,
        dailyFootTraffic: 130,
        distributionChannelStrength: 6,
        productWholesaleValue: 450,
        marketingEffort: 4,
        exclusiveCategoryPartner: false,
        durationMonths: 6,
      },
      {
        followers: 2900,
        emailList: 850,
        dailyFootTraffic: 120,
        distributionChannelStrength: 6,
        productWholesaleValue: 460,
        marketingEffort: 4,
        exclusiveCategoryPartner: false,
        durationMonths: 6,
      },
    );

    expect(assessment.scenario).toBe("equal");
    expect(assessment.businessAPercent).toBeGreaterThanOrEqual(45);
    expect(assessment.businessAPercent).toBeLessThanOrEqual(55);
  });

  it("flags major imbalance and produces red flag", () => {
    const assessment = assessPartnershipEquity(
      {
        followers: 52000,
        emailList: 12000,
        dailyFootTraffic: 600,
        distributionChannelStrength: 10,
        productWholesaleValue: 1200,
        marketingEffort: 10,
        exclusiveCategoryPartner: true,
        durationMonths: 12,
      },
      {
        followers: 600,
        emailList: 120,
        dailyFootTraffic: 30,
        distributionChannelStrength: 2,
        productWholesaleValue: 120,
        marketingEffort: 2,
        exclusiveCategoryPartner: false,
        durationMonths: 1,
      },
    );

    expect(assessment.scenario).toBe("major");
    expect(assessment.redFlag).toBe(true);
  });

  it("provides fairness guidance and negotiation starter text", () => {
    expect(fairnessCheck(70, 52)).toContain("over-allocated");
    expect(negotiationStarter(60, 40, "moderate")).toContain("60/40");
  });
});
