import type { CSSProperties } from "react";
import type { SiteRootProps } from "../../types";

type ColorOverrides = Pick<SiteRootProps, "accentColor" | "backgroundColor" | "textColor">;

/** Relative luminance of a "#rrggbb" colour (WCAG). */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/**
 * The owner's own colours ("Layout & Design · Visual style"), as `--site-*` variables that win over
 * the template and palette. `null` keeps the template/palette colour. Text on the accent is picked
 * for contrast, and the soft/muted shades are mixed from the chosen colours.
 */
export function siteColorVars({ accentColor, backgroundColor, textColor }: ColorOverrides): CSSProperties {
  const vars: Record<string, string> = {};
  if (accentColor) {
    vars["--site-accent"] = accentColor;
    vars["--site-accent-fg"] = luminance(accentColor) > 0.45 ? "#111111" : "#ffffff";
    vars["--site-accent-soft"] = `color-mix(in srgb, ${accentColor} 14%, var(--site-bg))`;
  }
  if (backgroundColor) vars["--site-bg"] = backgroundColor;
  if (textColor) {
    vars["--site-ink"] = textColor;
    vars["--site-muted"] = `color-mix(in srgb, ${textColor} 72%, var(--site-bg))`;
  }
  return vars as CSSProperties;
}
