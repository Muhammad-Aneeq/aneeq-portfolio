import { caseStudies, labs } from "@/content";
import type { Domain } from "@/content/schema";

/**
 * Domain depth — SPEC §2, rendered by Row 5.5.
 *
 * Row 5.5 previously claimed to be "driven by the `domain` field, never hand-written."
 * That was not true and could not be: **no project has `domain: "education"`**, because
 * teaching is not a project. The component was fabricating that cell while the spec
 * asserted it was derived — the worst of both, since it looked principled and was not.
 *
 * So the two halves are separated and each is honest about what it is:
 *   - `projectCount` is COMPUTED, so it can never overstate the work.
 *   - `stats` is hand-stated, so a pillar with real evidence but no repository is not
 *     silently dropped for failing a test it was never meant to take.
 *
 * `evidenceHref` is required. A pillar the reader cannot click into is an assertion,
 * and that is exactly what made the domain pillar the weakest of the three.
 */
export type DomainEntry = {
  id: Domain;
  label: string;
  /** The cell is a link. No entry without somewhere to send the reader. */
  evidenceHref: string;
  projectCount: number;
  stats: string[];
};

const projects = [...caseStudies, ...labs];
const countIn = (d: Domain) => projects.filter((p) => p.domain === d).length;

const LABELS: Record<Domain, string> = {
  finance: "Finance & accounting",
  education: "Education systems at scale",
  devtools: "Developer tooling",
  other: "Other domains",
};

/**
 * A third entry appears only when a project with a non-finance domain exists.
 * Never a greyed cell, never "coming soon" — FEEDBACK E7 applied to domains.
 */
const emergent: DomainEntry[] = [
  ...new Set(projects.map((p) => p.domain).filter((d) => d !== "finance")),
].map((id) => ({
  id,
  label: LABELS[id],
  evidenceHref: "/labs",
  projectCount: countIn(id),
  stats: ["The same engineering, applied outside the domain it was proven in"],
}));

export const domains: DomainEntry[] = [
  {
    id: "finance",
    label: LABELS.finance,
    evidenceHref: "/finance",
    projectCount: countIn("finance"),
    stats: ["1 open benchmark", "1 open MCP fixture", "All data synthetic"],
  },
  {
    id: "education",
    label: LABELS.education,
    evidenceHref: "/teaching",
    // Zero, and correctly so: teaching is not a project. This is the number the
    // old derived-only design had no honest way to represent.
    projectCount: 0,
    stats: ["~100 instructors led", "5,000+ engineers trained", "3 national programmes"],
  },
  ...emergent,
];

export const financeProjectCount = countIn("finance");

/**
 * Every shipped project, derived. Twelve, not thirteen: ReportSmith has a plan and a
 * progress log but no code, and "no placeholder projects" (FEEDBACK E7) means it is
 * not counted until it runs. /about hard-coded 13 and therefore disagreed with the
 * hero the moment the hero started deriving its number — this is the single source.
 */
export const totalProjectCount = projects.length;
