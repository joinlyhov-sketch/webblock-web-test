import type { ReactNode } from "react";
import { Pill } from "@/components/common/status-badge";
import { cn } from "@/lib/utils";

const TITLE_SIZE = {
  compact: "text-2xl leading-8 tracking-[-0.4px]",
  default: "text-2xl leading-tight tracking-[-0.6px] lg:text-[30px] lg:leading-[34.5px]",
  hero: "text-[clamp(1.75rem,5vw,2.75rem)] leading-tight tracking-[-1px] lg:text-[44px] lg:leading-[48px]",
};

const DESCRIPTION_SIZE = {
  compact: "mt-0.5 text-[13px]",
  default: "pt-1.5 text-[15px] leading-[22.5px]",
  hero: "pt-2.5 text-base leading-[24px]",
};

const TONE = {
  /** Accent blue, the normal page title. */
  primary: "text-primary",
  /** Navy hero heading; highlight words with `<span className="text-primary">`. */
  heading: "text-heading",
  /** A failed state, e.g. "Deploy failed". */
  danger: "text-danger",
};

/**
 * Every page title: accent colour, one-line description, optional actions on the right.
 * `eyebrow` puts a small pill above the title (a string gets the outlined eyebrow pill, or pass
 * your own `<Pill>`); `align="center"` is for focused one-task screens (deploy, billing);
 * `size="hero"` is the large title inside a page banner (Templates, Support, Plans).
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  align = "start",
  size,
  compact = false,
  tone = "primary",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  align?: "start" | "center";
  size?: "compact" | "default" | "hero";
  /** Smaller title and spacing (Admin Portal). Same as `size="compact"`. */
  compact?: boolean;
  tone?: keyof typeof TONE;
  /** Pass `mb-0` when the page layout already spaces its children (e.g. `gap-[15px]`). */
  className?: string;
}) {
  const scale = size ?? (compact ? "compact" : "default");
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex flex-wrap gap-4",
        centered ? "flex-col items-center text-center" : "justify-between",
        !centered && (scale === "compact" ? "items-center" : "items-start"),
        scale === "compact" ? "mb-4" : "mb-5",
        className,
      )}
    >
      <div className={cn("flex flex-col max-lg:min-w-0 max-lg:max-w-full", centered && "items-center")}>
        {eyebrow && (
          <div className="pb-3">{typeof eyebrow === "string" ? <Pill outline>{eyebrow}</Pill> : eyebrow}</div>
        )}
        <h1 className={cn("font-heading font-semibold", TITLE_SIZE[scale], TONE[tone])}>{title}</h1>
        {description && (
          <p className={cn("text-muted-foreground", DESCRIPTION_SIZE[scale], centered && (scale === "hero" ? "max-w-[720px]" : "max-w-[560px]"))}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className={cn("flex items-center", scale === "compact" ? "gap-1.5" : "gap-2")}>{actions}</div>}
    </header>
  );
}
