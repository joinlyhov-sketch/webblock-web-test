import Link from "next/link";
import { Hierarchy, SearchNormal1 } from "iconsax-reactjs";
import { Thumbnail } from "@/components/common/avatar";
import { CardHeader } from "@/components/common/card";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin";
import type { Page } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { LogLine, PipelineRun, PipelineStage } from "../types";
import { PublishFlowSheet } from "./publish-flow-sheet";
import { PublishProgress } from "./publish-progress";
import { RowPending } from "./row-pending";
import { RowsMenu } from "./rows-menu";
import { STAGE_LABEL } from "./stage";

const STAGES: PipelineStage[] = ["REQUEST", "GENERATION", "RELEASE", "LIVE"];

export function PipelineView({
  runs,
  searchParams,
  detail,
}: {
  runs: Page<PipelineRun>;
  searchParams: SearchParams;
  /** The website opened with `?run=<websiteId>`, with its live logs once live. */
  detail: { run: PipelineRun; logs: Page<LogLine> | null } | null;
}) {
  const stage =
    typeof searchParams.stage === "string" ? searchParams.stage : undefined;
  const runHref = (websiteId: string) =>
    tableHref(searchParams, { run: websiteId, log: null });

  return (
    <>
      <AdminPageHeader
        title="Pipeline & Generation"
        description="Every website's latest deploy: generation request and release side by side. Click a row to open its deploy flow."
      />

      <DataTable
        fill
        label="Latest deploys"
        itemLabel="websites"
        data={runs}
        searchParams={searchParams}
        rowKey={(r) => r.id}
        minWidth="min-w-[1080px]"
        rowClassName="relative cursor-pointer"
        toolbar={
          <div className="w-full space-y-3">
            <CardHeader title="Latest deploys" icon={<Hierarchy />} />
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedTabs
                size="sm"
                className="mb-0"
                tabs={[
                  {
                    label: "All",
                    href: tableHref(searchParams, { stage: null, page: null }),
                    active: !stage,
                  },
                  ...STAGES.map((s) => ({
                    label: STAGE_LABEL[s],
                    href: tableHref(searchParams, { stage: s, page: null }),
                    active: stage === s,
                  })),
                ]}
              />
              <div className="ml-auto">
                <RowsMenu searchParams={searchParams} />
              </div>
            </div>
          </div>
        }
        empty={
          <EmptyState
            icon={<SearchNormal1 />}
            title={
              stage
                ? `No websites in ${STAGE_LABEL[stage as PipelineStage] ?? "this stage"} right now`
                : "No deploys yet"
            }
            description={
              stage ? "Nothing matches this filter. Try another stage." : undefined
            }
            action={
              stage ? (
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/monitoring/pipeline">Show all</Link>
                </Button>
              ) : undefined
            }
          />
        }
        columns={[
          {
            key: "website",
            header: "Website",
            className: "w-[22%]",
            sortField: "websiteName",
            cell: (r) => (
              // Stretched link: the whole row opens the publish flow.
              <Link
                href={runHref(r.websiteId)}
                scroll={false}
                className="group flex min-w-0 items-center gap-3 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
              >
                <Thumbnail src={r.thumbnailUrl} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground group-hover:text-primary">
                    {r.websiteName}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {r.domain}
                  </span>
                </span>
                <RowPending />
              </Link>
            ),
          },
          {
            key: "owner",
            header: "Owner",
            sortField: "ownerName",
            cell: (r) => r.ownerName,
          },
          {
            key: "request",
            header: "Generation request",
            sortField: "requestStatus",
            cell: (r) => (
              <StatusBadge
                status={r.requestStatus}
                detail={
                  r.requestStatus === "STUCK" && r.requestStuckMinutes
                    ? `${r.requestStuckMinutes} min`
                    : undefined
                }
              />
            ),
          },
          {
            key: "release",
            header: "Release",
            sortField: "releaseState",
            cell: (r) => <StatusBadge status={r.releaseState} />,
          },
          {
            key: "flow",
            header: "Deploy flow",
            sortField: "currentStep",
            cell: (r) => <PublishProgress run={r} />,
          },
          {
            key: "updated",
            header: "Last update",
            sortField: "updatedAt",
            cell: (r) => (
              <span className="text-muted-foreground">
                {formatDateTime(r.updatedAt)}
              </span>
            ),
          },
        ]}
      />

      {detail && (
        <PublishFlowSheet
          run={detail.run}
          logs={detail.logs}
          searchParams={searchParams}
        />
      )}
    </>
  );
}
