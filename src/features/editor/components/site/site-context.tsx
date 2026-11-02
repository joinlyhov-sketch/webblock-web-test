"use client";

import { createContext, use, type CSSProperties } from "react";
import type { Align, Columns, SiteRootProps, Spacing } from "../../types";

/** The page's root props, provided by the site root so every block can read business info and style. */
export const SiteContext = createContext<SiteRootProps | null>(null);

export function useSite(): SiteRootProps {
  const site = use(SiteContext);
  if (!site) throw new Error("useSite() must be used inside <SiteRoot>.");
  return site;
}

const SPACING_SCALE = { tight: 0.6, normal: 1, roomy: 1.4 } satisfies Record<Spacing, number>;

/**
 * Sets `--site-space` on a section. Templates write vertical padding as
 * `py-[calc(96px*var(--site-space))]` so "Spacing: Tight | Normal | Roomy" scales the Figma value.
 */
export function spacingStyle(spacing: Spacing): CSSProperties {
  return { "--site-space": SPACING_SCALE[spacing] } as CSSProperties;
}

/** Text alignment + flex alignment for a section's heading/copy column. */
export const ALIGN_CLASS = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
} satisfies Record<Align, string>;

/** Same, for a row of buttons (justify instead of align). */
export const JUSTIFY_CLASS = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} satisfies Record<Align, string>;

/** Product grid columns at desktop width (container ≥ 1024px). Tablet is 3, mobile 2 or 1 per template. */
export const DESKTOP_COLUMNS_CLASS = {
  "2": "@5xl:grid-cols-2",
  "3": "@5xl:grid-cols-3",
  "4": "@5xl:grid-cols-4",
} satisfies Record<Columns, string>;
