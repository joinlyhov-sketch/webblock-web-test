import { cn } from "@/lib/utils";

/** Subscription plans. Same values as the API's plan code. */
export type PlanTier = "FREE_TRIAL" | "PLUS" | "PRO" | "ULTRA";

type PlanMeta = { label: string; badge: string; dot: string };

const PLAN = {
  FREE_TRIAL: {
    label: "Free trial",
    badge: "bg-neutral-soft text-muted-foreground",
    dot: "bg-placeholder",
  },
  PLUS: {
    label: "Plus",
    badge: "bg-primary-soft text-brand-strong",
    dot: "bg-primary",
  },
  PRO: { label: "Pro", badge: "bg-gold-soft text-gold", dot: "bg-gold-strong" },
  ULTRA: {
    label: "Ultra",
    badge: "bg-violet-soft text-violet",
    dot: "bg-violet",
  },
} satisfies Record<PlanTier, PlanMeta>;

/** Plan colours from the pricing cards: soft surface, icon chip and text, per plan. */
const PLAN_TONE = {
  FREE_TRIAL: {
    surface: "bg-primary-soft ring-1 ring-primary/40",
    chip: "bg-background text-primary",
    text: "text-primary",
  },
  PLUS: {
    surface: "bg-primary-soft",
    chip: "bg-brand text-primary-foreground",
    text: "text-brand-strong",
  },
  PRO: {
    surface: "bg-gold-soft ring-1 ring-gold-strong/40",
    chip: "bg-gold-strong text-primary-foreground",
    text: "text-gold",
  },
  ULTRA: {
    surface: "bg-violet-soft",
    chip: "bg-violet text-primary-foreground",
    text: "text-violet",
  },
} satisfies Record<PlanTier, { surface: string; chip: string; text: string }>;

/** Ring colour per plan, for the circle around a person's avatar. */
const PLAN_RING = {
  FREE_TRIAL: "ring-placeholder",
  PLUS: "ring-primary",
  PRO: "ring-gold-strong",
  ULTRA: "ring-violet",
} satisfies Record<PlanTier, string>;

/** Coloured circle around an avatar, with a white gap: `<Avatar className={planRing(plan)} />`. */
export function planRing(plan: PlanTier): string {
  return cn("ring-[1.5px] ring-offset-[1.5px] ring-offset-background", PLAN_RING[plan]);
}

/** Classes to colour anything by plan (tiles, cards): `<div className={planTone(plan).surface}>`. */
export function planTone(plan: PlanTier) {
  return PLAN_TONE[plan];
}

/** "Pro", "Free trial"… */
export function planLabel(plan: PlanTier): string {
  return PLAN[plan].label;
}

/** Plan pill with a coloured dot (Figma "Plan badge"). */
export function PlanBadge({
  plan,
  className,
  dot = true,
}: {
  plan: PlanTier;
  className?: string;
  /** false for the plan-card label style (no dot). */
  dot?: boolean;
}) {
  const meta = PLAN[plan];
  return (
    <span
      data-badge
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      {dot && (
        <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      )}
      {meta.label}
    </span>
  );
}
