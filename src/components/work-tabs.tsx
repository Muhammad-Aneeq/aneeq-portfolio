import { SectionTabs } from "@/components/ui/section-tabs";
import { caseStudies, labs } from "@/content";

/**
 * `Case studies | Labs` — SPEC §0, §5.3.
 *
 * Labs used to be a sibling nav item, which said they were a separate concern. They
 * are not: they are the same kind of object at less depth, and a tab says that while
 * giving the nav slot back to something that earns it. Both routes and every deep
 * link survive unchanged.
 *
 * Counts cover the whole collection, not the part with a capture. /labs shows the
 * recorded ones as cards and the rest as rows, so both are on the page either way,
 * and a count that only reached the cards disagreed with the tab beside it.
 */
export function WorkTabs({ active }: { active: "work" | "labs" }) {
  return (
    <SectionTabs
      label="Work sections"
      activeHref={active === "work" ? "/work" : "/labs"}
      tabs={[
        { href: "/work", label: "Case studies", count: caseStudies.length },
        { href: "/labs", label: "Labs", count: labs.length },
      ]}
    />
  );
}
