/**
 * indexer.ts — Soroban event indexer with exponential backoff and per-event retry.
 *
 * Improvements over the naive fixed-interval poller:
 *  - Exponential backoff on RPC failures (base 2s, cap 60s, jitter ±20%)
 *  - Per-event retry up to MAX_EVENT_RETRIES times before dead-lettering
 *  - Last processed event paging token persisted to DB so restarts resume
 *    after the last committed batch (idempotent upserts handle replays)
 *  - Indexer lag metric: current chain tip minus last processed ledger
 *  - Backoff delay and dead-letter counters exposed as Prometheus metrics
 */

import { SorobanRpc, xdr } from "@stellar/stellar-sdk";
import { rpcServer } from "../soroban";
import { upsertCampaign } from "../services/campaign.service";
import { upsertReward, recordTransaction } from "../services/reward.service";
import { pool } from "../db";
import { logger } from "../logger";
import {
  indexerLagBlocks,
  indexerEventsTotal,
  indexerPollErrors,
  indexerDeadLetters,
  indexerBackoffMs,
} from "../metrics";
import { env } from "../env";

// ── Constants ─────────────────────────────────────────────────────────────────

const REWARDS_CONTRACT  = env.REWARDS_CONTRACT_ID;
const CAMPAIGN_CONTRACT = env.CAMPAIGN_CONTRACT_ID;
const TOKEN_CONTRACT    = env.TOKEN_CONTRACT_ID;

const POLL_INTERVAL_MS   = 5_000;   // base happy-path interval
const BACKOFF_BASE_MS    = 2_000;   // first retry wait
const BACKOFF_MAX_MS     = 60_000;  // ceiling
const BACKOFF_MULTIPLIER = 2;
const JITTER_FACTOR      = 0.2;     // ±20% random jitter
const MAX_EVENT_RETRIES  = 3;       // per-event retries before dead-letter

// Ledger to start from on a cold start (no saved checkpoint).
// Configurable via START_LEDGER env var so operators can skip historical replay.
const START_LEDGER = env.START_LEDGER ?? 1;

// ── Backoff state (module-level so tests can inspect/reset) ───────────────────

export let currentBackoffMs = 0;    // 0 = no active backoff
let consecutiveFailures    = 0;

let indexerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Reads the persisted Soroban RPC event paging token from `indexer_state`.
 *
 * @returns The last saved paging token, or `undefined` on a cold start.
 * @throws Propagates database errors from the lookup query.
 */
export async function getCursor(): Promise<string | undefined> {
  const { rows } = await pool.query<{ value: string }>(
    `SELECT value FROM indexer_state WHERE key = 'cursor' LIMIT 1`
  );
  return rows[0]?.value;
}

/**
 * Reads the last processed ledger sequence number from `indexer_state`.
 *
 * @returns The last saved ledger number, or `undefined` on a cold start.
 */
export async function getLastLedger(): Promise<number | undefined> {
  const { rows } = await pool.query<{ value: string }>(
    `SELECT value FROM indexer_state WHERE key = 'last_ledger' LIMIT 1`
  );
  return rows[0] ? parseInt(rows[0].value, 10) : undefined;
}

/**
 * Persists the Soroban RPC paging token so the next poll continues after this event.
 *
 * @param cursor - Paging token from the last event in a successfully polled batch.
 * @returns Resolves when the cursor row is upserted.
 * @throws Propagates database errors from the upsert query.
 */
