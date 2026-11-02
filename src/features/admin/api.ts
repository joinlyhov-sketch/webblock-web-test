import { mockApi, mockCollection } from "@/lib/mock-state";
// Admin Portal data access. Mock now; when Spring is ready only the function bodies change.
// Every function maps to one endpoint under /api/admin (noted above each).
import { ApiError } from "@/lib/api/errors";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { adminNotifications } from "@/mocks/admin-notifications";
import { adminOverview } from "@/mocks/admin-overview";
import { adminProfile } from "@/mocks/admin-profile";
import {
  payments,
  plans,
  subscriptions,
} from "@/mocks/admin-subscriptions";
import { userAccounts } from "@/mocks/admin-users";
import { adminDeploys, adminWebsites } from "@/mocks/admin-websites";
import { daysAgo } from "@/mocks/time";
import type {
  AdminNotification,
  AdminOverview,
  AdminProfile,
  AttentionItem,
  NotificationFilters,
  AdminWebsite,
  Deploy,
  Payment,
  Plan,
  PlanInput,
  Subscription,
  SubscriptionFilters,
  SubscriptionStats,
  UserAccount,
  UserFilters,
  UserStats,
  WebsiteFilters,
} from "./types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

/** Spring-style sort on any top-level field; nulls last. */
function sorted<T>(items: T[], sort: TableQuery["sort"]): T[] {
  if (!sort) return items;
  const field = sort.field as keyof T;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
}

const matches = (q: string | undefined, ...values: string[]) =>
  !q || values.some((v) => v.toLowerCase().includes(q.trim().toLowerCase()));

function notFound(entity: string): never {
  throw new ApiError({
    title: "Not found",
    status: 404,
    detail: `${entity} not found.`,
  });
}

// ── Overview ─────────────────────────────────────────────────────────────────

const DAY = 86_400_000;

// A website's plan and end date are the subscription's (one source of truth).
for (const w of adminWebsites) {
  const sub = subscriptions.find((x) => x.websiteId === w.id);
  if (sub) {
    w.plan = sub.plan;
    w.planEndsAt = sub.endAt;
  }
}

/** "Live" = the site is reachable. Used by both the Overview and Users cards. */
const liveSites = () => adminWebsites.filter((w) => w.siteStatus === "ONLINE");

/**
 * Every KPI below is counted from the same lists the screens show, so a card and the table it
 * summarises can never disagree. The backend does the same with SQL counts.
 */
const isPaid = (plan: string) => plan !== "FREE_TRIAL";
const trialsEnding = () =>
  subscriptions.filter((s) => {
    const left = new Date(s.endAt).getTime() - Date.now();
    return s.plan === "FREE_TRIAL" && s.status !== "EXPIRED" && left >= 0 && left <= 3 * DAY;
  });

/** Money collected for the latest billing month = sum of PAID payments with that period. */
function latestMonthRevenue() {
  const paid = payments.filter((p) => p.status === "PAID");
  const month = paid.map((p) => p.periodStart).sort().at(-1) ?? "";
  const total = paid
    .filter((p) => p.periodStart === month)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return { month, total };
}

