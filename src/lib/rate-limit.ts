/**
 * In-memory rate limiter for API endpoints.
 * 
 * This uses a simple token bucket algorithm with fixed windows.
 * For production use with multiple instances, consider Redis-based rate limiting.
 */

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

/**
 * Cleans up expired entries from the rate limit store.
 * Called periodically to prevent memory leaks.
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Checks if a request should be rate limited.
 * 
 * @param key - Unique identifier for the rate limit (usually IP + endpoint)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Reset or create new entry
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000); // seconds
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}
