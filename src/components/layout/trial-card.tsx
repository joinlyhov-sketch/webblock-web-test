import Link from "next/link";
import type { PlanCode, SidebarSummary } from "@/features/account";
import { formatDayMonth } from "@/lib/format";

/** Colours of the sidebar plan card per plan (Figma "Settings · Billing"): blue trial/Plus, gold Pro, violet Ultra. */
const THEME: Record<
  PlanCode,
  { card: string; dot: string; pill: string; bar: string; cta: string }
> = {
  FREE_TRIAL: {
    card: "border-violet-border from-trial-from",
    dot: "bg-brand-strong",
    pill: "text-brand-strong",
    bar: "bg-brand",
    cta: "bg-brand shadow-[0_6px_8px_rgb(47_107_196/0.35),inset_0_1px_0_rgb(219_234_254/0.15)] hover:bg-brand-strong",
  },
  PLUS: {
    card: "border-tier-plus-border from-tier-plus-from",
    dot: "bg-tier-plus",
    pill: "text-tier-plus",
    bar: "bg-brand",
    cta: "bg-brand shadow-[0_6px_8px_rgb(47_107_196/0.35),inset_0_1px_0_rgb(219_234_254/0.15)] hover:bg-brand-strong",
  },
  PRO: {
    card: "border-tier-pro-border from-tier-pro-from",
    dot: "bg-tier-pro-accent",
    pill: "text-tier-pro",
    bar: "bg-tier-pro-accent",
    cta: "bg-tier-pro-accent shadow-[0_6px_8px_rgb(179_131_42/0.35),inset_0_1px_0_rgb(255_255_255/0.2)] hover:brightness-95",
  },
  ULTRA: {
    card: "border-tier-ultra-border from-tier-ultra-from",
    dot: "bg-tier-ultra-cta",
    pill: "text-tier-ultra",
    bar: "bg-tier-ultra-cta",
    cta: "bg-tier-ultra-cta shadow-[0_6px_8px_rgb(109_63_214/0.35),inset_0_1px_0_rgb(255_255_255/0.2)] hover:brightness-95",
  },
};

/** Plan reminder at the bottom of the user sidebar. It takes the colours of the user's plan. */
export function TrialCard({ summary }: { summary: SidebarSummary }) {
  const theme = THEME[summary.plan];
  const trial = summary.plan === "FREE_TRIAL";
  const title = cardTitle(summary, trial);

  return (
    <section
      aria-label="Your plan"
      className={`overflow-hidden rounded-2xl border bg-linear-[165deg] from-8% to-background to-92% p-4 ${theme.card}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-[26px] items-center gap-1.5 rounded-full bg-background px-2.5 text-xs font-semibold ${theme.pill}`}
        >
          <span aria-hidden className={`size-1.5 rounded-[3px] ${theme.dot}`} />
          {summary.planLabel}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {summary.renewsAt
            ? `Renews ${formatDayMonth(summary.renewsAt)}`
            : `${summary.daysLeft} ${summary.daysLeft === 1 ? "day" : "days"} left`}
        </span>
      </div>
      <p className="pt-3 text-[15px] leading-[22.5px] font-semibold text-foreground">
        {title}
      </p>
      <div className="pt-3 pb-3.5">
        <div
          role="progressbar"
          aria-label={trial ? "Trial progress" : "Billing period progress"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.progress}
          className="h-2 overflow-hidden rounded-full bg-background"
        >
          <div
            className={`h-2 rounded-full ${theme.bar}`}
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>
      <Link
        href="/billing/plans"
        className={`flex h-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground outline-none transition-[background-color,filter] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 ${theme.cta}`}
      >
        View plans
      </Link>
    </section>
  );
}

/**
 * One plan covers all the account's websites: with one site online it names it, with several it
 * counts them against the plan's limit ("2 of 3 websites live on Pro").
 */
function cardTitle(summary: SidebarSummary, trial: boolean): string {
  const on = trial ? "trial" : summary.planLabel;
  if (summary.liveWebsiteCount > 1) {
    return `${summary.liveWebsiteCount} of ${summary.websiteLimit} websites live on ${on}`;
  }
  if (summary.liveWebsiteName) return `${summary.liveWebsiteName} is live on ${on}`;
  return trial ? "Your trial is running" : `Your ${summary.planLabel} plan is active`;
}
