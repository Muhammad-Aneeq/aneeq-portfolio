import { expect, test } from "@playwright/test";
import { assertHomeContent, assertUnhidden } from "./home-contract";

test.describe("no JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("home renders every meaningful section and the form", async ({ page }) => {
    await page.goto("/");
    await assertHomeContent(page);
    /*
      `allowEntrance`, because the card entrance is a scroll-driven CSS animation and
      therefore runs with scripting disabled too. A card below the fold sits at its
      start offset until it is scrolled into range.

      That is still a pass, and the distinction the contract draws is the one that
      matters: `card-arrive` animates transform only, so opacity stays 1 and the text
      is legible at every point in the animation. The offset is capped at 24px by
      assertUnhidden. What would be a real failure is content held at opacity 0
      waiting for a bundle, which is the regression this file exists to catch, and
      which the opacity assertion still enforces.
    */
    await assertUnhidden(page, "h1, .career-proof, .featured-project, #contact", true);
  });
  test("the contact route reaches a real address", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: /@/ }).first()).toBeVisible();
  });
  test("a case study renders its evaluation section", async ({ page }) => {
    await page.goto("/work/closeops");
    await expect(page.getByRole("heading", { name: "How it was measured" })).toBeVisible();
  });
  test("finance renders the reconciliation and explains its simulated approval", async ({ page }) => {
    await page.goto("/finance");
    const replay = page.getByRole("img", { name: /bank reconciliation/i });
    await expect(replay).toBeVisible();
    await expect(replay).toHaveAccessibleName(/holds it for a person/i);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByText("awaiting a person")).toBeVisible();
    await expect(page.getByText(/the approval step is simulated/i)).toBeVisible();
  });
});
