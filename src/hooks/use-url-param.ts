"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Change one URL search param (filters, search, rows per page). Empty or `null` removes it and the
 * page goes back to 1. The server re-renders with the new params, so state lives in the URL.
 */
export function useUrlParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = useCallback((name: string, value: string | null) => {
    // Read the latest URL so a debounced search preserves filters changed while typing.
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }, [pathname, router]);

  return { setParam, pending, searchParams };
}
