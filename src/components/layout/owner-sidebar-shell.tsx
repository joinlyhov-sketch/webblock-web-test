"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExportSquare, Logout, SidebarLeft } from "iconsax-reactjs";
import { signOutAction } from "@/features/auth/actions";
import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ownerNav } from "@/config/nav";
import { liveSiteHref } from "@/config/site";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";
import type { Profile } from "@/features/account";
import type { Website } from "@/features/websites";
import { BrandLogo } from "./brand-logo";
import { BottomNav } from "./bottom-nav";
import { MobileHeader } from "./mobile-header";
import { SidebarNav } from "./sidebar-nav";

/** Interactive part of the Owner Portal sidebar: collapse toggle and the log out confirmation. */
export function OwnerSidebarShell({
  website,
  profile,
  notifications,
}: {
  website: Pick<Website, "id" | "name" | "domain" | "status">;
  profile: Pick<Profile, "fullName" | "initials" | "avatarUrl">;
  notifications: ReactNode;
}) {
  const { narrow, collapsed, toggle: toggleSidebar } = useSidebarCollapse();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  // Only a live website can be opened: a draft has no published page yet and a suspended one is
  // hidden from visitors.
  const live = website.status === "LIVE" && website.domain !== null;
  const siteLabel = live ? "Go to website" : website.status === "SUSPENDED" ? "Website suspended" : "Not deployed yet";
  // A suspended website can't be edited until it is reactivated from My Websites.
  const back =
    website.status === "SUSPENDED"
      ? { href: "/websites?status=suspended", label: "Back to My Websites" }
      : { href: `/websites/${website.id}/edit`, label: "Back to editor" };

  return (
    <>
    <MobileHeader profile={profile} homeHref="/websites" notifications={notifications}>
      <Link href={back.href} prefetch className="flex min-h-12 items-center rounded-xl px-3">{back.label}</Link>
      {live && <Link href={liveSiteHref(website.id)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center rounded-xl px-3">Go to website</Link>}
      <Link href="/websites" prefetch className="flex min-h-12 items-center rounded-xl px-3">My Websites</Link>
    </MobileHeader>
    <BottomNav items={ownerNav(website.id)} />
    <aside
      id="owner-sidebar"
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-background px-4 pt-5 pb-4 transition-[width] duration-200 ease-out motion-reduce:transition-none",
        narrow ? "w-[84px]" : "w-[260px]",
        "max-lg:hidden",
      )}
    >
      <div className={cn("flex items-center", collapsed ? "flex-col gap-3" : "justify-between pl-1")}>
        <BrandLogo href="/websites" compact={collapsed} />
        <button
          type="button"
          aria-label={narrow ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!narrow}
          onClick={toggleSidebar}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 max-md:hidden"
        >
          <SidebarLeft variant="Outline" aria-hidden className="size-4" />
        </button>
      </div>

      <div className={cn("pt-5 pb-5", collapsed && "flex justify-center")}>
        {/* Opens the live site in a new tab. Before the first deploy there is nothing to open. */}
        {live ? (
          <Button
            asChild
            variant="soft"
            size={collapsed ? "icon" : "md"}
            className={cn(!collapsed && "w-full")}
          >
            <Link
              href={liveSiteHref(website.id)}
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? `Go to website (${website.domain})` : (website.domain ?? undefined)}
              aria-label={collapsed ? "Go to website" : undefined}
            >
              <ExportSquare variant="Outline" aria-hidden />
              {!collapsed && siteLabel}
            </Link>
          </Button>
        ) : (
          <Button
            variant="soft"
            size={collapsed ? "icon" : "md"}
            disabled
            title={website.status === "SUSPENDED" ? "Visitors can't see a suspended website" : "Deploy your website first"}
            aria-label={collapsed ? siteLabel : undefined}
            className={cn(!collapsed && "w-full")}
          >
            <ExportSquare variant="Outline" aria-hidden />
            {!collapsed && siteLabel}
          </Button>
        )}
      </div>

      <SidebarNav items={ownerNav(website.id)} collapsed={collapsed} />

      <div className="mt-auto flex flex-col gap-0.5">
        <Link
          href={back.href}
          title={collapsed ? back.label : undefined}
          className={cn(
            "flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium text-foreground-soft outline-none transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
            collapsed && "justify-center px-0",
          )}
        >
          <ArrowLeft variant="Outline" aria-hidden className="size-[18px] shrink-0" />
          <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>{back.label}</span>
        </Link>
        <div className="py-2.5">
          <div className="h-px bg-border" />
        </div>
        <div className={cn("flex items-center gap-2.5 pr-1 pl-2", collapsed && "flex-col p-0")}>
          <Avatar
            name={profile.fullName}
            initials={profile.initials}
            src={profile.avatarUrl}
            className="size-[34px] text-xs"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">{profile.fullName}</p>
              <p className="text-xs leading-[18px] text-muted-foreground">Owner</p>
            </div>
          )}
          <button
            type="button"
            aria-label="Log out"
            onClick={() => setConfirmOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-soft outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Logout variant="Outline" aria-hidden className="size-[18px]" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => startSignOut(() => signOutAction())}
        loading={signingOut}
        icon={<Logout variant="Outline" />}
        title="Log out of WebBlock?"
        description="You’ll need to sign in again to manage and deploy your websites."
        confirmLabel="Log out"
        look="soft"
      />
    </aside>
    </>
  );
}
