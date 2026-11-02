import type { ReactNode } from "react";
import { Crown, Flash, Lock1, Refresh2 } from "iconsax-reactjs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlansView as PlansData } from "../service";
import type { BillingPlan, PaidPlanCode } from "../types";
import { BillingBackdrop, BillingContent, BillingScreen, BillingTitle, BillingTopBar } from "./billing-shell";
import { ChoosePlanButton, type PlanMode } from "./choose-plan-button";
import { PlanFeatureGlyph } from "./plan-feature-icon";
import { PLAN_CARD_MOTION, TIER_THEME } from "./plan-theme";

const daysLabel = (days: number) => `${days} ${days === 1 ? "day" : "days"}`;

/** Why Deploy sent a paying owner here: their plan is full or over, so they need a different one. */
const DEPLOY_BLOCKED: Partial<Record<NonNullable<PlansData["reason"]>, (view: PlansData) => string>> = {
  PLAN_EXPIRED: (v) => `Your ${v.currentPlanName} plan has expired. Renew it to deploy ${v.websiteName} again.`,
  WEBSITE_LIMIT: (v) =>
    `Your ${v.currentPlanName} plan has no room for another website. Choose a bigger plan to deploy ${v.websiteName}.`,
  REDEPLOY_LIMIT: (v) =>
    `You’ve used this month’s redeploys on ${v.currentPlanName}. Choose a bigger plan to deploy your changes now.`,
};

/**
 * Plans screen. One colourful card layout for everyone: four cards (free trial first) while the user is
 * on the trial, three cards once they pay. The user's own plan only gets a "Current plan" label; its
 * button stays active so they can renew or add more time.
 */
export function PlansView({ view }: { view: PlansData }) {
  const paid = view.variant === "change";
  const back =
    view.from === "settings"
      ? { href: "/settings/billing", label: "Back to settings" }
      : view.websiteId
        ? { href: `/websites/${view.websiteId}/edit`, label: "Back to editor" }
        : paid
          ? { href: "/settings/billing", label: "Back to settings" }
          : view.variant === "deploy"
            ? { href: "/websites", label: "Back to editor" }
            : { href: "/websites", label: "Back to dashboard" };

  const title = `Choose a plan for ${view.websiteName}`;
  const blocked = view.reason ? DEPLOY_BLOCKED[view.reason]?.(view) : undefined;
  const copy = blocked
    ? { eyebrow: "Keep deploying", icon: <Flash aria-hidden />, title, subtitle: blocked }
    : paid
    ? {
        eyebrow: "Change your plan",
        icon: <Refresh2 aria-hidden />,
        title,
        subtitle: `You’re on ${view.currentPlanName} (${formatPrice(view.currentPrice ?? "0", "USD")} / month). Switch any time or add more time — your website stays online.`,
      }
    : view.variant === "deploy"
      ? {
          eyebrow: "Keep deploying",
          icon: <Flash aria-hidden />,
          title,
          subtitle:
            "Your free trial covered your first deploy. Subscribe to deploy your changes and keep your website online.",
        }
      : {
          eyebrow: "Upgrade your plan",
          icon: <Crown aria-hidden />,
          title,
          subtitle: `Your free trial ends in ${daysLabel(view.daysLeft)}. Choose a plan to keep your website online and keep deploying changes.`,
        };

  return (
    <BillingScreen>
      <BillingTopBar
        backHref={back.href}
        backLabel={back.label}
        chip={
          paid
            ? { label: `${view.currentPlanName} plan · Active`, tone: "success" }
            : { label: `Free trial · ${daysLabel(view.daysLeft)} left`, tone: "brand" }
        }
      />
      <BillingBackdrop variant={paid ? "change" : "deploy"} />
      <BillingContent>
        <BillingTitle {...copy} />
        <ul className="flex flex-wrap items-stretch justify-center gap-5 pt-10">
          {view.plans.map((plan) => (
            <TierCard key={plan.code} plan={plan} view={view} />
          ))}
        </ul>
      </BillingContent>
    </BillingScreen>
  );
}

