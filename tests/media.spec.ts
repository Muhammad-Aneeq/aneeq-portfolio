import { expect, test, type Page } from "@playwright/test";

/**
 * No media container reserves height without something in it.
 *
 * Deliberately written against *named* regions rather than as a generic "no empty
 * element" sweep. A generic rule passes the moment a spinner or a grey box is added,
 * which is exactly the outcome it should be preventing — a spinner is not an end state.
 * These assert that a specific slot holds either a real capture or an explicit statement
 * that no capture exists.
 */

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
}

test.describe("media end states", () => {
  test("every image on /demos resolves to real pixels", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/demos", { waitUntil: "load" });
    await scrollThrough(page);

    // Generous: the production image optimiser transcodes on first request, so a cold
    // run is legitimately slow. What must never happen is a *broken* image.
    await expect
      .poll(
        async () =>
          page.evaluate(
            () =>
              [...document.querySelectorAll("img")].filter(
                (i) => i.complete && i.naturalWidth === 0,
              ).length,
          ),
        { timeout: 20_000 },
      )
      .toBe(0);

    const total = await page.locator("img").count();
    expect(total, "/demos should be showing captures").toBeGreaterThan(10);
  });

  test("a card without a capture says so instead of reserving empty space", async ({ page }) => {
    await page.goto("/work", { waitUntil: "load" });

    /*
      This named LedgerGuard, whose case study then stated its console had never been
      rendered in a browser. It has since been recorded, and the limitation was
      withdrawn rather than left standing beside a video of the thing it denied.

      So the test now asserts the rule rather than the example: every card either shows
      a real capture or says it has none. A container reserving height and holding
      nothing is the regression this was written for, and that is still caught.
    */
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const name = (await card.locator("h2, h3").first().textContent())?.trim() ?? `card ${i}`;
      const hasMedia = (await card.locator("img, video").count()) > 0;
      const saysNone = (await card.getByText(/no capture yet/i).count()) > 0;
      expect(hasMedia || saysNone, `${name} shows neither a capture nor a statement`).toBe(true);
    }
  });

  test("the trace replay is readable as text before any 3D loads", async ({ browser }) => {
    // With scripting off nothing can upgrade to a canvas, so what remains is what a
    // crawler and a reduced-motion reader get.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/work/closeops", { waitUntil: "domcontentloaded" });

    const section = page.locator("section", { hasText: "How it runs" }).first();
    await expect(section).toBeVisible();
    const text = (await section.innerText()).trim();
    expect(text.length, "the architecture section must carry real text").toBeGreaterThan(200);
    await expect(page.locator("canvas")).toHaveCount(0);
    await ctx.close();
  });

  test("the hero replay is labelled as illustrative on every tier", async ({ page }) => {
    await page.goto("/finance", { waitUntil: "load" });
    // A governance animation that releases its own human gate has to say that it is a
    // simulation, or it reads as a claim.
    await expect(page.getByText(/the approval step is simulated/i)).toBeVisible();
  });
});
