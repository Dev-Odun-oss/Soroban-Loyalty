import express from "express";
import cors from "cors";
import { campaignRouter } from "./routes/campaign.routes";
import { rewardRouter } from "./routes/reward.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { authRouter } from "./routes/auth.routes";
import { correlationMiddleware } from "./correlation";
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
import { errorAlertMiddleware, requestLogger } from "./logger";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(correlationMiddleware);
  app.use(requestLogger);

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
    const checks: {
      stellar: { reachable: boolean; latency: number };
      database: { connected: boolean; responseTime: number };
      indexer: { running: boolean };
    } = {
      stellar: { reachable: false, latency: 0 },
      database: { connected: false, responseTime: 0 },
      indexer: { running: process.env.ENABLE_INDEXER !== "false" },
    };

    try {
      const stellarStart = Date.now();
      await rpcServer.getHealth();
      checks.stellar.reachable = true;
      checks.stellar.latency = Date.now() - stellarStart;
    } catch {
      checks.stellar.reachable = false;
    }

    try {
      const dbStart = Date.now();
      await pool.query("SELECT 1");
      checks.database.connected = true;
      checks.database.responseTime = Date.now() - dbStart;
    } catch {
      checks.database.connected = false;
    }

    const allHealthy = checks.stellar.reachable && checks.database.connected;
    const status = allHealthy
      ? "healthy"
      : checks.stellar.reachable || checks.database.connected
        ? "degraded"
        : "unhealthy";

    res.json({
      status,
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use("/auth", authRouter);
  app.use("/campaigns", campaignRouter);
  app.use("/", rewardRouter);
  app.use("/analytics", analyticsRouter);

  app.use(errorAlertMiddleware);

  return app;
}
