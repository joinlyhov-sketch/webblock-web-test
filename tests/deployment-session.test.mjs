import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";
const WEBSITE = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";
const OTHER_WEBSITE = "7d3e9b2a-1c4f-4a8e-b6d5-3f2e1a9c8b70";
const START = Date.now();
const compiled = new Map();

// Real deploy API/service in independent server contexts; only framework and external
// feature calls are stubbed so the test isolates lost deployment state.
function instance(jar = new Map(), now = START, readOnly = false) {
  const effects = { published: 0, live: 0, counted: 0, results: [], writes: [] };
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({
    crypto: globalThis.crypto, Date: Clock, Buffer, structuredClone,
    process: { env: { NODE_ENV: "production" } },
  });
  const stubs = {
    "next/headers": { cookies: async () => ({
      get: (name) => jar.has(name) ? { value: jar.get(name) } : undefined,
      set: (name, value, options) => {
        assert.equal(readOnly, false, "Rendering must not write cookies");
        effects.writes.push({ name, value, options });
        jar.set(name, value);
      },
    }) },
    "next/navigation": {
      notFound() { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); },
      redirect(href) { throw new Error("REDIRECT:" + href); },
    },
    "@/lib/api/delay": { delay: async () => {} },
    "@/features/account/api": {
      getDeployAccess: async () => ({ allowed: true, firstDeploy: true }),
      recordDeploy: async () => { effects.counted++; },
    },
    "@/features/editor/api": {
      getPageData: async () => ({ published: null, draft: {} }),
      publishPage: async () => { effects.published++; },
    },
    "@/features/monitoring/api": {
      recordDeployResult: (_id, result) => { effects.results.push(result); },
    },
    "@/features/websites/api": {
      getWebsite: async (id) => ({ id, name: "Maple & Rye", status: "DRAFT", domain: null }),
      isDomainTaken: async () => false,
      markWebsiteLive: async () => { effects.live++; },
    },
  };
  const cache = new Map();
  function load(specifier, parent = path.join(ROOT, "src", "entry.ts")) {
    if (stubs[specifier]) return stubs[specifier];
    if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return nodeRequire(specifier);
    const base = specifier.startsWith("@/")
      ? path.join(ROOT, "src", specifier.slice(2))
      : path.resolve(path.dirname(parent), specifier);
    const filename = [base + ".ts", path.join(base, "index.ts")].find(fs.existsSync);
    assert.ok(filename, `Cannot resolve ${specifier}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    if (!compiled.has(filename)) compiled.set(filename, ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText);
    vm.runInContext("(function(require,module,exports){" + compiled.get(filename) + "\n})", context)(
      (name) => load(name, filename), loadedModule, loadedModule.exports,
    );
    return loadedModule.exports;
  }
  return { api: load("@/features/deploy/api"), service: load("@/features/deploy/service"), effects };
}

test("deployment progress survives switching Vercel instances", async () => {
  const jar = new Map();
  const creator = instance(jar);
  const deployment = await creator.api.startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  const view = await instance(jar, START + 5000, true).service.getDeployView(OWNER, WEBSITE, {
    deployment: deployment.id,
  });
  assert.equal(view.kind, "progress");
  assert.equal(view.deployment.id, deployment.id);
  assert.equal(view.deployment.status, "RUNNING");
  assert.ok(view.deployment.percent > 0);
  const cookie = creator.effects.writes[0];
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, "lax");
  assert.equal(cookie.options.path, "/");
});

test("success is recovered after a cold start without repeating side effects on refresh", async () => {
  const jar = new Map();
  const deployment = await instance(jar).api.startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  const reader = instance(jar, START + 22000, true);
  for (let i = 0; i < 2; i++) {
    const completed = await reader.api.getDeployment(WEBSITE, deployment.id);
    assert.equal(completed.status, "SUCCEEDED");
    assert.equal(completed.percent, 100);
    assert.equal(completed.secondsLeft, null);
    assert.ok(completed.steps.every((step) => step.status === "DONE"));
    assert.equal(completed.finishedAt, new Date(START + 19000).toISOString());
  }
  assert.equal(reader.effects.published, 1);
  assert.equal(reader.effects.live, 1);
  assert.equal(reader.effects.counted, 1);
  assert.equal(reader.effects.results.length, 1);
  const fresh = await instance(jar, START + 25000, true).service.getDeployView(OWNER, WEBSITE, {
    deployment: deployment.id,
  });
  assert.equal(fresh.deployment.status, "SUCCEEDED");
});

test("idempotency and running-deployment checks survive instance changes", async () => {
  const jar = new Map();
  const body = { idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye" };
  const deployment = await instance(jar).api.startDeployment(WEBSITE, body, null);
  const retry = instance(jar, START + 5000);
  const same = await retry.api.startDeployment(WEBSITE, body, null);
  assert.equal(same.id, deployment.id);
  assert.equal(same.startedAt, deployment.startedAt);
  assert.equal(retry.effects.writes.length, 0);
  const running = await instance(jar, START + 6000, true).api.getRunningDeployment(WEBSITE);
  assert.equal(running.id, deployment.id);
  await assert.rejects(instance(jar, START + 6000).api.startDeployment(WEBSITE, {
    ...body, idempotencyKey: crypto.randomUUID(),
  }, null), (e) => e.status === 409);
  assert.equal(await instance(jar, START + 22000, true).api.getRunningDeployment(WEBSITE), null);
  const finishedRetry = await instance(jar, START + 23000).api.startDeployment(WEBSITE, body, null);
  assert.equal(finishedRetry.id, deployment.id);
  assert.equal(finishedRetry.status, "SUCCEEDED");
});

test("old links show a recovery view; unknown and wrong-website IDs cannot read progress", async () => {
  const jar = new Map();
  const deployment = await instance(jar).api.startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  await assert.rejects(instance(jar, START, true).api.getDeployment(OTHER_WEBSITE, deployment.id), (e) => e.status === 404);
  await assert.rejects(instance(jar, START, true).api.getDeployment(WEBSITE, crypto.randomUUID()), (e) => e.status === 404);
  const oldLink = await instance(new Map(), START, true).service.getDeployView(OWNER, WEBSITE, {
    deployment: "60f2b6e4-601f-4eac-9a76-9625a79ffba1",
  });
  assert.equal(oldLink.kind, "unavailable");
  assert.equal(oldLink.website.id, WEBSITE);
});

test("malformed sessions and a mismatched owner do not recover deployments", async () => {
  const jar = new Map();
  const deployment = await instance(jar).api.startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  const snapshot = JSON.parse(Buffer.from(jar.get("wb_mock_deployments"), "base64url").toString());
  snapshot[0].userId = "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51";
  for (const value of ["invalid", "a".repeat(3801), Buffer.from(JSON.stringify(snapshot)).toString("base64url")]) {
    await assert.rejects(instance(new Map([["wb_mock_deployments", value]]), START, true)
      .api.getDeployment(WEBSITE, deployment.id), (e) => e.status === 404);
  }
});

test("session history stays bounded and preserves the newest deploy", async () => {
  const jar = new Map();
  let latest;
  for (let i = 0; i < 8; i++) {
    latest = await instance(jar, START + i * 20000).api.startDeployment(WEBSITE, {
      idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
    }, null);
    assert.ok(Buffer.byteLength(jar.get("wb_mock_deployments")) <= 3800);
  }
  const snapshots = JSON.parse(Buffer.from(jar.get("wb_mock_deployments"), "base64url").toString());
  assert.ok(snapshots.length <= 6);
  assert.equal(snapshots[0].id, latest.id);
  assert.equal((await instance(jar, START + 160000, true).api.getDeployment(WEBSITE, latest.id)).status, "SUCCEEDED");
});

test("development failure simulation still reports a failed deploy without publishing", async () => {
  const jar = new Map();
  const deployment = await instance(jar).api.startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  const reader = instance(jar, START + 12000, true);
  await reader.api.mockFailDeployment(WEBSITE, deployment.id);
  const failed = await reader.api.getDeployment(WEBSITE, deployment.id);
  assert.equal(failed.status, "FAILED");
  assert.equal(reader.effects.published, 0);
  assert.equal(reader.effects.live, 0);
  assert.equal(reader.effects.results[0].status, "FAILED");
});
