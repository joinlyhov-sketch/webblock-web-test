import type { PlanCode } from "@/features/account/types";

/** Colours of each plan tier on the plans and payment screens. Tokens live in globals.css. */
export type TierTheme = {
  /** Gradient + border of the card. */
  card: string;
  /** Name pill ("PLUS"). */
  pill: string;
  /** Price number. */
  price: string;
  /** Divider under the price. */
  divider: string;
  /**
   * Full-width CTA button. Sets every state (hover, pressed, focus ring, shadow) in the tier colour:
   * otherwise the base `primary` Button's blue shows through when pressed.
   */
  cta: string;
  /** Current-plan treatment: border and "Current plan" label. */
  current: { card: string; pill: string };
  /** Feature icon colour. */
  icon: string;
  /** Hover/focus emphasis of the card (with `PLAN_CARD_MOTION`): tier-coloured border and glow. */
  hover: string;
};

/**
 * Plan card hover: it lifts a little and glows in its tier colour, so the card under the pointer
 * (or holding keyboard focus) is clearly the one being considered. Reduced motion keeps the glow only.
 */
export const PLAN_CARD_MOTION =
  "transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1.5 motion-safe:focus-within:-translate-y-1.5";

export const TIER_THEME: Record<Exclude<PlanCode, "FREE_TRIAL">, TierTheme> = {
  PLUS: {
    card: "border-tier-plus-border from-tier-plus-from",
    pill: "bg-tier-plus-soft text-tier-plus",
    price: "text-tier-plus",
    divider: "bg-border",
    cta: "bg-linear-[172deg] from-tier-plus-cta from-0% to-tier-plus to-71% hover:brightness-95 active:brightness-90",
    current: {
      card: "border-2 border-primary",
      pill: "bg-primary/14 text-primary",
    },
    icon: "text-primary",
    hover:
      "hover:border-tier-plus-cta focus-within:border-tier-plus-cta hover:shadow-[0_22px_40px_-14px_rgb(47_107_196/0.32)] focus-within:shadow-[0_22px_40px_-14px_rgb(47_107_196/0.32)]",
  },
  PRO: {
    card: "border-tier-pro-border from-tier-pro-from",
    pill: "bg-tier-pro-soft text-tier-pro",
    price: "text-tier-pro",
    divider: "bg-tier-pro-soft",
    cta: "bg-tier-pro-accent hover:bg-tier-pro-accent active:bg-tier-pro-accent hover:brightness-95 active:brightness-90 hover:shadow-[0_6px_14px_rgb(179_131_42/0.35)] focus-visible:ring-tier-pro-accent/40",
    current: {
      card: "border-2 border-tier-pro-accent",
      pill: "bg-tier-pro-accent/14 text-tier-pro-accent",
    },
    icon: "text-tier-pro-accent",
    hover:
      "hover:border-tier-pro-accent focus-within:border-tier-pro-accent hover:shadow-[0_22px_40px_-14px_rgb(179_131_42/0.36)] focus-within:shadow-[0_22px_40px_-14px_rgb(179_131_42/0.36)]",
  },
  ULTRA: {
    card: "border-tier-ultra-border from-tier-ultra-from",
    pill: "bg-tier-ultra-soft text-tier-ultra",
    price: "text-tier-ultra",
    divider: "bg-border",
    cta: "bg-tier-ultra-cta hover:bg-tier-ultra-cta active:bg-tier-ultra-cta hover:brightness-95 active:brightness-90 hover:shadow-[0_6px_14px_rgb(109_63_214/0.35)] focus-visible:ring-tier-ultra-cta/40",
    current: {
      card: "border-2 border-tier-ultra-cta",
      pill: "bg-tier-ultra-cta/14 text-tier-ultra-cta",
    },
    icon: "text-tier-ultra-cta",
    hover:
      "hover:border-tier-ultra-cta focus-within:border-tier-ultra-cta hover:shadow-[0_22px_40px_-14px_rgb(109_63_214/0.32)] focus-within:shadow-[0_22px_40px_-14px_rgb(109_63_214/0.32)]",
  },
};
