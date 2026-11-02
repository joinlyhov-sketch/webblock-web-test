// Admin Portal data access. Mock now; when Spring is ready only the function bodies change.
// Every function maps to one endpoint under /api/admin (noted above each).
import { getBusinessInfo } from "@/features/business-info/api";
import { getTemplateSite } from "@/features/templates/api";
import { getWebsite as getOwnedWebsite } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { activityLog } from "@/mocks/admin-activity";
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
import type { ActivityAction } from "./monitoring/types";
import type {
  AdminNotification,
  AdminOverview,
  AdminProfile,
  AttentionItem,
  NotificationFilters,
  NotificationKind,
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

/** Every read waits a moment, then first lets running deploys move forward (the backend does this on its own). */
const delay = async (ms = 250) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  settleDeploys();
};

// ── Live state: deploys that progress, and events that other screens show ────

const PIPELINE_STEPS = 7;
/** How long each of the 7 pipeline steps takes in the mock, so a deploy visibly finishes in about 30 seconds. */
const STEP_MS = 4_000;
const STEP_TITLES = [
  "Request received",
  "Generate code",
  "Save to Git",
  "Build",
  "Start privately",
  "Go live",
  "Live",
];

/** Deploys started from this portal, with when they started. Spring runs the real pipeline instead. */
const runningDeploys = new Map<string, number>();
/** Every deploy started here, finished or not (the Monitoring screen shows their steps). */
export const redeployedIds = new Set<string>();

// Deploys already in progress in the seed data keep moving from the step they are on.
// Mao Print House's run is stuck (Monitoring shows no heartbeat): it stays at its step until the backend retries it.
const STALLED_DEPLOY_IDS = new Set(["c7e1a3b5-2d4f-4e6a-9b8c-1d3f5a7c0321"]);
for (const d of adminDeploys) {
  if (d.status !== "GOING_LIVE" || STALLED_DEPLOY_IDS.has(d.id)) continue;
  runningDeploys.set(d.id, Date.now() - ((d.currentStep ?? 1) - 1) * STEP_MS);
  redeployedIds.add(d.id);
}

/** Moves each running deploy to the step its age says; at the last step it goes live and updates its website. */
export function settleDeploys() {
  const now = Date.now();
  for (const [deployId, startedMs] of runningDeploys) {
    const deploy = adminDeploys.find((d) => d.id === deployId);
    const website = adminWebsites.find((w) => w.id === deploy?.websiteId);
    if (!deploy || !website) {
      runningDeploys.delete(deployId);
      continue;
    }
    const elapsed = now - startedMs;
    const step = Math.min(PIPELINE_STEPS, 1 + Math.floor(elapsed / STEP_MS));
    if (step < PIPELINE_STEPS) {
      deploy.currentStep = step;
      deploy.stepLabel = STEP_TITLES[step - 1];
      continue;
    }
    // Went live: this release replaces the one before it.
    for (const d of adminDeploys) {
      if (d.websiteId === deploy.websiteId && d.status === "LIVE") d.status = "REPLACED";
    }
    deploy.status = "LIVE";
    deploy.currentStep = null;
    deploy.stepLabel = null;
    deploy.durationSeconds = Math.round(elapsed / 1000);
    website.releaseStatus = "LIVE";
    website.routingStatus = "STABLE";
    website.liveRelease = `R-${2900 + Math.floor(startedMs / 1000) % 1000}`;
    if (website.siteStatus === "NOT_DEPLOYED") website.siteStatus = "ONLINE";
    website.lastDeployAt = deploy.startedAt;
    // A first deploy also gets its SSL certificate (90 days, like Let's Encrypt).
    website.sslValidUntil ??= new Date(now + 90 * 86_400_000).toISOString();
    runningDeploys.delete(deployId);
  }
}

/** One line in Monitoring > Activity log, done by the signed-in admin. Newest first. */
function logActivity(
  action: ActivityAction,
  targetName: string,
  targetDetail: string,
  actorEmail: string | null = adminProfile.email,
) {
  activityLog.unshift({
    id: crypto.randomUUID(),
    action,
    targetName,
    targetDetail,
    actorEmail,
    result: "SUCCEEDED",
    createdAt: new Date().toISOString(),
  });
}

/** One unread item in the notification bell and the Notifications page. */
function notify(kind: NotificationKind, website: AdminWebsite, message: string) {
  adminNotifications.unshift({
    id: crypto.randomUUID(),
    kind,
    actorId: website.ownerId,
    actorName: website.ownerName,
    actorAvatarUrl: website.ownerAvatarUrl,
    message,
    link: `/admin/websites?website=${website.id}`,
    createdAt: new Date().toISOString(),
    readAt: null,
  });
}

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
export async function getOverview(): Promise<AdminOverview> {
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
}

