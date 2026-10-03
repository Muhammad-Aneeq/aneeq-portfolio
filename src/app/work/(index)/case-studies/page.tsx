import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { WorkTabs } from "@/components/work-tabs";
import { caseStudies } from "@/content";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "The five projects written up in full: the problem, the architecture, the decisions and their alternatives, and the evaluation method with its numbers.",
};

export default function WorkCaseStudiesPage() {
  return (
    <>
      <WorkTabs active="work" />

      <Stagger className="work-case-studies mt-10 grid gap-6">
        {caseStudies.map((study) => (
          <StaggerItem key={study.slug}>
            <ProjectCard study={study} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
