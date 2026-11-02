import { cn } from "@/lib/utils";

export type ProgressTone = "brand" | "gold" | "violet";

const TONE = {
  brand: {
    track: "bg-primary/18",
    card: "bg-linear-to-r from-usage-from to-primary",
    solid: "bg-brand",
  },
  gold: {
    track: "bg-tier-pro-accent/18",
    card: "bg-linear-to-r from-tier-pro to-tier-pro-accent",
    solid: "bg-tier-pro-accent",
  },
  violet: {
    track: "bg-tier-ultra-cta/18",
    card: "bg-linear-to-r from-tier-ultra to-tier-ultra-cta",
    solid: "bg-tier-ultra-cta",
  },
} satisfies Record<ProgressTone, { track: string; card: string; solid: string }>;

/**
 * Thin progress bar, 6px tall. `value` is 0–100.
 * `card` = gradient fill on a tinted track (billing cards), `solid` = flat brand fill (dialogs).
 */
export function Progress({
  value,
  label,
  variant = "card",
  tone = "brand",
  className,
}: {
  value: number;
  /** Accessible name, e.g. "Trial progress". */
  label: string;
  variant?: "card" | "solid";
  /** Fill colour: the brand blue, or gold / violet for the Pro and Ultra plans. */
  tone?: ProgressTone;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const solid = variant === "solid";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "h-1.5 w-full overflow-hidden",
        solid ? "rounded-[3px] bg-track" : cn("rounded-full", TONE[tone].track),
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-[width]",
          solid ? cn("rounded-[3px]", TONE[tone].solid) : cn("rounded-full", TONE[tone].card),
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
