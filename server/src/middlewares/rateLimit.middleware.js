/**
 * In-memory Rate Limiting Middleware
 * Strictly aligned with architecture.md Section 8:
 * - Login: 5 attempts per 15 minutes per IP
 * - Registration: 10 requests per minute per IP
 */

function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hits.entries()) {
      if (now - data.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // In test environment, allow bypass if header is set or skip
    if (process.env.NODE_ENV === 'test' && req.headers['x-skip-rate-limit']) {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = hits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { startTime: now, count: 1 };
      hits.set(ip, record);
    } else {
      record.count++;
    }

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message || 'Too many requests, please try again later.'
      });
    }

    next();
  };
}

// 5 attempts per 15 minutes for login
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

// 10 requests per minute per IP for event registration
const registerLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Registration rate limit exceeded. Please wait a minute before trying again.'
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter
};
