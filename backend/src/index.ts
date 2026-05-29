import dotenv from "dotenv";
import { loadSecrets } from "./secrets";
import { campaignRouter } from "./routes/campaign.routes";
import { rewardRouter } from "./routes/reward.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { startIndexer, stopIndexer } from "./indexer/indexer";
import { startExpiredCampaignJob } from "./jobs/expiredCampaigns";
import { rpcServer } from "./soroban";
import { pool } from "./db";
import { registry, httpRequestsTotal, httpRequestDuration, dbPoolActive, dbPoolIdle, dbPoolWaiting } from "./metrics";
import { logger, requestLogger, errorAlertMiddleware } from "./logger";

// ── Startup sequence ──────────────────────────────────────────────────────────
// 1. Load .env (no-op in production where vars are injected)
// 2. Pull secrets from AWS Secrets Manager (populates process.env)
// 3. Validate ALL env vars via Zod — exits with a clear error if anything is
//    missing or malformed. Must happen before any service is initialised.
dotenv.config();
await loadSecrets();
const app = createApp();

process.on("unhandledRejection", (reason) => {
  logger.critical(
    "Unhandled promise rejection",
    reason instanceof Error ? reason : new Error(String(reason))
  );
});
process.on("uncaughtException", (err) => {
  Sentry.captureException(err);
  logger.critical("Uncaught exception", err);
  process.exit(1);
});

const PORT = process.env.PORT ?? 3001;

const server = app.listen(PORT, async () => {
  logger.info(`Server listening on port ${PORT}`);
  if (process.env.ENABLE_INDEXER !== "false") {
    await startIndexer();
  }
  startExpiredCampaignJob();
});

// ── Graceful shutdown ──────────────────────────────────────────────────────────
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, initiating graceful shutdown...`);

  // Stop accepting new connections
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  logger.info("HTTP server stopped accepting new connections");

  // Give in-flight requests up to 10s to complete
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      logger.warn("Shutdown timeout exceeded, forcing exit");
      resolve();
    }, SHUTDOWN_TIMEOUT_MS);

    server.closeAllConnections();
    clearTimeout(timeout);
    resolve();
  });

  // Stop the indexer polling loop
  stopIndexer();

  // Close the database pool
  await pool.end();
  logger.info("Database pool closed");

  logger.info("Graceful shutdown complete, exiting");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
