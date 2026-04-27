/**
 * auth.service.ts — Stellar-based challenge/response authentication.
 *
 * Flow:
 *   1. Merchant calls POST /auth/challenge with their public key.
 *   2. Backend generates a random nonce, stores it in auth_challenges with TTL.
 *   3. Merchant signs the nonce with their Stellar private key.
 *   4. Merchant calls POST /auth/verify with public key + signature.
 *   5. Backend verifies the signature, issues a short-lived JWT.
 */

import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { Keypair } from "@stellar/stellar-sdk";
import { pool } from "../db";
import { env } from "../env";
import { UnauthorizedError, BadRequestError } from "../utils/errors";

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const JWT_EXPIRY_SECONDS = env.JWT_EXPIRY_HOURS * 60 * 60;

export interface AuthChallenge {
  public_key: string;
  nonce: string;
  expires_at: Date;
}

export interface JwtPayload {
  sub: string; // public key
  iat: number;
  exp: number;
}

/**
 * Generate a new challenge nonce for the given public key.
 * Overwrites any existing challenge for this key.
 */
export async function generateChallenge(publicKey: string): Promise<string> {
  if (!publicKey || publicKey.length !== 56 || !publicKey.startsWith("G")) {
    throw new BadRequestError("Invalid Stellar public key", { publicKey });
  }

  const nonce = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await pool.query(
    `INSERT INTO auth_challenges (public_key, nonce, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (public_key) DO UPDATE SET
       nonce = EXCLUDED.nonce,
       created_at = NOW(),
       expires_at = EXCLUDED.expires_at`,
    [publicKey, nonce, expiresAt]
  );

  return nonce;
}

/**
 * Retrieve the active challenge nonce for a public key.
 * Returns null if no challenge exists or it has expired.
 */
export async function getActiveChallenge(publicKey: string): Promise<string | null> {
  const { rows } = await pool.query<Pick<AuthChallenge, "nonce">>(
    `SELECT nonce FROM auth_challenges
     WHERE public_key = $1 AND expires_at > NOW()`,
    [publicKey]
  );
  return rows[0]?.nonce ?? null;
}

/**
 * Verify an ED25519 signature against the stored challenge nonce.
 * Throws UnauthorizedError on failure.
 */
export function verifySignature(publicKey: string, nonce: string, signature: string): void {
  try {
    const keypair = Keypair.fromPublicKey(publicKey);
    const message = Buffer.from(nonce, "utf8");
    const signatureBuffer = Buffer.from(signature, "base64");

    const valid = keypair.verify(message, signatureBuffer);
    if (!valid) {
      throw new UnauthorizedError("Invalid signature");
    }
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Signature verification failed");
  }
}

/**
 * Complete the challenge/response flow: verify signature and return a JWT.
 */
export async function verifyChallenge(
  publicKey: string,
  signature: string
): Promise<string> {
  if (!publicKey || publicKey.length !== 56 || !publicKey.startsWith("G")) {
    throw new BadRequestError("Invalid Stellar public key", { publicKey });
  }
  if (!signature) {
    throw new BadRequestError("Signature is required", { publicKey });
  }

  const nonce = await getActiveChallenge(publicKey);
  if (!nonce) {
    throw new UnauthorizedError("Challenge expired or not found — request a new challenge");
  }

  verifySignature(publicKey, nonce, signature);

  // Clean up the used challenge
  await pool.query(
    `DELETE FROM auth_challenges WHERE public_key = $1`,
    [publicKey]
  );

  return signToken(publicKey);
}

/**
 * Sign a JWT for the given merchant public key.
 */
export function signToken(publicKey: string): string {
  return jwt.sign({ sub: publicKey }, env.JWT_SECRET, {
    expiresIn: JWT_EXPIRY_SECONDS,
    issuer: "soroban-loyalty-api",
    audience: "soroban-loyalty-merchant",
  });
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws UnauthorizedError on any failure.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "soroban-loyalty-api",
      audience: "soroban-loyalty-merchant",
      complete: false,
    }) as JwtPayload;

    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expired — please re-authenticate");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Token verification failed");
  }
}

/**
 * Cleanup expired challenges (can be called periodically or by a cron job).
 */
export async function cleanupExpiredChallenges(): Promise<number> {
  const { rowCount } = await pool.query(
    `DELETE FROM auth_challenges WHERE expires_at <= NOW()`
  );
  return rowCount ?? 0;
}

