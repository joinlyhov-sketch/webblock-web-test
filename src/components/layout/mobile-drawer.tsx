"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Below `md` the sidebars become an off-canvas drawer. Desktop is unchanged: these classes only
 * apply under `md`. Closes on route change and on Esc.
 */
export function useMobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Close when the route changes (adjusting state while rendering, not in an effect).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return { open, setOpen };
}

/** Classes for the `<aside>`: fixed and slid off-screen under `md` until the drawer is open. */
export const drawerClass = (open: boolean) =>
  cn(
    "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[260px] max-md:shadow-float max-md:transition-[transform,visibility] max-md:duration-200",
    open ? "max-md:translate-x-0 max-md:visible" : "max-md:-translate-x-full max-md:invisible",
  );

/** Hamburger button and dark backdrop. Render next to the `<aside>`, never inside it. */
export function MobileDrawerToggle({ open, onOpenChange, controls }: { open: boolean; onOpenChange: (open: boolean) => void; controls: string }) {
  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={controls}
        onClick={() => onOpenChange(true)}
        className="fixed top-3 left-[15px] z-40 flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-button outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:hidden"
      >
        <HamburgerMenu variant="Outline" aria-hidden className="size-5" />
      </button>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
        />
      )}
    </>
  );
}
