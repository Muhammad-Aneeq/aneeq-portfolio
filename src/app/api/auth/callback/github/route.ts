import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  createSessionValue,
  isAllowedLogin,
  sessionMaxAge,
} from "@/lib/admin-session";

/**
 * Finish GitHub sign-in.
 *
 * Every check fails to /admin with a reason and no session: a missing or mismatched
 * `state`, a code GitHub will not exchange, or a GitHub account that is not the owner.
 * The GitHub access token is used once to read the login name and then discarded; it
 * is never stored and never reaches the browser.
 */
export async function GET(request: NextRequest) {
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/admin?error=${reason}`, request.url));
    res.cookies.delete({ name: "oauth_state", path: "/api/auth" });
    return res;
  };

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get("oauth_state")?.value;

  if (!code || !state || !expected) return fail("state");
  const a = Buffer.from(state);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("state");

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("not-configured");

  let login: string;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback/github`,
      }),
    });
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) return fail("github");

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "aneeq-portfolio-admin",
      },
    });
    const user = (await userRes.json()) as { login?: string };
    if (!user.login) return fail("github");
    login = user.login;
  } catch {
    return fail("github");
  }

  if (!isAllowedLogin(login)) return fail("denied");

  const res = NextResponse.redirect(new URL("/admin/feedback", request.url));
  res.cookies.delete({ name: "oauth_state", path: "/api/auth" });
  res.cookies.set(SESSION_COOKIE, createSessionValue(login), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return res;
}
