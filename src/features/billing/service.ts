// Plans and KHQR payment logic. The backend owns the payment status; this layer reads it.
import { notFound } from "next/navigation";
import type { ActionResult } from "@/lib/actions/result";
import { getSubscription, websiteLimitOf } from "@/features/account/api";
import {
  createPayment,
  getPayment,
  listPlans,
  settlePendingPayments,
  mockSimulatePayment,
  type MockOutcome,
} from "./api";
import { listWebsites } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import { daysUntil } from "@/lib/format";
import type { DeployReason, PlanCode, Subscription } from "@/features/account/types";
import type { BillingPlan, PaidPlanCode, PaymentOrder } from "./types";
import type { Website } from "@/features/websites/types";

const TEN_MINUTES_MS = 10 * 60_000;
const PETAL_IMAGE = "/images/billing/petal-and-stem.jpg";

export type PlansVariant = "dashboard" | "deploy" | "change";

export type PlansView = {
  variant: PlansVariant;
  plans: BillingPlan[];
  currentPlan: PlanCode;
  currentPlanName: string;
  currentPrice: string | null;
  daysLeft: number;
  websiteName: string;
  /** Website being deployed when the owner was sent here from Deploy, else `null`. */
  websiteId: string | null;
  /** "settings" when the user came from Settings → Billing. */
  from: string;
  /** Why Deploy sent the owner here (`?reason=`, from the backend's deploy check), else `null`. */
  reason: DeployReason | null;
};

const DEPLOY_REASONS: DeployReason[] = ["SUBSCRIPTION_REQUIRED", "PLAN_EXPIRED", "WEBSITE_LIMIT", "REDEPLOY_LIMIT"];