// ── Users ────────────────────────────────────────────────────────────────────

/** GET /api/admin/users?q=&page=&size=&sort= */
export async function listUsers(
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
}

/** GET /api/admin/users/stats */
export async function getUserStats(): Promise<UserStats> {
  await delay(150);
  return {
    totalAccounts: userAccounts.length,
    onFreeTrial: userAccounts.filter((u) => u.plan === "FREE_TRIAL").length,
    paying: userAccounts.filter((u) => isPaid(u.plan) && u.status === "ACTIVE").length,
    liveWebsites: liveSites().length,
  };
}

/** GET /api/admin/users/{userId} */
export async function getUser(userId: string): Promise<UserAccount> {
  await delay(150);
  return userAccounts.find((u) => u.id === userId) ?? notFound("User");
}

/** GET /api/admin/users/export.csv?q= — the CSV file body. */
export async function exportUsersCsv(filters: UserFilters): Promise<string> {
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
}

/** POST /api/admin/users/{userId}/suspend */
export async function suspendUser(userId: string): Promise<UserAccount> {
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
  // Their websites go offline with the account. Content is kept.
  for (const w of adminWebsites.filter((x) => x.ownerId === user.id)) w.siteStatus = "SUSPENDED";
  logActivity("SUSPEND_USER", user.fullName, user.email);
  return user;
}

/** POST /api/admin/users/{userId}/reactivate */
export async function reactivateUser(userId: string): Promise<UserAccount> {
  await delay();
  const user = userAccounts.find((u) => u.id === userId) ?? notFound("User");
  user.status = "ACTIVE";
  // Websites that went offline with the account come back.
  for (const w of adminWebsites.filter((x) => x.ownerId === user.id && x.siteStatus === "SUSPENDED")) {
    w.siteStatus = w.liveRelease ? "ONLINE" : "NOT_DEPLOYED";
  }
  logActivity("REACTIVATE_USER", user.fullName, user.email);
  return user;
}

// ── Websites ─────────────────────────────────────────────────────────────────

/** GET /api/admin/projects?q=&release=&ownerId=&page=&size=&sort= */
export async function listWebsites(
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
  const page = toPage(sorted(items, query.sort), query);
  return { ...page, items: await Promise.all(page.items.map(withLogo)) };
}

/** Adds the logo from the website's Business information (GET /projects/{id}/business-info). */
async function withLogo(website: AdminWebsite): Promise<AdminWebsite> {
  const [info, owned] = await Promise.all([
    getBusinessInfo(website.id).catch(() => null),
    getOwnedWebsite(website.id).catch(() => null),
  ]);
  // Mock only: sites the websites mock does not know get a template picked from their id.
  const hash = [...website.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const templateId = owned?.templateId ?? `c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c0${(hash % 8) + 1}`;
  const template = await getTemplateSite(templateId).catch(() => null);
  return { ...website, logoUrl: info?.logoUrl ?? null, templateSlug: template?.slug };
}

/** GET /api/admin/projects/{projectId} */
export async function getWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay(150);
  return withLogo(adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website"));
}

/** GET /api/admin/deploys?projectId=&page=&size= — newest first. */
export async function listDeploys(
  filters: { websiteId?: string },
  query: TableQuery,
): Promise<Page<Deploy>> {
  await delay(150);
  const items = adminDeploys
    .filter((d) => !filters.websiteId || d.websiteId === filters.websiteId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const page = toPage(items, query);
  // Mock only: Spring returns the website's logo on each deploy.
  const withLogos = await Promise.all(
    page.items.map(async (d) => {
      const website = adminWebsites.find((w) => w.id === d.websiteId);
      if (!website) return d;
      const { logoUrl, templateSlug } = await withLogo(website);
      return { ...d, websiteLogoUrl: logoUrl, websiteTemplateSlug: templateSlug };
    }),
  );
  return { ...page, items: withLogos };
}

const redeployKeys = new Map<string, Deploy>();

/**
 * POST /api/admin/projects/{projectId}/redeploy (Idempotency-Key header).
 * The backend runs the pipeline and its retries; we only trigger it and show the state.
 */
export async function redeployWebsite(
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
    totalSteps: PIPELINE_STEPS,
    stepLabel: STEP_TITLES[0],
    startedAt: new Date().toISOString(),
    durationSeconds: null,
  };
  adminDeploys.unshift(deploy);
  website.releaseStatus = "GOING_LIVE";
  website.routingStatus = "UPDATING";
  website.lastDeployAt = deploy.startedAt;
  website.redeploysLeft -= 1;
  redeployKeys.set(idempotencyKey, deploy);
  runningDeploys.set(deploy.id, Date.now());
  redeployedIds.add(deploy.id);
  notify("REDEPLOY_REQUESTED", website, `Requested a redeploy for ${website.name}.`);
  return deploy;
}

/** POST /api/admin/projects/{projectId}/suspend — takes the site offline, content is kept. */
export async function suspendWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website =
    adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  website.siteStatus = "SUSPENDED";
  logActivity("SUSPEND_HOSTING", website.name, website.domain);
  return website;
}

