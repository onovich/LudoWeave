import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5187",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @ludoweave/playground dev:e2e",
    url: "http://127.0.0.1:5187",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],
});
