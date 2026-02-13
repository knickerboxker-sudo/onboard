import { analyzeMarket, occupationOptions } from "@/lib/bls";

describe("analyzeMarket", () => {
  it("returns related career paths for known occupations", () => {
    const result = analyzeMarket({
      occupation: "Software Developers",
      geography: "national",
      experience: "median",
    });

    if ("error" in result) throw new Error("Expected known occupation to resolve");
    expect(result.careerPaths.length).toBeGreaterThan(0);
  });

  it("provides career paths for every supported occupation", () => {
    for (const occupation of occupationOptions) {
      const result = analyzeMarket({
        occupation: occupation.title,
        geography: "national",
        experience: "median",
      });
      if ("error" in result) throw new Error("Expected known occupation to resolve");
      expect(result.careerPaths.length).toBeGreaterThan(0);
    }
  });
});
