"use client";

import { useTransition } from "react";
import { Refresh2 } from "iconsax-reactjs";
import { reactivateWebsiteAction } from "../actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Website } from "../types";

export function ReactivateButton({
  websiteId,
  variant = "primary",
  onPatch,
}: {
  websiteId: string;
  variant?: "primary" | "secondary";
  onPatch: (patch: Partial<Website>) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={variant}
      loading={pending}
      className={cn("flex-1", variant === "primary" && "bg-primary hover:bg-brand")}
      onClick={() =>
        startTransition(async () => {
          const result = await reactivateWebsiteAction(websiteId);
          if (result.ok) {
            const now = new Date().toISOString();
            onPatch({ status: "LIVE", suspendedAt: null, reactivatedAt: now, updatedAt: now });
            toast.success(result.message ?? "Website reactivated");
          }
          else toast.error("Could not reactivate the website", result.message);
        })
      }
    >
      {variant === "primary" && <Refresh2 variant="Outline" aria-hidden />} Reactivate
    </Button>
  );
}
