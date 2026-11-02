"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { More } from "iconsax-reactjs";
import { Modal } from "@/components/common/modal";
import type { NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import { isActive, NavIconGlyph } from "./sidebar-nav";

/** The shared layout keeps this mounted while its pages change. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<{ title: string; items: NavItem[] } | null>(null);
  const visible = items.length > 5 ? items.slice(0, 4) : items;
  const rest = items.length > 5 ? items.slice(4) : [];
  const tabClass = (active: boolean) => cn(
    "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] leading-tight font-medium outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none md:flex-row md:gap-2 md:px-2 md:text-xs",
    active ? "bg-primary-soft font-semibold text-brand-strong" : "text-muted-foreground hover:bg-muted",
  );
  // Studio pages use a separate layout; this also covers nested builder routes added later.
  if (/\/(edit|builder)(\/|$)/.test(pathname)) return null;

  return <>
    <nav aria-label="Bottom navigation" className="mobile-glass fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex gap-1 rounded-[22px] border border-border/60 p-1.5 shadow-float md:max-w-xl lg:hidden">
      {visible.map((item) => item.children ? (
        <button key={item.href} type="button" aria-label={item.label} aria-current={isActive(pathname, item) ? "page" : undefined} aria-haspopup="dialog" onClick={() => setSheet({ title: item.label, items: item.children! })} className={tabClass(isActive(pathname, item))}>
          <NavIconGlyph item={item} /><span className="max-w-full break-words text-center">{item.label}</span>
        </button>
      ) : (
        <Link key={item.href} href={item.href} prefetch aria-current={isActive(pathname, item) ? "page" : undefined} className={tabClass(isActive(pathname, item))}>
          <NavIconGlyph item={item} /><span className="max-w-full break-words text-center">{item.label}</span>
        </Link>
      ))}
      {rest.length > 0 && <button type="button" aria-haspopup="dialog" onClick={() => setSheet({ title: "More", items: rest })} className={tabClass(rest.some((item) => isActive(pathname, item)))}>
        <More variant="Outline" aria-hidden className="size-[18px]" /><span>More</span>
      </button>}
    </nav>
    <Modal open={sheet !== null} onClose={() => setSheet(null)} label={sheet?.title ?? "More navigation"} className="mobile-nav-sheet">
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{sheet?.title}</h2><button type="button" aria-label="Close navigation" onClick={() => setSheet(null)} className="min-h-11 min-w-11 rounded-full bg-muted text-sm">Close</button></div>
        <nav aria-label="More navigation" className="flex flex-col gap-1">
          {sheet?.items.map((item) => <div key={item.href}>
            <Link href={item.href} prefetch onClick={() => setSheet(null)} aria-current={isActive(pathname, item) ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm", isActive(pathname, item) && "bg-primary-soft font-semibold text-primary")}><NavIconGlyph item={item} />{item.label}</Link>
            {item.children?.map((child) => <Link key={child.href} href={child.href} prefetch onClick={() => setSheet(null)} aria-current={isActive(pathname, child) ? "page" : undefined} className="flex min-h-12 items-center rounded-xl py-2 pr-3 pl-10 text-sm text-foreground-soft">{child.label}</Link>)}
          </div>)}
        </nav>
      </div>
    </Modal>
  </>;
}
