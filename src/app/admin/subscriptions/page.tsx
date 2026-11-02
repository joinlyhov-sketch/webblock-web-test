import {
  getSubscription,
  getSubscriptionStats,
  listPayments,
  listSubscriptions,
  SubscriptionsView,
  type PlanCode,
  type SubscriptionStatus,
} from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "Subscriptions" };

const STATUSES: SubscriptionStatus[] = ["ACTIVE", "PENDING", "CANCELED", "EXPIRED"];
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
const param = (v: SearchParams[string]) => (typeof v === "string" && v ? v : undefined);

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const subscriptionId = param(query.subscription);

  const [subscriptions, stats, detail] = await Promise.all([
    listSubscriptions(
      {
        q: param(query.q),
        status: STATUSES.find((s) => s === query.status),
        plan: PLANS.find((p) => p === query.plan),
      },
      parseTableQuery(query, { sort: { field: "startAt", direction: "desc" } }),
    ),
    getSubscriptionStats(),
    subscriptionId
      ? Promise.all([getSubscription(subscriptionId), listPayments(subscriptionId, { page: 0, size: 6 })]).then(
          ([subscription, payments]) => ({ subscription, payments }),
        ).catch(nullIfNotFound)
      : null,
  ]);

  return <SubscriptionsView subscriptions={subscriptions} stats={stats} searchParams={query} detail={detail} />;
}
