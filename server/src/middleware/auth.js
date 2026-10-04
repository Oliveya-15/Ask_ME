import { clerkClient, getAuth, verifyToken } from '@clerk/express';
import { env, allowedOrigins } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { countByUserAndTypes } from '../db/creations.repo.js'; // <-- RESTORED IMPORT

// Types that count towards the free-plan allowance.
const FREE_TIER_TYPES = ['article', 'blog-title'];

// publicMetadata lookups cost a Clerk API call, so cache them briefly.
const PLAN_TTL_MS = 60_000;
const planCache = new Map();

// <-- RESTORED FUNCTION
async function isPremium(auth) {
  // 1) Clerk Billing subscription (plan slug "premium")
  try {
    if (auth.has?.({ plan: 'premium' })) return true;
  } catch {
    /* billing not enabled for this instance */
  }

  // 2) Manual override: publicMetadata.plan === "premium" (set in the Clerk dashboard)
  const hit = planCache.get(auth.userId);
  if (hit && hit.expires > Date.now()) return hit.premium;

  let premium = false;
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    premium = user.publicMetadata?.plan === 'premium';
  } catch (err) {
    console.warn('[auth] could not load Clerk user metadata:', err.message);
  }
  
  if (planCache.size > 2000) planCache.clear();
  planCache.set(auth.userId, { premium, expires: Date.now() + PLAN_TTL_MS });
  return premium;
}

/** Rejects unauthenticated requests and exposes req.userId. */
export async function requireUser(req, _res, next) {
  const auth = getAuth(req);

  if (!auth?.userId) {
    if (env.NODE_ENV !== 'production') {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
      try {
        await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY, authorizedParties: allowedOrigins });
        console.log('[auth debug] token is VALID -> the problem is the middleware config');
      } catch (e) {
        console.log('[auth debug]', e.reason, '-', e.message);
      }
    }
    return next(new ApiError(401, 'Please sign in to continue.'));
  }
  req.userId = auth.userId;
  req.clerkAuth = auth;
  next();
}

/** Only subscribers (Clerk plan "premium") may use the wrapped feature. */
export async function requirePremium(req, _res, next) {
  try {
    if (!(await isPremium(req.clerkAuth))) {
      return next(new ApiError(403, 'This feature is available on the Premium plan. Upgrade to continue.'));
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Free users get FREE_USAGE_LIMIT text generations; premium users are unlimited. */
export async function enforceFreeLimit(req, _res, next) {
  try {
    if (await isPremium(req.clerkAuth)) return next();
    const used = await countByUserAndTypes(req.userId, FREE_TIER_TYPES);
    if (used >= env.FREE_USAGE_LIMIT) {
      return next(new ApiError(403, `Free limit reached (${env.FREE_USAGE_LIMIT} generations). Upgrade to Premium to continue.`));
    }
    next();
  } catch (err) {
    next(err);
  }
}