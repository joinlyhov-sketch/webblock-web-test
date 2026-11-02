// Profile, password, photo, subscription and billing history logic.
import type { ActionResult } from "@/lib/actions/result";
import {
  getProfile,
  getSubscription,
  listOrders,
  listPlanOptions,
  setPassword,
  updateAvatar,
  updateProfile,
  websiteLimitOf,
} from "./api";
import { settlePendingPayments } from "@/features/billing/api";
import { countPlanDeploys } from "@/features/monitoring/api";
import { countProducts } from "@/features/products/api";
import { listWebsites } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import { formFile, imageToDataUrl } from "@/lib/files";
import { AVATAR_RULE, checkImage } from "@/lib/image-rules";
import { daysUntil } from "@/lib/format";
import { parseTableQuery, type SearchParams, type TableQuery } from "@/lib/table-query";
import { createCollector, FULL_NAME_MAX, formText } from "@/lib/validation/fields";
import type {
  OrderStatus,
  PlanCode,
  PlanOrder,
  Profile,
  ProfileIdentity,
  SidebarSummary,
  Subscription,
} from "./types";

const MIN_PASSWORD_LENGTH = 8;

// ── Reads ────────────────────────────────────────────────────────────────────

export async function getProfileView(userId: string): Promise<Profile> {
  return getProfile(userId);
}

const BILLING_PERIOD_MS = 30 * 24 * 3_600_000;

/** How much of the current period has passed: the trial, or the 30 days before a paid plan renews. */
function trialProgress(subscription: Subscription): number {
  const end = new Date(subscription.renewsAt ?? subscription.trialEndsAt).getTime();
  const start = subscription.renewsAt ? end - BILLING_PERIOD_MS : new Date(subscription.trialStartsAt).getTime();
  const total = end - start;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / total) * 100)));
}

/**
 * The account's plan. One plan covers every website the user has online, so My Websites shows it
 * on each live card. No subscription yet means the free trial.
 */
export async function getCurrentPlan(userId: string): Promise<PlanCode> {
  const subscription = await getSubscription(userId).catch(() => null);
  return subscription?.plan ?? "FREE_TRIAL";
}

/** Data for the trial card and the user row at the bottom of the sidebar. */
export async function getSidebarView(
  userId: string,
): Promise<{ profile: Profile; summary: SidebarSummary }> {
  await settlePendingPayments(userId);
  const [profile, subscription, websites] = await Promise.all([
    getProfile(userId),
    getSubscription(userId).catch(() => null),
    listWebsites(userId, { status: "LIVE" }),
  ]);
  const live = {
    liveWebsiteName: websites.items[0]?.name ?? null,
    liveWebsiteCount: websites.totalItems,
  };

  if (!subscription) {
    return {
      profile,
      summary: { plan: "FREE_TRIAL", planLabel: "Free trial", daysLeft: 0, renewsAt: null, progress: 0, websiteLimit: 1, ...live },
    };
  }
  return {
    profile,
    summary: {
      plan: subscription.plan,
      planLabel: subscription.planName,
      renewsAt: subscription.renewsAt,
      daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
      progress: trialProgress(subscription),
      websiteLimit: subscription.plan === "FREE_TRIAL" ? 1 : websiteLimitOf(subscription.plan),
      ...live,
    },
  };
}

/**
 * The plan's usage counted from real data, so it always matches the websites and products on screen:
 * websites online now (a suspended one is offline and frees its place), products across the owner's
 * websites, and the deploys of those websites in the current period (trial or 30-day plan period).
 */
async function withLiveUsage(userId: string, subscription: Subscription): Promise<Subscription> {
  const [online, all] = await Promise.all([
    listWebsites(userId, { status: "LIVE" }),
    listWebsites(userId, {}),
  ]);
  const productCounts = await Promise.all(all.items.map((w) => countProducts(w.id)));
  const paid = subscription.renewsAt !== null;
  const since = paid
    ? new Date(new Date(subscription.renewsAt as string).getTime() - BILLING_PERIOD_MS).toISOString()
    : subscription.trialStartsAt;
  const onlineIds = online.items.map((w) => w.id);
  const live: Record<string, number> = {
    websites: online.items.length,
    products: productCounts.reduce((sum, c) => sum + c.total, 0),
    deploys: countPlanDeploys(onlineIds, since, false),
    redeploys: countPlanDeploys(onlineIds, since, true),
  };
  return { ...subscription, usage: subscription.usage.map((m) => ({ ...m, used: live[m.key] ?? m.used })) };
}

