import { expect, type Page } from "@playwright/test";
import { HEADLINE_METRICS, metricsFor } from "../src/content/metrics";

/** Readable end states, regardless of JavaScript, motion preference, or hydration. */
export async function assertHomeContent(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: /AI systems/i })).toBeVisible();
  const proof = page.getByRole("region", { name: "Experience at a glance" });
  for (const metric of metricsFor(HEADLINE_METRICS)) {
    await expect(proof.getByText(metric.value, { exact: true })).toBeVisible();
    await expect(proof.getByText(metric.label, { exact: true })).toBeVisible();
    expect(metric.scope).toBeTruthy();
    await expect(proof.getByText(metric.scope!, { exact: true })).toBeVisible();
  }
  for (const name of ["CloseOps", "FinAgent-Evals", "LedgerLens"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /Have a hard problem/i })).toBeVisible();
  for (const name of ["Name", "Email", "Message"]) {
    await expect(page.getByRole("textbox", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
  await expect(page.locator(".workbench-detail")).toContainText("Give each agent a clear job.");
}

export async function assertUnhidden(page: Page, selector: string, allowEntrance = false) {
  const states = await page.locator(selector).evaluateAll(elements => elements.map(el => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { opacity: Number(style.opacity), transform: style.transform, height: rect.height, visibility: style.visibility };
  }));
  expect(states.length).toBeGreaterThan(0);
  for (const state of states) {
    expect(state.opacity).toBeGreaterThanOrEqual(.99);
    if (allowEntrance && state.transform !== "none") {
      const values = state.transform.match(/matrix\((.*)\)/)?.[1].split(",").map(Number);
      expect(values, "Only a small readable entrance offset is allowed").toBeTruthy();
      expect(Math.abs(values![5])).toBeLessThanOrEqual(24);
    } else expect(state.transform).toBe("none");
    expect(state.height).toBeGreaterThan(0);
    expect(state.visibility).toBe("visible");
  }
}
