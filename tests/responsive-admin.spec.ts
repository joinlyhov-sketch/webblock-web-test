import { expect, test } from "@playwright/test";
import { action, checkLayout } from "./responsive-helpers";
import { expectNoReload, markDocument } from "./helpers";
test.use({ storageState: "tests/.auth/admin.json" });
for (const route of ["/admin", "/admin/users", "/admin/websites", "/admin/subscriptions", "/admin/subscriptions/plans", "/admin/monitoring", "/admin/monitoring/pipeline", "/admin/monitoring/activity", "/admin/notifications"]) {
  test(`responsive admin ${route}`, async ({ page }, info) => { await checkLayout(page, route, info); });
}
test("Monitoring sheet navigates without a reload", async ({ page }) => {
  await action(page, "Open Admin", () => page.goto("/admin"));
  await markDocument(page);
  const mobile = page.viewportSize()!.width < 1024;
  const navigation = page.getByRole("navigation", { name: mobile ? "Bottom navigation" : "Main", exact: true });
  await action(page, "Tap navigation > Monitoring", () => navigation.getByRole("button", { name: "Monitoring", exact: true }).click());
  await action(page, "Tap Monitoring > Activity Log", () => page.getByRole("link", { name: "Activity Log", exact: true }).filter({ visible: true }).click());
  await expect(page).toHaveURL(/\/admin\/monitoring\/activity$/);
  await expectNoReload(page);
  if (mobile) await expect(page.getByRole("dialog", { name: "Monitoring", exact: true })).toBeHidden();
});
test("account details open from a phone card or desktop row", async ({ page }) => {
  await action(page, "Open User Accounts", () => page.goto("/admin/users"));
  await action(page, "Open first account details", () => page.getByRole("table", { name: "User accounts" }).locator("tbody").getByRole("link").first().click());
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  await action(page, "Close account details", () => page.keyboard.press("Escape"));
  await expect(dialog).toBeHidden();
});
