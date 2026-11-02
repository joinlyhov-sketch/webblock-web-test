import Link from "next/link";
import {
  Danger,
  DollarCircle,
  Global,
  Notification,
  Profile2User,
  Send2,
} from "iconsax-reactjs";
import { Thumbnail } from "@/components/common/avatar";
import { Card, CardHeader } from "@/components/common/card";
import { AreaTrendChart, DonutBreakdown } from "@/components/common/charts";
import { CompactTable } from "@/components/common/compact-table";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { StatusBadge } from "@/components/common/status-badge";
import type { Page } from "@/lib/api/types";
import {
  formatMonth,
  formatPriceShort,
  formatRelative,
} from "@/lib/format";
import type {
  AdminOverview,
  AttentionKind,
  Deploy,
} from "../types";
import { AdminPageHeader } from "./admin-page-header";

// Figma "Needs attention": soft red, pink, yellow, blue — used for the donut and its legend.
const ATTENTION = {
  FAILED_DEPLOYS: {
    title: "Failed deploys",
    color: "chart-red",
    href: "/admin/websites?release=FAILED",
  },
  PLAN_EXPIRED: {
    title: "Plan expired · site offline",
    color: "chart-pink",
    href: "/admin/subscriptions?status=EXPIRED",
  },
  PAYMENTS_PAST_DUE: {
    title: "Payments past due",
    color: "chart-yellow",
    href: "/admin/subscriptions?status=PENDING",
  },
  TRIALS_ENDING: {
    title: "Trials end in 3 days",
    color: "chart-blue",
    // Soonest end first, so the trials ending in 3 days are at the top.
    href: "/admin/subscriptions?plan=FREE_TRIAL&sort=endAt,asc",
  },
} satisfies Record<
  AttentionKind,
  { title: string; color: string; href: string }
>;

export function OverviewView({
  overview,
  deploys,
}: {
  overview: AdminOverview;
  deploys: Page<Deploy>;
}) {

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="How WebBlock is doing this month."
      />

      <KpiGrid>
        <KpiCard
          label="New accounts"
          value={overview.newAccounts}
          tone="brand"
          icon={<Profile2User />}
        />
        <KpiCard
          label="Websites deployed"
          value={overview.websitesPublished}
          tone="teal"
          icon={<Global />}
        />
        <KpiCard
          label="Monthly revenue"
          value={formatPriceShort(overview.monthlyRevenue, "USD")}
          tone="success"
          icon={<DollarCircle />}
        />
        <KpiCard
          label="Failed deploys"
          value={overview.failedDeploys}
          tone="danger"
          icon={<Danger />}
        />
      </KpiGrid>

      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="p-[22px]">
          <CardHeader title="Revenue" aside="Last 12 months" />
          <AreaTrendChart
            highlightLast
            label="Monthly revenue for the last 12 months"
            data={overview.revenueByMonth.map((r) => ({
              label: formatMonth(r.month),
              value: Number(r.amount),
            }))}
            formatted={overview.revenueByMonth.map((r) =>
              formatPriceShort(r.amount, "USD"),
            )}
          />
        </Card>

        <Card className="flex flex-col gap-3 px-[22px] py-4">
          <CardHeader
            title="Needs attention"
            icon={<Notification />}
          />
          <DonutBreakdown
            segments={overview.attention.map((a) => ({
              label: ATTENTION[a.kind].title,
              value: a.count,
              color: ATTENTION[a.kind].color,
              href: ATTENTION[a.kind].href,
            }))}
          />
        </Card>
      </div>

      <RecentDeploys deploys={deploys} />
    </>
  );
}

/** Figma "Recent deploys": card with an inset table, rounded grey header row, uppercase column names. */
function RecentDeploys({ deploys }: { deploys: Page<Deploy> }) {
  return (
    <Card className="px-6 pt-5 pb-2">
      <CardHeader
        title="Recent deploys"
        className="mb-3.5"
        aside={
          <Link
            href="/admin/websites?sort=lastDeployAt,desc"
            className="font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        }
      />
      <CompactTable
        label="Recent deploys"
        rows={deploys.items}
        rowKey={(d) => d.id}
        empty={
          <EmptyState
            icon={<Send2 />}
            title="No deploys yet"
            description="Deploys show here as soon as an owner deploys a website."
          />
        }
        columns={[
          { key: "no", header: "No.", cell: (_, i) => i + 1, className: "w-[72px]" },
          {
            key: "website",
            header: "Website",
            cell: (d) => (
              <Link
                href={`/admin/websites?website=${d.websiteId}`}
                className="inline-flex items-center gap-2.5 font-semibold text-foreground hover:text-primary"
              >
                <Thumbnail src={d.websiteThumbnailUrl} size="sm" />
                {d.websiteName}
              </Link>
            ),
          },
          { key: "owner", header: "Owner", cell: (d) => d.ownerName },
          { key: "release", header: "Release", cell: (d) => <StatusBadge status={d.status} /> },
          {
            key: "when",
            header: "When",
            cell: (d) => formatRelative(d.startedAt),
            className: "text-muted-foreground",
          },
        ]}
      />
    </Card>
  );
}
