"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSite } from "./site-context";

/**
 * The business logo in a template header: a round image when the owner uploaded one in Business
 * information, otherwise the template's own mark (`fallback`). Size it with `className`
 * (`size-8`, or `size-[1.4em]` next to text so it follows the heading size).
 */
export function SiteLogo({ fallback, className }: { fallback: ReactNode; className?: string }) {
  const site = useSite();
  if (!site.logoUrl) return <>{fallback}</>;
  return (
    <span aria-hidden className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-site-surface", className)}>
      {/* Uploaded logos can be data URLs, which the image optimizer can't fetch. */}
      <Image src={site.logoUrl} alt="" fill unoptimized sizes="48px" className="object-cover" />
    </span>
  );
}
