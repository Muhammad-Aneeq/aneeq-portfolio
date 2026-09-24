import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { settleReveals } from "./settle";

/**
 * Light-mode accessibility.
 *
 * Playwright's `colorScheme` option is deliberately NOT used: the site runs
 * next-themes class-based with `enableSystem={false}`, so `prefers-color-scheme`
 * has no effect on it. Seeding next-themes' own localStorage key before the first
 * navigation is what actually puts the page in light mode — a `colorScheme: light`
 * project would have silently audited the dark theme twice and reported success.
 */

const ROUTES = [
  "/",
  "/finance",
  "/work",
  "/work/closeops",
  "/labs",
  "/about",
  "/teaching",
  "/resume",
  "/contact",
  // Renders every primitive including all three governance states, so it is the
  // only route that exercises gate and halt on their own tinted backgrounds.
  "/dev/kitchen-sink",
];

test.describe("light theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "light");
    });
  });

  for (const route of ROUTES) {
    test(`${route} has no accessibility violations in light mode`, async ({ page }) => {
      await page.goto(route);

      // Confirm the theme actually applied before auditing it — otherwise this
      // suite is a duplicate of the dark run wearing a different name.
      await expect(page.locator("html")).toHaveClass(/light/);

      // Audit the resting state, and audit all of it — see tests/settle.ts.
      await settleReveals(page);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (results.violations.length > 0) {
        console.error(
          results.violations
            .map(
              (v) =>
                `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
                  .map((n) => `${n.html}\n    ${n.failureSummary?.replace(/\n/g, " ")}`)
                  .join("\n  ")}`,
            )
            .join("\n\n"),
        );
      }

      expect(results.violations).toEqual([]);
    });
  }
});
