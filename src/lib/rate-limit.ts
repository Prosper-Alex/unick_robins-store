// In-memory rate limiting map
// Maps an IP address string to { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Validates a rate limit for a given identifier (e.g., IP address).
 * @param id The unique identifier for the requester (IP).
 * @param limit The maximum number of requests allowed within the window.
 * @param windowMs The time window in milliseconds.
 * @returns true if the request is allowed, false if rate limited.
 */
export function isRateLimited(id: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(id);

  if (!record) {
    rateLimitMap.set(id, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    // Window expired, reset counter
    rateLimitMap.set(id, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}
