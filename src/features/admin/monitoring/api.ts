// Admin Monitoring data access. Mock now; when Spring is ready only the function bodies change.
// Read-only: the backend runs the publish pipeline, its retries and rollbacks.
import { ApiError } from "@/lib/api/errors";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { activityLog } from "@/mocks/admin-activity";
import { liveLogs, pipelineRuns as pipelineMocks } from "@/mocks/admin-pipeline";
import { adminDeploys, adminWebsites } from "@/mocks/admin-websites";
import { redeployedIds, settleDeploys } from "../api";
import type {
  ActivityEntry,
  ActivityFilters,
  LogLevel,
  LogLine,
  PipelineFilters,
  PipelineRun,
} from "./types";

// The website's image comes from the website itself, so it is the same everywhere.
const pipelineRuns: PipelineRun[] = pipelineMocks.map((r) => ({
  ...r,
  thumbnailUrl:
    adminWebsites.find((w) => w.id === r.websiteId)?.thumbnailUrl ?? null,
}));

const delay = async (ms = 250) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  settleDeploys();
};

/**
 * A redeploy started from User Websites moves its website's publish flow too: the steps before the current
 * one are done, the current one is running, and at step 7 the site is live. The backend reports the same.
 */
function withRedeploy(run: PipelineRun): PipelineRun {
  const latest = adminDeploys
    .filter((d) => d.websiteId === run.websiteId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  if (!latest || !redeployedIds.has(latest.id)) return run;

  const live = latest.status === "LIVE";
  const step = live ? 7 : (latest.currentStep ?? 1);
  return {
    ...run,
    stage: live ? "LIVE" : step <= 1 ? "REQUEST" : step <= 3 ? "GENERATION" : "RELEASE",
    requestStatus: step <= 3 && !live ? "PUBLISHING" : "PUBLISHED",
    requestStuckMinutes: null,
    releaseState: live ? "LIVE" : step < 4 ? "NONE_YET" : step === 4 ? "BUILDING" : "DEPLOYING",
    currentStep: step,
    steps: run.steps.map((s) => ({
      ...s,
      status: live || s.number < step ? "DONE" : s.number === step ? "RUNNING" : "NOT_STARTED",
    })),
    current: {
      ...run.current,
      title: run.steps[step - 1].title,
      status: live ? "DONE" : "RUNNING",
      tags: [],
      checkGroup: null,
    },
    live: live ? (run.live ?? null) : null,
    updatedAt: new Date().toISOString(),
  };
}

/** Spring-style sort on a top-level field. */
function sorted<T>(items: T[], sort: TableQuery["sort"]): T[] {
  if (!sort) return items;
  const field = sort.field as keyof T;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x === y) return 0;
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
}

/** GET /api/admin/monitoring/pipeline?stage=&page=&size=&sort= — each website's latest publish. */
export async function listPipelineRuns(
  filters: PipelineFilters,
  query: TableQuery,
): Promise<Page<PipelineRun>> {
  await delay();
  const items = pipelineRuns
    .map(withRedeploy)
    .filter((r) => !filters.stage || r.stage === filters.stage);
  return toPage(
    sorted(items, query.sort ?? { field: "currentStep", direction: "asc" }),
    query,
  );
}

/** GET /api/admin/monitoring/pipeline/{websiteId} — the publish flow of one website. */
export async function getPipelineRun(websiteId: string): Promise<PipelineRun> {
  await delay(150);
  const found = pipelineRuns.find((r) => r.websiteId === websiteId);
  const run = found && withRedeploy(found);
  if (!run)
    throw new ApiError({
      title: "Not found",
      status: 404,
      detail: "No deploy found for this website.",
    });
  return run;
}

/** GET /api/admin/monitoring/pipeline/{websiteId}/logs?level=&size= — newest first. */
export async function listLiveLogs(
  websiteId: string,
  filters: { level?: LogLevel },
  query: TableQuery,
): Promise<Page<LogLine>> {
  await delay(150);
  const items: LogLine[] = liveLogs
    .filter(
      (l) =>
        l.websiteId === websiteId &&
        (!filters.level || l.level === filters.level),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  return toPage(items, query);
}

/** GET /api/admin/monitoring/activity?action=&actor=&page=&size=&sort= */
export async function listActivity(
  filters: ActivityFilters,
  query: TableQuery,
): Promise<Page<ActivityEntry>> {
  await delay();
  const items = activityLog.filter((a) => {
    if (filters.action && a.action !== filters.action) return false;
    if (filters.actor === "system") return a.actorEmail === null;
    if (filters.actor === "admins") return a.actorEmail !== null;
    if (filters.actor) return a.actorEmail === filters.actor;
    return true;
  });
  return toPage(
    sorted(items, query.sort ?? { field: "createdAt", direction: "desc" }),
    query,
  );
}

/** GET /api/admin/monitoring/activity/actors — admin emails that appear in the log. */
export async function listActivityActors(): Promise<string[]> {
  await delay(100);
  return [
    ...new Set(
      activityLog.flatMap((a) => (a.actorEmail ? [a.actorEmail] : [])),
    ),
  ].sort();
}
