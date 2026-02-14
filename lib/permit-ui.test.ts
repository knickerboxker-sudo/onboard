import { HIGH_VALUE_THRESHOLD, MEDIUM_VALUE_THRESHOLD, getPermitValueTier } from "@/lib/permit-ui";

describe("getPermitValueTier", () => {
  it("returns high when value is above 200k", () => {
    expect(getPermitValueTier(HIGH_VALUE_THRESHOLD + 1)).toBe("high");
    expect(getPermitValueTier(HIGH_VALUE_THRESHOLD + 0.01)).toBe("high");
  });

  it("returns medium when value is between 50k and 200k inclusive", () => {
    expect(getPermitValueTier(MEDIUM_VALUE_THRESHOLD)).toBe("medium");
    expect(getPermitValueTier(HIGH_VALUE_THRESHOLD)).toBe("medium");
  });

  it("returns low when value is below 50k", () => {
    expect(getPermitValueTier(MEDIUM_VALUE_THRESHOLD - 1)).toBe("low");
  });
});
