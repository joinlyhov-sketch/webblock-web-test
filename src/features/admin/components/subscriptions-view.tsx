import Link from "next/link";
import {
  CalendarAdd,
  CalendarRemove,
  Card as CardIcon,
  Clock,
  Crown1,
  Danger,
  DocumentText,
  DollarCircle,
  Global,
  MinusCirlce,
  Refresh2,
  Receipt2,
  SearchNormal1,
  Sms,
  TickCircle,
  Timer1,
  Wallet2,
} from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Callout } from "@/components/common/callout";
import { DetailList } from "@/components/common/card";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { FilterMenu } from "@/components/common/filter-menu";
import { Modal } from "@/components/common/modal";
import { PlanBadge, planLabel, planRing } from "@/components/common/plan-badge";
import { RowsSelect } from "@/components/common/rows-select";
import { StatusBadge, statusLabel } from "@/components/common/status-badge";
import { TableSearch } from "@/components/common/table-search";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import {
  formatDate,
  formatMonth,
  formatPrice,
  formatPriceShort,
} from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type {
  Payment,
  PlanCode,
  Subscription,
  SubscriptionStats,
  SubscriptionStatus,
} from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { DetailCard, DetailHero, HeroChip } from "./detail-hero";

/** "3 of 30", or "First deploy only" on the free trial (it has no redeploys). */
const redeploysText = (s: { redeploysLeft: number; redeployLimit: number }) =>
  s.redeployLimit === 0 ? "First deploy only" : `${s.redeploysLeft} of ${s.redeployLimit}`;
