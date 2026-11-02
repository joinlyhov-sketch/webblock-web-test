// Run after pnpm build. Uses a temporary local data file and restarts a real Next server.
import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { serverContext } from "./helpers/server-context.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90";
const WEBSITE = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "webblock-production-smoke-"));
const stateFile = path.join(directory, "state.json");
let child;
let exited;

async function stop() {
  if (child && child.exitCode === null) {
    child.kill();
    await exited;
  }
  child = undefined;
}

async function start() {
  const probe = net.createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let output = "";
  let failure;
  child = spawn(process.execPath, [path.join(ROOT, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: ROOT, windowsHide: true,
    env: { ...process.env, NODE_ENV: "production", VERCEL: "", DATABASE_URL: "", POSTGRES_URL: "", WEBBLOCK_STATE_FILE: stateFile },
    stdio: ["ignore", "pipe", "pipe"],
  });
  exited = once(child, "exit");
  child.on("error", (error) => { failure = error; });
  child.stdout.on("data", (data) => { output = (output + data).slice(-8000); });
  child.stderr.on("data", (data) => { output = (output + data).slice(-8000); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (failure) throw failure;
    if (child.exitCode !== null) throw new Error(output);
    try {
      if ((await fetch(`${origin}/favicon.ico`)).ok) return origin;
    } catch { /* Server has not opened its socket yet. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Production server did not start: ${output}`);
}

async function html(origin, route, signedIn = false) {
  const response = await fetch(origin + route, { headers: signedIn ? { Cookie: "wb_role=USER" } : {} });
  const text = await response.text();
  assert.equal(response.status, 200, `${route}: ${text.slice(0, 300)}`);
  assert.ok(!text.includes("NEXT_HTTP_ERROR_FALLBACK;404"), route);
  return text;
}

try {
  const now = Date.now() - 25000;
  const seed = serverContext({ stateFile, now });
  const account = seed.load("@/features/account/api");
  const websites = seed.load("@/features/websites/api");
  const editor = seed.load("@/features/editor/api");
  await account.activatePlan(OWNER, "PRO", new Date(now + 30 * 86400000).toISOString());
  const page = await editor.getPageData(WEBSITE);
  page.draft.root.props.businessName = "Persistent public smoke";
  await editor.savePageData(WEBSITE, page.draft);
  const imageBytes = fs.readFileSync(path.join(ROOT, "src/app/apple-icon.png"));
  const asset = await editor.uploadMedia(WEBSITE, new File([imageBytes], "smoke.png", { type: "image/png" }));
  const deployment = await seed.load("@/features/deploy/api").startDeployment(WEBSITE, {
    idempotencyKey: crypto.randomUUID(), subdomain: "maple-and-rye",
  }, null);
  const existing = await websites.getWebsite(WEBSITE);
  const details = await seed.load("@/features/business-info/api").getBusinessInfo(WEBSITE);
  const created = await websites.createWebsite(OWNER, {
    ...existing, name: "Persistent ownership smoke",
    details: { ...details, businessName: "Persistent ownership smoke", businessType: existing.businessType },
  });
  await editor.publishPage(created.id, crypto.randomUUID());
  await websites.markWebsiteLive(created.id, "persistent-smoke.webblock.com");
  const order = await seed.load("@/features/billing/api").createPayment(OWNER, {
    plan: "PRO", kind: "RENEW", websiteId: null, websiteName: existing.name,
    websiteDomain: "maple-and-rye.webblock.com", websiteImageUrl: existing.thumbnailUrl,
  });

  for (const pass of ["first process", "restarted process"]) {
    const origin = await start();
    assert.ok((await html(origin, `/sites/${WEBSITE}`)).includes("Persistent public smoke"));
    assert.ok((await html(origin, `/sites/${created.id}`)).includes("Persistent ownership smoke"));
    assert.ok((await html(origin, `/websites/${created.id}/edit`, true)).includes("Persistent ownership smoke"));
    const progress = await html(origin, `/websites/${WEBSITE}/deploy?deployment=${deployment.id}`, true);
    assert.ok(progress.includes('aria-valuenow="100"'));
    assert.ok((await html(origin, `/billing/pay/${order.id}`, true)).includes("Paid"));
    const image = await fetch(origin + asset.url);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), imageBytes);
    const receipt = await fetch(`${origin}/api/receipts/${order.id}`, { headers: { Cookie: "wb_role=USER" } });
    assert.equal(receipt.status, 200);
    assert.equal(receipt.headers.get("content-type"), "application/pdf");
    const signedOut = await fetch(`${origin}/websites/${created.id}/edit`, { redirect: "manual" });
    assert.ok(signedOut.status >= 300 && signedOut.status < 400);
    console.log(`PASS (${pass}): public pages, new website ownership, deployment success, payment, receipt, uploaded image, and auth redirect.`);
    await stop();
  }
} finally {
  await stop();
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(directory).startsWith("webblock-production-smoke-"));
  fs.rmSync(directory, { recursive: true, force: true });
}
