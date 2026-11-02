import type { PlanCode } from "@/features/account/types";

export type PaidPlanCode = Exclude<PlanCode, "FREE_TRIAL">;

/** Which icon a plan feature row shows. */
export type PlanFeatureIcon = "check" | "clock" | "globe" | "rocket" | "box" | "pulse" | "file";

export type PlanFeature = {
  icon: PlanFeatureIcon;
  text: string;
};

export type BillingPlan = {
  code: PlanCode;
  name: string;
  /** Monthly price as a decimal string. */
  monthlyPrice: string;
  popular: boolean;
  features: PlanFeature[];
};

/** Set by the backend only: the page never changes it. */
export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED";

/** SUBSCRIBE = first paid plan after the trial, CHANGE = switch between paid plans, RENEW = buy more time on the current plan. */
export type PaymentKind = "SUBSCRIBE" | "CHANGE" | "RENEW";

export type PaymentOrder = {
  id: string;
  /** Receipt number shown after payment, e.g. "WB-7K3Q-0142". */
  reference: string;
  plan: PaidPlanCode;
  planName: string;
  kind: PaymentKind;
  /** Website the owner was deploying when they chose the plan, or `null` when they came from Settings. */
  websiteId: string | null;
  websiteName: string;
  websiteDomain: string;
  websiteImageUrl: string;
  amount: string;
  currency: "USD";
  status: PaymentStatus;
  /** KHQR image returned by the API. The page only displays it. */
  qrImageUrl: string;
  createdAt: string;
  /** When the code stops being valid (ISO-8601 UTC). */
  expiresAt: string;
  paidAt: string | null;
  /** First day of the next billing period. */
  nextPaymentAt: string;
};

export type CreatePaymentBody = {
  plan: PaidPlanCode;
  kind: PaymentKind;
  websiteId: string | null;
  websiteName: string;
  websiteDomain: string;
  websiteImageUrl: string;
};
