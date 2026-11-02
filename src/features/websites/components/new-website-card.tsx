"use client";

import { useState } from "react";
import { Add } from "iconsax-reactjs";
import { ChooseTemplateModal } from "@/features/templates/components/choose-template-modal";
import type { Template } from "@/features/templates/types";

/** Dashed "Start a new website" tile. Clicking it (or "Browse templates") opens the template chooser. */
export function NewWebsiteCard({
  templates,
  businessTypes,
}: {
  templates: Template[];
  businessTypes: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-h-[316px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-dashed-line bg-background outline-none transition-[background-color,border-color,scale] duration-200 ease-out hover:border-primary hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-[0.99]"
      >
        <span aria-hidden className="flex size-[52px] items-center justify-center rounded-2xl bg-brand-soft text-primary">
          <Add variant="Outline" className="size-6" />
        </span>
        <span className="flex flex-col items-center">
          <span className="font-heading text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px] text-foreground">
            Start a new website
          </span>
          <span className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">
            Choose a template made for your business
          </span>
        </span>
        <span className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-background px-3 text-[13px] font-semibold text-foreground shadow-button transition-colors group-hover:border-primary/40">
          Browse templates
        </span>
      </button>
      <ChooseTemplateModal
        open={open}
        onClose={() => setOpen(false)}
        templates={templates}
        businessTypes={businessTypes}
      />
    </>
  );
}
