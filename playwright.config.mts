import { defineConfig, devices } from "@playwright/test";
import { loadTestEnvironment, isolatedProcessEnv } from "./tests/support/environment.mjs";

const local = loadTestEnvironment();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: local.NEXT_PUBLIC_SITE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run test:start",
    url: `${local.NEXT_PUBLIC_SITE_URL}/about`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: isolatedProcessEnv(local),
  },
});
