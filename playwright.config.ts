import { defineConfig, devices } from "@playwright/test";

/**
 * Two projects, because reduced motion is a behaviour that has to be tested, not
 * asserted. The `reduced-motion` project runs the same accessibility sweep with the
 * media feature emulated, which is the only way to prove the 3D scenes actually fall
 * back to their static equivalents rather than merely intending to.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  /*
    An axe sweep is CPU-heavy, and running many of them against one Next server
    starved the workers badly enough that tests hit the 30s default and reported
    as failures — twice, on pages that pass in 2s alone. A flaky suite is worse
    than no suite, so: a real cap on concurrency and headroom on the timeout.
  */
  workers: 2,
  timeout: 120_000,

  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    navigationTimeout: 120_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "reduced-motion",
      use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" },
    },
  ],

  webServer: {
    command: `"${process.execPath}" node_modules/next/dist/bin/next start --port 3100`,
    env: { RESEND_API_KEY: "" },
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
