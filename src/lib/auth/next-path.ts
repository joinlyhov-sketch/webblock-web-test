// Where to go after signing in ("?next=/templates"). Shared by proxy.ts, the auth pages and the mock
// sign-in route. Keep this file free of server-only imports (proxy.ts runs on the edge).

/** Pages that make no sense to come back to after signing in. */
const AUTH_PAGES = ["/sign-in", "/register", "/verify-otp", "/create-password", "/forgot-password", "/reset-password"];

/**
 * A safe in-app path from `?next=`, or `null`. Only same-site paths ("/templates?x=1"): never "//evil.com",
 * "/\evil.com" or a full URL, so the parameter can't send people to another site.
 */
export function safeNextPath(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.length > 512) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (AUTH_PAGES.some((page) => raw === page || raw.startsWith(`${page}?`) || raw.startsWith(`${page}/`))) return null;
  return raw;
}

/** `href` with `next` added to its query (kept as is when there is no `next`). */
export function withNext(href: string, next: string | null | undefined): string {
  if (!next) return href;
  return `${href}${href.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}`;
}
