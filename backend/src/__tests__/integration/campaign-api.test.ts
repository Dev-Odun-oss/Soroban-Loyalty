import request from "supertest";
import { createApp } from "../../app";
import {
  SEEDED_USER_ADDRESS,
  setupIntegrationDatabase,
  teardownIntegrationDatabase,
} from "./testDb";
import { pool } from "../../db";

describe("Campaign API integration tests", () => {
  const app = createApp();

  beforeAll(async () => {
    await setupIntegrationDatabase();
  });

  afterAll(async () => {
    await teardownIntegrationDatabase();
  });

  describe("GET /campaigns", () => {
    it("returns 200 with an array of campaigns", async () => {
      const response = await request(app).get("/campaigns");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    it("returns paginated results with default limit", async () => {
      const response = await request(app).get("/campaigns");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(20);
      expect(response.body.page).toBe(1);
    });

    it("respects custom limit parameter", async () => {
      const response = await request(app).get("/campaigns?limit=5");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it("respects custom page parameter", async () => {
      const response = await request(app).get("/campaigns?page=2&limit=1");

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
    });

    it("returns 400 for invalid limit", async () => {
      const response = await request(app).get("/campaigns?limit=invalid");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for negative page", async () => {
      const response = await request(app).get("/campaigns?page=-1");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("clamps limit to maximum of 100", async () => {
      const response = await request(app).get("/campaigns?limit=500");

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(100);
    });

    it("filters campaigns by search term", async () => {
      const response = await request(app).get("/campaigns?search=summer");

      expect(response.status).toBe(200);
      expect(response.body.data.every((c: any) =>
        c.name.toLowerCase().includes("summer")
      )).toBe(true);
    });

    it("filters campaigns by active status", async () => {
      const response = await request(app).get("/campaigns?status=active");

      expect(response.status).toBe(200);
      expect(response.body.data.every((c: any) => c.active === true)).toBe(true);
    });

    it("filters campaigns by inactive status", async () => {
      const response = await request(app).get("/campaigns?status=inactive");

      expect(response.status).toBe(200);
      expect(response.body.data.every((c: any) => c.active === false)).toBe(true);
    });

    it("returns empty array when no campaigns match search", async () => {
      const response = await request(app).get("/campaigns?search=nonexistent");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe("GET /campaigns/:id", () => {
    it("returns 200 for existing campaign", async () => {
      const response = await request(app).get("/campaigns/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("campaign");
      expect(response.body.campaign).toHaveProperty("id");
      expect(response.body.campaign).toHaveProperty("name");
      expect(response.body.campaign).toHaveProperty("merchant");
    });

    it("returns 404 for missing campaign", async () => {
      const response = await request(app).get("/campaigns/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/not found/i);
    });

    it("returns 400 for invalid id format", async () => {
      const response = await request(app).get("/campaigns/not-a-number");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/invalid id/i);
    });

    it("returns 400 for SQL injection attempt in id", async () => {
      const response = await request(app).get("/campaigns/1 OR 1=1");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("returns campaign with all expected fields", async () => {
      const response = await request(app).get("/campaigns/1");

      expect(response.status).toBe(200);
      const campaign = response.body.campaign;
      expect(campaign).toHaveProperty("id");
      expect(campaign).toHaveProperty("name");
      expect(campaign).toHaveProperty("merchant");
      expect(campaign).toHaveProperty("reward_amount");
      expect(campaign).toHaveProperty("expiration");
      expect(campaign).toHaveProperty("active");
    });
  });

  describe("PATCH /campaigns/reorder", () => {
    it("returns 200 on successful reorder", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: [2, 1] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("returns 400 for invalid request body", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for empty order array", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for non-integer order values", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: [1.5, 2.5] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for SQL injection in order array", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: ["1 OR 1=1", 2] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("persists display order in database", async () => {
      await request(app)
        .patch("/campaigns/reorder")
        .send({ order: [2, 1] });

      const result = await pool.query(
        "SELECT id, display_order FROM campaigns ORDER BY display_order ASC"
      );

      expect(result.rows[0].id).toBe(2);
      expect(result.rows[1].id).toBe(1);
    });
  });

  describe("DELETE /campaigns/:id", () => {
    it("returns 200 on successful soft delete", async () => {
      // Create a test campaign first
      await pool.query(
        `INSERT INTO campaigns (id, merchant, name, reward_amount, expiration, active, total_claimed, display_order)
         VALUES (999, $1, 'Test Campaign', 100, 1999999999, TRUE, 0, 0)`,
        [SEEDED_USER_ADDRESS]
      );

      const response = await request(app).delete("/campaigns/999");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("returns 404 for non-existent campaign", async () => {
      const response = await request(app).delete("/campaigns/888888");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id", async () => {
      const response = await request(app).delete("/campaigns/invalid");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("sets deleted_at timestamp on soft delete", async () => {
      await pool.query(
        `INSERT INTO campaigns (id, merchant, name, reward_amount, expiration, active, total_claimed, display_order)
         VALUES (998, $1, 'Test Campaign 2', 100, 1999999999, TRUE, 0, 0)`,
        [SEEDED_USER_ADDRESS]
      );

      await request(app).delete("/campaigns/998");

      const result = await pool.query(
        "SELECT deleted_at FROM campaigns WHERE id = 998"
      );

      expect(result.rows[0].deleted_at).not.toBeNull();
    });
  });

  describe("POST /campaigns/:id/restore", () => {
    it("returns 200 on successful restore", async () => {
      // Create and delete a campaign
      await pool.query(
        `INSERT INTO campaigns (id, merchant, name, reward_amount, expiration, active, total_claimed, display_order)
         VALUES (997, $1, 'Test Campaign 3', 100, 1999999999, TRUE, 0, 0)`,
        [SEEDED_USER_ADDRESS]
      );
      await request(app).delete("/campaigns/997");

      const response = await request(app).post("/campaigns/997/restore");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("returns 404 for non-existent campaign", async () => {
      const response = await request(app).post("/campaigns/777777/restore");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id", async () => {
      const response = await request(app).post("/campaigns/invalid/restore");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("clears deleted_at timestamp on restore", async () => {
      await pool.query(
        `INSERT INTO campaigns (id, merchant, name, reward_amount, expiration, active, total_claimed, display_order)
         VALUES (996, $1, 'Test Campaign 4', 100, 1999999999, TRUE, 0, 0)`,
        [SEEDED_USER_ADDRESS]
      );
      await request(app).delete("/campaigns/996");
      await request(app).post("/campaigns/996/restore");

      const result = await pool.query(
        "SELECT deleted_at FROM campaigns WHERE id = 996"
      );

      expect(result.rows[0].deleted_at).toBeNull();
    });
  });

  describe("Database state consistency", () => {
    it("maintains referential integrity with rewards", async () => {
      const response = await request(app).get("/campaigns/1");

      expect(response.status).toBe(200);
      const campaign = response.body.campaign;

      // Verify campaign exists in database
      const dbResult = await pool.query(
        "SELECT * FROM campaigns WHERE id = $1",
        [campaign.id]
      );

      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].name).toBe(campaign.name);
    });

    it("returns consistent data across multiple requests", async () => {
      const response1 = await request(app).get("/campaigns/1");
      const response2 = await request(app).get("/campaigns/1");

      expect(response1.body.campaign).toEqual(response2.body.campaign);
    });
  });

  describe("Response format validation", () => {
    it("GET /campaigns returns proper pagination structure", async () => {
      const response = await request(app).get("/campaigns");

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      });
    });

    it("GET /campaigns/:id returns proper campaign structure", async () => {
      const response = await request(app).get("/campaigns/1");

      expect(response.body).toHaveProperty("campaign");
      expect(typeof response.body.campaign).toBe("object");
    });

    it("PATCH /campaigns/reorder returns success indicator", async () => {
      const response = await request(app)
        .patch("/campaigns/reorder")
        .send({ order: [1, 2] });

      expect(response.body).toHaveProperty("ok");
      expect(typeof response.body.ok).toBe("boolean");
    });
  });
});
