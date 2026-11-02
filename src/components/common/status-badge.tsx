import type { ComponentType, ReactNode } from "react";
import {
  Danger,
  Edit2,
  Forbidden2,
  Global,
  InfoCircle,
  MinusCirlce,
  Refresh2,
  RotateLeft,
  Send2,
  TickCircle,
  Timer1,
  Clock,
  Wallet2,
} from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Every status the platform shows. Same names as the API enums, so a feature passes its
 * entity's status straight through: `<StatusBadge status={website.siteStatus} />`.
 */
export type Status =
  // Accounts and subscriptions
  | "ACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "CANCELED"
  | "EXPIRED"
  // Website hosting
  | "ONLINE"
  | "NOT_DEPLOYED"
  | "OFFLINE_BILLING"
  | "DRAFT"
  // Releases and deploys
  | "LIVE"
  | "GOING_LIVE"
  | "FAILED"
  | "REPLACED"
  // Routing
  | "STABLE"
  | "UPDATING"
  // Payments
  | "PAID"
  // Publish pipeline: generation request, release, steps
  | "QUEUED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "STUCK"
  | "NONE_YET"
  | "BUILDING"
  | "DEPLOYING"
  | "READY"
  | "ROLLED_BACK"
  | "DONE"
  | "RUNNING"
  | "WAITING"
  | "NOT_STARTED"
  // Admin actions
  | "SUCCEEDED"
  // Editor: changes not saved as a draft yet
  | "UNSAVED";

/** Old name of `Status`, kept so existing imports keep working. */
export type BadgeStatus = Status;

export type PillTone = "success" | "danger" | "info" | "warning" | "neutral" | "draft" | "brand";
type Tone = PillTone;

type StatusMeta = {
  label: string;
  tone: Tone;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean; variant?: "Outline" }>;
};

const STATUS = {
  ACTIVE: { label: "Active", tone: "success", icon: TickCircle },
  SUSPENDED: { label: "Suspended", tone: "danger", icon: Forbidden2 },
  PENDING: { label: "Pending", tone: "warning", icon: Clock },
  CANCELED: { label: "Canceled", tone: "danger", icon: Forbidden2 },
  EXPIRED: { label: "Expired", tone: "danger", icon: Timer1 },
  ONLINE: { label: "Online", tone: "success", icon: Global },
  NOT_DEPLOYED: { label: "Not deployed", tone: "info", icon: Edit2 },
  DRAFT: { label: "Draft", tone: "draft", icon: Edit2 },
  OFFLINE_BILLING: { label: "Offline · billing", tone: "danger", icon: Timer1 },
  LIVE: { label: "Live", tone: "success", icon: Global },
  GOING_LIVE: { label: "Going live", tone: "info", icon: Send2 },
  FAILED: { label: "Failed", tone: "danger", icon: Danger },
  REPLACED: { label: "Replaced", tone: "neutral", icon: RotateLeft },
  STABLE: { label: "Stable", tone: "success", icon: Global },
  UPDATING: { label: "Updating", tone: "info", icon: Refresh2 },
  PAID: { label: "Paid", tone: "success", icon: Wallet2 },
  QUEUED: { label: "Queued", tone: "draft", icon: Edit2 },
  PUBLISHING: { label: "Deploying", tone: "info", icon: Send2 },
  PUBLISHED: { label: "Deployed", tone: "success", icon: Global },
  STUCK: { label: "Stuck", tone: "warning", icon: Clock },
  NONE_YET: { label: "None yet", tone: "draft", icon: Edit2 },
  BUILDING: { label: "Building", tone: "info", icon: Send2 },
  DEPLOYING: { label: "Deploying", tone: "info", icon: Send2 },
  READY: { label: "Ready", tone: "warning", icon: Clock },
  ROLLED_BACK: { label: "Rolled back", tone: "danger", icon: Timer1 },
  DONE: { label: "Done", tone: "success", icon: TickCircle },
  RUNNING: { label: "Running", tone: "info", icon: Send2 },
  WAITING: { label: "Waiting", tone: "warning", icon: Clock },
  NOT_STARTED: { label: "Not started", tone: "neutral", icon: MinusCirlce },
  SUCCEEDED: { label: "Succeeded", tone: "success", icon: Global },
  UNSAVED: { label: "Unsaved changes", tone: "warning", icon: InfoCircle },
} satisfies Record<Status, StatusMeta>;

const TONE = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-neutral-soft text-muted-foreground",
  draft: "bg-info-soft text-foreground-soft",
  brand: "bg-brand-soft text-brand-strong",
} satisfies Record<Tone, string>;

/**
 * The one pill shape in the app (24px, light tint, optional icon). `StatusBadge` is a Pill per
 * status; use Pill directly for labels that aren't statuses ("Google sign-in", "Available").
 * `outline` is the eyebrow look above page titles.
 */
export function Pill({
  tone = "neutral",
  outline = false,
  icon,
  children,
  className,
}: {
  tone?: PillTone;
  outline?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-badge
      className={cn(
        "inline-flex h-6 items-center gap-[5px] rounded-full px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        outline ? "border border-eyebrow-border bg-primary-soft text-primary" : cn(TONE[tone], "shadow-button"),
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Pill with a light tint and an icon per status (Figma "Status badge"). `detail` adds " · 52 min". */
export function StatusBadge({
  status,
  detail,
  className,
}: {
  status: Status;
  detail?: string;
  className?: string;
}) {
  const meta: StatusMeta = STATUS[status];
  const Icon = meta.icon;
  return (
    <Pill tone={meta.tone} icon={<Icon variant="Outline" aria-hidden />} className={cn("px-2", className)}>
      {meta.label}
      {detail && <> · {detail}</>}
    </Pill>
  );
}

/** Plain-text label for a status, e.g. in detail lists. */
export function statusLabel(status: Status): string {
  return STATUS[status].label;
}
