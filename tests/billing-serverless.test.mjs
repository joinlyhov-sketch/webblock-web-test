import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const nativeRequire = createRequire(import.meta.url);
const secret = "test-only-payment-secret-with-at-least-32-characters";
const body = {
  plan: "PRO", kind: "SUBSCRIBE", websiteId: null, websiteName: "Test site",
  websiteDomain: "test.webblock.com", websiteImageUrl: "/images/billing/petal-and-stem.jpg",
};

// Each instance has its own globalThis and module cache, like separate Vercel workers.
// Only the browser's cookies survive; reading a page must never write response cookies.
function instance(jar, clock, { vercel = true, writable = false, key = secret } = {}) {
  const modules = new Map();
  const subscription = { renewsAt: null };
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
      if (specifier === "next/headers") return {
        cookies: async () => ({
          getAll: () => [...jar].map(([name, { value }]) => ({ name, value })),
          set(name, value, options) {
            assert.ok(writable, "Server Component reads must not set cookies");
            jar.set(name, { value, options });
          },
        }),
      };
      if (specifier === "@/lib/api/delay") return { delay: async () => {} };
      if (specifier === "@/features/account/api") return {
        getSubscription: async () => subscription,
        activatePlan: async (_userId, _plan, renewsAt) => { subscription.renewsAt = renewsAt; },
        recordPlanOrder: async () => {},
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
  return { api: load(path.join(root, "src/features/billing/api.ts")), subscription };
}

test("Vercel payments survive cold instances and repeated page refreshes", async () => {
  const jar = new Map();
  const clock = { now: Date.now() };
  const creator = instance(jar, clock, { writable: true });
  const order = await creator.api.createPayment("owner", body);
  assert.equal(jar.size, 1);
  const [{ options }] = jar.values();
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
  for (let poll = 0; poll < 3; poll++) {
    const freshWorker = instance(jar, clock);
    assert.equal((await freshWorker.api.getPayment("owner", order.id)).status, "PENDING");
    clock.now += 1500;
  }
  clock.now += 8000;
  const paid = await instance(jar, clock).api.getPayment("owner", order.id);
  assert.equal(paid.status, "PAID");
  assert.equal((await instance(jar, clock).api.getPayment("owner", order.id)).paidAt, paid.paidAt);
});

test("separate Vercel orders remain available and cannot be read by another user", async () => {
  const jar = new Map();
  const clock = { now: Date.now() };
  const first = await instance(jar, clock, { writable: true }).api.createPayment("owner", body);
  const second = await instance(jar, clock, { writable: true }).api.createPayment("owner", { ...body, plan: "PLUS" });
  const reader = instance(jar, clock);
  assert.equal((await reader.api.getPayment("owner", first.id)).plan, "PRO");
  assert.equal((await reader.api.getPayment("owner", second.id)).plan, "PLUS");
  await assert.rejects(reader.api.getPayment("other-user", first.id), { status: 404 });
  await assert.rejects(reader.api.getPayment("owner", crypto.randomUUID()), { status: 404 });
});

test("tampered and expired payment cookies cannot restore an order", async () => {
  const jar = new Map();
  const clock = { now: Date.now() };
  const order = await instance(jar, clock, { writable: true }).api.createPayment("owner", body);
  const [[name, saved]] = jar;
  const [payload, mac] = saved.value.split(".");
  const changed = JSON.parse(Buffer.from(payload, "base64url").toString());
  changed.order.status = "PAID";
  jar.set(name, { ...saved, value: `${Buffer.from(JSON.stringify(changed)).toString("base64url")}.${mac}` });
  await assert.rejects(instance(jar, clock).api.getPayment("owner", order.id), { status: 404 });
  jar.set(name, saved);
  clock.now += 24 * 60 * 60 * 1000;
  await assert.rejects(instance(jar, clock).api.getPayment("owner", order.id), { status: 404 });
});

test("restoring a renewal does not extend its billing period on every refresh", async () => {
  const jar = new Map();
  const clock = { now: Date.now() };
  const creator = instance(jar, clock, { writable: true });
  creator.subscription.renewsAt = new Date(clock.now + 10 * 86400000).toISOString();
  const order = await creator.api.createPayment("owner", { ...body, kind: "RENEW" });
  clock.now += 9000;
  const reader = instance(jar, clock);
  for (let poll = 0; poll < 3; poll++) {
    assert.equal((await reader.api.getPayment("owner", order.id)).nextPaymentAt, order.nextPaymentAt);
  }
  const freshWorker = instance(jar, clock);
  await freshWorker.api.settlePendingPayments("owner");
  assert.equal(freshWorker.subscription.renewsAt, order.nextPaymentAt);
});

test("expired Vercel orders can still be read when generating a replacement code", async () => {
  const jar = new Map();
  const clock = { now: Date.now() };
  const creator = instance(jar, clock, { writable: true });
  const order = await creator.api.createPayment("owner", body);
  await creator.api.mockSimulatePayment("owner", order.id, "expire");
  assert.equal((await instance(jar, clock).api.getPayment("owner", order.id)).status, "EXPIRED");
  const replacement = await instance(jar, clock, { writable: true }).api.createPayment("owner", body);
  assert.notEqual(replacement.id, order.id);
  assert.equal((await instance(jar, clock).api.getPayment("owner", replacement.id)).status, "PENDING");
});

test("missing Vercel secret fails before opening a missing payment page; local mock is unchanged", async () => {
  const clock = { now: Date.now() };
  await assert.rejects(
    instance(new Map(), clock, { writable: true, key: "" }).api.createPayment("owner", body),
    { status: 503 },
  );
  const jar = new Map();
  const local = instance(jar, clock, { vercel: false, key: "" });
  const order = await local.api.createPayment("owner", body);
  assert.equal((await local.api.getPayment("owner", order.id)).status, "PENDING");
  assert.equal(jar.size, 0);
  await assert.rejects(instance(jar, clock, { vercel: false }).api.getPayment("owner", order.id), { status: 404 });
});
