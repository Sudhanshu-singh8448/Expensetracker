import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function rateLimiter(req, res, next) {
  try {
    // Use IP address as identifier
    const identifier = req.ip || req.connection.remoteAddress || "unknown";
    
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
        retryAfter: Math.round((reset - Date.now()) / 1000),
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    // If rate limiting fails, allow the request to proceed
    next();
  }
}