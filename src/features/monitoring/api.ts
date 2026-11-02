// Read-only monitoring data for one website. Mock now, Spring later: only these function bodies change.
// The backend runs deploys, retries and uptime checks; the frontend only displays the results.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { countProducts } from "@/features/products/api";
import { activity, deploys, siteStatus } from "@/mocks/monitoring";
import { sessionUsers, websiteOwners } from "@/mocks/session";
import { websitePages } from "@/mocks/website-pages";
import { getSubscription } from "@/features/account/api";
import { initials } from "@/lib/format";
import type { ActivityEvent, Deploy, DeployStats, PlanUsage, SiteStatus } from "./types";

/**
 * MOCK ONLY: Spring records every finished deploy itself. Adds it to the website's deploy list, and a
 * successful one puts the website online so the Monitor screen stops saying "isn't live yet".
 */
export function recordDeployResult(
  websiteId: string,
  result: Pick<Deploy, "status" | "startedBy" | "startedAt" | "finishedAt" | "durationSeconds" | "errorMessage">,
): void {
  const number = deploys.filter((d) => d.websiteId === websiteId).reduce((max, d) => Math.max(max, d.number), 0) + 1;
  deploys.push({ id: crypto.randomUUID(), websiteId, number, ...result });
  if (result.status === "SUCCEEDED") setSiteOnline(websiteId, true);
}

/** MOCK ONLY: Spring's uptime checks notice a website going offline (suspended) or coming back. */
export function setSiteOnline(websiteId: string, online: boolean): void {
  const checkedAt = new Date().toISOString();
  const current = siteStatus.find((s) => s.websiteId === websiteId);
  if (current) {
    current.online = online;
    current.checkedAt = checkedAt;
  } else {
    siteStatus.push({ websiteId, online, uptimePercent: "100.00", checkedAt });
  }
}

/**
 * MOCK ONLY: a website published before the mock tracked deploys has no deploy row. Spring always has one,
 * so give it deploy 1 from the date its page was published.
 */
function ensureFirstDeploy(websiteId: string): void {
  if (deploys.some((d) => d.websiteId === websiteId)) return;
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page?.published) return;
  const ownerId = websiteOwners.find((o) => o.websiteId === websiteId)?.ownerId;
  const fullName = sessionUsers.find((u) => u.id === ownerId)?.fullName ?? "Owner";
  const durationSeconds = 100;
  const finishedAt = page.publishedAt ?? page.updatedAt;
  deploys.push({
    id: crypto.randomUUID(),
    websiteId,
    number: 1,
    startedBy: { fullName, initials: initials(fullName) },
    startedAt: new Date(new Date(finishedAt).getTime() - durationSeconds * 1000).toISOString(),
    finishedAt,
    durationSeconds,
    status: "SUCCEEDED",
    errorMessage: null,
  });
}

/** GET /projects/{projectId}/status — `null` when the website has never been deployed. */
export async function getSiteStatus(websiteId: string): Promise<SiteStatus | null> {
  await delay(150);
  const known = siteStatus.find((s) => s.websiteId === websiteId);
  if (known) return known;
  // A website that was published has been checked online at least once.
  if (websitePages.some((p) => p.websiteId === websiteId && p.published)) {
    setSiteOnline(websiteId, true);
    return siteStatus.find((s) => s.websiteId === websiteId) ?? null;
  }
  return null;
}

/** GET /projects/{projectId}/deploys?page=&size= — newest first. */
export async function listDeploys(websiteId: string, query: Pick<TableQuery, "page" | "size">): Promise<Page<Deploy>> {
  await delay();
  ensureFirstDeploy(websiteId);
  const mine = deploys.filter((d) => d.websiteId === websiteId).sort((a, b) => b.number - a.number);
  return toPage(mine, query);
}

/** GET /projects/{projectId}/deploys/stats */
export async function getDeployStats(websiteId: string): Promise<DeployStats> {
  await delay(100);
  ensureFirstDeploy(websiteId);
  const mine = deploys.filter((d) => d.websiteId === websiteId);
  const succeeded = mine.filter((d) => d.status === "SUCCEEDED").length;
  return { total: mine.length, succeeded, failed: mine.length - succeeded };
}

const BILLING_PERIOD_MS = 30 * 24 * 3_600_000;

function ownerOf(websiteId: string): string | undefined {
  return websiteOwners.find((o) => o.websiteId === websiteId)?.ownerId;
}

/**
 * Deploys that count against a plan since `since`: the first free deploy on the trial, redeploys (every
 * deploy after a website's first) on a paid plan. Failed deploys cost nothing.
 */
export function countPlanDeploys(websiteIds: string[], since: string, redeploysOnly: boolean): number {
  websiteIds.forEach(ensureFirstDeploy);
  const from = new Date(since).getTime();
  return deploys.filter(
    (d) =>
      websiteIds.includes(d.websiteId) &&
      d.status === "SUCCEEDED" &&
      new Date(d.finishedAt).getTime() >= from &&
      (!redeploysOnly || d.number > 1),
  ).length;
}

/** Websites of this owner that are online now. A suspended website is offline and frees its place in the plan. */
function onlineWebsiteIds(ownerId: string): string[] {
  return websiteOwners
    .filter((o) => o.ownerId === ownerId)
    .map((o) => o.websiteId)
    .filter((id) => {
      ensureFirstDeploy(id);
      const page = websitePages.find((p) => p.websiteId === id);
      if (page?.published && !siteStatus.some((s) => s.websiteId === id)) setSiteOnline(id, true);
      return siteStatus.find((s) => s.websiteId === id)?.online === true;
    });
}

/**
 * GET /projects/{projectId}/usage — the owner's current plan and how much of its limits this website
 * uses. Everything is counted from real data: products on the website, websites online for the owner,
 * and the deploys of this website in the current period (the trial, or the 30 days of the paid plan).
 */
export async function getPlanUsage(websiteId: string): Promise<PlanUsage | null> {
  await delay(150);
  const ownerId = ownerOf(websiteId);
  const subscription = ownerId ? await getSubscription(ownerId).catch(() => null) : null;
  if (!ownerId || !subscription) return null;

  const paid = subscription.renewsAt !== null;
  const products = await countProducts(websiteId);
  const periodStart = paid
    ? new Date(new Date(subscription.renewsAt as string).getTime() - BILLING_PERIOD_MS).toISOString()
    : subscription.trialStartsAt;
  const live: Record<string, number> = {
    products: products.total,
    websites: onlineWebsiteIds(ownerId).length,
    deploys: countPlanDeploys([websiteId], periodStart, false),
    redeploys: countPlanDeploys([websiteId], periodStart, true),
  };
  return {
    plan: subscription.plan,
    planName: subscription.planName,
    resetsAt: subscription.renewsAt ?? subscription.trialEndsAt,
    metrics: subscription.usage.map((m) => ({ ...m, used: live[m.key] ?? m.used })),
  };
}

/** GET /projects/{projectId}/activity?page=&size= — newest first. Pro and Ultra plans only (403 otherwise). */
export async function listActivity(
  websiteId: string,
  query: Pick<TableQuery, "page" | "size">,
): Promise<Page<ActivityEvent>> {
  await delay();
  const ownerId = ownerOf(websiteId);
  const plan = ownerId ? (await getSubscription(ownerId).catch(() => null))?.plan : undefined;
  if (plan !== "PRO" && plan !== "ULTRA") {
    throw new ApiError({
      title: "Not in your plan",
      status: 403,
      detail: "The activity log comes with the Pro and Ultra plans.",
    });
  }
  return toPage(
    activity.filter((a) => a.websiteId === websiteId),
    query,
  );
}
