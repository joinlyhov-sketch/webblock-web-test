import { expect, type Page, type TestInfo } from "@playwright/test";
import { markDocument, expectNoReload, shot } from "./helpers";

export async function action(page: Page, message: string, run: () => Promise<unknown>) {
  console.log(message);
  await page.waitForTimeout(1000);
  await run();
}

export async function checkLayout(page: Page, route: string, info: TestInfo, dashboard = true) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await action(page, `Open ${route}`, async () => {
    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
  });
  await page.waitForLoadState("networkidle");
  const viewport = page.viewportSize()!;
  const mobile = viewport.width < 1024;
  const bottom = page.getByRole("navigation", { name: "Bottom navigation", exact: true });
  const header = page.getByRole("banner", { name: "Mobile header" });
  if (dashboard) {
    const sidebar = page.locator("#app-sidebar, #admin-sidebar, #owner-sidebar");
    if (mobile) {
      await expect(sidebar).toBeHidden();
      await expect(bottom).toBeVisible();
      await expect(header).toBeVisible();
      await expect(header.getByRole("link", { name: "WebBlock home" })).toBeVisible();
      await expect(header.getByRole("button", { name: /^Notifications/ })).toBeVisible();
      await expect(bottom.locator('[aria-current="page"]')).toHaveCount(route === "/admin/notifications" ? 0 : 1);
      expect(await bottom.getByRole("link").count() + await bottom.getByRole("button").count()).toBeLessThanOrEqual(5);
      await action(page, "Tap avatar > Account menu", () => header.getByRole("button", { name: "Open account menu" }).click());
      const dialog = page.getByRole("dialog", { name: "Account menu" });
      await expect(dialog.getByRole("link", { name: "Profile", exact: true })).toBeVisible();
      await expect(dialog.getByRole("link", { name: "Settings", exact: true })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Log out", exact: true })).toBeVisible();
      await action(page, "Close account menu", () => dialog.getByRole("button", { name: "Close account menu" }).click());
      const geometry = await page.locator("main.dashboard-content").evaluate((main) => ({ padding: parseFloat(getComputedStyle(main).paddingBottom) }));
      const bar = await bottom.boundingBox();
      expect(geometry.padding).toBeGreaterThan((bar?.height ?? 0) + 12);
      const target = bottom.getByRole("link").first();
      if (!route.startsWith("/portal/") || await target.count()) {
        await markDocument(page);
        const mount = await bottom.evaluate((element) => { (window as unknown as { __bottomElement: Element }).__bottomElement = element; return true; });
        expect(mount).toBe(true);
        // Preserve the screenshot's route, then verify a real client navigation in this layout.
        await page.screenshot({ path: shot(route, `_${viewport.width}x${viewport.height}`), animations: "disabled", fullPage: true });
        const next = bottom.getByRole("link").filter({ hasNot: page.locator('[aria-current="page"]') });
        const links = await bottom.getByRole("link").all();
        const destination = (await Promise.all(links.map(async (link) => ({ link, active: await link.getAttribute("aria-current") })))).find((entry) => !entry.active)?.link ?? next.first();
        await action(page, "Tap bottom bar > another section", () => destination.click());
        await expectNoReload(page);
        expect(await bottom.evaluate((element) => (window as unknown as { __bottomElement?: Element }).__bottomElement === element)).toBe(true);
        await action(page, "Return to the checked route", () => page.goBack());
        await expectNoReload(page);
      }
    } else {
      await expect(sidebar).toBeVisible();
      await expect(bottom).toBeHidden();
      await expect(header).toBeHidden();
    }
  } else {
    await expect(bottom).toBeHidden();
  }
  // Both the document and the main content must fit; horizontal table scrolling is local.
  const geometry = await page.evaluate(() => {
    const root = document.scrollingElement!;
    return { scroll: root.scrollWidth, width: root.clientWidth, main: [...document.querySelectorAll("main")].filter((el) => !el.closest('[role="img"], #website-canvas')).map((el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; }) };
  });
  expect(geometry.scroll, `page overflow on ${route}`).toBeLessThanOrEqual(geometry.width + 1);
  for (const main of geometry.main) { expect(main.left).toBeGreaterThanOrEqual(-1); expect(main.right).toBeLessThanOrEqual(viewport.width + 1); }
  if (mobile && dashboard) {
    const issues = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, [role="combobox"], input:not([type="hidden"]):not([type="file"]), textarea, a.flex, a.inline-flex')].flatMap((element) => {
      if (element.closest('[inert], [aria-hidden="true"]') || element.classList.contains("sr-only")) return [];
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!rect.width || !rect.height || style.visibility === "hidden") return [];
      const name = element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 35);
      const issues = rect.width < 43.9 || rect.height < 43.9 ? [`${name}: ${rect.width}×${rect.height}`] : [];
      if (element.matches('input,textarea,[role="combobox"]') && parseFloat(style.fontSize) < 16) issues.push(`${name}: font ${style.fontSize}`);
      return issues;
    }));
    expect(issues, "touch target or input font").toEqual([]);
  }
  if (!(mobile && dashboard)) await page.screenshot({ path: shot(route, `_${viewport.width}x${viewport.height}`), animations: "disabled", fullPage: true });
  expect(errors, `console errors on ${route}`).toEqual([]);
  await info.attach("viewport", { body: JSON.stringify(viewport), contentType: "application/json" });
}
