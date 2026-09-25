import { expect, test } from "@playwright/test";

/**
 * The design system, enforced.
 *
 * The site had colour and type tokens from the start and no layout system, so every
 * page decided its own widths. Measured across fourteen routes: twenty-three distinct
 * prose widths, seven distinct `h2` sizes and four container widths. Two of those `h2`
 * sizes were 12px and 17px, which is a heading being used as a label.
 *
 * These assertions are about *agreement*, not beauty. They cannot tell you a page looks
 * bad; they tell you it has stopped matching the rest of the site, which is the part
 * that rots quietly between redesigns. See docs/DESIGN-SYSTEM.md.
 */

const ROUTES = [
  "/", "/work", "/work/ledgerlens", "/work/closeops", "/labs", "/labs/revledger",
  "/labs/policyground", "/demos", "/demos/case-studies", "/services", "/feedback", "/about", "/teaching",
  "/resume", "/finance",
  // `/ask` is omitted deliberately: it is behind ASK_ENABLED and calls notFound()
  // when the flag is off, so it renders the 404 shell rather than its own layout.
  "/contact",
];

/** The type scale, resolved at a 1440px viewport where every clamp is at its ceiling. */
const LABEL_PX = 12;
const H3_PX = 28;
const H2_PX = 42;

/** `--container-tight | read | wide` in px at the root font size. */
const MEASURES = new Set([544, 704, 896]);

test.describe("design system", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "layout is not per-motion-preference");
  });

  test("every page uses the one page container", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const widths = new Map<string, number>();

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // The shell is whatever carries the page max-width. Measuring the first element
      // that is narrower than the viewport finds it without coupling to class names.
      const width = await page.evaluate(() => {
        const candidates = [...document.querySelectorAll("main div, main section, main article")];
        const shell = candidates.find((el) => {
          const w = el.getBoundingClientRect().width;
          return w > 0 && w < window.innerWidth - 1;
        });
        return shell ? Math.round(shell.getBoundingClientRect().width) : 0;
      });
      widths.set(route, width);
    }

    // 78rem minus the 2rem side padding either side, at a 1440 viewport.
    const expected = 1248;
    for (const [route, width] of widths) {
      expect(width, `${route} shell width`).toBe(expected);
    }
  });

  test("every h2 is either a scale heading or a label heading", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const offenders: string[] = [];

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll("main h2")].map((h) => ({
          size: Math.round(parseFloat(getComputedStyle(h).fontSize)),
          text: (h.textContent ?? "").trim().slice(0, 40),
        })),
      );
      for (const { size, text } of sizes) {
        /*
          The rule is "from the scale", not "exactly --text-h2".

          An `h2` may legitimately render at h3 size: a card title in a grid is a
          section of the document, so the level is right, while its visual weight
          belongs to the card rather than to the page. Pinning every `h2` to 42px
          would have forced card titles to shout. What is banned is a size that
          appears in neither the scale nor the label treatment — which is where the
          old 17px, 38px, 44px and 51px came from.
        */
        const allowed = size === LABEL_PX || size === H3_PX || size === H2_PX;
        if (!allowed) offenders.push(`${route}: "${text}" at ${size}px`);
      }
    }

    expect(offenders, "h2 sizes outside the scale").toEqual([]);
  });

  test("text that sets its own measure uses a measure token", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const offenders: string[] = [];

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const measures = await page.evaluate(() => {
        const out: { value: string; text: string }[] = [];
        for (const el of document.querySelectorAll("main p, main div, main ul")) {
          const max = getComputedStyle(el).maxWidth;
          // Only elements that deliberately constrain themselves are in scope. A
          // paragraph sized by a card or a grid cell is the layout's decision, not a
          // measure, and forcing a token on it would be the wrong fix.
          if (max === "none" || max.endsWith("%")) continue;
          out.push({ value: max, text: (el.textContent ?? "").trim().slice(0, 30) });
        }
        return out;
      });

      for (const { value, text } of measures) {
        const px = Math.round(parseFloat(value));
        if (!Number.isFinite(px)) continue;
        // `--container-page` on the shell itself, and Tailwind's own small utilities
        // used for chips and icons, are not prose measures.
        if (px >= 1248 || px < 300) continue;
        if (!MEASURES.has(px)) offenders.push(`${route}: ${px}px on "${text}"`);
      }
    }

    expect(offenders, "widths outside --container-tight|prose|wide").toEqual([]);
  });
});
