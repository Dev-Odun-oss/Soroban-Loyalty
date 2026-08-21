import { pool } from "../db";
import { redisClient } from "../lib/redis";
import type { AnalyticsData, CampaignAnalyticsData } from "../types";

export type { AnalyticsData, CampaignAnalyticsData };

/**
 * Aggregates reward claim metrics for the merchant analytics dashboard.
 *
 * @param days - Rolling window length in days (claims before this cutoff are excluded).
 * @returns Totals, redemption rate, top campaigns, and daily claim counts.
 * @throws Propagates database errors from any of the parallel aggregate queries.
 */
export async function getAnalytics(days: number): Promise<AnalyticsData> {
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

  // Run independent aggregates in parallel to keep dashboard latency low.
  const [totals, perCampaign, overTime] = await Promise.all([
    pool.query<{ total_claims: string; total_lyt: string; redeemed: string }>(
      `SELECT
         COUNT(*) AS total_claims,
         COALESCE(SUM(r.amount), 0) AS total_lyt,
         COUNT(*) FILTER (WHERE r.redeemed) AS redeemed
       FROM rewards r
       WHERE r.claimed_at >= $1`,
      [since]
    ),
    pool.query<{ campaign_id: number; claims: string }>(
      `SELECT campaign_id, COUNT(*) AS claims
       FROM rewards
       WHERE claimed_at >= $1
       GROUP BY campaign_id
       ORDER BY claims DESC
       LIMIT 10`,
      [since]
    ),
    pool.query<{ date: string; claims: string }>(
      `SELECT DATE(claimed_at) AS date, COUNT(*) AS claims
       FROM rewards
       WHERE claimed_at >= $1
       GROUP BY DATE(claimed_at)
       ORDER BY date ASC`,
      [since]
    ),
  ]);

  const { total_claims, total_lyt, redeemed } = totals.rows[0];
  const totalClaimsNum = parseInt(total_claims, 10);
  const redeemedNum = parseInt(redeemed, 10);

  // Redemption rate is a percentage of claims that have been marked redeemed in-window.
  return {
    totalClaims: totalClaimsNum,
    totalLYT: parseFloat(total_lyt),
    redemptionRate: totalClaimsNum > 0 ? Math.round((redeemedNum / totalClaimsNum) * 100) : 0,
    claimsPerCampaign: perCampaign.rows.map((r) => ({
      name: `#${r.campaign_id}`,
      claims: parseInt(r.claims, 10),
    })),
    claimsOverTime: overTime.rows.map((r) => ({
      date: r.date,
      claims: parseInt(r.claims, 10),
    })),
  };
}

const CACHE_KEY = "analytics:campaigns";
const CACHE_TTL = 300; // 5 minutes

export async function getCampaignAnalytics(): Promise<CampaignAnalyticsData> {
  const cached = await redisClient.get(CACHE_KEY);
  if (cached) return JSON.parse(cached) as CampaignAnalyticsData;

  const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  const [totals, perDay, topCampaigns] = await Promise.all([
    pool.query<{ total_campaigns: string; total_claims: string }>(
      `SELECT
         (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
         COUNT(*) AS total_claims
       FROM rewards
       WHERE claimed_at >= $1`,
      [since]
    ),
    pool.query<{ date: string; count: string }>(
      `SELECT DATE(claimed_at) AS date, COUNT(*) AS count
       FROM rewards
       WHERE claimed_at >= $1
       GROUP BY DATE(claimed_at)
       ORDER BY date ASC`,
      [since]
    ),
    pool.query<{ campaign_id: number; claims: string }>(
      `SELECT campaign_id, COUNT(*) AS claims
       FROM rewards
       WHERE claimed_at >= $1
       GROUP BY campaign_id
       ORDER BY claims DESC
       LIMIT 5`,
      [since]
    ),
  ]);

  const result: CampaignAnalyticsData = {
    total_campaigns: parseInt(totals.rows[0].total_campaigns, 10),
    total_claims: parseInt(totals.rows[0].total_claims, 10),
    claims_per_day: perDay.rows.map((r) => ({ date: r.date, count: parseInt(r.count, 10) })),
    top_campaigns: topCampaigns.rows.map((r) => ({ campaign_id: r.campaign_id, claims: parseInt(r.claims, 10) })),
  };

  await redisClient.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result));
  return result;
}
