import type { Currency } from "@/lib/format";

/**
 * A message from the public contact form, as returned by `POST /contact` (public, no auth).
 * Proposed contract: the backend stores it and emails support; the frontend only sends it.
 */
export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type PlanCode = "FREE_TRIAL" | "PLUS" | "PRO" | "ULTRA";

/**
 * Subscription plan as returned by `GET /plans` (public, no auth). Proposed contract: the backend
 * enforces these limits, so they are structured fields, not display strings.
 */
export type Plan = {
  id: string;
  code: PlanCode;
  name: string;
  /** Monthly price as a decimal string, "0" for the trial. */
  priceMonthly: string;
  currency: Currency;
  /** Trial length; null for paid plans. */
  trialDays: number | null;
  websiteLimit: number;
  redeploysPerMonth: number;
  productLimit: number;
  logsEnabled: boolean;
  popular: boolean;
};
