"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DocumentDownload, Filter, Receipt2 } from "iconsax-reactjs";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { PillSelect } from "@/components/common/filter-select";
import { RowsSelect } from "@/components/common/rows-select";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatDayMonthYear, formatPrice } from "@/lib/format";
import { toPage } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type { BillingView as BillingData } from "../service";
import type { OrderStatus, PlanCode, PlanOrder } from "../types";
import { PillTabs } from "./pill-tabs";

const PLAN_LETTER: Record<PlanCode, string> = {
  FREE_TRIAL: "text-muted-foreground border-border",
  PLUS: "text-primary border-primary",
  PRO: "text-pro-to border-pro-from",
  ULTRA: "text-ultra-to border-ultra-from",
};

const STATUS_PARAM: Record<"PAID" | "EXPIRED", string> = { PAID: "paid", EXPIRED: "expired" };

/**
 * Settings → Billing history, rendered in the browser. The status tabs, plan filter, sort, page and
 * rows per page live in state, so none of them reloads the page. The URL is kept in sync with
 * `history.replaceState` (no navigation) so a refresh or a shared link opens on the same view.
 */
export function BillingHistory({
  orders,
  planOptions,
  initialFilter,
}: {
  orders: PlanOrder[];
  planOptions: BillingData["planOptions"];
  initialFilter: BillingData["initialFilter"];
}) {
  const [status, setStatus] = useState<"ALL" | OrderStatus>(initialFilter.status);
  const [plan, setPlan] = useState(initialFilter.plan);
  const [size, setSize] = useState(initialFilter.size);
  const [pageIndex, setPageIndex] = useState(initialFilter.page);
  const [sort, setSort] = useState(initialFilter.sort);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", STATUS_PARAM[status]);
    if (plan) params.set("plan", plan);
    if (size !== 10) params.set("size", String(size));
    if (pageIndex > 0) params.set("page", String(pageIndex + 1));
    if (sort) params.set("sort", `${sort.field},${sort.direction}`);
    const search = params.toString();
    window.history.replaceState(window.history.state, "", search ? `?${search}` : window.location.pathname);
  }, [status, plan, size, pageIndex, sort]);

  const matches = useMemo(() => {
    const { field, direction } = sort ?? { field: "createdAt", direction: "desc" as const };
    const sign = direction === "asc" ? 1 : -1;
    return orders
      .filter((o) => status === "ALL" || o.status === status)
      .filter((o) => !plan || o.plan === plan)
      .sort((a, b) =>
        field === "amount"
          ? sign * (Number(a.amount) - Number(b.amount))
          : sign * a.createdAt.localeCompare(b.createdAt),
      );
  }, [orders, status, plan, sort]);
  const lastPage = Math.max(0, Math.ceil(matches.length / size) - 1);
  const page = toPage(matches, { page: Math.min(pageIndex, lastPage), size });

  const tab = (label: string, value: "ALL" | OrderStatus) => ({
    label,
    active: status === value,
    onSelect: () => {
      setStatus(value);
      setPageIndex(0);
    },
  });

  return (
    <DataTable
        className="min-h-[360px] flex-1"
        label="Billing history"
        itemLabel="orders"
        itemLabelOne="order"
        data={page}
        controls={{
          sort,
          onSort: (field, direction) => {
            setSort({ field, direction });
            setPageIndex(0);
          },
          onPageChange: setPageIndex,
        }}
        rowKey={(order) => order.id}
        heading={
          <h2 className="flex items-center gap-3 text-lg font-semibold">
            <Receipt2 aria-hidden className="size-[22px] text-brand" /> Billing history
          </h2>
        }
        toolbar={
          <>
            <PillTabs
              size="sm"
              label="Filter billing history"
              tabs={[
                tab("All", "ALL"),
                tab("Paid", "PAID"),
                tab("Expired", "EXPIRED"),
              ]}
            />
            <div className="ml-auto flex items-center gap-2.5">
              <PillSelect
                label="Plan:"
                value={plan}
                options={planOptions}
                onValueChange={(next) => {
                  setPlan(next);
                  setPageIndex(0);
                }}
              />
              <RowsSelect
                value={size}
                onChange={(next) => {
                  setSize(next);
                  setPageIndex(0);
                }}
              />
            </div>
          </>
        }
        columns={[
          {
            key: "plan",
            header: "Plan",
            className: "px-0",
            cell: (order) => (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-semibold",
                    PLAN_LETTER[order.plan],
                  )}
                >
                  {order.planName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{order.planName}</p>
                  <p className="truncate text-[13px] text-placeholder">
                    {order.period ? `${order.period} · ` : ""}
                    {order.websiteName}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "date",
            header: "Date",
            sortField: "createdAt",
            className: "w-[140px] px-0",
            cell: (order) => <span className="text-sm">{formatDayMonthYear(order.createdAt)}</span>,
          },
          {
            key: "amount",
            header: "Amount",
            sortField: "amount",
            className: "w-[110px] px-0",
            cell: (order) => (
              <span className={cn("text-sm", order.status === "PAID" ? "font-semibold" : "text-placeholder")}>
                {formatPrice(order.amount, order.currency)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            headerIcon: <Filter aria-hidden className="size-3.5" />,
            className: "w-[190px] px-0",
            cell: (order) => <StatusBadge status={order.status} />,
          },
          {
            key: "action",
            header: <span className="sr-only">Receipt</span>,
            className: "w-[200px] pr-4 pl-0 text-right",
            cell: (order) =>
              order.status === "PAID" ? (
                <a
                  href={`/api/receipts/${order.id}`}
                  download
                  aria-label={`Download receipt for ${order.planName}, ${formatDayMonthYear(order.createdAt)}`}
                  className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <DocumentDownload aria-hidden className="size-3.5" /> Receipt
                </a>
              ) : (
                <span className="text-sm text-placeholder">QR code expired</span>
              ),
          },
        ]}
        empty={
          orders.length > 0 ? (
            // Orders exist, the filters just hide them all.
            <EmptyState
              icon={<Filter />}
              title="No orders match these filters"
              description="Try another status or plan, or show every order."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStatus("ALL");
                    setPlan("");
                    setPageIndex(0);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
          <EmptyState
            icon={<Receipt2 />}
            title="No billing history yet"
            description="You’re on the free trial, so there’s nothing to pay yet. Your plan orders and receipts will show up here after you choose a plan."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/billing/plans?from=settings">View plans</Link>
              </Button>
            }
          />
          )
        }
      />
  );
}
