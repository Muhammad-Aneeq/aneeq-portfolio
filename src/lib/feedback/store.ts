import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { hasDatabase, sql } from "@/lib/db";

/**
 * Every feedback query, in one place.
 *
 * Nothing outside this file writes SQL for feedback, so the rules below hold
 * everywhere by construction rather than by each caller remembering them:
 *
 *   · the public site only ever sees entries that are approved AND consented;
 *   · an invite token is stored hashed, and is single use;
 *   · a submission and the use of its invite happen in one statement, so a link
 *     cannot be spent twice by two tabs racing each other.
 *
 * Authorisation is NOT here. The admin functions trust their caller, and every admin
 * Server Action checks the session before calling them (see admin/feedback/actions.ts).
 */

export const RELATIONSHIPS = ["client", "employer", "colleague"] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  client: "Client",
  employer: "Former employer",
  colleague: "Colleague",
};

export type Status = "pending" | "approved" | "rejected";

export type Entry = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  relationship: Relationship;
  service: string | null;
  rating: number;
  quote: string;
  publishedQuote: string | null;
  profileUrl: string | null;
  consent: boolean;
  status: Status;
  createdAt: string;
  reviewedAt: string | null;
  inviteLabel: string;
};

/** What the public page may show. Deliberately a narrower shape than `Entry`. */
export type PublicEntry = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  relationship: Relationship;
  service: string | null;
  rating: number;
  quote: string;
  profileUrl: string | null;
  createdAt: string;
};

export type Invite = {
  id: number;
  label: string;
  relationship: Relationship;
  createdAt: string;
  usedAt: string | null;
  revokedAt: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

type Row = Record<string, unknown>;
const rows = async (q: Promise<unknown>) => (await q) as Row[];
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? null : String(v));

function toEntry(r: Row): Entry {
  return {
    id: Number(r.id),
    name: String(r.name),
    role: (r.role as string) ?? null,
    company: (r.company as string) ?? null,
    relationship: r.relationship as Relationship,
    service: (r.service as string) ?? null,
    rating: Number(r.rating),
    quote: String(r.quote),
    publishedQuote: (r.published_quote as string) ?? null,
    profileUrl: (r.profile_url as string) ?? null,
    consent: Boolean(r.consent),
    status: r.status as Status,
    createdAt: iso(r.created_at)!,
    reviewedAt: iso(r.reviewed_at),
    inviteLabel: String(r.invite_label ?? ""),
  };
}

function toInvite(r: Row): Invite {
  return {
    id: Number(r.id),
    label: String(r.label),
    relationship: r.relationship as Relationship,
    createdAt: iso(r.created_at)!,
    usedAt: iso(r.used_at),
    revokedAt: iso(r.revoked_at),
  };
}

/* ─────────────────────────── public ─────────────────────────── */

/**
 * Approved, consented feedback for the public page, newest first.
 *
 * The owner's trimmed quote when there is one, the original otherwise. Returns an
 * empty list when there is no database, so a build or a preview without one renders
 * the page with nothing in it rather than crashing.
 */
export async function listPublished(): Promise<PublicEntry[]> {
  if (!hasDatabase()) return [];
  const result = await rows(sql()`
    SELECT id, name, role, company, relationship, service, rating,
           COALESCE(published_quote, quote) AS quote, profile_url, created_at
    FROM feedback_entries
    WHERE status = 'approved' AND consent = true
    ORDER BY reviewed_at DESC NULLS LAST, created_at DESC`);
  return result.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    role: (r.role as string) ?? null,
    company: (r.company as string) ?? null,
    relationship: r.relationship as Relationship,
    service: (r.service as string) ?? null,
    rating: Number(r.rating),
    quote: String(r.quote),
    profileUrl: (r.profile_url as string) ?? null,
    createdAt: iso(r.created_at)!,
  }));
}

