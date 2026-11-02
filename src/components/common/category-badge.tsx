import type { ReactNode } from "react";
import { Cpu, Cup, Scissor, Shop } from "iconsax-reactjs";
import { CATEGORY_LABELS } from "@/config/categories";
import { cn } from "@/lib/utils";
import type { TemplateCategory } from "@/features/templates";

type CategoryMeta = { icon: ReactNode; className: string };

const categoryMeta = {
  CLOTHES: { icon: <Shop variant="Outline" />, className: "bg-category-clothes-soft text-category-clothes" },
  FOOD_BEVERAGES: { icon: <Cup variant="Outline" />, className: "bg-category-food-soft text-category-food" },
  TECHNOLOGY: { icon: <Cpu variant="Outline" />, className: "bg-category-tech-soft text-category-tech" },
  HANDMADE: { icon: <Scissor variant="Outline" />, className: "bg-category-handmade-soft text-category-handmade" },
} satisfies Record<TemplateCategory, CategoryMeta>;

/** Template / website category pill. */
export function CategoryBadge({
  category,
  className,
}: {
  category: TemplateCategory;
  className?: string;
}) {
  const meta = categoryMeta[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full py-[3px] pr-2.5 pl-2 text-xs font-medium whitespace-nowrap shadow-[0_1px_2px_rgb(60_120_207/0.06),0_1px_1px_rgb(60_120_207/0.04)] [&_svg]:size-3.5",
        meta.className,
        className,
      )}
    >
      {meta.icon}
      {CATEGORY_LABELS[category]}
    </span>
  );
}