const isPaid = (code: BillingPlan["code"]): code is PaidPlanCode => code !== "FREE_TRIAL";

const CARD = cn(
  "flex h-[410px] w-[300px] shrink-0 flex-col gap-5 rounded-[20px] border px-6 pt-6 pb-7 shadow-plan-card",
  PLAN_CARD_MOTION,
);

function CardLabel({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", className)}>{children}</span>;
}

function modeFor(plan: PaidPlanCode, view: PlansData): PlanMode {
  if (view.variant !== "change") return "subscribe";
  return plan === view.currentPlan ? "renew" : "change";
}

function TierCard({ plan, view }: { plan: BillingPlan; view: PlansData }) {
  if (!isPaid(plan.code)) return <TrialCard plan={plan} daysLeft={view.daysLeft} />;

  const code = plan.code;
  const mode = modeFor(code, view);
  const current = mode === "renew";
  const theme = TIER_THEME[code];
  const popular = plan.popular && !current;

  return (
    <li
      className={cn(
        CARD,
        "bg-linear-to-b from-0% to-white to-60%",
        theme.card,
        theme.hover,
        code === "PRO" && "border-[1.5px]",
        current && theme.current.card,
      )}
    >
      <div className="flex h-[26px] items-center justify-between">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold tracking-[0.72px] uppercase", theme.pill)}>
          {plan.name}
        </span>
        {current && <CardLabel className={theme.current.pill}>Current plan</CardLabel>}
        {popular && <CardLabel className="bg-tier-pro-accent text-primary-foreground">Most popular</CardLabel>}
      </div>
      <p className={cn("flex items-baseline gap-1 font-heading text-[38px] leading-[46px] font-bold", theme.price)}>
        {formatPrice(plan.monthlyPrice, "USD")}
        <span className="font-sans text-base font-normal text-muted-foreground">/mo</span>
      </p>
      <hr className={cn("h-px border-0", theme.divider)} />
      <ChoosePlanButton
        plan={code}
        planName={plan.name}
        price={plan.monthlyPrice}
        mode={mode}
        from={view.from}
        forWebsite={view.websiteId ?? undefined}
        label={current ? `Renew ${plan.name}` : `Choose ${plan.name}`}
        className={cn("h-[46px] w-full rounded-3xl text-[15px] font-medium text-primary-foreground", theme.cta)}
      />
      <ul className="flex flex-col gap-3.5">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-2.5 text-[15px] text-foreground">
            <PlanFeatureGlyph icon={feature.icon} className={theme.icon} />
            {feature.text}
          </li>
        ))}
      </ul>
    </li>
  );
}

function TrialCard({ plan, daysLeft }: { plan: BillingPlan; daysLeft: number }) {
  return (
    <li
      className={cn(
        CARD,
        "border-primary bg-linear-[126deg] from-primary-soft from-0% to-white to-71%",
        "hover:shadow-[0_22px_40px_-14px_rgb(47_107_196/0.32)]",
      )}
    >
      <div className="flex h-[26px] items-center justify-between">
        <span className="rounded-full border border-primary/35 bg-primary-soft px-2.5 py-1 text-xs font-bold tracking-[0.72px] text-primary uppercase">
          {plan.name}
        </span>
        <CardLabel className="bg-primary/14 text-primary">Current plan</CardLabel>
      </div>
      <p className="font-heading text-[38px] leading-[46px] font-bold text-primary">$0</p>
      <hr className="h-px border-0 bg-primary/15" />
      <div className="flex h-[46px] w-full items-center justify-center rounded-3xl bg-slate-soft text-[15px] font-medium text-slate">
        {daysLabel(daysLeft)} left
      </div>
      <ul className="flex flex-col gap-3.5">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-2.5 text-[15px] text-foreground">
            <PlanFeatureGlyph icon={feature.icon} className="text-primary" />
            {feature.text}
          </li>
        ))}
      </ul>
    </li>
  );
}
