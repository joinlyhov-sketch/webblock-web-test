import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarLeft } from "iconsax-reactjs";
import { LOGO_WORDMARK_INSET, Logo, LogoMark } from "@/components/common/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Sidebar frame (Admin Portal): brand on top, nav below, optional footer pinned to the bottom.
 * With `onToggleCollapsed` it gets the same collapse button as the user sidebar; the owner keeps
 * the `collapsed` state and passes it to the nav and footer too.
 */
export function SidebarShell({
  label,
  homeHref,
  children,
  footer,
  compact = false,
  collapsed = false,
  narrow = collapsed,
  onToggleCollapsed,
}: {
  label?: string;
  homeHref: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Narrower sidebar with a smaller logo (Admin Portal). */
  compact?: boolean;
  /** Icon-only rail: logo mark, nav icons, footer stacked. */
  collapsed?: boolean;
  /** Rail width. Defaults to `collapsed`; pass it separately (see `useSidebarCollapse`) to stage the animation. */
  narrow?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col gap-1.5 overflow-hidden border-r border-border bg-background transition-[width] duration-200 ease-out motion-reduce:transition-none",
        compact ? "px-3 py-4" : "px-4 py-[22px]",
        narrow ? "w-[72px]" : compact ? "w-[232px]" : "w-[260px]",
      )}
    >
      <div className={cn("mb-4 flex items-center pt-1", collapsed ? "flex-col gap-3" : "justify-between gap-2")}>
        <Link
          href={homeHref}
          aria-label={collapsed ? siteConfig.name : undefined}
          className="flex min-w-0 items-center rounded-lg px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {collapsed ? <LogoMark className="h-8" /> : <Brand label={label} compact={compact} />}
        </Link>
        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={narrow ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!narrow}
            onClick={onToggleCollapsed}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <SidebarLeft aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {children}
      {footer && (
        <div className="mt-auto border-t border-border pt-2.5">{footer}</div>
      )}
    </aside>
  );
}

/** Logo and the portal name under it, lined up with the wordmark. */
function Brand({ label, compact }: { label?: string; compact: boolean }) {
  const logoHeight = compact ? 28 : 32;
  return (
    <span className="flex min-w-0 flex-col">
      <Logo className={compact ? "h-7" : undefined} />
      {label && (
        <span
          className="-mt-0.5 block text-xs text-muted-foreground"
          style={{ paddingLeft: logoHeight * LOGO_WORDMARK_INSET }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