/** POST /api/admin/projects/{projectId}/contact-owner — the backend emails the website's owner. */
export async function contactWebsiteOwner(
  websiteId: string,
  email: { subject: string; message: string },
): Promise<void> {
  await delay();
  const website = adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  // Mock outbox (resets on restart); Spring sends the real email.
  ownerEmailOutbox.push({ to: website.ownerEmail, ...email, sentAt: new Date().toISOString() });
}

const ownerEmailOutbox: { to: string; subject: string; message: string; sentAt: string }[] = [];

/** POST /api/admin/projects/{projectId}/resume */
export async function resumeWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website =
    adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  if (userAccounts.find((u) => u.id === website.ownerId)?.status === "SUSPENDED") {
    throw new ApiError({
      title: "Conflict",
      status: 409,
      detail: `Reactivate ${website.ownerName}'s account first.`,
    });
  }
  website.siteStatus = website.liveRelease ? "ONLINE" : "NOT_DEPLOYED";
  logActivity("RESUME_HOSTING", website.name, website.domain);
  return website;
}

// ── Subscriptions ────────────────────────────────────────────────────────────

/** GET /api/admin/subscriptions?q=&status=&plan=&page=&size=&sort= */
export async function listSubscriptions(
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
}

/** GET /api/admin/subscriptions/stats */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  await delay(150);
  return {
    monthlyRevenue: latestMonthRevenue().total.toFixed(2),
    activePlans: subscriptions.filter((s) => s.status === "ACTIVE").length,
    trialsEndingSoon: trialsEnding().length,
    pending: subscriptions.filter((s) => s.status === "PENDING").length,
  };
}

/** GET /api/admin/subscriptions/{subscriptionId} */
export async function getSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  await delay(150);
  return (
    subscriptions.find((s) => s.id === subscriptionId) ??
    notFound("Subscription")
  );
}

/** GET /api/admin/subscriptions/{subscriptionId}/payments — newest first. */
export async function listPayments(
  subscriptionId: string,
  query: TableQuery,
): Promise<Page<Payment>> {
  await delay(150);
  const items = payments
    .filter((p) => p.subscriptionId === subscriptionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
}

// ── Plans ────────────────────────────────────────────────────────────────────

/** GET /api/admin/plans */
export async function listPlans(): Promise<Page<Plan>> {
  await delay();
  return toPage(plans, { page: 0, size: plans.length });
}

/** GET /api/admin/plans/{planId} */
export async function getPlan(planId: string): Promise<Plan> {
  await delay(150);
  return plans.find((p) => p.id === planId) ?? notFound("Plan");
}

/** PUT /api/admin/plans/{planId} — applies to new subscriptions and renewals. */
export async function updatePlan(
  planId: string,
  input: PlanInput,
): Promise<Plan> {
  await delay();
  const plan = plans.find((p) => p.id === planId) ?? notFound("Plan");
  Object.assign(plan, input);
  return plan;
}

// ── Notifications ────────────────────────────────────────────────────────────

/** GET /api/admin/notifications?unread=&page=&size= — newest first. */
export async function listNotifications(
  filters: NotificationFilters,
  query: TableQuery,
): Promise<Page<AdminNotification>> {
  await delay(150);
  const items = adminNotifications
    .filter((n) => !filters.unread || n.readAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
}

/** GET /api/admin/notifications/unread-count */
export async function getUnreadNotificationCount(): Promise<number> {
  await delay(100);
  return adminNotifications.filter((n) => n.readAt === null).length;
}

/** POST /api/admin/notifications/{notificationId}/read */
export async function markNotificationRead(
  notificationId: string,
): Promise<AdminNotification> {
  await delay(150);
  const notification =
    adminNotifications.find((n) => n.id === notificationId) ??
    notFound("Notification");
  notification.readAt ??= new Date().toISOString();
  return notification;
}

/** POST /api/admin/notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await delay(150);
  const now = new Date().toISOString();
  for (const n of adminNotifications) n.readAt ??= now;
}

// ── Profile ──────────────────────────────────────────────────────────────────

/** GET /api/admin/me — the signed-in admin (Spring reads who from the session). */
export async function getAdminProfile(): Promise<AdminProfile> {
  await delay(100);
  return adminProfile;
}
