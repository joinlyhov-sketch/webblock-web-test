"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchNormal1 } from "iconsax-reactjs";
import { Breadcrumb } from "@/components/common/breadcrumb";
import type { PlanTier } from "@/components/common/plan-badge";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { formatRelativeTime } from "@/lib/format";
import type { NotificationsView } from "@/features/notifications/service";
import type { Template } from "@/features/templates/types";
import type { StatusFilter } from "../service";
import type { Website, WebsiteStatusCounts } from "../types";
import { NewWebsiteCard } from "./new-website-card";
import { NotificationBell } from "./notification-bell";
import { WebsiteCard } from "./website-card";

const TAB_PARAM: Record<StatusFilter, string | null> = {
  ALL: null,
  LIVE: "live",
  DRAFT: "draft",
  SUSPENDED: "suspended",
};

/**
 * "My Websites", rendered in the browser. The list, the status tabs and the search all live in
 * state, so typing or switching a tab never reloads the page. The address bar is kept in sync with
 * `history.replaceState` (no navigation) so a refresh or a shared link opens on the same view.
 */
export function WebsitesView({
  websites: initialWebsites,
  notifications,
  templates,
  businessTypes,
  plan,
  initialFilter,
}: {
  websites: Website[];
  notifications: NotificationsView;
  templates: Template[];
  businessTypes: string[];
  /** The account's plan, shown on every live website. */
  plan: PlanTier;
  initialFilter: { status: StatusFilter; q: string };
}) {
  const [websites, setWebsites] = useState(initialWebsites);
  const [status, setStatus] = useState<StatusFilter>(initialFilter.status);
  const [query, setQuery] = useState(initialFilter.q);

  useEffect(() => {
    const params = new URLSearchParams();
    if (TAB_PARAM[status]) params.set("status", TAB_PARAM[status]);
    if (query.trim()) params.set("q", query.trim());
    const search = params.toString();
    window.history.replaceState(window.history.state, "", search ? `?${search}` : window.location.pathname);
  }, [status, query]);

  const counts = useMemo<WebsiteStatusCounts>(
    () => ({
      ALL: websites.length,
      LIVE: websites.filter((w) => w.status === "LIVE").length,
      DRAFT: websites.filter((w) => w.status === "DRAFT").length,
      SUSPENDED: websites.filter((w) => w.status === "SUSPENDED").length,
    }),
    [websites],
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      websites
        .filter((w) => status === "ALL" || w.status === status)
        .filter(
          (w) =>
            !q ||
            w.name.toLowerCase().includes(q) ||
            w.businessType.toLowerCase().includes(q) ||
            (w.domain ?? "").includes(q),
        ),
    [websites, status, q],
  );

  const filtering = status !== "ALL" || q !== "";

  /** Updates one card right after an action succeeds, so the UI changes without a reload. */
  function patchWebsite(id: string, patch: Partial<Website>) {
    setWebsites((current) => current.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }
  function removeWebsite(id: string) {
    setWebsites((current) => current.filter((w) => w.id !== id));
  }

  const tab = (label: string, value: StatusFilter) => ({
    label,
    count: counts[value],
    active: status === value,
    onSelect: () => setStatus(value),
  });

  return (
    <>
      <div className="relative z-[5]">
        <Breadcrumb current="My Websites" />
        <div className="absolute -top-2.5 right-0">
          <NotificationBell
            items={notifications.items.map((n) => ({ ...n, timeLabel: shortTime(n.createdAt) }))}
          />
        </div>
      </div>

      <PageHeader
        className="mb-0"
        title="My Websites"
        description="Pick a website to edit it, manage it or deploy changes."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          label="Filter websites by status"
          tabs={[tab("All", "ALL"), tab("Live", "LIVE"), tab("Draft", "DRAFT"), tab("Suspended", "SUSPENDED")]}
        />
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search websites"
          label="Search websites"
        />
      </div>

      {/* flex-1 + centring: the empty state sits in the middle of the free space, not at the top. */}
      <div className="flex flex-1 flex-col pt-1 pb-6">
        {filtering && visible.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<SearchNormal1 />}
              title={q ? "No results found" : "No websites here yet"}
              description={q ? "Try a different keyword." : "Nothing matches this tab. Try another status."}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!filtering && <NewWebsiteCard templates={templates} businessTypes={businessTypes} />}
            {visible.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                plan={plan}
                filtered={status !== "ALL"}
                onPatch={(patch) => patchWebsite(website.id, patch)}
                onRemove={() => removeWebsite(website.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/** "2 minutes ago" → "2 mins ago", so it fits the narrow notification row. */
function shortTime(iso: string): string {
  const text = formatRelativeTime(iso)
    .replace("minutes", "mins")
    .replace("a minute", "1 min")
    .replace("an hour", "1 hour");
  return text === "yesterday" ? "Yesterday" : text;
}
