// Admin Monitoring entities, same shape as the Spring API (camelCase, UUID ids, ISO-8601 UTC dates).
// The backend owns the publish pipeline and its retries; these types only describe what it reports.

/** Which part of the 7-step publish flow a website is in. */
export type PipelineStage = "REQUEST" | "GENERATION" | "RELEASE" | "LIVE";

/** The code-generation request (steps 1–3). */
export type RequestStatus =
  "QUEUED" | "PUBLISHING" | "PUBLISHED" | "STUCK" | "FAILED";

/** The release (steps 4–7). */
export type ReleaseState =
  | "NONE_YET"
  | "BUILDING"
  | "DEPLOYING"
  | "READY"
  | "LIVE"
  | "ROLLED_BACK"
  | "FAILED";

export type StepStatus =
  "DONE" | "RUNNING" | "FAILED" | "STUCK" | "WAITING" | "NOT_STARTED";

export type PipelineStep = {
  /** 1–7: Request received, Generate code, Save to Git, Build, Start privately, Go live, Live. */
  number: number;
  title: string;
  /** Short result line, e.g. "commit c81a3f2" or "waits: deploy cmd". */
  subtitle: string;
  status: StepStatus;
};

/** One labelled value in the current-step panel, e.g. Started "09:34". */
export type StepFact = {
  label: string;
  value: string;
  hint: string | null;
  tone: "default" | "danger" | "info";
};

export type CurrentStep = {
  /** Upper-case phase shown above the title, e.g. "PROVISIONING". */
  phase: string;
  title: string;
  status: StepStatus;
  /** Grey chips next to the status, e.g. "attempt 1 of 3", "rolled back 09:36". */
  tags: string[];
  facts: StepFact[];
  /** Pre-conditions the backend checked for this step, e.g. "Checks before queueing". */
  checkGroup: { title: string; checks: StepCheck[] } | null;
};

/** One pre-condition: passed (green tick), pending (numbered, waiting) or failed. */
export type StepCheck = {
  title: string;
  detail: string;
  status: "PASSED" | "PENDING" | "FAILED";
};

export type LogLevel = "INFO" | "WARN" | "ERROR";

export type LogLine = {
  id: string;
  at: string;
  level: LogLevel;
  method: string;
  path: string;
  /** Extra message, e.g. "page not found". */
  note: string | null;
  statusCode: number;
  durationMs: number;
};

export type LiveStats = {
  liveSince: string;
  release: string;
  previousRelease: string | null;
  requests5m: number;
  errors5m: number;
  /** Percent as a decimal string, e.g. "0.16". */
  errorRate5m: string;
  avgResponseMs: number;
  logCounts: Record<LogLevel, number>;
};

/** A website's latest publish, as shown on Pipeline & Generation. */
export type PipelineRun = {
  id: string;
  websiteId: string;
  websiteName: string;
  domain: string;
  /** The site's preview image; null until it has one. */
  thumbnailUrl: string | null;
  ownerName: string;
  stage: PipelineStage;
  requestStatus: RequestStatus;
  /** Only while STUCK: minutes since the request stopped moving. */
  requestStuckMinutes: number | null;
  releaseState: ReleaseState;
  /** 1–7. */
  currentStep: number;
  steps: PipelineStep[];
  current: CurrentStep;
  /** Only once live (step 7). */
  live: LiveStats | null;
  updatedAt: string;
};

export type PipelineFilters = { stage?: PipelineStage };

export type ActivityAction =
  | "SUSPEND_HOSTING"
  | "RESUME_HOSTING"
  | "ROLLBACK"
  | "SUSPEND_USER"
  | "REACTIVATE_USER"
  | "CHANGE_PLAN";

export type ActivityResult = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type ActivityEntry = {
  id: string;
  action: ActivityAction;
  targetName: string;
  /** Domain for websites, email for users. */
  targetDetail: string;
  /** Admin email, or null when the system did it. */
  actorEmail: string | null;
  result: ActivityResult;
  createdAt: string;
};

/** "admins" = any admin, "system" = automatic, otherwise one admin's email. */
export type ActivityActorFilter = "admins" | "system" | (string & {});

export type ActivityFilters = {
  action?: ActivityAction;
  actor?: ActivityActorFilter;
};
