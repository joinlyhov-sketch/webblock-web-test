import { expect, test } from "@playwright/test";
import { IDS, markDocument, expectNoReload } from "./helpers";
import { action, checkLayout } from "./responsive-helpers";

const portal = `/portal/${IDS.website}`;
for (const route of ["/websites", "/templates", "/settings", "/settings/profile", "/settings/billing", "/support", `${portal}/products`, `${portal}/info`, `${portal}/monitoring`]) {
  test(`responsive owner ${route}`, async ({ page }, info) => { await checkLayout(page, route, info); });
}
for (const route of ["/billing/plans", `/websites/${IDS.website}/edit`, `/websites/${IDS.website}/preview`, `/websites/${IDS.website}/draft`, `/websites/${IDS.website}/deploy`, `/templates/${IDS.template}/preview`, `/sites/${IDS.website}`]) {
  test(`focused screen ${route}`, async ({ page }, info) => { await checkLayout(page, route, info, false); });
}
test("product sheet scrolls, validates, and restores focus", async ({ page }) => {
  await action(page, "Open Products", () => page.goto(`${portal}/products`));
  const add = page.getByRole("button", { name: "Add product", exact: true });
  await action(page, "Tap Add product", () => add.click());
  const dialog = page.getByRole("dialog", { name: "Add product", exact: true });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  await action(page, "Submit empty product form", () => dialog.getByRole("button", { name: "Save product" }).click());
  await expect(dialog.getByRole("alert").first()).toBeVisible();
  await action(page, "Close product sheet with Escape", () => page.keyboard.press("Escape"));
  await expect(dialog).toBeHidden();
  await expect(add).toBeFocused();
});
test("touch search keeps focus without reloading", async ({ page }) => {
  await action(page, "Open My Websites", () => page.goto("/websites"));
  await markDocument(page);
  const search = page.getByRole("searchbox", { name: "Search websites" });
  await action(page, "Search websites > Petal", () => search.fill("Petal"));
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(search).toBeFocused();
  await expectNoReload(page);
});
test("notifications open and close on touch and desktop", async ({ page }) => {
  await action(page, "Open My Websites", () => page.goto("/websites"));
  await action(page, "Tap notification bell", () => page.getByRole("button", { name: /^Notifications/ }).filter({ visible: true }).click());
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  await action(page, "Close notifications with Escape", () => page.keyboard.press("Escape"));
  await expect(panel).toBeHidden();
});
test("business form fits and its submit stays reachable", async ({ page }) => {
  await action(page, "Open Business information > Edit", () => page.goto(`${portal}/info?edit=1`));
  const submit = page.getByRole("button", { name: "Save changes", exact: true }).filter({ visible: true });
  await expect(submit).toHaveCount(1);
  await action(page, "Scroll to opening hours", () => page.getByRole("combobox", { name: "Monday opens at" }).scrollIntoViewIfNeeded());
  const root = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(root.scroll).toBeLessThanOrEqual(root.width + 1);
});
