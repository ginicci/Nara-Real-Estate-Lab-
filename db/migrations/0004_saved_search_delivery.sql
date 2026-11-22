CREATE TABLE IF NOT EXISTS nara_alert_deliveries (
 "searchId" integer NOT NULL REFERENCES nara_saved_searches(id) ON DELETE CASCADE,
 "listingId" integer NOT NULL REFERENCES nara_listings(id) ON DELETE CASCADE,
 "sentAt" timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY ("searchId", "listingId")
);
