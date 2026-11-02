// Data access for deployments and web addresses. Mock now, Spring later: only these function bodies change.
// The backend owns the deploy pipeline (steps, retries, SSL, going live). The frontend starts a deploy and
// then only reads its status; it never decides that a step finished.
import { getDeployAccess, recordDeploy } from "@/features/account/api";
import { getPageData, publishPage } from "@/features/editor/api";
import { recordDeployResult } from "@/features/monitoring/api";
import { isDomainTaken, markWebsiteLive } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import { initials } from "@/lib/format";
import { websiteOwners, sessionUsers } from "@/mocks/session";
import { DOMAIN_SUFFIX, subdomainSchema } from "./schemas";
import type {
  DeployStepKey,
  DeployStepStatus,
  Deployment,
  DeploymentStep,
  DomainCheck,
  StartDeploymentBody,
} from "./types";

/** How long each step takes in the mock (the real pipeline takes about two minutes). */
const STEPS: { key: DeployStepKey; ms: number }[] = [
  { key: "BUILD", ms: 4000 },
  { key: "PRODUCTS", ms: 3000 },
  { key: "PACKAGE", ms: 4000 },
  { key: "LAUNCH", ms: 4000 },
  { key: "SSL", ms: 3000 },
  { key: "LIVE", ms: 1000 },
];
const TOTAL_MS = STEPS.reduce((sum, step) => sum + step.ms, 0);
const RESERVED = new Set([
  "www",
  "app",
  "admin",
  "api",
  "mail",
  "support",
  "webblock",
  "billing",
]);

/** Mock store entry. `failAtStep` is a developer switch; Spring has no such field. */
type StoredDeployment = {
  deployment: Deployment;
  idempotencyKey: string;
  failAtStep: number | null;
  settled: boolean;
};

const globalForStore = globalThis as typeof globalThis & {
  __wbDeployments?: StoredDeployment[];
};
const store: StoredDeployment[] = (globalForStore.__wbDeployments ??= []);

function ownerOf(websiteId: string): string {
  const ownerId = websiteOwners.find((o) => o.websiteId === websiteId)?.ownerId;
  if (!ownerId)
    throw new ApiError({
      title: "Website not found",
      status: 404,
      detail: "That website no longer exists.",
    });
  return ownerId;
}

/** GET /domains/check?name= - is this address valid and free for this website? */
export async function checkDomain(
  websiteId: string,
  name: string,
): Promise<DomainCheck> {
  await delay(150);
  const clean = name.trim().toLowerCase();
  const host = `${clean}${DOMAIN_SUFFIX}`;
  const parsed = subdomainSchema.safeParse(clean);
  if (!parsed.success)
    return {
      name: clean,
      host,
      available: false,
      problem: parsed.error.issues[0].message,
    };
  if (RESERVED.has(clean) || (await isDomainTaken(host, websiteId))) {
    return {
      name: clean,
      host,
      available: false,
      problem: "This address is already taken.",
    };
  }
  return { name: clean, host, available: true, problem: null };
}

function stepsAt(elapsed: number, failAtStep: number | null): DeploymentStep[] {
  let start = 0;
  const current = STEPS.findIndex((step) => {
    const inside = elapsed < start + step.ms;
    start += step.ms;
    return inside;
  });
  return STEPS.map((step, index) => {
    let status: DeployStepStatus;
    if (failAtStep !== null) {
      status =
        index < failAtStep
          ? "DONE"
          : index === failAtStep
            ? "FAILED"
            : "NOT_STARTED";
    } else if (current === -1 || index < current) status = "DONE";
    else if (index === current) status = "IN_PROGRESS";
    else
      status =
        index === current + 1 && step.key !== "LIVE" ? "UP_NEXT" : "WAITING";
    return {
      key: step.key,
      status,
      seconds: status === "DONE" ? Math.round(step.ms / 1000) : null,
    };
  });
}

/** Who pressed Deploy: the website's owner (MOCK ONLY, Spring knows the signed-in user). */
function starter(websiteId: string): { fullName: string; initials: string } {
  const user = sessionUsers.find((u) => u.id === ownerOf(websiteId));
  const fullName = user?.fullName ?? "Owner";
  return { fullName, initials: initials(fullName) };
}

