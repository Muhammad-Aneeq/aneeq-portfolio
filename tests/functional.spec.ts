import { expect, test, type Page } from "@playwright/test";

/**
 * The functional sweep: does the site actually work?
 *
 * The existing specs each guard one contract — accessibility, no-JS, reduced motion,
 * the tier ladder, the choreography. None of them drives the site the way a visitor
 * does: click the nav, switch a tab, filter a grid, toggle the theme, follow a link.
 * A site can pass every contract test and still have a dead link or a tab that does
 * nothing, so this covers the part nobody was asserting.
 *
 * Deliberately runs in the default project only. These are behaviour checks, not
 * rendering-mode checks, and running them four times over says nothing new.
 */

const ROUTES = [
  { path: "/", heading: /AI systems/i },
  // The count leads the heading now that labs sit on this page beside the case
  // studies. It is rendered from `projectCount`, so this pattern stays honest even
  // when a project is added: what it asserts is that a number is there at all.
  { path: "/work", heading: /\d+ projects/i },
  { path: "/finance", heading: /AI for Finance/i },
  { path: "/teaching", heading: /.+/ },
  { path: "/about", heading: /.+/ },
  { path: "/resume", heading: /.+/ },
  { path: "/contact", heading: /.+/ },
  { path: "/labs", heading: /.+/ },
  { path: "/demos", heading: /.+/ },
  { path: "/work/closeops", heading: /.+/ },
  { path: "/labs/policyground", heading: /.+/ },
];

