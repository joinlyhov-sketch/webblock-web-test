import { Activity, Box, Check, Clock, DocumentText, Flash, Global } from "iconsax-reactjs";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PlanFeatureIcon } from "../types";

const ICONS: Record<PlanFeatureIcon, ReactNode> = {
  check: <Check variant="Outline" />,
  clock: <Clock variant="Outline" />,
  globe: <Global variant="Outline" />,
  rocket: <Flash variant="Outline" />,
  box: <Box variant="Outline" />,
  pulse: <Activity variant="Outline" />,
  file: <DocumentText variant="Outline" />,
};

/** Feature icon, 18px by default (20px on the dashboard plans); colour follows the text colour. */
export function PlanFeatureGlyph({
  icon,
  size = 18,
  className,
}: {
  icon: PlanFeatureIcon;
  size?: 18 | 20;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center",
        size === 20 ? "size-5 [&_svg]:size-5" : "size-[18px] [&_svg]:size-[18px]",
        className,
      )}
    >
      {ICONS[icon]}
    </span>
  );
}
