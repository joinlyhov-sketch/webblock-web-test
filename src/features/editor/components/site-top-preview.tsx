"use client";

import { useMemo } from "react";
import { Eye } from "iconsax-reactjs";
import { ScaleToFit } from "@/components/common/scale-to-fit";
import { cn } from "@/lib/utils";
import type { PageData, SiteRootProps } from "../types";
import { SiteRenderer } from "./site-renderer";

/** Desktop size the site is laid out at before it is scaled down to the banner. */
const DESKTOP = { width: 1280, height: 540 };

/**
 * A small, real render of the top of a website (header + first section) at desktop width, scaled to
 * fit. Not clickable. `logoUrl` swaps the logo before it is saved, so the owner sees the change at once.
 */
export function SiteTopPreview({
  data,
  logoUrl,
  label,
  className,
}: {
  data: PageData;
  /** Overrides the page's logo (a picked file's preview URL). `undefined` keeps the page's own. */
  logoUrl?: string | null;
  /** Small pill over the top-left corner, e.g. "Preview: goes live on your next deploy". */
  label?: string;
  className?: string;
}) {
  const page = useMemo<PageData>(() => {
    if (logoUrl === undefined) return data;
    const props = { ...(data.root.props as SiteRootProps), logoUrl };
    return { ...data, root: { ...data.root, props } };
  }, [data, logoUrl]);
  const name = (data.root.props as SiteRootProps).businessName;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-preview-panel", className)}>
      <div role="img" aria-label={`Preview of the top of the ${name} website`}>
        <ScaleToFit width={DESKTOP.width} height={DESKTOP.height} className="mx-auto">
          {/* inert: links, the menu and the Contact button inside the site can't be used from here. */}
          <div inert className="pointer-events-none h-full overflow-hidden select-none">
            <SiteRenderer data={page} />
          </div>
        </ScaleToFit>
      </div>
      {/* A caption bar under the site, never on top of it: every header keeps its logo top-left. */}
      {label && (
        <p className="flex items-center gap-1.5 border-t border-border bg-background px-3 py-2 text-xs font-medium text-foreground-soft">
          <Eye aria-hidden className="size-3.5 shrink-0 text-brand" />
          {label}
        </p>
      )}
    </div>
  );
}
