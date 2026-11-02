import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "danger" | "neutral" | "success";

const TONE = {
  info: {
    box: "border-brand-soft bg-primary-soft",
    chip: "bg-brand-soft text-brand",
  },
  danger: {
    box: "border-danger-soft bg-danger-soft/50",
    chip: "bg-danger-soft text-danger",
  },
  neutral: {
    box: "border-border bg-surface",
    chip: "bg-neutral-soft text-muted-foreground",
  },
  success: {
    box: "border-success-soft bg-success-soft/50",
    chip: "bg-success-soft text-success",
  },
} satisfies Record<Tone, { box: string; chip: string }>;

/**
 * Highlighted message box: "Deploy #2 in progress", "Subscription canceled",
 * "Changes apply to new subscriptions…". Without `description` it renders as a compact one-liner.
 */
export function Callout({
  title,
  description,
  icon,
  tone = "info",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const styles = TONE[tone];
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border",
        description ? "p-3.5" : "px-4 py-2.5",
        styles.box,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full",
          description ? "size-10 [&_svg]:size-5" : "size-6 [&_svg]:size-4",
          styles.chip,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-foreground",
            description ? "text-[15px] font-semibold" : "text-[13px]",
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
