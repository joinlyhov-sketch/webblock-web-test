"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

const KEY_STEP = 16;

type ResizeHandleProps = {
  /** Accessible name, e.g. "Resize page panel". */
  label: string;
  /** Which side of the handle the panel is on: dragging away from it makes the panel wider. */
  panel: "left" | "right";
  /** Current panel width in px (its folded width while `collapsed`). */
  value: number;
  /** Narrowest width the panel still shows its content at. */
  min: number;
  max: number;
  onChange: (width: number) => void;
  /**
   * Optional folded state (an icon-only strip `collapsedWidth` px wide). Dragging past halfway between
   * `collapsedWidth` and `min` folds the panel; dragging back out unfolds it.
   */
  collapsed?: boolean;
  collapsedWidth?: number;
  onCollapsedChange?: (collapsed: boolean) => void;
};

/**
 * Thin vertical bar between a side panel and the content: drag it (or focus it and use ←/→, Home, End)
 * to change the panel's width between `min` and `max`, and down to its icon strip when it can fold.
 * Double-click goes back to `max`.
 *
 * @example
 * <ResizeHandle label="Resize page panel" panel="left" value={width} min={240} max={300} onChange={setWidth} />
 */
export function ResizeHandle({
  label,
  panel,
  value,
  min,
  max,
  onChange,
  collapsed = false,
  collapsedWidth,
  onCollapsedChange,
}: ResizeHandleProps) {
  const drag = useRef<{ x: number; width: number } | null>(null);
  const canFold = collapsedWidth !== undefined && onCollapsedChange !== undefined;
  const foldBelow = canFold ? (collapsedWidth + min) / 2 : -Infinity;
  // Moving right widens a left panel and narrows a right one.
  const sign = panel === "left" ? 1 : -1;

  /** Applies a wanted width: folds below the halfway point, otherwise unfolds and clamps. */
  const resize = (width: number) => {
    if (width < foldBelow) {
      if (!collapsed) onCollapsedChange?.(true);
      return;
    }
    if (collapsed) onCollapsedChange?.(false);
    onChange(Math.round(Math.min(max, Math.max(min, width))));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, width: value };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    resize(drag.current.width + (e.clientX - drag.current.x) * sign);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = (direction: 1 | -1) => {
      if (collapsed) return direction === 1 ? min : value;
      // One step below the narrowest content width folds the panel.
      const next = value + KEY_STEP * direction;
      return direction === -1 && value <= min ? foldBelow - 1 : Math.max(min, next);
    };
    const next =
      e.key === "ArrowRight" ? step(sign)
      : e.key === "ArrowLeft" ? step(-sign as 1 | -1)
      : e.key === "Home" ? (canFold ? foldBelow - 1 : min)
      : e.key === "End" ? max
      : null;
    if (next === null) return;
    e.preventDefault();
    resize(next);
  };

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuenow={value}
      aria-valuemin={canFold ? collapsedWidth : min}
      aria-valuemax={max}
      tabIndex={0}
      title={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onDoubleClick={() => resize(max)}
      onKeyDown={onKeyDown}
      className="group flex w-2 shrink-0 cursor-col-resize touch-none items-center justify-center outline-none select-none"
    >
      <span
        aria-hidden
        className="h-10 w-1 rounded-full bg-transparent transition-colors group-hover:bg-brand-border group-focus-visible:bg-primary group-active:bg-primary"
      />
    </div>
  );
}
