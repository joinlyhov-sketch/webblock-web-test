"use client";

import { useTransition } from "react";
import { toast } from "@/components/common/toast";
import type { ActionResult } from "@/lib/actions/result";

/**
 * Runs an admin Server Action in a transition and reports the result with a toast.
 * `onDone` runs only on success (e.g. close the confirm dialog).
 *
 * @example
 * const [pending, run] = useAdminAction();
 * run(() => suspendUserAction(user.id), "User suspended", () => setConfirm(false));
 */
export function useAdminAction() {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, successTitle: string, onDone?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successTitle, result.message);
        onDone?.();
      } else {
        toast.error("Couldn't finish that", result.message);
      }
    });
  }

  return [pending, run] as const;
}
