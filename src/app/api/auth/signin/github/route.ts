import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Start GitHub sign-in: redirect to GitHub with a one-time `state`.
 *
 * `state` is a random value also written to a short-lived cookie. The callback refuses
 * any return whose `state` does not match the cookie, which is what stops someone from
 * tricking the owner's browser into completing a login the owner did not start.
 *
 * The callback URL is derived from the request's own origin, so the same code serves
 * localhost and the live domain; each GitHub OAuth app lists exactly one of them.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/admin?error=not-configured", request.url));
  }

  const state = randomBytes(24).toString("base64url");
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback/github`;

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("state", state);
  // The profile only: enough to learn the login name, nothing on the account.
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(authorize);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/api/auth",
    maxAge: 600,
  });
  return response;
}
