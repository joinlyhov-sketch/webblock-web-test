"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { InfoCircle } from "iconsax-reactjs";
import { startPaymentAction } from "../actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { PaidPlanCode } from "../types";

export type PlanMode = "subscribe" | "change" | "renew";

type ChoosePlanButtonProps = {
  plan: PaidPlanCode;
  planName: string;
  /** Monthly price as a decimal string. */
  price: string;
  /** subscribe after the trial, change between paid plans, renew the current plan. */
  mode: PlanMode;
  label: ReactNode;
  /** Page the user came from ("settings"): the payment page then links back there. */
  from?: string;
  /** Website being deployed: the payment then belongs to it and links back to it. */
  forWebsite?: string;
  className?: string;
};

const COPY: Record<PlanMode, { title: (name: string) => string; detail: string }> = {
  subscribe: {
    title: (name) => `Subscribe to ${name}?`,
    detail: "You’ll pay by KHQR on the next step and your plan starts right after.",
  },
  change: {
    title: (name) => `Switch to ${name}?`,
    detail: "You’ll pay by KHQR on the next step and your plan changes right after.",
  },
  renew: {
    title: (name) => `Renew ${name}?`,
    detail: "You’ll pay by KHQR on the next step and 30 more days are added to your current plan.",
  },
};

/** "Choose Plus": asks to confirm, creates the payment, then opens its KHQR page. */
export function ChoosePlanButton({ plan, planName, price, mode, label, from, forWebsite, className }: ChoosePlanButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await startPaymentAction(plan, forWebsite);
      if (!result.ok) {
        setOpen(false);
        toast.error("Could not start the payment", result.message);
        return;
      }
      router.push(`/billing/pay/${result.data.orderId}${from ? `?from=${from}` : ""}`);
    });
  }

  const cost = `${formatPrice(price, "USD")} / month, billed monthly, cancel any time.`;
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        tone="brand"
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={pending}
        icon={<InfoCircle variant="Outline" />}
        title={COPY[mode].title(planName)}
        // Only a payment made for a deploy puts the website online right after.
        description={`${cost} ${forWebsite && mode === "subscribe" ? "You’ll pay by KHQR on the next step and your website deploys right after." : COPY[mode].detail}`}
        confirmLabel="Continue to payment"
      />
    </>
  );
}
