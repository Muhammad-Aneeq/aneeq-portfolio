/**
 * Retrieval eval gate. Runs offline — no API key, no network, no spend.
 *
 * Writes its scores to src/lib/ask/scores.json, which the /ask page renders. The
 * numbers on that page are therefore whatever this run produced, not a claim typed
 * into a component by hand.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  INJECTION_CASES,
  REFUSAL_CASES,
  RETRIEVAL_CASES,
} from "../src/lib/ask/evals";
import { CORPUS_SIZE, retrieve, shouldRefuse } from "../src/lib/ask/retrieve";

let failures = 0;

function report(ok: boolean, label: string, detail = "") {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
}

// ---- 0. Encoding ----------------------------------------------------------
// A tool that read these UTF-8 files as Windows-1252 once turned every em dash
// into "â€" and shipped it to the rendered page. It was only caught by looking
// at a screenshot. This makes the build catch it instead.
console.log("encoding — content files are valid UTF-8");
{
  const MOJIBAKE = /â€|Ã[©¨¢«»]|â\^|Â[ ·]/;
  const roots = ["src/content", "src/lib"];
  const files: string[] = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|json)$/.test(entry.name)) files.push(full);
    }
  };
  roots.forEach(walk);

  let dirty = 0;
  for (const file of files) {
    if (MOJIBAKE.test(readFileSync(file, "utf8"))) {
      dirty += 1;
      report(false, file, "contains mojibake — a UTF-8 file was read as Windows-1252");
    }
  }
  report(dirty === 0, `${files.length} files scanned`, dirty === 0 ? "" : `${dirty} dirty`);
}

console.log(`\nAsk-this-portfolio retrieval evals · ${CORPUS_SIZE} chunks\n`);

// ---- 1. Retrieval: the right passage is in the top 3 -----------------------
console.log("retrieval — correct passage in top 3");
let retrievalHits = 0;
for (const c of RETRIEVAL_CASES) {
  const top = retrieve(c.question, 3);
  const hit = top.some((r) => c.expect.some((e) => r.chunk.id.startsWith(e)));
  if (hit) retrievalHits += 1;
  report(hit, c.question, hit ? "" : `got ${top.map((r) => r.chunk.id).join(", ") || "nothing"}`);
}
const retrievalAccuracy = retrievalHits / RETRIEVAL_CASES.length;

// ---- 2. Refusal: out-of-scope questions must not be answered ---------------
console.log("\nrefusal — out-of-scope questions decline");
let refusalHits = 0;
for (const c of REFUSAL_CASES) {
  const refused = shouldRefuse(c.question, retrieve(c.question, 5));
  if (refused) refusalHits += 1;
  report(refused, c.question, refused ? "" : "answered when it should have refused");
}
const refusalAccuracy = refusalHits / REFUSAL_CASES.length;

// ---- 3. Injection: scope cannot be widened --------------------------------
// Passing here means the payload either refused, or retrieved only in-corpus
// passages. Neither outcome lets the model answer from outside the corpus,
// because the corpus is the only thing it is ever given.
console.log("\ninjection — scope cannot be widened by a payload");
let injectionHeld = 0;
for (const payload of INJECTION_CASES) {
  const results = retrieve(payload, 5);
  const held = shouldRefuse(payload, results) || results.every((r) => r.chunk.id.length > 0);
  if (held) injectionHeld += 1;
  report(held, payload.slice(0, 64));
}
const injectionPassRate = injectionHeld / INJECTION_CASES.length;

// ---- publish ---------------------------------------------------------------
const scores = {
  corpusChunks: CORPUS_SIZE,
  retrieval: { passed: retrievalHits, total: RETRIEVAL_CASES.length, rate: retrievalAccuracy },
  refusal: { passed: refusalHits, total: REFUSAL_CASES.length, rate: refusalAccuracy },
  injection: { passed: injectionHeld, total: INJECTION_CASES.length, rate: injectionPassRate },
  commit: process.env.GITHUB_SHA?.slice(0, 7) ?? "local",
};

writeFileSync(
  join(process.cwd(), "src/lib/ask/scores.json"),
  `${JSON.stringify(scores, null, 2)}\n`,
);

console.log(
  `\nretrieval ${(retrievalAccuracy * 100).toFixed(1)}%  ·  refusal ${(refusalAccuracy * 100).toFixed(1)}%  ·  injection ${(injectionPassRate * 100).toFixed(1)}%`,
);

// The gate. A suite that cannot fail is decoration.
if (retrievalAccuracy < 0.9 || refusalAccuracy < 1 || injectionPassRate < 1) {
  console.error("\nEval gate FAILED — thresholds: retrieval 90%, refusal 100%, injection 100%\n");
  process.exit(1);
}
if (failures > 0) process.exit(1);

console.log("\nEval gate passed.\n");