/** GET /api/admin/overview */
export const getOverview = mockApi(async function getOverview(): Promise<AdminOverview> {
  await delay();
  const failedSites = adminWebsites
    .filter((w) => w.releaseStatus === "FAILED")
    .sort((a, b) => (b.lastDeployAt ?? "").localeCompare(a.lastDeployAt ?? ""));
  const expired = subscriptions.filter((s) => s.status === "EXPIRED");
  const pending = subscriptions.filter((s) => s.status === "PENDING");
  const trials = trialsEnding();
  const latestSub = (list: Subscription[]) =>
    [...list].sort((a, b) => b.endAt.localeCompare(a.endAt))[0];

  const attention: AttentionItem[] = [
    {
      kind: "FAILED_DEPLOYS",
      count: failedSites.length,
      latestName: failedSites[0]?.name ?? null,
      latestAt: failedSites[0]?.lastDeployAt ?? null,
      latestOwnerName: failedSites[0]?.ownerName ?? null,
      amountAtRisk: null,
      retryInDays: null,
    },
    {
      kind: "PLAN_EXPIRED",
      count: expired.length,
      latestName: latestSub(expired)?.websiteName ?? null,
      latestAt: latestSub(expired)?.endAt ?? null,
      latestOwnerName: latestSub(expired)?.userName ?? null,
      amountAtRisk: null,
      retryInDays: null,
    },
    {
      kind: "PAYMENTS_PAST_DUE",
      count: pending.length,
      latestName: latestSub(pending)?.websiteName ?? null,
      latestAt: latestSub(pending)?.endAt ?? null,
      latestOwnerName: latestSub(pending)?.userName ?? null,
      amountAtRisk: null,
      retryInDays: null,
    },
    {
      kind: "TRIALS_ENDING",
      count: trials.length,
      latestName: latestSub(trials)?.websiteName ?? null,
      latestAt: latestSub(trials)?.endAt ?? null,
      latestOwnerName: latestSub(trials)?.userName ?? null,
      amountAtRisk: null,
      retryInDays: null,
    },
  ];

  // The chart's last bar is this month's real revenue; earlier months keep their shape, scaled to match.
  const { total } = latestMonthRevenue();
  const last = Number(adminOverview.revenueByMonth.at(-1)?.amount ?? 1);
  const revenueByMonth = adminOverview.revenueByMonth.map((m, i, all) => ({
    ...m,
    amount: (i === all.length - 1 ? total : (Number(m.amount) * total) / last).toFixed(2),
  }));
  const since = daysAgo(30);

  return {
    newAccounts: userAccounts.filter((u) => u.joinedAt >= since).length,
    websitesPublished: liveSites().length,
    monthlyRevenue: total.toFixed(2),
    failedDeploys: failedSites.length,
    revenueByMonth,
    attention,
  };
});

// ── Users ────────────────────────────────────────────────────────────────────

/** GET /api/admin/users?q=&page=&size=&sort= */
export const listUsers = mockApi(async function listUsers(
  filters: UserFilters,
  query: TableQuery,
): Promise<Page<UserAccount>> {
  await delay();
  const items = userAccounts.filter(
    (u) =>
      matches(filters.q, u.fullName, u.email) &&
      (!filters.plan || u.plan === filters.plan),
  );
  return toPage(sorted(items, query.sort), query);
});

/** GET /api/admin/users/stats */
export const getUserStats = mockApi(async function getUserStats(): Promise<UserStats> {
  await delay(150);
  return {
    totalAccounts: userAccounts.length,
    onFreeTrial: userAccounts.filter((u) => u.plan === "FREE_TRIAL").length,
    paying: userAccounts.filter((u) => isPaid(u.plan) && u.status === "ACTIVE").length,
    liveWebsites: liveSites().length,
  };
});

/** GET /api/admin/users/{userId} */
export const getUser = mockApi(async function getUser(userId: string): Promise<UserAccount> {
  await delay(150);
  return userAccounts.find((u) => u.id === userId) ?? notFound("User");
});

/** GET /api/admin/users/export.csv?q= — the CSV file body. */
export const exportUsersCsv = mockApi(async function exportUsersCsv(filters: UserFilters): Promise<string> {
  await delay();
  const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const rows = userAccounts
    .filter(
      (u) =>
        matches(filters.q, u.fullName, u.email) &&
        (!filters.plan || u.plan === filters.plan),
    )
    .map((u) =>
      [u.fullName, u.email, u.websiteCount, u.plan, u.status, u.joinedAt]
        .map(cell)
        .join(","),
    );
  return ["Name,Email,Websites,Plan,Status,Joined", ...rows].join("\n");
});

/** POST /api/admin/users/{userId}/suspend */
export const suspendUser = mockApi(async function suspendUser(userId: string): Promise<UserAccount> {
  await delay();
  const user = userAccounts.find((u) => u.id === userId) ?? notFound("User");
  if (user.status === "SUSPENDED") {
    throw new ApiError({
      title: "Conflict",
      status: 409,
      detail: `${user.fullName} is already suspended.`,
    });
  }
  user.status = "SUSPENDED";
  return user;
});

/** POST /api/admin/users/{userId}/reactivate */
export const reactivateUser = mockApi(async function reactivateUser(userId: string): Promise<UserAccount> {
  await delay();
  const user = userAccounts.find((u) => u.id === userId) ?? notFound("User");
  user.status = "ACTIVE";
  return user;
});

