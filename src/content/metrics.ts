import { caseStudies, projectCount } from "@/content";
/**
 * The canonical figures about Aneeq, and the only place any of them is written down.
 *
 * Before this file the same four numbers were re-typed on `/`, `/about`, `/resume` and
 * `/teaching`, and they had drifted into six different labels for four facts:
 * "12 AI systems designed and built" against "12 governed agent systems built";
 * "4+ yrs engineering, the last two in AI" against "4+ yrs engineering experience";
 * "Four years" spelled out in home prose against "4+ yrs" in every strip; and "5000+"
 * rendered without a comma next to "5,000+" with one.
 *
 * A portfolio whose argument is that claims should be inspectable cannot state the same
 * claim four different ways. One value, one label, one formatter, one file.
 *
 * `scope` is the line that goes *under* the number. A bare "0" is not a readout of
 * anything — it needs "duplicate postings" in the headline and "under 36 concurrent
 * forced retries" beneath it before a reader can tell whether it is impressive.
 */

export type SiteMetric = {
  id: string;
  /** The figure, already formatted. Written, not computed — these are facts, not maths. */
  value: string;
  /** What the number counts. Goes beside or under the value. */
  label: string;
  /** The qualifier that makes the number checkable. Optional but strongly preferred. */
  scope?: string;
  /** Where the evidence lives. */
  href?: string;
};

export const METRICS = {
  systems: {
    id: "systems",
    value: String(projectCount),
    /**
     * "built", never "shipped".
     *
     * These are complete systems with running code, and none of them is in production
     * at a client. "Shipped" would be the word a hiring manager tests first, and the
     * honest answer would undercut everything else on the page.
     */
    label: "AI projects built and evaluated",
    scope: "designed, built and evaluated; none yet in production at a client",
    href: "/work",
  },
  experience: {
    id: "experience",
    value: "4+ yrs",
    label: "engineering experience",
    scope: "the last two building multi-agent and retrieval systems",
    href: "/resume",
  },
  trained: {
    id: "trained",
    value: "5,000+",
    label: "engineers trained",
    scope: "across three Pakistani national AI programmes",
    href: "/teaching",
  },
  studies: {
    id: "studies",
    value: String(caseStudies.length),
    label: "documented engineering case studies",
    scope: "architecture, evaluation and limitations available to inspect",
    // Plain /work. The `#case-studies` anchor it used to carry was the in-page marker
    // for the old two-section layout, and went away when that became a tab — /work now
    // *is* the case studies view, so the fragment pointed at nothing.
    href: "/work",
  },
  faculty: {
    id: "faculty",
    value: "~100",
    label: "instructors led",
    scope: "as Head of Faculty, GIAIC",
    href: "/teaching",
  },
} as const satisfies Record<string, SiteMetric>;

export type MetricId = keyof typeof METRICS;

/** The four-across strip used on `/` and `/resume`. */
export const HEADLINE_METRICS: MetricId[] = ["systems", "experience", "studies", "trained"];

/** `/teaching` has no reason to lead with a systems count. */
export const TEACHING_METRICS: MetricId[] = ["trained", "faculty"];

/**
 * `/about` shows one strip, not two.
 *
 * It used to carry a four-figure strip near the top and a second four-figure grid 400px
 * below it, restating three of the same numbers in a different component with different
 * labels. The biography page is the one place a reader is already reading prose; a second
 * recital of the same figures is the section that pushed the actual story down the page.
 */
export const ABOUT_METRICS: MetricId[] = ["experience", "systems", "trained", "faculty"];

export function metricsFor(ids: readonly MetricId[]): SiteMetric[] {
  return ids.map((id) => METRICS[id]);
}
