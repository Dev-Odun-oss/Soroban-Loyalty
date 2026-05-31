import { z } from "zod";
import { isValidStellarAddress } from "../utils/validation";

/**
 * Common validation schemas used across multiple routes
 */

/** Validates a Stellar public key: starts with G, exactly 56 base32 characters. */
export const StellarAddressParamSchema = z.object({
  address: z
    .string()
    .refine(isValidStellarAddress, {
      message: "Invalid Stellar address: must start with G and be exactly 56 characters",
    }),
});

/** Validates a Stellar address in a query string field named 'address'. */
export const StellarAddressQuerySchema = z.object({
  address: z
    .string()
    .refine(isValidStellarAddress, {
      message: "Invalid Stellar address: must start with G and be exactly 56 characters",
    })
    .optional(),
});

export const StellarAddressSchema = z.object({
  address: z.string().length(56, "Stellar address must be 56 characters")
});

export const IdParamsSchema = z.object({
  id: z.string().transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error("Invalid ID");
    return num;
  })
});

export const PaginationQuerySchema = z.object({
  limit: z.string().optional().transform(val => parseInt(val || "20", 10) || 20),
  offset: z.string().optional().transform(val => parseInt(val || "0", 10) || 0)
});
