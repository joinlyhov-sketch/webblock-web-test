import { mockApi } from "@/lib/mock-state";
// Data access for plans and KHQR payments. Mock now, Spring later: only these function bodies change.
// The backend owns the payment status (PENDING -> PAID or EXPIRED). The frontend only creates an
// order, then reads the status; it never decides that a payment went through.
import { getSubscription } from "@/features/account/api";
import { delay } from "@/lib/api/delay";
import { ApiError } from "@/lib/api/errors";
import { billingPlans, MOCK_AUTO_PAY_MS, MOCK_QR_IMAGE_URL, QR_LIFETIME_MS } from "@/mocks/billing";
import type { BillingPlan, CreatePaymentBody, PaymentKind, PaymentOrder } from "./types";
import {
  mockPaymentStatus,
  overrideMockPayment,
  readMockPayments,
  saveMockPayment,
  type MockPaymentSnapshot,
} from "./mock-payment-session";

const DAY_MS = 24 * 3_600_000;

export const listPlans = mockApi(async function listPlans(): Promise<BillingPlan[]> {
  await delay(80);
  return billingPlans;
});

function reference(id: string): string {
  const hex = id.replace(/-/g, "").toUpperCase();
  return `WB-${hex.slice(0, 4)}-${String(parseInt(hex.slice(4, 8), 16) % 10000).padStart(4, "0")}`;
}

async function entryFor(userId: string, orderId: string): Promise<MockPaymentSnapshot> {
  const entry = (await readMockPayments(userId)).find((e) => e.id === orderId);
  if (!entry) {
    throw new ApiError({ title: "Payment not found", status: 404, detail: "We could not find this payment." });
  }
  return entry;
}

function paymentFrom(entry: MockPaymentSnapshot): PaymentOrder {
  const plan = billingPlans.find((p) => p.code === entry.body.plan)!;
  const status = mockPaymentStatus(entry);
  return {
    ...entry.body,
    id: entry.id,
    reference: reference(entry.id),
    planName: plan.name,
    amount: plan.monthlyPrice,
    currency: "USD",
    status,
    qrImageUrl: MOCK_QR_IMAGE_URL,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    paidAt: status === "PAID" && entry.payAt !== null ? new Date(entry.payAt).toISOString() : null,
    nextPaymentAt: entry.nextPaymentAt,
  };
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
export const createPayment = mockApi(async function createPayment(userId: string, body: CreatePaymentBody): Promise<PaymentOrder> {
  await delay(200);
  const plan = billingPlans.find((p) => p.code === body.plan);
  if (!plan) {
    throw new ApiError({ title: "Unknown plan", status: 400, detail: "That plan does not exist." });
  }
  const now = Date.now();
  const id = crypto.randomUUID();
  const payAt = now + MOCK_AUTO_PAY_MS;
  const entry: MockPaymentSnapshot = {
    id,
    userId,
    body,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QR_LIFETIME_MS).toISOString(),
    // Freeze the renewal base at creation: replaying a demo order must not add another month.
    nextPaymentAt: await nextPeriodStart(userId, body.kind, payAt),
    payAt,
  };
  await saveMockPayment(entry);
  return paymentFrom(entry);
});

/** Confirms or expires every open payment of the user, so the billing history is always up to date. */
export const settlePendingPayments = mockApi(async function settlePendingPayments(userId: string): Promise<void> {
  // Account reads settle the shared server records and update subscription/history together.
  await getSubscription(userId);
});

export const getPayment = mockApi(async function getPayment(userId: string, orderId: string): Promise<PaymentOrder> {
  await delay(120);
  const entry = await entryFor(userId, orderId);
  await settlePendingPayments(userId);
  return paymentFrom(entry);
});

export type MockOutcome = "pay" | "expire" | "expiring";

/**
 * MOCK ONLY (no Spring equivalent): lets a developer see every payment state without waiting.
 * "pay" confirms now, "expire" ends the code now, "expiring" leaves 45 seconds on the clock.
 */
export const mockSimulatePayment = mockApi(async function mockSimulatePayment(
  userId: string,
  orderId: string,
  outcome: MockOutcome,
): Promise<void> {
  const entry = await entryFor(userId, orderId);
  if (mockPaymentStatus(entry) !== "PENDING") return;
  const now = Date.now();
  if (outcome === "pay") entry.payAt = now;
  if (outcome === "expire") {
    entry.payAt = null;
    entry.expiresAt = new Date(now - 1000).toISOString();
  }
  if (outcome === "expiring") {
    entry.payAt = null;
    entry.expiresAt = new Date(now + 45_000).toISOString();
  }
  overrideMockPayment(entry);
});
