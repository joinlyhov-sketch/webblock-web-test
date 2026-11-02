"use client";

import { adminNav } from "@/config/nav";
import { Avatar } from "@/components/common/avatar";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { SidebarShell } from "./sidebar-shell";
import { SignOutButton } from "./sign-out-button";

type SidebarUser = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

/** Admin Portal sidebar. The button next to the logo collapses it to an icon rail, like the user sidebar. */
export function AdminSidebar({ user }: { user: SidebarUser }) {
  const { narrow, collapsed, toggle } = useSidebarCollapse();

  return (
    <SidebarShell
      label="Admin Portal"
      homeHref="/admin"
      compact
      narrow={narrow}
      collapsed={collapsed}
      onToggleCollapsed={toggle}
      footer={
        <div className={cn("flex items-center gap-2.5 px-2 py-1.5", collapsed && "flex-col gap-3 px-0")}>
          <Avatar variant="solid" name={user.fullName} src={user.avatarUrl} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
          <SignOutButton description="You’ll need to sign in again to manage the platform." />
        </div>
      }
    >
      <SidebarNav items={adminNav} collapsed={collapsed} />
    </SidebarShell>
  );
}
