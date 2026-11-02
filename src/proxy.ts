// Optimistic redirects only. Real authorization is require*() in pages and actions.
import { NextResponse, type NextRequest } from "next/server";
import { withNext } from "@/lib/auth/next-path";
import { AUTH_PREVIEW, ROLE_COOKIE } from "@/lib/auth/roles";

export function proxy(request: NextRequest) {
  if (AUTH_PREVIEW) return NextResponse.next();
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  const home = role === "ADMIN" ? "/admin" : "/websites";

  // Signed in already: the sign-in and sign-up screens have nothing to do, go home.
  if (AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page))) {
    return role ? NextResponse.redirect(new URL(home, request.url)) : NextResponse.next();
  }

  if (!role) {
    // Remember the page, so signing in (or creating an account) comes back to it.
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(withNext("/sign-in", `${pathname}${search}`), request.url));
  }
  if (request.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/websites", request.url));
  }
  return NextResponse.next();
}

/** Sign-in and sign-up screens (signed-out only). Kept in sync with `config.matcher`. */
const AUTH_PAGES = ["/sign-in", "/register", "/verify-otp", "/create-password", "/forgot-password", "/reset-password"];

export const config = {
  matcher: [
    "/sign-in",
    "/register",
    "/verify-otp",
    "/create-password",
    "/forgot-password/:path*",
    "/reset-password",
    "/websites/:path*",
    "/support/:path*",
    "/templates/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/portal/:path*",
    "/admin/:path*",
  ],
};
