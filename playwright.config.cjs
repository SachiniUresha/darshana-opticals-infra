const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  expect: { timeout: 30000 },
  testDir: "./tests/e2e",

  /*
   * Critical OSMS E2E workflows modify shared staging state.
   * Keep execution serial unless a scenario is explicitly proven isolated.
   */
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    /*
     * Local development may use localhost.
     * Staging execution must explicitly provide E2E_BASE_URL.
     */
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",

    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
