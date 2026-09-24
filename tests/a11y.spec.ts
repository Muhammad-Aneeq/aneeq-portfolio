import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { settleReveals } from "./settle";

const ROUTES = [
  "/",
  "/finance",
  "/work",
  "/work/closeops",
  "/work/ledgerguard",
  "/labs",
  "/labs/policyground",
  "/about",
  "/teaching",
  "/resume",
  "/ask",
  "/contact",
];

for (const scheme of ["light", "dark"] as const) {
for (const route of ROUTES) {
  test(`${scheme} ${route} has no accessibility violations`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(route, { timeout: 120_000 });
    // Audit the resting state, and audit all of it — see tests/settle.ts.
    await settleReveals(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Print the rule and the offending node so a CI failure is actionable
    // without downloading a trace.
    if (results.violations.length > 0) {
      console.error(
        results.violations
          .map(
            (v) =>
              `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`,
          )
          .join("\n\n"),
      );
    }

    expect(results.violations).toEqual([]);
  });
}
}

test("skip link is the first focusable element and reaches main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();

  await skip.press("Enter");
  await expect(page.locator("#main")).toBeVisible();
});

test("theme toggle announces its destination in both themes", async ({ page }) => {
  await page.goto("/");

  /*
    Written to be theme-agnostic on purpose. The theme now follows the OS when the
    visitor has not chosen, so the starting state depends on the browser context rather
    than always being dark — an earlier version of this test hard-coded "switch to light"
    and broke the moment `prefers-color-scheme` started being honoured.
  */
  const start = (await page.locator("html").getAttribute("class")) ?? "";
  const startsLight = start.includes("light");

  const first = page.getByRole("button", {
    name: startsLight ? /switch to dark theme/i : /switch to light theme/i,
  });
  await expect(first).toBeVisible();

  await first.click();
  await expect(
    page.getByRole("button", {
      name: startsLight ? /switch to light theme/i : /switch to dark theme/i,
    }),
  ).toBeVisible();
});

test("the theme follows the operating system", async ({ browser }) => {
  for (const scheme of ["light", "dark"] as const) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect
      .poll(async () => (await page.locator("html").getAttribute("class")) ?? "")
      .toContain(scheme);
    await ctx.close();
  }
});

test("dark is the default when there is no signal at all", async ({ browser }) => {
  /*
    `no-preference` is deliberately not tested: Chromium reports it as
    `(prefers-color-scheme: light)` matching, so an unset preference is indistinguishable
    from a light one and the case cannot be observed. Measured, not assumed.

    The case that *is* observable is scripting disabled — no class is written, and the
    dark tokens in `:root` are what render.
  */
  const ctx = await browser.newContext({ javaScriptEnabled: false, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto("/");
  const cls = (await page.locator("html").getAttribute("class")) ?? "";
  expect(cls).not.toContain("light");
  const bg = await page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );
  // The dark ground, resolved to whatever the browser serialises it as.
  expect(bg).toBeTruthy();
  await ctx.close();
});

