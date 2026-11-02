"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** Browser window width in px, updated on resize. `serverWidth` is used while rendering on the server. */
export function useViewportWidth(serverWidth = 1440): number {
  return useSyncExternalStore(subscribe, () => window.innerWidth, () => serverWidth);
}
