import Link from "next/link";
import { Card, Refresh2 } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { formatDayMonthYear, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillingView as BillingData } from "../service";
import type { PlanCode, Subscription } from "../types";
import { BillingCard, CardHeader } from "./billing-card";
import { BillingHistory } from "./billing-history";
import { PLAN_TONE, TONE_STYLE, type ToneStyle } from "./plan-tone";
import { PlanDetailsCard } from "./plan-details-card";

/** Panel colours of the "Current plan" card: Free trial is pale, paid plans are filled. */
const PLAN_PANEL: Record<PlanCode, { panel: string; text: string; sub: string }> = {
  FREE_TRIAL: {
    panel:
      "border-primary bg-linear-[158.56deg,var(--color-primary-soft)_0%,var(--color-background)_71.429%]",
    text: "text-primary",
    sub: "text-primary/85",
  },
  PLUS: {
    panel: "border-transparent bg-linear-to-br from-logo-from to-logo-to",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/85",
  },
  PRO: {
    panel: "border-0 bg-(image:--image-plan-panel-pro)",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/82",
  },
  ULTRA: {
    panel: "border-0 bg-(image:--image-plan-panel-ultra)",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/82",
  },
};

/** Settings → Billing: current plan, plan actions, usage, then billing history. */
export function BillingView({ data }: { data: BillingData }) {
  const { subscription, daysLeft } = data;
  const paid = subscription.renewsAt !== null;
  const endDate = formatDayMonthYear(subscription.renewsAt ?? subscription.trialEndsAt);
  const tone = TONE_STYLE[PLAN_TONE[subscription.plan]];

  return (
    <div data-fit-viewport className="flex min-h-0 flex-1 flex-col gap-[15px]">
      <div className="grid gap-[15px] xl:grid-cols-[465px_minmax(0,1fr)_minmax(0,1fr)] xl:grid-rows-[202px]">
        <CurrentPlanCard subscription={subscription} endDate={endDate} />

        <BillingCard className="justify-between">
          <div className="flex flex-col gap-3">
            <CardHeader
              tone="soft"
              icon={<Refresh2 />}
              title={paid ? "Renew plan" : "Choose a plan"}
              description={paid ? `Renews on ${endDate}` : `Trial ends on ${endDate}`}
              action={<DaysRing daysLeft={daysLeft} totalDays={data.periodDays} ring={tone.ring} />}
            />
            <p className="text-[13px] text-muted-foreground">
              {paid
                ? "Renew early to keep your websites online without a break."
                : data.websiteName
                  ? `Pick a plan to keep ${data.websiteName} online after your trial.`
                  : "Pick a plan to keep your websites online after your trial."}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-px">
              <p className="text-xs text-placeholder">{paid ? "Next charge" : "Plans from"}</p>
              <p className="text-sm font-semibold">
                {paid
                  ? `${formatPrice(subscription.monthlyPrice ?? "0", "USD")} · KHQR`
                  : `${formatPrice(subscription.startingPrice, "USD")} / month`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {paid && (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/billing/plans?from=settings">Change plan</Link>
                </Button>
              )}
              <Button asChild size="sm" className={tone.button}>
                <Link href="/billing/plans?from=settings">{paid ? "Renew now" : "Choose plan"}</Link>
              </Button>
            </div>
          </div>
        </BillingCard>

        <PlanDetailsCard subscription={subscription} daysLeft={daysLeft} />
      </div>

      <BillingHistory orders={data.orders} planOptions={data.planOptions} initialFilter={data.initialFilter} />
    </div>
  );
}

function CurrentPlanCard({ subscription, endDate }: { subscription: Subscription; endDate: string }) {
  const theme = PLAN_PANEL[subscription.plan];
  const trial = subscription.plan === "FREE_TRIAL";
  // Pro (gold) and Ultra (violet) have the metallic panel with a white shimmer.
  const shimmer = subscription.plan === "PRO" || subscription.plan === "ULTRA";

  return (
    <BillingCard className="items-stretch justify-center">
      <div
        className={cn(
          "relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] border-[1.5px] px-[26px] py-[22px]",
          theme.panel,
        )}
      >
        {trial ? (
          <>
            <div
              aria-hidden
              className="absolute -top-[1.5px] -left-[1.5px] h-[1000px] w-[1728px] bg-[url('/images/settings/dot-grid.svg')] bg-no-repeat"
            />
            <div
              aria-hidden
              className="absolute top-[-71.5px] left-[268.5px] size-[220px] bg-[url('/images/settings/glow-a.svg')]"
            />
            <div
              aria-hidden
              className="absolute top-[88.5px] left-[328.5px] size-[140px] bg-[url('/images/settings/glow-b.svg')]"
            />
          </>
        ) : shimmer ? (
          <PlanShimmer />
        ) : (
          <>
            <div aria-hidden className="absolute top-[-71.5px] left-[268.5px] size-[220px] rounded-full bg-primary-foreground/10" />
            <div aria-hidden className="absolute top-[88.5px] left-[328.5px] size-[140px] rounded-full bg-primary-foreground/10" />
          </>
        )}
        <p className={cn("relative flex items-center gap-2 font-heading text-[17px] font-semibold", theme.text)}>
          {shimmer ? (
            <span aria-hidden className="size-[18px] bg-[url('/images/settings/plan-card-icon.svg')] bg-contain bg-no-repeat" />
          ) : (
            <Card aria-hidden className="size-[18px]" />
          )}{" "}
          Current plan
        </p>
        <div className="relative flex flex-col gap-0.5">
          <p className={cn("font-heading text-[38px] leading-[44px] font-semibold", theme.text)}>
            {subscription.planName}
          </p>
          <p className={cn("text-sm", theme.sub)}>
            {trial ? "Ends on" : "Renews on"} {endDate}
          </p>
        </div>
      </div>
    </BillingCard>
  );
}

const SPARKLES = [
  { file: "a", inset: "inset-[17.05%_30.52%_80.57%_68.34%]", overflow: "inset-[-209.57%_-172.36%]" },
  { file: "b", inset: "inset-[14.77%_10.71%_83.31%_88.38%]", overflow: "inset-[-260.69%_-215.44%]" },
  { file: "a", inset: "inset-[79.55%_6.61%_18.07%_92.25%]", overflow: "inset-[-209.57%_-172.36%]" },
  { file: "c", inset: "inset-[51.14%_3.65%_47.42%_95.67%]", overflow: "inset-[-345.9%_-287.26%]" },
] as const;

const SPARKLE_IMAGE = {
  a: "bg-[url('/images/settings/plan-sparkle-a.svg')]",
  b: "bg-[url('/images/settings/plan-sparkle-b.svg')]",
  c: "bg-[url('/images/settings/plan-sparkle-c.svg')]",
} as const;

/** The white details on the Pro and Ultra panels: dot grid, two glows, a soft diagonal sheen and four sparkles. */
function PlanShimmer() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute top-0 left-0 h-[320px] w-[440px] bg-[url('/images/settings/plan-dot-grid.svg')] bg-no-repeat" />
      <div className="absolute top-[70px] left-[260px] size-[240px] bg-[url('/images/settings/plan-glow-a.svg')] bg-contain" />
      <div className="absolute top-[-60px] left-[340px] size-[140px] bg-[url('/images/settings/plan-glow-b.svg')] bg-contain" />
      <div className="absolute top-[-103.8px] left-[193.32px] flex h-[362.34px] w-[228.126px] items-center justify-center">
        <div className="h-[380.6px] w-[56px] flex-none rotate-28 bg-linear-to-r from-primary-foreground/0 via-primary-foreground/85 via-50% to-primary-foreground/0 opacity-18 blur-[5px]" />
      </div>
      {SPARKLES.map((sparkle) => (
        <span key={sparkle.inset} className={cn("absolute", sparkle.inset)}>
          <span className={cn("absolute bg-size-[100%_100%] bg-no-repeat", sparkle.overflow, SPARKLE_IMAGE[sparkle.file])} />
        </span>
      ))}
    </div>
  );
}

/** Circular countdown (60px): the arc shows how much of the period is left. */
function DaysRing({ daysLeft, totalDays, ring }: { daysLeft: number; totalDays: number; ring: ToneStyle["ring"] }) {
  const radius = 27.9;
  const circumference = 2 * Math.PI * radius;
  const left = Math.min(1, Math.max(0, daysLeft / totalDays));

  return (
    <div role="img" aria-label={`${daysLeft} days left`} className="relative size-[60px] shrink-0">
      <svg viewBox="0 0 60 60" aria-hidden className="size-full -rotate-90">
        <defs>
          <linearGradient id="days-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={ring.from} />
            <stop offset="0.5" stopColor={ring.mid} />
            <stop offset="1" stopColor={ring.to} />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r={radius} fill="none" strokeWidth="4.2" stroke={ring.to} strokeOpacity="0.14" />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          strokeWidth="4.2"
          stroke="url(#days-ring)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - left)}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-lg leading-none font-semibold">{daysLeft}</span>
        <span className="text-[9px] leading-[1.3] font-medium text-muted-foreground">days left</span>
      </span>
    </div>
  );
}
