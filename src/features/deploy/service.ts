// Deploy logic: who may deploy what, and which screen comes next. The backend owns the plan limits and
// the pipeline; this layer only asks and routes. It never imports mocks, so it stays the same with Spring.
import { notFound, redirect } from "next/navigation";
import type { ActionResult } from "@/lib/actions/result";
import { getDeployAccess } from "@/features/account/api";
import { getWebsite } from "@/features/websites/api";
import type { Website } from "@/features/websites/types";
import { ApiError } from "@/lib/api/errors";
import {
  checkDomain,
  getDeployment,
  getRunningDeployment,
  hasUndeployedChanges,
  mockFailDeployment,
  startDeployment,
} from "./api";
import { idempotencyKeySchema, plansHref, subdomainSchema, suggestSubdomain } from "./schemas";
import type { DeployNext, Deployment, DomainCheck } from "./types";

export type DeployView =
  | {
      kind: "choose-domain";
      website: Website;
      /** What the address field starts with: the typed name, else one made from the website's name. */
      name: string;
      check: DomainCheck;
    }
  | { kind: "progress"; website: Website; deployment: Deployment }
  /** Back from paying for this deploy: the website already has its address, so it deploys straight away. */
  | { kind: "start"; website: Website; idempotencyKey: string };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * What the Deploy screen shows. A deploy in progress (or the one named in `?deployment=`) wins; otherwise
 * a first deploy picks its free address. Owners the plan does not allow are sent to the plans, and a
 * website with nothing to deploy goes back to the editor. `?start=<paymentId>` (set after paying for this
 * deploy) starts it at once when the website already has its address; the payment id is the
 * idempotency key, so opening that link again never deploys twice.
 */
export async function getDeployView(
  userId: string,
  websiteId: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<DeployView> {
  const website = await getWebsite(websiteId);
  // A suspended website can't be deployed until it is reactivated (from My Websites).
  if (website.status === "SUSPENDED") redirect("/websites?status=suspended");

  const deploymentId = first(searchParams.deployment);
  if (deploymentId) {
    // MOCK ONLY: `?mock=fail` makes the deploy fail in development so the failed screen can be seen.
    if (
      process.env.NODE_ENV !== "production" &&
      first(searchParams.mock) === "fail"
    ) {
      await mockFailDeployment(websiteId, deploymentId);
    }
    const deployment = await getDeployment(websiteId, deploymentId).catch(
      (e: unknown) => {
        if (e instanceof ApiError && e.status === 404) notFound();
        throw e;
      },
    );
    return { kind: "progress", website, deployment };
  }

  const running = await getRunningDeployment(websiteId);
  if (running) return { kind: "progress", website, deployment: running };

  const access = await getDeployAccess(userId, websiteId);
  if (!access.allowed) redirect(plansHref(websiteId, access.reason));

  const start = first(searchParams.start);
  // A draft has never been published, so its owner always picks the address first, paid or not.
  if (website.domain && website.status !== "DRAFT" && idempotencyKeySchema.safeParse(start).success)
    return { kind: "start", website, idempotencyKey: start };
  // A website that is already live on its address has nothing to pick: back to the editor.
  if (!access.firstDeploy && website.domain)
    redirect(`/websites/${websiteId}/edit`);

  const name =
    first(searchParams.name).trim().toLowerCase() ||
    suggestSubdomain(website.name);
  return {
    kind: "choose-domain",
    website,
    name,
    check: await checkDomain(websiteId, name),
  };
}

/**
 * Starts a deploy of the saved draft (the editor saves it first). The answer says where to go next:
 * the plans when the plan does not allow it, the address picker for a draft (a website that was never
 * published picks its address first, even right after paying), or the progress screen.
 */
export async function startDeploy(
  userId: string,
  websiteId: string,
  subdomain: string | null,
  idempotencyKey: string,
): Promise<ActionResult<DeployNext>> {
  try {
    if ((await getWebsite(websiteId)).status === "SUSPENDED")
      return { ok: false, message: "This website is suspended. Reactivate it from My Websites before deploying." };

    const running = await getRunningDeployment(websiteId);
    if (running)
      return {
        ok: true,
        data: {
          next: "PROGRESS",
          deploymentId: running.id,
          kind: running.kind,
        },
      };

    if (!(await hasUndeployedChanges(websiteId)))
      return {
        ok: false,
        message:
          "You haven’t made any changes since your last deploy, so there’s nothing new to deploy. Edit your website, then deploy again.",
      };

    const access = await getDeployAccess(userId, websiteId);
    if (!access.allowed)
      return { ok: true, data: { next: "PLANS", reason: access.reason } };

    const website = await getWebsite(websiteId);
    if ((!website.domain || website.status === "DRAFT") && !subdomain)
      return { ok: true, data: { next: "CHOOSE_DOMAIN" } };

    let chosen: string | null = null;
    if (subdomain) {
      const parsed = subdomainSchema.safeParse(subdomain);
      if (!parsed.success)
        return { ok: false, message: parsed.error.issues[0].message };
      chosen = parsed.data;
    }
    const deployment = await startDeployment(
      websiteId,
      { idempotencyKey, subdomain: chosen },
      website.domain,
    );
    return {
      ok: true,
      data: {
        next: "PROGRESS",
        deploymentId: deployment.id,
        kind: deployment.kind,
      },
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 402)
      return { ok: true, data: { next: "PLANS" } };
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}