/** Moves a deployment forward by the clock, like the real pipeline would have by now. */
async function settle(entry: StoredDeployment): Promise<void> {
  const { deployment } = entry;
  if (deployment.status !== "RUNNING") return;
  const startedAt = new Date(deployment.startedAt).getTime();
  const elapsed = Date.now() - startedAt;

  if (entry.failAtStep !== null) {
    const failTime = STEPS.slice(0, entry.failAtStep).reduce(
      (sum, s) => sum + s.ms,
      0,
    );
    if (elapsed < failTime) {
      deployment.steps = stepsAt(elapsed, null);
      deployment.percent = Math.min(99, Math.round((elapsed / TOTAL_MS) * 100));
      return;
    }
    deployment.status = "FAILED";
    deployment.steps = stepsAt(elapsed, entry.failAtStep);
    deployment.percent = Math.round((failTime / TOTAL_MS) * 100);
    deployment.secondsLeft = null;
    deployment.finishedAt = new Date().toISOString();
    if (!entry.settled) {
      entry.settled = true;
      recordDeployResult(deployment.websiteId, {
        status: "FAILED",
        startedBy: starter(deployment.websiteId),
        startedAt: deployment.startedAt,
        finishedAt: deployment.finishedAt,
        durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        errorMessage: "The deploy stopped before the website went live. Try again.",
      });
    }
    return;
  }

  deployment.steps = stepsAt(elapsed, null);
  if (elapsed < TOTAL_MS) {
    deployment.percent = Math.min(99, Math.round((elapsed / TOTAL_MS) * 100));
    deployment.secondsLeft = Math.ceil((TOTAL_MS - elapsed) / 1000);
    return;
  }
  deployment.status = "SUCCEEDED";
  deployment.percent = 100;
  deployment.secondsLeft = null;
  deployment.finishedAt = new Date(startedAt + TOTAL_MS).toISOString();
  if (!entry.settled) {
    entry.settled = true;
    // Spring does all of this when the last step finishes: counts the deploy against the plan,
    // publishes the saved draft and puts the website live on its address.
    await recordDeploy(ownerOf(deployment.websiteId), deployment.websiteId);
    await publishPage(deployment.websiteId, entry.idempotencyKey);
    await markWebsiteLive(deployment.websiteId, deployment.domain);
    recordDeployResult(deployment.websiteId, {
      status: "SUCCEEDED",
      startedBy: starter(deployment.websiteId),
      startedAt: deployment.startedAt,
      finishedAt: deployment.finishedAt ?? new Date().toISOString(),
      durationSeconds: Math.round(TOTAL_MS / 1000),
      errorMessage: null,
    });
  }
}

/** Same value whatever the order its object keys were written in. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

/**
 * Does the saved draft differ from what visitors see? A website that was never deployed always has
 * something to deploy. Spring answers this inside the deployments endpoint (409 when nothing changed).
 */
export async function hasUndeployedChanges(websiteId: string): Promise<boolean> {
  const page = await getPageData(websiteId);
  return !page.published || stable(page.draft) !== stable(page.published);
}

/**
 * POST /projects/{projectId}/deployments - starts a deploy of the saved draft. Answers 402 when the
 * owner's plan does not allow it, 409 when one is already running or the address is unusable.
 * `idempotencyKey` goes in the `Idempotency-Key` header: a repeated request returns the same deployment.
 */
export async function startDeployment(
  websiteId: string,
  body: StartDeploymentBody,
  currentDomain: string | null,
): Promise<Deployment> {
  await delay(300);
  const repeat = store.find(
    (e) =>
      e.deployment.websiteId === websiteId &&
      e.idempotencyKey === body.idempotencyKey,
  );
  if (repeat) return structuredClone(repeat.deployment);

  const running = store.find(
    (e) =>
      e.deployment.websiteId === websiteId && e.deployment.status === "RUNNING",
  );
  if (running) {
    await settle(running);
    if (running.deployment.status === "RUNNING") {
      throw new ApiError({
        title: "Already deploying",
        status: 409,
        detail: "This website is already being deployed.",
      });
    }
  }

  const access = await getDeployAccess(ownerOf(websiteId), websiteId);
  if (!access.allowed) {
    throw new ApiError({
      title: "Plan required",
      status: 402,
      detail: "Your plan does not allow this deploy.",
    });
  }

  let domain = currentDomain;
  if (!domain || (access.firstDeploy && body.subdomain)) {
    const check = await checkDomain(websiteId, body.subdomain ?? "");
    if (!check.available) {
      throw new ApiError({
        title: "Address unavailable",
        status: 409,
        detail: check.problem ?? "Pick another address.",
      });
    }
    domain = check.host;
  }

  const deployment: Deployment = {
    id: crypto.randomUUID(),
    websiteId,
    kind: access.firstDeploy || !currentDomain ? "FIRST" : "REDEPLOY",
    status: "RUNNING",
    percent: 0,
    secondsLeft: Math.ceil(TOTAL_MS / 1000),
    domain,
    steps: stepsAt(0, null),
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  store.unshift({
    deployment,
    idempotencyKey: body.idempotencyKey,
    failAtStep: null,
    settled: false,
  });
  return structuredClone(deployment);
}

/** GET /projects/{projectId}/deployments/{id} - the deploy's current progress. */
export async function getDeployment(
  websiteId: string,
  deploymentId: string,
): Promise<Deployment> {
  await delay(120);
  const entry = store.find(
    (e) =>
      e.deployment.websiteId === websiteId && e.deployment.id === deploymentId,
  );
  if (!entry)
    throw new ApiError({
      title: "Deploy not found",
      status: 404,
      detail: "We could not find this deploy.",
    });
  await settle(entry);
  return structuredClone(entry.deployment);
}

/** GET /projects/{projectId}/deployments?status=RUNNING&size=1 - the deploy in progress, if any. */
export async function getRunningDeployment(
  websiteId: string,
): Promise<Deployment | null> {
  await delay(120);
  const entry = store.find(
    (e) =>
      e.deployment.websiteId === websiteId && e.deployment.status === "RUNNING",
  );
  if (!entry) return null;
  await settle(entry);
  return entry.deployment.status === "RUNNING"
    ? structuredClone(entry.deployment)
    : null;
}

/** MOCK ONLY (no Spring equivalent): `?mock=fail` makes the running deploy fail at "Launching your website". */
export async function mockFailDeployment(
  websiteId: string,
  deploymentId: string,
): Promise<void> {
  const entry = store.find(
    (e) =>
      e.deployment.websiteId === websiteId && e.deployment.id === deploymentId,
  );
  if (entry && entry.deployment.status === "RUNNING") entry.failAtStep = 3;
}