/** An invite a visitor can still use, or null for unknown, used or revoked. */
export async function findOpenInvite(token: string): Promise<Invite | null> {
  if (!hasDatabase() || !token) return null;
  const [r] = await rows(sql()`
    SELECT id, label, relationship, created_at, used_at, revoked_at
    FROM feedback_invites
    WHERE token_hash = ${hashToken(token)} AND used_at IS NULL AND revoked_at IS NULL`);
  return r ? toInvite(r) : null;
}

export type NewEntry = {
  name: string;
  role?: string;
  company?: string;
  service?: string;
  rating: number;
  quote: string;
  profileUrl?: string;
  consent: boolean;
};

/**
 * Store a submission against its invite, spending the invite in the same statement.
 *
 * One SQL statement, not two: the UPDATE claims the invite only if it is still open,
 * and the INSERT draws from what the UPDATE returned. If the link was already used or
 * revoked, the UPDATE matches nothing, nothing is inserted, and this returns false.
 * Two submissions racing on one link cannot both succeed.
 */
export async function submitWithInvite(token: string, entry: NewEntry): Promise<boolean> {
  if (!hasDatabase()) return false;
  const inserted = await rows(sql()`
    WITH claimed AS (
      UPDATE feedback_invites SET used_at = now()
      WHERE token_hash = ${hashToken(token)} AND used_at IS NULL AND revoked_at IS NULL
      RETURNING id, relationship
    )
    INSERT INTO feedback_entries
      (invite_id, name, role, company, relationship, service, rating, quote, profile_url, consent)
    SELECT claimed.id, ${entry.name}, ${entry.role ?? null}, ${entry.company ?? null},
           claimed.relationship, ${entry.service ?? null}, ${entry.rating}, ${entry.quote},
           ${entry.profileUrl ?? null}, ${entry.consent}
    FROM claimed
    RETURNING id`);
  return inserted.length === 1;
}

/* ─────────────────────────── admin ─────────────────────────── */

/** Create an invite. Returns the raw token, which is never stored and never shown again. */
export async function createInvite(label: string, relationship: Relationship): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await sql()`
    INSERT INTO feedback_invites (token_hash, label, relationship)
    VALUES (${hashToken(token)}, ${label}, ${relationship})`;
  return token;
}

export async function listInvites(): Promise<Invite[]> {
  if (!hasDatabase()) return [];
  const result = await rows(sql()`
    SELECT id, label, relationship, created_at, used_at, revoked_at
    FROM feedback_invites ORDER BY created_at DESC`);
  return result.map(toInvite);
}

export async function revokeInvite(id: number): Promise<void> {
  await sql()`UPDATE feedback_invites SET revoked_at = now() WHERE id = ${id} AND used_at IS NULL`;
}

export async function listEntries(): Promise<Entry[]> {
  if (!hasDatabase()) return [];
  const result = await rows(sql()`
    SELECT e.*, i.label AS invite_label
    FROM feedback_entries e JOIN feedback_invites i ON i.id = e.invite_id
    ORDER BY e.created_at DESC`);
  return result.map(toEntry);
}

/**
 * Change an entry's status. Approval is refused for an entry without consent: the
 * database would accept it, but the public query would never show it, and an entry
 * that says "approved" while being invisible is a status that lies.
 */
export async function setStatus(id: number, status: Status): Promise<boolean> {
  const updated = await rows(sql()`
    UPDATE feedback_entries
    SET status = ${status}, reviewed_at = CASE WHEN ${status} = 'pending' THEN NULL ELSE now() END
    WHERE id = ${id} AND (${status} <> 'approved' OR consent = true)
    RETURNING id`);
  return updated.length === 1;
}

/** Save the owner's trimmed quote. Empty text clears it, restoring the original. */
export async function setPublishedQuote(id: number, text: string): Promise<void> {
  const value = text.trim() ? text.trim() : null;
  await sql()`UPDATE feedback_entries SET published_quote = ${value} WHERE id = ${id}`;
}

export async function deleteEntry(id: number): Promise<void> {
  await sql()`DELETE FROM feedback_entries WHERE id = ${id}`;
}
