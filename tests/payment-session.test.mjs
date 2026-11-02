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
const ADMIN = "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51";
const COOKIE = "wb_mock_payments";
const START = Date.now();
const compiled = new Map();
const body = {
  plan: "PRO", kind: "SUBSCRIBE", websiteId: null,
  websiteName: "Petal & Stem", websiteDomain: "petalstem.webblock.com",
  websiteImageUrl: "/images/billing/petal-and-stem.jpg",
};

// Each VM has its own module cache/globalThis, like a separate Vercel instance.
// Only the browser cookie jar survives. Actual billing/account code and fixtures run;
// framework cookies, delays and unrelated website listing are the only stubs.
function instance(jar = new Map(), now = START, readOnly = false) {
  const writes = [];
  class Clock extends Date {
    static now() { return now; }
  }
  const context = vm.createContext({
    crypto: globalThis.crypto, Date: Clock, Buffer, structuredClone, TextEncoder,
    process: { env: { NODE_ENV: "production" } },
  });
  const cache = new Map();
  const cookieStore = {
    get: (name) => jar.has(name) ? { value: jar.get(name) } : undefined,
    set: (name, value, options) => {
      assert.equal(readOnly, false, "Server Component reads must not write cookies");
      writes.push({ name, value, options });
      jar.set(name, value);
    },
  };
  function load(specifier, parent = path.join(ROOT, "src", "entry.ts")) {
    if (specifier === "next/headers") return { cookies: async () => cookieStore };
    if (specifier === "next/navigation") return {
      notFound() { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); },
    };
    if (specifier === "@/lib/api/delay") return { delay: async () => {} };
    if (specifier === "@/features/websites/api") return {
      listWebsites: async () => ({ items: [], totalItems: 0 }),
    };
    if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return nodeRequire(specifier);
    let filename = specifier.startsWith("@/")
      ? path.join(ROOT, "src", specifier.slice(2))
      : path.resolve(path.dirname(parent), specifier);
    filename = [filename + ".ts", path.join(filename, "index.ts")].find(fs.existsSync);
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
  return {
    billing: load("@/features/billing/api"),
    account: load("@/features/account/api"),
    service: load("@/features/billing/service"),
    writes,
  };
}

test("pending and successful payment views survive switching instances", async () => {
  const jar = new Map();
  const creator = instance(jar);
  const order = await creator.billing.createPayment(OWNER, body);
  assert.equal(order.status, "PENDING");
  const cookie = creator.writes[0];
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.path, "/");
  assert.equal(cookie.options.sameSite, "lax");
  const pending = await instance(jar, START + 1000, true).service.getPaymentView(OWNER, order.id);
  assert.equal(pending.order.status, "PENDING");
  const success = await instance(jar, START + 9000, true).service.getPaymentView(OWNER, order.id);
  assert.equal(success.order.status, "PAID");
  assert.equal(success.order.amount, "19.99");
  assert.equal(success.next.href, "/websites");
  const settings = await instance(jar, START + 9000, true).service.getPaymentView(OWNER, order.id, { from: "settings" });
  assert.equal(settings.next.href, "/settings/billing");
});

test("subscription, history and receipt restore on independent requests", async () => {
  const jar = new Map();
  const order = await instance(jar).billing.createPayment(OWNER, body);
  const subscription = await instance(jar, START + 9000, true).account.getSubscription(OWNER);
  assert.equal(subscription.plan, "PRO");
  assert.equal(subscription.renewsAt, order.nextPaymentAt);
  const reader = instance(jar, START + 9000, true);
  await reader.billing.getPayment(OWNER, order.id);
  await reader.billing.getPayment(OWNER, order.id);
  const history = await reader.account.listOrders(OWNER, {}, { page: 0, size: 100 });
  assert.equal(history.items.filter((entry) => entry.id === order.id).length, 1);
  const receipt = await instance(jar, START + 9000, true).account.getOrderReceipt(OWNER, order.id);
  assert.equal(Buffer.from(receipt.bytes).subarray(0, 5).toString(), "%PDF-");
});

test("renewals keep a fixed end date across refreshes and older order reads", async () => {
  const jar = new Map();
  const first = await instance(jar).billing.createPayment(OWNER, body);
  const renewal = await instance(jar, START + 9000).billing.createPayment(OWNER, { ...body, kind: "RENEW" });
  assert.equal(Date.parse(renewal.nextPaymentAt) - Date.parse(first.nextPaymentAt), 30 * 86400000);
  const reader = instance(jar, START + 18000, true);
  await reader.billing.getPayment(OWNER, renewal.id);
  await reader.billing.getPayment(OWNER, first.id);
  const subscription = await reader.account.getSubscription(OWNER);
  assert.equal(subscription.renewsAt, renewal.nextPaymentAt);
  const fresh = await instance(jar, START + 19000, true).account.getSubscription(OWNER);
  assert.equal(fresh.renewsAt, renewal.nextPaymentAt);
});

test("unknown orders, another user and missing or malformed cookies remain 404", async () => {
  const jar = new Map();
  const order = await instance(jar).billing.createPayment(OWNER, body);
  const reader = instance(jar, START + 9000, true);
  await assert.rejects(reader.billing.getPayment(ADMIN, order.id), (e) => e.status === 404);
  await assert.rejects(reader.billing.getPayment(OWNER, crypto.randomUUID()), (e) => e.status === 404);
  for (const value of [undefined, "invalid", Buffer.from('[{"id":"bad"}]').toString("base64url")]) {
    const missing = new Map(value ? [[COOKIE, value]] : []);
    await assert.rejects(instance(missing, START, true).billing.getPayment(OWNER, order.id), (e) => e.status === 404);
  }
});

test("session size stays under cookie limits and retains the newest payment", async () => {
  const jar = new Map();
  let newest;
  for (let i = 0; i < 5; i++) {
    newest = await instance(jar, START + i).billing.createPayment(OWNER, {
      ...body, websiteName: "ផ្កា".repeat(40), websiteImageUrl: "/" + "a".repeat(800),
    });
    assert.ok(Buffer.byteLength(jar.get(COOKIE)) <= 3800);
  }
  const stored = JSON.parse(Buffer.from(jar.get(COOKIE), "base64url").toString());
  assert.ok(stored.length <= 3);
  assert.equal(stored.at(-1).id, newest.id);
  assert.equal((await instance(jar, START + 9000, true).billing.getPayment(OWNER, newest.id)).status, "PAID");
});

test("development expiration simulation does not activate a plan", async () => {
  const jar = new Map();
  const reader = instance(jar);
  const order = await reader.billing.createPayment(OWNER, body);
  await reader.billing.mockSimulatePayment(OWNER, order.id, "expire");
  assert.equal((await reader.billing.getPayment(OWNER, order.id)).status, "EXPIRED");
  assert.equal((await reader.account.getSubscription(OWNER)).plan, "FREE_TRIAL");
});
