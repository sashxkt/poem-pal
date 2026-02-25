import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/write", "/read", "/done", "/inbox"];
const publicPaths = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/write/:path*",
    "/read/:path*",
    "/done/:path*",
    "/inbox/:path*",
    "/login",
    "/register",
    "/api/auth/:path*"
  ]
};
