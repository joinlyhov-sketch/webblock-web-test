import type { AdminOverview } from "@/features/admin/types";
import { at } from "./time";

export const adminOverview: AdminOverview = {
  newAccounts: 64,
  websitesPublished: 41,
  monthlyRevenue: "15051.64",
  // Needs-attention counts match the admin lists they open (admin-websites.ts, admin-subscriptions.ts).
  failedDeploys: 2,
  revenueByMonth: [
    { month: "2025-11-01T00:00:00Z", amount: "8240.00" },
    { month: "2025-12-01T00:00:00Z", amount: "8910.00" },
    { month: "2026-01-01T00:00:00Z", amount: "9180.00" },
    { month: "2026-02-01T00:00:00Z", amount: "9105.00" },
    { month: "2026-03-01T00:00:00Z", amount: "10220.00" },
    { month: "2026-04-01T00:00:00Z", amount: "10640.00" },
    { month: "2026-05-01T00:00:00Z", amount: "11310.00" },
    { month: "2026-06-01T00:00:00Z", amount: "11650.00" },
    { month: "2026-07-01T00:00:00Z", amount: "12280.00" },
    { month: "2026-08-01T00:00:00Z", amount: "12890.00" },
    { month: "2026-09-01T00:00:00Z", amount: "13740.00" },
    { month: "2026-10-01T00:00:00Z", amount: "15051.64" },
  ],
  attention: [
    {
      kind: "FAILED_DEPLOYS",
      count: 2,
      latestName: "Still Point Studio",
      latestAt: at("2026-10-03T07:27:00Z"),
      latestOwnerName: "David Lim",
      amountAtRisk: null,
      retryInDays: null,
    },
    {
      kind: "PLAN_EXPIRED",
      count: 1,
      latestName: "Hollow & Co.",
      latestAt: at("2026-10-20T08:45:00Z"),
      latestOwnerName: "Sreyleak Chan",
      amountAtRisk: null,
      retryInDays: null,
    },
    {
      kind: "PAYMENTS_PAST_DUE",
      count: 1,
      latestName: "Corner Chair",
      latestAt: at("2026-10-30T03:30:00Z"),
      latestOwnerName: "Endy Ong",
      amountAtRisk: "19.99",
      retryInDays: 2,
    },
    {
      kind: "TRIALS_ENDING",
      count: 2,
      latestName: "Bloom Bakery",
      latestAt: at("2026-11-03T11:20:00Z"),
      latestOwnerName: "Vanda Ros",
      amountAtRisk: null,
      retryInDays: null,
    },
  ],
};
