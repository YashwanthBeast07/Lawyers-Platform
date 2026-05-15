import { NextRequest, NextResponse } from "next/server";

// Protected routes — require a refresh_token cookie to access
const PROTECTED_PREFIXES = ["/dashboard", "/cases", "/appointments", "/notifications"];

// Auth routes — authenticated users should be redirected away
const AUTH_PREFIXES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The HttpOnly refresh_token cookie is the only session signal accessible in middleware
  const hasSession = request.cookies.has("refresh_token");

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Unauthenticated → redirect to login
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → redirect away from login/register to dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
