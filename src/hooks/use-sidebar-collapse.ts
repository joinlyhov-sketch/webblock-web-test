"use client";

import { useEffect, useRef, useState } from "react";

/** Length of the sidebars' width animation (`duration-200`). */
export const SIDEBAR_WIDTH_MS = 200;

/**
 * Collapse state for a sidebar whose width animates. `narrow` drives the width, `collapsed` the
 * content layout. Expanding widens first and shows the labels once the width has finished
 * growing; collapsing switches to icons first, then narrows. That way wide content is never laid
 * out inside a sidebar that is still narrow (logo, labels and cards spilling over the page).
 */
export function useSidebarCollapse() {
  const [narrow, setNarrow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const labelsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(labelsTimer.current), []);

  function toggle() {
    clearTimeout(labelsTimer.current);
    if (narrow) {
      setNarrow(false);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      labelsTimer.current = setTimeout(() => setCollapsed(false), reduceMotion ? 0 : SIDEBAR_WIDTH_MS);
    } else {
      setCollapsed(true);
      setNarrow(true);
    }
  }

  return { narrow, collapsed, toggle };
}
