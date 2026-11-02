import type { ReactNode } from "react";
import Link from "next/link";
import {
  Add,
  Box,
  Calendar1,
  Clock,
  Crown1,
  Danger,
  Edit2,
  Global,
  Hierarchy,
  Link21,
  Refresh2,
  Routing,
  SearchNormal1,
  Setting2,
  ShieldTick,
  TickCircle,
  Timer1,
  Wifi,
} from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { WebsiteLogo } from "./website-logo";
import { Callout } from "@/components/common/callout";
import { DetailList } from "@/components/common/card";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { FilterMenu } from "@/components/common/filter-menu";
import { Modal } from "@/components/common/modal";
import { PlanBadge, planLabel } from "@/components/common/plan-badge";
import { RowsSelect } from "@/components/common/rows-select";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSearch } from "@/components/common/table-search";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import {
  formatDate,
  formatDayMonthYear,
  formatDuration,
  formatRelative,
} from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { AdminWebsite, Deploy, PlanCode, SiteStatus } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { DetailCard, DetailHero, HeroChip } from "./detail-hero";
import { WebsiteDetailActions, WebsiteRowMenu } from "./website-actions";
const OFFLINE_REASON = {
  ONLINE: { reason: "None", hint: "site is reachable" },
  NOT_DEPLOYED: { reason: "Not deployed", hint: "no release yet" },
  OFFLINE_BILLING: { reason: "Plan expired", hint: "renew to go back online" },
  SUSPENDED: { reason: "Suspended", hint: "by an admin" },
} satisfies Record<SiteStatus, { reason: string; hint: string }>;
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
export function WebsitesView({
  websites,
  releaseCounts,
  searchParams,
  detail,
}: {
  websites: Page<AdminWebsite>;
  /** Websites per release tab, under the current search, plan and owner filters. */
  releaseCounts: { all: number; live: number; failed: number };
  searchParams: SearchParams;
  /** The website opened with `?website=<id>`, with its recent deploys. */
  detail: { website: AdminWebsite; deploys: Page<Deploy> } | null;
}) {
  const release =
    typeof searchParams.release === "string" ? searchParams.release : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const owner =
    typeof searchParams.owner === "string" ? searchParams.owner : "";
  const detailHref = (id: string) => tableHref(searchParams, { website: id });
  const plan =
    typeof searchParams.plan === "string" ? searchParams.plan : undefined;
  const filtered = Boolean(q || release || plan || owner);
  return (
    <>
      <AdminPageHeader
        title="User Websites"
        description="Search websites, check deploy results and redeploy when needed."
      />
      <DataTable
        fill
        rowClassName="relative cursor-pointer"
        label="User websites"
        minWidth="min-w-[1000px]"
        itemLabel="websites"
        data={websites}
        searchParams={searchParams}
        rowKey={(w) => w.id}
        toolbar={
          <>
            <TableSearch
              searchParams={searchParams}
              placeholder="Search by owner or domain"
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
            {owner && websites.items[0] && (
              <Link
                href={tableHref(searchParams, { owner: null, page: null })}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-[13px] font-medium text-brand-strong hover:bg-brand/20"
              >
                Owner: {websites.items[0].ownerName}
                <Add variant="Outline"
                  aria-label="Remove owner filter"
                  className="size-4 rotate-45"
                />
              </Link>
            )}
            <SegmentedTabs
              size="sm"
              className="mb-0 ml-auto"
              tabs={[
                {
                  label: "All",
                  count: releaseCounts.all,
                  href: tableHref(searchParams, { release: null, page: null }),
                  active: !release,
                },
                {
                  label: "Live",
                  count: releaseCounts.live,
                  href: tableHref(searchParams, {
                    release: "LIVE",
                    page: null,
                  }),
                  active: release === "LIVE",
                },
                {
                  label: "Failed",
                  count: releaseCounts.failed,
                  href: tableHref(searchParams, {
                    release: "FAILED",
                    page: null,
                  }),
                  active: release === "FAILED",
                },
              ]}
            />
            <RowsSelect value={websites.size} className="h-8" />
          </>
        }
        empty={
          filtered ? (
            <EmptyState
              icon={<SearchNormal1 variant="Outline" />}
              title="No websites found"
              description="Nothing matches this filter. Try another status or clear your search."
              action={
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/websites">Show all websites</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Global variant="Outline" />}
              title="No websites yet"
              description="Websites show here once owners create them."
            />
          )
        }
        columns={[
          {
            key: "website",
            header: "Website",
            className: "w-[26%]",
            sortField: "name",
            cell: (w) => (
              // Stretched link: the whole row opens the popup.
              <Link
                href={detailHref(w.id)}
                scroll={false}
                className="group flex min-w-0 items-center gap-3 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
              >
                <WebsiteLogo logoUrl={w.logoUrl} templateSlug={w.templateSlug} />
                <span className="min-w-0">
                  <span className="block max-w-[260px] truncate font-semibold text-foreground group-hover:text-primary">
                    {w.name}
                  </span>
                  <span className="block max-w-[260px] truncate text-sm text-muted-foreground">
                    {w.domain}
                  </span>
                </span>
              </Link>
            ),
          },
          {
            key: "owner",
            header: "Owner",
            sortField: "ownerName",
            cell: (w) => w.ownerName,
          },
          {
            key: "site",
            header: "Site",
            cell: (w) => <StatusBadge status={w.siteStatus} />,
          },
          {
            key: "release",
            header: "Latest release",
            cell: (w) =>
              w.releaseStatus ? (
                <StatusBadge status={w.releaseStatus} />
              ) : (
                <span className="text-placeholder">—</span>
              ),
          },
          {
            key: "lastDeploy",
            header: "Last deploy",
            sortField: "lastDeployAt",
            cell: (w) => (
              <span className="text-muted-foreground">
                {w.lastDeployAt ? formatRelative(w.lastDeployAt) : "Never"}
              </span>
            ),
          },
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "w-16 text-right",
            cell: (w) => (
              <div className="relative z-10 inline-flex">
                <WebsiteRowMenu website={w} detailHref={detailHref(w.id)} />
              </div>
            ),
          },
        ]}
      />
      {detail && (
        <WebsiteDetail
          website={detail.website}
          deploys={detail.deploys}
          closeHref={tableHref(searchParams, { website: null })}
        />
      )}
    </>
  );
}
function deployCallout(latest: Deploy | undefined) {
  if (!latest) {
    return (
      <Callout
        tone="neutral"
        icon={<Edit2 variant="Outline" />}
        title="Not deployed yet"
        description="The owner hasn't deployed this website."
      />
    );
  }
  const took =
    latest.durationSeconds === null
      ? ""
      : ` · ${formatDuration(latest.durationSeconds)}`;
  switch (latest.status) {
    case "GOING_LIVE":
      return (
        <Callout
          icon={<Clock variant="Outline" />}
          title={`Deploy #${latest.number} in progress`}
          description={`Step ${latest.currentStep} of ${latest.totalSteps} · ${latest.stepLabel}`}
        />
      );
    case "FAILED":
      return (
        <Callout
          tone="danger"
          icon={<Danger variant="Outline" />}
          title={`Deploy #${latest.number} failed`}
          description={`Stopped at step ${latest.currentStep} of ${latest.totalSteps} · ${latest.stepLabel}${took}`}
        />
      );
    case "LIVE":
    case "REPLACED":
      return (
        <Callout
          tone="success"
          icon={<TickCircle variant="Outline" />}
          title={`Deploy #${latest.number} succeeded`}
          description={`All ${latest.totalSteps} steps passed${took}`}
        />
      );
  }
}
/** Website popup. Also used on User Accounts, so an owner's website opens without leaving that page. */
export function WebsiteDetail({
  website,
  deploys,
  closeHref,
}: {
  website: AdminWebsite;
  deploys: Page<Deploy>;
  closeHref: string;
}) {
  const latest = deploys.items[0];
  const liveDeploy = deploys.items.find((d) => d.status === "LIVE");
  const offline = OFFLINE_REASON[website.siteStatus];
  return (
    <Modal
      title={website.name}
      hideTitle
      size="xl"
      // Same width as the account popup. Fixed height so it never changes size; the body scrolls inside it.
      className="h-[700px]"
      closeHref={closeHref}
      footer={<WebsiteDetailActions website={website} />}
    >
      <DetailHero
        media={
          <WebsiteLogo
            logoUrl={website.logoUrl}
            templateSlug={website.templateSlug}
            className="size-[128px] border-4 border-background text-[56px] shadow-card"
          />
        }
        badge={
          website.releaseStatus ? (
            <StatusBadge status={website.releaseStatus} />
          ) : (
            <StatusBadge status="DRAFT" />
          )
        }
        title={website.name}
        link={
          website.liveRelease
            ? { href: `/sites/${website.id}`, label: website.domain }
            : undefined
        }
        chips={
          <>
            <HeroChip
              icon={
                <Avatar variant="solid"
                  name={website.ownerName}
                  src={website.ownerAvatarUrl}
                  size="sm"
                  className="size-5 text-[8px] ring-0"
                />
              }
            >
              {website.ownerName}
            </HeroChip>
            {latest && (
              <HeroChip icon={<Calendar1 variant="Outline" />}>
                Deploy #{latest.number} · {formatDayMonthYear(latest.startedAt)}
              </HeroChip>
            )}
          </>
        }
      />
      <div className="space-y-5 px-6 py-5">
        {deployCallout(latest)}
        <DetailCard title="Recent deploys" icon={<Refresh2 variant="Outline" />} aside={`${deploys.items.length} deploys`}>
          {deploys.items.length ? (
            <ul className="divide-y divide-border text-sm">
              {deploys.items.map((d) => (
                <li
                  key={d.id}
                  className="grid grid-cols-[40px_32px_96px_1fr_auto] items-center gap-3 px-1 py-3"
                >
                  <span className="font-semibold text-brand">#{d.number}</span>
                  <WebsiteLogo
                    logoUrl={website.logoUrl}
                    templateSlug={website.templateSlug}
                    className="size-8 text-[16px]"
                  />
                  <span className="text-foreground-soft">
                    {formatDayMonthYear(d.startedAt)}
                  </span>
                  <span>
                    <StatusBadge status={d.status} />
                  </span>
                  <span className="text-right text-foreground-soft tabular-nums">
                    {d.durationSeconds === null
                      ? "—"
                      : formatDuration(d.durationSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Never deployed.
            </p>
          )}
        </DetailCard>
        <DetailCard title="Site details" icon={<Setting2 variant="Outline" />}>
          <DetailList
            className="rounded-none border-0 [&>div]:px-1 [&>div]:py-3"
            items={[
              {
                icon: <ShieldTick variant="Outline" />,
                label: "SSL certificate",
                value: website.sslValidUntil ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2 rounded-full bg-success"
                    />
                    Valid · until {formatDate(website.sslValidUntil)}
                  </span>
                ) : (
                  "Not issued yet"
                ),
              },
              {
                icon: <Crown1 variant="Outline" />,
                label: "Plan",
                // The plan keeps its colour (grey, blue, gold, violet) like everywhere else.
                value: (
                  <span className="inline-flex items-center gap-2">
                    <PlanBadge plan={website.plan} />
                    <span className="font-normal text-muted-foreground">
                      {website.plan === "FREE_TRIAL"
                        ? `ends ${formatDayMonthYear(website.planEndsAt)}`
                        : "monthly"}
                    </span>
                  </span>
                ),
              },
              {
                icon: <Box variant="Outline" />,
                label: "Products",
                value: `${website.productCount} of ${website.productLimit.toLocaleString("en-US")}`,
              },
              {
                icon: <Timer1 variant="Outline" />,
                label: "Redeploys left",
                value:
                  website.redeployLimit === 0
                    ? "First deploy only"
                    : `${website.redeploysLeft} of ${website.redeployLimit}`,
              },
            ]}
          />
        </DetailCard>
        <DetailCard title="Hosting & routing" icon={<Hierarchy variant="Outline" />}>
          <dl className="grid grid-cols-2 gap-2.5 py-3.5">
            <HostingTile
              icon={<Wifi variant="Outline" />}
              iconTone={SITE_ICON_TONE[website.siteStatus]}
              label="Hosting"
              value={<StatusBadge status={website.siteStatus} />}
              hint={
                website.siteStatus === "ONLINE"
                  ? "serving visitors"
                  : "not serving visitors"
              }
            />
            <HostingTile
              icon={<Routing variant="Outline" />}
              iconTone={website.routingStatus === "UPDATING" ? "brand" : "success"}
              label="Routing"
              value={<StatusBadge status={website.routingStatus} />}
              hint={
                website.routingStatus === "UPDATING"
                  ? "route is changing"
                  : "traffic confirmed"
              }
            />
            <HostingTile
              icon={<Link21 variant="Outline" />}
              iconTone={website.liveRelease ? "brand" : "muted"}
              label="Live release"
              value={website.liveRelease ?? "None"}
              hint={
                liveDeploy && liveDeploy === latest
                  ? "latest deploy"
                  : website.liveRelease
                    ? "earlier deploy"
                    : "not live yet"
              }
            />
            <HostingTile
              icon={<Danger variant="Outline" />}
              iconTone={
                website.siteStatus === "ONLINE"
                  ? "muted"
                  : SITE_ICON_TONE[website.siteStatus]
              }
              label="Offline reason"
              value={offline.reason}
              hint={offline.hint}
            />
          </dl>
        </DetailCard>
      </div>
    </Modal>
  );
}
// Same look as the KPI card, without its tinted glass: a white card, a short accent bar on the left edge
// and an icon tile with a thin tinted ring. Green = healthy, blue = routing, violet = release,
// amber = not started, red = problem.
const TILE_TONE = {
  success: { bar: "bg-success", icon: "text-success inset-ring-success/15" },
  brand: { bar: "bg-brand", icon: "text-brand inset-ring-brand/15" },
  violet: { bar: "bg-violet", icon: "text-violet inset-ring-violet/15" },
  warning: { bar: "bg-warning", icon: "text-warning inset-ring-warning/15" },
  danger: { bar: "bg-danger", icon: "text-danger inset-ring-danger/15" },
  muted: { bar: "bg-border", icon: "text-muted-foreground inset-ring-border" },
};

const SITE_ICON_TONE = {
  ONLINE: "success",
  NOT_DEPLOYED: "warning",
  OFFLINE_BILLING: "danger",
  SUSPENDED: "danger",
} satisfies Record<SiteStatus, keyof typeof TILE_TONE>;

/** One card of "Hosting & routing": label and icon on top, value below, hint under it. */
function HostingTile({
  icon,
  label,
  value,
  hint,
  iconTone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  iconTone: keyof typeof TILE_TONE;
}) {
  const tone = TILE_TONE[iconTone];
  return (
    <div className="relative flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-border/80 bg-background px-5 py-4 shadow-kpi">
      <span aria-hidden className={`absolute top-4 bottom-4 left-0 w-1 rounded-r-full ${tone.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <dt className="pt-1 text-sm leading-5 font-medium text-muted-foreground">{label}</dt>
        <span
          aria-hidden
          className={`grid size-9 shrink-0 place-items-center rounded-xl bg-background shadow-button inset-ring-1 [&_svg]:size-[18px] ${tone.icon}`}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <dd className="font-heading text-lg leading-7 font-bold break-words text-foreground">{value}</dd>
        {hint && <dd className="truncate text-[13px] text-muted-foreground">{hint}</dd>}
      </div>
    </div>
  );
}
