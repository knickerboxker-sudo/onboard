import { getPermitValueTier } from "@/lib/permit-ui";

describe("getPermitValueTier", () => {
  it("returns high when value is above 200k", () => {
    expect(getPermitValueTier(200001)).toBe("high");
  });

  it("returns medium when value is between 50k and 200k inclusive", () => {
    expect(getPermitValueTier(50000)).toBe("medium");
    expect(getPermitValueTier(200000)).toBe("medium");
  });

  it("returns low when value is below 50k", () => {
    expect(getPermitValueTier(49999)).toBe("low");
  });
});
