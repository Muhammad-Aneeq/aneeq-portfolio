/**
 * Creates the feedback tables. Run with `npm run db:migrate`.
 *
 * Idempotent: every statement is IF NOT EXISTS, so running it again against a database
 * that already has the tables changes nothing. Reads DATABASE_URL from `.env.local` the
 * same way `next dev` does, so it targets whichever Neon branch that file points at
 * (the `dev` branch locally). For production, run it once with the production
 * connection string, or let it run from a deploy step.
 */

import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  const sql = neon(url);

  /*
    Invites: one per person asked for feedback.

    Only a SHA-256 of the token is stored, never the token itself, so the table leaking
    would not hand anyone a working link. The raw token exists once: in the link the
    owner copies at creation time.
  */
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_invites (
      id            BIGSERIAL PRIMARY KEY,
      token_hash    TEXT        NOT NULL UNIQUE,
      label         TEXT        NOT NULL,
      relationship  TEXT        NOT NULL CHECK (relationship IN ('client', 'employer', 'colleague')),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      used_at       TIMESTAMPTZ,
      revoked_at    TIMESTAMPTZ
    )`;

  /*
    Submissions. `status` is the whole moderation model: nothing is shown publicly
    unless it is 'approved' AND the person consented to publication.

    `published_quote` is the owner's trimmed version, kept beside the original so a
    trim can always be compared with what was actually written, and never replaces it.
  */
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_entries (
      id               BIGSERIAL PRIMARY KEY,
      invite_id        BIGINT      NOT NULL REFERENCES feedback_invites(id),
      name             TEXT        NOT NULL,
      role             TEXT,
      company          TEXT,
      relationship     TEXT        NOT NULL,
      service          TEXT,
      rating           SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
      quote            TEXT        NOT NULL,
      published_quote  TEXT,
      profile_url      TEXT,
      consent          BOOLEAN     NOT NULL DEFAULT false,
      status           TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      reviewed_at      TIMESTAMPTZ
    )`;

  await sql`CREATE INDEX IF NOT EXISTS feedback_entries_status_idx ON feedback_entries (status, created_at DESC)`;

  const [{ n: invites }] = (await sql`SELECT count(*)::int AS n FROM feedback_invites`) as { n: number }[];
  const [{ n: entries }] = (await sql`SELECT count(*)::int AS n FROM feedback_entries`) as { n: number }[];
  console.log(`migrated. feedback_invites: ${invites} rows, feedback_entries: ${entries} rows`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
