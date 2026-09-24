import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";

import { Container } from "@/components/layout/container";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { WorkTabs } from "@/components/work-tabs";
import { caseStudies, projectCount } from "@/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "AI engineering case studies and focused labs. Inspect the architectures, evaluation methods, repository evidence and explicit limitations of the systems I have built.",
};

export default function WorkPage() {
  return (
    <Container className="py-20">
      {/* The 40–60 word answer block. First thing on the page, by design. */}
      <p className="text-xs text-muted uppercase" data-readout>
        engineering portfolio
      </p>
      <h1 className="mt-5 max-w-wide text-h1">
        {projectCount} projects. Built to be checked.
      </h1>
      <p className="mt-7 max-w-read text-lead text-muted">
        Governed multi-agent systems, proven where a wrong number costs the most. Each case study gives the
        problem, the architecture, the decisions and their alternatives, the evaluation
        method with its numbers. And a section on what the system cannot do, because that
        is the part that tells you whether to trust the rest.
      </p>

      <p className="mt-8 text-sm text-faint">
        The case studies use synthetic data. Individual labs document their datasets and limitations.
        Available walkthroughs are collected on{" "}
        <Link
          href="/demos"
          className="text-muted underline decoration-border underline-offset-4 transition-colors hover:text-text hover:decoration-text"
        >
          the demos page
        </Link>
        .
      </p>

      {/*
        Two collections, two tabs, two URLs.

        This was a pair of in-page anchors with the labs inlined underneath as a bare
        name-and-tagline list. So the page showed its case studies as full cards with a
        capture each and its labs as text rows, which reads as a verdict on the labs
        rather than a difference in depth — and eleven of them now have a recording to
        show. Labs render at full card weight on /labs, and the tab goes there instead
        of restating them here in a thinner form.
      */}
      <WorkTabs active="work" />

      <Stagger className="work-case-studies mt-10 grid gap-6">
        {caseStudies.map((study) => (
          <StaggerItem key={study.slug}>
            <ProjectCard study={study} showWhyFlagship />
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
