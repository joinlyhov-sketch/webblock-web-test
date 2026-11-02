"use client";

import Link from "next/link";
import Image from "next/image";
import { Add, Layer } from "iconsax-reactjs";
import { CategoryBadge } from "@/components/common/category-badge";
import { cn } from "@/lib/utils";
import type { Template } from "../types";

/** One template: page screenshot, category, name, description, Preview and Use template. */
export function TemplateCard({
  template,
  onUse,
  previewClassName = "h-[200px]",
}: {
  template: Template;
  onUse: (template: Template) => void;
  /** Height of the screenshot, e.g. `h-[360px]` in the "Start a new website" chooser. */
  previewClassName?: string;
}) {
  return (
    <article className="flex flex-col gap-[15px] rounded-[20px] border border-border bg-background p-3 shadow-card transition-[border-color,box-shadow,translate] duration-200 ease-out hover:border-primary/30 hover:shadow-float motion-safe:hover:-translate-y-0.5">
      <div className="relative overflow-hidden rounded-[14px] bg-[#f1f5fc]">
        <div className={cn("relative overflow-hidden rounded-t-lg bg-background shadow-[0_10px_30px_rgb(60_120_207/0.12),0_2px_6px_rgb(60_120_207/0.05)]", previewClassName)}>
          <Image
            src={template.thumbnailUrl}
            alt={`${template.name} template preview`}
            fill
            unoptimized
            sizes="(min-width: 1280px) 300px, 50vw"
            className="object-cover object-top"
          />
        </div>
        <CategoryBadge category={template.category} className="absolute top-2.5 right-3" />
      </div>
      <div className="flex flex-col gap-2.5 px-1.5 pb-1.5">
        <div className="flex flex-col gap-[7px]">
          <h3 className="font-heading text-[17px] font-semibold text-foreground">{template.name}</h3>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Layer variant="Outline" aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{template.description}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href={`/templates/${template.id}/preview`}
            className="flex min-h-[31px] flex-1 items-center justify-center rounded-full border border-border bg-background px-2.5 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap text-foreground shadow-[0_1px_2px_rgb(60_120_207/0.06),0_1px_1px_rgb(60_120_207/0.04)] outline-none transition-[background-color,scale] duration-150 hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-97"
          >
            Preview
          </Link>
          <button
            type="button"
            onClick={() => onUse(template)}
            className="flex min-h-[31px] flex-1 items-center justify-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap text-primary-foreground outline-none transition-[background-color,scale] duration-150 hover:bg-brand motion-safe:active:scale-97 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 [&_svg]:size-[18px] [&_svg]:shrink-0"
          >
            <Add variant="Outline" aria-hidden /> Use template
          </button>
        </div>
      </div>
    </article>
  );
}
