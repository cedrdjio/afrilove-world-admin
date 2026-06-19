import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/env";

const COOKIE_NAME = "afrilove_session";
const PUBLIC_PATHS = ["/login"];

function secret() {
  return new TextEncoder().encode(getAuthSecret());
}

async function isValid(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValid(token);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!authed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (authed && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Protect everything except Next internals, the API auth route and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)"],
};
