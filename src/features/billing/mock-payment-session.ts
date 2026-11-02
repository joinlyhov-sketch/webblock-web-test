// Demo persistence only. Replace this with Spring/database storage for real payments.
// Like wb_role, this cookie is mock session data, never proof of a bank payment.
import { cookies } from "next/headers";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import type { PaymentStatus } from "./types";

const COOKIE_NAME = "wb_mock_payments";
const MAX_PAYMENTS = 3;
const MAX_COOKIE_BYTES = 3800;
const SESSION_SECONDS = 30 * 24 * 60 * 60;

const snapshotSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  body: z.object({
    plan: z.enum(["PLUS", "PRO", "ULTRA"]),
    kind: z.enum(["SUBSCRIBE", "CHANGE", "RENEW"]),
    websiteId: z.uuid().nullable(),
    websiteName: z.string().max(200),
    websiteDomain: z.string().max(253),
    websiteImageUrl: z.string().max(1024),
  }),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  nextPaymentAt: z.iso.datetime(),
  payAt: z.number().int().nonnegative().max(8_640_000_000_000_000).nullable(),
});
const sessionSchema = z.array(snapshotSchema).max(MAX_PAYMENTS);

export type MockPaymentSnapshot = z.infer<typeof snapshotSchema>;

// Keeps development-only simulation overrides while the instance is alive.
const globalForSession = globalThis as typeof globalThis & {
  __wbMockPaymentSession?: Map<string, MockPaymentSnapshot>;
};
const overrides = (globalForSession.__wbMockPaymentSession ??= new Map());

export async function readMockPayments(userId: string): Promise<MockPaymentSnapshot[]> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value || value.length > MAX_COOKIE_BYTES) return [];
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    if (!parsed.success) return [];
    return parsed.data
      .filter((entry) => entry.userId === userId)
      .map((entry) => overrides.get(`${userId}:${entry.id}`) ?? entry)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

/** Called only while creating an order in a Server Action, where cookie writes are allowed. */
export async function saveMockPayment(snapshot: MockPaymentSnapshot): Promise<void> {
  const parsed = snapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new ApiError({ title: "Invalid demo payment", status: 400, detail: "Could not save this demo payment." });
  }
  const entries = [...(await readMockPayments(snapshot.userId)), parsed.data].slice(-MAX_PAYMENTS);
  let value = Buffer.from(JSON.stringify(entries)).toString("base64url");
  while (value.length > MAX_COOKIE_BYTES && entries.length > 1) {
    entries.shift();
    value = Buffer.from(JSON.stringify(entries)).toString("base64url");
  }
  if (value.length > MAX_COOKIE_BYTES) {
    throw new ApiError({ title: "Demo payment too large", status: 400, detail: "This demo payment is too large to save." });
  }
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function mockPaymentStatus(snapshot: MockPaymentSnapshot): PaymentStatus {
  const now = Date.now();
  const expiresAt = new Date(snapshot.expiresAt).getTime();
  if (snapshot.payAt !== null && now >= snapshot.payAt && snapshot.payAt < expiresAt) return "PAID";
  return now >= expiresAt ? "EXPIRED" : "PENDING";
}

export function overrideMockPayment(snapshot: MockPaymentSnapshot): void {
  overrides.set(`${snapshot.userId}:${snapshot.id}`, snapshot);
}
