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

  // ── Server ──────────────────────────────────────────────────────────────────
  /** HTTP port the Express server listens on. Default: 3001. */
  PORT: portString(3001),

  /** Set to "false" to disable the on-chain event indexer. Default: true. */
  ENABLE_INDEXER: booleanString(true),

  // ── Authentication ──────────────────────────────────────────────────────────
  /** Secret key for signing JWTs. Required. */
  JWT_SECRET: z.string().min(32),

  /** JWT expiry in hours. Default: 1. */
  JWT_EXPIRY_HOURS: z
    .string()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1).max(168)),

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