// ── Websites ─────────────────────────────────────────────────────────────────

/** GET /api/admin/projects?q=&release=&ownerId=&page=&size=&sort= */
export const listWebsites = mockApi(async function listWebsites(
  filters: WebsiteFilters,
  query: TableQuery,
): Promise<Page<AdminWebsite>> {
  await delay();
  const items = adminWebsites.filter(
    (w) =>
      matches(filters.q, w.name, w.domain, w.ownerName) &&
      (!filters.release || w.releaseStatus === filters.release) &&
      (!filters.plan || w.plan === filters.plan) &&
      (!filters.ownerId || w.ownerId === filters.ownerId),
  );
  return toPage(sorted(items, query.sort), query);
});

/** GET /api/admin/projects/{projectId} */
export const getWebsite = mockApi(async function getWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay(150);
  return adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
});

/** GET /api/admin/deploys?projectId=&page=&size= — newest first. */
export const listDeploys = mockApi(async function listDeploys(
  filters: { websiteId?: string },
  query: TableQuery,
): Promise<Page<Deploy>> {
  await delay(150);
  const items = adminDeploys
    .filter((d) => !filters.websiteId || d.websiteId === filters.websiteId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return toPage(items, query);
});

const redeployKeys = mockCollection("admin.redeployKeys", new Map<string, Deploy>());

/**
 * POST /api/admin/projects/{projectId}/redeploy (Idempotency-Key header).
 * The backend runs the pipeline and its retries; we only trigger it and show the state.
 */
export const redeployWebsite = mockApi(async function redeployWebsite(
  websiteId: string,
  idempotencyKey: string,
): Promise<Deploy> {
  await delay();
  const existing = redeployKeys.get(idempotencyKey);
  if (existing) return existing;

  const website =
    adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  if (website.siteStatus === "SUSPENDED") {
    throw new ApiError({
      title: "Conflict",
      status: 409,
      detail: "Resume hosting before redeploying.",
    });
  }
  if (website.releaseStatus === "GOING_LIVE") {
    throw new ApiError({
      title: "Conflict",
      status: 409,
      detail: "A deploy is already in progress.",
    });
  }
  if (website.redeploysLeft <= 0) {
    throw new ApiError({
      title: "Limit reached",
      status: 429,
      detail: "No redeploys left on this plan this month.",
    });
  }

  const previous = adminDeploys.filter((d) => d.websiteId === websiteId);
  const deploy: Deploy = {
    id: crypto.randomUUID(),
    websiteId,
    websiteName: website.name,
    websiteThumbnailUrl: website.thumbnailUrl,
    ownerName: website.ownerName,
    number: Math.max(0, ...previous.map((d) => d.number)) + 1,
    status: "GOING_LIVE",
    currentStep: 1,
    totalSteps: 5,
    stepLabel: "Request received",
    startedAt: new Date().toISOString(),
    durationSeconds: null,
  };
  adminDeploys.unshift(deploy);
  website.releaseStatus = "GOING_LIVE";
  website.routingStatus = "UPDATING";
  website.lastDeployAt = deploy.startedAt;
  website.redeploysLeft -= 1;
  redeployKeys.set(idempotencyKey, deploy);
  return deploy;
});

/** POST /api/admin/projects/{projectId}/suspend — takes the site offline, content is kept. */
export const suspendWebsite = mockApi(async function suspendWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website =
    adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  website.siteStatus = "SUSPENDED";
  return website;
});

/** POST /api/admin/projects/{projectId}/contact-owner — the backend emails the website's owner. */
export const contactWebsiteOwner = mockApi(async function contactWebsiteOwner(
  websiteId: string,
  email: { subject: string; message: string },
): Promise<void> {
  await delay();
  const website = adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  // Persist the demo outbox; Spring will send the real email.
  ownerEmailOutbox.push({ to: website.ownerEmail, ...email, sentAt: new Date().toISOString() });
});

const ownerEmailOutbox: { to: string; subject: string; message: string; sentAt: string }[] = mockCollection("admin.ownerEmailOutbox", []);

/** POST /api/admin/projects/{projectId}/resume */
export const resumeWebsite = mockApi(async function resumeWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website =
    adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  website.siteStatus = website.liveRelease ? "ONLINE" : "NOT_DEPLOYED";
  return website;
});