const STATUSES: SubscriptionStatus[] = [
  "ACTIVE",
  "PENDING",
  "CANCELED",
  "EXPIRED",
];
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
export function SubscriptionsView({
  subscriptions,
  stats,
  searchParams,
  detail,
}: {
  subscriptions: Page<Subscription>;
  stats: SubscriptionStats;
  searchParams: SearchParams;
  /** The subscription opened with `?subscription=<id>`, with its payments. */
  detail: { subscription: Subscription; payments: Page<Payment> } | null;
}) {
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const plan =
    typeof searchParams.plan === "string" ? searchParams.plan : undefined;
  const filtered = Boolean(searchParams.q || status || plan);
  const detailHref = (id: string) =>
    tableHref(searchParams, { subscription: id });
  return (
    <>
      <AdminPageHeader
        title="Subscriptions"
        description="Plans, trials and payments for every website."
      />
      <KpiGrid>
        <KpiCard
          label="Monthly revenue"
          value={formatPriceShort(stats.monthlyRevenue, "USD")}
          tone="success"
          icon={<DollarCircle variant="Outline" />}
        />
        <KpiCard
          label="Active plans"
          value={stats.activePlans}
          tone="brand"
          icon={<CardIcon variant="Outline" />}
        />
        <KpiCard
          label="Trials ending ≤ 3 days"
          value={stats.trialsEndingSoon}
          tone="violet"
          icon={<Timer1 variant="Outline" />}
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          tone="warning"
          icon={<Danger variant="Outline" />}
        />
      </KpiGrid>
      <DataTable
        fill
        rowClassName="relative cursor-pointer"
        label="Subscriptions"
        minWidth="min-w-[960px]"
        itemLabel="subscriptions"
        data={subscriptions}
        searchParams={searchParams}
        rowKey={(s) => s.id}
        toolbar={
          <>
            <TableSearch
              searchParams={searchParams}
              placeholder="Search by user or website"
            />
            <FilterMenu
              label="Status"
              options={[
                {
                  label: "All",
                  href: tableHref(searchParams, { status: null, page: null }),
                  active: !status,
                },
                ...STATUSES.map((s) => ({
                  label: statusLabel(s),
                  href: tableHref(searchParams, { status: s, page: null }),
                  active: status === s,
                })),
              ]}
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
              <RowsSelect value={subscriptions.size} className="h-8" />
            </div>
            <Button asChild size="sm">
              <Link href="/admin/subscriptions/plans">Manage plans</Link>
            </Button>
          </>
        }
        empty={
          filtered ? (
            <EmptyState
              icon={<SearchNormal1 variant="Outline" />}
              title="No subscriptions found"
              description="Nothing matches this filter. Try another plan or status."
              action={
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/subscriptions">Clear filters</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<CardIcon variant="Outline" />}
              title="No subscriptions yet"
              description="Trials and paid plans show here."
            />
          )
        }
        columns={[
          {
            key: "user",
            header: "User · project",
            className: "w-[28%]",
            sortField: "userName",
            cell: (s) => (
              // Stretched link: the whole row opens the popup.
              <Link
                href={detailHref(s.id)}
                scroll={false}
                className="group flex min-w-0 items-center gap-3 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
              >
                <Avatar variant="solid"
                  name={s.userName}
                  src={s.userAvatarUrl}
                  className={planRing(s.plan)}
                />
                <span className="min-w-0">
                  <span className="block max-w-[240px] truncate font-semibold text-foreground group-hover:text-primary">
                    {s.userName}
                  </span>
                  <span className="block max-w-[240px] truncate text-sm text-muted-foreground">
                    {s.websiteName}
                  </span>
                </span>
              </Link>
            ),
          },
          {
            key: "plan",
            header: "Plan",
            cell: (s) => <PlanBadge plan={s.plan} />,
          },
          {
            key: "status",
            header: "Status",
            cell: (s) => <StatusBadge status={s.status} />,
          },
          {
            key: "start",
            header: "Start",
            sortField: "startAt",
            cell: (s) => (
              <span className="text-muted-foreground">
                {formatDate(s.startAt)}
              </span>
            ),
          },
          {
            key: "end",
            header: "End",
            sortField: "endAt",
            cell: (s) => (
              <span className="text-muted-foreground">
                {formatDate(s.endAt)}
              </span>
            ),
          },
          {
            key: "redeploys",
            header: "Redeploys left",
            sortField: "redeploysLeft",
            cell: (s) => (
              <span
                className={cn(
                  "tabular-nums",
                  s.redeployLimit > 0 && s.redeploysLeft === 0 && "font-semibold text-danger",
                )}
              >
                {redeploysText(s)}
              </span>
            ),
          },
        ]}
      />
      {detail && (
        <SubscriptionDetail
          subscription={detail.subscription}
          payments={detail.payments}
          closeHref={tableHref(searchParams, { subscription: null })}
        />
      )}
    </>
  );
}
function statusCallout(s: Subscription) {
  const plan = `${planLabel(s.plan)} plan`;
  switch (s.status) {
    case "ACTIVE":
      return (
        <Callout
          tone="success"
          icon={<TickCircle variant="Outline" />}
          title="Subscription active"
          description={`${plan} · renews ${formatDate(s.endAt)}`}
        />
      );
    case "PENDING":
      return (
        <Callout
          icon={<Clock variant="Outline" />}
          title="Waiting for payment"
          description={`${plan} · due ${formatDate(s.endAt)}`}
        />
      );
    case "CANCELED":
      return (
        <Callout
          tone="neutral"
          icon={<MinusCirlce variant="Outline" />}
          title="Subscription canceled"
          description={`${plan} · no further payments`}
        />
      );
    case "EXPIRED":
      return (
        <Callout
          tone="danger"
          icon={<Timer1 variant="Outline" />}
          title="Subscription expired"
          description={`Ended ${formatDate(s.endAt)} · the website is offline`}
        />
      );
  }
}
export function SubscriptionDetail({
  subscription: s,
  payments,
  closeHref,
}: {
  subscription: Subscription;
  payments: Page<Payment>;
  closeHref: string;
}) {
  return (
    <Modal
      title={`${s.userName} · ${s.websiteName}`}
      hideTitle
      size="xl"
      // Same fixed size as the website popup; the body scrolls inside it.
      className="h-[700px]"
      closeHref={closeHref}
    >
      <DetailHero
        media={
          <Avatar variant="solid"
            name={s.userName}
            src={s.userAvatarUrl}
            size="lg"
            className={cn(planRing(s.plan), "ring-[3px] ring-offset-[3px]")}
          />
        }
        badge={<StatusBadge status={s.status} />}
        title={s.userName}
        link={{ href: `/sites/${s.websiteId}`, label: s.websiteDomain }}
        chips={
          <>
            <HeroChip icon={<Sms variant="Outline" />}>{s.userEmail}</HeroChip>
            <HeroChip icon={<Crown1 variant="Outline" />}>{planLabel(s.plan)} plan</HeroChip>
          </>
        }
      />
      <div className="space-y-5 px-6 py-5">
        {statusCallout(s)}
        <DetailCard title="Subscription details" icon={<DocumentText variant="Outline" />}>
          <DetailList
            className="rounded-none border-0 [&>div]:px-1"
            items={[
              { icon: <Crown1 variant="Outline" />, label: "Plan", value: <PlanBadge plan={s.plan} /> },
              { icon: <Global variant="Outline" />, label: "Project", value: s.websiteName },
              { icon: <TickCircle variant="Outline" />, label: "Status", value: <StatusBadge status={s.status} /> },
              { icon: <CalendarAdd variant="Outline" />, label: "Start date", value: formatDate(s.startAt) },
              { icon: <CalendarRemove variant="Outline" />, label: "End date", value: formatDate(s.endAt) },
              {
                icon: <Refresh2 variant="Outline" />,
                label: "Redeploys left",
                value: redeploysText(s),
              },
            ]}
          />
        </DetailCard>
        <DetailCard title="Payment history" icon={<Wallet2 variant="Outline" />} aside={`${payments.items.length} payments`}>
          {payments.items.length ? (
            <ul className="divide-y divide-border text-sm">
              {payments.items.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-1 py-3"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full [&_svg]:size-3.5",
                      p.status === "FAILED" ? "bg-danger-soft text-danger" : "bg-success-soft text-success",
                    )}
                  >
                    {p.status === "FAILED" ? <Danger variant="Outline" /> : <Receipt2 variant="Outline" />}
                  </span>
                  <span className="font-semibold text-brand">
                    {planLabel(p.plan)} plan · {formatMonth(p.periodStart)}
                    {p.status === "FAILED" && " · failed"}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </span>
                  <span
                    className={cn(
                      "ml-auto font-semibold tabular-nums",
                      p.status === "FAILED" ? "text-danger" : "text-foreground",
                    )}
                  >
                    {formatPrice(p.amount, "USD")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No payments yet — free trials aren&apos;t billed.
            </p>
          )}
        </DetailCard>
      </div>
    </Modal>
  );
}
