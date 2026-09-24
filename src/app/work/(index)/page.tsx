import type { Metadata } from "next";
import { LabsGrid } from "@/components/labs-grid";
import { WorkTabs } from "@/components/work-tabs";
import { labs } from "@/content";
import { links } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Focused AI engineering projects and deeper case studies. Inspect the architectures, evaluation methods, repository evidence and explicit limitations of the systems I have built.",
};

/**
 * Labs are the landing view of the work section.
 *
 * Every lab, captured or not, goes to the grid component. It decides which are cards
 * and which are rows, so a single filter governs the whole collection and the chip
 * counts agree with the tab above them.
 */
export default function WorkPage() {
  return (
    <>
      <WorkTabs active="labs" />

      <div className="mt-10">
        <LabsGrid labs={labs} />
      </div>

      <p className="mt-10 text-sm text-faint">
        The full set of repositories is on{" "}
        <a
          href={links.github}
          target="_blank"
          rel="noreferrer"
          className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
        >
          GitHub
        </a>
        .
      </p>
    </>
  );
}
