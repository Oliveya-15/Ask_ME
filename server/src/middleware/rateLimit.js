import rateLimit from 'express-rate-limit';

const handler = (message) => (_req, res) => res.status(429).json({ success: false, message });

/** Coarse per-IP limit for the whole API (abuse / scraping protection). */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Too many requests. Please slow down.'),
});

/** Per-user limit for AI endpoints. Keeps one user from burning the shared free quotas. Must run after requireUser. */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.userId,
  handler: handler('You are generating too fast. Please wait a minute and try again.'),
});
