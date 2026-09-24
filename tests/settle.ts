import type { Page } from "@playwright/test";

/** Wait for fonts and the one finite introductory animation; never rewrite page styles. */
export async function settleReveals(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const workbench = document.querySelector(".workbench");
    if (workbench) await Promise.all(workbench.getAnimations().map(animation => animation.finished.catch(() => {})));
  });
}

/** Full-page captures must load below-the-fold evidence, including native lazy images. */
export async function prepareScreenshot(page: Page) {
  await settleReveals(page);
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach(image => { image.loading = "eager"; });
    await Promise.all(images.map(image => image.decode()));
  });
}
