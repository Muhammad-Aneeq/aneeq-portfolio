import { expect, test, type Page } from "@playwright/test";

/**
 * The accent triad means three things and nothing else.
 *
 * `--pass` is a passed check, `--gate` is awaiting a person, `--halt` is stopped. Before
 * this pass, teal was also on every eyebrow, every primary button, the selected tab, the
 * active filter, prose links, hover states, the focus ring and the availability dot — so
 * the site asserted a colour code it broke roughly nine times for every once it kept.
 *
 * These tests exist because that is not a thing a person will notice regressing. A new
 * component with `text-pass` on its section label looks completely normal in review.
 */

const ROUTES = ["/", "/work", "/finance", "/labs", "/about", "/resume", "/contact"];

/** Resolve a computed colour to sRGB bytes; the tokens are authored in oklch(). */
async function accentUsage(page: Page) {
  return page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const rgb = (col: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return `${d[0]},${d[1]},${d[2]}`;
    };

    const root = getComputedStyle(document.documentElement);
    const accents = new Set(
      ["--pass", "--gate", "--halt"].map((v) => rgb(root.getPropertyValue(v).trim())),
    );

    // Elements that must never carry an accent: they are affordances, not states.
    const forbidden = [
      "a[href]",
      "button",
      "nav *",
      "header *",
      '[role="tab"]',
    ].join(",");

    const hits: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(forbidden)) {
      const cs = getComputedStyle(el);
      // A legend and a state pill are allowed to carry the colour: they say the word too.
      if (el.closest("[aria-label='What the colours mean']")) continue;
      if (el.closest("[data-state-pill]")) continue;

      for (const [prop, value] of [
        ["color", cs.color],
        ["background-color", cs.backgroundColor],
        ["border-top-color", cs.borderTopColor],
        ["outline-color", cs.outlineColor],
      ] as const) {
        if (value === "rgba(0, 0, 0, 0)" || value === "transparent") continue;
        if (accents.has(rgb(value))) {
          hits.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 34)} ${prop}=${value} "${(el.textContent ?? "").trim().slice(0, 22)}"`,
          );
        }
      }
    }
    return hits;
  });
}

test.describe("colour discipline", () => {
  for (const route of ROUTES) {
    test(`${route} uses no accent colour on links, buttons, nav or tabs`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      const hits = await accentUsage(page);
      expect(hits, `accent colour on an affordance:\n  ${hits.join("\n  ")}`).toEqual([]);
    });
  }

  test("the state legend is present wherever the code is used", async ({ page }) => {
    await page.goto("/finance", { waitUntil: "load" });
    const legend = page.getByLabel("What the colours mean");
    await expect(legend).toBeVisible();
    // Every state is a word and a symbol, not only a swatch.
    await expect(legend).toContainText("passed");
    await expect(legend).toContainText("awaiting a person");
    await expect(legend).toContainText("stopped");

    await page.goto("/work/closeops", { waitUntil: "load" });
    await expect(page.getByLabel("What the colours mean")).toBeVisible();
  });

  test("the availability indicator does not borrow the verification colour", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    const offenders = await page.evaluate(() => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      const rgb = (c: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return `${d[0]},${d[1]},${d[2]}`;
      };
      const pass = rgb(getComputedStyle(document.documentElement).getPropertyValue("--pass").trim());
      return [...document.querySelectorAll<HTMLElement>(".availability-dot")]
        .filter((el) => rgb(getComputedStyle(el).backgroundColor) === pass)
        .map((el) => String(el.className));
    });
    expect(offenders).toEqual([]);
  });
});
