import { expect, test } from "@playwright/test";

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme}: every public route fits all required widths and has clean copy`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    expect(routes.length).toBeGreaterThan(15);
    expect(routes).not.toContain("/decisions");
    for (const route of [...routes, "/dev/kitchen-sink"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await page.locator("body").innerText(), route).not.toMatch(/[—–]/);
      await expect(page.locator('a[href="/decisions"]')).toHaveCount(0);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        /*
          Polled, not measured once. `setViewportSize` resolves before the page has
          necessarily finished reflowing, so a single `evaluate` can read a
          scrollWidth from the previous width. That produced a flake on
          /labs/statementlens reporting 143px of overflow that does not reproduce in
          isolation at any width. Polling retries until the layout settles, so a real
          overflow still fails and a half-finished reflow no longer does.
        */
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
            message: `${route} at ${width}px`,
          })
          .toBeLessThanOrEqual(1);
      }
    }
  });

  test(`${scheme}: finance replay text holds contrast in both themes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto("/finance");
    const measure = () => page.locator(".rr").evaluate(root => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const luminance = (color: string) => {
        context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => {
          const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
        });
        return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
      };
      const bg = luminance(getComputedStyle(root).backgroundColor);
      // Every visible leaf that carries text, including the ::before counter's host.
      return [...root.querySelectorAll<HTMLElement>("span")]
        .filter(el => el.children.length === 0 && getComputedStyle(el).visibility === "visible" && getComputedStyle(el).display !== "none")
        .filter(el => (el.textContent ?? "").trim() || el.classList.contains("rr-count"))
        .map(el => {
          const fg = luminance(getComputedStyle(el).color);
          return { text: el.textContent || el.className, ratio: (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05) };
        });
    });
    for (const pass of [1, 2]) {
      const contrasts = await measure();
      expect(contrasts.length).toBeGreaterThan(10);
      for (const item of contrasts) expect(item.ratio, `${item.text} (pass ${pass})`).toBeGreaterThanOrEqual(4.5);
      if (pass === 1) await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    }
  });
}

test("contact stays reachable from the tablet header", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/");
  await expect(page.locator("header").getByRole("link", { name: "Contact", exact: true })).toBeVisible();
});

test("removed decision record returns 404", async ({ page }) => {
  expect((await page.request.get("/decisions")).status()).toBe(404);
});

test("home and work headings have no skipped levels", async ({ page }) => {
  for (const route of ["/", "/work"]) {
    await page.goto(route);
    const levels = await page.locator("main h1, main h2, main h3, main h4").evaluateAll(els => els.map(el => Number(el.tagName.slice(1))));
    let previous = 0;
    for (const level of levels) { expect(level).toBeLessThanOrEqual(previous + 1); previous = level; }
  }
});
