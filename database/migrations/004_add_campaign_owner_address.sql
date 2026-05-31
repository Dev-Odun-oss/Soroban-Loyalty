-- Migration: Add owner_address to campaigns table
-- owner_address stores the Stellar public key of the campaign creator
-- for ownership-based access control.

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS owner_address VARCHAR(56);

-- Backfill existing rows: use merchant as the owner (same creator address)
UPDATE campaigns SET owner_address = merchant WHERE owner_address IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE campaigns ALTER COLUMN owner_address SET NOT NULL;

-- Index for ?owner=:address filter
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_address);
