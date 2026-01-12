/**
 * Simple in-memory rate limiter
 * For production scale, upgrade to Redis-based solution
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export type RateLimitConfig = {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
};

/**
 * Preset configurations for different action types
 */
export const RATE_LIMITS = {
  /** Auth actions (login, signup) - strict to prevent brute force */
  auth: { limit: 5, windowSeconds: 60 } as RateLimitConfig,

  /** Create actions (new page, new marker) - moderate */
  create: { limit: 10, windowSeconds: 60 } as RateLimitConfig,

  /** Update/delete actions - moderate */
  modify: { limit: 20, windowSeconds: 60 } as RateLimitConfig,

  /** Read actions - lenient */
  read: { limit: 100, windowSeconds: 60 } as RateLimitConfig,
} as const;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
};

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param action - The action being performed (used to namespace limits)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${action}:${identifier}`;
  const now = Date.now();

  const entry = store.get(key);

  // No existing entry or expired - create new
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetTime });

    return {
      success: true,
      remaining: config.limit - 1,
      resetInSeconds: config.windowSeconds,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIP(headers: Headers): string {
  // Vercel
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Cloudflare
  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Real IP header
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}

/**
 * Create a rate limit error response
 */
export function rateLimitError(resetInSeconds: number): { error: string } {
  return {
    error: `Too many requests. Please try again in ${resetInSeconds} seconds.`,
  };
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for testing or admin overrides
 */
export function resetRateLimit(identifier: string, action: string): void {
  const key = `${action}:${identifier}`;
  store.delete(key);
}

/**
 * Clear all rate limits (use for testing only)
 */
export function clearAllRateLimits(): void {
  store.clear();
}
