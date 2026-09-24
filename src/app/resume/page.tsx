import { Download } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { MetricStrip } from "@/components/ui/metric-strip";
import { HEADLINE_METRICS, metricsFor } from "@/content/metrics";
import { Reveal } from "@/components/motion/reveal";
import { RoleList } from "@/components/role-list";
import { ButtonLink } from "@/components/ui/button";
import { TagChip } from "@/components/ui/tag-chip";
import { education, experience, skills, summary, teaching } from "@/content/resume";
import { links, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description: summary.slice(0, 200),
};

const PDF = "/docs/Aneeq_Khatri_Resume_AI_Engineer.pdf";

export default function ResumePage() {
  return (
    <Container className="inner-page resume-page py-20">
      {/* The eyebrow every other route carries. Without it this hero sat 80px below the
          nav against 116px elsewhere, and it was the only page whose h1 arrived with no
          label above it. */}
      <p className="text-xs text-muted uppercase" data-readout>
        resume
      </p>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1">{site.name}</h1>
          <p className="mt-3 text-muted">
            {site.role} · {site.tagline}
          </p>
          <p className="mt-2 text-sm text-faint" data-readout>
            {site.location} · {site.availability}
          </p>
        </div>

        <ButtonLink href={PDF} external className="shrink-0">
          <Download className="size-4" aria-hidden />
          PDF
        </ButtonLink>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a href={`mailto:${site.email}`} className="text-muted transition-colors hover:text-text">
          {site.email}
        </a>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-muted transition-colors hover:text-text"
        >
          LinkedIn
        </a>
      </div>

      {/* The survey found this page at ~4,800px with zero images, zero cards and zero
          animated elements — the most text-heavy surface on the site. A figure strip up
          top gives a reader something to take in before committing to prose. Every number
          here is already stated in the content below it; none is invented to fill space. */}
      <Reveal>
        <MetricStrip className="mt-12" metrics={metricsFor(HEADLINE_METRICS)} />
      </Reveal>

      <Section title="Summary">
        <p className="max-w-wide leading-relaxed text-text">{summary}</p>
      </Section>

      <Section title="Experience">
        <RoleList roles={experience} />
      </Section>

      <Section title="AI education (concurrent, part-time)">
        <RoleList roles={teaching} />
      </Section>

      <Section title="Technical skills">
        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((cluster) => (
            <div key={cluster.title}>
              <dt className="text-sm text-muted" data-readout>
                {cluster.title}
              </dt>
              <dd className="mt-3">
                <ul className="flex flex-wrap gap-1.5">
                  {cluster.items.map((item) => (
                    <li key={item}>
                      <TagChip>{item}</TagChip>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Education & certifications">
        <ul className="mt-8 space-y-6">
          {education.map((c) => (
            <li key={c.title}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <p className="font-display text-[1.0625rem] font-semibold">
                  {c.title}
                  <span className="font-sans font-normal text-muted"> · {c.org}</span>
                </p>
                <p className="shrink-0 text-sm text-faint" data-readout>
                  {c.period}
                </p>
              </div>
              {c.note && <p className="mt-2 text-sm text-faint">{c.note}</p>}
            </li>
          ))}
        </ul>
      </Section>
    </Container>
  );
}

/*
  Two columns, not a label stacked on a block.

  The section label now sits in a 200px rail that lines up with the date column in
  `RoleList` below it, so the whole page shares one vertical rhythm instead of the
  summary being a lone narrow paragraph with 500px of dead space beside it. The
  content column keeps a readable measure: widening the *page* is the goal, widening
  the *line* past about 75 characters would make it harder to read, not easier.
*/
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="resume-section mt-16 border-t border-border pt-10">
      <h2 className="text-xs text-muted uppercase" data-readout>
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </Reveal>
  );
}
