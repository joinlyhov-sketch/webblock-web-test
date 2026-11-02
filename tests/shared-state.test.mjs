import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { serverContext, testStorage as fixture } from "./helpers/server-context.mjs";

const WEBSITE = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";
const OWNER = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";

test("a published site survives a new instance and a visitor with no owner cookies", async (t) => {
  const options = fixture(t);
  const owner = serverContext(options);
  const editor = owner.load("@/features/editor/api");
  const page = await editor.getPageData(WEBSITE);
  page.draft.root.props.businessName = "Published across instances";
  await editor.savePageData(WEBSITE, page.draft);
  await editor.publishPage(WEBSITE, crypto.randomUUID());
  await owner.load("@/features/websites/api").markWebsiteLive(WEBSITE, "maple-and-rye.webblock.com");
  const visitor = serverContext({ ...options, cookies: new Map() });
  const published = await visitor.load("@/features/editor/api").getPublishedPage(WEBSITE);
  assert.equal(published.root.props.businessName, "Published across instances");
});

test("a newly created website retains its ownership on a different instance", async (t) => {
  const options = fixture(t);
  const owner = serverContext(options);
  const websites = owner.load("@/features/websites/api");
  const existing = await websites.getWebsite(WEBSITE);
  const details = await owner.load("@/features/business-info/api").getBusinessInfo(WEBSITE);
  const created = await websites.createWebsite(OWNER, {
    ...existing, name: "New persistent bakery",
    details: { ...details, businessName: "New persistent bakery", businessType: existing.businessType },
  });
  const other = serverContext(options);
  const retrieved = await other.load("@/features/websites/api").getWebsite(created.id);
  assert.equal(retrieved.name, created.name);
  assert.equal((await other.load("@/lib/auth/session").requireWebsiteOwner(created.id)).id, OWNER);
  assert.equal((await other.load("@/features/editor/api").getPageData(created.id)).draft.root.props.businessName, created.name);
});

test("uploaded media remains available from a different instance without cookies", async (t) => {
  const options = fixture(t);
  const owner = serverContext(options);
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const asset = await owner.load("@/features/editor/api").uploadMedia(WEBSITE, new File([bytes], "photo.png", { type: "image/png" }));
  const visitor = serverContext({ ...options, cookies: new Map() });
  const file = await visitor.load("@/features/editor/api").getMediaFile(asset.id);
  assert.equal(file.type, "image/png");
  assert.deepEqual(Array.from(file.bytes), Array.from(bytes));
});

test("products, categories, edits and deletion persist across instances", async (t) => {
  const options = fixture(t);
  const products = serverContext(options).load("@/features/products/api");
  await products.createProductCategory(WEBSITE, "Persistent category");
  const product = await products.createProduct(WEBSITE, {
    name: "A new pastry", category: "Persistent category", description: "Baked today", price: "4.50",
  });
  const other = serverContext(options).load("@/features/products/api");
  assert.equal((await other.getProduct(WEBSITE, product.id)).name, "A new pastry");
  await other.updateProduct(WEBSITE, product.id, { ...product, name: "An edited pastry", price: "5.00" });
  const fresh = serverContext(options).load("@/features/products/api");
  assert.equal((await fresh.getProduct(WEBSITE, product.id)).price, "5.00");
  assert.ok((await fresh.listProductCategories(WEBSITE)).includes("Persistent category"));
  await fresh.deleteProduct(WEBSITE, product.id);
  await assert.rejects(serverContext(options).load("@/features/products/api").getProduct(WEBSITE, product.id), (e) => e.status === 404);
});

test("saved business details survive and are applied to published pages", async (t) => {
  const options = fixture(t);
  const infoApi = serverContext(options).load("@/features/business-info/api");
  const info = await infoApi.getBusinessInfo(WEBSITE);
  await infoApi.updateBusinessInfo(WEBSITE, { ...info, phone: "+85512345678", address: "A persistent bakery address" });
  const other = serverContext(options);
  assert.equal((await other.load("@/features/business-info/api").getBusinessInfo(WEBSITE)).address, "A persistent bakery address");
  await other.load("@/features/editor/api").publishPage(WEBSITE, crypto.randomUUID());
  const published = await serverContext({ ...options, cookies: new Map() }).load("@/features/editor/api").getPublishedPage(WEBSITE);
  assert.ok(JSON.stringify(published).includes("A persistent bakery address"));
});

test("draft isolation, saved versions, restore and publish idempotency survive cold starts", async (t) => {
  const options = fixture(t);
  const editor = serverContext(options).load("@/features/editor/api");
  const page = await editor.getPageData(WEBSITE);
  page.draft.root.props.businessName = "First publication";
  await editor.savePageData(WEBSITE, page.draft);
  const key = crypto.randomUUID();
  await editor.publishPage(WEBSITE, key);
  const other = serverContext(options).load("@/features/editor/api");
  await other.publishPage(WEBSITE, key);
  const versions = await other.listVersions(WEBSITE);
  assert.equal(versions.length, 1);
  const saved = await other.getPageData(WEBSITE);
  saved.draft.root.props.businessName = "Second draft";
  await other.savePageData(WEBSITE, saved.draft);
  assert.equal((await serverContext(options).load("@/features/editor/api").getPublishedPage(WEBSITE)).root.props.businessName, "First publication");
  await other.publishPage(WEBSITE, crypto.randomUUID());
  assert.equal((await serverContext(options).load("@/features/editor/api").listVersions(WEBSITE)).length, 2);
  await serverContext(options).load("@/features/editor/api").restoreVersion(WEBSITE, versions[0].id);
  const restored = await serverContext(options).load("@/features/editor/api").getPageData(WEBSITE);
  assert.equal(restored.published.root.props.businessName, "First publication");
  assert.equal(restored.draft.root.props.businessName, "First publication");
});

