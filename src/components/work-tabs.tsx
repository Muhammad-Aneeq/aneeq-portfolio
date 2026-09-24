import { SectionTabs } from "@/components/ui/section-tabs";
import { caseStudies, labs } from "@/content";

/**
 * `Labs | Case studies` for the work section.
 *
 * Labs lead, and /work is the labs view. The two used to be separate pages, /work and
 * /labs, each with its own heading and intro, so pressing a tab swapped the entire page
 * rather than the list under it. They now share a hero and differ only in what they
 * list, which is what makes the control read as a tab.
 *
 * The tab order matches the landing route deliberately: a first tab labelled one thing
 * above a page showing another is the inconsistency this pairing had before.
 *
 * Counts cover the whole collection, not the part with a capture. The labs view shows
 * the recorded ones as cards and the rest as rows, so both are on the page either way,
 * and a count that only reached the cards disagreed with the tab beside it.
 */
export function WorkTabs({ active }: { active: "work" | "labs" }) {
  return (
    <SectionTabs
      label="Work sections"
      activeHref={active === "labs" ? "/work" : "/work/case-studies"}
      tabs={[
        { href: "/work", label: "Labs", count: labs.length },
        { href: "/work/case-studies", label: "Case studies", count: caseStudies.length },
      ]}
    />
  );
}
