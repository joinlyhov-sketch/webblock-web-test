import Link from "next/link";
import {
  Calendar1,
  Card as CardIcon,
  Crown1,
  DocumentText,
  ExportSquare,
  Global,
  Profile,
  Profile2User,
  SearchNormal1,
  Sms,
  Timer1,
} from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { WebsiteLogo } from "./website-logo";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { FilterMenu } from "@/components/common/filter-menu";
import { Modal } from "@/components/common/modal";
import {
  PlanBadge,
  planLabel,
  planRing,
  planTone,
} from "@/components/common/plan-badge";
import { RowsSelect } from "@/components/common/rows-select";
import { Pill, StatusBadge } from "@/components/common/status-badge";
import { TableSearch } from "@/components/common/table-search";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type {
  AdminWebsite,
  Deploy,
  Payment,
  PlanCode,
  Subscription,
  UserAccount,
  UserStats,
} from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { DetailCard, HeroDecor, InfoTile } from "./detail-hero";
import { UserRowMenu } from "./user-row-menu";
import { SubscriptionDetail } from "./subscriptions-view";
import { WebsiteDetail } from "./websites-view";
const count = new Intl.NumberFormat("en-US");
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
export function UsersView({
  users,
  stats,
  searchParams,
  detail,
  websiteDetail,
  subscriptionDetail,
}: {
  users: Page<UserAccount>;
  stats: UserStats;
  searchParams: SearchParams;
  /** The account opened with `?user=<id>`, with its websites. */
  detail: {
    user: UserAccount;
    websites: Page<AdminWebsite>;
    subscriptions: Subscription[];
  } | null;
  /** A website of that account opened with `?website=<id>`: its popup replaces the account popup. */
  websiteDetail: { website: AdminWebsite; deploys: Page<Deploy> } | null;
  /** The subscription opened with `?subscription=<id>`: its popup also replaces the account popup. */
  subscriptionDetail: {
    subscription: Subscription;
    payments: Page<Payment>;
  } | null;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const plan =
    typeof searchParams.plan === "string" ? searchParams.plan : undefined;
  // Export CSV keeps the current search and plan filter.
  const exportQuery = new URLSearchParams({
    ...(q && { q }),
    ...(plan && { plan }),
  }).toString();
  const detailHref = (id: string) => tableHref(searchParams, { user: id });
  return (
    <>
      <AdminPageHeader
        title="User Accounts"
        description="Search accounts and see each owner's websites."
      />
      <KpiGrid>
        <KpiCard
          label="Total accounts"
          value={count.format(stats.totalAccounts)}
          tone="brand"
          icon={<Profile2User variant="Outline" />}
        />
        <KpiCard
          label="On free trial"
          value={count.format(stats.onFreeTrial)}
          tone="violet"
          icon={<Timer1 variant="Outline" />}
        />
        <KpiCard
          label="Paying"
          value={count.format(stats.paying)}
          tone="success"
          icon={<CardIcon variant="Outline" />}
        />
        <KpiCard
          label="Live websites"
          value={count.format(stats.liveWebsites)}
          tone="teal"
          icon={<Global variant="Outline" />}
        />
      </KpiGrid>
      <DataTable
        fill
        rowClassName="relative cursor-pointer"
        label="User accounts"
        minWidth="min-w-[960px]"
        itemLabel="accounts"
        data={users}
        searchParams={searchParams}
        rowKey={(u) => u.id}
        toolbar={
          <>
            <TableSearch
              searchParams={searchParams}
              placeholder="Search by name or email"
            />
            <FilterMenu
              label="Plan"
              options={[
                {
                  label: "All",
                  href: tableHref(searchParams, { plan: null, page: null }),
                  active: !plan,
                },
                ...PLANS.map((p) => ({
                  label: planLabel(p),
                  href: tableHref(searchParams, { plan: p, page: null }),
                  active: plan === p,
                })),
              ]}
            />
            <div className="ml-auto">
              <RowsSelect value={users.size} className="h-8" />
            </div>
            <Button asChild size="sm">
              <a
                href={`/admin/users/export${exportQuery ? `?${exportQuery}` : ""}`}
                download
              >
                <ExportSquare variant="Outline" />
                Export CSV
              </a>
            </Button>
          </>
        }
        empty={
          q || plan ? (
            <EmptyState
              icon={<SearchNormal1 variant="Outline" />}
              title={
                q
                  ? `No accounts match “${q}”`
                  : "No accounts found"
              }
              description={
                q
                  ? "Check the spelling or search by email instead."
                  : "Nothing matches this filter. Try another plan."
              }
              action={
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/users">
                    {plan ? "Clear filters" : "Clear search"}
                  </Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Profile2User variant="Outline" />}
              title="No accounts yet"
              description="People who sign up show here."
            />
          )
        }
        columns={[
          {
            key: "account",
            header: "Account",
            className: "w-[28%]",
            sortField: "fullName",
            cell: (u) => (
              // Stretched link: the whole row opens the popup.
              <Link
                href={detailHref(u.id)}
                scroll={false}
                className="group flex min-w-0 items-center gap-3 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
              >
                <Avatar variant="solid"
                  name={u.fullName}
                  src={u.avatarUrl}
                  className={planRing(u.plan)}
                />
                <span className="min-w-0">
                  <span className="block max-w-[260px] truncate font-semibold text-foreground group-hover:text-primary">
                    {u.fullName}
                  </span>
                  <span className="block max-w-[260px] truncate text-sm text-muted-foreground">
                    {u.email}
                  </span>
                </span>
              </Link>
            ),
          },
          {
            key: "websites",
            header: "Websites",
            sortField: "websiteCount",
            cell: (u) => u.websiteCount,
          },
          {
            key: "plan",
            header: "Plan",
            cell: (u) => <PlanBadge plan={u.plan} />,
          },
          {
            key: "joined",
            header: "Joined",
            sortField: "joinedAt",
            cell: (u) => (
              <span className="text-muted-foreground">
                {formatDate(u.joinedAt)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (u) => <StatusBadge status={u.status} />,
          },
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "w-16 text-right",
            cell: (u) => (
              // Above the stretched row link so the menu still opens on its own.
              <div className="relative z-10 inline-flex">
                <UserRowMenu user={u} detailHref={detailHref(u.id)} />
              </div>
            ),
          },
        ]}
      />
      {subscriptionDetail ? (
        <SubscriptionDetail
          subscription={subscriptionDetail.subscription}
          payments={subscriptionDetail.payments}
          closeHref={tableHref(searchParams, { subscription: null })}
        />
      ) : websiteDetail ? (
        // Closing it goes back to the account popup.
        <WebsiteDetail
          website={websiteDetail.website}
          deploys={websiteDetail.deploys}
          closeHref={tableHref(searchParams, { website: null })}
        />
      ) : (
        detail && (
          <UserDetail
            user={detail.user}
            websites={detail.websites}
            subscriptionHref={(() => {
              // Open the active plan first; an account with none shows a disabled button.
              const sub =
                detail.subscriptions.find((x) => x.status === "ACTIVE") ??
                detail.subscriptions[0];
              return sub
                ? tableHref(searchParams, { subscription: sub.id, website: null })
                : null;
            })()}
            closeHref={tableHref(searchParams, { user: null })}
            websiteHref={(id) => tableHref(searchParams, { website: id })}
          />
        )
      )}
    </>
  );
}
function UserDetail({
  user,
  websites,
  subscriptionHref,
  closeHref,
  websiteHref,
}: {
  user: UserAccount;
  websites: Page<AdminWebsite>;
  /** Opens the account's subscription popup on this same page; null when it has none. */
  subscriptionHref: string | null;
  closeHref: string;
  websiteHref: (websiteId: string) => string;
}) {
  return (
    <Modal title={user.fullName} hideTitle size="xl" closeHref={closeHref}>
      <div className="relative isolate space-y-4 overflow-x-clip px-6 pt-7 pb-6">
        <HeroDecor layout="card" />
        <div className="flex items-center gap-[22px] pr-11 pl-2">
          <span className="relative shrink-0">
            <Avatar variant="solid"
              name={user.fullName}
              src={user.avatarUrl}
              size="lg"
              // The white border is the gap between the photo and the plan-coloured ring.
              className={cn(
                "size-[104px] text-2xl border-[4px] border-background shadow-card",
                planRing(user.plan),
                "ring-[3px] ring-offset-0",
              )}
            />
</span>
          <div className="min-w-0">
            <h2 className="truncate text-[22px] leading-[30px] font-semibold tracking-[-0.17px] text-foreground">
              {user.fullName}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <StatusBadge status={user.status} />
              <Pill tone="info" icon={<Sms variant="Outline" aria-hidden />}>
                {user.signInMethod === "GOOGLE" ? "Google sign-in" : "Email sign-in"}
              </Pill>
            </div>
          </div>
        </div>
        <DetailCard title="Account details" icon={<Profile variant="Outline" />}>
          <dl className="grid gap-3 pt-3.5 pb-4 sm:grid-cols-3">
            <InfoTile
              icon={<DocumentText variant="Outline" />}
              label="Account ID"
              value={user.accountCode}
            />
            <InfoTile
              icon={<Calendar1 variant="Outline" />}
              label="Joined"
              value={formatDate(user.joinedAt)}
            />
            <InfoTile
              icon={<Crown1 variant="Outline" />}
              label="Plan"
              value={
                user.plan === "FREE_TRIAL"
                  ? "Free trial"
                  : `${planLabel(user.plan)} · monthly`
              }
              tone={planTone(user.plan)}
            />
          </dl>
        </DetailCard>
        <DetailCard
          title="Websites & status"
          icon={<Global variant="Outline" />}
          aside={`${websites.totalItems} ${websites.totalItems === 1 ? "website" : "websites"}`}
        >
          {websites.items.length ? (
            <ul className="divide-y divide-border">
              {websites.items.map((w) => {
                return (
                  <li key={w.id}>
                    <Link
                      href={websiteHref(w.id)}
                      scroll={false}
                      className="flex h-16 items-center gap-3 rounded-lg px-1 transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
                    >
                      <WebsiteLogo
                        logoUrl={w.logoUrl}
                        templateSlug={w.templateSlug}
                        className="size-9"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">
                          {w.name}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {w.domain || "Not deployed"}
                        </span>
                      </span>
                      <StatusBadge status={w.releaseStatus ?? "DRAFT"} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No websites yet.
            </p>
          )}
        </DetailCard>
        <div className="flex gap-3 pt-1">
          {subscriptionHref ? (
            <Button asChild variant="secondary" size="sm" className="flex-1">
              <Link href={subscriptionHref} scroll={false}>
                <DocumentText variant="Outline" />
                View subscription
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="flex-1" disabled>
              <DocumentText variant="Outline" />
              No subscription
            </Button>
          )}
          {websites.totalItems > 0 ? (
            <Button asChild size="sm" className="flex-1">
              <Link href={`/admin/websites?owner=${user.id}`}>
                <ExportSquare variant="Outline" />
                View websites
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              <ExportSquare variant="Outline" />
              View websites
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
