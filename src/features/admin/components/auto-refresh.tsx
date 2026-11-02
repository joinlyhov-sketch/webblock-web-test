"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps every admin screen current without a manual reload: re-reads the page's server data on a timer
 * (deploy steps, notification bell, counts). Pauses while the tab is hidden and refreshes when it comes back.
 * When the real backend is ready this can become server-sent events; the screens do not change.
 */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
