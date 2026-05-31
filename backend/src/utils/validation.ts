export function parseStrictInteger(value: string): number | null {
  if (!/^[0-9]+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return null;
  return parsed;
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/**
 * Validates a Stellar address string.
 * Throws BadRequestError with a descriptive message when invalid.
 * Use this for route params and query strings that accept Stellar addresses.
 */
export function assertStellarAddress(address: string, fieldName = "address"): void {
  if (!isValidStellarAddress(address)) {
    const { BadRequestError } = require("./errors");
    throw new BadRequestError(
      `Invalid Stellar address for '${fieldName}': must start with G and be exactly 56 characters`,
      { [fieldName]: address }
    );
  }
}
