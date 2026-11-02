import { expect, type Page } from "@playwright/test";

/** Collects console errors, page errors and failed/4xx-5xx requests while a page is used. */
export function watchProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    // Cancelled prefetches / navigations away are normal.
    if (r.failure()?.errorText.includes("ERR_ABORTED")) return;
    problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().endsWith("favicon.ico")) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  return problems;
}

export function shot(route: string, suffix = "") {
  const name = route.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "home";
  return `test-results/screenshots/${name}${suffix}.png`;
}

/** Opens `path`, waits for it to settle, takes a screenshot and asserts nothing logged an error. */
export async function expectCleanLoad(page: Page, path: string) {
  const problems = watchProblems(page);
  const response = await page.goto(path, { waitUntil: "load" });
  expect(response?.status(), `${path} status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({ path: shot(path) });
  expect(problems, `${path} problems`).toEqual([]);
}

/** Put a marker on `window`; if it is still there after navigating, the page was not fully reloaded. */
export async function markDocument(page: Page) {
  await page.evaluate(() => ((window as unknown as { __marker: boolean }).__marker = true));
}
export async function expectNoReload(page: Page) {
  expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker), "full page reload happened").toBe(true);
}

export const IDS = {
  website: "7d3e9b2a-1c4f-4a8e-b6d5-3f2e1a9c8b70",
  template: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01",
};
