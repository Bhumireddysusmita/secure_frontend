import { defineConfig, devices } from "@playwright/test";

// E2E suite for brief sections 04/05. `npm run test:e2e` (here) or `npm run test:report` (repo root).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // one shared database and lockout counters: run in a fixed order
  retries: 0, // a failure is reported as a failure, never retried away
  timeout: 60_000,
  globalSetup: "./e2e/global-setup.ts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "../reports/html", open: "never" }],
    ["json", { outputFile: "../reports/raw/results.json" }],
  ],
  outputDir: "../reports/raw/artifacts",
  use: {
    baseURL: "http://127.0.0.1:8020",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node e2e/serve.mjs",
    url: "http://127.0.0.1:8021/api/health",
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
