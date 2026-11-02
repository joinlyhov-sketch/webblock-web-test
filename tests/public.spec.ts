import { expect, test } from "@playwright/test";
import { expectCleanLoad, expectNoReload, IDS, markDocument, shot } from "./helpers";

const PUBLIC_ROUTES = [
  "/",
  "/privacy",
  "/terms",
  "/sign-in",
  "/register",
  "/forgot-password",
  "/forgot-password/verify?email=test@example.com",
  "/reset-password?email=test@example.com",
  "/verify-otp?email=test@example.com",
  "/create-password?email=test@example.com",
  `/template-sites/${IDS.template}`,
];

test.describe("public routes load clean", () => {
  for (const route of PUBLIC_ROUTES) {
    test(route, async ({ page }) => {
      await expectCleanLoad(page, route);
    });
  }
});

test("signed-out visitors are sent to sign-in and come back after", async ({ page }) => {
  await page.goto("/websites");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fwebsites/);
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/websites$/);
});

test("landing: footer links navigate without a full reload", async ({ page }) => {
  await page.goto("/");
  await markDocument(page);
  await page.getByRole("link", { name: "Privacy policy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoReload(page);
  await page.screenshot({ path: shot("/privacy", "_after-click") });
});

test.describe("sign-in form", () => {
  test("shows validation errors for empty and invalid input", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/enter your (email|password)/i).first()).toBeVisible();
    await page.screenshot({ path: shot("/sign-in", "_empty-errors") });
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("x");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/valid email|enter a valid/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("signs in as an owner", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/websites$/);
    await expect(page.getByRole("heading", { name: "My Websites", level: 1 })).toBeVisible();
  });

  test("signs in as an admin", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@webblock.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });
});

test("register form validates empty input", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/enter|required|valid/i).first()).toBeVisible();
});
