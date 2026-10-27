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
