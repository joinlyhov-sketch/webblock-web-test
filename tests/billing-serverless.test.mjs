import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const nativeRequire = createRequire(import.meta.url);
const body = {
  plan: "PRO", kind: "SUBSCRIBE", websiteId: null, websiteName: "Test site",
  websiteDomain: "test.webblock.com", websiteImageUrl: "/images/billing/petal-and-stem.jpg",
};

// A fresh module cache/globalThis represents another Vercel worker. No payment storage is shared.
function instance(clock, { vercel = true, key, fullWebsite = false } = {}) {
  const modules = new Map();
  const subscription = {
    renewsAt: null, plan: "FREE_TRIAL", planName: "Free trial", monthlyPrice: null,
    trialEndsAt: new Date(clock.now + 14 * 86400000).toISOString(),
  };
  const effects = [];
  const context = vm.createContext({
    Buffer, crypto: globalThis.crypto,
    process: { env: { NODE_ENV: "production", VERCEL: vercel ? "1" : undefined, MOCK_PAYMENT_SECRET: key } },
    Date: class extends Date { static now() { return clock.now; } },
  });
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    function require(specifier) {
      if (specifier === "next/headers") throw new Error("Static previews must not use payment cookies");
      if (specifier === "@/lib/api/delay") return { delay: async () => {} };
      if (specifier === "next/navigation") return { notFound: () => { throw new Error("Not found"); } };
      if (specifier === "@/features/websites/api") return {
        listWebsites: async (_userId, filter) => ({ items: fullWebsite ? [
          { id: "live-site", status: "LIVE", name: "Live site" },
          ...(filter?.status === "LIVE" ? [] : [{ id: "draft-site", status: "DRAFT", name: "Draft site" }]),
        ] : [] }),
      };
      if (specifier === "@/features/account/api") return {
        getSubscription: async () => subscription,
        websiteLimitOf: () => 1,
        activatePlan: async (_userId, plan, renewsAt) => {
          effects.push("activate"); subscription.plan = plan; subscription.renewsAt = renewsAt;
        },
        recordPlanOrder: async () => { effects.push("record"); },
      };
      if (specifier.startsWith("node:")) return nativeRequire(specifier);
      const resolved = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : path.resolve(path.dirname(filename), specifier);
      return load(`${resolved}.ts`);
    }
    const wrapper = vm.runInContext(`(function(require, module, exports) { ${code}\n})`, context);
    wrapper(require, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return {
    api: load(path.join(root, "src/features/billing/api.ts")),
    service: load(path.join(root, "src/features/billing/service.ts")),
    subscription, effects,
  };
}

test("all three plans open matching Vercel previews on fresh workers without a secret", async () => {
  const clock = { now: Date.now() };
  for (const [plan, amount] of [["PLUS", "9.99"], ["PRO", "19.99"], ["ULTRA", "39.99"]]) {
    const started = await instance(clock).service.startPayment("owner", plan);
    assert.equal(started.ok, true);
    const reader = instance(clock);
    const view = await reader.service.getPaymentView("owner", started.data.orderId);
    assert.equal(view.order.plan, plan);
    assert.equal(view.order.amount, amount);
    assert.equal(view.order.status, "PENDING");
    assert.ok(view.remainingMs > 0);
    assert.equal(reader.effects.length, 0);
  }
});

test("the original payment URL and other direct URLs show static data without a stored order", async () => {
  const clock = { now: Date.now() };
  for (const id of ["f4ef81be-add0-467b-b87c-f76c68e0e0b6", crypto.randomUUID(), "preview"]) {
    const view = await instance(clock).service.getPaymentView("owner", id);
    assert.equal(view.order.id, id);
    assert.equal(view.order.websiteName, "Petal & Stem");
    assert.equal(view.order.qrImageUrl, "/images/billing/khqr-code.jpg");
    assert.equal(view.order.status, "PENDING");
    assert.ok(!view.order.reference.includes("NaN"));
  }
});

test("Vercel previews remain visible and never settle or activate subscriptions", async () => {
  const clock = { now: Date.now() };
  const worker = instance(clock);
  const order = await worker.api.createPayment("owner", body);
  clock.now += 24 * 60 * 60 * 1000;
  await worker.api.settlePendingPayments("owner");
  await worker.api.mockSimulatePayment("owner", order.id, "pay");
  assert.equal((await worker.api.getPayment("owner", order.id)).status, "PENDING");
  assert.equal((await instance(clock).api.getPayment("owner", order.id)).status, "PENDING");
  assert.equal(worker.subscription.renewsAt, null);
  assert.equal(worker.effects.length, 0);
});

test("Vercel plans and previews do not depend on a missing, short, or old payment secret", async () => {
  const clock = { now: Date.now() };
  for (const key of [undefined, "", "short", "old-payment-secret-that-is-long-enough"]) {
    const worker = instance(clock, { key });
    const plans = await worker.service.getPlansView("owner", {});
    assert.equal(plans.variant, "dashboard");
    const start = await worker.service.startPayment("owner", "PRO");
    assert.equal(start.ok, true);
    const regenerated = await instance(clock, { key }).service.regeneratePayment("owner", start.data.orderId);
    assert.equal(regenerated.ok, true);
  }
});

test("demo preview navigation is not blocked by account capacity checks", async () => {
  const worker = instance({ now: Date.now() }, { fullWebsite: true });
  assert.equal((await worker.service.startPayment("owner", "PLUS", "draft-site")).ok, true);
});

test("the local mock still stores, settles, and activates its original payment flow", async () => {
  const clock = { now: Date.now() };
  const worker = instance(clock, { vercel: false });
  const order = await worker.api.createPayment("owner", body);
  assert.equal((await worker.api.getPayment("owner", order.id)).status, "PENDING");
  clock.now += 9000;
  assert.equal((await worker.api.getPayment("owner", order.id)).status, "PAID");
  assert.equal(worker.subscription.plan, "PRO");
  assert.deepEqual(worker.effects, ["activate", "record"]);
});

test("local missing/other-owner orders and invalid plans retain their original errors", async () => {
  const clock = { now: Date.now() };
  const worker = instance(clock, { vercel: false });
  const order = await worker.api.createPayment("owner", body);
  await assert.rejects(worker.api.getPayment("another-owner", order.id), { status: 404 });
  await assert.rejects(instance(clock, { vercel: false }).api.getPayment("owner", order.id), { status: 404 });
  assert.equal((await instance(clock).service.startPayment("owner", "INVALID")).ok, false);
});
