# Nara review and remaining verification

## Recovered source

The connected repository has an existing Next.js implementation, not an empty tree.
It contains a contact form, waitlist, Better Auth and a customer saved-search dashboard.
It does not contain the three-form implementation or testing report described in the request.
Existing work is retained, including legacy contact categories. The new inquiry routes are
/inquiries/sales, /inquiries/investment and /inquiries/development. All use the existing
nara_contact_messages table and server validation/rate-limit path. References use the
saved row ID (NARA-<id>); these references are not access credentials or public lookup URLs.

## Private lead review

/dashboard/leads requires a valid Better Auth session AND an exact immutable user ID in
NARA_ADMIN_USER_IDS. Without configuration everyone is denied. Ordinary sign-up grants
no private lead access. It shows the most recent 100 contact records with category;
no export, deletion or update operations are provided. This is not a replacement for a
full CRM, and waitlist records are not included. An owner must identify trusted existing
accounts before configuring the allowlist. Do not invent accounts or IDs.

## Email activation (not delivery-verified)

Resend is already used by the source. No RESEND_API_KEY, EMAIL_FROM or
CONTACT_INBOX_EMAIL appeared in the project's environment inventory; only Neon was
listed among connected Marketplace resources. The UI intentionally states saved but
email alerts not configured or delivery-verified. Provider rejection or network failure
does not invalidate a saved submission. There is no durable email retry queue yet.

Owner action: Vercel Marketplace > Resend > Install, select the existing Nara project,
and authorize creating/linking the Resend account and supplying its project API key.
Use sending-only permissions if manually provisioning a key. In Resend > Domains,
verify an owned sending domain using the exact DNS records supplied by Resend.
In Vercel project Settings > Environment Variables, set EMAIL_FROM to an address on
that verified domain and CONTACT_INBOX_EMAIL to the actual notification recipient.
Do not paste API keys into chat. Rebuild the preview after configuration. Verify all
three categorized submissions against both database records and the destination inbox;
provider acceptance alone is not proof of delivery. Keep the warning until that passes.
No owner domain or destination inbox was supplied, so none was invented.

## Database isolation recommendation — no migration executed

The source explicitly maps app and authentication tables to nara_ names, but prefixing
is logical organization, not a database authorization boundary. No database rows,
migrations, tables, credentials or environment values were changed by this work.
The three reported test leads have not been deleted or independently verified.

Prefer a dedicated Nara Neon project/database, with separate preview and production
branches, and dedicated least-privilege credentials. Before changing anything:
1. Inventory actual nara_ tables, foreign keys, auth records, sequences and test leads
   using an authorized database connection; do not infer live schema from source alone.
2. Snapshot/backup the source. Keep unrelated Ginicci data untouched.
3. Create the target separately; review existing SQL migrations against the real schema.
   Copy only Nara tables and required sequences/constraints, including auth records.
4. Verify row counts, relationships, sequence values and all three preserved test leads.
5. Configure only Preview DATABASE_URL (and any connection aliases actually used by
   consumers), auth base URL and secrets deliberately. Test login, private access and
   writes against the isolated preview database. Do not point Preview at production data.
6. Request explicit approval for cutover. Coordinate any write freeze and final delta
   copy; preserve rollback credentials/backup and old data. Production remains unchanged
   until separately approved. No DROP/TRUNCATE/DELETE is part of this proposal.

## Verification scope

Automated tests mock database writes; they do not prove live database connectivity,
record persistence or email delivery. Tests cover category validation, reference responses,
rate-limit responses, database failure handling and exact admin ID matching. Page-level tests
now exercise /dashboard/leads itself: signed-out visitors are redirected and empty or
non-matching allowlists return not-found, all before any lead query runs.

The per-email count/insert now runs in one transaction behind a per-email Postgres
advisory lock, so concurrent submissions for one address cannot exceed the hourly limit
(no schema change). It is still per-email, not IP-based: rotating addresses bypasses it.
IP-based or edge rate limiting (e.g. Upstash Ratelimit or Vercel Firewall rules) remains
recommended before production. The success message says "Our team has been notified"
only when the provider accepts the inbox alert; otherwise the saved-but-unverified
warning is shown. Provider acceptance is still not proof of inbox delivery.

Security headers include CSP **report-only**, never enforcement. Preview X-Robots-Tag
and robots.txt deny indexing; sitemap returns no URLs outside production. These are not
access controls. Lead review is dynamic, private/no-store and noindex. Unauthenticated
or non-allowlisted requests must never query lead data.

Pending live checks: actual three-form database writes/reference matching; authorized
and unauthorized admin sessions; real rate-limit behavior; mobile viewport and keyboard
navigation; deployed headers, robots and sitemap; actual inbox delivery. The sandbox
cannot directly access external databases or deployment HTTP endpoints. Original design
reference was not provided; no visual parity claim is made. No production promotion,
publishing, data migration or test-lead deletion is authorized by this document.

## Build and security audit notes

Baseline: 17 tests passed. Added coverage brings the suite to 25 tests. Typecheck and
production compilation are required, with ignoreBuildErrors removed. Local builds have
no application secrets and emit Better Auth configuration warnings; deployed auth still
requires runtime verification despite the project's existing BETTER_AUTH_SECRET name.

The registry audit flagged Next.js 16.4.0; this branch updates to the advisory's patched
16.4.1 release. The broader dependency tree also contains inherited advisories (including
shadcn CLI transitive dependencies). A clean security audit is NOT claimed; review and
remediate the remaining tree before production approval.

Direct CLI preview creation was refused with:
"You don't have permission to create a v0 Deployment for this Vercel project: nara-real-estate-website."
This occurred with approved deployment scope after successful project reads/Git connection.
If PR Git checks also cannot deploy, ask Vercel support to inspect the project's v0
preview-creation authorization and Git deployment eligibility. Do not create a duplicate
project or disable protection as a workaround.

Dependency remediation (follow-up): every production advisory (1 critical, 28 high,
35 moderate, 8 low) came through the shadcn CLI, which was a runtime dependency although
the app only uses its CSS at build time. shadcn moved to devDependencies (Vercel still
installs it for builds). postcss was raised to 8.5.23 and pnpm overrides pin patched
nanoid, browserslist, baseline-browser-mapping, source-map-js and postcss. Result:
`pnpm audit` and `pnpm audit --prod` both report no known vulnerabilities (advisory data
at the time of the check; re-run before approval). 33 tests and typecheck pass.

## Deployment hold — Production-target incident

GitHub records deployment 7319261748 for feature commit 80df166 (created by vercel[bot])
with environment "Production"; it reported success at
nara-real-estate-website-7dfjh5byc-ginicci-labs.vercel.app and that URL and the
production alias now return 404. Why a feature-branch commit targeted Production has not
been verified: Vercel project reads from this workspace fail at the credential broker,
so the production branch, Git settings, and the deployment's actual target/source (v0 vs Git)
are unconfirmed. Do not assume this was only a label.

Until an owner confirms in Vercel > Project > Settings > Git that the production branch
is `main` and in Deployments that 7dfjh5byc's target and source are understood,
vercel.json disables Git deployments for `feature/nara-lead-safety`. Pushing this branch
therefore creates no deployment. To get a Preview: confirm the settings above, remove the
`git.deploymentEnabled` entry in a new commit, and verify the resulting deployment shows
target "Preview" with its own Preview environment variables before testing. Remove the
entry before merging. Do not promote, redeploy or delete 7dfjh5byc without owner review.
