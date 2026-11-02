"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type PillTab = {
  label: string;
  href?: string;
  /** Client-side tab: a button that calls this instead of navigating (no reload). */
  onSelect?: () => void;
  active?: boolean;
};

/**
 * Segmented pill tabs from the Settings design. `lg` is the Profile/Billing switch (108 × 36),
 * `sm` is the All/Paid/Expired filter (88 × 28). A tab is a link (the choice lives in the URL) or, with `onSelect`, a button.
 */
export function PillTabs({
  tabs,
  label,
  size = "lg",
}: {
  tabs: PillTab[];
  label: string;
  size?: "lg" | "sm";
}) {
  const pathname = usePathname();
  const large = size === "lg";

  return (
    <nav
      aria-label={label}
      className={cn("inline-flex w-fit max-w-full items-end self-start rounded-full bg-segment", large ? "p-1" : "gap-0.5 p-[3px]")}
    >
      {tabs.map((tab) => {
        const active = tab.active ?? (tab.href !== undefined && pathname === tab.href);
        const tabClass = cn(
              "inline-flex items-center justify-center rounded-full px-[18px] text-sm leading-[21px] outline-none transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-safe:active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/40",
              large ? "h-9 w-[108px]" : "h-7 w-[88px]",
              active
                ? "bg-background font-semibold text-brand-deep shadow-segment"
                : "font-medium text-muted-foreground hover:bg-background/60 hover:text-foreground",
        );
        return tab.onSelect || tab.href === undefined ? (
          <button key={tab.label} type="button" aria-pressed={active} onClick={tab.onSelect} className={tabClass}>
            {tab.label}
          </button>
        ) : (
          <Link key={tab.label} href={tab.href} scroll={false} aria-current={active ? "page" : undefined} className={tabClass}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
