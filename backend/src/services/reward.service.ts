import { pool } from "../db";
import { logger } from "../logger";
import type { Reward } from "../types";

export type { Reward };

interface ExplainRow {
  "QUERY PLAN": string;
}

/** Thrown when a second claim is attempted for the same user and campaign pair. */
export class DuplicateClaimError extends Error {
  constructor(message = "Reward already claimed for this campaign") {
    super(message);
    this.name = "DuplicateClaimError";
  }
}

function isUniqueViolation(err: unknown): err is { code: string } {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "23505";
}

const REWARDS_WITH_CAMPAIGN_SQL = `
  SELECT
    r.id,
    r.user_address,
    r.campaign_id,
    r.amount,
    r.redeemed,
    r.redeemed_amount,
    r.claimed_at,
    r.redeemed_at,
    c.reward_amount AS campaign_reward
  FROM rewards r
  JOIN campaigns c ON c.id = r.campaign_id
  WHERE r.user_address = $1
  ORDER BY r.claimed_at DESC
`;

const REWARDS_PAGINATED_SQL = `
  SELECT
    r.id,
    r.user_address,
    r.campaign_id,
    r.amount,
    r.redeemed,
    r.redeemed_amount,
    r.claimed_at,
    r.redeemed_at,
    c.reward_amount AS campaign_reward
  FROM rewards r
  JOIN campaigns c ON c.id = r.campaign_id
  WHERE r.user_address = $1
  ORDER BY r.claimed_at DESC
  LIMIT $2 OFFSET $3
`;

/**
 * Inserts a new reward or updates an existing one for a specific user and campaign.
 * Also ensures the user exists in the users table.
 * 
 * @param r - The reward object to upsert.
 * @returns A promise that resolves when the operation is complete.
 * @throws Will throw an error if the database query fails.
 */
export async function upsertReward(r: Omit<Reward, "id" | "claimed_at">): Promise<void> {
  // Ensure user row exists
  await pool.query(
    `INSERT INTO users (address) VALUES ($1) ON CONFLICT DO NOTHING`,
    [r.user_address]
  );

  if (r.tx_hash) {
    const result = await pool.query(
      `INSERT INTO rewards (user_address, campaign_id, amount, redeemed, redeemed_amount, tx_hash)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (tx_hash) DO NOTHING`,
      [r.user_address, r.campaign_id, r.amount, r.redeemed, r.redeemed_amount, r.tx_hash]
    );

    if (result.rowCount === 0) {
      logger.warn(`[reward] Duplicate reward event tx_hash=${r.tx_hash}`);
    }

    return;
  }

  await pool.query(
    `INSERT INTO rewards (user_address, campaign_id, amount, redeemed, redeemed_amount)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_address, campaign_id) DO UPDATE SET
       redeemed = EXCLUDED.redeemed,
       redeemed_amount = EXCLUDED.redeemed_amount,
       -- Stamp redeemed_at only on the transition to redeemed so replays do not move the timestamp.
       redeemed_at = CASE WHEN EXCLUDED.redeemed THEN NOW() ELSE rewards.redeemed_at END`,
    [r.user_address, r.campaign_id, r.amount, r.redeemed, r.redeemed_amount]
  );
}

/**
 * Inserts a claim exactly once per (user_address, campaign_id).
 * Relies on the DB unique constraint for concurrency-safe deduplication.
 *
 * @param r - Reward claim fields (user, campaign, amount, redemption state).
 * @returns Resolves when the claim row is inserted.
 * @throws {DuplicateClaimError} When the user has already claimed this campaign.
 * @throws Propagates other database errors from the insert.
 */
export async function createRewardClaim(r: Omit<Reward, "id" | "claimed_at">): Promise<void> {
  await pool.query(
    `INSERT INTO users (address) VALUES ($1) ON CONFLICT DO NOTHING`,
    [r.user_address]
  );

  try {
    await pool.query(
      `INSERT INTO rewards (user_address, campaign_id, amount, redeemed, redeemed_amount)
       VALUES ($1,$2,$3,$4,$5)`,
      [r.user_address, r.campaign_id, r.amount, r.redeemed, r.redeemed_amount]
    );
  } catch (err) {
    // Postgres 23505 = unique_violation on (user_address, campaign_id).
    if (isUniqueViolation(err)) {
      throw new DuplicateClaimError();
    }
    throw err;
  }
}

/**
 * Retrieves rewards associated with a specific user address, with optional pagination.
 *
 * @param address - The Stellar public key of the user.
 * @param limit - Maximum number of rewards to return (omit for all).
 * @param offset - Number of rewards to skip (default 0).
 * @returns A promise that resolves to an array of Reward objects.
 * @throws Will throw an error if the database query fails.
 */
export async function getRewardsByUser(address: string, limit?: number, offset = 0): Promise<Reward[]> {
  if (limit !== undefined) {
    const { rows } = await pool.query<Reward>(REWARDS_PAGINATED_SQL, [address, limit, offset]);
    return rows;
  }
  const { rows } = await pool.query<Reward>(REWARDS_WITH_CAMPAIGN_SQL, [address]);
  return rows;
}

/**
 * Retrieves a paginated list of rewards for a user with total count.
 *
 * @param address - The Stellar public key of the user.
 * @param limit - Maximum number of rows to return (default 20, max 100).
 * @param offset - Number of rows to skip (default 0).
 * @returns Paginated rewards and total count.
 */
export async function getRewardsByUserPaginated(
  address: string,
  limit: number,
  offset: number
): Promise<{ data: Reward[]; total: number; limit: number; offset: number }> {
  const { rows } = await pool.query<Reward>(
    `${REWARDS_WITH_CAMPAIGN_SQL} LIMIT $2 OFFSET $3`,
    [address, limit, offset]
  );
  const { rows: countRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM rewards WHERE user_address = $1`,
    [address]
  );
  return {
    data: rows,
    total: parseInt(countRows[0].count, 10),
    limit,
    offset,
  };
}

/**
 * Executes EXPLAIN ANALYZE against the optimized rewards-by-user query.
 * Used to verify query plan and performance characteristics during tests/ops.
 *
 * @param address - Stellar public key of the user whose plan is analyzed.
 * @returns Human-readable query plan lines from Postgres.
 * @throws Propagates database errors from EXPLAIN ANALYZE.
 */
export async function explainRewardsByUserQuery(address: string): Promise<string[]> {
  const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${REWARDS_WITH_CAMPAIGN_SQL}`;
  const { rows } = await pool.query<ExplainRow>(explainSql, [address]);
  return rows.map((row) => row["QUERY PLAN"]);
}

/**
 * Records a blockchain transaction in the local database for auditing and indexing.
 * 
 * @param txHash - The unique hash of the transaction.
 * @param type - The type of transaction (e.g., 'claim', 'redeem', 'create_campaign').
 * @param userAddress - The address of the user involved, if any.
 * @param campaignId - The ID of the related campaign, if any.
 * @param amount - The amount involved in the transaction, if any.
 * @param ledger - The ledger sequence number.
 * @returns A promise that resolves when the record is inserted.
 * @throws Will throw an error if the database query fails.
 */
export async function recordTransaction(
  txHash: string,
  type: string,
  userAddress: string | null,
  campaignId: number | null,
  amount: number | null,
  ledger: number | null
): Promise<void> {
  await pool.query(
    `INSERT INTO transactions (tx_hash, type, user_address, campaign_id, amount, ledger)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (tx_hash) DO NOTHING`,
    [txHash, type, userAddress, campaignId, amount, ledger]
  );
}
