import express from "express";
import cors from "cors";
import { campaignRouter } from "./routes/campaign.routes";
import { rewardRouter } from "./routes/reward.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { authRouter } from "./routes/auth.routes";
import { requireAuth } from "./auth";
import { rpcServer } from "./soroban";
import { pool } from "./db";
import {
  registry,
  httpRequestsTotal,
  httpRequestDuration,
  dbPoolActive,
  dbPoolIdle,
  dbPoolWaiting,
} from "./metrics";
import { requestLogger } from "./logger";
import { globalLimiter, rewardsLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(globalLimiter);

  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => {
      const route = req.route?.path ?? req.path;
      const labels = { method: req.method, route, status: String(res.statusCode) };
      httpRequestsTotal.inc(labels);
      end(labels);
    });
    next();
  });

  app.get("/metrics", async (_req, res) => {
    dbPoolActive.set(pool.totalCount - pool.idleCount);
    dbPoolIdle.set(pool.idleCount);
    dbPoolWaiting.set(pool.waitingCount);

    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });

  app.get("/health", async (_req, res) => {
    const HEALTH_CHECK_TIMEOUT_MS = 400; // per-check cap; keeps total response < 500 ms

    const checks: {
      stellar: { reachable: boolean; latency: number };
      database: { connected: boolean; responseTime: number };
      indexer: { running: boolean };
    } = {
      stellar: { reachable: false, latency: 0 },
      database: { connected: false, responseTime: 0 },
      indexer: { running: process.env.ENABLE_INDEXER !== "false" },
    };

    /** Race a promise against a timeout so a slow dependency cannot block the response. */
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timed out")), ms),
        ),
      ]);

    // Run dependency checks in parallel for speed
    const stellarCheck = (async () => {
      try {
        const start = Date.now();
        await withTimeout(rpcServer.getHealth(), HEALTH_CHECK_TIMEOUT_MS);
        checks.stellar.reachable = true;
        checks.stellar.latency = Date.now() - start;
      } catch {
        checks.stellar.reachable = false;
      }
    })();

    const dbCheck = (async () => {
      try {
        const start = Date.now();
        await withTimeout(pool.query("SELECT 1"), HEALTH_CHECK_TIMEOUT_MS);
        checks.database.connected = true;
        checks.database.responseTime = Date.now() - start;
      } catch {
        checks.database.connected = false;
      }
    })();

    await Promise.all([stellarCheck, dbCheck]);

    const allHealthy = checks.stellar.reachable && checks.database.connected;
    const status = allHealthy
      ? "healthy"
      : checks.stellar.reachable || checks.database.connected
        ? "degraded"
        : "unhealthy";

    const httpStatus = allHealthy ? 200 : 503;

    res.status(httpStatus).json({
      status,
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use("/campaigns", campaignRouter);
  app.use("/", rewardRouter);
  app.use("/analytics", analyticsRouter);
  app.use("/auth", authRouter);
  // Merchant mutation routes require JWT
  app.use("/merchant/campaigns", requireAuth, campaignRouter);

  app.use(errorHandler);

  return app;
}
