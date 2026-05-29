import { deactivateExpiredCampaigns } from "../jobs/expiredCampaigns";

const mockQuery = jest.fn();

jest.mock("../db", () => ({
  pool: { query: (...args: unknown[]) => mockQuery(...args) },
}));

jest.mock("../logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

afterEach(() => jest.clearAllMocks());

describe("deactivateExpiredCampaigns", () => {
  it("runs a batch UPDATE and returns the number of rows affected", async () => {
    mockQuery.mockResolvedValue({ rowCount: 3 });

    const count = await deactivateExpiredCampaigns();

    expect(count).toBe(3);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql] = mockQuery.mock.calls[0] as [string];
    expect(sql).toMatch(/UPDATE campaigns/i);
    expect(sql).toMatch(/active = false/i);
    expect(sql).toMatch(/expiration/i);
  });

  it("returns 0 when no campaigns are expired", async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });

    const count = await deactivateExpiredCampaigns();

    expect(count).toBe(0);
  });

  it("returns 0 when rowCount is null", async () => {
    mockQuery.mockResolvedValue({ rowCount: null });

    const count = await deactivateExpiredCampaigns();

    expect(count).toBe(0);
  });

  it("propagates database errors to the caller", async () => {
    mockQuery.mockRejectedValue(new Error("db error"));

    await expect(deactivateExpiredCampaigns()).rejects.toThrow("db error");
  });
});