export async function saveCursor(cursor: string): Promise<void> {
  await pool.query(
    `INSERT INTO indexer_state (key, value) VALUES ('cursor', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [cursor]
  );
}

/**
 * Atomically persists the paging cursor and last processed ledger in a single transaction.
 * This ensures the checkpoint is always consistent: a crash mid-batch will not leave
 * the cursor advanced past the last committed ledger.
 *
 * @param cursor - Paging token from the last event in the batch.
 * @param ledger - Ledger sequence number of the last processed event.
 * @returns Resolves when both rows are committed.
 * @throws Re-throws any database error after rolling back.
 */
export async function saveCheckpoint(cursor: string, ledger: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO indexer_state (key, value) VALUES ('cursor', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [cursor]
    );
    await client.query(
      `INSERT INTO indexer_state (key, value) VALUES ('last_ledger', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(ledger)]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Persist a failed event to the dead_letter_events table for later inspection. */
async function deadLetterEvent(
  event: SorobanRpc.Api.RawEventResponse,
  lastError: Error
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO dead_letter_events (tx_hash, contract_id, paging_token, payload, error, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (tx_hash) DO NOTHING`,
      [
        event.txHash,
        event.contractId ?? null,
        event.pagingToken,
        JSON.stringify(event),
        lastError.message,
      ]
    );
  } catch (dbErr) {
    // Never let dead-letter writes crash the indexer
    logger.error("[indexer] Failed to write dead-letter event", dbErr instanceof Error ? dbErr : new Error(String(dbErr)));
  }
  indexerDeadLetters.inc();
  logger.error(`[indexer] Dead-lettered event txHash=${event.txHash}`, lastError);
}

/**
 * Creates the `indexer_state` table if it does not exist (cursor storage).
 *
 * @returns Resolves when the DDL has been applied.
 * @throws Propagates database errors from the CREATE TABLE statement.
 */
export async function ensureIndexerTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS indexer_state (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

/** Ensure the dead_letter_events table exists. */
async function ensureDeadLetterTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dead_letter_events (
      tx_hash      VARCHAR(128) PRIMARY KEY,
      contract_id  VARCHAR(128),
      paging_token TEXT,
      payload      JSONB,
      error        TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// ── XDR decoders ─────────────────────────────────────────────────────────────

/**
 * Decodes a Soroban `Address` ScVal to its string representation.
 *
 * @param val - XDR scalar value containing an address.
 * @returns Stellar/strkey address string.
 */
export function decodeAddress(val: xdr.ScVal): string {
  return val.address().toString();
}

/**
 * Decodes a Soroban `i128` ScVal to a JavaScript number.
 * Safe for reward amounts within typical loyalty token ranges.
 *
 * @param val - XDR scalar value containing a signed 128-bit integer.
 * @returns Numeric value (hi/lo limbs combined).
 */
export function decodeI128(val: xdr.ScVal): number {
  const hi = val.i128().hi().toBigInt();
  const lo = val.i128().lo().toBigInt();
  return Number((hi << 64n) | lo);
}

/**
 * Decodes a Soroban `u64` ScVal to a JavaScript number.
 *
 * @param val - XDR scalar value containing an unsigned 64-bit integer.
 * @returns Numeric value.
 */
export function decodeU64(val: xdr.ScVal): number {
  return Number(val.u64().toBigInt());
}

// ── Per-event processing with retry ──────────────────────────────────────────

/**
 * Processes a single Soroban event with bounded retries.
 * If all retries are exhausted the event is dead-lettered and processing
 * continues (one bad event never blocks the whole indexer).
 *
 * @param event - Raw contract event from the Soroban RPC.
 * @returns Resolves when the event is handled or dead-lettered.
 * @throws Does not throw after retries are exhausted (event is dead-lettered instead).
 */
export async function processEventWithRetry(
  event: SorobanRpc.Api.RawEventResponse
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_EVENT_RETRIES; attempt++) {
    try {
      await processEvent(event);
      return; // success
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      logger.warn(
        `[indexer] Event processing attempt ${attempt}/${MAX_EVENT_RETRIES} failed for txHash=${event.txHash}: ${lastError.message}`
      );
      if (attempt < MAX_EVENT_RETRIES) {
        await sleep(calcBackoff(attempt));
      }
    }
  }

  await deadLetterEvent(event, lastError!);
}

async function processEvent(event: SorobanRpc.Api.RawEventResponse): Promise<void> {
  if (event.type !== "contract") return;

  const topics    = event.topic.map((t) => xdr.ScVal.fromXDR(t, "base64"));
  const eventName = topics[0]?.sym() ?? "";

  if (event.contractId === CAMPAIGN_CONTRACT && eventName === "CAM_CRT") {
    const id       = decodeU64(topics[2]);
    const merchant = decodeAddress(xdr.ScVal.fromXDR(event.value, "base64"));
    
    // Fetch mapped image URL if exists
    const { getCampaignImageByTxHash } = require("../services/campaign.service");
    const imageUrl = await getCampaignImageByTxHash(event.txHash);

    await upsertCampaign({
      id,
      merchant,
      reward_amount: 0,
      expiration: 0,
      active: true,
      total_claimed: 0,
      tx_hash: event.txHash,
      image_url: imageUrl || undefined,
    } as any);
    await recordTransaction(event.txHash, "campaign_created", merchant, id, null, event.ledger);
    logger.info(`[indexer] CampaignCreated id=${id} merchant=${merchant}`);
  }

  if (event.contractId === CAMPAIGN_CONTRACT && eventName === "CAM_DEACT") {
    // topics: [CAM_DEACT, "id", id_val], value: merchant_address
    const id = decodeU64(topics[2]);
    const merchant = decodeAddress(xdr.ScVal.fromXDR(event.value, "base64"));
    await upsertCampaign({
      id,
      merchant,
      reward_amount: 0,
      expiration: 0,
      active: false,
      total_claimed: 0,
      tx_hash: event.txHash,
    });
    await recordTransaction(event.txHash, "campaign_deactivated", merchant, id, null, event.ledger);
    console.log(`[indexer] CampaignDeactivated id=${id} merchant=${merchant}`);
  }

  if (event.contractId === TOKEN_CONTRACT && eventName === "MINT") {
    // topics: [MINT, "to", to_addr], value: (amount, total_supply)
    const to = decodeAddress(topics[2]);
    const valueVec = xdr.ScVal.fromXDR(event.value, "base64").vec()!;
    const amount = decodeI128(valueVec[0]);
    const totalSupply = decodeI128(valueVec[1]);
    await recordTransaction(event.txHash, "mint", to, null, amount, event.ledger);
    console.log(`[indexer] TokenMinted to=${to} amount=${amount} totalSupply=${totalSupply}`);
  }

  if (event.contractId === TOKEN_CONTRACT && eventName === "BURN") {
    // topics: [BURN, "from", from_addr], value: (amount, total_supply)
    const from = decodeAddress(topics[2]);
    const valueVec = xdr.ScVal.fromXDR(event.value, "base64").vec()!;
    const amount = decodeI128(valueVec[0]);
    const totalSupply = decodeI128(valueVec[1]);
    await recordTransaction(event.txHash, "burn", from, null, amount, event.ledger);
    console.log(`[indexer] TokenBurned from=${from} amount=${amount} totalSupply=${totalSupply}`);
  }

  if (event.contractId === REWARDS_CONTRACT && eventName === "RWD_CLM") {
    const user      = decodeAddress(topics[2]);
    const valueVec  = xdr.ScVal.fromXDR(event.value, "base64").vec()!;
    const campaignId = decodeU64(valueVec[0]);
    const amount    = decodeI128(valueVec[1]);
    await upsertReward({ user_address: user, campaign_id: campaignId, amount, redeemed: false, redeemed_amount: 0 });
    await recordTransaction(event.txHash, "claim", user, campaignId, amount, event.ledger);
    logger.info(`[indexer] RewardClaimed user=${user} campaign=${campaignId} amount=${amount}`);
  }

  if (event.contractId === REWARDS_CONTRACT && eventName === "RWD_RDM") {
    const user   = decodeAddress(topics[2]);
    const amount = decodeI128(xdr.ScVal.fromXDR(event.value, "base64"));
    await recordTransaction(event.txHash, "redeem", user, null, amount, event.ledger);
    logger.info(`[indexer] RewardRedeemed user=${user} amount=${amount}`);
  }
}

// ── Poll loop ─────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  try {
    const cursor  = await getCursor();
    const filters: SorobanRpc.Api.EventFilter[] = [
      { type: "contract", contractIds: [CAMPAIGN_CONTRACT, REWARDS_CONTRACT] },
    ];

    // Ledger cursor strategy:
    // - Cold start (no saved paging token): set startLedger to START_LEDGER env var
    //   (defaults to 1 for full history; set to a recent ledger to skip replay).
    // - Warm start: pass the persisted paging token as `cursor` so each poll fetches only
    //   events after the last committed position—no gaps and no full-chain replay.
    // - After a non-empty batch: atomically save the final event's pagingToken and ledger
    //   in one transaction; a crash mid-batch may re-deliver some events, which is safe
    //   because service upserts are idempotent.
    const result = await rpcServer.getEvents({
      startLedger: cursor ? undefined : START_LEDGER,
      cursor,
      filters,
      limit: 100,
    });

    // Process each event individually with per-event retry
    for (const event of result.events) {
      await processEventWithRetry(event as unknown as SorobanRpc.Api.RawEventResponse);
      indexerEventsTotal.inc();
    }

    // Atomically persist cursor and last ledger after the batch so a crash mid-batch
    // re-processes (idempotent upserts in the service layer handle duplicates safely).
    if (result.events.length > 0) {
      const last = result.events[result.events.length - 1] as unknown as SorobanRpc.Api.RawEventResponse;
      await saveCheckpoint(last.pagingToken, Number(last.ledger));
    }

    // Update lag metric
    try {
      const latestLedger = await rpcServer.getLatestLedger();
      const processedLedger =
        result.events.length > 0
          ? Number((result.events[result.events.length - 1] as unknown as SorobanRpc.Api.RawEventResponse).ledger)
          : latestLedger.sequence;
      indexerLagBlocks.set(Math.max(0, latestLedger.sequence - processedLedger));
    } catch {
      // non-critical — skip lag update
    }

    // Successful poll — reset backoff
    if (consecutiveFailures > 0) {
      logger.info("[indexer] RPC recovered — resetting backoff");
      consecutiveFailures = 0;
      currentBackoffMs    = 0;
      indexerBackoffMs.set(0);
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    consecutiveFailures++;
    indexerPollErrors.inc();

    currentBackoffMs = calcBackoff(consecutiveFailures);
    indexerBackoffMs.set(currentBackoffMs);

    const isTimeout =
      error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("timed out");

    if (isTimeout) {
      logger.critical("[indexer] RPC timeout", error);
    } else {
      logger.error(`[indexer] Poll error (failure #${consecutiveFailures}), backing off ${currentBackoffMs}ms`, error);
    }

    await sleep(currentBackoffMs);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Starts the background event indexer.
 * Polls the Soroban RPC for campaign and reward contract events and persists them locally.
 *
 * @returns Resolves after schema setup and the first poll cycle is scheduled.
 * @throws Propagates errors from table setup or the initial poll if unrecoverable.
 */
export async function startIndexer(): Promise<void> {
  await ensureIndexerTable();
  await ensureDeadLetterTable();
  logger.info("[indexer] started");

  const loop = async () => {
    await poll();
    // Schedule next tick — use the current backoff if we're in a failure
    // state, otherwise use the normal interval
    const delay = currentBackoffMs > 0 ? currentBackoffMs : POLL_INTERVAL_MS;
    setTimeout(loop, delay);
  };

  // Run immediately then on interval
  await poll();
  indexerInterval = setInterval(poll, POLL_INTERVAL_MS);
}

/**
 * Stops the background indexer polling loop.
 * Called during graceful shutdown to prevent polling after the server exits.
 *
 * @returns Nothing; clears the interval handle when running.
 */
export function stopIndexer(): void {
  if (indexerInterval !== null) {
    clearInterval(indexerInterval);
    indexerInterval = null;
    console.log("[indexer] stopped");
  }
}

/**
 * Computes exponential backoff delay with random jitter for RPC failures.
 *
 * @param failures - Consecutive failure count (0 returns the base delay).
 * @returns Delay in milliseconds, clamped between BACKOFF_BASE_MS and BACKOFF_MAX_MS.
 */
export function calcBackoff(failures: number): number {
  if (failures <= 0) return BACKOFF_BASE_MS;
  const delay = BACKOFF_BASE_MS * Math.pow(BACKOFF_MULTIPLIER, failures - 1);
  const maxJitter = delay * JITTER_FACTOR;
  // Jitter spreads retry storms when multiple indexer instances recover together.
  const jitter = Math.random() * (maxJitter * 2) - maxJitter;
  return Math.max(BACKOFF_BASE_MS, Math.min(BACKOFF_MAX_MS, delay + jitter));
}

/**
 * Resets module-level backoff state (used by tests and after RPC recovery).
 *
 * @returns Nothing; sets `currentBackoffMs` to zero.
 */
export function resetBackoff(): void {
  currentBackoffMs = 0;
}

/**
 * Promise-based sleep helper for poll backoff and per-event retries.
 *
 * @param ms - Milliseconds to wait.
 * @returns Resolves after the delay elapses.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));