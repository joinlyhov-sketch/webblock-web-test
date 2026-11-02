"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders `children` at a fixed design size and scales it down (never up) to the container width.
 * Used for the landing demos so a 1280px mock stays pixel-faithful on a phone. The aspect-ratio box
 * keeps the right height before hydration.
 */
export function ScaleToFit({
  width,
  height,
  children,
  className,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
