/**
 * Unit tests for Stellar address validation utility.
 * Covers isValidStellarAddress and assertStellarAddress.
 */

import { isValidStellarAddress, assertStellarAddress } from "../utils/validation";
import { BadRequestError } from "../utils/errors";

// A real-looking 56-char Stellar address (G + 55 base32 chars)
const VALID_ADDRESS = "GCKFBEIYTKP5RDBQMTVVALONAOPBXICILMAFKKWOHHJJD42YSWDYD2QC";

describe("isValidStellarAddress", () => {
  it("returns true for a valid Stellar address", () => {
    expect(isValidStellarAddress(VALID_ADDRESS)).toBe(true);
  });

  it("returns false when address does not start with G", () => {
    expect(isValidStellarAddress("ACKFBEIYTKP5RDBQMTVVALONAOPBXICILMAFKKWOHHJJD42YSWDYD2QC")).toBe(false);
  });

  it("returns false when address is shorter than 56 characters", () => {
    expect(isValidStellarAddress("GCKFBEIYTKP5RDBQMTVVALONAOPBXICILMAFKKWOHHJJD42YSWDYD2Q")).toBe(false);
  });

  it("returns false when address is longer than 56 characters", () => {
    expect(isValidStellarAddress(VALID_ADDRESS + "X")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidStellarAddress("")).toBe(false);
  });

  it("returns false when address contains lowercase letters", () => {
    expect(isValidStellarAddress("gCKFBEIYTKP5RDBQMTVVALONAOPBXICILMAFKKWOHHJJD42YSWDYD2QC")).toBe(false);
  });

  it("returns false when address contains invalid base32 characters (e.g. 0, 1, 8, 9)", () => {
    // Replace a valid char with '0' which is not in base32 alphabet
    const invalid = "G0KFBEIYTKP5RDBQMTVVALONAOPBXICILMAFKKWOHHJJD42YSWDYD2QC";
    expect(isValidStellarAddress(invalid)).toBe(false);
  });

  it("returns false for a random string", () => {
    expect(isValidStellarAddress("not-a-stellar-address")).toBe(false);
  });
});

describe("assertStellarAddress", () => {
  it("does not throw for a valid address", () => {
    expect(() => assertStellarAddress(VALID_ADDRESS)).not.toThrow();
  });

  it("throws BadRequestError for an invalid address", () => {
    expect(() => assertStellarAddress("invalid")).toThrow(BadRequestError);
  });

  it("includes the field name in the error details", () => {
    try {
      assertStellarAddress("invalid", "owner");
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
      expect((err as BadRequestError).details).toHaveProperty("owner");
    }
  });

  it("throws with HTTP 400 status code", () => {
    try {
      assertStellarAddress("tooshort");
    } catch (err) {
      expect((err as BadRequestError).statusCode).toBe(400);
    }
  });
});
