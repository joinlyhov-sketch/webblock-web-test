import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White card used in the Billing plan row (radius 20, padding 15, soft blue shadow). */
export function BillingCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-background p-[15px] shadow-panel",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Icon tile, title and subtitle, with an optional trailing control (button or countdown). */
export function CardHeader({
  icon,
  tone,
  title,
  description,
  action,
  tileClassName,
}: {
  icon: ReactNode;
  /** `soft` = pale tile (Choose plan), `brand` = tinted tile (Plan details). */
  tone: "soft" | "brand";
  title: string;
  description: string;
  action?: ReactNode;
  /** Replaces the tile colours, e.g. gold for the Pro plan. */
  tileClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5",
          tileClassName ?? cn("text-brand", tone === "soft" ? "bg-tile" : "bg-primary/16"),
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="text-[17px] leading-normal font-semibold">{title}</h2>
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
