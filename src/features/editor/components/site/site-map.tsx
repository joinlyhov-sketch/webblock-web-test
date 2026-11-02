import { cn } from "@/lib/utils";
import { useSite } from "./site-context";
import { directionsHref, EXTERNAL_LINK } from "./site-links";

/**
 * The drawn map from every template's "Visit us" (land, park, roads, pin card, "Open in Google Maps").
 * Decorative only: no map SDK, the link opens Google Maps directions. Size it with `className`
 * (it fills its box). Colours come from the site tokens `site-map-*`.
 */
export function SiteMap({
  className,
  children,
  pin = "center",
}: {
  className?: string;
  /** Overlay, e.g. an info card on the left (then use `pin="end"` so it doesn't cover the pin). */
  children?: React.ReactNode;
  /** "end" moves the pin into the right part of the map from desktop width up. */
  pin?: "center" | "end";
}) {
  const site = useSite();
  return (
    <div className={cn("relative isolate overflow-hidden bg-site-map-land", className)}>
      <div aria-hidden className="absolute -top-[18%] -right-[8%] size-[46%] min-w-40 rounded-full bg-site-map-park" />
      <div aria-hidden className="absolute top-[38%] -left-[10%] h-3 w-[130%] -rotate-6 bg-site-map-road" />
      <div aria-hidden className="absolute top-[72%] -left-[10%] h-2 w-[130%] rotate-3 bg-site-map-road" />
      <div aria-hidden className="absolute -top-[10%] left-[28%] h-[130%] w-3 rotate-[14deg] bg-site-map-road" />
      <div aria-hidden className="absolute -top-[10%] left-[82%] h-[130%] w-2 bg-site-map-road" />

      <div
        className={cn(
          "absolute top-1/2 left-1/2 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 items-center gap-3",
          pin === "end" && "@5xl:left-[70%]",
        )}
      >
        <span aria-hidden className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-site-map-pin/20">
          <span className="size-4 rounded-full border-[3px] border-site-surface bg-site-map-pin shadow" />
        </span>
        <span className="min-w-0 rounded-xl bg-site-surface px-3.5 py-2 font-site-body shadow-md">
          <span className="block truncate text-[13px] font-semibold text-site-ink">{site.businessName}</span>
          <span className="block truncate text-[11px] text-site-muted">{site.address}</span>
        </span>
      </div>

      <a
        href={directionsHref(site.address)}
        {...EXTERNAL_LINK}
        className="absolute right-4 bottom-4 rounded-full bg-site-surface px-3.5 py-2 font-site-body text-[12px] font-semibold text-site-map-pin shadow-md transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-site-map-pin"
      >
        Open in Google Maps ↗
      </a>
      {children}
    </div>
  );
}
