import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin-session";

/** POST only, so a link or an image tag on another site cannot sign the owner out. */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return res;
}
