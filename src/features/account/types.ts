export type PlanCode = "FREE_TRIAL" | "PLUS" | "PRO" | "ULTRA";

export type Profile = {
  id: string;
  fullName: string;
  /** Two letters shown when there is no photo, e.g. "SV". */
  initials: string;
  email: string;
  avatarUrl: string | null;
  plan: PlanCode;
  memberSince: string;
  lastSignInAt: string;
  hasPassword: boolean;
  /** Email of the connected Google account, or `null` when not connected. */
  googleEmail: string | null;
};

/** The part of the profile the sidebar and the profile card show. Actions return it after a change. */
export type ProfileIdentity = Pick<Profile, "fullName" | "initials" | "avatarUrl">;

export type UsageMetric = {
  key: string;
  /** Name in the plan dialog, e.g. "Websites". */
  label: string;
  /** Shorter name in the plan card, e.g. "Website". */
  cardLabel: string;
  used: number;
  limit: number;
};

export type Subscription = {
  plan: PlanCode;
  planName: string;
  trialStartsAt: string;
  trialEndsAt: string;
  trialDays: number;
  /** Next renewal date of a paid plan, or `null` on the free trial. */
  renewsAt: string | null;
  /** Monthly price of this plan as a decimal string, or `null` on the free trial. */
  monthlyPrice: string | null;
  /** Lowest monthly price of a paid plan, as a decimal string. */
  startingPrice: string;
  usage: UsageMetric[];
  includes: string[];
};

/**
 * Whether the user may deploy a website right now (GET /me/deploy-access?projectId=).
 * The backend decides; the screens only show the answer.
 * - FIRST_FREE_DEPLOY: free trial, the one deploy that costs nothing.
 * - WITHIN_PLAN: paid plan with room left in its limits.
 * - SUBSCRIPTION_REQUIRED: free trial already used its deploy: pick a plan.
 * - PLAN_EXPIRED: a paid plan that was not renewed: renew it.
 * - WEBSITE_LIMIT / REDEPLOY_LIMIT: the paid plan's website or monthly redeploy limit is reached.
 */
export type DeployReason =
  | "FIRST_FREE_DEPLOY"
  | "WITHIN_PLAN"
  | "SUBSCRIPTION_REQUIRED"
  | "PLAN_EXPIRED"
  | "WEBSITE_LIMIT"
  | "REDEPLOY_LIMIT";

export type DeployAccess = {
  allowed: boolean;
  reason: DeployReason;
  plan: PlanCode;
  planName: string;
  /** True when this website was never deployed, so the deploy would add a website. */
  firstDeploy: boolean;
};

export type OrderStatus = "PAID" | "EXPIRED";

export type PlanOrder = {
  id: string;
  plan: PlanCode;
  planName: string;
  /** Website the plan was bought for. */
  websiteName: string;
  /** "Monthly" and so on, shown under the plan name. */
  period: string | null;
  createdAt: string;
  amount: string;
  currency: "USD" | "KHR";
  status: OrderStatus;
};

export type SidebarSummary = {
  plan: PlanCode;
  planLabel: string;
  daysLeft: number;
  /** Next renewal date of a paid plan (ISO-8601 UTC), or `null` on the free trial. */
  renewsAt: string | null;
  /** 0–100, how much of the trial (free trial) or of the 30-day billing period (paid plan) has passed. */
  progress: number;
  /** Name of the website shown in the trial card, or `null` when the user has none live. */
  liveWebsiteName: string | null;
  /** How many of the user's websites are online on this plan. */
  liveWebsiteCount: number;
  /** How many websites the plan allows online at once (the free trial: 1). */
  websiteLimit: number;
};
