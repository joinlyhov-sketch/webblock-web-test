import type { ReactNode } from "react";
import { ExportSquare } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Top of every admin detail popup (user, website, subscription): picture on the left,
 * status pill, big name, link and info chips on a soft brand band.
 */
export function DetailHero({
  media,
  badge,
  title,
  subtitle,
  link,
  chips,
}: {
  media: ReactNode;
  badge?: ReactNode;
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  chips?: ReactNode;
}) {
  return (
    <div className="relative isolate flex items-center gap-4 overflow-hidden bg-linear-to-b from-primary-soft to-background px-6 pt-6 pb-5">
      <HeroDecor />
      <div className="shrink-0">{media}</div>
      <div className="min-w-0 flex-1 space-y-1.5 pr-8">
        {badge}
        <h2 className="text-[26px] leading-8 font-semibold tracking-[-0.4px] break-words text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="truncate text-[13px] text-muted-foreground">
            {subtitle}
          </p>
        )}
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-soft bg-background px-3 py-1 text-[13px] font-medium text-brand hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <span className="truncate">{link.label}</span>
            <ExportSquare aria-hidden className="size-3.5 shrink-0" />
          </a>
        )}
        {chips && <div className="flex flex-wrap gap-1.5 pt-0.5">{chips}</div>}
      </div>
    </div>
  );
}

const DOTS =
  "bg-[radial-gradient(var(--color-primary)_1.3px,transparent_1.4px)] bg-size-[10px_10px]";

/** Figma hero background: dot grids, a small floating dot and soft circles behind the content. */
export function HeroDecor({ layout = "band" }: { layout?: "band" | "card" }) {
  // "band": behind a short hero strip (website, subscription). "card": top of a white popup (user).
  if (layout === "card") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[200px]"
      >
        <span className="absolute top-[69px] -right-[21px] size-[120px] rounded-full bg-brand-soft/80" />
        <span className="absolute top-[69px] left-[19px] size-16 rounded-full bg-brand-soft/80" />
        <span
          className={`absolute top-[15px] left-[17px] h-12 w-[60px] opacity-35 ${DOTS}`}
        />
        <span
          className={`absolute top-[91px] right-[121px] size-12 opacity-35 ${DOTS}`}
        />
      </div>
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <span className="absolute -top-4 -right-16 size-44 rounded-full bg-brand-soft/80" />
      <span className="absolute top-[58%] -left-8 size-28 rounded-full bg-brand-soft/70" />
      <span
        className={`absolute top-3 left-6 h-[34px] w-[60px] opacity-35 ${DOTS}`}
      />
      <span
        className={`absolute top-[46%] right-[24%] h-10 w-10 opacity-35 ${DOTS}`}
      />
      <span className="absolute top-9 left-[62%] size-2 rounded-full bg-primary/60" />
    </div>
  );
}

/** Small outlined chip under the hero title: owner, deploy, email, plan. */
export function HeroChip({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground-soft [&_svg]:size-3.5 [&_svg]:shrink-0">
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Section heading inside a detail popup. */
export function DetailSection({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground">
          {icon && (
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-3.5"
            >
              {icon}
            </span>
          )}
          {title}
        </h3>
        {aside && (
          <span className="text-xs text-muted-foreground">{aside}</span>
        )}
      </header>
      {children}
    </section>
  );
}

/**
 * Bordered section inside a detail popup (Figma user detail): icon chip + bold title + aside in a
 * header row with a divider, then the content.
 */
export function DetailCard({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    // Same card as the Settings screen: 20px corners, soft blue shadow, divider inset from the edges.
    <section className="overflow-hidden rounded-[20px] border border-border bg-background shadow-surface">
      <header className="mx-[15px] flex items-center gap-3 border-b border-border py-3.5">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-3.5"
        >
          {icon}
        </span>
        <h3 className="flex-1 text-[13px] font-bold text-foreground">
          {title}
        </h3>
        {aside && (
          <span className="text-xs text-muted-foreground">{aside}</span>
        )}
      </header>
      {/* Same inset as the header, so every divider line in the card stops short of the edges. */}
      <div className="px-[15px]">{children}</div>
    </section>
  );
}

/** Icon + label + value tile inside a DetailCard ("Account ID", "Joined", "Plan"). */
export function InfoTile({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  /** Colours the tile, e.g. by plan with `planTone(plan)`. */
  tone?: { surface: string; chip: string; text: string };
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        tone?.surface ?? "bg-muted",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px] [&_svg]:size-[18px]",
          tone?.chip ?? "bg-brand-soft text-brand",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 text-[13px] leading-5">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className={cn("truncate font-semibold", tone?.text ?? "text-foreground")}>
          {value}
        </dd>
        {hint && <dd className="truncate text-xs text-placeholder">{hint}</dd>}
      </div>
    </div>
  );
}
