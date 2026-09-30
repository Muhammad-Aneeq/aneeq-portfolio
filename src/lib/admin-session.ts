import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The owner's admin session: a signed cookie, nothing stored server-side.
 *
 * Why not a session table: there is exactly one person who can ever sign in, so a
 * database row per login would be machinery with nothing to manage. The cookie carries
 * the GitHub login and an expiry, signed with AUTH_SECRET (HMAC-SHA256). It cannot be
 * forged without the secret, and it is re-checked against ADMIN_GITHUB_LOGIN on every
 * request, so changing that variable locks out an existing session immediately.
 *
 * httpOnly (no script can read it), SameSite=Lax (not sent on cross-site posts), and
 * Secure whenever the site is served over HTTPS.
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_HOURS = 12;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set and at least 32 characters");
  return s;
}

function allowedLogin(): string | null {
  const login = process.env.ADMIN_GITHUB_LOGIN?.trim();
  return login ? login.toLowerCase() : null;
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** Is this the one GitHub account allowed in? Case-insensitive, as GitHub logins are. */
export function isAllowedLogin(login: string): boolean {
  const allowed = allowedLogin();
  return allowed !== null && login.toLowerCase() === allowed;
}

export function createSessionValue(login: string, now = Date.now()): string {
  const payload = b64(JSON.stringify({ login, exp: now + SESSION_HOURS * 3600_000 }));
  return `${payload}.${sign(payload)}`;
}

export const sessionMaxAge = SESSION_HOURS * 3600;

/** The signed-in admin's login, or null. Every check fails closed. */
export function verifySessionValue(value: string | undefined, now = Date.now()): string | null {
  if (!value) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const { login, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      login?: unknown;
      exp?: unknown;
    };
    if (typeof login !== "string" || typeof exp !== "number" || exp < now) return null;
    return isAllowedLogin(login) ? login : null;
  } catch {
    return null;
  }
}

/** For Server Components: who is signed in, if anyone. */
export async function getAdmin(): Promise<string | null> {
  if (!process.env.AUTH_SECRET) return null;
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

/**
 * For Server Actions: throw unless the owner is signed in.
 *
 * Every admin action calls this first. Rendering a form only on a signed-in page is
 * not a security boundary; the action behind it is a public endpoint that can be
 * called without the page.
 */
export async function requireAdmin(): Promise<string> {
  const login = await getAdmin();
  if (!login) throw new Error("Unauthorized");
  return login;
}