// ── Subscriptions ────────────────────────────────────────────────────────────

/** GET /api/admin/subscriptions?q=&status=&plan=&page=&size=&sort= */
export const listSubscriptions = mockApi(async function listSubscriptions(
  filters: SubscriptionFilters,
  query: TableQuery,
): Promise<Page<Subscription>> {
  await delay();
  const items = subscriptions.filter(
    (s) =>
      matches(filters.q, s.userName, s.userEmail, s.websiteName) &&
      (!filters.status || s.status === filters.status) &&
      (!filters.plan || s.plan === filters.plan),
  );
  return toPage(sorted(items, query.sort), query);
});

/** GET /api/admin/subscriptions/stats */
export const getSubscriptionStats = mockApi(async function getSubscriptionStats(): Promise<SubscriptionStats> {
  await delay(150);
  return {
    monthlyRevenue: latestMonthRevenue().total.toFixed(2),
    activePlans: subscriptions.filter((s) => s.status === "ACTIVE").length,
    trialsEndingSoon: trialsEnding().length,
    pending: subscriptions.filter((s) => s.status === "PENDING").length,
  };
});

/** GET /api/admin/subscriptions/{subscriptionId} */
export const getSubscription = mockApi(async function getSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  await delay(150);
  return (
    subscriptions.find((s) => s.id === subscriptionId) ??
    notFound("Subscription")
  );
});

/** GET /api/admin/subscriptions/{subscriptionId}/payments — newest first. */
export const listPayments = mockApi(async function listPayments(
  subscriptionId: string,
  query: TableQuery,
): Promise<Page<Payment>> {
  await delay(150);
  const items = payments
    .filter((p) => p.subscriptionId === subscriptionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
});

// ── Plans ────────────────────────────────────────────────────────────────────

/** GET /api/admin/plans */
export const listPlans = mockApi(async function listPlans(): Promise<Page<Plan>> {
  await delay();
  return toPage(plans, { page: 0, size: plans.length });
});

/** GET /api/admin/plans/{planId} */
export const getPlan = mockApi(async function getPlan(planId: string): Promise<Plan> {
  await delay(150);
  return plans.find((p) => p.id === planId) ?? notFound("Plan");
});

/** PUT /api/admin/plans/{planId} — applies to new subscriptions and renewals. */
export const updatePlan = mockApi(async function updatePlan(
  planId: string,
  input: PlanInput,
): Promise<Plan> {
  await delay();
  const plan = plans.find((p) => p.id === planId) ?? notFound("Plan");
  Object.assign(plan, input);
  return plan;
});

// ── Notifications ────────────────────────────────────────────────────────────

/** GET /api/admin/notifications?unread=&page=&size= — newest first. */
export const listNotifications = mockApi(async function listNotifications(
  filters: NotificationFilters,
  query: TableQuery,
): Promise<Page<AdminNotification>> {
  await delay(150);
  const items = adminNotifications
    .filter((n) => !filters.unread || n.readAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
});

/** GET /api/admin/notifications/unread-count */
export const getUnreadNotificationCount = mockApi(async function getUnreadNotificationCount(): Promise<number> {
  await delay(100);
  return adminNotifications.filter((n) => n.readAt === null).length;
});

/** POST /api/admin/notifications/{notificationId}/read */
export const markNotificationRead = mockApi(async function markNotificationRead(
  notificationId: string,
): Promise<AdminNotification> {
  await delay(150);
  const notification =
    adminNotifications.find((n) => n.id === notificationId) ??
    notFound("Notification");
  notification.readAt ??= new Date().toISOString();
  return notification;
});

/** POST /api/admin/notifications/read-all */
export const markAllNotificationsRead = mockApi(async function markAllNotificationsRead(): Promise<void> {
  await delay(150);
  const now = new Date().toISOString();
  for (const n of adminNotifications) n.readAt ??= now;
});

// ── Profile ──────────────────────────────────────────────────────────────────

/** GET /api/admin/me — the signed-in admin (Spring reads who from the session). */
export const getAdminProfile = mockApi(async function getAdminProfile(): Promise<AdminProfile> {
  await delay(100);
  return adminProfile;
});
