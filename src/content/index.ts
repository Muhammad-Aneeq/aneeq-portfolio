import { labs as rawLabs } from "@/content/labs";
import {
  assertTldrLength,
  caseStudySchema,
  labSchema,
  type CaseStudy,
  type Lab,
} from "@/content/schema";
import { closeops } from "@/content/work/closeops";
import { finagentEvals } from "@/content/work/finagent-evals";
import { ledgerguard } from "@/content/work/ledgerguard";
import { ledgerlab } from "@/content/work/ledgerlab";
import { ledgerlens } from "@/content/work/ledgerlens";


/**
 * Content registry, validated at module load. This runs during the build, so a case
 * study missing its Limits section — or with a TL;DR outside the 40–60 word window —
 * fails `next build` rather than shipping a half-finished page.
 */

function validate<T>(items: unknown[], schema: { parse: (v: unknown) => T }, kind: string): T[] {
  return items.map((item, i) => {
    try {
      return schema.parse(item);
    } catch (err) {
      throw new Error(`[content] ${kind}[${i}] failed validation:\n${String(err)}`);
    }
  });
}

export const caseStudies: CaseStudy[] = validate(
  [closeops, ledgerguard, finagentEvals, ledgerlens, ledgerlab],
  caseStudySchema,
  "caseStudy",
).sort((a, b) => a.order - b.order);

caseStudies.forEach(assertTldrLength);

export const labs: Lab[] = validate(rawLabs, labSchema, "lab").sort(
  (a, b) => a.order - b.order,
);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getLab(slug: string): Lab | undefined {
  return labs.find((l) => l.slug === slug);
}

/**
 * A lab earns a bento cell by having a real capture. Derived from `shots` rather
 * than stored as a separate `hasMedia` flag, so the two cannot drift — a project
 * gets its cell the moment a screenshot lands, with no second field to remember.
 *
 * Lives here rather than beside the grid because both a server page and a client
 * component need it, and a `"use client"` module cannot export a function the
 * server may call.
 */
/**
 * Does this project have evidence of any kind: a still, a hover loop, or a walkthrough.
 *
 * A recording counts, not just a still. This read `shots.length > 0`, which was written
 * when stills were the only capture anyone had. Five labs have since been recorded
 * without ever being screenshotted — statementlens, spendsort, reportsmith, revledger,
 * invoiceaudit — and every one of them was being filed under "built, not yet captured"
 * beside a video of it running. docs/MEDIA.md §7 already says the recording *is* the
 * evidence and its poster *is* the screenshot; this is that rule in code rather than
 * in prose.
 */
export const hasCapture = (p: {
  shots: unknown[];
  loop?: unknown;
  walkthrough?: unknown;
}): boolean => p.shots.length > 0 || Boolean(p.loop ?? p.walkthrough);

/** The lab-shaped alias /labs reads, so the grid and the counts share one rule. */
export function hasMedia(lab: Lab): boolean {
  return hasCapture(lab);
}

/*
  There was a `capturedCount` here, counting every project with a capture of any kind.
  Nothing reads it: /labs counts its own collection and /demos counts what it can show,
  and both of those must agree with the tabs beside them. A third site-wide total with
  no caller was a number waiting to be put on a page next to one that disagreed with it.
*/

/*
  What /demos can actually show.

  Deliberately stricter than `hasMedia`: that asks "is there a capture", which a
  six-second hover loop satisfies. /demos is a page of walkthroughs and screens, and a
  loop is neither — a project with only a loop would render a section with nothing to
  play and nothing to browse. LedgerGuard and LedgerLab are exactly that case.

  Exported rather than recomputed per page so the tab counts and the lists beneath
  them come from one definition and cannot disagree.
*/
const isDemoable = (p: { walkthrough?: unknown; shots: unknown[] }) =>
  Boolean(p.walkthrough) || p.shots.length > 0;

/*
  /demos orders by how much a project can show, in three bands.

  1. The narrated demos. Recorded for the portfolio with a person explaining what the
     system is doing, running minutes rather than seconds.
  2. Everything else with a walkthrough. Silent screen captures from the lab repos, but
     still something that plays.
  3. Stills only. Real evidence, but a reader scrolls past it rather than watching it.

  Without this, InvoiceOps — four screenshots and no recording — sat sixth among the
  labs, above five projects with a video. On a page titled "the systems, running", a
  project that does not move should not outrank one that does.

  Ordering applies to /demos only. /work and /labs keep their own curated order, so the
  full index still opens on what it has always opened on.
*/
const NARRATED = ["revledger", "invoiceaudit", "ledgerlens"];

