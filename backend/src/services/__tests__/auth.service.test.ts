/**
 * Unit tests for auth.service.ts
 *
 * Mocks the database pool and env so no network or DB is required.
 */

jest.mock("../../db", () => ({ pool: { query: jest.fn() } }));
jest.mock("../../env", () => ({
  env: { JWT_SECRET: "test-secret-key-at-least-32-characters-long", JWT_EXPIRY_HOURS: 1 },
}));

import { generateChallenge, verifyChallenge, verifyToken, signToken } from "../auth.service";
import { UnauthorizedError, BadRequestError } from "../../utils/errors";
import { Keypair } from "@stellar/stellar-sdk";

const mockPool = jest.requireMock("../../db").pool as { query: jest.Mock };

describe("auth.service", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("generateChallenge", () => {
    it("returns a 64-char hex nonce for a valid public key", async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });
      const pk = Keypair.random().publicKey();
      const nonce = await generateChallenge(pk);
      expect(nonce).toMatch(/^[a-f0-9]{64}$/);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("throws BadRequestError for invalid public key", async () => {
      await expect(generateChallenge("bad-key")).rejects.toThrow(BadRequestError);
    });

    it("throws BadRequestError for empty public key", async () => {
      await expect(generateChallenge("")).rejects.toThrow(BadRequestError);
    });
  });

  describe("verifyChallenge", () => {
    it("issues a JWT for a valid signature", async () => {
      const keypair = Keypair.random();
      const nonce = "testnonce123";
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ nonce }] }) // getActiveChallenge
        .mockResolvedValueOnce({ rowCount: 1 });       // delete challenge

      const signature = keypair.sign(Buffer.from(nonce, "utf8")).toString("base64");
      const token = await verifyChallenge(keypair.publicKey(), signature);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT structure
    });

    it("throws UnauthorizedError when challenge is expired", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }); // no active challenge
      const pk = Keypair.random().publicKey();
      await expect(verifyChallenge(pk, "sig")).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for invalid signature", async () => {
      const keypair = Keypair.random();
      const nonce = "testnonce123";
      mockPool.query.mockResolvedValueOnce({ rows: [{ nonce }] });

      const badSignature = Buffer.from("invalid").toString("base64");
      await expect(verifyChallenge(keypair.publicKey(), badSignature)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("throws BadRequestError for invalid public key", async () => {
      await expect(verifyChallenge("bad", "sig")).rejects.toThrow(BadRequestError);
    });

    it("throws BadRequestError for missing signature", async () => {
      const pk = Keypair.random().publicKey();
      await expect(verifyChallenge(pk, "")).rejects.toThrow(BadRequestError);
    });
  });

  describe("signToken / verifyToken", () => {
    it("round-trips a token correctly", () => {
      const pk = Keypair.random().publicKey();
      const token = signToken(pk);
      const payload = verifyToken(token);
      expect(payload.sub).toBe(pk);
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("throws UnauthorizedError for expired token", () => {
      const pk = Keypair.random().publicKey();
      const token = signToken(pk);
      // Fast-forward time by mocking jwt.verify to simulate expiry
      const { verify } = jest.requireActual("jsonwebtoken");
      // We can't easily mock jwt without affecting imports, so instead sign with negative expiry
      const expiredToken = jest
        .requireMock("jsonwebtoken")
        .sign({ sub: pk }, "test-secret-key-at-least-32-characters-long", { expiresIn: -1 });

      // Actually test with a real expired token using the real jwt
      const realExpired = require("jsonwebtoken").sign(
        { sub: pk },
        "test-secret-key-at-least-32-characters-long",
        { expiresIn: "-1s", issuer: "soroban-loyalty-api", audience: "soroban-loyalty-merchant" }
      );

      // Wait a tiny bit then verify it fails
      jest.useFakeTimers();
      jest.advanceTimersByTime(2000);
      expect(() => verifyToken(realExpired)).toThrow(UnauthorizedError);
      jest.useRealTimers();
    });

    it("throws UnauthorizedError for malformed token", () => {
      expect(() => verifyToken("not.a.token")).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for token signed with wrong secret", () => {
      const pk = Keypair.random().publicKey();
      const badToken = require("jsonwebtoken").sign(
        { sub: pk },
        "wrong-secret",
        { expiresIn: "1h", issuer: "soroban-loyalty-api", audience: "soroban-loyalty-merchant" }
      );
      expect(() => verifyToken(badToken)).toThrow(UnauthorizedError);
    });
  });
});

