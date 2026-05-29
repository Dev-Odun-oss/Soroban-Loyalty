import request from "supertest";
import express from "express";
import type { Express } from "express";

jest.mock("../db", () => ({ pool: { query: jest.fn(), totalCount: 0, idleCount: 0, waitingCount: 0, end: jest.fn() } }));
jest.mock("../services/reward.service", () => ({ getRewardsByUser: jest.fn().mockResolvedValue([]) }));

/** Build a minimal app with the given rate-limit env vars already set. */
function buildApp(env: Record<string, string>): Express {
  Object.assign(process.env, env);
  jest.resetModules();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { globalLimiter, rewardsLimiter, writeLimiter } = require("../middleware/rateLimiter");

  const app = express();
  app.use(globalLimiter);

  app.get("/user/:address/rewards", rewardsLimiter, (_req, res) => {
    res.json({ rewards: [] });
  });

  app.get("/campaigns", (_req, res) => {
    res.json({ campaigns: [] });
  });

  app.post("/campaigns", writeLimiter, (_req, res) => {
    res.status(201).json({ ok: true });
  });

  return app;
}

describe("rate limiting", () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_GLOBAL_MAX;
    delete process.env.RATE_LIMIT_WRITE_MAX;
    delete process.env.RATE_LIMIT_REWARDS_MAX;
  });

  describe("global limiter", () => {
    it("allows requests under the limit", async () => {
      const app = buildApp({ RATE_LIMIT_WINDOW_MS: "900000", RATE_LIMIT_GLOBAL_MAX: "5" });

      const res = await request(app).get("/campaigns");

      expect(res.status).toBe(200);
    });

    it("returns 429 after exceeding the global limit", async () => {
      const app = buildApp({ RATE_LIMIT_WINDOW_MS: "900000", RATE_LIMIT_GLOBAL_MAX: "3" });

      // Exhaust the limit
      for (let i = 0; i < 3; i++) {
        await request(app).get("/campaigns");
      }

      const res = await request(app).get("/campaigns");

      expect(res.status).toBe(429);
      expect(res.body).toMatchObject({ error: expect.any(String) });
    });

    it("includes Retry-After header on 429", async () => {
      const app = buildApp({ RATE_LIMIT_WINDOW_MS: "900000", RATE_LIMIT_GLOBAL_MAX: "2" });

      for (let i = 0; i < 2; i++) {
        await request(app).get("/campaigns");
      }

      const res = await request(app).get("/campaigns");

      expect(res.status).toBe(429);
      expect(res.headers["retry-after"]).toBeDefined();
    });
  });

  describe("rewards limiter", () => {
    const address = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

    it("allows requests under the rewards limit", async () => {
      const app = buildApp({ RATE_LIMIT_WINDOW_MS: "900000", RATE_LIMIT_REWARDS_MAX: "5" });

      const res = await request(app).get(`/user/${address}/rewards`);

      expect(res.status).toBe(200);
    });

    it("returns 429 after exceeding the rewards limit", async () => {
      const app = buildApp({
        RATE_LIMIT_WINDOW_MS: "900000",
        RATE_LIMIT_GLOBAL_MAX: "100",
        RATE_LIMIT_REWARDS_MAX: "3",
      });

      for (let i = 0; i < 3; i++) {
        await request(app).get(`/user/${address}/rewards`);
      }

      const res = await request(app).get(`/user/${address}/rewards`);

      expect(res.status).toBe(429);
      expect(res.headers["retry-after"]).toBeDefined();
    });

    it("rewards limit is stricter than global limit", async () => {
      // Global=100, rewards=3 — /campaigns still works after rewards is exhausted
      const app = buildApp({
        RATE_LIMIT_WINDOW_MS: "900000",
        RATE_LIMIT_GLOBAL_MAX: "100",
        RATE_LIMIT_REWARDS_MAX: "3",
      });

      for (let i = 0; i < 3; i++) {
        await request(app).get(`/user/${address}/rewards`);
      }

      const rewardsRes = await request(app).get(`/user/${address}/rewards`);
      const campaignsRes = await request(app).get("/campaigns");

      expect(rewardsRes.status).toBe(429);
      expect(campaignsRes.status).toBe(200);
    });
  });

  describe("write limiter", () => {
    it("allows write requests under the limit", async () => {
      const app = buildApp({ RATE_LIMIT_WINDOW_MS: "900000", RATE_LIMIT_GLOBAL_MAX: "100", RATE_LIMIT_WRITE_MAX: "5" });

      const res = await request(app).post("/campaigns");

      expect(res.status).toBe(201);
    });

    it("returns 429 after exceeding the write limit", async () => {
      const app = buildApp({
        RATE_LIMIT_WINDOW_MS: "900000",
        RATE_LIMIT_GLOBAL_MAX: "100",
        RATE_LIMIT_WRITE_MAX: "3",
      });

      for (let i = 0; i < 3; i++) {
        await request(app).post("/campaigns");
      }

      const res = await request(app).post("/campaigns");

      expect(res.status).toBe(429);
      expect(res.headers["retry-after"]).toBeDefined();
    });

    it("write limit does not affect GET endpoints", async () => {
      const app = buildApp({
        RATE_LIMIT_WINDOW_MS: "900000",
        RATE_LIMIT_GLOBAL_MAX: "100",
        RATE_LIMIT_WRITE_MAX: "3",
      });

      for (let i = 0; i < 3; i++) {
        await request(app).post("/campaigns");
      }

      const writeRes = await request(app).post("/campaigns");
      const readRes = await request(app).get("/campaigns");

      expect(writeRes.status).toBe(429);
      expect(readRes.status).toBe(200);
    });
  });
});
