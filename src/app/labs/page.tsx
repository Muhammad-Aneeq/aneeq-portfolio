import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { LabsGrid } from "@/components/labs-grid";
import { WorkTabs } from "@/components/work-tabs";
import { labs } from "@/content";
import { links } from "@/lib/site";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Further agent-reliability projects: RAG that refuses rather than guessing, a prompt-injection corpus with benign twins, an eval harness built from production traces, and more, each proven against finance data.",
};

export default function LabsPage() {
  return (
    <Container className="py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        labs
      </p>
      <h1 className="mt-5 max-w-wide text-h1">More, in the same direction</h1>
      <p className="mt-7 max-w-read text-lead text-muted">
        Smaller projects around the five case studies, each one a piece of agent-reliability
        engineering: RAG that refuses rather than guessing, a prompt-injection corpus with
        benign twins, an eval harness built from production traces, and a semantic model with
        its accuracy published. Every one is proven against finance data, and every dataset is
        synthetic.
      </p>

      <WorkTabs active="labs" />

      {/*
        Every lab, captured or not, goes to the grid component. It decides which are
        cards and which are rows, so a single filter governs the whole collection and
        the chip counts agree with the tab above them.
      */}
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

      {/* The paragraph about an unlisted eighth project was removed. Describing something
          a reader cannot see, click or evaluate adds nothing they can use — and a page
          whose point is "only what actually runs is here" makes that point better by
          simply not listing it. The policy is already stated above, where it is
          actionable. */}
    </Container>
  );
}
