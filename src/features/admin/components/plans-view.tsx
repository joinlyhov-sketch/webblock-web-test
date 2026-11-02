import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Box,
  Clock,
  DocumentText,
  Global,
  InfoCircle,
  Edit2,
  Send2,
  TickCircle,
} from "iconsax-reactjs";
import { Callout } from "@/components/common/callout";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatPriceShort } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import { PLAN_CARD_MOTION, TIER_THEME } from "@/features/billing";
import type { Plan } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { EditPlanDialog } from "./edit-plan-dialog";

// Same card as the user's "Choose a plan" screen (billing `TIER_THEME`), sized to the admin grid.
const CARD = cn(
  "flex flex-col gap-5 rounded-[20px] border px-6 pt-6 pb-7 shadow-plan-card",
  PLAN_CARD_MOTION,
);

const count = new Intl.NumberFormat("en-US");

type Feature = { icon: ReactNode; text: string };

/**
 * Card feature lines. Paid tiers after Plus start with "Everything in <previous>" and skip the
 * monitoring line when it is the same as the previous plan's.
 */
function features(plan: Plan, previous: Plan | undefined): Feature[] {
  const stacked = previous !== undefined && previous.code !== "FREE_TRIAL";
  const lines: (Feature | null)[] = [
    stacked
      ? { icon: <TickCircle />, text: `Everything in ${previous.name}` }
      : null,
    plan.trialDays
      ? { icon: <Clock />, text: `Free for ${plan.trialDays} days` }
      : null,
    {
      icon: <Global />,
      text:
        plan.websiteLimit === 1
          ? "1 website"
          : `Up to ${plan.websiteLimit} websites`,
    },
    {
      icon: <Send2 />,
      text: plan.redeploysPerMonth === 0 ? "First deploy only" : `${plan.redeploysPerMonth} redeploys a month`,
    },
    {
      icon: <Box />,
      text: `Up to ${count.format(plan.productLimit)} products`,
    },
    stacked && previous.monitoring === plan.monitoring
      ? null
      : plan.monitoring === "Logs"
        ? { icon: <DocumentText />, text: "Logs" }
        : { icon: <Activity />, text: plan.monitoring },
  ];
  return lines.filter((f) => f !== null);
}

export function PlansView({
  plans,
  searchParams,
  editing,
}: {
  plans: Page<Plan>;
  searchParams: SearchParams;
  /** The plan opened with `?edit=<planId>`. */
  editing: Plan | null;
}) {
  return (
    <>
      <AdminPageHeader
        title="Manage plans"
        description="Set the price and limits of each plan. They apply to every account on that plan."
      />

      <Link
        href="/admin/subscriptions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground-soft hover:text-primary"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All subscriptions
      </Link>

      <Callout
        className="mb-5"
        icon={<InfoCircle />}
        title="Changes apply to new subscriptions and renewals. Current subscribers keep their price until their next renewal. Billing stays monthly only."
      />

      {plans.items.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No plans are set up yet.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.items.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              previous={plans.items[index - 1]}
              searchParams={searchParams}
            />
          ))}
        </ul>
      )}

      {editing && (
        <EditPlanDialog
          key={editing.id}
          plan={editing}
          closeHref={tableHref(searchParams, { edit: null })}
        />
      )}
    </>
  );
}

function PlanCard({
  plan,
  previous,
  searchParams,
}: {
  plan: Plan;
  previous: Plan | undefined;
  searchParams: SearchParams;
}) {
  const theme = plan.code === "FREE_TRIAL" ? null : TIER_THEME[plan.code];
  const trial = theme === null;
  const editHref = tableHref(searchParams, { edit: plan.id });

  return (
    <li
      className={cn(
        CARD,
        trial
          ? "border-primary bg-linear-[126deg] from-primary-soft from-0% to-white to-71% hover:shadow-[0_22px_40px_-14px_rgb(47_107_196/0.32)]"
          : cn("bg-linear-to-b from-0% to-white to-60%", theme?.card, theme?.hover),
        plan.code === "PRO" && "border-[1.5px]",
      )}
    >
      <div className="flex h-[26px] items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[13px] font-bold tracking-[0.72px] uppercase",
            trial
              ? "border border-primary/35 bg-primary-soft text-primary"
              : theme?.pill,
          )}
        >
          {plan.name}
        </span>
        {plan.mostPopular && (
          <span className="rounded-full bg-tier-pro-accent px-2.5 py-1 text-[13px] font-medium text-primary-foreground">
            Most popular
          </span>
        )}
      </div>
      <div>
        <p
          className={cn(
            "flex items-baseline gap-1 font-heading text-[38px] leading-[46px] font-bold",
            trial ? "text-primary" : theme?.price,
          )}
        >
          {formatPriceShort(plan.priceMonthly, "USD")}
          {!trial && (
            <span className="font-sans text-base font-normal text-muted-foreground">
              /mo
            </span>
          )}
        </p>
        <p className="text-sm leading-[19.5px] text-muted-foreground">
          {plan.trialDays
            ? `${plan.trialDays}-day trial`
            : `${count.format(plan.subscriberCount)} subscribers`}
        </p>
      </div>
      <hr className={cn("h-px border-0", trial ? "bg-primary/15" : theme?.divider)} />
      <Button
        asChild
        className={cn(
          "h-[46px] w-full rounded-3xl text-[15px] font-medium text-primary-foreground",
          trial ? "bg-primary hover:bg-primary hover:brightness-95" : theme?.cta,
        )}
      >
        <Link href={editHref} scroll={false}>
          <Edit2 aria-hidden className="size-[18px]" />
          Edit plan
        </Link>
      </Button>
      <ul className="flex flex-col gap-3.5">
        {features(plan, previous).map((f) => (
          <li
            key={f.text}
            className="flex items-center gap-2.5 text-[15px] text-foreground"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center [&_svg]:size-[18px]",
                trial ? "text-primary" : theme?.icon,
              )}
            >
              {f.icon}
            </span>
            {f.text}
          </li>
        ))}
      </ul>
    </li>
  );
}
