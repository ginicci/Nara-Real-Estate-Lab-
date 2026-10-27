# Nara Real Estate Lab

Next.js 16 app with Neon Postgres, Better Auth (email + password) and Resend email.

## Features

- **Homepage waitlist**: saves to `nara_waitlist`, sends a confirmation email.
- **Contact form**: saves to `nara_contact_messages`, emails `CONTACT_INBOX_EMAIL` and confirms to the sender.
- **Accounts**: sign-up, sign-in, sign-out, email verification (with resend), forgot / reset password by email.
- **Alerts dashboard** (`/dashboard`): signed-in users create, pause and delete saved-search alerts (`nara_saved_searches`), scoped per user.

## Property administration

`/dashboard/properties` extends the existing Nara database and Better Auth accounts with mobile-friendly listing forms, photo uploads, publication/status controls, featured ordering and automatic expiration. See [setup and daily use](docs/property-management.md). Apply migration `0003` before deploying these routes and explicitly configure trusted admin IDs; access defaults to denied. Property changes require no Git commits or redeployments.

## Environment variables

See [`.env.example`](.env.example).

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Provided by the Vercel Neon integration. |
| `BETTER_AUTH_SECRET` | Yes | ≥32 random chars. Use a different value per environment if possible. |
| `RESEND_API_KEY` | Yes | Full-access or sending key from resend.com. |
| `CONTACT_INBOX_EMAIL` | Yes | Where contact-form messages are delivered. |
| `EMAIL_FROM` | For production | Address on a Resend-verified domain. Without it, mail only reaches your Resend account email. |
| `BETTER_AUTH_URL` | Optional | Set when using a custom domain so auth links point to it. |

## Database

Schema lives in [`db/migrations/0001_nara_init.sql`](db/migrations/0001_nara_init.sql) and is mirrored in `lib/db/schema.ts`.
It is idempotent (`CREATE TABLE IF NOT EXISTS`). The tables already exist in the connected Neon database; run
the file only when pointing the app at a new, empty database.

## Scripts

```bash
pnpm dev        # local dev server
pnpm typecheck  # TypeScript check
pnpm build      # production build
```
