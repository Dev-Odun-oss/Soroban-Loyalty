import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/errorHandler";
import { generateChallenge, verifyChallenge } from "../services/auth.service";
import { BadRequestError } from "../utils/errors";

export const authRouter = Router();

const ChallengeSchema = z.object({
  publicKey: z.string().length(56).regex(/^G[A-Z0-9]{55}$/),
});

const VerifySchema = z.object({
  publicKey: z.string().length(56).regex(/^G[A-Z0-9]{55}$/),
  signature: z.string().min(1),
});

/**
 * @openapi
 * /auth/challenge:
 *   post:
 *     summary: Request an authentication challenge
 *     description: Returns a nonce that must be signed with the merchant's Stellar private key.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicKey
 *             properties:
 *               publicKey:
 *                 type: string
 *                 example: GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 *     responses:
 *       200:
 *         description: Challenge nonce generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nonce:
 *                   type: string
 *                   example: a1b2c3d4...
 *       400:
 *         description: Invalid public key.
 *       500:
 *         description: Server error.
 */
authRouter.post(
  "/challenge",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = ChallengeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid request body", { errors: parsed.error.errors });
    }

    const nonce = await generateChallenge(parsed.data.publicKey);
    res.json({ nonce });
  })
);

/**
 * @openapi
 * /auth/verify:
 *   post:
 *     summary: Verify signed challenge and receive JWT
 *     description: Validates the signature of the nonce and returns a short-lived JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicKey
 *               - signature
 *             properties:
 *               publicKey:
 *                 type: string
 *                 example: GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 *               signature:
 *                 type: string
 *                 description: Base64-encoded ED25519 signature of the nonce.
 *                 example: base64signature...
 *     responses:
 *       200:
 *         description: JWT issued successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIs...
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Invalid signature or expired challenge.
 *       500:
 *         description: Server error.
 */
authRouter.post(
  "/verify",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = VerifySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid request body", { errors: parsed.error.errors });
    }

    const token = await verifyChallenge(parsed.data.publicKey, parsed.data.signature);
    res.json({ token });
  })
);

