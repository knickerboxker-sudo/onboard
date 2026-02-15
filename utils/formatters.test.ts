import { formatChangePercent, formatPrice } from "@/utils/formatPrice";
import { formatVolume } from "@/utils/formatVolume";

describe("formatPrice", () => {
  it("formats USD values with two decimals", () => {
    expect(formatPrice(12.3)).toBe("$12.30");
    expect(formatPrice(-2)).toBe("-$2.00");
  });

  it("handles invalid values safely", () => {
    expect(formatPrice(undefined)).toBe("$0.00");
    expect(formatPrice("abc")).toBe("$0.00");
  });
});

describe("formatChangePercent", () => {
  it("adds sign and percent suffix", () => {
    expect(formatChangePercent(1.234)).toBe("+1.23%");
    expect(formatChangePercent(-1.234)).toBe("-1.23%");
  });
});

describe("formatVolume", () => {
  it("formats large numbers with compact notation", () => {
    expect(formatVolume(1_800_000)).toContain("M");
  });

  it("handles invalid values", () => {
    expect(formatVolume(undefined)).toBe("0");
    expect(formatVolume("bad")).toBe("0");
  });
});
