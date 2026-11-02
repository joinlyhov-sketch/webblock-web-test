import Link from "next/link";
import type { ComponentType } from "react";
import { Activity, Box1, Clock, DocumentText, Global, Refresh2, TickCircle } from "iconsax-reactjs";
import { RevealGroup, RevealItem } from "@/components/common/motion";
import { Button } from "@/components/ui/button";
import { withNext } from "@/lib/auth/next-path";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan, PlanCode } from "../types";

type PlanTheme = {
  card: string;
  pill: string;
  price: string;
  divider: string;
  cta: string;
  icon: string;
  /** Hover/focus emphasis: tier-coloured border and glow (the lift is shared, see `PlanCard`). */
  hover: string;
  /** Colour of the sweeping band on the "Most popular" card. */
  shine: string;
};

/** Per-tier colours from Figma "Plan cards (4)". */
const themes = {
  FREE_TRIAL: {
    card: "border-primary bg-linear-[126deg] from-primary-soft to-background to-70%",
    pill: "border border-primary/35 bg-primary-soft text-primary",
    price: "text-primary",
    divider: "bg-primary/15",
    cta: "border-[1.5px] border-primary bg-background text-primary shadow-none hover:bg-primary-soft hover:shadow-none active:bg-brand-soft",
    icon: "text-primary",
    hover: "hover:shadow-[0_22px_40px_-14px_rgb(67_121_214/0.32)] focus-within:shadow-[0_22px_40px_-14px_rgb(67_121_214/0.32)]",
    shine: "via-primary/12",
  },
  PLUS: {
    card: "border-plan-plus-border bg-linear-to-b from-plan-plus-tint to-background to-60%",
    pill: "bg-plan-plus-soft text-plan-plus",
    price: "text-plan-plus",
    divider: "bg-border",
    cta: "bg-linear-[172deg] from-plan-plus-light to-plan-plus to-70% hover:bg-plan-plus active:bg-plan-plus",
    icon: "text-plan-plus",
    hover:
      "hover:border-plan-plus-light focus-within:border-plan-plus-light hover:shadow-[0_22px_40px_-14px_rgb(45_87_166/0.3)] focus-within:shadow-[0_22px_40px_-14px_rgb(45_87_166/0.3)]",
    shine: "via-plan-plus/12",
  },
  PRO: {
    card: "border-[1.5px] border-plan-pro-border bg-linear-to-b from-plan-pro-tint to-background to-60%",
    pill: "bg-plan-pro-soft text-plan-pro-strong",
    price: "text-plan-pro-strong",
    divider: "bg-plan-pro-soft",
    cta: "bg-plan-pro hover:bg-plan-pro-strong active:bg-plan-pro-strong",
    icon: "text-plan-pro",
    hover:
      "hover:border-plan-pro focus-within:border-plan-pro hover:shadow-[0_22px_40px_-14px_rgb(179_131_42/0.36)] focus-within:shadow-[0_22px_40px_-14px_rgb(179_131_42/0.36)]",
    shine: "via-plan-pro/16",
  },
  ULTRA: {
    card: "border-plan-ultra-border bg-linear-to-b from-plan-ultra-tint to-background to-60%",
    pill: "bg-plan-ultra-soft text-plan-ultra-strong",
    price: "text-plan-ultra-strong",
    divider: "bg-border",
    cta: "bg-plan-ultra hover:bg-plan-ultra-strong active:bg-plan-ultra-strong",
    icon: "text-plan-ultra",
    hover:
      "hover:border-plan-ultra focus-within:border-plan-ultra hover:shadow-[0_22px_40px_-14px_rgb(109_63_214/0.32)] focus-within:shadow-[0_22px_40px_-14px_rgb(109_63_214/0.32)]",
    shine: "via-plan-ultra/12",
  },
} satisfies Record<PlanCode, PlanTheme>;

type Feature = { icon: ComponentType<{ className?: string }>; label: string };

