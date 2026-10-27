# Nara property management

## Operator setup (once)

1. Apply `db/migrations/0003_property_admin.sql` to the **existing Nara Neon database**. No database/site is created and no listing is deleted. Alternatively deploy once with the **build-only** `NARA_MIGRATE_PROPERTIES=true` flag; `scripts/prepare-property-admin.cjs` checks the existing Nara tables, applies the idempotent migration and runs rolled-back database smoke checks. Normal builds do not migrate.
2. Use an existing trusted Better Auth account (or sign up on Nara), verify its email, then obtain its immutable `nara_user.id` from the Nara database. Confirm identity before granting access. Never use an email address as an admin ID or grant all users access.
3. Vercel → **ginicci-labs → nara-real-estate-website → Settings → Environment Variables**: set `NARA_ADMIN_USER_IDS` to the comma-separated trusted IDs for Production (and Preview only if needed). Configure `RESEND_API_KEY` and a verified `EMAIL_FROM` sender if email verification isn't working. Redeploy once to load configuration. Do not share credential values in messages.
4. Sign in, then open `/dashboard/properties` (also linked from the dashboard for authorized, verified accounts). Unauthorized users get no admin page, and every save independently checks the session, allowlist and verification.

## Daily use — no code, Git or deploys

- **Add New Property** opens a mobile-friendly form. New properties default to **Inactive**; set **Active** when ready to publish, then Save.
- Required: title, address (include unit), city, state, ZIP, price, summary, display order. Sale prices are whole dollars; rental prices are monthly.
- Upload up to **8 JPEG/PNG/WebP photos totaling 2 MB**. Resize phone photos or export HEIC to JPEG before upload. Photos stay in the existing Neon database; no separate storage credentials are needed. Upload order determines gallery order, first is cover. Re-upload to replace the gallery; no upload keeps it; Remove existing photos clears it.
- **Edit property** updates an existing record. Duplicate checks normalize casing/punctuation for address/city/state/ZIP/type, include unit numbers, and serialize concurrent admin saves. They are not geocoding: “Street” vs “St” can require manual review. A sale and rental at the same address are allowed.
- Active and unexpired properties appear on `/homes`. Pending, Sold, Rented, Inactive, expired and legacy off-market properties are hidden, including detail and photo URLs. Inactive removes a property publicly but keeps its record (no destructive deletion).
- Featured homes appear first; set lower **Display order** numbers to move homes higher within featured/non-featured groups. Newest breaks ties. Visitors can search title/address/location, filter sale/rent and price, and page through results.
- Optional expiration hides the property after the selected date at 23:59:59 UTC. No cron or deploy is required for this.
- An edit to a feed listing makes it admin-managed while preserving its feed identity. RentCast sync cannot overwrite it or mark it off-market. There is currently no UI to return ownership to the feed.
- Saves invalidate public listing routes; the next request sees changes. Visitors already viewing an open page must refresh; this is not real-time push.
- If another admin saved since the form loaded, saving is refused: reload and review before saving again.

## Testing boundary

Local unit tests mock authentication and database writes; they cover access denial, create/edit, conflicts, duplicates, uploads, validation and public query visibility. Build-time opt-in smoke tests exercise actual database constraints/visibility in a rolled-back transaction. Neither replaces a signed-in mobile/browser acceptance test. Confirm add with photos → publish → search/detail/gallery → edit/order → change each status → expiration → sign-out/unauthorized access on the deployed site using an authorized account. No tests create a permanent public property.

This implementation is scoped to Nara only. It does not change Ginicci.com.

## Preview schema repair and delivery setup (October 27)

Runtime logs of the original preview proved that its database lacked `nara_listings` and all Better Auth tables (SCHEMA_MISMATCH / PostgreSQL 42P01). A Ready build did not validate runtime. `NARA_INITIALIZE_PREVIEW=true` together with `NARA_MIGRATE_PROPERTIES=true` on the Nara preview branch explicitly initializes the connected preview schema without seeded accounts or inventory, then runs additive migrations 0003/0004 and rolled-back database checks. The initializer refuses to run outside Preview. Remove both flags after the successful build. This does not provision a database or reuse another project's settings.

Daily saved-search matching is implemented at `/api/cron/search-alerts` (10:30 UTC, production only). Requires CRON_SECRET (32+ random characters), RESEND_API_KEY, verified EMAIL_FROM and verified account emails. Delivery records prevent repeat notifications; provider idempotency keys protect short-window retries. Current bounded batch handles the first 100 enabled searches and up to 100 matches per search; scale the worker before exceeding this volume. Preview does not run scheduled email jobs. No live provider delivery is claimed until tested.

Provider configuration in **Nara project → Settings → Environment Variables**:
- `RESEND_API_KEY`: Nara's Resend sending API key.
- `EMAIL_FROM`: Nara sender address on a Resend-verified domain.
- `CONTACT_INBOX_EMAIL`: Nara's lead notification recipient.
- `CRON_SECRET`: project-specific cron authorization secret, 32+ random characters.
- `RENTCAST_API_KEY`: Nara's RentCast subscription key; `LISTING_SYNC_ENABLED=true` is a separate billable-sync opt-in. Without these, manual listing management remains available; no verified provider inventory is fabricated.
- `NARA_ADMIN_USER_IDS`: confirmed trusted Better Auth IDs. No email-based auto-grants.

Font variables now apply the Next.js-generated Geist and Instrument Serif font faces. Built font files are served locally by Next.js, avoiding visitor-side Google font requests. Navigation includes mobile disclosure, service pages, contact and legal pages; imagery on service pages is illustrative brand imagery, not inventory. Legal text requires owner review before publication, as do brokerage disclosures and any jurisdiction-specific business information.
