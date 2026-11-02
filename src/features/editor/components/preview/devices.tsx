"use client";

import { useEffect, useRef, useState } from "react";
import { Mobile, Monitor } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "tablet" | "mobile";

/** Width the website is laid out at (the editor label reads "Desktop 1280"). */
export const DEVICE_WIDTH = { desktop: 1280, tablet: 820, mobile: 390 } satisfies Record<Device, number>;

// iconsax has no tablet glyph: a small outline tablet in the same 1.5px linear style.
function TabletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <rect x="4.5" y="2.5" width="15" height="19" rx="3" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

const DEVICES = [
  { value: "desktop", label: "Desktop", icon: Monitor, iconClass: "size-[18px]" },
  { value: "tablet", label: "Tablet", icon: TabletIcon, iconClass: "size-[18px]" },
  { value: "mobile", label: "Mobile", icon: Mobile, iconClass: "size-[18px]" },
] as const;

/** Figma device toggle in the editor top bar: icon-only segments in a soft blue rounded tray. */
export function DeviceSwitcher({ value, onChange }: { value: Device; onChange: (device: Device) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Device"
      className="flex gap-1 rounded-xl border border-border bg-switcher p-1"
    >
      {DEVICES.map((d) => {
        const active = d.value === value;
        return (
          <button
            key={d.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={d.label}
            title={d.label}
            onClick={() => onChange(d.value)}
            className={cn(
              "flex h-8 items-center justify-center gap-2 text-[13px] font-medium transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              "w-12 rounded-lg",
              active ? "bg-background text-brand-deep shadow-button" : "text-foreground-soft hover:bg-background/60 hover:text-foreground",
            )}
          >
            <d.icon variant="Outline" aria-hidden className={d.iconClass} />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Zoom that fits `width` CSS px into the element's width (never above 1).
 * Used with the CSS `zoom` property so the site lays out at its real device width.
 */
export function useFitZoom<T extends HTMLElement>(width: number, gutter = 48) {
  const ref = useRef<T>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1, Math.max(0.2, (el.clientWidth - gutter) / width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, gutter]);
  return { ref, zoom };
}
