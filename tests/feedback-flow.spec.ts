import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { settleReveals } from "./settle";

/**
 * The feedback system, end to end, against the database in .env.local.
 *
 * Runs only where a database and an auth secret are configured (locally, against the
 * Neon `dev` branch). CI has neither, so the whole file skips there rather than
 * failing on missing infrastructure.
 *
 * Signing in: the tests do not click through GitHub, which would need the owner's
 * real credentials. They mint the session cookie directly with AUTH_SECRET, exactly
 * as the callback route does after GitHub confirms the login. That covers everything
 * except GitHub's own hop, and the tests below check the two ends of that hop: the
 * redirect out, and the refusal of a callback that was not started here.
 *
 * Every row the tests create is labelled with this run's id and deleted afterwards.
 */

loadEnvConfig(process.cwd());
const DB = process.env.DATABASE_URL;
const SECRET = process.env.AUTH_SECRET;
const ADMIN = process.env.ADMIN_GITHUB_LOGIN;
const RUN = `E2E-${Date.now().toString(36)}`;

test.skip(!DB || !SECRET || !ADMIN, "needs DATABASE_URL, AUTH_SECRET and ADMIN_GITHUB_LOGIN");
// One browser project is enough: this is about data and access, not motion.
test.beforeEach(({}, info) => test.skip(info.project.name !== "chromium", "chromium only"));
test.describe.configure({ mode: "serial" });