const plural = (n: number, word: string) => `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;

/**
 * Bullet list built from the plan limits. A paid plan above another paid plan starts with
 * "Everything in <lower>" and lists only what grows.
 */
function planFeatures(plan: Plan, lower: Plan | undefined): Feature[] {
  if (plan.trialDays !== null) {
    return [
      { icon: Clock, label: `Free for ${plan.trialDays} days` },
      { icon: Box1, label: `Up to ${plural(plan.productLimit, "product")}` },
      { icon: Activity, label: "Basic status monitoring" },
      { icon: TickCircle, label: "No payment needed" },
    ];
  }

  const lowerPaid = lower && lower.trialDays === null ? lower : undefined;
  const features: Feature[] = [];
  if (lowerPaid) features.push({ icon: TickCircle, label: `Everything in ${lowerPaid.name}` });
  features.push(
    {
      icon: Global,
      label: plan.websiteLimit === 1 ? "1 website" : `Up to ${plural(plan.websiteLimit, "website")}`,
    },
    {
      icon: Refresh2,
      label: plan.redeploysPerMonth === 0 ? "First deploy only" : `${plural(plan.redeploysPerMonth, "redeploy")} a month`,
    },
    { icon: Box1, label: `Up to ${plural(plan.productLimit, "product")}` },
  );
  if (!lowerPaid) features.push({ icon: Activity, label: "Basic status monitoring" });
  if (plan.logsEnabled && !lowerPaid?.logsEnabled) features.push({ icon: DocumentText, label: "Logs" });
  return features;
}

export function PlanCard({
  plan,
  lower,
  featuresDelay = 0,
}: {
  plan: Plan;
  lower?: Plan;
  /** Seconds before the feature lines start ticking in, so they follow the card's own entrance. */
  featuresDelay?: number;
}) {
  const theme = themes[plan.code];
  const isTrial = plan.trialDays !== null;

  return (
    <article
      aria-labelledby={`plan-${plan.code}`}
      className={cn(
        "relative isolate flex h-full flex-col gap-5 overflow-hidden rounded-[20px] border px-6 pt-6 pb-7 shadow-plan",
        // Lifts a little and glows in its tier colour on hover/focus, so the card being considered stands out.
        "transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1.5 motion-safe:focus-within:-translate-y-1.5",
        theme.card,
        theme.hover,
      )}
    >
      {plan.popular && (
        // Behind the content (-z-10 inside `isolate`), so it sweeps over the card fill but never the text.
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 -left-[60%] -z-10 w-1/3 -skew-x-12 bg-linear-to-r from-transparent to-transparent animate-plan-shine",
            theme.shine,
          )}
        />
      )}

      <div className="flex min-h-[25px] items-center justify-between gap-2">
        <h3
          id={`plan-${plan.code}`}
          className={cn("rounded-full px-2.5 py-1 font-sans text-xs font-bold tracking-[0.06em] uppercase", theme.pill)}
        >
          {plan.name}
        </h3>
        {plan.popular && (
          <span className="rounded-full bg-plan-pro px-2.5 py-1 text-xs font-medium text-primary-foreground">
            Most popular
          </span>
        )}
      </div>

      <p className="flex items-baseline gap-1">
        <span className={cn("font-heading text-[38px] leading-none font-bold", theme.price)}>
          {formatPrice(plan.priceMonthly, plan.currency, { trimZeroCents: true })}
        </span>
        {!isTrial && <span className="text-base text-muted-foreground">/mo</span>}
      </p>

      <div aria-hidden className={cn("h-px w-full", theme.divider)} />

      <Button asChild size="lp-md" className={cn("h-[46px] w-full text-[15px]", theme.cta)}>
        {/* Every account starts on the free trial; "Choose Pro" then lands on the plans screen to switch. */}
        <Link href={isTrial ? "/register" : withNext("/register", "/billing/plans")}>
          {isTrial ? "Start free trial" : `Choose ${plan.name}`}
        </Link>
      </Button>

      <RevealGroup stagger={0.06} delay={featuresDelay}>
        <ul className="flex flex-col gap-3.5">
          {planFeatures(plan, lower).map(({ icon: Icon, label }) => (
            <li key={label}>
              <RevealItem y={8} className="flex items-center gap-2.5 text-[15px] text-foreground">
                <Icon aria-hidden className={cn("size-[18px] shrink-0", theme.icon)} />
                {label}
              </RevealItem>
            </li>
          ))}
        </ul>
      </RevealGroup>
    </article>
  );
}
