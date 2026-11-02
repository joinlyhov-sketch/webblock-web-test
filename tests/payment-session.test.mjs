import assert from "node:assert/strict";
import { test } from "node:test";
import { serverContext, testStorage } from "./helpers/server-context.mjs";

const OWNER = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";
const ADMIN = "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51";
const START = Date.now();
const body = {
  plan: "PRO", kind: "SUBSCRIBE", websiteId: null,
  websiteName: "Petal & Stem", websiteDomain: "petalstem.webblock.com",
  websiteImageUrl: "/images/billing/petal-and-stem.jpg",
};

test("pending and successful payment views survive different instances and browser sessions", async (t) => {
  const options = testStorage(t);
  const creator = serverContext({ ...options, now: START });
  const order = await creator.load("@/features/billing/api").createPayment(OWNER, body);
  assert.equal(order.status, "PENDING");
  const pending = await serverContext({ ...options, now: START + 1000 }).load("@/features/billing/service").getPaymentView(OWNER, order.id);
  assert.equal(pending.order.status, "PENDING");
  const success = await serverContext({ ...options, now: START + 9000 }).load("@/features/billing/service").getPaymentView(OWNER, order.id);
  assert.equal(success.order.status, "PAID");
  assert.equal(success.order.amount, "19.99");
  assert.equal(success.next.href, "/websites");
  const settings = await serverContext({ ...options, now: START + 9000 }).load("@/features/billing/service").getPaymentView(OWNER, order.id, { from: "settings" });
  assert.equal(settings.next.href, "/settings/billing");
});

test("subscription, history and receipt restore on independent requests", async (t) => {
  const options = testStorage(t);
  const order = await serverContext({ ...options, now: START }).load("@/features/billing/api").createPayment(OWNER, body);
  const account = serverContext({ ...options, now: START + 9000 }).load("@/features/account/api");
  const subscription = await account.getSubscription(OWNER);
  assert.equal(subscription.plan, "PRO");
  assert.equal(subscription.renewsAt, order.nextPaymentAt);
  await account.getSubscription(OWNER);
  const history = await account.listOrders(OWNER, {}, { page: 0, size: 100 });
  assert.equal(history.items.filter((entry) => entry.id === order.id).length, 1);
  const receipt = await serverContext({ ...options, now: START + 9000 }).load("@/features/account/api").getOrderReceipt(OWNER, order.id);
  assert.equal(Buffer.from(receipt.bytes).subarray(0, 5).toString(), "%PDF-");
});

test("renewal dates stay fixed across refreshes and older payment reads", async (t) => {
  const options = testStorage(t);
  const first = await serverContext({ ...options, now: START }).load("@/features/billing/api").createPayment(OWNER, body);
  const renewal = await serverContext({ ...options, now: START + 9000 }).load("@/features/billing/api").createPayment(OWNER, { ...body, kind: "RENEW" });
  assert.equal(Date.parse(renewal.nextPaymentAt) - Date.parse(first.nextPaymentAt), 30 * 86400000);
  const reader = serverContext({ ...options, now: START + 18000 });
  await reader.load("@/features/billing/api").getPayment(OWNER, renewal.id);
  await reader.load("@/features/billing/api").getPayment(OWNER, first.id);
  assert.equal((await reader.load("@/features/account/api").getSubscription(OWNER)).renewsAt, renewal.nextPaymentAt);
});

test("unknown orders and another user remain 404; old browser cookies cannot forge paid status", async (t) => {
  const options = testStorage(t);
  const order = await serverContext({ ...options, now: START }).load("@/features/billing/api").createPayment(OWNER, body);
  const forged = Buffer.from(JSON.stringify([{ ...order, status: "PAID", amount: "0.00" }])).toString("base64url");
  const api = serverContext({ ...options, now: START + 1000, cookies: new Map([["wb_mock_payments", forged]]) }).load("@/features/billing/api");
  await assert.rejects(api.getPayment(ADMIN, order.id), (e) => e.status === 404);
  await assert.rejects(api.getPayment(OWNER, crypto.randomUUID()), (e) => e.status === 404);
  const pending = await api.getPayment(OWNER, order.id);
  assert.equal(pending.status, "PENDING");
  assert.equal(pending.amount, "19.99");
});

test("older orders and larger metadata are retained beyond cookie limits", async (t) => {
  const options = testStorage(t);
  const orders = [];
  for (let i = 0; i < 5; i++) {
    orders.push(await serverContext({ ...options, now: START + i }).load("@/features/billing/api").createPayment(OWNER, {
      ...body, websiteImageUrl: "/" + "a".repeat(5000),
    }));
  }
  const reader = serverContext({ ...options, now: START + 9000 });
  assert.equal((await reader.load("@/features/billing/api").getPayment(OWNER, orders[0].id)).status, "PAID");
  const history = await reader.load("@/features/account/api").listOrders(OWNER, {}, { page: 0, size: 100 });
  assert.equal(history.items.filter((entry) => orders.some((order) => order.id === entry.id)).length, 5);
});

test("expiration simulation persists across instances without activating a plan", async (t) => {
  const options = testStorage(t);
  const api = serverContext({ ...options, now: START }).load("@/features/billing/api");
  const order = await api.createPayment(OWNER, body);
  await api.mockSimulatePayment(OWNER, order.id, "expire");
  const reader = serverContext({ ...options, now: START + 9000 });
  assert.equal((await reader.load("@/features/billing/api").getPayment(OWNER, order.id)).status, "EXPIRED");
  assert.equal((await reader.load("@/features/account/api").getSubscription(OWNER)).plan, "FREE_TRIAL");
});
