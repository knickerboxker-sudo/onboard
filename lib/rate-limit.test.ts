import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeString, getClientIp } from "./rate-limit";

// Mock @upstash/ratelimit and @upstash/redis so tests run without real Redis
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}));

vi.mock("@upstash/ratelimit", () => {
  let callCount = 0;
  const mockLimit = vi.fn(async (_identifier: string) => {
    callCount += 1;
    return {
      success: callCount <= 3,
      remaining: Math.max(3 - callCount, 0),
      reset: Date.now() + 60_000,
    };
  });
  return {
    Ratelimit: class {
      constructor() {}
      static slidingWindow() {}
      limit = mockLimit;
    },
  };
});

import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a RateLimitResult with success, remaining, and resetInSeconds", async () => {
    const result = await rateLimit("test-ip-1", 5, 60_000);
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("resetInSeconds");
  });

  it("returns success=true when under the limit", async () => {
    const result = await rateLimit("test-ip-allow", 5, 60_000);
    expect(result.success).toBe(true);
  });

  it("returns success=false when limit is exceeded", async () => {
    // The mock returns success=false after 3 calls
    await rateLimit("test-ip-block", 3, 60_000);
    await rateLimit("test-ip-block", 3, 60_000);
    await rateLimit("test-ip-block", 3, 60_000);
    const result = await rateLimit("test-ip-block", 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resetInSeconds is at least 1", async () => {
    const result = await rateLimit("test-ip-reset", 5, 60_000);
    expect(result.resetInSeconds).toBeGreaterThanOrEqual(1);
  });
});

describe("sanitizeString", () => {
  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("enforces max length", () => {
    expect(sanitizeString("abcdefghij", 5)).toBe("abcde");
  });

  it("does not HTML-encode special characters (React handles escaping at render time)", () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      '<script>alert("xss")</script>'
    );
  });

  it("does not encode ampersands", () => {
    expect(sanitizeString("A & B")).toBe("A & B");
  });

  it("does not encode single quotes", () => {
    expect(sanitizeString("it's")).toBe("it's");
  });
});

describe("getClientIp", () => {
  const makeRequest = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });

  it("returns the client IP at depth 1 from the right (default)", () => {
    const req = makeRequest({
      "x-forwarded-for": "1.2.3.4, 10.0.0.1",
    });
    // TRUST_PROXY_DEPTH=1 → index = max(length - depth, 0) = max(2 - 1, 0) = 1 → "10.0.0.1"
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("respects TRUST_PROXY_DEPTH env var", () => {
    process.env.TRUST_PROXY_DEPTH = "2";
    const req = makeRequest({
      "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2",
    });
    // depth 2 → index = max(3 - 2, 0) = 1 → "10.0.0.1"
    expect(getClientIp(req)).toBe("10.0.0.1");
    delete process.env.TRUST_PROXY_DEPTH;
  });

  it("returns 'unknown' when header is absent", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });

  it("handles a single IP with no proxy chain", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4" });
    // depth 1, length 1 → index = max(1 - 1, 0) = 0 → "1.2.3.4"
    expect(getClientIp(req)).toBe("1.2.3.4");
  });
});
