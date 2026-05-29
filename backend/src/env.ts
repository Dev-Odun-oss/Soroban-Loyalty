/**
 * env.ts — Validate and export all environment variables at startup.
 *
 * Uses Zod to parse process.env. If any required variable is missing or
 * malformed the process exits immediately with a clear, human-readable
 * error listing every problem — no cryptic runtime failures later.
 *
 * Import this module BEFORE any service initialisation (db, rpc, etc.).
 * All other modules should import typed values from here instead of
 * reading process.env directly.
 *
 * Required vars must be present in the environment (or loaded from
 * AWS Secrets Manager via secrets.ts before this module is imported).
 * Optional vars fall back to the documented defaults shown below.
 */

import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Accept "true" / "false" strings as booleans (env vars are always strings). */
const booleanString = (defaultValue: boolean) =>
  z
    .enum(["true", "false"])
    .default(defaultValue ? "true" : "false")
    .transform((v) => v === "true");

/** Coerce a string to a port number in the valid range. */
const portString = (defaultValue: number) =>
  z
    .string()
    .default(String(defaultValue))
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535));

// ── Schema ────────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Soroban RPC ─────────────────────────────────────────────────────────────
  /** Soroban JSON-RPC endpoint. Required. */
  SOROBAN_RPC_URL: z.string().url(),

  /** Stellar network passphrase. Required. */
  NETWORK_PASSPHRASE: z.string().min(1),

  // ── Database ────────────────────────────────────────────────────────────────
  /**
   * Full Postgres connection string.
   * Required unless DB_SECRET_ARN is set (secrets.ts will populate it).
   * We make it optional here so local dev without Secrets Manager still works
   * when DATABASE_URL is provided directly.
   */
  DATABASE_URL: z.string().url().optional(),

  // ── Redis ───────────────────────────────────────────────────────────────────
  /** Redis connection URL. Optional, defaults to local instance. */
  REDIS_URL: z.string().url().optional(),

  // ── AWS Secrets Manager ─────────────────────────────────────────────────────
  /** ARN / name of the JSON secret in AWS Secrets Manager. Optional. */
  SECRETS_ARN: z.string().optional(),

  /** AWS region for Secrets Manager. Default: "us-east-1". */
  AWS_REGION: z.string().default("us-east-1"),

  // ── Contract IDs ────────────────────────────────────────────────────────────
  /** Deployed Rewards contract ID. Required. */
  REWARDS_CONTRACT_ID: z.string().min(1),

  /** Deployed Campaign contract ID. Required. */
  CAMPAIGN_CONTRACT_ID: z.string().min(1),

  /** Deployed Token contract ID. Required. */
  TOKEN_CONTRACT_ID: z.string().min(1),

  // ── Connection Pool ─────────────────────────────────────────────────────────
  /** Maximum number of clients in the pool. Default: 10. */
  DB_POOL_MAX: z.string().default("10").transform(Number).pipe(z.number().int().min(1)),

  /** Minimum number of idle clients kept alive. Default: 2. */
  DB_POOL_MIN: z.string().default("2").transform(Number).pipe(z.number().int().min(0)),

  /** Milliseconds a client may sit idle before being closed. Default: 30000. */
  DB_POOL_IDLE_TIMEOUT_MS: z.string().default("30000").transform(Number).pipe(z.number().int().min(0)),

  /** Milliseconds to wait for a connection before throwing. Default: 5000. */
  DB_POOL_CONNECTION_TIMEOUT_MS: z.string().default("5000").transform(Number).pipe(z.number().int().min(0)),

  // ── Server ──────────────────────────────────────────────────────────────────
  /** HTTP port the Express server listens on. Default: 3001. */
  PORT: portString(3001),

  /** Set to "false" to disable the on-chain event indexer. Default: true. */
  ENABLE_INDEXER: booleanString(true),

  // ── Rate Limiting ────────────────────────────────────────────────────────────
  /** Sliding window duration in milliseconds. Default: 900000 (15 min). */
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number).pipe(z.number().int().min(1000)),

  /** Max requests per window per IP (GET endpoints). Default: 100. */
  RATE_LIMIT_GLOBAL_MAX: z.string().default("100").transform(Number).pipe(z.number().int().min(1)),

  /** Max requests per window per IP for write endpoints. Default: 20. */
  RATE_LIMIT_WRITE_MAX: z.string().default("20").transform(Number).pipe(z.number().int().min(1)),

  /** Max requests per window per IP for /user/:address/rewards. Default: 20. */
  RATE_LIMIT_REWARDS_MAX: z.string().default("20").transform(Number).pipe(z.number().int().min(1)),

  // ── Alerting ────────────────────────────────────────────────────────────────
  /** Slack Incoming Webhook URL for #alerts. Optional. */
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  /** Suppress alerts during maintenance windows. Default: false. */
  MAINTENANCE_MODE: booleanString(false),
});

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Parse and validate an env-like object against the schema.
 * Returns the typed result or throws with a human-readable message listing
 * every issue. Exported so tests can call it directly without side-effects.
 */
export function parseEnv(raw: NodeJS.ProcessEnv = process.env) {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new Error(
      `\n[env] ❌ Environment validation failed — fix the following before starting:\n\n${issues}\n\n` +
        `  See .env.example for documentation on each variable.\n`
    );
  }

  return result.data;
}

function validateEnv() {
  try {
    return parseEnv(process.env);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

// Only run validation (and potentially exit) when NOT in a test environment.
// Tests import parseEnv() directly and supply their own fixture data.
const isTest = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

export const env = isTest ? ({} as ReturnType<typeof parseEnv>) : validateEnv();
export type Env = typeof env;
