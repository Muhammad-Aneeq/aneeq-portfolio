import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

/**
 * All three are variable fonts, self-hosted by next/font at build time (no
 * requests to Google at runtime). Font preloading with `display: swap` is one of
 * the four highest-impact LCP fixes. See SPEC §3.3.
 *
 * Budget: the three preloaded faces must stay under 150 KB combined, asserted in
 * Lighthouse CI (`resource-summary:font:size`).
 */

/**
 * Display.
 *
 * Originally requested with `opsz` and `wdth` axes on the theory that the hero
 * would animate them. It never did — and those two axes alone made this face
 * 128 KB, most of the font budget, for glyph variations nothing rendered. Weight
 * is the only axis actually used.
 *
 * **Re-measured for the Hero v2 pass, and the answer did not change.** SPEC §3.5
 * asked the hero headline to animate `wdth` on one word, which would have reversed
 * B6's premise. Measured: adding the axis takes this face 40.3 KB -> 76.3 KB and the
 * preloaded total 118.2 KB -> 154.2 KB, against a 150 KB budget. §3.5's own rule is
 * that the width animation is cut before the budget is, so it was. Thirty-six
 * kilobytes to animate the width of a single word was never a good trade.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  // Only the range the display scale actually sets.
  weight: ["600", "700"],
});

/** Body. */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** Instrument readouts: metrics, trace labels, code. A semantic choice, not a stylistic one. */
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const fontVariables = `${bricolage.variable} ${inter.variable} ${jetbrains.variable}`;
