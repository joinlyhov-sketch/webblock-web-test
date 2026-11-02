import type { PlanCode } from "../types";

// Plan colours from the Figma pricing cards, shared by the plan cards and the "Edit plan" popup.

/** Card / popup surface: plan-tinted top fading to white, with the plan's border. */
export const PLAN_SURFACE = {
  FREE_TRIAL:
    "border-primary bg-linear-to-b from-primary-soft/70 to-background",
  PLUS: "border-border bg-linear-to-b from-primary-soft to-background",
  PRO: "border-gold-strong/60 bg-linear-to-b from-gold-soft to-background",
  ULTRA: "border-border bg-linear-to-b from-violet-soft to-background",
} satisfies Record<PlanCode, string>;

/** Plan label: outlined for the free trial, soft tint for paid plans (no dot). */
export const PLAN_LABEL = {
  FREE_TRIAL: "bg-background text-primary ring-1 ring-primary/50",
  PLUS: "bg-brand-soft text-brand-strong",
  PRO: "bg-gold-strong/15 text-gold",
  ULTRA: "bg-violet/12 text-violet",
} satisfies Record<PlanCode, string>;
