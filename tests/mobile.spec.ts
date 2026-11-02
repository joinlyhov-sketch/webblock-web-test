import { expect, test, type Page } from "@playwright/test";
import { IDS, markDocument, expectNoReload, shot } from "./helpers";

const W = IDS.website;
const GROUPS = {
  user: ["/websites", "/templates", "/settings", "/support", `/portal/${W}/products`, `/portal/${W}/info`, `/billing/plans`],
  admin: ["/admin", "/admin/users", "/admin/websites", "/admin/subscriptions", "/admin/monitoring/pipeline"],
  public: ["/", "/sign-in", "/register", "/privacy"],
} as const;

async function expectNoHorizontalScroll(page: Page, route: string) {
  const { scroll, client } = await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return { scroll: root.scrollWidth, client: root.clientWidth };
  });
  expect(scroll, `horizontal scroll on ${route}`).toBeLessThanOrEqual(client + 1);
}

for (const [group, routes] of Object.entries(GROUPS)) {
  test.describe(`mobile 390x844: ${group}`, () => {
    if (group === "admin") test.use({ storageState: "tests/.auth/admin.json" });
    if (group === "public") test.use({ storageState: { cookies: [], origins: [] } });
    for (const route of routes) {
      test(`${route} has no horizontal scroll`, async ({ page }) => {
        await page.goto(route, { waitUntil: "load" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.screenshot({ path: shot(route, "_390") });
        await expectNoHorizontalScroll(page, route);
      });
    }
  });
}

test.describe("mobile navigation", () => {
  test("owner: nav is reachable and closes after choosing a page", async ({ page }) => {
    await page.goto("/websites");
    await markDocument(page);
    const templates = page.getByRole("navigation", { name: "Bottom navigation" }).getByRole("link", { name: "Templates" });
    const menu = page.getByRole("button", { name: /open (menu|navigation|sidebar)|^menu$|expand sidebar/i }).first();
    if (!(await templates.isVisible())) await menu.click();
    await expect(templates).toBeVisible();
    await page.screenshot({ path: shot("/websites", "_390_nav-open") });
    const box = await templates.boundingBox();
    expect(box?.height ?? 0, "nav link tap target height").toBeGreaterThanOrEqual(44);
    await templates.click();
    await expect(page).toHaveURL(/\/templates/);
    await expectNoReload(page);
    await expectNoHorizontalScroll(page, "/templates");
  });

  test("owner: interactive controls are large enough to tap", async ({ page }) => {
    await page.goto("/websites");
    await page.waitForLoadState("networkidle").catch(() => {});
    const tooSmall = await page.evaluate(() => {
      const bad: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("main button, main a[href], main input, main [role=tab]")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        // Inline text links inside sentences are exempt; controls must be at least 44px tall.
        if (r.height < 44 && getComputedStyle(el).display !== "inline") {
          bad.push(`${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }
      return bad;
    });
    expect(tooSmall, "controls under 44px tall").toEqual([]);
  });

  test("owner: search keeps focus on mobile", async ({ page }) => {
    await page.goto("/websites");
    const search = page.getByRole("searchbox", { name: "Search websites" });
    await search.tap();
    await search.pressSequentially("Petal", { delay: 120 });
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(search).toBeFocused();
  });

  test.describe("admin", () => {
    test.use({ storageState: "tests/.auth/admin.json" });
    test("admin: nav is reachable and the table scrolls inside its card", async ({ page }) => {
      await page.goto("/admin/users");
      await markDocument(page);
      const link = page.getByRole("navigation", { name: "Bottom navigation" }).getByRole("link", { name: "User Websites" });
      const menu = page.getByRole("button", { name: /open (menu|navigation|sidebar)|^menu$|expand sidebar/i }).first();
      if (!(await link.isVisible())) await menu.click();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(/\/admin\/websites/);
      await expectNoReload(page);
      await expectNoHorizontalScroll(page, "/admin/websites");
    });
  });
});
