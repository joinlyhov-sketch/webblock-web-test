import { expect, test, type Page } from "@playwright/test";
import { IDS, markDocument, expectNoReload, shot, watchProblems } from "./helpers";
import { action } from "./responsive-helpers";

async function expectInViewport(page: Page, locator: ReturnType<Page["getByRole"]>) {
  await expect(locator).toBeVisible();
  const bounds = await locator.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

test("mock payment fits and confirms without reloading", async ({ page }) => {
  const problems = watchProblems(page);
  await action(page, "Open billing plans with mock user", () => page.goto("/billing/plans"));
  await markDocument(page);
  await action(page, "Choose or renew mock Plus plan", () => page.getByRole("button", { name: /^(Choose|Renew) Plus$/ }).click());
  await action(page, "Confirm mock payment order", () => page.getByRole("button", { name: "Continue to payment", exact: true }).click());
  await expect(page).toHaveURL(/\/billing\/pay\/[^/?]+$/);
  await expectNoReload(page);
  await expectInViewport(page, page.getByRole("img", { name: "KHQR code" }));
  await expectInViewport(page, page.getByText("Billed monthly · cancel anytime", { exact: true }));
  await expectInViewport(page, page.getByText("Scan with your banking app", { exact: true }));
  const domain = page.getByText("petalandstem.webblock.com", { exact: true });
  const domainFit = await domain.evaluate((element) => {
    const text = element.getBoundingClientRect();
    const tile = element.closest("div.rounded-\\[18px\\]")!.getBoundingClientRect();
    return { right: text.right, tileRight: tile.right };
  });
  expect(domainFit.right, "website domain stays inside its summary tile").toBeLessThanOrEqual(domainFit.tileRight + 1);
  const viewport = page.viewportSize()!;
  await page.screenshot({ path: shot("billing_payment_pending", `_${viewport.width}x${viewport.height}`), fullPage: true, animations: "disabled" });
  const root = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(root.scroll).toBeLessThanOrEqual(root.width + 1);
  // The production mock bank confirms after eight seconds; no real payment is made.
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await expectInViewport(page, page.getByText(/Paid via KHQR/));
  await expect(page).toHaveURL(/\/websites$/);
  await expectNoReload(page);
  expect(problems).toEqual([]);
});

test("editor panels open, fit, and close on phones and tablets", async ({ page }) => {
  test.skip(page.viewportSize()!.width >= 1024, "Desktop uses inline panels covered by editor tests.");
  const problems = watchProblems(page);
  await action(page, "Open editor", () => page.goto(`/websites/${IDS.website}/edit`));
  for (const [button, label, region] of [
    ["Show page panel", "Page panel", "Page"],
    ["Show settings panel", "Settings panel", "Block settings"],
  ]) {
    const trigger = page.getByRole("button", { name: button, exact: true });
    await action(page, `Open ${label}`, () => trigger.click());
    const dialog = page.getByRole("dialog", { name: label, exact: true });
    await expectInViewport(page, dialog);
    await expect(dialog.getByRole("complementary", { name: region, exact: true })).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    await action(page, `Close ${label}`, () => page.keyboard.press("Escape"));
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  expect(problems).toEqual([]);
});
