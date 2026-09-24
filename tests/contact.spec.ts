import { expect, test } from "@playwright/test";

/**
 * The contact form, exercised rather than inspected.
 *
 * `RESEND_API_KEY` is unset in test, so a valid submission reaches the provider branch,
 * finds no key, and returns the honest "not connected to a mail provider" error. Nothing
 * is ever sent by this suite.
 */

const LONG_MESSAGE =
  "This is a long message that a real person would be very annoyed to lose after a single typo in the field above it.";

for (const route of ["/", "/contact"]) {
test.describe(`contact form on ${route}`, () => {
  test.beforeEach(async ({ context }, testInfo) => {
    // Each browser/route case represents a different visitor. Keep the real limiter
    // enabled without letting earlier submissions consume another case's allowance.
    await context.setExtraHTTPHeaders({
      "x-forwarded-for": `192.0.2.${testInfo.project.name === "chromium" ? 10 : 20}${route === "/" ? "1" : "2"}`,
    });
  });

  test("a validation failure does not wipe what was typed", async ({ page }) => {
    await page.goto(route);
    await page.fill("[name=name]", "Test Person");
    await page.fill("[name=email]", "not-an-email");
    await page.fill("[name=message]", LONG_MESSAGE);
    await page.locator("form button[type=submit]").click();

    // A Server Action resets an uncontrolled form when it resolves. Without the values
    // being echoed back and reapplied, one mistyped character costs the whole message.
    await expect(page.locator("[name=message]")).toHaveValue(LONG_MESSAGE);
    await expect(page.locator("[name=name]")).toHaveValue("Test Person");
    await expect(page.locator("[name=email]")).toHaveValue("not-an-email");
  });

  test("errors are announced and tied to the field they belong to", async ({ page }) => {
    await page.goto(route);

    // The live region must exist before it has anything to say, or assistive tech has
    // nothing to observe and the announcement is unreliable.
    const live = page.locator("form [aria-live]");
    await expect(live).toHaveCount(1);

    await page.locator("form button[type=submit]").click();
    await expect(live).toHaveText(/check the form/i);

    for (const field of ["name", "email", "message"]) {
      const input = page.locator(`[name=${field}]`);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      const describedBy = await input.getAttribute("aria-describedby");
      expect(describedBy, `${field} has no aria-describedby`).toBeTruthy();
      await expect(page.locator(`#${describedBy}`)).not.toBeEmpty();
    }
  });

  test("it can be completed and submitted with the keyboard alone", async ({ page }) => {
    await page.goto(route);

    await page.locator("[name=name]").focus();
    await page.keyboard.type("Keyboard Tester");
    await page.keyboard.press("Tab");
    await page.keyboard.type("keyboard@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type(LONG_MESSAGE);
    await page.keyboard.press("Tab");

    await expect(page.locator("form button[type=submit]")).toBeFocused();
    await page.keyboard.press("Enter");

    // Valid input, so it gets past validation to the provider branch.
    await expect(page.locator("form [aria-live]")).toHaveText(/mail provider|in touch|went wrong/i);
  });

  test("every field is labelled and shows a focus ring", async ({ page }) => {
    await page.goto(route);
    for (const field of ["name", "email", "message"]) {
      const input = page.locator(`[name=${field}]`);
      const id = await input.getAttribute("id");
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);

      await input.focus();
      const outlineWidth = await input.evaluate(
        (el) => parseFloat(getComputedStyle(el).outlineWidth) || 0,
      );
      expect(outlineWidth, `${field} has no visible focus ring`).toBeGreaterThan(0);
    }
  });
});

}
