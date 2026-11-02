"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ArrowRight } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Sideways-scrolling row with its own thin scrollbar, shown on one line with a "Scroll →" hint
 * (the browser scrollbar can't sit beside text). The bar only appears when the content overflows;
 * drag it or click the track to scroll. Keyboard: focus the row and use the arrow keys.
 *
 * @example
 * <ScrollStrip label="Publish steps"><ol className="flex w-max">…</ol></ScrollStrip>
 */
export function ScrollStrip({
  label,
  children,
  className,
}: {
  /** Accessible name of the scrolling region. */
  label: string;
  children: ReactNode;
  /** Classes for the scrolling area, e.g. padding. */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Thumb position and size, in % of the track.
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const width = Math.min(100, (clientWidth / scrollWidth) * 100);
    const max = scrollWidth - clientWidth;
    setThumb({ left: max > 0 ? (scrollLeft / max) * (100 - width) : 0, width });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [update]);

  // Centre the thumb under the pointer.
  function scrollToPointer(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const track = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - track.left) / track.width;
    el.scrollLeft = ratio * el.scrollWidth - el.clientWidth / 2;
  }

  const overflowing = thumb.width < 99.5;

  return (
    <>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={overflowing ? 0 : undefined}
        onScroll={update}
        className={cn(
          "overflow-x-auto rounded-xl outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>
      {overflowing && (
        <div aria-hidden className="mt-1 flex items-center gap-3">
          <div
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              scrollToPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) scrollToPointer(event);
            }}
            className="relative h-1.5 flex-1 cursor-pointer touch-none rounded-full bg-border"
          >
            <span
              className="absolute inset-y-0 rounded-full bg-placeholder transition-colors hover:bg-muted-foreground"
              style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
            />
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            Scroll <ArrowRight className="size-3.5" />
          </span>
        </div>
      )}
    </>
  );
}
