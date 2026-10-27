BEGIN;
ALTER TABLE nara_listings
 ADD COLUMN IF NOT EXISTS managed boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]',
 ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS "sortOrder" integer NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS "expiresAt" timestamptz,
 ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now();
ALTER TABLE nara_listings DROP CONSTRAINT IF EXISTS nara_listings_status_check;
ALTER TABLE nara_listings ADD CONSTRAINT nara_listings_status_check
 CHECK (status IN ('active','pending','sold','rented','inactive','off_market'));
COMMIT;
