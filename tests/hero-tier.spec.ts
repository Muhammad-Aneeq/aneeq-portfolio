import { expect, test } from "@playwright/test";

/**
 * The 3D chunk must never be requested on Tier 0 or Tier 1 (SPEC §4.3).
 *
 * This asserts something `npm run check:bundle` structurally cannot. That gate reads the
 * prerendered home document and checks the 3D chunk is absent from the *initial* payload —
 * which it was, on the day three.js was nonetheless being downloaded and parsed by every
 * phone that opened the site. The capability check lived inside the lazy import, so the
 * chunk was fetched and then declined: 407 KB of script transfer and LCP 7.7s → 4.1s once
 * fixed (PLAN, REVIEW PASS). The chunk was correctly lazy and still wrong to fetch.
 *
 * So this watches the network instead of the build output. It is the only gate that would
 * have caught that regression, and it is the reason it cannot come back.
 */

/** three.js is unmistakable in a URL-less way: match on what the response contains. */
async function threeRequests(page: import("@playwright/test").Page, path: string) {
  const requested: string[] = [];

  page.on("request", (req) => {
    const url = req.url();
    if (url.endsWith(".js")) requested.push(url);
  });

  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");
  // The canvas defers its import to requestIdleCallback; wait past that window so a
  // late fetch is caught rather than missed by a fast assertion.
  await page.waitForTimeout(3000);

  const bodies = await Promise.all(
    requested.map(async (url) => {
      try {
        const res = await page.request.get(url);
        return { url, body: await res.text() };
      } catch {
        return { url, body: "" };
      }
    }),
  );

  return bodies.filter(({ body }) => body.includes("WebGLRenderer")).map(({ url }) => url);
}

test.describe("Tier 1 — small viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the 3D chunk is never requested at 375px", async ({ page }) => {
    const three = await threeRequests(page, "/finance");
    expect(three, `3D chunk fetched on a phone: ${three.join(", ")}`).toHaveLength(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("Tier 0 — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the 3D chunk is never requested under reduced motion", async ({ page }) => {
    const three = await threeRequests(page, "/finance");
    expect(three, `3D chunk fetched under reduced motion: ${three.join(", ")}`).toHaveLength(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
