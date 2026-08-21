/**
 * @module types
 * Central type definitions for the Soroban Loyalty backend.
 *
 * Import from this module instead of defining types inline in service files:
 * ```ts
 * import type { Campaign, Reward, TransactionRecord } from "@/types";
 * ```
 */

// ── Campaign ──────────────────────────────────────────────────────────────────

/**
 * A loyalty campaign created by a merchant on the Soroban contract.
 * Rows are indexed from on-chain events and stored in the `campaigns` table.
 */
export interface Campaign {
  /** Auto-incremented on-chain campaign identifier. */
  id: number;
  /** Stellar public key of the merchant who created the campaign. */
  merchant: string;
  /** Stellar public key used for ownership checks (defaults to `merchant`). */
  owner_address: string;
  /** Optional human-readable campaign name. */
  name?: string | null;
  /** Number of LYT tokens awarded per claim. */
  reward_amount: number;
  /** Unix timestamp (seconds) at which the campaign expires. */
  expiration: number;
  /** Whether the campaign is currently accepting new claims. */
  active: boolean;
  /** Running total of reward claims. */
  total_claimed: number;
  /** Sort position in the merchant dashboard (lower = higher). */
  display_order: number;
  /** On-chain transaction hash from the campaign-creation event. */
  tx_hash?: string;
  /** Public URL of the campaign banner image. */
  image_url?: string;
  /** Timestamp when the row was first inserted. */
  created_at: Date;
  /** Timestamp of soft-deletion; null while the campaign is live. */
  deleted_at?: Date | null;
}

/**
 * Optional filters for {@link getCampaigns}.
 * All fields are combined with AND logic.
 */
export interface CampaignFilters {
  /** Case-insensitive substring match against the campaign `name`. */
  search?: string;
  /** Restrict results to active or inactive campaigns. */
  status?: "active" | "inactive";
  /** Only return campaigns that expire at or before this Unix timestamp. */
  expires_before?: number;
  /** Only return campaigns that expire at or after this Unix timestamp. */
  expires_after?: number;
  /** Filter by the merchant's Stellar public key (`owner_address`). */
  owner?: string;
}

// ── Reward ────────────────────────────────────────────────────────────────────

/**
 * A reward earned by a user for claiming a campaign.
 * Rows are stored in the `rewards` table and updated when redeemed.
 */
export interface Reward {
  /** UUID primary key. */
  id: string;
  /** Stellar public key of the reward owner. */
  user_address: string;
  /** ID of the campaign this reward belongs to. */
  campaign_id: number;
  /** LYT amount awarded at claim time. */
  amount: number;
  /** Whether any portion of the reward has been redeemed (burned). */
  redeemed: boolean;
  /** LYT amount already burned via redeem. */
  redeemed_amount: number;
  /** Timestamp when the reward was claimed. */
  claimed_at: Date;
  /** Timestamp when the reward was redeemed; absent if not yet redeemed. */
  redeemed_at?: Date;
  /** On-chain transaction hash for the claim event; null for legacy rows. */
  tx_hash?: string | null;
  /** `reward_amount` from the parent campaign, joined at query time. */
  campaign_reward?: number;
}

// ── Transaction ───────────────────────────────────────────────────────────────

/**
 * An indexed on-chain transaction stored in the `transactions` table.
 */
export interface TransactionRecord {
  /** Unique on-chain transaction hash. */
  tx_hash: string;
  /** Event type: `"claim"`, `"redeem"`, or `"create_campaign"`. */
  type: string;
  /** Stellar public key of the user involved. */
  user_address: string;
  /** ID of the related campaign, or null for non-campaign transactions. */
  campaign_id: number | null;
  /** Campaign name joined from the campaigns table, or null. */
  campaign_name: string | null;
  /** Token amount involved; 0 for events with no token transfer. */
  amount: number;
  /** Ledger sequence number when the transaction was finalized. */
  ledger: number;
  /** Timestamp when the row was inserted by the indexer. */
  created_at: Date;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Aggregated reward-claim metrics returned by the analytics endpoint.
 */
export interface AnalyticsData {
  /** Total number of reward claims in the requested time window. */
  totalClaims: number;
  /** Total LYT tokens issued across all claims. */
  totalLYT: number;
  /** Percentage of claims that have been redeemed (0–100). */
  redemptionRate: number;
  /** Top campaigns by claim count, for bar-chart display. */
  claimsPerCampaign: { name: string; claims: number }[];
  /** Daily claim counts over the time window, for line-chart display. */
  claimsOverTime: { date: string; claims: number }[];
}

/**
 * Broader campaign-level analytics, cached in Redis for 5 minutes.
 */
export interface CampaignAnalyticsData {
  /** Total number of campaigns in the database. */
  total_campaigns: number;
  /** Total claims in the last 30 days. */
  total_claims: number;
  /** Daily claim counts for the last 30 days. */
  claims_per_day: { date: string; count: number }[];
  /** Top 5 campaigns by claim count in the last 30 days. */
  top_campaigns: { campaign_id: number; claims: number }[];
}

// ── Audit ─────────────────────────────────────────────────────────────────────

/**
 * Permitted values for the `action` field of an {@link AuditLogEntry}.
 */
export type AuditAction =
  | "campaign.create"
  | "campaign.deactivate"
  | "reward.claim"
  | "reward.redeem";

/**
 * A single audit log entry recording a privileged or on-chain-derived action.
 */
export interface AuditLogEntry {
  /** UUID primary key. */
  id: string;
  /** Stellar public key of the merchant or system actor. */
  actor: string;
  /** Categorised action that was performed. */
  action: AuditAction;
  /** Domain entity type, e.g. `"campaign"` or `"reward"`. */
  entity_type: string;
  /** String representation of the entity's primary key. */
  entity_id: string;
  /** Free-form metadata snapshot captured at the time of the action. */
  metadata: Record<string, unknown>;
  /** Timestamp when the log entry was written. */
  created_at: Date;
}

/**
 * Optional filters for {@link queryAuditLogs}.
 */
export interface AuditLogFilters {
  /** Filter by actor public key. */
  actor?: string;
  /** Filter by action type. */
  action?: AuditAction;
  /** Filter by entity domain (e.g. `"campaign"`). */
  entity_type?: string;
  /** Filter by specific entity ID. */
  entity_id?: string;
  /** Only include entries created at or after this date. */
  since?: Date;
  /** Only include entries created at or before this date. */
  until?: Date;
  /** Maximum rows to return (default 50). */
  limit?: number;
  /** Rows to skip for pagination (default 0). */
  offset?: number;
}
