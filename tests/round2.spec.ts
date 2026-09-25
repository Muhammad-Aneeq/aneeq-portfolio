import { expect, test } from "@playwright/test";
import { caseStudies, labs, projectCount } from "../src/content";

test("project inventory is computed and all new work has limitations", async ({ page }) => {
  // 16 since ReportSmith shipped: it was held back while it had planning documents and
  // no code, and now has a backend, a frontend, evals and a recorded demo.
  expect(projectCount).toBe(16);
  expect(projectCount).toBe(caseStudies.length + labs.length);
  /*
    These three are labs, so they are listed under the Labs tab rather than on /work.

    Asserted as text rather than as a heading: RevLedger and InvoiceAudit have been
    recorded and so appear as cards with an `h2`, while Payment Reconciliation has no
    capture yet and appears in the not-yet-captured list, which is deliberately a
    plain row and not a heading. What this test cares about is that all three are
    listed, not which element carries the name.
  */
  await page.goto("/labs");
  for (const name of ["RevLedger", "InvoiceAudit", "Payment Reconciliation"]) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  }
  for (const slug of ["revledger", "invoiceaudit", "payment-reconciliation"]) {
    await page.goto(`/labs/${slug}`);
    await expect(page.getByRole("heading", { name: "Limits and current status" })).toBeVisible();
    await expect(page.locator("#limits-title + ul li")).not.toHaveCount(0);
  }
  await expect(page.locator("main")).toContainText("FakeLLMClient");
});

test("workbench playback is controllable and never announces automatic changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  const detail = page.locator(".workbench-detail");
  await expect(page.getByRole("button", { name: "Pause walkthrough" })).toBeVisible();
  await expect(detail).toHaveAttribute("aria-live", "off");
  await page.clock.fastForward(6100);
  await expect(detail).toContainText("Ground the answer");
  await page.locator(".workbench").hover();
  await page.clock.fastForward(12000);
  await expect(detail).toContainText("Ground the answer");
  await page.mouse.move(0, 0);
  await page.getByRole("button", { name: "Pause walkthrough" }).focus();
  await page.clock.fastForward(12000);
  await expect(detail).toContainText("Ground the answer");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Play walkthrough" })).toBeVisible();
  await page.getByRole("button", { name: /Evaluate/ }).click();
  await page.mouse.move(0, 0);
  await page.getByRole("heading", { level: 1 }).click();
  await page.clock.fastForward(12000);
  await expect(detail).toContainText("Measure before you trust");
  await expect(detail).toHaveAttribute("aria-live", "polite");
});

test("reduced motion stops playback and every new CSS entrance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: /walkthrough/ })).toHaveCount(0);
  await page.clock.fastForward(20000);
  await expect(page.locator(".workbench-detail")).toContainText("Give each agent");
  const states = await page.locator(".workbench, [data-reveal], .site-navigation").evaluateAll(els => els.map(el => {
    const s = getComputedStyle(el); return [s.transform, s.opacity, s.animationName];
  }));
  for (const state of states) expect(state).toEqual(["none", "1", "none"]);
});

test("contact columns align centrally and validation remains readable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  const centers = async () => page.locator("#contact > *").evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return r.y + r.height / 2; }));
  let positions = await centers();
  expect(Math.abs(positions[0] - positions[1])).toBeLessThan(2);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator("form [aria-live]")).toContainText("Please check the form");
  positions = await centers();
  expect(Math.abs(positions[0] - positions[1])).toBeLessThan(2);
  /*
    Let the resize settle before measuring.

    The assertion is about layout, not timing, and it was reading an intermediate
    frame: changing the viewport reflows the page and the browser then adjusts the
    scroll offset, so a boundingBox taken on the next tick can catch the two columns
    mid-reflow. It only started failing once the form scrolled its reply into view,
    which changed where the page was sitting when the resize happened, but the race
    was always there.

    Asserted against the rects in one evaluate, so both are read from the same frame.
  */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const stacked = await page.evaluate(() => {
    const intro = document.querySelector(".home-contact-intro")!.getBoundingClientRect();
    const form = document.querySelector("#contact form")!.getBoundingClientRect();
    return { formTop: form.y, introBottom: intro.bottom };
  });
  expect(stacked.formTop).toBeGreaterThanOrEqual(stacked.introBottom);
});

test("LedgerLab preview shows a real capture, not an empty panel", async ({ page }) => {
  // /work is the labs view since the two collections started sharing a hero.
  // LedgerLab is a case study, so its card lives behind the second tab.
  await page.goto("/work/case-studies");
  const card = page.locator("article").filter({ has: page.getByRole("heading", { name: "LedgerLab", exact: true }) });
  await card.scrollIntoViewIfNeeded();

  /*
    Either a decoded image or a playing loop counts.

    This asserted the `agent-work` still specifically, which broke the moment the
    project gained a recorded demo: the card prefers the loop when one exists, which
    is the whole point of adding it. What the test is actually for is the regression
    it was written after — a card reserving space for media it does not have — so it
    now checks that something real is in the frame, not which of the two it is.
  */
  const loop = card.locator("video");
  if (await loop.count()) {
    await expect
      .poll(() => loop.evaluate((el: HTMLVideoElement) => el.readyState > 0 || el.poster !== ""))
      .toBe(true);
    return;
  }

  const shot = card.locator("img");
  await expect.poll(() => shot.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test.describe("new projects without scripting", () => {
  test.use({ javaScriptEnabled: false });
  test("all projects and limitations survive without hydration", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { name: /16 projects/ })).toBeVisible();

    /*
      The labs used to be inlined on /work as a bare name-and-tagline list. They now
      have their own tab, so the no-scripting guarantee moved with them rather than
      being dropped: every one must still be reachable from /labs with hydration off,
      whether it sits in the captured grid or the not-yet-captured list below it.

      Counted as distinct hrefs, because a card links its title and its whole surface.
    */
    await page.goto("/labs");
    const linked = await page.evaluate(() => [
      ...new Set(
        [...document.querySelectorAll('a[href^="/labs/"]')].map((a) => a.getAttribute("href")),
      ),
    ]);
    expect(linked).toHaveLength(11);
    for (const slug of ["revledger", "invoiceaudit", "payment-reconciliation"]) {
      await page.goto(`/labs/${slug}`);
      await expect(page.locator("#limits-title")).toBeVisible();
    }
  });
});
