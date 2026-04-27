import { promises as fs } from "fs";
import path from "path";
import { pool } from "../../db";

export const SEEDED_USER_ADDRESS = `G${"A".repeat(55)}`;

async function applySchema() {
  const schemaPath = path.resolve(__dirname, "../../../../database/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  await pool.query(schemaSql);
}

async function truncateAllTables() {
  await pool.query(`
    TRUNCATE TABLE
      rewards,
      transactions,
      campaigns,
      users,
      auth_challenges
    RESTART IDENTITY CASCADE
  `);
}

async function seedData() {
  await pool.query(`INSERT INTO users (address) VALUES ($1)`, [SEEDED_USER_ADDRESS]);

  await pool.query(
    `INSERT INTO campaigns (id, merchant, reward_amount, expiration, active, total_claimed, display_order)
     VALUES
      (1, $1, 100, 1999999999, TRUE, 1, 0),
      (2, $1, 250, 1999999999, TRUE, 0, 1)`,
    [SEEDED_USER_ADDRESS]
  );

  await pool.query(
    `INSERT INTO rewards (user_address, campaign_id, amount, redeemed, redeemed_amount)
     VALUES ($1, 1, 100, FALSE, 0)`,
    [SEEDED_USER_ADDRESS]
  );
}

export async function setupIntegrationDatabase() {
  await applySchema();
  await truncateAllTables();
  await seedData();
}

export async function teardownIntegrationDatabase() {
  await truncateAllTables();
}
