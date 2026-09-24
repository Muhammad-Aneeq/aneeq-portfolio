import { expect, test } from "@playwright/test";
import { assertHomeContent, assertUnhidden } from "./home-contract";

for (const mode of ["reduced", "no JavaScript"] as const) {
  test.describe(mode, () => {
    test.use(mode === "reduced" ? { reducedMotion: "reduce" } : { javaScriptEnabled: false });
    test("content cannot be stranded in an animation start state", async ({ page }) => {
      await page.goto("/");
      await assertHomeContent(page);
      await assertUnhidden(page, "h1, .career-proof, .featured-project, #contact", mode === "no JavaScript");
      await expect(page.locator("[data-glow], [data-magnetic], [data-scroll-word]")).toHaveCount(0);
    });
    for (const route of ["/about", "/teaching", "/finance"]) {
      test(route + " prose stays readable without word splitting", async ({ page }) => {
        await page.goto(route);
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("[data-scroll-word]")).toHaveCount(0);
        const hidden = await page.locator("main p").evaluateAll(els =>
          els.filter(el => { const s = getComputedStyle(el); return s.visibility === "hidden" || Number(s.opacity) < .99; }).length,
        );
        expect(hidden).toBe(0);
        expect((await page.locator("main").innerText()).length).toBeGreaterThan(500);
      });
    }
  });
}
