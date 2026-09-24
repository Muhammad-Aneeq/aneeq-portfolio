import { test } from "@playwright/test";

import { prepareScreenshot } from "./settle";

/**
 * Not an assertion suite â€” a capture pass. `npx playwright test screenshots`
 * writes full-page renders to docs/screens/ so the design can be reviewed as
 * images rather than described.
 */

const SHOTS: { path: string; name: string }[] = [
  { path: "/", name: "01-home" },
  { path: "/finance", name: "15-finance" },
  { path: "/work", name: "02-work" },
  { path: "/work/closeops", name: "03-case-study" },
  { path: "/labs", name: "04-labs" },
  { path: "/demos", name: "11-demos" },
  { path: "/teaching", name: "14-teaching" },
  { path: "/ask", name: "05-ask" },
  { path: "/about", name: "06-about" },
  { path: "/resume", name: "07-resume" },
  { path: "/dev/kitchen-sink", name: "08-kitchen-sink" },
];

test.describe("capture", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "capture once");
  });

  for (const shot of SHOTS) {
    test(`capture ${shot.name}`, async ({ page }) => {
      /*
        Five minutes, not three.

        `prepareScreenshot` waits for every image on the page to decode, and on a cold
        Next image cache each one is generated on demand at request time. /demos is the
        heaviest page on the site and grew again when the three narrated walkthroughs
        landed there with their posters; it twice blew the three-minute budget on a
        cold cache while finishing in twenty-six seconds warm. A CI run is always cold,
        so the old ceiling was a scheduled failure rather than a real signal.
      */
      test.setTimeout(300_000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(shot.path, { timeout: 120_000 });
      // Let fonts settle and the lazy 3D chunk land before capturing.
      await page.waitForLoadState("load");
      await page.waitForTimeout(2500);

      // Force every scroll reveal to its shown state. A full-page capture resizes
      // the viewport, which does not reliably fire IntersectionObserver â€” so an
      // honest capture has to settle the reveals rather than photograph them
      // mid-flight. (The reveals themselves are asserted in reduced-motion.spec.)
      await prepareScreenshot(page);

      await page.screenshot({
        path: `docs/screens/${shot.name}.png`,
        fullPage: true,
      });
    });
  }

  test("capture home on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await prepareScreenshot(page);
    await page.screenshot({ path: "docs/screens/09-home-mobile.png", fullPage: true });
  });

  test("capture home in light theme", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Ask for light directly rather than driving the toggle, which now depends on
    // whichever theme the context started in.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.classList.contains("light"));
    await page.waitForTimeout(1500);
    await prepareScreenshot(page);
    await page.screenshot({ path: "docs/screens/10-home-light.png", fullPage: true });
  });
});
