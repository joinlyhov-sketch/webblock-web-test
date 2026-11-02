// Server-owned demo records, shared across browsers and server instances.
import { mockApi, mockCollection } from "@/lib/mock-state";
import type { CreatePaymentBody, PaymentStatus } from "./types";

export type MockPaymentSnapshot = {
  id: string;
  userId: string;
  body: CreatePaymentBody;
  createdAt: string;
  expiresAt: string;
  nextPaymentAt: string;
  payAt: number | null;
};

const payments = mockCollection<MockPaymentSnapshot[]>("payments", []);

export const readMockPayments = mockApi(async function readMockPayments(userId: string): Promise<MockPaymentSnapshot[]> {
  return payments.filter((entry) => entry.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
});

export const saveMockPayment = mockApi(async function saveMockPayment(snapshot: MockPaymentSnapshot): Promise<void> {
  payments.push(snapshot);
});

export function mockPaymentStatus(snapshot: MockPaymentSnapshot): PaymentStatus {
  const now = Date.now();
  const expiresAt = new Date(snapshot.expiresAt).getTime();
  if (snapshot.payAt !== null && now >= snapshot.payAt && snapshot.payAt < expiresAt) return "PAID";
  return now >= expiresAt ? "EXPIRED" : "PENDING";
}

export function overrideMockPayment(snapshot: MockPaymentSnapshot): void {
  const index = payments.findIndex((entry) => entry.userId === snapshot.userId && entry.id === snapshot.id);
  if (index >= 0) payments[index] = snapshot;
}
