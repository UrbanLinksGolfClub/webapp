import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_PREFIX = "/admin";
const MEMBER_PREFIXES = ["/club", "/events", "/leaderboard", "/members", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isMemberRoute = MEMBER_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if ((isAdminRoute || isMemberRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/club", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/club/:path*",
    "/events/:path*",
    "/leaderboard/:path*",
    "/members/:path*",
    "/profile/:path*",
  ],
};
