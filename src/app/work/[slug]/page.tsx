import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyJsonLd } from "@/components/json-ld";
import { Container } from "@/components/layout/container";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { ShotGallery } from "@/components/media/shot-gallery";
import { Walkthrough } from "@/components/media/walkthrough";
import { Reveal } from "@/components/motion/reveal";
import { TraceReplay } from "@/components/three/trace-replay/trace-replay";
import { ADRCard } from "@/components/ui/adr-card";
import { LimitsPanel } from "@/components/ui/limits-panel";
import { StateLegend } from "@/components/ui/state-legend";
import { LinkCluster } from "@/components/ui/link-cluster";
import { TagChip, TagRow } from "@/components/ui/tag-chip";
import { caseStudies, getCaseStudy } from "@/content";
import { LEDGERLAB_DEMO_URL } from "@/lib/features";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.name,
    // The TL;DR doubles as the meta description — it is already written to be the
    // passage a machine quotes.
    description: study.tldr,
    openGraph: { title: `${study.name}. ${study.outcome}`, description: study.tldr },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  // The deployed URL lives in the environment, not the content — so the link and
  // the connect snippets appear together the moment it is set, and neither
  // advertises an address that does not answer yet.
  const demoUrl = study.slug === "ledgerlab" ? LEDGERLAB_DEMO_URL : "";
  const links = demoUrl ? { ...study.links, demo: demoUrl } : study.links;

  return (
    <article>
      <CaseStudyJsonLd study={study} />
      <Container className="py-16 sm:py-20">
        {/*
          Same controls as a lab page. A case study is reached from the home demo strip,
          from /demos, from /work and from /finance, and a fixed "All work" link sent
          everyone to the same index regardless, losing their place in whichever list
          they had scrolled. "Back" returns them; the two buttons are deliberate
          sideways moves for a reader who arrived cold with no history.
        */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackLink fallbackHref="/work">Back</BackLink>
          <nav aria-label="Browse" className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/demos">All demos</ButtonLink>
            <ButtonLink href="/work">All work</ButtonLink>
          </nav>
        </div>

        {/* 1 · Header — links above the fold, always.
            `mt-4`: with the "All work" link above it, this hero measured 136px below the
            nav where every other route sits at 116px. Measured, not guessed — see the
            clearance table in the revision notes. */}
        <header className="mt-4">
          <h1 className="max-w-wide text-h1">{study.name}</h1>
          <p className="mt-5 max-w-read text-lead text-muted">{study.outcome}</p>
          <TagRow className="mt-7" tags={study.tags} />
          <LinkCluster className="mt-7" links={links} />
        </header>

        {/*
          2 · The walkthrough, above both the figures and the summary.

          It was the ninth section, roughly nine thousand pixels down, so the recording
          of the system running sat far below the fold. Moving it under the TL;DR was
          not far enough: the numbers and the summary are both claims *about* the
          system, and the recording is the system. A visitor who arrived from the home
          demo strip came to watch it, and everything else on the page reads better
          once they have.
        */}
        {study.walkthrough && (
          <div className="mt-12">
            <Walkthrough walkthrough={study.walkthrough} />
          </div>
        )}

        {/*
          2 · Metrics, before the TL;DR.

          These were four sections down, below the summary and the fold — so the numbers
          a hiring manager opens a case study to find were the last thing they reached.
          The TL;DR is still directly beneath, and still the passage an answer engine
          quotes; it simply no longer stands between the reader and the evidence.
        */}
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-y border-border py-10 lg:grid-cols-4">
          {study.metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="font-display text-h3 leading-none font-semibold tracking-tight">
                {metric.prefix ?? ""}
                {metric.decimals != null ? metric.value.toFixed(metric.decimals) : metric.value}
                {metric.suffix ?? ""}
              </p>
              <p className="mt-2.5 text-sm leading-snug text-muted">{metric.label}</p>
              {metric.note && (
                <p className="mt-1.5 text-xs leading-snug text-faint">{metric.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* 3 · TL;DR — the 40–60 word answer block */}
        <div className="mt-12 border-l-2 border-border-strong pl-6 sm:pl-8">
          <p className="text-xs text-muted uppercase" data-readout>
            in short
          </p>
          <p className="mt-4 max-w-read text-h3 leading-snug font-normal">{study.tldr}</p>
        </div>

      </Container>

      {/* 4 · Problem & constraints */}
      <Container className="pb-8">
        <Section eyebrow="the problem" title="Why this is hard">
          <div className="max-w-read space-y-5">
            {study.problem.map((p) => (
              <p key={p.slice(0, 32)} className="leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted" data-readout>
              constraints
            </p>
            <ul className="mt-5 max-w-read space-y-3.5">
              {study.constraints.map((c) => (
                <li key={c.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border-strong" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/*
            SPEC §5.2 step 3 — the transfer signal. Required by the schema, not
            optional: it is the difference between "he built finance software" and
            "he solved a class of problem and finance is where he proved it."
          */}
          <div className="mt-12">
            <p className="text-sm text-muted" data-readout>
              where else this pattern applies
            </p>
            {/* `max-w-tight`, not `max-w-read`: prose is sized for 16px body text, and
                these render at 14px, where the same container runs to ~94 characters. */}
            <div className="mt-5 max-w-tight space-y-4">
              {study.transfers.map((t) => (
                <p key={t.slice(0, 32)} className="text-sm leading-relaxed text-muted">
                  {t}
                </p>
              ))}
            </div>
          </div>
        </Section>

        {/* 5 · Architecture + trace replay */}
        <Section eyebrow="architecture" title="How it runs">
          <p className="max-w-read leading-relaxed text-muted">
            {study.architecture.summary}
          </p>
          <TraceReplay stations={study.architecture.trace} />
          {/* The code, next to the thing that uses it. */}
          <StateLegend className="mt-6" />
        </Section>

        {/* 6 · Decisions */}
        <Section
          eyebrow="decisions"
          title="What was considered, and why it was ruled out"
          lead="Every one of these had a reasonable alternative. The alternative is named."
        >
          {/*
            One column, stacked.

            Five decision records in a two-column grid leave an orphan on the last row and
            force each card into a half-width measure for text that is three sentences of
            reasoning — the densest prose on the page in the narrowest column on the page.
            Stacked, each record gets the full measure, and "alternative / verdict /
            reason" lands in the same place every time, which is what makes five of them
            scannable rather than five things to read.
          */}
          <div className="mt-2 space-y-4">
            {study.adrs.map((adr, i) => (
              <ADRCard key={adr.decision} adr={adr} index={i} />
            ))}
          </div>
        </Section>

        {/* 7 · Evaluation */}
        <Section eyebrow="evaluation" title="How it was measured">
          <p className="max-w-read leading-relaxed text-muted">{study.evaluation.summary}</p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-xl border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-6 font-normal text-faint" data-readout>
                    metric
                  </th>
                  <th className="pb-3 pr-6 font-normal text-faint" data-readout>
                    result
                  </th>
                  <th className="pb-3 font-normal text-faint" data-readout>
                    note
                  </th>
                </tr>
              </thead>
              <tbody>
                {study.evaluation.rows.map((row) => (
                  <tr key={row.metric} className="border-b border-border/60">
                    <td className="py-4 pr-6 align-top text-muted">{row.metric}</td>
                    <td className="py-4 pr-6 align-top whitespace-nowrap text-pass" data-readout>
                      {row.result}
                    </td>
                    <td className="py-4 align-top text-faint">{row.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 8 · Connect — only where the thing is actually reachable */}
        {study.connect && (
          <Section
            eyebrow="try it"
            title="Connect your own client"
            lead={
              demoUrl
                ? undefined
                : "Not hosted yet. These are the exact steps against a local instance, and the same ones against the hosted URL when it lands."
            }
          >
            <p className="max-w-read leading-relaxed text-muted">
              {study.connect.summary}
            </p>

            <ol className="mt-10 space-y-8">
              {study.connect.steps.map((step, i) => (
                <li key={step.label}>
                  <p className="flex items-baseline gap-3">
                    <span className="text-xs text-faint" data-readout>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[1.0625rem] font-semibold">
                      {step.label}
                    </span>
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
                    <code>
                      {step.code.replaceAll(
                        "<LEDGERLAB_URL>",
                        demoUrl || "http://localhost:8000",
                      )}
                    </code>
                  </pre>
                  {step.note && (
                    <p className="mt-3 max-w-read text-sm text-faint">{step.note}</p>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* 9 · Screens — the walkthrough itself now sits near the top, see below the TL;DR */}
        {study.shots.length > 0 && (
          <Section
            eyebrow="screens"
            title="What it looks like running"
            lead="Captures of the real thing. Projects without a capture show none, nothing here is a mockup."
          >
            <ShotGallery shots={study.shots} breakout />
          </Section>
        )}

        {/* 10 · Limits */}
        <div className="mt-24">
          <Reveal>
            <LimitsPanel limits={study.limits} />
          </Reveal>
        </div>

        {/* 9 · Stack */}
        <Section eyebrow="stack" title="Built with">
          <ul className="flex max-w-read flex-wrap gap-2">
            {study.stack.map((s) => (
              <li key={s}>
                <TagChip>{s}</TagChip>
              </li>
            ))}
          </ul>
          <LinkCluster className="mt-8" links={links} />
        </Section>

        <NextStudy slug={study.slug} />
      </Container>
    </article>
  );
}

function Section({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  /*
    The editorial two-column rhythm, the same one /about, /teaching, /resume and the
    lab pages use. See docs/DESIGN-SYSTEM.md §3.

    This was the last page still stacking a full-width heading above a narrow text
    column, which left roughly 500px of empty page down the right of every section on
    a case study — the most-read pages on the site. The heading now sits in the rail
    and the body runs beside it, so the page uses its width without the line getting
    any longer.
  */
  return (
    <section className="editorial-section">
      <Reveal>
        <p className="text-xs text-muted uppercase" data-readout>
          {eyebrow}
        </p>
        <h2 className="mt-3 text-h2">{title}</h2>
      </Reveal>
      <div className="min-w-0">
        {lead && <p className="mb-8 text-muted">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

function NextStudy({ slug }: { slug: string }) {
  const index = caseStudies.findIndex((c) => c.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <nav className="mt-28 border-t border-border pt-10" aria-label="Next case study">
      <p className="text-xs text-faint" data-readout>
        next
      </p>
      <Link href={`/work/${next.slug}`} className="group mt-3 block max-w-read">
        <span className="font-display text-h2 transition-colors duration-200 group-hover:text-text">
          {next.name}
        </span>
        <span className="mt-3 block text-muted">{next.outcome}</span>
      </Link>
    </nav>
  );
}
