import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("workflow stages respond to pointer and keyboard", async ({ page }) => {
  await page.goto("/");
  const retrieve = page.getByRole("button", { name: "Retrieve" });
  await retrieve.click();
  await expect(retrieve).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".workbench-detail")).toContainText("Ground the answer in evidence.");
  const review = page.getByRole("button", { name: "Review", exact: true });
  await review.focus();
  await page.keyboard.press("Enter");
  await expect(review).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".workbench-detail")).toContainText("Keep consequential decisions human.");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme} homepage is accessible and fits phone screens`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  });
}

test("reduced motion removes the workbench entrance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator(".workbench").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
});

test("introduction and project evidence survive without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".project-preview")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
  await context.close();
});
