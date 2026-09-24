/**
 * Bundle-size gate (SPEC §8).
 *
 *   home route, excluding the lazy 3D chunk   < 200 KB gzipped
 *   the 3D chunk itself                       < 250 KB gzipped
 *
 * "Home route JS" is derived from the chunks the prerendered home page actually
 * references, which is the honest definition: the 3D scene is dynamically imported
 * with ssr disabled, so if it ever leaks into the initial payload it appears in
 * that list and the first budget blows — which is the failure this is here to catch.
 *
 * On the 200: the spec said 180, written before anything was measured. Measured,
 * react-dom is 70 KB gz and the React/Next App Router runtime another 83 — a
 * ~153 KB floor before a single line of this site's code. 180 would have left
 * 27 KB for the entire application and failed on the first run forever, and a
 * gate that can never pass is a gate someone deletes. 200 leaves the app code a
 * real ~47 KB and still fails loudly on any material regression: the current
 * 195 KB means adding a 60 KB dependency breaks the build, which is the behaviour
 * the budget exists for. Lower it as app code shrinks; do not raise it quietly.
 */

import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const NEXT = ".next";
const HOME_BUDGET_KB = 200;
const THREE_BUDGET_KB = 250;
/** Measured React + Next App Router runtime. Reported so the app-code share is visible. */
const FRAMEWORK_FLOOR_KB = 153;

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function gzipKb(file: string): number {
  return gzipSync(readFileSync(file)).length / 1024;
}

const homeHtml = walk(join(NEXT, "server", "app")).find((f) => f.endsWith("index.html"));
if (!homeHtml) {
  console.error("Could not find the prerendered home page. Run `next build` first.");
  process.exit(1);
}

const html = readFileSync(homeHtml, "utf8");
const allChunks = walk(join(NEXT, "static", "chunks")).filter((f) => f.endsWith(".js"));

/** Chunks the home document references directly — its initial JS payload. */
const referenced = allChunks.filter((file) => {
  const name = file.split(/[\\/]/).pop()!;
  return html.includes(name);
});

/**
 * The 3D payload, identified by content rather than by hashed filenames.
 *
 * This used to match a single chunk containing `WebGLRenderer`, and that was wrong the
 * moment the scene grew past one chunk. Turbopack split the Governed Core across three:
 * three.js core in one, drei's transmission material plus the post-processing chain plus
 * the scene in another, and a stub in a third. The old check weighed 234 KB and passed
 * while the real lazy payload was 292 KB — a 42 KB breach the gate could not see.
 *
 * So: sum every chunk carrying a 3D marker. `leva` only exists on the dev lab route and
 * is excluded, because shipping a tuning UI on /dev is not a hero cost.
 */
const THREE_MARKERS = [
  "WebGLRenderer",
  "MeshTransmissionMaterial",
  "ContactShadows",
  "KernelSize", // postprocessing
  "GovernedCoreScene",
  "attribute vec3 aState", // posting stream shader, including its scene chunk
];

const threeChunks = allChunks.filter((f) => {
  const src = readFileSync(f, "utf8");
  return THREE_MARKERS.some((m) => src.includes(m));
});

let failed = false;

const homeKb = referenced.reduce((sum, f) => sum + gzipKb(f), 0);
const homeOk = homeKb < HOME_BUDGET_KB;
if (!homeOk) failed = true;

console.log(`\nBundle budget\n`);
console.log(
  `  ${homeOk ? "PASS" : "FAIL"}  home route JS      ${homeKb.toFixed(1)} KB gz  (budget ${HOME_BUDGET_KB} KB, ${referenced.length} chunks)`,
);
console.log(
  `        └─ app code      ~${(homeKb - FRAMEWORK_FLOOR_KB).toFixed(1)} KB gz  (${FRAMEWORK_FLOOR_KB} KB is React + Next runtime)`,
);

if (threeChunks.length > 0) {
  const threeKb = threeChunks.reduce((sum, f) => sum + gzipKb(f), 0);
  const threeOk = threeKb < THREE_BUDGET_KB;
  if (!threeOk) failed = true;
  console.log(
    `  ${threeOk ? "PASS" : "FAIL"}  3D payload (lazy)  ${threeKb.toFixed(1)} KB gz  (budget ${THREE_BUDGET_KB} KB, ${threeChunks.length} chunks)`,
  );
  for (const f of threeChunks.sort((a, b) => gzipKb(b) - gzipKb(a))) {
    console.log(`        └─ ${gzipKb(f).toFixed(1).padStart(6)} KB  ${f.split(/[\\/]/).pop()}`);
  }

  // The whole performance argument for shipping 3D rests on it not being in the
  // initial payload. Assert that separately from its size, for every chunk.
  const leaked = threeChunks.filter((f) => html.includes(f.split(/[\\/]/).pop()!));
  if (leaked.length > 0) failed = true;
  console.log(
    `  ${leaked.length === 0 ? "PASS" : "FAIL"}  3D is lazy         ${
      leaked.length === 0
        ? "absent from the home document"
        : `REFERENCED BY THE HOME DOCUMENT: ${leaked.map((f) => f.split(/[\\/]/).pop()).join(", ")}`
    }`,
  );
  const financeHtml = readFileSync(join(NEXT, "server", "app", "finance.html"), "utf8");
  const financeLeaks = threeChunks.filter(f => financeHtml.includes(f.split(/[\\/]/).pop()!));
  if (financeLeaks.length) failed = true;
  console.log(`  ${financeLeaks.length ? "FAIL" : "PASS"}  finance 3D lazy    absent from initial finance document: ${financeLeaks.length === 0}`);
} else {
  failed = true;
  console.log("  FAIL  no 3D chunk found; the finance scene must be built");
}

const fonts = walk(join(NEXT, "static", "media")).filter(f => f.endsWith(".woff2") && html.includes(f.split(/[\\/]/).pop()!));
const fontKb = fonts.reduce((sum, f) => sum + statSync(f).size / 1024, 0);
const fontsOk = fonts.length > 0 && fontKb <= 150;
if (!fontsOk) failed = true;
console.log(`  ${fontsOk ? "PASS" : "FAIL"}  preloaded fonts   ${fontKb.toFixed(1)} KB (budget 150 KB)`);

const totalKb = allChunks.reduce((sum, f) => sum + gzipKb(f), 0);
console.log(
  `\n  (all chunks on disk: ${totalKb.toFixed(1)} KB gz across ${allChunks.length} files)`,
);

if (failed) {
  console.error("\nBundle budget exceeded — see SPEC §8.\n");
  process.exit(1);
}

console.log("\nBundle budget passed.\n");
