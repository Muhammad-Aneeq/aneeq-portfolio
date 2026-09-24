import { SectionTabs } from "@/components/ui/section-tabs";
import { demoCaseStudies, demoLabs } from "@/content";

/**
 * `Labs | Case studies` for /demos.
 *
 * /demos was one stack of every recording on the site, case studies running straight
 * into labs with nothing to mark the boundary — about 6,500px of it. Splitting on the
 * same line /work and /labs split on means a reader can go to the kind of project they
 * came for, and each half is a page rather than a scroll.
 *
 * Labs lead, which is the reverse of /work and deliberate: two of the three narrated
 * demos are labs, so this order puts the recordings with a spoken account of what the
 * system is doing at the top of the page a visitor lands on. The tab order and the
 * landing route agree — /demos *is* the labs view, rather than showing one thing while
 * the first tab names another.
 *
 * Counts are of what each view can show, not of every project. A lab with only a hover
 * loop has no walkthrough to play and no screens to browse, so it is absent here and
 * the number says so.
 */
export function DemoTabs({ active }: { active: "work" | "labs" }) {
  return (
    <SectionTabs
      label="Demo sections"
      activeHref={active === "labs" ? "/demos" : "/demos/case-studies"}
      tabs={[
        { href: "/demos", label: "Labs", count: demoLabs.length },
        { href: "/demos/case-studies", label: "Case studies", count: demoCaseStudies.length },
      ]}
    />
  );
}
