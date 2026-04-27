import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../services/auth.service";
import { UnauthorizedError } from "../utils/errors";

/**
 * Augment Express Request to include authenticated merchant public key.
 */
declare global {
  namespace Express {
    interface Request {
      merchant?: string;
    }
  }
}

/**
 * Express middleware that requires a valid Bearer JWT in the Authorization header.
 * Attaches `req.merchant` (the Stellar public key) on success.
 * Throws UnauthorizedError on missing, malformed, or expired tokens.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError("Authorization header is required"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Authorization header must be Bearer <token>"));
  }

  try {
    const payload = verifyToken(token);
    req.merchant = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional middleware that verifies the token if present but does not fail
 * when absent. Still attaches `req.merchant` when valid.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.merchant = payload.sub;
  } catch {
    // silently ignore invalid optional tokens
  }

  next();
}

