import assert from "node:assert/strict";
import { test } from "node:test";
import { serverContext, testStorage } from "./helpers/server-context.mjs";

const OWNER = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";
const WEBSITE = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";
const OTHER_WEBSITE = "7d3e9b2a-1c4f-4a8e-b6d5-3f2e1a9c8b70";
const START = Date.now();
const body = () => ({ idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye" });
const server = (options, elapsed = 0) => serverContext({ ...options, now: START + elapsed });

async function prepare(t) {
  const options = testStorage(t);
  await server(options).load("@/features/account/api").activatePlan(OWNER, "PRO", new Date(START + 30 * 86400000).toISOString());
  return options;
}

test("deployment progress survives switching instances and browser sessions", async (t) => {
  const options = await prepare(t);
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null);
  const view = await server(options, 5000).load("@/features/deploy/service").getDeployView(OWNER, WEBSITE, { deployment: deployment.id });
  assert.equal(view.kind, "progress");
  assert.equal(view.deployment.id, deployment.id);
  assert.equal(view.deployment.status, "RUNNING");
  assert.ok(view.deployment.percent > 0);
});

test("success survives cold starts without duplicating versions or deployment history", async (t) => {
  const options = await prepare(t);
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null);
  for (let i = 0; i < 2; i++) {
    const completed = await server(options, 22000).load("@/features/deploy/api").getDeployment(WEBSITE, deployment.id);
    assert.equal(completed.status, "SUCCEEDED");
    assert.equal(completed.percent, 100);
    assert.ok(completed.steps.every((step) => step.status === "DONE"));
    assert.equal(completed.finishedAt, new Date(START + 19000).toISOString());
  }
  assert.equal((await server(options, 25000).load("@/features/editor/api").listVersions(WEBSITE)).length, 1);
  assert.equal((await server(options, 25000).load("@/features/monitoring/api").listDeploys(WEBSITE, { page: 0, size: 100 })).items.length, 1);
  const visitor = serverContext({ ...options, now: START + 25000, cookies: new Map() });
  assert.ok((await visitor.load("@/features/editor/api").getPublishedPage(WEBSITE)).root);
});

test("a public visitor finishes a deployment even when the owner never polls progress", async (t) => {
  const options = await prepare(t);
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null);
  const visitor = serverContext({ ...options, now: START + 22000, cookies: new Map() });
  const published = await visitor.load("@/features/editor/api").getPublishedPage(WEBSITE);
  assert.equal(published.root.props.businessName, "Maple & Rye Bakery");
  assert.equal((await server(options, 23000).load("@/features/websites/api").getWebsite(WEBSITE)).status, "LIVE");
  assert.equal((await server(options, 23000).load("@/features/deploy/api").getDeployment(WEBSITE, deployment.id)).status, "SUCCEEDED");
});

test("idempotency and running-deployment checks survive instance changes", async (t) => {
  const options = await prepare(t);
  const request = body();
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, request, null);
  const same = await server(options, 5000).load("@/features/deploy/api").startDeployment(WEBSITE, request, null);
  assert.equal(same.id, deployment.id);
  assert.equal(same.startedAt, deployment.startedAt);
  const running = await server(options, 6000).load("@/features/deploy/api").getRunningDeployment(WEBSITE);
  assert.equal(running.id, deployment.id);
  await assert.rejects(server(options, 6000).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null), (e) => e.status === 409);
  const finished = await server(options, 23000).load("@/features/deploy/api").startDeployment(WEBSITE, request, null);
  assert.equal(finished.id, deployment.id);
  assert.equal(finished.status, "SUCCEEDED");
});

test("lost links show recovery and wrong-website IDs cannot read progress", async (t) => {
  const options = await prepare(t);
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null);
  await assert.rejects(server(options).load("@/features/deploy/api").getDeployment(OTHER_WEBSITE, deployment.id), (e) => e.status === 404);
  const old = await server(options).load("@/features/deploy/service").getDeployView(OWNER, WEBSITE, { deployment: crypto.randomUUID() });
  assert.equal(old.kind, "unavailable");
  const admin = serverContext({ ...options, cookies: new Map([["wb_role", "ADMIN"]]) });
  await assert.rejects(admin.load("@/lib/auth/session").requireWebsiteOwner(WEBSITE), (e) => e.status === 404);
});

test("development failure persists across instances without publishing a page", async (t) => {
  const options = await prepare(t);
  const deployment = await server(options).load("@/features/deploy/api").startDeployment(WEBSITE, body(), null);
  await server(options, 12000).load("@/features/deploy/api").mockFailDeployment(WEBSITE, deployment.id);
  const failed = await server(options, 13000).load("@/features/deploy/api").getDeployment(WEBSITE, deployment.id);
  assert.equal(failed.status, "FAILED");
  await assert.rejects(server(options, 14000).load("@/features/editor/api").getPublishedPage(WEBSITE), (e) => e.status === 404);
  assert.equal((await server(options, 14000).load("@/features/monitoring/api").listDeploys(WEBSITE, { page: 0, size: 100 })).items[0].status, "FAILED");
});
