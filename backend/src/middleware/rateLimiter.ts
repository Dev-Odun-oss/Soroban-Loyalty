import rateLimit from "express-rate-limit";

const windowMs = () =>
  Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000); // 15 minutes

const message = { error: "Too many requests, please try again later." };

/** GET endpoints: 100 requests per 15-minute window per IP */
export const globalLimiter = rateLimit({
  windowMs: windowMs(),
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? 100),
  standardHeaders: "draft-7", // RateLimit-* + Retry-After headers
  legacyHeaders: false,
  message,
});

/** Write endpoints (POST/PUT/PATCH/DELETE): 20 requests per 15-minute window per IP */
export const writeLimiter = rateLimit({
  windowMs: windowMs(),
  max: Number(process.env.RATE_LIMIT_WRITE_MAX ?? 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

/** Stricter limiter for the rewards endpoint: 20 requests per 15-minute window per IP */
export const rewardsLimiter = rateLimit({
  windowMs: windowMs(),
  max: Number(process.env.RATE_LIMIT_REWARDS_MAX ?? 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});
