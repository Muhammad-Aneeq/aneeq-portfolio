import type { Metadata } from "next";
import { DemoTabs } from "@/components/demo-tabs";
import { DemoSection } from "@/components/media/demo-section";
import { demoLabs } from "@/content";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Walkthroughs and screens of the running systems, led by the narrated demos: a deterministic revenue engine, vision extraction checked by arithmetic, and governed RAG that refuses rather than guessing.",
};

/**
 * Labs are the landing view, and the narrated demos lead them.
 *
 * /demos opened on the case studies, which put four silent screen captures above the
 * three recordings made for this portfolio — the only ones with a person explaining
 * what the system is doing. The strongest evidence on the page was below the fold and
 * behind a tab.
 */
export default function DemosPage() {
  return (
    <>
      <DemoTabs active="labs" />

      {/*
        The first entry drops its own rule: the tab strip above already ends in one,
        and the two together left an empty banded gap under the tabs.
      */}
      <div className="mt-12 space-y-20 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
        {demoLabs.map((lab) => (
          <DemoSection
            key={lab.slug}
            project={lab}
            href={`/labs/${lab.slug}`}
            linkLabel="Read more"
            summary={lab.tagline}
          />
        ))}
      </div>
    </>
  );
}
