import { describe, it, expect } from "vitest";
import { extractEmployeeCountFromText } from "../src/lib/metrics";

describe("extractEmployeeCountFromText", () => {
  it("extracts employee count from simple text", () => {
    const text = "As of December 31, 2023, we had approximately 164,000 employees.";
    const result = extractEmployeeCountFromText(text);
    expect(result.count).toBe(164000);
    expect(result.sentence).toContain("164,000");
  });

  it("extracts from HTML content", () => {
    const html = "<p>The company employed <b>50,000</b> full-time employees as of year end.</p>";
    const result = extractEmployeeCountFromText(html);
    expect(result.count).toBe(50000);
  });

  it("returns null when no employee count found", () => {
    const text = "This document discusses revenue and market strategy.";
    const result = extractEmployeeCountFromText(text);
    expect(result.count).toBeNull();
  });

  it("avoids false positives with customers", () => {
    const text = "We serve approximately 100,000 employees of our customers.";
    const result = extractEmployeeCountFromText(text);
    expect(result.count).toBeNull();
  });

  it("avoids false positives with suppliers", () => {
    const text = "Our supplier employed 25,000 employees across locations.";
    const result = extractEmployeeCountFromText(text);
    // Should be null since it mentions supplier context
    // (pattern filters check surrounding context)
    expect(result.count).toBeNull();
  });

  it("handles multiple candidates and returns largest", () => {
    const text = "We had approximately 10,000 employees in engineering. Total of approximately 50,000 employees.";
    const result = extractEmployeeCountFromText(text);
    expect(result.count).toBe(50000);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("rejects unreasonably small counts", () => {
    const text = "We had 5 employees.";
    const result = extractEmployeeCountFromText(text);
    expect(result.count).toBeNull();
  });

  it("handles &nbsp; entities", () => {
    const html = "We&nbsp;employed&nbsp;approximately&nbsp;75,000&nbsp;employees.";
    const result = extractEmployeeCountFromText(html);
    expect(result.count).toBe(75000);
  });
});
