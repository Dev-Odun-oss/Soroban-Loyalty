/**
 * @module types
 * Central type definitions for the Soroban Loyalty frontend.
 *
 * These types mirror the backend API response shapes. Import from here instead
 * of relying on inline definitions in `lib/api.ts` or component files:
 * ```ts
 * import type { Campaign, Reward, TransactionRecord } from "@/types";
 * ```
 *
 * ### Differences from backend types
 * - Date fields arrive from the REST API as ISO-8601 strings, not `Date` objects.
 * - `Campaign` omits server-only fields (`owner_address`, `display_order`,
 *   `created_at`, `deleted_at`, `tx_hash`).
 * - `Reward` omits indexer-only fields (`redeemed_at`, `tx_hash`, `campaign_reward`).
 * - `TransactionRecord` adds `campaign_name` (joined by the backend query).
 */

// ── Campaign ──────────────────────────────────────────────────────────────────

/**
 * A loyalty campaign as returned by `GET /campaigns` and `GET /campaigns/:id`.
 */
export interface Campaign {
  /** Numeric on-chain campaign identifier. */
  id: number;
  /** Stellar public key of the merchant who created the campaign. */
  merchant: string;
  /** Optional human-readable campaign name. */
  name?: string | null;
  /** LYT tokens awarded per claim. */
  reward_amount: number;
  /** Unix timestamp (seconds) at which the campaign expires. */
  expiration: number;
  /** Whether the campaign is currently accepting new claims. */
  active: boolean;
  /** Running total of reward claims. */
  total_claimed: number;
  /** Public URL of the campaign banner image. */
  image_url?: string;
}

// ── Reward ────────────────────────────────────────────────────────────────────

/**
 * A reward earned by the connected user, as returned by
 * `GET /user/:address/rewards`.
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
  /** ISO-8601 timestamp when the reward was claimed. */
  claimed_at: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Aggregated metrics returned by `GET /analytics?days=N`.
 */
export interface AnalyticsData {
  /** Total reward claims in the requested time window. */
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

// ── Transaction ───────────────────────────────────────────────────────────────

/**
 * An indexed on-chain transaction as returned by
 * `GET /user/:address/transactions`.
 */
export interface TransactionRecord {
  /** Unique on-chain transaction hash. */
  tx_hash: string;
  /** Event type: `"claim"`, `"redeem"`, or `"create_campaign"`. */
  type: string;
  /** Stellar public key of the user involved. */
  user_address: string;
  /** ID of the related campaign, or null. */
  campaign_id: number | null;
  /** Campaign name joined by the backend, or null. */
  campaign_name: string | null;
  /** Token amount involved. */
  amount: number;
  /** Ledger sequence number when the transaction was finalized. */
  ledger: number;
  /** ISO-8601 timestamp when the indexer recorded the transaction. */
  created_at: string;
}