function deployReason(value: string): DeployReason | null {
  return DEPLOY_REASONS.find((r) => r === value) ?? null;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** The website the owner is paying for: the one they were deploying (`chosen`), else their main one. */
async function websiteFor(userId: string, chosen: string | null | undefined): Promise<Website | null> {
  if (chosen) {
    const mine = await listWebsites(userId);
    const match = mine.items.find((w) => w.id === chosen);
    if (match) return match;
  }
  return primaryWebsite(userId);
}

async function primaryWebsite(userId: string): Promise<Website | null> {
  const live = await listWebsites(userId, { status: "LIVE" });
  if (live.items[0]) return live.items[0];
  const all = await listWebsites(userId);
  return all.items[0] ?? null;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function getPlansView(
  userId: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PlansView> {
  await settlePendingPayments(userId);
  const [plans, subscription, website] = await Promise.all([
    listPlans(),
    getSubscription(userId),
    websiteFor(userId, first(searchParams.website)),
  ]);
  const paid = subscription.renewsAt !== null;
  const variant: PlansVariant = paid ? "change" : first(searchParams.from) === "deploy" ? "deploy" : "dashboard";
  return {
    variant,
    plans: variant === "change" ? plans.filter((p) => p.code !== "FREE_TRIAL") : plans,
    currentPlan: subscription.plan,
    currentPlanName: subscription.planName,
    currentPrice: subscription.monthlyPrice,
    daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
    websiteName: website?.name ?? "your website",
    websiteId: variant === "deploy" || first(searchParams.from) === "deploy" ? (website?.id ?? null) : null,
    from: first(searchParams.from) === "settings" ? "settings" : "",
    reason: first(searchParams.from) === "deploy" ? deployReason(first(searchParams.reason)) : null,
  };
}

function isPaidPlan(value: string): value is PaidPlanCode {
  return value === "PLUS" || value === "PRO" || value === "ULTRA";
}

/** Creates the payment for a plan and returns its id so the caller can open the payment page. */
export async function startPayment(
  userId: string,
  planCode: string,
  forWebsite?: string,
): Promise<ActionResult<{ orderId: string }>> {
  if (!isPaidPlan(planCode)) return { ok: false, message: "Choose Plus, Pro or Ultra." };
  try {
    const [subscription, website] = await Promise.all([getSubscription(userId), websiteFor(userId, forWebsite)]);
    return createFor(userId, planCode, subscription, website, forWebsite ? (website?.id ?? null) : null);
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/**
 * A plan only helps if it has room for the website being added: Plus allows 1 website online, Pro 3, Ultra 10.
 * Paying for a plan that is already full would charge the owner and then refuse the deploy.
 */
async function roomProblem(userId: string, plan: PaidPlanCode, website: Website | null): Promise<string | null> {
  if (!website || website.status === "LIVE") return null;
  const online = (await listWebsites(userId, { status: "LIVE" })).items.length;
  const limit = websiteLimitOf(plan);
  if (online < limit) return null;
  return `${plan === "PLUS" ? "Plus" : plan === "PRO" ? "Pro" : "Ultra"} allows ${limit} ${limit === 1 ? "website" : "websites"} online and you already have ${online}. Choose a bigger plan to add ${website.name}.`;
}

async function createFor(
  userId: string,
  plan: PaidPlanCode,
  subscription: Subscription,
  website: Website | null,
  deployingId: string | null,
): Promise<ActionResult<{ orderId: string }>> {
  const problem = await roomProblem(userId, plan, website);
  if (problem) return { ok: false, message: problem };
  const name = website?.name ?? "Your website";
  const order = await createPayment(userId, {
    plan,
    kind: subscription.renewsAt === null ? "SUBSCRIBE" : subscription.plan === plan ? "RENEW" : "CHANGE",
    websiteId: deployingId,
    websiteName: name,
    websiteDomain: website?.domain ?? `${slug(name)}.webblock.com`,
    websiteImageUrl: name === "Petal & Stem" || !website ? PETAL_IMAGE : website.thumbnailUrl,
  });
  return { ok: true, data: { orderId: order.id } };
}

/** "Generate new code" on an expired payment: same plan, fresh order. */
export async function regeneratePayment(userId: string, orderId: string): Promise<ActionResult<{ orderId: string }>> {
  try {
    const old = await getPayment(userId, orderId);
    if (old.status === "PAID") return { ok: true, data: { orderId: old.id } };
    const [subscription, website] = await Promise.all([getSubscription(userId), websiteFor(userId, old.websiteId)]);
    return createFor(userId, old.plan, subscription, website, old.websiteId);
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export type PaymentView = {
  order: PaymentOrder;
  /** Days left of the user's free trial (what the sidebar shows), or `null` when this payment is not the first one. */
  trialDaysLeft: number | null;
  /** Where the back link goes. */
  backHref: string;
  backLabel: string;
  subtitle: string;
  /** Time left on the code when the page was rendered; the client counts down from here. */
  remainingMs: number;
  /** Full lifetime of the code, for the progress bar. */
  totalMs: number;
  /** Where the owner goes once the payment is confirmed: back to where they chose the plan. */
  next: { href: string; label: string };
};

const SUBTITLE: Record<PaymentOrder["kind"], (order: PaymentOrder) => string> = {
  SUBSCRIBE: (o) => `You’re subscribing to ${o.planName} for ${o.websiteName}.`,
  CHANGE: (o) => `You’re switching ${o.websiteName} to the ${o.planName} plan.`,
  RENEW: (o) => `You’re adding another month of ${o.planName} to ${o.websiteName}.`,
};

export async function getPaymentView(
  userId: string,
  orderId: string,
  options: { from?: string; simulate?: string } = {},
): Promise<PaymentView> {
  // MOCK ONLY: `?mock=pay|expire|expiring` jumps to a payment state in development.
  const outcome = options.simulate;
  if (
    process.env.NODE_ENV !== "production" &&
    (outcome === "pay" || outcome === "expire" || outcome === "expiring")
  ) {
    await mockSimulatePayment(userId, orderId, outcome satisfies MockOutcome);
  }
  const order = await getPayment(userId, orderId).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const toSettings = options.from === "settings" && order.status === "PENDING";
  const subscription = await getSubscription(userId);
  return {
    order,
    trialDaysLeft: order.kind === "SUBSCRIBE" ? daysUntil(subscription.trialEndsAt) : null,
    backHref: toSettings
      ? "/settings/billing"
      : order.websiteId
        ? `/billing/plans?from=deploy&website=${order.websiteId}`
        : "/billing/plans",
    backLabel: toSettings ? "Back to settings" : "Back to plans",
    subtitle: SUBTITLE[order.kind](order),
    remainingMs: Math.max(0, new Date(order.expiresAt).getTime() - Date.now()),
    totalMs: Math.max(new Date(order.expiresAt).getTime() - new Date(order.createdAt).getTime(), TEN_MINUTES_MS),
    next: nextAfterPayment(order, options.from),
  };
}

/**
 * Settings → back to Settings › Billing; Deploy → straight on with that website's deploy (the backend
 * generates and publishes it; a draft without an address picks one first); the sidebar card → dashboard.
 * The payment id rides along as the deploy's idempotency key, so reopening this page never deploys twice.
 */
function nextAfterPayment(order: PaymentOrder, from: string | undefined): PaymentView["next"] {
  if (from === "settings") return { href: "/settings/billing", label: "setting up your plan…" };
  if (order.websiteId) return { href: `/websites/${order.websiteId}/deploy?start=${order.id}`, label: "starting your deploy…" };
  return { href: "/websites", label: "setting up your plan…" };
}
