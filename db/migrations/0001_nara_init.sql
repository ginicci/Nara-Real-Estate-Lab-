-- Nara Real Estate Lab: initial schema.
-- Mirrors the live Neon database exactly. Idempotent: safe to run against a
-- database that already has these tables (they were created on 2026-10-13).
-- Better Auth tables use camelCase columns and are mapped via modelName in lib/auth.ts.

CREATE TABLE IF NOT EXISTS nara_user (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nara_session (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES nara_user("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nara_account (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES nara_user("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nara_verification (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nara_waitlist (
  "id" serial PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "interest" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nara_contact_messages (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "topic" text NOT NULL,
  "message" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nara_saved_searches (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "location" text NOT NULL,
  "maxPrice" integer,
  "notify" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
