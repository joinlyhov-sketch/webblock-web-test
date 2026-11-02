// Vercel mock only: carry the order between isolated function instances.
// Replace this with backend storage when the payment API is connected.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/errors";
import type { PaymentOrder } from "./types";

export type StoredOrder = { userId: string; order: PaymentOrder; payAt: number | null };

const COOKIE_PREFIX = "wb_mock_payment_";
const MAX_AGE = 24 * 60 * 60;

function paymentSecret(): string | null {
  const secret = process.env.MOCK_PAYMENT_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function signature(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

function decode(value: string, secret: string): StoredOrder | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, mac] = parts;
  const expected = signature(payload, secret);
  const actual = Buffer.from(mac, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const entry = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StoredOrder;
    const createdAt = Date.parse(entry.order.createdAt);
    if (!Number.isFinite(createdAt) || Date.now() - createdAt >= MAX_AGE * 1000) return null;
    return entry;
  } catch {
    return null;
  }
}

export async function readMockPayments(userId: string): Promise<StoredOrder[]> {
  // Browsing plans/settings must keep working even when mock payment storage is unconfigured.
  // Without a valid key, no saved payment can be trusted or restored.
  const secret = paymentSecret();
  if (!secret) return [];
  const jar = await cookies();
  return jar.getAll().flatMap(({ name, value }) => {
    if (!name.startsWith(COOKIE_PREFIX)) return [];
    const entry = decode(value, secret);
    return entry && entry.userId === userId && name === `${COOKIE_PREFIX}${entry.order.id}` ? [entry] : [];
  });
}

/** Called only while creating an order in a Server Action, never during page rendering. */
export async function writeMockPayment(entry: StoredOrder): Promise<void> {
  const secret = paymentSecret();
  if (!secret) {
    console.error("Mock payment storage requires MOCK_PAYMENT_SECRET with at least 32 characters.");
    throw new ApiError({
      title: "Payment storage unavailable",
      status: 503,
      detail: "Payments are temporarily unavailable. Please try again later.",
    });
  }
  const payload = Buffer.from(JSON.stringify(entry)).toString("base64url");
  const value = `${payload}.${signature(payload, secret).toString("base64url")}`;
  if (value.length > 3800) {
    throw new ApiError({ title: "Payment details too large", status: 400 });
  }
  (await cookies()).set(`${COOKIE_PREFIX}${entry.order.id}`, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
