import { expect, test } from "@playwright/test";

/**
 * The InvoiceAudit specimen tells its story on scroll. Whoever cannot get the scroll
 * version (reduced motion, a small screen, no scroll timelines) must get the finished
 * story as a static figure, never half a sequence.
 */
test.describe("InvoiceAudit specimen", () => {
  test("reduced motion shows the finished story, with no scroll stage", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/labs/invoiceaudit");
    const card = page.getByRole("img", { name: /specimen of InvoiceAudit/i });
    await expect(card).toBeVisible();
    await expect(card).toHaveAccessibleName(/routed to a person/i);
    // The end state: both repairs, the detector's flag and the stamp are all on screen.
    for (const selector of [".is-stamp", ".is-detect", ".is-routed", '[data-row="7"] .is-fix', '[data-check="2"] .is-ok']) {
      await expect(page.locator(selector)).toBeVisible();
    }
    await expect(page.locator('[data-row="7"] .is-orig')).toBeHidden();
    const { wrap, stage, position } = await page.evaluate(() => {
      const w = document.querySelector(".is-wrap")!, s = document.querySelector(".is-stage")!;
      return { wrap: w.getBoundingClientRect().height, stage: s.getBoundingClientRect().height, position: getComputedStyle(s).position };
    });
    expect(position).not.toBe("sticky");
    expect(Math.abs(wrap - stage)).toBeLessThan(4);
    await expect(page.getByText(/every figure is fictional/i)).toBeVisible();
  });

  test("on a desktop screen the story advances with the scroll", async ({ page, browserName }, info) => {
    test.skip(info.project.name !== "chromium" || browserName !== "chromium", "scroll timelines: chromium project only");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/labs/invoiceaudit");
    const geometry = await page.evaluate(() => {
      const w = document.querySelector(".is-wrap")!.getBoundingClientRect();
      return { top: w.top + scrollY, span: w.height - innerHeight };
    });
    expect(geometry.span, "the wrapper gives the story room to play").toBeGreaterThan(900);

    // Start of the story: nothing has failed, nothing is stamped.
    await page.evaluate((y) => scrollTo(0, y), geometry.top + geometry.span * 0.1);
    await expect(page.locator(".is-stamp")).toBeHidden();
    await expect(page.locator('[data-check="0"]')).toBeHidden();

    // The end: the aggregate-only repair is flagged and the invoice is held.
    await page.evaluate((y) => scrollTo(0, y), geometry.top + geometry.span * 0.96);
    await expect(page.locator(".is-stamp")).toBeVisible();
    await expect(page.locator(".is-detect")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
});