export type BillingView = {
  subscription: Subscription;
  daysLeft: number;
  /** Length of the period the ring counts down: 14 trial days or 30 paid days. */
  periodDays: number;
  progress: number;
  /** Website named in "Pick a plan to keep … online". */
  websiteName: string | null;
  /** Every order. The billing history filters, sorts and pages them in the browser. */
  orders: PlanOrder[];
  planOptions: { value: string; label: string }[];
  /** Starting view read from the URL, so a shared or refreshed link opens on the same tab and page. */
  initialFilter: {
    status: "ALL" | OrderStatus;
    plan: string;
    size: number;
    /** Zero-based. */
    page: number;
    sort?: TableQuery["sort"];
  };
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function getBillingView(
  userId: string,
  searchParams: SearchParams,
): Promise<BillingView> {
  const statusParam = first(searchParams.status);
  const planParam = first(searchParams.plan);
  const options = await listPlanOptions();
  const status: OrderStatus | undefined =
    statusParam === "paid" ? "PAID" : statusParam === "expired" ? "EXPIRED" : undefined;
  const query = parseTableQuery(searchParams, { sort: { field: "createdAt", direction: "desc" } });

  // A payment confirmed while the user was elsewhere still lands in the history.
  await settlePendingPayments(userId);
  const [subscription, orders, websites] = await Promise.all([
    getSubscription(userId),
    listOrders(userId, {}, { page: 0, size: 1000, sort: query.sort }),
    listWebsites(userId, { status: "LIVE" }),
  ]);

  return {
    subscription: await withLiveUsage(userId, subscription),
    daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
    periodDays: subscription.renewsAt ? 30 : subscription.trialDays,
    progress: trialProgress(subscription),
    websiteName: websites.items[0]?.name ?? null,
    orders: orders.items,
    planOptions: [{ value: "", label: "All" }, ...options],
    initialFilter: {
      status: status ?? "ALL",
      plan: options.find((p) => p.value === planParam)?.value ?? "",
      size: query.size,
      page: query.page,
      sort: query.sort,
    },
  };
}

/** Both Settings tabs in one request, so switching tabs never goes back to the server. */
export async function getSettingsView(
  userId: string,
  searchParams: SearchParams,
): Promise<{ profile: Profile; billing: BillingView }> {
  const [profile, billing] = await Promise.all([getProfileView(userId), getBillingView(userId, searchParams)]);
  return { profile, billing };
}

// ── Writes ───────────────────────────────────────────────────────────────────

function identityOf(profile: Profile): ProfileIdentity {
  return { fullName: profile.fullName, initials: profile.initials, avatarUrl: profile.avatarUrl };
}

export async function saveProfile(userId: string, formData: FormData): Promise<ActionResult<ProfileIdentity>> {
  const fullName = formText(formData, "fullName");
  const c = createCollector();
  c.text("fullName", fullName, "Full name", { min: 2, max: FULL_NAME_MAX });
  if (c.hasErrors) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: c.errors,
      values: { fullName },
    };
  }
  try {
    const profile = await updateProfile(userId, { fullName });
    return { ok: true, data: identityOf(profile), message: "Profile saved" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values: { fullName } };
    throw e;
  }
}

export async function changePassword(userId: string, formData: FormData): Promise<ActionResult> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const profile = await getProfile(userId);

  const c = createCollector();
  if (profile.hasPassword && !currentPassword) c.add("currentPassword", "Enter your current password.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    c.add("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (confirm !== password) c.add("confirmPassword", "The passwords do not match.");
  if (c.hasErrors) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: c.errors };
  }
  try {
    await setPassword(userId, { currentPassword, newPassword: password });
    return {
      ok: true,
      data: undefined,
      message: profile.hasPassword ? "Password changed" : "Password set. You can now sign in with your email.",
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message, fieldErrors: { currentPassword: [e.message] } };
    }
    throw e;
  }
}

export async function saveAvatar(userId: string, formData: FormData): Promise<ActionResult<ProfileIdentity>> {
  const file = formFile(formData, "photo");
  if (!file) return { ok: false, message: "Choose a photo first." };
  const problem = checkImage(file, AVATAR_RULE);
  if (problem) return { ok: false, message: problem };
  try {
    const profile = await updateAvatar(userId, await imageToDataUrl(file));
    return { ok: true, data: identityOf(profile), message: "Photo updated" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function removeAvatar(userId: string): Promise<ActionResult<ProfileIdentity>> {
  try {
    const profile = await updateAvatar(userId, null);
    return { ok: true, data: identityOf(profile), message: "Photo removed" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}
