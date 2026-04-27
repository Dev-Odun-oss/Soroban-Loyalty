# JWT Authentication Implementation TODO

## Step 1: Install Dependencies
- [x] Add `jsonwebtoken` and `@types/jsonwebtoken` to `backend/package.json`
- [ ] Run `npm install` in backend directory (requires Node.js/npm on target machine)

## Step 2: Fix Existing Bugs
- [x] Fix duplicate `pool` exports in `backend/src/db.ts`

## Step 3: Update Environment Schema
- [x] Add `JWT_SECRET` (required) and `JWT_EXPIRY_HOURS` (optional, default 1) to `backend/src/env.ts`

## Step 4: Database Schema
- [x] Add `auth_challenges` table to `database/schema.sql`

## Step 5: Create Authentication Service
- [x] Create `backend/src/services/auth.service.ts` with challenge generation, signature verification, JWT sign/verify

## Step 6: Create Authentication Routes
- [x] Create `backend/src/routes/auth.routes.ts` with `POST /auth/challenge` and `POST /auth/verify`

## Step 7: Create Authentication Middleware
- [x] Create `backend/src/middleware/auth.ts` with `requireAuth` middleware

## Step 8: Protect Merchant Routes
- [x] Apply `requireAuth` to `PATCH /campaigns/reorder`
- [x] Apply `requireAuth` to `DELETE /campaigns/:id`
- [x] Apply `requireAuth` to `POST /campaigns/:id/restore`
- [x] Add merchant ownership validation where applicable

## Step 9: Wire Everything Together
- [x] Register auth router in `backend/src/app.ts`
- [x] Ensure correlation middleware is applied

## Step 10: Update OpenAPI Spec
- [x] Add auth schemas and bearer security to `backend/src/openapi.ts`

## Step 11: Add Tests
- [x] Create unit tests for auth service (`backend/src/services/__tests__/auth.service.test.ts`)
- [x] Create integration tests for auth routes (`backend/src/__tests__/integration/auth.routes.test.ts`)
- [x] Update existing integration test setup (`backend/src/__tests__/integration/testDb.ts`)

## Step 12: Verification (requires `npm install`)
- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run test:integration`

