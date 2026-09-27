export function rateLimiter({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown",
} = {}) {
  if (!windowMs || !max) {
    throw new Error("rateLimiter: 'windowMs' and 'max' are required.");
  }

  // Map<key, { count: number, resetAt: number }>
  const store = new Map();

  // Background sweep — remove expired entries every minute to bound memory
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60 * 1000);

  if (sweepInterval.unref) sweepInterval.unref();

  return function rateLimiterMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const entry = store.get(key);

    // New window (first request or previous expired)
    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      return next();
    }

    // Existing window — increment
    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
      return res.status(429).json({ error: message });
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - entry.count);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    return next();
  };
}