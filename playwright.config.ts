import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);

// Headed by default so every click is visible. `SLOWMO=0 pnpm exec playwright test` runs fast.
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results/runs",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: false,
    viewport: { width: 1280, height: 800 },
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 500) },
    video: "on",
    trace: "on",
    screenshot: "on",
  },
  // Reuses a server that is already running; otherwise builds and starts the production server.
  webServer: {
    command: "npm run build && npm run start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 600_000,
  },
  projects: [
    ...[
      { name: "mobile-small", width: 360, height: 740 },
      { name: "mobile", width: 390, height: 844 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop-boundary", width: 1024, height: 768 },
      { name: "desktop", width: 1280, height: 800 },
      { name: "desktop-wide", width: 1536, height: 864 },
    ].map(({ name, width, height }) => ({
      name,
      testMatch: /responsive-.*\.spec\.ts/,
      dependencies: ["setup"],
      use: { viewport: { width, height }, hasTouch: width < 1024, storageState: "tests/.auth/user.json" },
    })),
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "public", testMatch: /public\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    {
      name: "user",
      testMatch: /user\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, storageState: "tests/.auth/user.json" },
    },
    {
      name: "admin",
      testMatch: /admin\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, storageState: "tests/.auth/admin.json" },
    },
    {
      name: "editor",
      testMatch: /editor\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, storageState: "tests/.auth/user.json" },
    },
    {
      // Mobile pass: 390x844, all three roles (admin/public override the session inside the spec).
      name: "mobile-existing",
      testMatch: /mobile\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, storageState: "tests/.auth/user.json" },
    },
  ],
});
