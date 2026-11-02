import { expect, test } from "@playwright/test";
import { expectCleanLoad, expectNoReload, markDocument, shot } from "./helpers";

const ADMIN_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/websites",
  "/admin/subscriptions",
  "/admin/subscriptions/plans",
  "/admin/monitoring",
  "/admin/monitoring/pipeline",
  "/admin/monitoring/activity",
  "/admin/notifications",
];

test.describe("admin routes load clean", () => {
  for (const route of ADMIN_ROUTES) {
    test(route, async ({ page }) => {
      await expectCleanLoad(page, route);
    });
  }
});

test("admin sidebar navigates without a full reload", async ({ page }) => {
  await page.goto("/admin");
  await markDocument(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const [name, url] of [
    ["User Accounts", /\/admin\/users/],
    ["User Websites", /\/admin\/websites/],
    ["Subscriptions", /\/admin\/subscriptions/],
    ["Overview", /\/admin$/],
  ] as const) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
  }
  await expectNoReload(page);
});

test("admin Monitoring group opens its pages", async ({ page }) => {
  await page.goto("/admin");
  await markDocument(page);
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: /Monitoring/ }).click();
  await page.getByRole("link", { name: "Activity Log" }).click();
  await expect(page).toHaveURL(/monitoring\/activity/);
  await expectNoReload(page);
});

test.describe("User Accounts table", () => {
  test("search keeps focus, filters rows and does not reload", async ({ page }) => {
    await page.goto("/admin/users");
    await markDocument(page);
    const search = page.getByRole("searchbox", { name: "Search by name or email" });
    await search.click();
    await search.pressSequentially("lihov", { delay: 120 });
    await expect(page).toHaveURL(/q=lihov/);
    await expect(search).toBeFocused();
    await expect(page.getByRole("row", { name: /lihov/i })).toHaveCount(1);
    await page.screenshot({ path: shot("/admin/users", "_search") });
    await search.fill("zzzz-nothing");
    await expect(page.getByText(/No accounts match/)).toBeVisible();
    await expectNoReload(page);
  });

  test("plan filter, sort and rows-per-page update the table", async ({ page }) => {
    await page.goto("/admin/users");
    await markDocument(page);
    await page.getByRole("button", { name: "Plan: All" }).click();
    await page.getByRole("menuitem", { name: /Free trial/ }).or(page.getByRole("link", { name: /Free trial/ })).first().click();
    await expect(page).toHaveURL(/plan=FREE_TRIAL/);
    await page.getByRole("link", { name: /Joined , sort/ }).click();
    await expect(page).toHaveURL(/sort=joinedAt/);
    await page.getByRole("combobox", { name: "Rows per page" }).click();
    await page.getByRole("option", { name: "20" }).click();
    await expect(page).toHaveURL(/size=20/);
    await expectNoReload(page);
  });

  test("pagination moves to page 2", async ({ page }) => {
    await page.goto("/admin/users?size=5");
    await markDocument(page);
    await page.getByRole("link", { name: /^(2|go to page 2)$/i }).first().click();
    await expect(page).toHaveURL(/page=2/);
    await expectNoReload(page);
  });

  test("account popup opens and Esc closes it", async ({ page }) => {
    await page.goto("/admin/users");
    await page.getByRole("table", { name: "User accounts" }).locator("tbody").getByRole("link").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.screenshot({ path: shot("/admin/users", "_popup") });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/user=/);
  });

  test("row actions menu opens", async ({ page }) => {
    await page.goto("/admin/users");
    await page.getByRole("button", { name: /^Actions for/ }).first().click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  });
});

test("User Websites status tabs and detail popup", async ({ page }) => {
  await page.goto("/admin/websites");
  await markDocument(page);
  await page.getByRole("link", { name: /^Failed/ }).click();
  await expect(page).toHaveURL(/release=FAILED/);
  await page.getByRole("table", { name: "User websites" }).locator("tbody").getByRole("link").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expectNoReload(page);
});

test("Subscriptions search and detail popup", async ({ page }) => {
  await page.goto("/admin/subscriptions");
  await markDocument(page);
  const search = page.getByRole("searchbox", { name: "Search by user or website" });
  await search.click();
  await search.pressSequentially("bakery", { delay: 120 });
  await expect(page).toHaveURL(/q=bakery/);
  await expect(search).toBeFocused();
  await page.getByRole("table", { name: "Subscriptions" }).locator("tbody").getByRole("link").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expectNoReload(page);
});

test("Manage plans: edit dialog opens and Esc closes it", async ({ page }) => {
  await page.goto("/admin/subscriptions/plans");
  await page.getByRole("link", { name: "Edit plan" }).nth(1).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("Pipeline stage tabs and Activity filter links", async ({ page }) => {
  await page.goto("/admin/monitoring/pipeline");
  await markDocument(page);
  await page.getByRole("link", { name: "Generation", exact: true }).click();
  await expect(page).toHaveURL(/stage=GENERATION/);
  await expectNoReload(page);
  await page.goto("/admin/monitoring/activity");
  await markDocument(page);
  await page.getByRole("link", { name: "Suspend hosting" }).click();
  await expect(page).toHaveURL(/action=SUSPEND_HOSTING/);
  await expectNoReload(page);
});

test("admin notification bell and profile menu open", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: /^Notifications/ }).click();
  const panel = page.getByRole("dialog").or(page.getByRole("menu")).first();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await page.getByRole("button", { name: "Admin profile" }).click();
  await expect(page.getByRole("menu").or(page.getByRole("dialog")).first()).toBeVisible();
});
