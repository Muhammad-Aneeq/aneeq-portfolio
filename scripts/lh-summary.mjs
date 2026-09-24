import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = ".lighthouseci";
const files = readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"));

const byUrl = new Map();

for (const f of files) {
  const r = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const url = new URL(r.finalDisplayedUrl ?? r.requestedUrl).pathname;
  const a = r.audits;
  const row = {
    perf: Math.round((r.categories.performance.score ?? 0) * 100),
    a11y: Math.round((r.categories.accessibility.score ?? 0) * 100),
    lcp: Math.round(a["largest-contentful-paint"]?.numericValue ?? 0),
    fcp: Math.round(a["first-contentful-paint"]?.numericValue ?? 0),
    tbt: Math.round(a["total-blocking-time"]?.numericValue ?? 0),
    cls: Number((a["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3)),
    si: Math.round(a["speed-index"]?.numericValue ?? 0),
    script: Math.round(
      (a["resource-summary"]?.details?.items?.find((i) => i.resourceType === "script")
        ?.transferSize ?? 0) / 1024,
    ),
    font: Math.round(
      (a["resource-summary"]?.details?.items?.find((i) => i.resourceType === "font")
        ?.transferSize ?? 0) / 1024,
    ),
    lcpEl: a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node
      ?.snippet?.slice(0, 70),
  };
  if (!byUrl.has(url)) byUrl.set(url, []);
  byUrl.get(url).push(row);
}

const median = (arr) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];

for (const [url, rows] of byUrl) {
  console.log(`\n${url}`);
  console.log(
    `  perf ${median(rows.map((r) => r.perf))}  a11y ${median(rows.map((r) => r.a11y))}` +
      `  LCP ${median(rows.map((r) => r.lcp))}ms  FCP ${median(rows.map((r) => r.fcp))}ms` +
      `  TBT ${median(rows.map((r) => r.tbt))}ms  CLS ${median(rows.map((r) => r.cls))}` +
      `  SI ${median(rows.map((r) => r.si))}ms`,
  );
  console.log(`  script ${median(rows.map((r) => r.script))}KB  font ${median(rows.map((r) => r.font))}KB`);
  if (rows[0].lcpEl) console.log(`  LCP element: ${rows[0].lcpEl}`);
}
