import { expect, test } from "@playwright/test";
import { expectCleanLoad, expectNoReload, IDS, markDocument, shot } from "./helpers";

const W = IDS.website;
const USER_ROUTES = [
  "/websites",
  "/templates",
  "/settings",
  "/settings/profile",
  "/settings/billing",
  "/support",
  "/billing/plans",
  `/portal/${W}/products`,
  `/portal/${W}/info`,
  `/portal/${W}/monitoring`,
];

test.describe("owner routes load clean", () => {
  for (const route of USER_ROUTES) {
    test(route, async ({ page }) => {
      await expectCleanLoad(page, route);
    });
  }
});

test("owner cannot open the admin portal", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/websites/);
});

test("sidebar links change page without a full reload", async ({ page }) => {
  await page.goto("/websites");
  await markDocument(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const [name, url] of [
    ["Templates", /\/templates$/],
    ["Settings", /\/settings/],
    ["Contact Support", /\/support$/],
    ["My Websites", /\/websites$/],
  ] as const) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
  }
  await expectNoReload(page);
});

test("sidebar collapses and expands", async ({ page }) => {
  await page.goto("/websites");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
});

test.describe("My Websites", () => {
  test("search filters cards without reloading and keeps focus", async ({ page }) => {
    await page.goto("/websites");
    await markDocument(page);
    const cards = page.getByRole("article");
    const total = await cards.count();
    expect(total).toBeGreaterThan(1);
    const search = page.getByRole("searchbox", { name: "Search websites" });
    await search.click();
    await search.pressSequentially("Petal", { delay: 120 });
    await expect(cards).toHaveCount(1);
    await expect(search).toBeFocused();
    await expect(page).toHaveURL(/q=Petal/);
    await expectNoReload(page);
    await page.screenshot({ path: shot("/websites", "_search") });
    await search.fill("zzzz-nothing");
    await expect(cards).toHaveCount(0);
    await search.fill("");
    await expect(cards).toHaveCount(total);
  });

  test("status tabs filter cards", async ({ page }) => {
    await page.goto("/websites");
    await markDocument(page);
    const tabs = page.getByRole("navigation", { name: "Filter websites by status" });
    await tabs.getByRole("button", { name: /^Live/ }).click();
    await expect(tabs.getByRole("button", { name: /^Live/ })).toHaveAttribute("aria-pressed", "true");
    const live = await page.getByRole("article").count();
    await tabs.getByRole("button", { name: /^Draft/ }).click();
    await expect(tabs.getByRole("button", { name: /^Draft/ })).toHaveAttribute("aria-pressed", "true");
    expect(await page.getByRole("article").count()).not.toBe(live);
    await expectNoReload(page);
  });
});

test.describe("Templates", () => {
  test("search narrows the catalogue", async ({ page }) => {
    await page.goto("/templates");
    await markDocument(page);
    const cards = page.getByRole("article");
    const total = await cards.count();
    const search = page.getByRole("searchbox", { name: "Search templates" });
    await search.pressSequentially("pastel", { delay: 120 });
    await expect(cards).toHaveCount(1);
    await expect(search).toBeFocused();
    await search.fill("");
    await expect(cards).toHaveCount(total);
    await expectNoReload(page);
  });

  test("category dropdown opens and filters", async ({ page }) => {
    await page.goto("/templates");
    const total = await page.getByRole("article").count();
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "Clothes" }).click();
    await expect.poll(() => page.getByRole("article").count()).toBeLessThan(total);
  });

  test("preview link opens the template preview", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("link", { name: "Preview" }).first().click();
    await expect(page).toHaveURL(/\/templates\/.+\/preview/);
  });
});

test.describe("Settings", () => {
  test("Profile and Billing tabs switch without a reload", async ({ page }) => {
    await page.goto("/settings");
    await markDocument(page);
    const tabs = page.getByRole("navigation", { name: "Settings sections" });
    await tabs.getByRole("button", { name: "Billing" }).click();
    await expect(page.getByRole("heading", { name: "Billing history", exact: true })).toBeVisible();
    await tabs.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByRole("textbox", { name: "Full name" })).toBeVisible();
    await expectNoReload(page);
  });

  test("profile name is validated", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("textbox", { name: "Full name" }).fill("");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(/enter your (full )?name|required|too short|at least/i).first()).toBeVisible();
  });

  test("profile name saves", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("textbox", { name: "Full name" }).fill("Sovannarith Soeun");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(/saved|updated/i).first()).toBeVisible();
  });

  test("set password validates mismatch", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("textbox", { name: "New password" }).fill("longenough1");
    await page.getByRole("textbox", { name: "Confirm password" }).fill("different1");
    await page.getByRole("button", { name: "Set password" }).click();
    await expect(page.getByText(/match/i).first()).toBeVisible();
  });

  test("billing history filter tabs and rows select", async ({ page }) => {
    await page.goto("/settings/billing");
    await markDocument(page);
    const tabs = page.getByRole("navigation", { name: "Filter billing history" });
    await tabs.getByRole("button", { name: "Paid" }).click();
    await expect(tabs.getByRole("button", { name: "Paid" })).toHaveAttribute("aria-pressed", "true");
    await tabs.getByRole("button", { name: "All" }).click();
    await page.getByRole("combobox", { name: "Rows per page" }).click();
    await page.getByRole("option", { name: "20" }).click();
    await expectNoReload(page);
  });
});

test("contact support form requires subject and message", async ({ page }) => {
  await page.goto("/support");
  await page.getByRole("button", { name: "Send email" }).click();
  await expect(page.getByText(/enter|required|add a|write|subject|message/i).first()).toBeVisible();
});

test.describe("Products (owner portal)", () => {
  test("search, category tab and layout toggle work without a reload", async ({ page }) => {
    await page.goto(`/portal/${W}/products`);
    await markDocument(page);
    const search = page.getByRole("searchbox", { name: "Search products" });
    await search.pressSequentially("bouquet", { delay: 120 });
    await expect(page.getByRole("article")).not.toHaveCount(0);
    await expect(search).toBeFocused();
    await search.fill("zzzz-nothing");
    await expect(page.getByRole("article")).toHaveCount(0);
    await search.fill("");
    await page.getByRole("navigation", { name: "Filter by category" }).getByRole("button", { name: /^Flowers/ }).click();
    await page.getByRole("button", { name: "List view" }).click();
    await expect(page.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
    await expectNoReload(page);
  });

  test("Add product dialog opens, validates and closes with Esc", async ({ page }) => {
    await page.goto(`/portal/${W}/products`);
    await page.getByRole("button", { name: "Add product" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /^(add|save|create)/i }).last().click();
    await expect(dialog.getByText(/enter|required|add a|name/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test("owner sub-navigation works without a reload", async ({ page }) => {
  await page.goto(`/portal/${W}/products`);
  await markDocument(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Business information" }).click();
  await expect(page).toHaveURL(/\/info/);
  await nav.getByRole("link", { name: "Monitor" }).click();
  await expect(page).toHaveURL(/\/monitoring/);
  await expectNoReload(page);
});

test("notifications bell opens and Esc closes it", async ({ page }) => {
  await page.goto("/websites");
  await page.getByRole("button", { name: /^Notifications/ }).click();
  const panel = page.getByRole("dialog").or(page.getByRole("menu")).first();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});
