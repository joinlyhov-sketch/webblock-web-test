import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White rounded panel with the WebBlock box shadow (dashboard widgets, detail sections). */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-border bg-background shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Panel heading: optional icon chip, title, and something on the right (a link, a count, a period).
 *
 * @example
 * <CardHeader title="Recent deploys" aside={<Link href="/admin/websites">View all</Link>} />
 */
export function CardHeader({
  title,
  icon,
  aside,
  className,
  compact = false,
}: {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  className?: string;
  /** Plain brand icon (no circle) and a 15px title, for dense table toolbars. */
  compact?: boolean;
}) {
  return (
    <header
      className={cn("flex items-center justify-between gap-3", className)}
    >
      <div className={cn("flex items-center", compact ? "gap-2.5" : "gap-3")}>
        {icon && (
          <span
            className={cn(
              "grid shrink-0 place-items-center text-brand",
              compact
                ? "[&_svg]:size-4"
                : "size-9 rounded-full bg-brand-soft [&_svg]:size-[18px]",
            )}
          >
            {icon}
          </span>
        )}
        <h2
          className={cn(
            "font-semibold text-foreground",
            compact
              ? "text-sm leading-5"
              : "text-[17px] leading-[22px] tracking-[-0.17px]",
          )}
        >
          {title}
        </h2>
      </div>
      {aside && (
        <div className="text-[13px] font-medium text-foreground-soft">
          {aside}
        </div>
      )}
    </header>
  );
}

/**
 * Label/value rows in a bordered box (Figma "Site details", "Subscription details").
 *
 * @example
 * <DetailList items={[{ label: "Plan", value: "Pro" }, { label: "Products", value: "4 of 30" }]} />
 */
export function DetailList({
  items,
  className,
}: {
  items: { label: string; value: ReactNode; icon?: ReactNode }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "divide-y divide-border rounded-2xl border border-border",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-[13px]"
        >
          <dt className="flex items-center gap-2 text-muted-foreground">
            {item.icon && (
              <span aria-hidden className="text-brand [&_svg]:size-4">
                {item.icon}
              </span>
            )}
            {item.label}
          </dt>
          <dd className="text-right font-semibold text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