test("draft and suspended sites stay private across instances", async (t) => {
  const options = fixture(t);
  const visitor = () => serverContext({ ...options, cookies: new Map() }).load("@/features/editor/api");
  await assert.rejects(visitor().getPublishedPage(WEBSITE), (e) => e.status === 404);
  await assert.rejects(visitor().getPublishedPage(crypto.randomUUID()), (e) => e.status === 404);
  await serverContext(options).load("@/features/editor/api").publishPage(WEBSITE, crypto.randomUUID());
  const websites = serverContext(options).load("@/features/websites/api");
  await websites.markWebsiteLive(WEBSITE, "maple-and-rye.webblock.com");
  await websites.suspendWebsite(WEBSITE);
  await assert.rejects(visitor().getPublishedPage(WEBSITE), (e) => e.status === 404);
  await serverContext(options).load("@/features/websites/api").reactivateWebsite(WEBSITE);
  assert.ok((await visitor().getPublishedPage(WEBSITE)).root);
});

test("profile, avatar and password verification survive a different server instance", async (t) => {
  const options = fixture(t);
  const account = serverContext(options).load("@/features/account/api");
  await account.updateProfile(OWNER, { fullName: "Persistent Owner" });
  await account.updateAvatar(OWNER, "/mock/avatars/persistent.png");
  await account.setPassword(OWNER, { newPassword: "First demo password" });
  const other = serverContext(options).load("@/features/account/api");
  const profile = await other.getProfile(OWNER);
  assert.equal(profile.fullName, "Persistent Owner");
  assert.equal(profile.avatarUrl, "/mock/avatars/persistent.png");
  await assert.rejects(other.setPassword(OWNER, { currentPassword: "Wrong value", newPassword: "Second demo password" }), (e) => e.status === 400);
  await other.setPassword(OWNER, { currentPassword: "First demo password", newPassword: "Second demo password" });
  const persisted = fs.readFileSync(options.stateFile, "utf8");
  assert.ok(!persisted.includes("First demo password"));
  assert.ok(!persisted.includes("Second demo password"));
});

test("owner and admin notification read state and admin changes persist", async (t) => {
  const options = fixture(t);
  await serverContext(options).load("@/features/notifications/api").markAllNotificationsRead(OWNER);
  assert.ok((await serverContext(options).load("@/features/notifications/api").listNotifications(OWNER)).items.every((n) => n.read));
  const admin = serverContext(options).load("@/features/admin/api");
  await admin.markAllNotificationsRead();
  await admin.suspendUser(OWNER);
  const plan = (await admin.listPlans()).items.find((entry) => entry.code === "PRO");
  await admin.updatePlan(plan.id, { ...plan, priceMonthly: "24.99" });
  const other = serverContext(options).load("@/features/admin/api");
  assert.equal(await other.getUnreadNotificationCount(), 0);
  assert.equal((await other.getUser(OWNER)).status, "SUSPENDED");
  assert.equal((await other.getPlan(plan.id)).priceMonthly, "24.99");
  await other.suspendWebsite(WEBSITE);
  assert.equal((await serverContext(options).load("@/features/admin/api").getWebsite(WEBSITE)).siteStatus, "SUSPENDED");
});

test("concurrent instances preserve all changes rather than overwriting each other", async (t) => {
  const options = fixture(t);
  await serverContext(options).load("@/features/products/api").listProductCategories(WEBSITE);
  await Promise.all(Array.from({ length: 8 }, (_, index) => serverContext(options).load("@/features/products/api")
    .createProductCategory(WEBSITE, `Concurrent category ${index}`)));
  const categories = await serverContext(options).load("@/features/products/api").listProductCategories(WEBSITE);
  for (let index = 0; index < 8; index++) assert.ok(categories.includes(`Concurrent category ${index}`));
});

test("failed operations roll back partial changes and Vercel cannot silently use memory", async (t) => {
  const options = fixture(t);
  const state = serverContext(options).load("@/lib/mock-state");
  await assert.rejects(state.withMockState(async () => {
    state.mockCollection("rollback-check", []).push("partial");
    throw new Error("Operation failed");
  }), /Operation failed/);
  const fresh = serverContext(options).load("@/lib/mock-state");
  assert.equal(await fresh.withMockState(async () => fresh.mockCollection("rollback-check", []).length), 0);
  const unconfigured = serverContext({ ...options, env: { VERCEL: "1" } }).load("@/features/websites/api");
  await assert.rejects(unconfigured.getWebsite(WEBSITE), (e) => e.status === 503 && e.message.includes("DATABASE_URL"));
});
