"use client";

import { Puck } from "@puckeditor/core";
import { DEVICE_WIDTH, useFitZoom, type Device } from "../preview/devices";

/**
 * Centre canvas (Figma "10 Editor"): the page card on the dotted backdrop, laid out at the real device
 * width and zoomed to fit. The site uses container queries, so it responds to this width rather than
 * the browser window.
 */
export function EditorCanvas({ device }: { device: Device }) {
  const width = DEVICE_WIDTH[device];
  // Figma leaves a wide band of dotted backdrop on both sides of the page card.
  const { ref, zoom } = useFitZoom<HTMLDivElement>(width, 128);

  return (
    <div ref={ref} className="relative flex min-w-0 flex-1 flex-col items-center overflow-y-auto px-16 pt-2 pb-10">
      {/* The zoom is applied by SiteRoot (inside the preview) through these variables, not here:
          Puck positions its selection overlays inside the preview, so zooming an outer box would
          scale them twice. */}
      <div
        className="shrink-0 overflow-hidden rounded-2xl border border-border bg-background shadow-card"
        style={{ width: width * zoom, "--canvas-zoom": zoom, "--canvas-width": `${width}px` } as React.CSSProperties}
      >
        <Puck.Preview id="website-canvas" />
      </div>
    </div>
  );
}
