import type { ProgressTone } from "@/components/ui/progress";
import type { PlanCode } from "../types";

/** Free trial and Plus use the brand blue, Pro is gold and Ultra is violet (Figma "Settings · Billing"). */
export const PLAN_TONE: Record<PlanCode, ProgressTone> = {
  FREE_TRIAL: "brand",
  PLUS: "brand",
  PRO: "gold",
  ULTRA: "violet",
};

export type ToneStyle = {
  /** Icon tile of the Plan details card. */
  tile: string;
  /** Primary action ("Renew now", "Change plan"). */
  button: string;
  /** Plan badge at the top of the plan dialog. */
  badge: string;
  /** The days-left ring: gradient stops (CSS colours). */
  ring: { from: string; mid: string; to: string };
};

export const TONE_STYLE: Record<ProgressTone, ToneStyle> = {
  brand: {
    tile: "bg-primary/16 text-brand",
    button: "bg-primary hover:bg-brand-strong",
    badge:
      "bg-linear-[160.66deg,var(--color-plan-from)_0%,var(--color-plan-to)_71.429%]",
    ring: {
      from: "var(--color-usage-from)",
      mid: "var(--color-violet-border)",
      to: "var(--color-primary)",
    },
  },
  gold: {
    tile: "bg-tier-pro-accent/16 text-tier-pro-accent",
    button: "bg-tier-pro-accent hover:bg-tier-pro-accent hover:brightness-95",
    badge: "bg-linear-to-br from-pro-from to-pro-to",
    ring: {
      from: "var(--color-tier-pro)",
      mid: "var(--color-tier-pro-border)",
      to: "var(--color-tier-pro-accent)",
    },
  },
  violet: {
    tile: "bg-tier-ultra-cta/16 text-tier-ultra-cta",
    button: "bg-tier-ultra-cta hover:bg-tier-ultra-cta hover:brightness-95",
    badge: "bg-linear-to-br from-ultra-from to-ultra-to",
    ring: {
      from: "var(--color-tier-ultra)",
      mid: "var(--color-tier-ultra-border)",
      to: "var(--color-tier-ultra-cta)",
    },
  },
};
