-- Real listing feeds (RentCast). Already applied to the connected Neon database.
-- Run each statement once, in order. All changes are additive; no rows are deleted.

ALTER TABLE nara_listings
  ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'sample',
  ADD COLUMN IF NOT EXISTS "sourceId" text,
  ADD COLUMN IF NOT EXISTS "sourceName" text,
  ADD COLUMN IF NOT EXISTS "address" text,
  ADD COLUMN IF NOT EXISTS "state" text,
  ADD COLUMN IF NOT EXISTS "zipCode" text,
  ADD COLUMN IF NOT EXISTS "county" text,
  ADD COLUMN IF NOT EXISTS "propertyType" text,
  ADD COLUMN IF NOT EXISTS "mlsName" text,
  ADD COLUMN IF NOT EXISTS "mlsNumber" text,
  ADD COLUMN IF NOT EXISTS "listingOffice" text,
  ADD COLUMN IF NOT EXISTS "lastVerifiedAt" timestamptz;

ALTER TABLE nara_listings
  ALTER COLUMN "image" DROP NOT NULL,
  ALTER COLUMN "description" DROP NOT NULL,
  ALTER COLUMN "sqft" DROP NOT NULL,
  ALTER COLUMN "beds" DROP NOT NULL,
  ALTER COLUMN "baths" DROP NOT NULL;

ALTER TABLE nara_listings
  DROP CONSTRAINT IF EXISTS nara_listings_status_check,
  ADD CONSTRAINT nara_listings_status_check
    CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'sold'::text, 'off_market'::text]));

CREATE UNIQUE INDEX IF NOT EXISTS nara_listings_source_source_id_idx
  ON nara_listings ("source", "sourceId");
