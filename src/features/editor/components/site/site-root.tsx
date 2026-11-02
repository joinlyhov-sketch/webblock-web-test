"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SiteRootProps } from "../../types";
import { siteColorVars } from "./site-colors";
import { SiteContext } from "./site-context";
import { siteFontVariables } from "./site-fonts";
import { templateDesigns } from "./templates";

/**
 * Wraps every page (editor canvas, preview and the published site): theme variables, fonts, the
 * template's header, and `@container` so blocks respond to the canvas width instead of the window.
 */
export function SiteRoot({ site, children }: { site: SiteRootProps; children: ReactNode }) {
  const { Header } = templateDesigns[site.templateId];
  return (
    <SiteContext value={site}>
      <div
        data-site-template={site.templateId}
        data-site-palette={site.palette === "original" ? undefined : site.palette}
        data-site-font={site.font === "original" ? undefined : site.font}
        data-site-buttons={site.buttonStyle}
        style={siteColorVars(site)}
        // In the editor canvas, --canvas-width/--canvas-zoom lay the site out at the device width and
        // scale it to fit. Elsewhere they are unset: full width, no zoom.
        className={cn(
          siteFontVariables,
          "@container min-h-full [width:var(--canvas-width,auto)] bg-site-bg font-site-body text-site-ink antialiased [zoom:var(--canvas-zoom,1)]",
        )}
      >
        <Header />
        <main>{children}</main>
      </div>
    </SiteContext>
  );
}
