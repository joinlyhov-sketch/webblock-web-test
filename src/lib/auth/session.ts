// Mock session: the role comes from the "wb_role" cookie, the user from src/mocks/session.ts.
// When Spring is ready, only these function bodies change.
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { sessionUsers, websiteOwners } from "@/mocks/session";
import { AUTH_PREVIEW, ROLE_COOKIE, isRole, type SessionUser } from "./roles";
import { mockApi } from "@/lib/mock-state";

/** Signed-in user, or redirect to /sign-in. In preview (no sign-in yet), no cookie = the mock admin. */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const cookie = (await cookies()).get(ROLE_COOKIE)?.value;
  const role = isRole(cookie) ? cookie : AUTH_PREVIEW ? "ADMIN" : undefined;
  const user = role ? sessionUsers.find((u) => u.role === role) : undefined;
  if (!user) redirect("/sign-in");
  return user;
});

/** Signed-in admin, or redirect non-admins to /websites. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN" && !AUTH_PREVIEW) redirect("/websites");
  return user;
}

/** Signed-in owner of `websiteId`. Anyone else gets a 404 so ids are not leaked. */
export const requireWebsiteOwner = mockApi(async function requireWebsiteOwner(
  websiteId: string,
): Promise<SessionUser> {
  const user = await requireUser();
  const owns = websiteOwners.some(
    (w) => w.websiteId === websiteId && w.ownerId === user.id,
  );
  if (!owns && !AUTH_PREVIEW) notFound();
  return user;
});