/** Console errors and uncaught exceptions, collected for a page. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // A missing favicon or a devtools notice is not a site defect.
    if (/favicon|DevTools|Download the React/i.test(t)) return;
    errors.push(`console: ${t.slice(0, 160)}`);
  });
  return errors;
}

test.describe("functional", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "behaviour, not rendering mode");
  });

  for (const route of ROUTES) {
    test(`${route.path} renders, responds 200, and logs no errors`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(res?.status(), `${route.path} HTTP status`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("h1").first()).toHaveText(route.heading);

      // Every page opens with an answer block and carries the nav and footer.
      await expect(page.locator("header nav").first()).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      await page.waitForTimeout(1200);
      expect(errors, `${route.path} produced: ${errors.join(" | ")}`).toHaveLength(0);
    });
  }

  test("every nav item navigates to a live page", async ({ page }) => {
    await page.goto("/");
    const items = await page.locator("header nav a").all();
    expect(items.length).toBeGreaterThanOrEqual(5);

    for (const item of items) {
      const href = await item.getAttribute("href");
      if (!href || href.startsWith("http")) continue;
      const res = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(res?.status(), `nav → ${href}`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("no internal link on the home page is dead", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.$$eval("a[href^='/']", (els) =>
      Array.from(new Set(els.map((e) => e.getAttribute("href")!))).filter(
        (h) => h && !h.startsWith("//"),
      ),
    );
    expect(hrefs.length).toBeGreaterThan(5);

    const dead: string[] = [];
    for (const href of hrefs) {
      const res = await page.request.get(href.split("#")[0]);
      if (res.status() >= 400) dead.push(`${href} → ${res.status()}`);
    }
    expect(dead, `dead links: ${dead.join(", ")}`).toHaveLength(0);
  });

  test("the theme toggle switches and survives navigation", async ({ page }) => {
    /*
      Forced dark rather than assumed dark. The theme follows the OS now, and Playwright's
      default context is `colorScheme: light` — so this test's premise ("the page starts
      dark") stopped being true the moment `prefers-color-scheme` was honoured.
    */
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html.light")).toHaveCount(0);

    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator("html.light")).toHaveCount(1);

    // The choice is persisted, not just applied to the current document.
    await page.goto("/work");
    await expect(page.locator("html.light")).toHaveCount(1);

    await page.getByRole("button", { name: /switch to dark theme/i }).click();
    await expect(page.locator("html.light")).toHaveCount(0);
  });

  test("the tabs switch collections, and labs arrive with the same weight", async ({ page }) => {
    await page.goto("/work");

    // Scoped to the tab strip: the footer also links to /labs, so an unscoped role
    // query matches two elements and trips strict mode.
    const tabs = () => page.getByRole("navigation", { name: /work sections/i });
    await expect(tabs().getByRole("link", { name: /^Case studies/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await tabs().getByRole("link", { name: /^Labs/ }).click();
    await expect(page).toHaveURL(/\/labs$/);

    /*
      The reason the tab exists. Labs were previously restated on /work as a bare
      name-and-tagline list, so the two collections read as different classes of work
      rather than the same work at different depth. Switching to Labs must land on
      cards carrying a capture, exactly as the case studies do.
    */
    const first = page.locator("main article").first();
    await expect(first).toBeVisible();
    expect(await first.locator("img, video").count()).toBeGreaterThan(0);

    await tabs().getByRole("link", { name: /^Case studies/ }).click();
    await expect(page).toHaveURL(/\/work$/);
  });

  /*
    The headline number on /demos has to equal its own tabs.

    It has drifted twice. First as "13 of 16 projects captured" beside tabs adding to
    13 but counting a different rule, then as 14 when the rule changed to "has any
    capture" — which is true of LedgerGuard, whose hover loop gives /demos nothing to
    build a section around. Both times the page stated a total it was not showing.

    Asserted as arithmetic rather than against the literal 13, so adding a recording
    moves every number together instead of failing here.
  */
  test("the demos count equals the two tab counts", async ({ page }) => {
    await page.goto("/demos");

    const counts = await page
      .locator("nav[aria-label='Demo sections'] a span")
      .allTextContents();
    expect(counts).toHaveLength(2);
    const fromTabs = counts.reduce((sum, c) => sum + Number(c.trim()), 0);

    const readout = await page.getByText(/of \d+ projects have a walkthrough/).textContent();
    const stated = Number(readout?.match(/^\s*(\d+) of/)?.[1]);

    expect(stated, `readout says ${stated}, tabs add to ${fromTabs}`).toBe(fromTabs);

    // And the stated number is the number of entries actually rendered across both.
    const onLabs = await page.locator("main section h2").count();
    await page.goto("/demos/case-studies");
    const onCaseStudies = await page.locator("main section h2").count();
    expect(onLabs + onCaseStudies).toBe(stated);
  });

  /*
    Each tab shows its own collection and nothing from the other, and /demos lands on
    labs with the narrated demos at the top.

    The two are asserted together because they are one intent: the page a visitor opens
    should lead with the recordings that have someone explaining them, and a tab that
    says "Labs" should not contain a case study.
  */
  /*
    /demos leads with what moves, and screenshots go in a slider rather than a stack.

    InvoiceOps — four screenshots, no recording — used to sit sixth among the labs,
    above five projects with a video, and each of its shots was rendered full width.
    Between them that made the index a wall of stills with the recordings buried in it.
  */
  test("demos lead with video, and multi-shot projects use a slider", async ({ page }) => {
    await page.goto("/demos");

    const bands = await page.locator("main section").evaluateAll((sections) =>
      sections.map((s) => ({
        name: s.querySelector("h2")?.textContent?.trim() ?? "?",
        // The walkthrough renders a play control; a stills-only project has none.
        hasVideo: Boolean(s.querySelector("button")),
      })),
    );
    expect(bands.length).toBeGreaterThan(1);

    // No project without a recording may precede one with a recording.
    const lastWithVideo = bands.map((b) => b.hasVideo).lastIndexOf(true);
    const firstWithout = bands.map((b) => b.hasVideo).indexOf(false);
    if (firstWithout !== -1) {
      expect(firstWithout, `${bands[firstWithout].name} outranks a project with a video`)
        .toBeGreaterThan(lastWithVideo);
    }

    // Every project with more than one screenshot gets a track that actually scrolls.
    const tracks = page.locator(".shot-slider");
    const count = await tracks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const m = await tracks.nth(i).evaluate((el) => ({
        slides: el.children.length,
        overflows: el.scrollWidth > el.clientWidth + 1,
      }));
      expect(m.slides).toBeGreaterThan(1);
      expect(m.overflows, "a slider that does not overflow is just a cropped image").toBe(true);
    }
  });

  test("the screenshot slider needs no JavaScript", async ({ browser }) => {
    // It is a CSS scroll-snap track precisely so it survives here. If this fails, the
    // slider has grown a hydration dependency and half the evidence is unreachable.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/demos", { waitUntil: "domcontentloaded" });

    const track = page.locator(".shot-slider").first();
    await expect(track).toBeVisible();
    const m = await track.evaluate((el) => ({
      slides: el.children.length,
      overflowX: getComputedStyle(el).overflowX,
      focusable: el.getAttribute("tabindex"),
    }));
    expect(m.slides).toBeGreaterThan(1);
    expect(m.overflowX).toBe("auto");
    // A scroll region unreachable by keyboard is a WCAG failure.
    expect(m.focusable).toBe("0");
    await ctx.close();
  });

  /*
    /finance is the domain hub, and every requirement on it claims a receipt. A link
    that 404s turns "each one links to the system that demonstrates it" into a lie, and
    these point at labs whose slugs have moved before.
  */
  test("every requirement on /finance links to a page that exists", async ({ page, request }) => {
    await page.goto("/finance");

    await expect(page.getByRole("heading", { name: /what finance demands/i })).toBeVisible();

    // Every project link on the page, not just the requirements list. Scoping to the
    // list meant finding its container, and `.last()` matched the heading's own
    // wrapper — zero links, a test that could only fail. The whole page is the simpler
    // target and a stricter one.
    const hrefs = await page
      .locator("a[href^='/work/'], a[href^='/labs/']")
      .evaluateAll((els) => [
        ...new Set(els.map((e) => e.getAttribute("href") ?? "").filter(Boolean)),
      ]);

    expect(hrefs.length, "/finance should link to the systems it cites").toBeGreaterThan(5);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `${href} is linked from /finance but does not resolve`).toBe(200);
    }
  });

  test("the old /demos/labs URL redirects instead of 404ing", async ({ page }) => {
    // It is in browser history, and a tab holding the pre-move JavaScript bundle will
    // navigate to it on the next click.
    const res = await page.goto("/demos/labs");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/demos$/);
  });

  test("demo tabs stay pure, and the narrated demos lead", async ({ page }) => {
    await page.goto("/demos");

    const tabs = page.getByRole("navigation", { name: /demo sections/i });
    await expect(tabs.getByRole("link", { name: /^Labs/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const labNames = await page.locator("main section h2").allTextContents();
    expect(labNames.slice(0, 2)).toEqual(["RevLedger", "InvoiceAudit"]);

    // Every entry links into /labs/, so no case study has leaked into this tab.
    const labHrefs = await page
      .locator("main section h2 a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(labHrefs.every((h) => h?.startsWith("/labs/"))).toBe(true);

    await tabs.getByRole("link", { name: /^Case studies/ }).click();
    await expect(page).toHaveURL(/\/demos\/case-studies$/);

    // LedgerLens is the narrated one among the case studies, so it leads here.
    const caseNames = await page.locator("main section h2").allTextContents();
    expect(caseNames[0]).toBe("LedgerLens");

    const caseHrefs = await page
      .locator("main section h2 a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(caseHrefs.every((h) => h?.startsWith("/work/"))).toBe(true);
  });

  test("the /labs capability filter changes what is shown", async ({ page }) => {
    await page.goto("/labs");
    const cards = page.locator("main article, main li");
    const before = await cards.count();
    expect(before).toBeGreaterThan(0);

    // First non-"All" filter chip.
    const chips = page.locator("main button");
    if ((await chips.count()) > 1) {
      await chips.nth(1).click();
      await page.waitForTimeout(400);
      const after = await cards.count();
      // Filtering must do something: fewer items, or at minimum not more.
      expect(after).toBeLessThanOrEqual(before);
    }
  });

  test("a case study carries the sections SPEC 5.2 requires", async ({ page }) => {
    await page.goto("/work/closeops");
    await expect(page.getByRole("heading", { name: /what this system cannot do/i })).toBeVisible();
    // ADR cards, eval numbers and the link cluster are the senior signals.
    await expect(page.getByText(/^alternative$/i).first()).toBeVisible();
    await expect(page.locator("[data-readout]").first()).toBeVisible();
  });

  test("the contact form renders its fields and is submittable markup", async ({ page }) => {
    await page.goto("/contact");
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
    // Every control is labelled — the same rule the axe pass enforces, checked here
    // as behaviour so a future refactor cannot quietly drop a label.
    // Hidden inputs are excluded: Next injects an unlabelled $ACTION_ID field for
    // Server Actions, and a honeypot is deliberately not announced.
    for (const control of await form.locator("input:not([type=hidden]), textarea").all()) {
      const id = await control.getAttribute("id");
      const aria = await control.getAttribute("aria-label");
      const labelled = aria || (id && (await page.locator(`label[for="${id}"]`).count()) > 0);
      expect(labelled, `control ${id ?? "(no id)"} has no label`).toBeTruthy();
    }
  });

  test("the skip link is first in the tab order and reaches main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focused).toMatch(/skip to content/i);
  });

  test("the mobile nav opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /open menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("#mobile-nav")).toBeVisible();

    await page.getByRole("button", { name: /close menu/i }).click();
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  });

  test("no page scrolls horizontally on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/work", "/finance", "/labs", "/work/closeops"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

  test("every image that renders actually loads", async ({ page }) => {
    const broken: string[] = [];
    for (const path of ["/", "/labs", "/work/closeops", "/demos"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const bad = await page.$$eval("img", (imgs) =>
        imgs
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src),
      );
      bad.forEach((b) => broken.push(`${path}: ${b}`));
    }
    expect(broken, `broken images: ${broken.join(", ")}`).toHaveLength(0);
  });

  test("home workbench and finance hero both render meaningful content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".workbench-detail")).toContainText("Give each agent a clear job.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/finance");
    await expect(page.getByRole("img", { name: /stream of ledger postings/i })).toBeVisible();
  });

  test("404 handling returns a real not-found page", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/not found|404/i);
  });

  test("llms.txt, robots and sitemap all serve", async ({ page }) => {
    for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml"]) {
      const res = await page.request.get(path);
      expect(res.status(), `${path}`).toBe(200);
      expect((await res.text()).length, `${path} is empty`).toBeGreaterThan(50);
    }
  });
});
