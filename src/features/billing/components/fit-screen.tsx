"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Keeps billing content inside the screen: centred in the space under the top bar, and scaled down
 * (never up) when the window is too small, so the page itself never scrolls.
 */
export function FitScreen({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      // offsetWidth/offsetHeight ignore transforms, so these are the natural (unscaled) sizes.
      const next = Math.min(1, outer.clientHeight / inner.offsetHeight, outer.clientWidth / inner.offsetWidth);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="relative min-h-0 w-full flex-1">
      <div
        ref={innerRef}
        className="absolute top-1/2 left-1/2 flex w-full max-w-[1292px] flex-col items-center px-4 pt-2 pb-12"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
