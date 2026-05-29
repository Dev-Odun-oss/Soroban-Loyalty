/**
 * Tests for env.ts — environment variable validation.
 *
 * We test parseEnv() directly so we never trigger process.exit(1)
 * or rely on the real process.env.
 */

import { parseEnv } from "../env";

// ── Minimal valid env ─────────────────────────────────────────────────────────

const VALID_ENV = {
  SOROBAN_RPC_URL: "http://localhost:8000/soroban/rpc",
  NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  REWARDS_CONTRACT_ID: "CREWARDS123",
  CAMPAIGN_CONTRACT_ID: "CCAMPAIGN123",
  TOKEN_CONTRACT_ID: "CTOKEN123",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function valid(overrides: Record<string, string | undefined> = {}) {
  return { ...VALID_ENV, ...overrides };
}

// ── Required fields ───────────────────────────────────────────────────────────

describe("required fields", () => {
  const requiredKeys: (keyof typeof VALID_ENV)[] = [
    "SOROBAN_RPC_URL",
    "NETWORK_PASSPHRASE",
    "REWARDS_CONTRACT_ID",
    "CAMPAIGN_CONTRACT_ID",
    "TOKEN_CONTRACT_ID",
  ];

  test.each(requiredKeys)("throws when %s is missing", (key) => {
    const env = valid({ [key]: undefined });
    expect(() => parseEnv(env)).toThrow(/Environment validation failed/);
  });

  test.each(requiredKeys)("error message names the missing field %s", (key) => {
    const env = valid({ [key]: undefined });
    expect(() => parseEnv(env)).toThrow(key);
  });

  it("throws listing ALL missing required fields at once", () => {
    expect(() =>
      parseEnv({
        // completely empty — all required fields absent
      })
    ).toThrow(/SOROBAN_RPC_URL/);
  });
});

// ── SOROBAN_RPC_URL ───────────────────────────────────────────────────────────

describe("SOROBAN_RPC_URL", () => {
  it("accepts a valid http URL", () => {
    const result = parseEnv(valid());
    expect(result.SOROBAN_RPC_URL).toBe("http://localhost:8000/soroban/rpc");
  });

  it("accepts a valid https URL", () => {
    const result = parseEnv(valid({ SOROBAN_RPC_URL: "https://rpc.example.com/soroban/rpc" }));
    expect(result.SOROBAN_RPC_URL).toBe("https://rpc.example.com/soroban/rpc");
  });

  it("rejects a non-URL string", () => {
    expect(() => parseEnv(valid({ SOROBAN_RPC_URL: "not-a-url" }))).toThrow(
      /SOROBAN_RPC_URL/
    );
  });
});

// ── NETWORK_PASSPHRASE ────────────────────────────────────────────────────────

describe("NETWORK_PASSPHRASE", () => {
  it("accepts any non-empty string", () => {
    const result = parseEnv(valid({ NETWORK_PASSPHRASE: "Public Global Stellar Network ; September 2015" }));
    expect(result.NETWORK_PASSPHRASE).toBe("Public Global Stellar Network ; September 2015");
  });

  it("rejects an empty string", () => {
    expect(() => parseEnv(valid({ NETWORK_PASSPHRASE: "" }))).toThrow(/NETWORK_PASSPHRASE/);
  });
});

// ── DATABASE_URL ──────────────────────────────────────────────────────────────

describe("DATABASE_URL", () => {
  it("is optional — omitting it does not throw", () => {
    const env = valid({ DATABASE_URL: undefined });
    expect(() => parseEnv(env)).not.toThrow();
  });

  it("accepts a valid postgres URL", () => {
    const result = parseEnv(valid());
    expect(result.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
  });

  it("rejects a malformed URL", () => {
    expect(() => parseEnv(valid({ DATABASE_URL: "not-a-url" }))).toThrow(/DATABASE_URL/);
  });
});

// ── AWS_REGION ────────────────────────────────────────────────────────────────

describe("AWS_REGION", () => {
  it("defaults to us-east-1 when not set", () => {
    const result = parseEnv(valid({ AWS_REGION: undefined }));
    expect(result.AWS_REGION).toBe("us-east-1");
  });

  it("accepts a custom region", () => {
    const result = parseEnv(valid({ AWS_REGION: "eu-west-1" }));
    expect(result.AWS_REGION).toBe("eu-west-1");
  });
});

// ── SECRETS_ARN ───────────────────────────────────────────────────────────────

describe("SECRETS_ARN", () => {
  it("is optional — omitting it does not throw", () => {
    expect(() => parseEnv(valid({ SECRETS_ARN: undefined }))).not.toThrow();
  });

  it("accepts an ARN string", () => {
    const arn = "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-secret";
    const result = parseEnv(valid({ SECRETS_ARN: arn }));
    expect(result.SECRETS_ARN).toBe(arn);
  });
});

// ── Contract IDs ──────────────────────────────────────────────────────────────

describe("contract IDs", () => {
  it("accepts all three contract IDs", () => {
    const result = parseEnv(valid());
    expect(result.REWARDS_CONTRACT_ID).toBe("CREWARDS123");
    expect(result.CAMPAIGN_CONTRACT_ID).toBe("CCAMPAIGN123");
    expect(result.TOKEN_CONTRACT_ID).toBe("CTOKEN123");
  });

  it("rejects empty REWARDS_CONTRACT_ID", () => {
    expect(() => parseEnv(valid({ REWARDS_CONTRACT_ID: "" }))).toThrow(/REWARDS_CONTRACT_ID/);
  });

  it("rejects empty CAMPAIGN_CONTRACT_ID", () => {
    expect(() => parseEnv(valid({ CAMPAIGN_CONTRACT_ID: "" }))).toThrow(/CAMPAIGN_CONTRACT_ID/);
  });

  it("rejects empty TOKEN_CONTRACT_ID", () => {
    expect(() => parseEnv(valid({ TOKEN_CONTRACT_ID: "" }))).toThrow(/TOKEN_CONTRACT_ID/);
  });
});

// ── PORT ──────────────────────────────────────────────────────────────────────

describe("PORT", () => {
  it("defaults to 3001 when not set", () => {
    const result = parseEnv(valid({ PORT: undefined }));
    expect(result.PORT).toBe(3001);
  });

  it("coerces a valid port string to a number", () => {
    const result = parseEnv(valid({ PORT: "8080" }));
    expect(result.PORT).toBe(8080);
  });

  it("rejects port 0", () => {
    expect(() => parseEnv(valid({ PORT: "0" }))).toThrow(/PORT/);
  });

  it("rejects port above 65535", () => {
    expect(() => parseEnv(valid({ PORT: "99999" }))).toThrow(/PORT/);
  });

  it("rejects a non-numeric port", () => {
    expect(() => parseEnv(valid({ PORT: "abc" }))).toThrow(/PORT/);
  });
});

// ── ENABLE_INDEXER ────────────────────────────────────────────────────────────

describe("ENABLE_INDEXER", () => {
  it("defaults to true when not set", () => {
    const result = parseEnv(valid({ ENABLE_INDEXER: undefined }));
    expect(result.ENABLE_INDEXER).toBe(true);
  });

  it('parses "true" as boolean true', () => {
    const result = parseEnv(valid({ ENABLE_INDEXER: "true" }));
    expect(result.ENABLE_INDEXER).toBe(true);
  });

  it('parses "false" as boolean false', () => {
    const result = parseEnv(valid({ ENABLE_INDEXER: "false" }));
    expect(result.ENABLE_INDEXER).toBe(false);
  });

  it("rejects an invalid value", () => {
    expect(() => parseEnv(valid({ ENABLE_INDEXER: "yes" }))).toThrow(/ENABLE_INDEXER/);
  });
});

// ── SLACK_WEBHOOK_URL ─────────────────────────────────────────────────────────

describe("SLACK_WEBHOOK_URL", () => {
  it("is optional — omitting it does not throw", () => {
    expect(() => parseEnv(valid({ SLACK_WEBHOOK_URL: undefined }))).not.toThrow();
  });

  it("accepts a valid https URL", () => {
    const url = "https://hooks.slack.com/services/T00/B00/xxx";
    const result = parseEnv(valid({ SLACK_WEBHOOK_URL: url }));
    expect(result.SLACK_WEBHOOK_URL).toBe(url);
  });

  it("rejects a non-URL string", () => {
    expect(() => parseEnv(valid({ SLACK_WEBHOOK_URL: "not-a-url" }))).toThrow(
      /SLACK_WEBHOOK_URL/
    );
  });
});

// ── MAINTENANCE_MODE ──────────────────────────────────────────────────────────

describe("MAINTENANCE_MODE", () => {
  it("defaults to false when not set", () => {
    const result = parseEnv(valid({ MAINTENANCE_MODE: undefined }));
    expect(result.MAINTENANCE_MODE).toBe(false);
  });

  it('parses "true" as boolean true', () => {
    const result = parseEnv(valid({ MAINTENANCE_MODE: "true" }));
    expect(result.MAINTENANCE_MODE).toBe(true);
  });

  it('parses "false" as boolean false', () => {
    const result = parseEnv(valid({ MAINTENANCE_MODE: "false" }));
    expect(result.MAINTENANCE_MODE).toBe(false);
  });

  it("rejects an invalid value", () => {
    expect(() => parseEnv(valid({ MAINTENANCE_MODE: "1" }))).toThrow(/MAINTENANCE_MODE/);
  });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────

describe("rate limit env vars", () => {
  it("defaults RATE_LIMIT_WINDOW_MS to 900000", () => {
    const result = parseEnv(valid({ RATE_LIMIT_WINDOW_MS: undefined }));
    expect(result.RATE_LIMIT_WINDOW_MS).toBe(900000);
  });

  it("defaults RATE_LIMIT_GLOBAL_MAX to 100", () => {
    const result = parseEnv(valid({ RATE_LIMIT_GLOBAL_MAX: undefined }));
    expect(result.RATE_LIMIT_GLOBAL_MAX).toBe(100);
  });

  it("defaults RATE_LIMIT_WRITE_MAX to 20", () => {
    const result = parseEnv(valid({ RATE_LIMIT_WRITE_MAX: undefined }));
    expect(result.RATE_LIMIT_WRITE_MAX).toBe(20);
  });

  it("defaults RATE_LIMIT_REWARDS_MAX to 20", () => {
    const result = parseEnv(valid({ RATE_LIMIT_REWARDS_MAX: undefined }));
    expect(result.RATE_LIMIT_REWARDS_MAX).toBe(20);
  });

  it("rejects RATE_LIMIT_WINDOW_MS below 1000", () => {
    expect(() => parseEnv(valid({ RATE_LIMIT_WINDOW_MS: "500" }))).toThrow(/RATE_LIMIT_WINDOW_MS/);
  });
});

// ── Happy path — full valid env ───────────────────────────────────────────────

describe("full valid environment", () => {
  it("parses a complete env without throwing", () => {
    const result = parseEnv({
      SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
      NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
      DATABASE_URL: "postgres://loyalty:secret@db:5432/loyalty",
      SECRETS_ARN: "arn:aws:secretsmanager:us-east-1:123:secret:prod",
      AWS_REGION: "us-east-1",
      REWARDS_CONTRACT_ID: "CREWARDS",
      CAMPAIGN_CONTRACT_ID: "CCAMPAIGN",
      TOKEN_CONTRACT_ID: "CTOKEN",
      PORT: "3001",
      ENABLE_INDEXER: "true",
      SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T/B/x",
      MAINTENANCE_MODE: "false",
    });

    expect(result.PORT).toBe(3001);
    expect(result.ENABLE_INDEXER).toBe(true);
    expect(result.MAINTENANCE_MODE).toBe(false);
    expect(result.AWS_REGION).toBe("us-east-1");
  });
});
