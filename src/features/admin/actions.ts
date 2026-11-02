"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import {
  contactWebsiteOwner,
  markAllNotificationsRead,
  markNotificationRead,
  reactivateUser,
  redeployWebsite,
  resumeWebsite,
  suspendUser,
  suspendWebsite,
  updatePlan,
} from "./api";
import { contactOwnerInput, idInput, planInput } from "./schemas";

const INVALID_ID: ActionResult = { ok: false, message: "That item no longer exists. Refresh the page." };

function refreshAdmin() {
  // Users, websites and subscriptions show each other's data (counts, statuses, owners).
  revalidatePath("/admin", "layout");
}

async function run<T>(call: () => Promise<T>, message: string): Promise<ActionResult> {
  try {
    await call();
    refreshAdmin();
    return { ok: true, data: undefined, message };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(userId);
  if (!id.success) return INVALID_ID;
  return run(() => suspendUser(id.data), "The user can't sign in until you reactivate them.");
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(userId);
  if (!id.success) return INVALID_ID;
  return run(() => reactivateUser(id.data), "The user can sign in again.");
}

/** Triggers a redeploy. The backend owns the pipeline and its retries. */
export async function redeployWebsiteAction(
  websiteId: string,
  idempotencyKey: string,
): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(websiteId);
  const key = idInput.safeParse(idempotencyKey);
  if (!id.success || !key.success) return INVALID_ID;
  return run(() => redeployWebsite(id.data, key.data), "Deploy started. Progress shows on the website.");
}

export async function suspendWebsiteAction(websiteId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(websiteId);
  if (!id.success) return INVALID_ID;
  return run(() => suspendWebsite(id.data), "The website is offline. Its content is kept.");
}

export async function resumeWebsiteAction(websiteId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(websiteId);
  if (!id.success) return INVALID_ID;
  return run(() => resumeWebsite(id.data), "Hosting resumed.");
}

export async function updatePlanAction(
  planId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const id = idInput.safeParse(planId);
  if (!id.success) return { ok: false, message: "That plan no longer exists. Refresh the page.", values: raw };

  const parsed = planInput.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }
  try {
    await updatePlan(id.data, parsed.data);
    refreshAdmin();
    return { ok: true, data: undefined, message: "New subscriptions and renewals use the new limits." };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values: raw };
    throw e;
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idInput.safeParse(notificationId);
  if (!id.success) return INVALID_ID;
  return run(() => markNotificationRead(id.data), "Marked as read.");
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  await requireAdmin();
  return run(() => markAllNotificationsRead(), "All notifications marked as read.");
}

/** "Email owner" popup on User Websites. */
export async function contactOwnerAction(
  websiteId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const id = idInput.safeParse(websiteId);
  if (!id.success) return { ok: false, message: "That website no longer exists. Refresh the page.", values: raw };

  const parsed = contactOwnerInput.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }
  try {
    await contactWebsiteOwner(id.data, parsed.data);
    return { ok: true, data: undefined, message: "They'll get it in their inbox in a moment." };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values: raw };
    throw e;
  }
}
