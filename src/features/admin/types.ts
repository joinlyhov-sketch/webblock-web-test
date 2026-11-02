// Admin Portal entities, same shape as the Spring API responses (camelCase, UUID ids,
// prices as decimal strings, ISO-8601 UTC dates).

export type PlanCode = "FREE_TRIAL" | "PLUS" | "PRO" | "ULTRA";

export type AccountStatus = "ACTIVE" | "SUSPENDED";

export type SignInMethod = "EMAIL" | "GOOGLE";

export type UserAccount = {
  id: string;
  /** Human-readable account number shown to admins, e.g. "usr_0b7f21". */
  accountCode: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  plan: PlanCode;
  status: AccountStatus;
  signInMethod: SignInMethod;
  websiteCount: number;
  joinedAt: string;
};

export type UserStats = {
  totalAccounts: number;
  onFreeTrial: number;
  paying: number;
  liveWebsites: number;
};

/** Whether the site is reachable. Owned by the backend (hosting + billing state). */
export type SiteStatus =
  "ONLINE" | "NOT_DEPLOYED" | "OFFLINE_BILLING" | "SUSPENDED";

/** Result of the latest deploy. */
export type ReleaseStatus = "LIVE" | "GOING_LIVE" | "FAILED";

/** A deploy's result. REPLACED = it was live until a newer deploy went live. */
export type DeployStatus = ReleaseStatus | "REPLACED";

/** STABLE = traffic confirmed on the live release; UPDATING = switching to a new release. */
export type RoutingStatus = "STABLE" | "UPDATING";

export type AdminWebsite = {
  id: string;
  name: string;
  domain: string;
  thumbnailUrl: string | null;
  /** Logo the owner set in Business information; `null` when none. Filled by the API. */
  logoUrl?: string | null;
  /** Slug of the template the site was built from (its default logo shows without an uploaded one). */
  templateSlug?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatarUrl: string | null;
  siteStatus: SiteStatus;
  /** null when the website was never deployed. */
  releaseStatus: ReleaseStatus | null;
  routingStatus: RoutingStatus;
  lastDeployAt: string | null;
  /** Release currently served to visitors, e.g. "R-2915". */
  liveRelease: string | null;
  plan: PlanCode;
  planEndsAt: string;
  productCount: number;
  productLimit: number;
  redeploysLeft: number;
  /** Redeploys included per month on the plan. */
  redeployLimit: number;
  sslValidUntil: string | null;
};

export type Deploy = {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteThumbnailUrl: string | null;
  /** Logo the owner set in Business information; `null` when none. Filled by the API. */
  websiteLogoUrl?: string | null;
  /** Template the site was built from (its default logo shows without an uploaded one). */
  websiteTemplateSlug?: string;
  ownerName: string;
  number: number;
  status: DeployStatus;
  /** Pipeline step while GOING_LIVE, e.g. 4 of 5 "Provision & deploy". */
  currentStep: number | null;
  totalSteps: number;
  stepLabel: string | null;
  startedAt: string;
  durationSeconds: number | null;
};

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "CANCELED" | "EXPIRED";

export type Subscription = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  websiteId: string;
  websiteName: string;
  websiteDomain: string;
  plan: PlanCode;
  status: SubscriptionStatus;
  startAt: string;
  endAt: string;
  redeploysLeft: number;
  redeployLimit: number;
};

export type SubscriptionStats = {
  monthlyRevenue: string;
  activePlans: number;
  trialsEndingSoon: number;
  pending: number;
};

export type PaymentStatus = "PAID" | "FAILED";

export type Payment = {
  id: string;
  subscriptionId: string;
  plan: PlanCode;
  /** First day of the billed month. */
  periodStart: string;
  amount: string;
  status: PaymentStatus;
  createdAt: string;
};

export type Plan = {
  id: string;
  code: PlanCode;
  name: string;
  priceMonthly: string;
  /** Only the free trial has a duration. */
  trialDays: number | null;
  websiteLimit: number;
  redeploysPerMonth: number;
  productLimit: number;
  monitoring: string;
  subscriberCount: number;
  mostPopular: boolean;
};

export type PlanInput = {
  priceMonthly: string;
  websiteLimit: number;
  redeploysPerMonth: number;
  productLimit: number;
  monitoring: string;
};

export type AttentionKind =
  "FAILED_DEPLOYS" | "PLAN_EXPIRED" | "PAYMENTS_PAST_DUE" | "TRIALS_ENDING";

export type AttentionItem = {
  kind: AttentionKind;
  count: number;
  /** Most recent example, e.g. the latest failed website. */
  latestName: string | null;
  latestAt: string | null;
  /** Owner of the latest example, e.g. "Sreyleak Chan". */
  latestOwnerName: string | null;
  /** Payments past due only: total amount at risk. */
  amountAtRisk: string | null;
  /** Payments past due only: days until the backend retries the latest payment. */
  retryInDays: number | null;
};

export type AdminOverview = {
  newAccounts: number;
  websitesPublished: number;
  monthlyRevenue: string;
  failedDeploys: number;
  /** Last 12 months, oldest first. `month` is the first day of the month. */
  revenueByMonth: { month: string; amount: string }[];
  attention: AttentionItem[];
};

/** The signed-in admin's own account (header "Admin profile"). */
export type AdminProfile = {
  id: string;
  /** Human-readable account number, e.g. "ADM-000001". */
  accountCode: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  /** Role shown under the name, e.g. "WebBlock Admin". */
  title: string;
  joinedAt: string;
};

/** What happened. Decides the colour of the dot on the avatar. */
export type NotificationKind =
  | "DEPLOY_FAILED"
  | "PLAN_EXPIRED"
  | "PAYMENT_PAST_DUE"
  | "TRIAL_ENDING"
  | "TRIAL_STARTED"
  | "REDEPLOY_REQUESTED"
  | "ACCOUNT_CREATED"
  | "PLAN_UPGRADED";

export type AdminNotification = {
  id: string;
  kind: NotificationKind;
  /** The user the event is about. */
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  message: string;
  /** Admin page to open, e.g. "/admin/websites?website=<id>". */
  link: string | null;
  createdAt: string;
  /** null while unread. */
  readAt: string | null;
};

export type NotificationFilters = { unread?: boolean };

export type UserFilters = { q?: string; plan?: PlanCode };

export type WebsiteFilters = {
  q?: string;
  release?: ReleaseStatus;
  plan?: PlanCode;
  ownerId?: string;
};

export type SubscriptionFilters = {
  q?: string;
  status?: SubscriptionStatus;
  plan?: PlanCode;
};
