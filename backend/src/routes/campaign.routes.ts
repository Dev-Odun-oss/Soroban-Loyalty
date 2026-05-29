import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  getCampaigns,
  getCampaignById,
  reorderCampaigns,
  softDeleteCampaign,
  restoreCampaign,
  CampaignFilters,
} from "../services/campaign.service";
import { redisClient } from "../lib/redis";
import { logger } from "../logger";
import { asyncHandler } from "../middleware/errorHandler";
import { validateBody, validateParams, validateQuery } from "../middleware/validation";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { parseStrictInteger } from "../utils/validation";
import { writeLimiter } from "../middleware/rateLimiter";

export const campaignRouter = Router();

// Route-specific validation schemas
const CampaignQuerySchema = z.object({
  limit: z.string().optional().transform(val => Math.min(parseInt(val || "20", 10) || 20, 100)),
  offset: z.string().optional().transform(val => parseInt(val || "0", 10) || 0),
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  expires_before: z.string().optional().transform(val => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }),
  expires_after: z.string().optional().transform(val => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  })
});

const ReorderSchema = z.object({
  order: z.array(z.number().int().positive()),
});

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: List campaigns
 *     description: Returns a paginated, filterable list of campaigns.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number (1-indexed).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of campaigns to return per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive substring match on campaign name.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by campaign active status.
 *       - in: query
 *         name: expires_before
 *         schema:
 *           type: integer
 *         description: Return campaigns expiring at or before this unix timestamp.
 *       - in: query
 *         name: expires_after
 *         schema:
 *           type: integer
 *         description: Return campaigns expiring at or after this unix timestamp.
 *     responses:
 *       200:
 *         description: A paginated list of campaigns.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *                 total:
 *                   type: integer
 *                   description: Total number of campaigns matching filters.
 *                 page:
 *                   type: integer
 *                   description: Current page number.
 *                 limit:
 *                   type: integer
 *                   description: Items per page.
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
campaignRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  // Validate and parse pagination parameters
  const pageStr = String(req.query.page ?? "1").trim();
  const limitStr = String(req.query.limit ?? "20").trim();

  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

  // Validate page
  if (isNaN(page) || page < 1) {
    throw new BadRequestError("Invalid pagination parameters", {
      page: pageStr,
      message: "page must be a positive integer",
    });
  }

  // Validate limit
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new BadRequestError("Invalid pagination parameters", {
      limit: limitStr,
      message: "limit must be an integer between 1 and 100",
    });
  }

  // Convert page to offset
  const offset = (page - 1) * limit;

  const filters: CampaignFilters = {};
  if (req.query.search) filters.search = String(req.query.search);
  if (req.query.status === "active" || req.query.status === "inactive") {
    filters.status = req.query.status;
  }
  if (req.query.expires_before) {
    const v = parseInt(String(req.query.expires_before), 10);
    if (!isNaN(v)) filters.expires_before = v;
  }
  if (req.query.expires_after) {
    const v = parseInt(String(req.query.expires_after), 10);
    if (!isNaN(v)) filters.expires_after = v;
  }

  const cacheKey = `campaigns:list:${limit}:${offset}:search=${filters.search ?? ""}:status=${filters.status ?? ""}:expires_before=${filters.expires_before ?? ""}:expires_after=${filters.expires_after ?? ""}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${cacheKey}`);
      const cachedData = JSON.parse(cached);
      return res.json(cachedData);
    }
  } catch (err) {
    logger.error("Redis cache read error", err as Error);
  }

  logger.debug(`Cache miss for ${cacheKey}`);
  const result = await getCampaigns(limit, offset, filters);

  // Transform response format
  const paginatedResponse = {
    data: result.campaigns,
    total: result.total,
    page,
    limit,
  };

  try {
    await redisClient.setex(cacheKey, 30, JSON.stringify(paginatedResponse));
  } catch (err) {
    logger.error("Redis cache write error", err as Error);
  }

  res.json(paginatedResponse);
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
  const id = parseStrictInteger(String(req.params.id));
  if (id === null) {
    throw new BadRequestError("Invalid id", { id: req.params.id });
  }
  const campaign = await getCampaignById(id);
  if (!campaign) {
    throw new NotFoundError("Campaign");
  }
  res.json({ campaign });
}));

/**
 * @openapi
 * /campaigns/reorder:
 *   patch:
 *     summary: Reorder campaigns
 *     description: Persists the display order of campaigns for a merchant.
 *     tags: [Campaigns]
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
 *       500:
 *         description: Server error.
 */
campaignRouter.patch("/reorder", writeLimiter, validateBody(ReorderSchema), asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.body;
  await reorderCampaigns(order);
  res.json({ ok: true });
}));

/**
 * DELETE /campaigns/:id
 * Soft-deletes a campaign by setting deleted_at.
 */
campaignRouter.delete("/:id", writeLimiter, async (req: Request, res: Response) => {
  const id = parseStrictInteger(String(req.params.id));
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const deleted = await softDeleteCampaign(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

/**
 * POST /campaigns/:id/restore
 * Restores a soft-deleted campaign.
 */
campaignRouter.post("/:id/restore", writeLimiter, async (req: Request, res: Response) => {
  const id = parseStrictInteger(String(req.params.id));
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const restored = await restoreCampaign(id);
    if (!restored) return res.status(404).json({ error: "Not found or not deleted" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to restore campaign" });
  }
});

campaignRouter.post("/", writeLimiter, sanitizeBody, async (req: Request, res: Response) => {
  const parsed = CreateCampaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const { name: _name, description: _desc, ...rest } = parsed.data;
    await upsertCampaign({ ...rest, id: Date.now(), active: true, total_claimed: 0 });
    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to create campaign" });
  }
});
