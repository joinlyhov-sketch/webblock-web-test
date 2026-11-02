// Data access for plans and KHQR payments. Mock now, Spring later: only these function bodies change.
// The backend owns the payment status (PENDING -> PAID or EXPIRED). The frontend only creates an
// order, then reads the status; it never decides that a payment went through.
import { activatePlan, getSubscription, recordPlanOrder } from "@/features/account/api";
import { delay } from "@/lib/api/delay";
import { ApiError } from "@/lib/api/errors";
import { billingPlans, MOCK_AUTO_PAY_MS, MOCK_QR_IMAGE_URL, QR_LIFETIME_MS } from "@/mocks/billing";
import type { BillingPlan, CreatePaymentBody, PaymentKind, PaymentOrder } from "./types";
import { readMockPayments, writeMockPayment, type StoredOrder } from "./mock-payment-store";

const DAY_MS = 24 * 3_600_000;

const globalForStore = globalThis as typeof globalThis & { __wbPayments?: StoredOrder[] };
const store: StoredOrder[] = (globalForStore.__wbPayments ??= []);

// Local development keeps its existing in-memory mock. Vercel requests may hit different instances.
async function ordersFor(userId: string): Promise<StoredOrder[]> {
  return process.env.VERCEL === "1"
    ? readMockPayments(userId)
    : store.filter((entry) => entry.userId === userId);
}

export async function listPlans(): Promise<BillingPlan[]> {
  await delay(80);
  return billingPlans;
}

function reference(id: string): string {
  const hex = id.replace(/-/g, "").toUpperCase();
  return `WB-${hex.slice(0, 4)}-${String(parseInt(hex.slice(4, 8), 16) % 10000).padStart(4, "0")}`;
}

async function entryFor(userId: string, orderId: string): Promise<StoredOrder> {
  const entry = (await ordersFor(userId)).find((e) => e.order.id === orderId);
  if (!entry) {
    throw new ApiError({ title: "Payment not found", status: 404, detail: "We could not find this payment." });
  }
  return entry;
}

/** First day after the period this payment buys. A renewal adds 30 days on top of the current renewal date. */
async function nextPeriodStart(userId: string, kind: PaymentKind, from: number): Promise<string> {
  let base = from;
  if (kind === "RENEW") {
    const { renewsAt } = await getSubscription(userId);
    if (renewsAt) base = Math.max(from, new Date(renewsAt).getTime());
  }
  return new Date(base + 30 * DAY_MS).toISOString();
}

/** Creates a pending order with a QR code that is valid for 10 minutes. */
export async function createPayment(userId: string, body: CreatePaymentBody): Promise<PaymentOrder> {
  await delay(200);
  const plan = billingPlans.find((p) => p.code === body.plan);
  if (!plan) {
    throw new ApiError({ title: "Unknown plan", status: 400, detail: "That plan does not exist." });
  }
  const now = Date.now();
  const id = crypto.randomUUID();
  const nextPaymentAt = await nextPeriodStart(userId, body.kind, now);
  const order: PaymentOrder = {
    id,
    reference: reference(id),
    plan: body.plan,
    planName: plan.name,
    kind: body.kind,
    websiteId: body.websiteId,
    websiteName: body.websiteName,
    websiteDomain: body.websiteDomain,
    websiteImageUrl: body.websiteImageUrl,
    amount: plan.monthlyPrice,
    currency: "USD",
    status: "PENDING",
    qrImageUrl: MOCK_QR_IMAGE_URL,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QR_LIFETIME_MS).toISOString(),
    paidAt: null,
    nextPaymentAt,
  };
  const entry = { userId, order, payAt: now + MOCK_AUTO_PAY_MS };
  if (process.env.VERCEL === "1") await writeMockPayment(entry);
  else store.push(entry);
  return order;
}

async function settle(entry: StoredOrder): Promise<void> {
  const { order } = entry;
  if (order.status !== "PENDING") return;
  const now = Date.now();
  const history = {
    id: order.id,
    plan: order.plan,
    planName: `${order.planName} plan`,
    websiteName: order.websiteName,
    period: order.kind === "RENEW" ? "Monthly · renewal" : "Monthly",
    createdAt: order.createdAt,
    amount: order.amount,
    currency: order.currency,
  } as const;

  if (entry.payAt !== null && now >= entry.payAt && entry.payAt < new Date(order.expiresAt).getTime()) {
    order.status = "PAID";
    order.paidAt = new Date(entry.payAt).toISOString();
    // A restored Vercel renewal uses its original date instead of adding another month on every poll.
    if (process.env.VERCEL !== "1") {
      order.nextPaymentAt = await nextPeriodStart(entry.userId, order.kind, entry.payAt);
    }
    await activatePlan(entry.userId, order.plan, order.nextPaymentAt);
    await recordPlanOrder(entry.userId, { ...history, status: "PAID" });
  } else if (now >= new Date(order.expiresAt).getTime()) {
    order.status = "EXPIRED";
    await recordPlanOrder(entry.userId, { ...history, status: "EXPIRED" });
  }
}

/** Confirms or expires every open payment of the user, so the billing history is always up to date. */
export async function settlePendingPayments(userId: string): Promise<void> {
  for (const entry of await ordersFor(userId)) await settle(entry);
}

export async function getPayment(userId: string, orderId: string): Promise<PaymentOrder> {
  await delay(120);
  const entry = await entryFor(userId, orderId);
  await settle(entry);
  return { ...entry.order };
}

export type MockOutcome = "pay" | "expire" | "expiring";

/**
 * MOCK ONLY (no Spring equivalent): lets a developer see every payment state without waiting.
 * "pay" confirms now, "expire" ends the code now, "expiring" leaves 45 seconds on the clock.
 */
export async function mockSimulatePayment(
  userId: string,
  orderId: string,
  outcome: MockOutcome,
): Promise<void> {
  const entry = await entryFor(userId, orderId);
  if (entry.order.status !== "PENDING") return;
  const now = Date.now();
  if (outcome === "pay") entry.payAt = now;
  if (outcome === "expire") {
    entry.payAt = null;
    entry.order.expiresAt = new Date(now - 1000).toISOString();
  }
  if (outcome === "expiring") {
    entry.payAt = null;
    entry.order.expiresAt = new Date(now + 45_000).toISOString();
  }
  if (process.env.VERCEL === "1") await writeMockPayment(entry);
}
