import { expect, test, type Page } from "@playwright/test";
import { assertUnhidden } from "./home-contract";

async function readable(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: /AI systems/i })).toBeVisible();
  await assertUnhidden(page, "h1");
  const clipped = await page.locator("h1").evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const text = range.getBoundingClientRect();
    const css = getComputedStyle(el);
    let inside = true;
    for (let parent: Element | null = el; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (/hidden|clip/.test(style.overflowY)) {
        const box = parent.getBoundingClientRect();
        inside &&= text.top >= box.top - 2 && text.bottom <= box.bottom + 2;
      }
    }
    return { inside,
      animation: css.animationName, clip: css.clipPath, overflow: css.overflow };
  });
  expect(clipped.inside).toBe(true);
  expect(clipped.animation).toBe("none");
  expect(clipped.clip).toBe("none");
  expect(clipped.overflow).toBe("visible");
}
test("headline is fully readable on arrival, without waiting for motion", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await readable(page);
});
test("headline is complete with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await readable(page);
  await context.close();
});
test("headline remains visible if hydration fails", async ({ page }) => {
  await page.route(/\/_next\/static\/chunks\/.*\.js(\?|$)/, route => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await readable(page);
});
test("neither motion preference adds headline animation latency", async ({ page }) => {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await readable(page);
  }
});
