import { describe, it, expect } from "vitest";
import { normalizeCik, displayCik } from "../src/lib/cik";

describe("normalizeCik", () => {
  it("pads a short numeric string to 10 digits", () => {
    expect(normalizeCik("320193")).toBe("0000320193");
  });

  it("pads a number to 10 digits", () => {
    expect(normalizeCik(320193)).toBe("0000320193");
  });

  it("handles already-padded CIK", () => {
    expect(normalizeCik("0000320193")).toBe("0000320193");
  });

  it("strips non-digit characters", () => {
    expect(normalizeCik("CIK-320193")).toBe("0000320193");
  });

  it("throws on empty input", () => {
    expect(() => normalizeCik("")).toThrow("Invalid CIK: no digits found");
  });

  it("throws on non-digit input", () => {
    expect(() => normalizeCik("abc")).toThrow("Invalid CIK: no digits found");
  });

  it("throws on too many digits", () => {
    expect(() => normalizeCik("12345678901")).toThrow("Invalid CIK: too many digits");
  });

  it("handles single digit", () => {
    expect(normalizeCik("1")).toBe("0000000001");
  });
});

describe("displayCik", () => {
  it("strips leading zeros", () => {
    expect(displayCik("0000320193")).toBe("320193");
  });

  it("returns 0 for all zeros", () => {
    expect(displayCik("0000000000")).toBe("0");
  });

  it("handles no leading zeros", () => {
    expect(displayCik("1234567890")).toBe("1234567890");
  });
});
