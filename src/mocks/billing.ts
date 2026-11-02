import type { BillingPlan, PaidPlanCode } from "@/features/billing/types";

/** Plan catalogue shown on the plans screens (same shape as the future `GET /plans`). */
export const billingPlans: BillingPlan[] = [
  {
    code: "FREE_TRIAL",
    name: "Free trial",
    monthlyPrice: "0.00",
    popular: false,
    features: [
      { icon: "clock", text: "Free for 14 days" },
      { icon: "box", text: "Up to 30 products" },
      { icon: "pulse", text: "Basic status monitoring" },
      { icon: "check", text: "No payment needed" },
    ],
  },
  {
    code: "PLUS",
    name: "Plus",
    monthlyPrice: "9.99",
    popular: false,
    features: [
      { icon: "globe", text: "1 website" },
      { icon: "rocket", text: "3 redeploys a month" },
      { icon: "box", text: "Up to 30 products" },
      { icon: "pulse", text: "Basic status monitoring" },
    ],
  },
  {
    code: "PRO",
    name: "Pro",
    monthlyPrice: "19.99",
    popular: true,
    features: [
      { icon: "check", text: "Everything in Plus" },
      { icon: "globe", text: "Up to 3 websites" },
      { icon: "rocket", text: "30 redeploys a month" },
      { icon: "box", text: "Up to 200 products" },
      { icon: "file", text: "Logs" },
    ],
  },
  {
    code: "ULTRA",
    name: "Ultra",
    monthlyPrice: "39.99",
    popular: false,
    features: [
      { icon: "check", text: "Everything in Pro" },
      { icon: "globe", text: "Up to 10 websites" },
      { icon: "rocket", text: "100 redeploys a month" },
      { icon: "box", text: "Up to 1,000 products" },
    ],
  },
];

/** How long a KHQR code stays valid. */
export const QR_LIFETIME_MS = 10 * 60_000;

/** MOCK ONLY: the real backend confirms the payment when the bank does. */
export const MOCK_AUTO_PAY_MS = 8_000;

export const MOCK_QR_IMAGE_URL = "/images/billing/khqr-code.jpg";

/** Stable routes for the Vercel UI demo; these are sample payments, not saved transactions. */
export const MOCK_PAYMENT_PREVIEW_IDS: Record<PaidPlanCode, string> = {
  PLUS: "e8b8a820-6d68-4d15-bac5-66e8792cb109",
  PRO: "f4ef81be-add0-467b-b87c-f76c68e0e0b6",
  ULTRA: "c9bf1b23-9ab6-4fc2-8b70-59183ee96b45",
};
