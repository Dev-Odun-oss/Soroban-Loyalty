import cron from "node-cron";
import { pool } from "../db";
import { logger } from "../logger";

/**
 * Deactivates all campaigns whose expiration timestamp is in the past.
 * Runs as a single batch UPDATE so the operation is atomic and efficient.
 *
 * @returns Number of campaigns deactivated.
 */
export async function deactivateExpiredCampaigns(): Promise<number> {
  const { rowCount } = await pool.query(
    `UPDATE campaigns
     SET active = false
     WHERE active = true
       AND expiration < EXTRACT(EPOCH FROM NOW())
       AND deleted_at IS NULL`
  );
  return rowCount ?? 0;
}

/**
 * Starts a cron job that runs every 5 minutes to deactivate expired campaigns.
 * Errors are caught and logged without crashing the server.
 *
 * @returns The scheduled task (call `.stop()` to cancel).
 */
export function startExpiredCampaignJob(): cron.ScheduledTask {
  return cron.schedule("*/5 * * * *", async () => {
    try {
      const count = await deactivateExpiredCampaigns();
      if (count > 0) {
        logger.info(`Deactivated ${count} expired campaign(s)`);
      }
    } catch (err) {
      logger.error("Failed to deactivate expired campaigns", err as Error);
    }
  });
}
