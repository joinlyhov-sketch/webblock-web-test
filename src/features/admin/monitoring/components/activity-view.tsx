import Link from "next/link";
import { Activity, SearchNormal1 } from "iconsax-reactjs";
import { CardHeader } from "@/components/common/card";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { FilterMenu } from "@/components/common/filter-menu";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin";
import type { Page } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { ActivityAction, ActivityEntry } from "../types";
import { RowsMenu } from "./rows-menu";

export const ACTION_LABEL = {
  SUSPEND_HOSTING: "Suspend hosting",
  RESUME_HOSTING: "Resume hosting",
  ROLLBACK: "Rollback",
  SUSPEND_USER: "Suspend user",
  REACTIVATE_USER: "Reactivate user",
  CHANGE_PLAN: "Change plan",
} satisfies Record<ActivityAction, string>;

export function ActivityView({
  entries,
  actors,
  searchParams,
}: {
  entries: Page<ActivityEntry>;
  /** Admin emails for the "Done by" menu. */
  actors: string[];
  searchParams: SearchParams;
}) {
  const action =
    typeof searchParams.action === "string" ? searchParams.action : undefined;
  const by = typeof searchParams.by === "string" ? searchParams.by : undefined;
  const byHref = (value: string | null) =>
    tableHref(searchParams, { by: value, page: null });

  return (
    <>
      <AdminPageHeader
        title="Activity Log"
        description="Every admin and system action — who did it, what it changed, when and the result."
      />

      <DataTable
        fill
        label="Recent activity"
        itemLabel="actions"
        data={entries}
        searchParams={searchParams}
        rowKey={(a) => a.id}
        minWidth="min-w-[1000px]"
        toolbar={
          <div className="w-full space-y-3">
            <CardHeader title="Recent activity" icon={<Activity />} />
            <div className="flex flex-wrap items-center gap-3">
              <div className="max-w-full overflow-x-auto">
                <SegmentedTabs
                  size="sm"
                  className="mb-0 whitespace-nowrap"
                  tabs={[
                    {
                      label: "All",
                      href: tableHref(searchParams, {
                        action: null,
                        page: null,
                      }),
                      active: !action,
                    },
                    ...(Object.keys(ACTION_LABEL) as ActivityAction[]).map(
                      (a) => ({
                        label: ACTION_LABEL[a],
                        href: tableHref(searchParams, {
                          action: a,
                          page: null,
                        }),
                        active: action === a,
                      }),
                    ),
                  ]}
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <FilterMenu
                  label="Done by"
                  options={[
                    { label: "All", href: byHref(null), active: !by },
                    {
                      label: "All admins",
                      href: byHref("admins"),
                      active: by === "admins",
                      separatorBefore: true,
                    },
                    ...actors.map((email) => ({
                      label: email,
                      href: byHref(email),
                      active: by === email,
                    })),
                    {
                      label: "System",
                      href: byHref("system"),
                      active: by === "system",
                      separatorBefore: true,
                    },
                  ]}
                />
                <RowsMenu searchParams={searchParams} />
              </div>
            </div>
          </div>
        }
        empty={
          <EmptyState
            icon={action || by ? <SearchNormal1 /> : <Activity />}
            title={
              action || by ? "No actions found" : "No actions yet"
            }
            description={
              action || by
                ? "Nothing matches this filter. Try another action or person."
                : undefined
            }
            action={
              action || by ? (
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/monitoring/activity">Clear filters</Link>
                </Button>
              ) : undefined
            }
          />
        }
        columns={[
          {
            key: "target",
            header: "Target",
            className: "w-[26%]",
            sortField: "targetName",
            cell: (a) => (
              <span className="block min-w-0">
                <span className="block max-w-[300px] truncate font-semibold text-foreground">
                  {a.targetName}
                </span>
                <span className="block max-w-[300px] truncate text-[13px] text-muted-foreground">
                  {a.targetDetail}
                </span>
              </span>
            ),
          },
          {
            key: "action",
            header: "Action",
            sortField: "action",
            cell: (a) => ACTION_LABEL[a.action],
          },
          {
            key: "by",
            header: "Done by",
            sortField: "actorEmail",
            cell: (a) =>
              a.actorEmail ?? (
                <span className="text-muted-foreground">System</span>
              ),
          },
          {
            key: "when",
            header: "When",
            sortField: "createdAt",
            cell: (a) => (
              <span className="text-muted-foreground">
                {formatDateTime(a.createdAt)}
              </span>
            ),
          },
          {
            key: "result",
            header: "Result",
            sortField: "result",
            cell: (a) => <StatusBadge status={a.result} />,
          },
        ]}
      />
    </>
  );
}
