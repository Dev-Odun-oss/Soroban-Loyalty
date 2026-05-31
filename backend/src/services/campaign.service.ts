import { pool } from "../db";
import { writeAuditLog } from "./audit.service";

export interface Campaign {
  id: number;
  merchant: string;
  owner_address: string;
  name?: string | null;
  reward_amount: number;
  expiration: number;
  active: boolean;
  total_claimed: number;
  display_order: number;
  tx_hash?: string;
  image_url?: string;
  created_at: Date;
  deleted_at?: Date | null;
}

/**
 * Inserts or updates a campaign row and writes an audit log entry in one transaction.
 * Indexer-driven upserts rely on idempotent ON CONFLICT updates for safe replays.
 *
 * @param c - Campaign fields to persist (excluding auto-managed timestamps).
 * @returns Resolves when the row and audit log are committed.
 * @throws Re-throws any database error after rolling back the transaction.
 */
export async function upsertCampaign(c: Omit<Campaign, "created_at" | "display_order" | "deleted_at">): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO campaigns (id, merchant, owner_address, reward_amount, expiration, active, total_claimed, tx_hash, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         active = EXCLUDED.active,
         total_claimed = EXCLUDED.total_claimed,
         image_url = COALESCE(EXCLUDED.image_url, campaigns.image_url),
         updated_at = NOW()`,
      [c.id, c.merchant, c.owner_address ?? c.merchant, c.reward_amount, c.expiration, c.active, c.total_claimed, c.tx_hash ?? null, (c as any).image_url ?? null]
    );
    await writeAuditLog({
      actor: c.merchant,
      action: "campaign.create",
      entity_type: "campaign",
      entity_id: String(c.id),
      metadata: { reward_amount: c.reward_amount, expiration: c.expiration, tx_hash: c.tx_hash },
    }, client);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Maps a campaign-creation transaction hash to an image URL before the indexer processes the event.
 *
 * @param txHash - On-chain transaction hash for the campaign creation.
 * @param imageUrl - Public URL of the campaign image to attach later.
 * @returns Resolves when the mapping row is upserted.
 * @throws Propagates database errors from the insert/upsert query.
 */
export async function saveCampaignImageMapping(txHash: string, imageUrl: string): Promise<void> {
  await pool.query(
    `INSERT INTO campaign_image_mappings (tx_hash, image_url) VALUES ($1, $2)
     ON CONFLICT (tx_hash) DO UPDATE SET image_url = EXCLUDED.image_url`,
    [txHash, imageUrl]
  );
}

/**
 * Looks up a pre-registered campaign image URL by creation transaction hash.
 *
 * @param txHash - On-chain transaction hash used when the image was uploaded.
 * @returns The mapped image URL, or `null` if no mapping exists.
 * @throws Propagates database errors from the lookup query.
 */
export async function getCampaignImageByTxHash(txHash: string): Promise<string | null> {
  const { rows } = await pool.query<{ image_url: string }>(
    `SELECT image_url FROM campaign_image_mappings WHERE tx_hash = $1`,
    [txHash]
  );
  return rows[0]?.image_url ?? null;
}

export interface CampaignFilters {
  search?: string;
  status?: "active" | "inactive";
  expires_before?: number;
  expires_after?: number;
  owner?: string;
}

/**
 * Lists non-deleted campaigns with optional filters and pagination.
 *
 * @param limit - Maximum number of rows to return (default 20).
 * @param offset - Number of rows to skip for pagination (default 0).
 * @param filters - Optional search, status, and expiration window filters.
 * @returns Matching campaigns and the total count for the filter set.
 * @throws Propagates database errors from the list or count queries.
 */
export async function getCampaigns(
  limit = 20,
  offset = 0,
  filters: CampaignFilters = {}
): Promise<{ campaigns: Campaign[]; total: number }> {
  const conditions: string[] = ["deleted_at IS NULL"];
  const params: unknown[] = [];

  // Build parameterized WHERE clauses so filter values are never interpolated into SQL.
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  if (filters.status !== undefined) {
    params.push(filters.status === "active");
    conditions.push(`active = $${params.length}`);
  }
  if (filters.expires_before !== undefined) {
    params.push(filters.expires_before);
    conditions.push(`expiration <= $${params.length}`);
  }
  if (filters.expires_after !== undefined) {
    params.push(filters.expires_after);
    conditions.push(`expiration >= $${params.length}`);
  }
  if (filters.owner !== undefined) {
    params.push(filters.owner);
    conditions.push(`owner_address = $${params.length}`);
  }

  const where = conditions.join(" AND ");

  const listParams = [...params, limit, offset];
  const { rows } = await pool.query<Campaign>(
    `SELECT * FROM campaigns WHERE ${where} ORDER BY display_order ASC, created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  );
  const { rows: countRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM campaigns WHERE ${where}`,
    params
  );
  return { campaigns: rows, total: parseInt(countRows[0].count, 10) };
}

/**
 * Fetches a single active (non-deleted) campaign by its on-chain ID.
 *
 * @param id - Campaign identifier from the Soroban contract.
 * @returns The campaign row, or `null` if missing or soft-deleted.
 * @throws Propagates database errors from the lookup query.
 */
export async function getCampaignById(id: number): Promise<Campaign | null> {
  const { rows } = await pool.query<Campaign>(
    `SELECT * FROM campaigns WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Soft-deletes a campaign by setting `deleted_at` and optionally records a deactivate audit entry.
 *
 * @param id - Campaign identifier to deactivate.
 * @param actor - Merchant or admin address for the audit log (skipped when omitted).
 * @returns `true` if a row was updated, `false` if already deleted or not found.
 * @throws Re-throws any database error after rolling back the transaction.
 */
export async function softDeleteCampaign(id: number, actor?: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rowCount } = await client.query(
      `UPDATE campaigns SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    // Audit only when a row was actually soft-deleted and the caller supplied an actor.
    if ((rowCount ?? 0) > 0 && actor) {
      await writeAuditLog({
        actor,
        action: "campaign.deactivate",
        entity_type: "campaign",
        entity_id: String(id),
        metadata: {},
      }, client);
    }
    await client.query("COMMIT");
    return (rowCount ?? 0) > 0;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Restores a previously soft-deleted campaign by clearing `deleted_at`.
 *
 * @param id - Campaign identifier to restore.
 * @returns `true` if a deleted row was restored, `false` otherwise.
 * @throws Propagates database errors from the update query.
 */
export async function restoreCampaign(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE campaigns SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL`,
    [id]
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Persists the display order of campaigns for the merchant dashboard.
 *
 * @param order - Campaign IDs in the desired display order (index becomes `display_order`).
 * @returns Resolves when all positions are committed.
 * @throws Re-throws any database error after rolling back the transaction.
 */
export async function reorderCampaigns(order: number[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Assign contiguous display_order values so the UI sort is stable and gap-free.
    for (let i = 0; i < order.length; i++) {
      await client.query(
        `UPDATE campaigns SET display_order = $1 WHERE id = $2`,
        [i, order[i]]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
