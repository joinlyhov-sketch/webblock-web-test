import { expect, test } from "@playwright/test";
import { IDS } from "./helpers";
import { action, checkLayout } from "./responsive-helpers";
test.use({ storageState: { cookies: [], origins: [] } });
for (const route of ["/", "/privacy", "/terms", "/sign-in", "/register", "/forgot-password", "/forgot-password/verify?email=test@example.com", "/reset-password?email=test@example.com", "/verify-otp?email=test@example.com", "/create-password?email=test@example.com", `/template-sites/${IDS.template}`]) {
  test(`responsive public ${route}`, async ({ page }, info) => { await checkLayout(page, route, info, false); });
}
test("public mobile menu opens and closes", async ({ page }) => {
  await action(page, "Open landing page", () => page.goto("/"));
  if (page.viewportSize()!.width < 1024) {
    await action(page, "Tap landing menu", () => page.getByRole("button", { name: "Open menu", exact: true }).click());
    await expect(page.getByRole("dialog")).toBeVisible();
    await action(page, "Close landing menu", () => page.getByRole("button", { name: "Close", exact: true }).click());
    await expect(page.getByRole("dialog")).toBeHidden();
  } else await expect(page.getByRole("link", { name: "Start free", exact: true }).first()).toBeVisible();
});
