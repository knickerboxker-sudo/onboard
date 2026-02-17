import { describe, it, expect } from "vitest";
import { rateLimit, sanitizeString } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const result = rateLimit("test-ip-1", 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const id = "test-ip-block";
    for (let i = 0; i < 3; i++) {
      rateLimit(id, 3, 60_000);
    }
    const result = rateLimit(id, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining count correctly", () => {
    const id = "test-ip-remaining";
    const r1 = rateLimit(id, 5, 60_000);
    expect(r1.remaining).toBe(4);
    const r2 = rateLimit(id, 5, 60_000);
    expect(r2.remaining).toBe(3);
  });
});

describe("sanitizeString", () => {
  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("enforces max length", () => {
    expect(sanitizeString("abcdefghij", 5)).toBe("abcde");
  });

  it("escapes HTML entities", () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(sanitizeString("A & B")).toBe("A &amp; B");
  });

  it("escapes single quotes", () => {
    expect(sanitizeString("it's")).toBe("it&#x27;s");
  });
});
