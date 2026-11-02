import { mockCollection } from "@/lib/mock-state";
import type { ActivityEvent, Deploy, DeployStatus, SiteStatus } from "@/features/monitoring/types";
import { PETAL_AND_STEM_ID } from "./session";
import { daysAgo, hoursAgo } from "./time";

const HOUR = 3_600_000;

// Deployment history and site status share the same durable state as the websites.

/** The owner (session.ts / account.ts): the only person who deploys his websites. */
const sovannarith = { fullName: "Sovannarith Soeun", initials: "SS" };

type DeploySeed = [daysAgo: number, status: DeployStatus, durationSeconds: number, error?: string];

function toDeploys(websiteId: string, prefix: string, seeds: DeploySeed[]): Deploy[] {
  return seeds.map(([ago, status, durationSeconds, error], i) => {
    const finishedAt = new Date(Date.now() - ago * 24 * HOUR).toISOString();
    return {
      id: `${prefix}-${String(i + 1).padStart(12, "0")}`,
      websiteId,
      number: i + 1,
      startedBy: sovannarith,
      startedAt: new Date(new Date(finishedAt).getTime() - durationSeconds * 1000).toISOString(),
      finishedAt,
      durationSeconds,
      status,
      errorMessage: error ?? null,
    };
  });
}

/**
 * Oldest first. The owner's free trial started 5 days ago, so every deploy is newer than that:
 * Petal & Stem failed once (missing email), then went live. That was the trial's first deploy; the
 * other websites are drafts that were never deployed.
 */
export const deploys: Deploy[] = mockCollection("monitoring.deploys", [
  ...toDeploys(PETAL_AND_STEM_ID, "d3a1e5c2-7b4f-4e8a-9c01", [
    [4, "FAILED", 64, "Business email is missing"],
    [0.08, "SUCCEEDED", 101],
  ]),
]);

export const siteStatus: SiteStatus[] = mockCollection("monitoring.siteStatus", [
  { websiteId: PETAL_AND_STEM_ID, online: true, uptimePercent: "99.98", checkedAt: hoursAgo(0.05) },
]);

let n = 0;
const event = (
  websiteId: string,
  type: ActivityEvent["type"],
  outcome: ActivityEvent["outcome"],
  title: string,
  occurredAt: string,
  detail: string | null = null,
): ActivityEvent => {
  n += 1;
  return { id: `f5c3a7e4-9d6b-4a0c-8e03-${String(n).padStart(12, "0")}`, websiteId, type, outcome, title, detail, occurredAt };
};

/** Newest first. Shown only on Pro and Ultra plans (the owner is on the free trial, so it stays hidden for now). */
export const activity: ActivityEvent[] = [
  event(PETAL_AND_STEM_ID, "DEPLOY", "SUCCEEDED", "Deploy 2 succeeded", hoursAgo(2)),
  event(PETAL_AND_STEM_ID, "PRODUCT", "CHANGED", "Product “Blue lily stem” updated", hoursAgo(2)),
  event(PETAL_AND_STEM_ID, "BUSINESS_INFO", "CHANGED", "Business email added", daysAgo(3.9)),
  event(PETAL_AND_STEM_ID, "DEPLOY", "FAILED", "Deploy 1 failed", daysAgo(4), "Business email is missing"),
];
