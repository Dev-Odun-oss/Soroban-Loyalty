import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import {
  getCampaigns,
  getCampaignById,
  reorderCampaigns,
  softDeleteCampaign,
  restoreCampaign,
} from "../services/campaign.service";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";

export const campaignRouter = Router();

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: List all campaigns
 *     description: Returns a paginated list of all campaigns stored in the database.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of campaigns to return.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of campaigns to skip.
 *     responses:
 *       200:
 *         description: A list of campaigns.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
campaignRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;
  const result = await getCampaigns(limit, offset);
  res.json(result);
}));

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     description: Returns a single campaign by its unique identifier.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The campaign ID.
 *     responses:
 *       200:
 *         description: Campaign details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaign:
 *                   $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Invalid ID.
 *       404:
 *         description: Campaign not found.
 *       500:
 *         description: Server error.
 */
campaignRouter.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new BadRequestError("Invalid id", { id: req.params.id });
  }
  const campaign = await getCampaignById(id);
  if (!campaign) {
    throw new NotFoundError("Campaign");
  }
  res.json({ campaign });
}));

const ReorderSchema = z.object({
  order: z.array(z.number().int().positive()),
});

/**
 * @openapi
 * /campaigns/reorder:
 *   patch:
 *     summary: Reorder campaigns
 *     description: Persists the display order of campaigns for a merchant.
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of campaign IDs in the desired display order.
 *     responses:
 *       200:
 *         description: Reorder successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized — missing or invalid JWT.
 *       500:
 *         description: Server error.
 */
campaignRouter.patch(
  "/reorder",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = ReorderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid request body", { errors: parsed.error.errors });
    }
    await reorderCampaigns(parsed.data.order);
    res.json({ ok: true });
  })
);

/**
 * @openapi
 * /campaigns/{id}:
 *   delete:
 *     summary: Soft-delete a campaign
 *     description: Sets deleted_at on a campaign. Requires merchant authentication.
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deletion successful.
 *       400:
 *         description: Invalid ID.
 *       401:
 *         description: Unauthorized — missing or invalid JWT.
 *       403:
 *         description: Forbidden — not the campaign owner.
 *       404:
 *         description: Campaign not found.
 *       500:
 *         description: Server error.
 */
campaignRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError("Invalid id", { id: req.params.id });
    }

    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new NotFoundError("Campaign");
    }
    if (campaign.merchant !== req.merchant) {
      throw new ForbiddenError("You do not own this campaign");
    }

    const deleted = await softDeleteCampaign(id);
    if (!deleted) {
      throw new NotFoundError("Campaign");
    }
    res.json({ ok: true });
  })
);

/**
 * @openapi
 * /campaigns/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted campaign
 *     description: Clears deleted_at on a campaign. Requires merchant authentication.
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restore successful.
 *       400:
 *         description: Invalid ID.
 *       401:
 *         description: Unauthorized — missing or invalid JWT.
 *       403:
 *         description: Forbidden — not the campaign owner.
 *       404:
 *         description: Campaign not found or not deleted.
 *       500:
 *         description: Server error.
 */
campaignRouter.post(
  "/:id/restore",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError("Invalid id", { id: req.params.id });
    }

    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new NotFoundError("Campaign");
    }
    if (campaign.merchant !== req.merchant) {
      throw new ForbiddenError("You do not own this campaign");
    }

    const restored = await restoreCampaign(id);
    if (!restored) {
      throw new NotFoundError("Campaign");
    }
    res.json({ ok: true });
  })
);

