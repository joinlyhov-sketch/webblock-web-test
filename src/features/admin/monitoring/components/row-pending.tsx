"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/**
 * Small spinner inside a row's `<Link>` that confirms the click while the server renders the next page
 * (opening a row only changes `?run=`, so `loading.tsx` never shows). Fixed size so nothing shifts, and it
 * fades in after 150 ms so quick navigations show no flash.
 */
export function RowPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "size-4 shrink-0 rounded-full border-2 border-primary border-r-transparent opacity-0 motion-safe:animate-spin",
        pending && "opacity-100 transition-opacity delay-150 duration-200",
      )}
    />
  );
}
