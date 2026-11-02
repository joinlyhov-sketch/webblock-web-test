"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { regeneratePaymentAction } from "../actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";

/** "Generate new code" on an expired payment: asks the API for a fresh KHQR and opens it. */
export function RegenerateCodeButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  // The new code keeps the page the owner came from, so after paying they still go back there.
  const from = useSearchParams().get("from");
  const [pending, startTransition] = useTransition();

  function regenerate() {
    startTransition(async () => {
      const result = await regeneratePaymentAction(orderId);
      if (!result.ok) {
        toast.error("Could not create a new code", result.message);
        return;
      }
      router.push(`/billing/pay/${result.data.orderId}${from ? `?from=${from}` : ""}`);
    });
  }

  return (
    <Button onClick={regenerate} loading={pending}>
      Generate new code
    </Button>
  );
}
