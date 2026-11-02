import { expect, test } from "@playwright/test";
import { expectCleanLoad, expectNoReload, IDS, markDocument, shot } from "./helpers";

const W = IDS.website;
const EDITOR_ROUTES = [
  `/websites/${W}/edit`,
  `/websites/${W}/preview`,
  `/websites/${W}/draft`,
  `/websites/${W}/deploy`,
  `/templates/${IDS.template}/preview`,
  `/sites/${W}`,
];

test.describe("editor / preview / deploy routes load clean", () => {
  for (const route of EDITOR_ROUTES) {
    test(route, async ({ page }) => {
      await expectCleanLoad(page, route);
    });
  }
});

test("editor: Save draft saves without reloading the page", async ({ page }) => {
  await page.goto(`/websites/${W}/edit`);
  const save = page.getByRole("button", { name: /save draft/i });
  await expect(save).toBeVisible();
  await markDocument(page);
  await save.click();
  await expect(page.getByText(/draft saved/i).first()).toBeVisible();
  await page.screenshot({ path: shot("/websites/edit", "_saved") });
  await expectNoReload(page);
});
