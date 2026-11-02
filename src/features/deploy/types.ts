// Same shape as the Spring API JSON. The backend owns the deploy pipeline; the screens only read it.
import type { DeployReason } from "@/features/account/types";

export type DeployStepKey = "BUILD" | "PRODUCTS" | "PACKAGE" | "LAUNCH" | "SSL" | "LIVE";

export type DeployStepStatus = "DONE" | "IN_PROGRESS" | "UP_NEXT" | "WAITING" | "FAILED" | "NOT_STARTED";

export type DeploymentStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

/** FIRST = the website's first deploy (its address is chosen), REDEPLOY = new changes on a live website. */
export type DeploymentKind = "FIRST" | "REDEPLOY";

export type DeploymentStep = {
  key: DeployStepKey;
  status: DeployStepStatus;
  /** How long a finished step took, or `null` while it has not finished. */
  seconds: number | null;
};

export type Deployment = {
  id: string;
  websiteId: string;
  kind: DeploymentKind;
  status: DeploymentStatus;
  /** 0–100. */
  percent: number;
  /** Rough time left while RUNNING, `null` otherwise. */
  secondsLeft: number | null;
  /** Public host the site goes live on, e.g. "petalandstem.webblock.com". */
  domain: string;
  steps: DeploymentStep[];
  startedAt: string;
  finishedAt: string | null;
};

export type DomainCheck = {
  /** What the owner typed, lower-cased and trimmed. */
  name: string;
  host: string;
  available: boolean;
  /** Why it can't be used, or `null` when it is available. */
  problem: string | null;
};

export type StartDeploymentBody = {
  idempotencyKey: string;
  /** The chosen address for a first deploy; `null` for a redeploy. */
  subdomain: string | null;
};

/** Where the owner goes after pressing Deploy. */
export type DeployNext =
  | { next: "PLANS"; reason?: DeployReason }
  | { next: "CHOOSE_DOMAIN" }
  | { next: "PROGRESS"; deploymentId: string; kind: DeploymentKind };
