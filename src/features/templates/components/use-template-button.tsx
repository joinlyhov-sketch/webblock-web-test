"use client";

import { useActionState, useEffect } from "react";
import { Add } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils";

type CreateAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * "Use template": creates a website from this template and opens it in the editor.
 * `createAction` is `createWebsiteAction` from the websites feature, passed in by a Server Component.
 */
export function UseTemplateButton({
  templateId,
  createAction,
  className,
  size = "sm",
}: {
  templateId: string;
  createAction: CreateAction;
  className?: string;
  size?: "sm" | "md";
}) {
  const [state, action, pending] = useActionState(createAction, null);

  useEffect(() => {
    if (state && !state.ok) toast.error("Couldn't create the website", state.message);
  }, [state]);

  return (
    <form action={action} className={cn("flex", className)}>
      <input type="hidden" name="templateId" value={templateId} />
      <Button type="submit" size={size} loading={pending} className="w-full">
        {!pending && <Add variant="Outline" />} Use template
      </Button>
    </form>
  );
}
