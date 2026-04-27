import { Pool, PoolClient, PoolConfig } from "pg";
import dotenv from "dotenv";
import { logger } from "./logger";
import { env } from "./env";

dotenv.config();
const TEST_ENVIRONMENTS = new Set(["test", "integration"]);

function getPoolConfig(): PoolConfig {
  const isTestEnv = TEST_ENVIRONMENTS.has(process.env.NODE_ENV ?? "");
  const testUrl = process.env.TEST_DATABASE_URL;
  const defaultUrl = process.env.DATABASE_URL;
  const connectionString = isTestEnv && testUrl ? testUrl : defaultUrl;

  if (connectionString) {
    return { connectionString };
  }

  return {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: parseInt(process.env.POSTGRES_PORT ?? "5432", 10),
    user: process.env.POSTGRES_USER ?? "loyalty",
    password: process.env.POSTGRES_PASSWORD ?? "loyalty",
    database: process.env.POSTGRES_DB ?? "loyalty",
  };
}

export const pool = new Pool(getPoolConfig());

pool.on("error", (err) => {
  logger.critical("DB connection error", err);
});

export async function initDb(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closeDb(): Promise<void> {
  await pool.end();
}

export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
