// Shared by proxy.ts and session.ts. Keep this file free of server-only imports.

/** Mock session cookie. Replaced by the real Spring session when the backend exists. */
export const ROLE_COOKIE = "wb_role";

/**
 * Kept `false`: sign in with the temporary "Enter as User / Enter as Admin" buttons on /sign-in instead,
 * so role and ownership checks keep running (a page that forgets its require*() check shows up).
 * While `true`, every page opens without signing in as the mock admin and those checks are skipped.
 * Never active in production builds.
 */
const PREVIEW_WITHOUT_SIGN_IN = false;

export const AUTH_PREVIEW = PREVIEW_WITHOUT_SIGN_IN && process.env.NODE_ENV !== "production";

export type Role = "USER" | "ADMIN";

export function isRole(value: string | undefined): value is Role {
  return value === "USER" || value === "ADMIN";
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
};