/** The same format as src/lib/admin-session.ts, written independently to check it. */
function sessionCookie(login: string, expiresInMs = 3_600_000, secret = SECRET!) {
  const payload = Buffer.from(JSON.stringify({ login, exp: Date.now() + expiresInMs })).toString("base64url");
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

async function signIn(context: BrowserContext, value = sessionCookie(ADMIN!)) {
  await context.addCookies([
    { name: "admin_session", value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
}

async function createInvite(page: Page, label: string, relationship = "client") {
  await page.goto("/admin/feedback");
  await page.fill("#invite-label", label);
  await page.selectOption("#invite-relationship", relationship);
  await page.getByRole("button", { name: "Create link" }).click();
  const link = (await page.getByTestId("new-invite-link").textContent())!.trim();
  expect(link).toMatch(/\/feedback\/[A-Za-z0-9_-]{20,}$/);
  return new URL(link).pathname;
}

/*
  Deleting the rows is not enough. An approval in this file rebuilds the prerendered home
  and services pages with the test quote on them, and a direct SQL delete does not tell
  Next to rebuild them again, so "E2E Sarah Client" stayed on the local build's home page
  after every run. So: delete the rows, then make one admin action that refreshes every
  feedback page (creating an invite does), against a database that no longer holds the
  test entries, and check the home page is clean.
*/
test.afterAll(async ({ browser }) => {
  if (!DB) return;
  const sql = neon(DB);
  await sql`DELETE FROM feedback_entries WHERE invite_id IN (SELECT id FROM feedback_invites WHERE label LIKE ${RUN + "%"})`;
  await sql`DELETE FROM feedback_invites WHERE label LIKE ${RUN + "%"}`;

  const context = await browser.newContext();
  await signIn(context);
  const page = await context.newPage();
  await createInvite(page, `${RUN} cache refresh`);
  await sql`DELETE FROM feedback_invites WHERE label LIKE ${RUN + "%"}`;
  await page.goto("/");
  await expect(page.locator("main")).not.toContainText(RUN);
  await context.close();
});

test.describe("admin access", () => {
  test("the queue is closed to anyone not signed in", async ({ page }) => {
    await page.goto("/admin/feedback");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Sign in with GitHub" })).toBeVisible();
  });

  test("a forged, expired or foreign session is refused", async ({ browser }) => {
    const attempts = {
      "wrong secret": sessionCookie(ADMIN!, 3_600_000, "x".repeat(43)),
      expired: sessionCookie(ADMIN!, -60_000),
      "another GitHub user": sessionCookie("someone-else"),
      garbage: "not.a-session",
    };
    for (const [why, value] of Object.entries(attempts)) {
      const context = await browser.newContext();
      await signIn(context, value);
      const page = await context.newPage();
      await page.goto("/admin/feedback");
      await expect(page, why).toHaveURL(/\/admin$/);
      await context.close();
    }
  });

  test("sign-in hands off to GitHub with a state, and a stray callback is refused", async ({ request }) => {
    const res = await request.get("/api/auth/signin/github", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const to = new URL(res.headers()["location"]);
    expect(to.origin).toBe("https://github.com");
    expect(to.searchParams.get("client_id")).toBe(process.env.GITHUB_CLIENT_ID);
    expect(to.searchParams.get("redirect_uri")).toMatch(/\/api\/auth\/callback\/github$/);
    expect(to.searchParams.get("state")?.length).toBeGreaterThan(20);
    expect(res.headers()["set-cookie"]).toContain("oauth_state=");

    // A callback nobody started: no state cookie, so it must not produce a session.
    const cb = await request.get("/api/auth/callback/github?code=abc&state=forged", { maxRedirects: 0 });
    expect(cb.headers()["location"]).toContain("/admin?error=state");
    expect(cb.headers()["set-cookie"] ?? "").not.toContain("admin_session=");
  });
});

test.describe("invite to publication", () => {
  test("an invited person submits, the owner trims and approves, the site shows it", async ({ browser }) => {
    const admin = await browser.newContext();
    await signIn(admin);
    const adminPage = await admin.newPage();
    const name = `${RUN} Sarah Client`;
    const path = await createInvite(adminPage, `${RUN} invite for Sarah`, "employer");

    // The invited person, in a separate browser with no session.
    const guest = await browser.newContext();
    const form = await guest.newPage();
    await form.goto(path);
    await expect(form.getByRole("heading", { name: "How was working together?" })).toBeVisible();
    await expect(form.getByText("feedback · former employer")).toBeVisible();

    // Validation: no rating, too short.
    await form.fill("#name", name);
    await form.fill("#message", "Too short");
    await form.getByRole("button", { name: "Send feedback" }).click();
    await expect(form.locator("#rating-error")).toHaveText("Please choose a rating.");
    await expect(form.locator("#message-error")).toBeVisible();
    // What was typed survives the failed submit.
    await expect(form.locator("#name")).toHaveValue(name);

    const quote = "Aneeq rebuilt our reconciliation pipeline and it caught errors we had missed for months. Clear, careful and honest about what the system could not do.";
    await form.fill("#role", "Finance Director");
    await form.fill("#company", "Northwind");
    await form.locator("label[for='rating-5']").click();
    await form.fill("#message", quote);
    await form.fill("#profileUrl", "https://linkedin.com/in/example");
    await form.check("#consent");
    await form.getByRole("button", { name: "Send feedback" }).click();
    await expect(form.getByTestId("feedback-sent")).toContainText("That has been sent.");

    // The link is spent.
    await form.goto(path);
    await expect(form.getByTestId("invite-invalid")).toBeVisible();

    // Not public while pending.
    const pub = await guest.newPage();
    await pub.goto("/feedback");
    await expect(pub.getByText(name)).toHaveCount(0);

    // In the owner's queue, pending, with consent shown.
    await adminPage.goto("/admin/feedback");
    const card = adminPage.getByTestId("queue-pending").locator(`[data-entry-name="${name}"]`);
    await expect(card).toBeVisible();
    await expect(card.getByTestId("consent")).toHaveText("May be published");

    // Trim, then approve.
    const trimmed = "Aneeq rebuilt our reconciliation pipeline and it caught errors we had missed for months.";
    await card.getByText("Trim the published text").click();
    await card.locator("textarea[name='published_quote']").fill(trimmed);
    await card.getByRole("button", { name: "Save trim" }).click();
    const cardAfterTrim = adminPage.getByTestId("queue-pending").locator(`[data-entry-name="${name}"]`);
    await expect(cardAfterTrim.getByText("Original, as written")).toBeVisible();
    await cardAfterTrim.getByRole("button", { name: "Approve and publish" }).click();
    await expect(adminPage.getByTestId("queue-approved").locator(`[data-entry-name="${name}"]`)).toBeVisible();

    // Public now: the trimmed text, the name, the relationship. Not the original.
    await pub.goto("/feedback");
    const wall = pub.getByTestId("feedback-wall");
    await expect(wall.getByText(name)).toBeVisible();
    await expect(wall.getByText(trimmed)).toBeVisible();
    await expect(wall.getByText(quote)).toHaveCount(0);
    await expect(wall.getByText("Former employer").first()).toBeVisible();
    await expect(wall.getByText("Finance Director, Northwind")).toBeVisible();

    // Home and services are built ahead of time; approving must rebuild them.
    for (const route of ["/", "/services"]) {
      await pub.goto(route);
      await expect(pub.getByTestId("feedback-wall").getByText(name), route).toBeVisible();
    }

    // Unpublish takes it straight back off the site.
    await adminPage.getByTestId("queue-approved").locator(`[data-entry-name="${name}"]`).getByRole("button", { name: "Unpublish" }).click();
    await expect(adminPage.getByTestId("queue-pending").locator(`[data-entry-name="${name}"]`)).toBeVisible();
    for (const route of ["/feedback", "/", "/services"]) {
      await pub.goto(route);
      await expect(pub.getByText(name), `${route} after unpublish`).toHaveCount(0);
    }

    await guest.close();
    await admin.close();
  });

  test("feedback without consent can never be published", async ({ browser }) => {
    const admin = await browser.newContext();
    await signIn(admin);
    const adminPage = await admin.newPage();
    const name = `${RUN} Private Person`;
    const path = await createInvite(adminPage, `${RUN} invite private`);

    const guest = await browser.newContext();
    const form = await guest.newPage();
    await form.goto(path);
    await form.fill("#name", name);
    await form.locator("label[for='rating-4']").click();
    await form.fill("#message", "Useful to hear privately, not for the website please, thank you.");
    await form.getByRole("button", { name: "Send feedback" }).click();
    await expect(form.getByTestId("feedback-sent")).toBeVisible();

    await adminPage.goto("/admin/feedback");
    const card = adminPage.locator(`[data-entry-name="${name}"]`);
    await expect(card.getByTestId("consent")).toHaveText("Private: no consent");
    await expect(card.getByRole("button", { name: "Cannot publish without consent" })).toBeDisabled();

    /*
      Defence in depth: force the row to 'approved' straight in the database, going
      round both the disabled button and the store's refusal. The public query must
      still hide it, because it filters on consent itself rather than trusting status.
    */
    const sql = neon(DB!);
    const forced = (await sql`
      UPDATE feedback_entries SET status = 'approved', reviewed_at = now()
      WHERE name = ${name} RETURNING status, consent`) as { status: string; consent: boolean }[];
    expect(forced).toEqual([{ status: "approved", consent: false }]);

    const pub = await guest.newPage();
    await pub.goto("/feedback");
    await expect(pub.getByText(name)).toHaveCount(0);

    await guest.close();
    await admin.close();
  });

  test("an admin action posted without a session changes nothing", async ({ browser, playwright }) => {
    const admin = await browser.newContext();
    await signIn(admin);
    const adminPage = await admin.newPage();
    const name = `${RUN} Action Target`;
    const path = await createInvite(adminPage, `${RUN} invite action`);

    const guest = await browser.newContext();
    const form = await guest.newPage();
    await form.goto(path);
    await form.fill("#name", name);
    await form.locator("label[for='rating-5']").click();
    await form.fill("#message", "Consented feedback used to check that actions need a session.");
    await form.check("#consent");
    await form.getByRole("button", { name: "Send feedback" }).click();
    await expect(form.getByTestId("feedback-sent")).toBeVisible();

    // Lift the real approve form's fields, including Next's action id, from the page.
    await adminPage.goto("/admin/feedback");
    const approveForm = adminPage
      .locator(`[data-entry-name="${name}"] form`)
      .filter({ has: adminPage.locator("input[name='status'][value='approved']") });
    const fields = await approveForm.evaluate((f: HTMLFormElement) =>
      Object.fromEntries([...new FormData(f).entries()].map(([k, v]) => [k, String(v)])),
    );
    expect(Object.keys(fields).some((k) => k.startsWith("$ACTION"))).toBe(true);

    // Replay it with no cookie at all.
    const anon = await playwright.request.newContext({ baseURL: "http://localhost:3100" });
    await anon.post("/admin/feedback", { multipart: fields, maxRedirects: 0 }).catch(() => null);
    await anon.dispose();

    const sql = neon(DB!);
    const [row] = (await sql`SELECT status FROM feedback_entries WHERE name = ${name}`) as { status: string }[];
    expect(row.status).toBe("pending");

    await guest.close();
    await admin.close();
  });

  test("a withdrawn link stops working", async ({ browser }) => {
    const admin = await browser.newContext();
    await signIn(admin);
    const adminPage = await admin.newPage();
    const label = `${RUN} invite withdrawn`;
    const path = await createInvite(adminPage, label);

    await adminPage.goto("/admin/feedback");
    const row = adminPage.getByTestId("invite-list").locator("li", { hasText: label });
    await expect(row).toContainText("Open");
    await row.getByRole("button", { name: "Withdraw" }).click();
    await expect(adminPage.getByTestId("invite-list").locator("li", { hasText: label })).toContainText("Withdrawn");

    const guest = await browser.newContext();
    const page = await guest.newPage();
    await page.goto(path);
    await expect(page.getByTestId("invite-invalid")).toBeVisible();
    await guest.close();
    await admin.close();
  });

  /*
    The two pages people actually use need an invite or a session, so the route-list
    accessibility sweep cannot reach them. Checked here instead, in both themes.
  */
  test("the invite form and the admin queue pass axe in both themes", async ({ browser }) => {
    for (const colorScheme of ["dark", "light"] as const) {
      const admin = await browser.newContext({ colorScheme });
      await signIn(admin);
      const adminPage = await admin.newPage();
      const path = await createInvite(adminPage, `${RUN} invite axe ${colorScheme}`);

      for (const [what, page, url] of [
        ["admin queue", adminPage, "/admin/feedback"],
        ["invite form", adminPage, path],
      ] as const) {
        await page.goto(url);
        await settleReveals(page);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const found = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`);
        expect(found, `${what} (${colorScheme})`).toEqual([]);
      }
      await admin.close();
    }
  });

  test("an unknown token shows the inactive-link page, not an error", async ({ page }) => {
    const res = await page.goto("/feedback/this-is-not-a-real-token-at-all");
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("invite-invalid")).toBeVisible();
  });
});