const demosFirst = <T extends { slug: string; walkthrough?: unknown }>(items: T[]): T[] => {
  const rank = (p: T) => {
    const i = NARRATED.indexOf(p.slug);
    if (i !== -1) return i;
    return p.walkthrough ? NARRATED.length : NARRATED.length + 1;
  };
  // Array.prototype.sort is stable, so projects within a band keep their curated order.
  return [...items].sort((a, b) => rank(a) - rank(b));
};

export const demoCaseStudies = demosFirst(caseStudies.filter(isDemoable));
export const demoLabs = demosFirst(labs.filter(isDemoable));

/** The three shown on the home page. */
/**
 * The three projects the home page leads with.
 *
 * Named explicitly rather than `slice(0, 3)`. The positional version silently featured
 * whatever happened to sort first, so adding a project could change the home page
 * without anyone deciding to — and it had already selected LedgerGuard, whose five
 * console screens have never been rendered, into a section whose whole purpose is to
 * hand a reader something to look at.
 *
 * The selection rule is evidence: every featured project must have a capture, so each
 * "read the case study" link lands on screens rather than on more prose. The assertion
 * below enforces that rather than trusting this list to stay true.
 */
const FEATURED_SLUGS = ["closeops", "finagent-evals", "ledgerlens"] as const;

export const featuredCaseStudies: CaseStudy[] = FEATURED_SLUGS.map((slug) => {
  const study = caseStudies.find((c) => c.slug === slug);
  if (!study) {
    throw new Error(
      `[content] featured slug "${slug}" does not match any case study. Update FEATURED_SLUGS in src/content/index.ts.`,
    );
  }
  if (!study.loop && study.shots.length === 0) {
    throw new Error(
      `[content] "${slug}" is featured on the home page but has no capture. Featured projects lead with evidence; either capture it or feature something else.`,
    );
  }
  return study;
});

/**
 * Everything with a narrated walkthrough, case study or lab alike, newest first.
 *
 * Derived rather than listed. A project earns its place here by having a recording,
 * so the home page cannot advertise a demo that does not exist, and adding one is a
 * matter of running `npm run media` rather than editing a second list that then has
 * to be kept in step. See docs/MEDIA.md.
 */
export type DemoProject = {
  slug: string;
  name: string;
  href: string;
  summary: string;
  walkthrough: NonNullable<CaseStudy["walkthrough"]>;
  loop?: CaseStudy["loop"];
};

const DEMO_ORDER = ["revledger", "invoiceaudit", "ledgerlens"] as const;

const missingDemo = (slug: string) =>
  new Error(
    `[content] "${slug}" is listed as a demo but has no walkthrough. Run \`npm run media\` and wire it up, or take it out of DEMO_ORDER.`,
  );

/*
  Branched on the two content types rather than unified first. A case study describes
  itself with `outcome` and a lab with `tagline`, and those fields do not exist on both,
  so narrowing here keeps the summary correct per type without an assertion.
*/
export const demoProjects: DemoProject[] = DEMO_ORDER.flatMap((slug) => {
  const study = caseStudies.find((c) => c.slug === slug);
  if (study) {
    if (!study.walkthrough) throw missingDemo(slug);
    return [{
      slug,
      name: study.name,
      href: `/work/${slug}`,
      summary: study.outcome,
      walkthrough: study.walkthrough,
      loop: study.loop,
    }];
  }

  const lab = labs.find((l) => l.slug === slug);
  if (!lab) {
    throw new Error(
      `[content] demo slug "${slug}" matches no project. Update DEMO_ORDER in src/content/index.ts.`,
    );
  }
  if (!lab.walkthrough) throw missingDemo(slug);
  return [{
    slug,
    name: lab.name,
    href: `/labs/${slug}`,
    summary: lab.tagline,
    walkthrough: lab.walkthrough,
    loop: lab.loop,
  }];
});

export const capabilityFilters = [
  { id: "agents", label: "Agents" },
  { id: "rag", label: "RAG" },
  { id: "evals", label: "Evals" },
  { id: "mcp", label: "MCP" },
  { id: "security", label: "Security" },
  { id: "governance", label: "Governance" },
] as const;

export const projectCount = caseStudies.length + labs.length;
