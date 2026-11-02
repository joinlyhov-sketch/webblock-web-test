import {
  getSubscription,
  getUser,
  getWebsite,
  listDeploys,
  listPayments,
  listSubscriptions,
  getUserStats,
  listUsers,
  listWebsites,
  UsersView,
  type PlanCode,
} from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Accounts" };

const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
const param = (v: SearchParams[string]) =>
  typeof v === "string" && v ? v : undefined;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const userId = param(query.user);
  const websiteId = userId ? param(query.website) : undefined;
  const subscriptionId = userId ? param(query.subscription) : undefined;

  const [users, stats, detail, websiteDetail, subscriptionDetail] = await Promise.all([
    listUsers(
      { q: param(query.q), plan: PLANS.find((p) => p === query.plan) },
      parseTableQuery(query, {
        sort: { field: "joinedAt", direction: "desc" },
      }),
    ),
    getUserStats(),
    userId
      ? Promise.all([
          getUser(userId),
          listWebsites({ ownerId: userId }, { page: 0, size: 20 }),
          listSubscriptions({ q: undefined }, { page: 0, size: 100 }),
        ])
          .then(([user, websites, subs]) => ({
            user,
            websites,
            // This account's subscriptions (one per project), for the "View subscription" button.
            subscriptions: subs.items.filter((x) => x.userId === userId),
          }))
          .catch(nullIfNotFound)
      : null,
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ])
          .then(([website, deploys]) => ({ website, deploys }))
          .catch(nullIfNotFound)
      : null,
    subscriptionId
      ? Promise.all([
          getSubscription(subscriptionId),
          listPayments(subscriptionId, { page: 0, size: 6 }),
        ]).then(([subscription, payments]) => ({ subscription, payments }))
      : null,
  ]);

  return (
    <UsersView
      users={users}
      stats={stats}
      searchParams={query}
      detail={detail}
      websiteDetail={websiteDetail}
      subscriptionDetail={subscriptionDetail}
    />
  );
}
