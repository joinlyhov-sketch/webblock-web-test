import { mockApi, mockCollection } from "@/lib/mock-state";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
// Data access for the signed-in user's profile, subscription and plan orders. Mock now, Spring later.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import {
  planFilterOptions,
  planOrders as ordersSeed,
  planLimits,
  profiles as seed,
  subscriptions as subscriptionsSeed,
} from "@/mocks/account";
import { buildReceiptPdf } from "@/mocks/receipt-pdf";
import { websitePages } from "@/mocks/website-pages";
import { formatDayMonthYear, formatPrice } from "@/lib/format";
import type { DeployAccess, DeployReason, OrderStatus, PlanCode, PlanOrder, Profile, Subscription } from "./types";
import type { PaidPlanCode } from "@/features/billing/types";
import { mockPaymentStatus, readMockPayments, type MockPaymentSnapshot } from "@/features/billing/mock-payment-session";

const store: Profile[] = mockCollection("profiles", seed);
const subscriptions: Record<string, Subscription> = mockCollection("subscriptions", subscriptionsSeed);
const planOrders: Record<string, PlanOrder[]> = mockCollection("planOrders", ordersSeed);

/** Settle server-owned demo payments, including direct receipt and deploy requests. */
async function restoreMockBilling(userId: string): Promise<void> {
  let latestPaid: MockPaymentSnapshot | undefined;
  for (const entry of await readMockPayments(userId)) {
    const status = mockPaymentStatus(entry);
    if (status === "PENDING") continue;
    const meta = planLimits[entry.body.plan];
    await recordPlanOrder(userId, {
      id: entry.id,
      plan: entry.body.plan,
      planName: `${meta.name} plan`,
      websiteName: entry.body.websiteName,
      period: entry.body.kind === "RENEW" ? "Monthly · renewal" : "Monthly",
      createdAt: entry.createdAt,
      amount: meta.price,
      currency: "USD",
      status,
    });
    if (status === "PAID") latestPaid = entry;
  }
  const current = subscriptions[userId];
  if (
    latestPaid && current &&
    (current.plan !== latestPaid.body.plan || current.renewsAt !== latestPaid.nextPaymentAt)
  ) {
    await activatePlan(userId, latestPaid.body.plan, latestPaid.nextPaymentAt);
  }
}

function find(userId: string): Profile {
  const profile = store.find((p) => p.id === userId);
  if (!profile) {
    throw new ApiError({ title: "Account not found", status: 404, detail: "We could not find your account." });
  }
  return profile;
}

export const getProfile = mockApi(async function getProfile(userId: string): Promise<Profile> {
  await delay(120);
  await restoreMockBilling(userId);
  return find(userId);
});

export const updateProfile = mockApi(async function updateProfile(userId: string, body: { fullName: string }): Promise<Profile> {
  await delay(300);
  const profile = find(userId);
  profile.fullName = body.fullName;
  return profile;
});

export const updateAvatar = mockApi(async function updateAvatar(userId: string, avatarUrl: string | null): Promise<Profile> {
  await delay(400);
  const profile = find(userId);
  profile.avatarUrl = avatarUrl;
  return profile;
});

type SavedPassword = { salt: string; hash: string };
const passwords = mockCollection("passwords", new Map<string, SavedPassword>());

/** Mock account setting only; persist a salted hash rather than the entered password. */
export const setPassword = mockApi(async function setPassword(
  userId: string,
  body: { currentPassword?: string; newPassword: string },
): Promise<Profile> {
  await delay(400);
  const profile = find(userId);
  const saved = passwords.get(userId);
  if (profile.hasPassword && saved && !timingSafeEqual(
    Buffer.from(saved.hash, "hex"), scryptSync(body.currentPassword ?? "", saved.salt, 64),
  )) {
    throw new ApiError({ title: "Wrong password", status: 400, detail: "Your current password is not correct." });
  }
  const salt = randomBytes(16).toString("hex");
  passwords.set(userId, { salt, hash: scryptSync(body.newPassword, salt, 64).toString("hex") });
  profile.hasPassword = true;
  return profile;
});

export const getSubscription = mockApi(async function getSubscription(userId: string): Promise<Subscription> {
  await delay(150);
  await restoreMockBilling(userId);
  const subscription = subscriptions[userId];
  if (!subscription) {
    throw new ApiError({ title: "No subscription", status: 404, detail: "This account has no plan yet." });
  }
  return subscription;
});

function usageOf(subscription: Subscription, key: string) {
  return subscription.usage.find((u) => u.key === key);
}

/**
 * GET /me/deploy-access?projectId= — can this user deploy this website now?
 * Free trial: one free deploy, then a plan is required. Paid plans: a website that was never
 * deployed counts against the website limit, a website that is already live against the
 * monthly redeploy limit. Spring applies the same rules inside the publish call.
 */
export const getDeployAccess = mockApi(async function getDeployAccess(userId: string, websiteId: string): Promise<DeployAccess> {
  const subscription = await getSubscription(userId);
  const firstDeploy = !websitePages.find((p) => p.websiteId === websiteId)?.published;
  const trial = subscription.renewsAt === null;

  let reason: DeployReason;
  if (trial) {
    const deploys = usageOf(subscription, "deploys");
    reason = firstDeploy && (deploys?.used ?? 0) < (deploys?.limit ?? 1) ? "FIRST_FREE_DEPLOY" : "SUBSCRIPTION_REQUIRED";
  } else if (new Date(subscription.renewsAt as string).getTime() < Date.now()) {
    reason = "PLAN_EXPIRED";
  } else {
    const metric = usageOf(subscription, firstDeploy ? "websites" : "redeploys");
    const full = metric !== undefined && metric.used >= metric.limit;
    reason = full ? (firstDeploy ? "WEBSITE_LIMIT" : "REDEPLOY_LIMIT") : "WITHIN_PLAN";
  }
  return {
    allowed: reason === "FIRST_FREE_DEPLOY" || reason === "WITHIN_PLAN",
    reason,
    plan: subscription.plan,
    planName: subscription.planName,
    firstDeploy,
  };
});

