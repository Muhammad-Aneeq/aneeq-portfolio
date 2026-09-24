import { expect, test } from "@playwright/test";
import { assertHomeContent, assertUnhidden } from "./home-contract";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("home renders complete end states", async ({ page }) => {
    await page.goto("/");
    await assertHomeContent(page);
    await assertUnhidden(page, "h1, .career-proof, .featured-project, #contact, .workbench");
    expect(await page.locator(".workbench").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  });
  test("finance renders the labelled diagram instead of a canvas", async ({ page }) => {
    await page.goto("/finance");
    await expect(page.getByRole("img", { name: /stream of ledger postings/i })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
  test("the case study trace remains a readable timeline", async ({ page }) => {
    await page.goto("/work/closeops");
    await expect(page.getByText("Gate derived from policy")).toBeVisible();
    await expect(page.getByText("Planted anomaly halts")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
