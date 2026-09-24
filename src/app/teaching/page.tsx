import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MetricStrip } from "@/components/ui/metric-strip";
import { TEACHING_METRICS, metricsFor } from "@/content/metrics";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { RoleList } from "@/components/role-list";
import { teaching } from "@/content/resume";

export const metadata: Metadata = {
  title: "Teaching",
  description:
    "Aneeq Khatri is Head of Faculty at the Governor Sindh Initiative for AI and Computing, leading around 100 instructors, and trains engineers in agentic AI at PIAIC and Saylani through Pakistan's national AI programmes.",
};

export default function TeachingPage() {
  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        teaching
      </p>
      <h1 className="mt-5 max-w-wide text-h1">Teaching agentic AI at national scale</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-8 max-w-read text-lead text-muted">
        I am Head of Faculty at the Governor Sindh Initiative for AI and Computing, where I
        lead around a hundred instructors and own academic quality across cohorts. I also
        train engineers at PIAIC and Saylani. Over five thousand engineers have learned
        agentic AI through these programmes.
      </p>

      <div className="teaching-argument"><aside aria-label="Teaching in figures"><MetricStrip layout="grid" metrics={metricsFor(TEACHING_METRICS)} /></aside><div>
      <Reveal>
        <h2 className="text-h2">The argument</h2>
      </Reveal>
      <Stagger className="mt-6 space-y-5 leading-relaxed text-text">
        <StaggerItem>
          <p>
            <span className="text-text">{`Classroom AI and production AI are not the same subject, and most curricula teach the first while claiming to teach the second. A student who can get an agent to answer a question has not learned the job. The job starts at the question after that: how do you know it is right, what happens when it is not, and who is accountable when it acts.`}</span>
          </p>
        </StaggerItem>
        <StaggerItem>
          <p>
            {`So the curriculum is hands-on by design. Students build, break, test and ship real agentic workflows. Multi-agent architectures, tool calling, evaluation, the reliability practices I use in my own engineering work. They develop the practical judgment the industry actually asks for, rather than a portfolio of demos.`}
          </p>
        </StaggerItem>
        <StaggerItem>
          <p>
            {`Running a faculty of this size is its own engineering problem. Quality assurance across cohorts means class synchronisation, content fidelity, syllabus adherence and progress tracking. And a standard that holds whether a student is in the first cohort or the tenth. That consistency is the part that does not scale by itself.`}
          </p>
        </StaggerItem>
      </Stagger></div></div>

      {/*
        SPEC §5.4 requires at least one engineering artefact on this page. Without
        one it reads as an instructor bio; with it, the systems-leadership framing
        is something a reader can check rather than a claim.
      */}
      <Reveal as="h2" className="mt-16 text-h2">Classroom AI vs production AI</Reveal>
      <p className="mt-5 max-w-read leading-relaxed text-text">
        This is the comparison the curriculum is built around. The left column is what
        most courses teach and what most demos show. The right is what the same task
        looks like once someone is accountable for the output.
      </p>

      <Reveal className="mt-8 overflow-x-auto">
        <table className="w-full min-w-xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pr-6 font-normal text-faint" data-readout>
                concern
              </th>
              <th className="pb-3 pr-6 font-normal text-faint" data-readout>
                classroom
              </th>
              <th className="pb-3 font-normal text-faint" data-readout>
                production
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Correctness", "It answered", "It answered, and an eval says how often"],
              ["Uncertainty", "Confidence from the model", "Confidence computed from data the model cannot write"],
              ["Failure", "Retry the prompt", "Escalate, with the evidence attached"],
              ["Tools", "It called the tool", "Tool-selection accuracy is measured and gated"],
              ["Refusal", "Treated as a bug", "A first-class outcome, rewarded when correct"],
              ["Change", "Edit the prompt, ship", "Prompt change fails CI until the eval passes"],
              ["Accountability", "The demo worked", "A human signed the action that moved money"],
            ].map(([concern, classroom, production]) => (
              <tr key={concern} className="border-b border-border/60">
                <td className="py-4 pr-6 align-top text-muted">{concern}</td>
                <td className="py-4 pr-6 align-top text-faint">{classroom}</td>
                <td className="py-4 align-top text-text">{production}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <p className="mt-6 text-sm text-faint">
        Students build systems in the right-hand column. The projects on this site are
        the same argument at production scale.
      </p>

      <Reveal as="h2" className="mt-16 text-h2">Roles</Reveal>
      <RoleList roles={teaching} maxBullets={2} moreHref="/resume" />

      <Reveal as="h2" className="mt-20 text-h2">Speaking and training enquiries</Reveal>
      <p className="mt-5 leading-relaxed text-muted">
        I deliver hands-on agentic AI training covering multi-agent architectures, tool
        calling, retrieval, evaluation and the governance patterns that make agents
        deployable. If that is useful to your team,{" "}
        <Link
          href="/contact"
          className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
        >
          get in touch
        </Link>
        .
      </p>
    </Container>
  );
}