/**
 * MOCK ONLY: counts a finished deploy against the plan. Spring does this inside the publish call;
 * the mock calls it from features/editor/api.ts.
 */
export const recordDeploy = mockApi(async function recordDeploy(userId: string, websiteId: string): Promise<void> {
  const subscription = await getSubscription(userId);
  const firstDeploy = !websitePages.find((p) => p.websiteId === websiteId)?.published;
  const bump = (key: string) => {
    const metric = usageOf(subscription, key);
    if (metric) metric.used += 1;
  };
  if (firstDeploy) bump("websites");
  if (subscription.renewsAt === null) bump("deploys");
  else if (!firstDeploy) bump("redeploys");
});

export type ListOrdersFilter = {
  status?: OrderStatus;
  plan?: PlanCode;
};

export const listOrders = mockApi(async function listOrders(
  userId: string,
  filter: ListOrdersFilter,
  query: TableQuery,
): Promise<Page<PlanOrder>> {
  await delay();
  await restoreMockBilling(userId);
  const sorted = (planOrders[userId] ?? [])
    .filter((o) => !filter.status || o.status === filter.status)
    .filter((o) => !filter.plan || o.plan === filter.plan);

  const { field, direction } = query.sort ?? { field: "createdAt", direction: "desc" };
  const sign = direction === "asc" ? 1 : -1;
  sorted.sort((a, b) =>
    field === "amount"
      ? sign * (Number(a.amount) - Number(b.amount))
      : sign * a.createdAt.localeCompare(b.createdAt),
  );
  return toPage(sorted, query);
});

/**
 * GET /me/orders/{orderId}/receipt — the receipt file of a paid order. Spring returns the real PDF;
 * the mock builds a simple one. Only paid orders have a receipt.
 */
export const getOrderReceipt = mockApi(async function getOrderReceipt(
  userId: string,
  orderId: string,
): Promise<{ filename: string; type: "application/pdf"; bytes: Uint8Array }> {
  await delay(150);
  await restoreMockBilling(userId);
  const order = (planOrders[userId] ?? []).find((o) => o.id === orderId);
  if (!order) {
    throw new ApiError({ title: "Order not found", status: 404, detail: "We could not find that order." });
  }
  if (order.status !== "PAID") {
    throw new ApiError({ title: "No receipt", status: 409, detail: "Only paid orders have a receipt." });
  }
  const number = order.id.slice(0, 8).toUpperCase();
  const bytes = buildReceiptPdf(
    `Receipt ${number}`,
    [
      { label: "Receipt no.", value: number },
      { label: "Billed to", value: find(userId).fullName },
      { label: "Email", value: find(userId).email },
      { label: "Plan", value: order.planName },
      { label: "Date", value: formatDayMonthYear(order.createdAt) },
      { label: "Amount paid", value: formatPrice(order.amount, order.currency) },
      { label: "Status", value: "Paid" },
    ],
    "Thank you for choosing WebBlock. Questions? Open Support in your WebBlock account.",
  );
  return { filename: `webblock-receipt-${number}.pdf`, type: "application/pdf", bytes };
});

/** How many websites a paid plan may have online at once. */
export function websiteLimitOf(plan: PaidPlanCode): number {
  return planLimits[plan].websites;
}

export const listPlanOptions = mockApi(async function listPlanOptions(): Promise<{ value: PlanCode; label: string }[]> {
  return planFilterOptions as { value: PlanCode; label: string }[];
});

/**
 * Puts the user on a paid plan after a confirmed payment. Spring does this when the bank confirms;
 * the mock calls it from features/billing/api.ts.
 */
export const activatePlan = mockApi(async function activatePlan(
  userId: string,
  plan: PaidPlanCode,
  nextPaymentAt: string,
): Promise<Subscription> {
  const current = subscriptions[userId];
  if (!current) {
    throw new ApiError({ title: "No subscription", status: 404, detail: "This account has no plan yet." });
  }
  const meta = planLimits[plan];
  const used = (key: string) => current.usage.find((u) => u.key === key)?.used ?? 0;
  const next: Subscription = {
    ...current,
    plan,
    planName: meta.name,
    renewsAt: nextPaymentAt,
    monthlyPrice: meta.price,
    usage: [
      {
        key: "websites",
        label: meta.websites === 1 ? "Website" : "Websites",
        cardLabel: meta.websites === 1 ? "Website" : "Websites",
        used: used("websites"),
        limit: meta.websites,
      },
      {
        key: "redeploys",
        label: "Redeploys",
        cardLabel: "Redeploys this month",
        used: Math.min(meta.redeploys, used("redeploys") || used("deploys")),
        limit: meta.redeploys,
      },
      { key: "products", label: "Products", cardLabel: "Products", used: used("products"), limit: meta.products },
    ],
    includes: [...meta.includes],
  };
  subscriptions[userId] = next;
  find(userId).plan = plan;
  return next;
});

/** Adds a finished payment to the billing history. */
export const recordPlanOrder = mockApi(async function recordPlanOrder(userId: string, order: PlanOrder): Promise<void> {
  const list = (planOrders[userId] ??= []);
  if (!list.some((o) => o.id === order.id)) list.unshift(order);
});
