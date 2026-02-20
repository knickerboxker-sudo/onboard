import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
}

// Cache Ratelimit instances per (limit, windowMs) combination to avoid
// recreating them on every request.
const rateLimiters = new Map<string, Ratelimit>();

function getRateLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  if (!rateLimiters.has(key)) {
    const redis = Redis.fromEnv();
    const windowSeconds = Math.ceil(windowMs / 1000);
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "sortir:ratelimit",
    });
    rateLimiters.set(key, limiter);
  }
  return rateLimiters.get(key)!;
}

/**
 * Check and apply rate limiting for a given identifier (typically IP address).
 * Uses Upstash Redis for distributed, multi-instance safe rate limiting.
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns RateLimitResult indicating if the request is allowed
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(limit, windowMs);
  const { success, remaining, reset } = await limiter.limit(identifier);
  return {
    success,
    remaining,
    resetInSeconds: Math.max(Math.ceil((reset - Date.now()) / 1000), 1),
  };
}

/**
 * Extract client IP from request headers.
 * Reads TRUST_PROXY_DEPTH (default 1) to select the correct IP from
 * x-forwarded-for when behind a known number of reverse proxies.
 * Railway uses one proxy layer, so the real client IP is the last IP minus
 * TRUST_PROXY_DEPTH entries from the right.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    const trustDepth = Math.max(
      1,
      parseInt(process.env.TRUST_PROXY_DEPTH ?? "1", 10)
    );
    const index = Math.max(ips.length - trustDepth, 0);
    return ips[index];
  }
  return "unknown";
}

/**
 * Sanitize a string input: trim whitespace and enforce max length.
 * HTML escaping is intentionally omitted — React escapes on render,
 * and double-encoding corrupts stored data.
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input.trim().slice(0, maxLength);
}
