import type { Metadata } from "next";
import { DemoTabs } from "@/components/demo-tabs";
import { DemoSection } from "@/components/media/demo-section";
import { demoCaseStudies } from "@/content";

export const metadata: Metadata = {
  title: "Case study demos",
  description:
    "Walkthroughs and screens of the running case studies: a reconciliation exception workbench, a governed month-end close, and an eval harness with its numbers published.",
};

export default function DemoCaseStudiesPage() {
  return (
    <>
      <DemoTabs active="work" />

      {/* Same as /demos: the tab strip's own rule stands in for the first separator. */}
      <div className="mt-12 space-y-20 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
        {demoCaseStudies.map((study) => (
          <DemoSection
            key={study.slug}
            project={study}
            href={`/work/${study.slug}`}
            linkLabel="Read the case study"
            summary={study.outcome}
          />
        ))}
      </div>
    </>
  );
}
