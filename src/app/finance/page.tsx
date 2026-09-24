import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StreamHero } from "@/components/three/stream";
import { experience } from "@/content/resume";
import { Container } from "@/components/layout/container";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { getCaseStudy } from "@/content";

/**
 * `/finance` — the domain hub. SPEC §5.6.
 *
 * Finance is pillar three of §1 and was the only pillar without a URL: pillar two has
 * /teaching, pillar one has the whole site. So the pillar carrying the rarest, least
 * reproducible thing on the CV — someone who actually closed books — was the one a
 * reader could not navigate to.
 *
 * THE ONE DOCUMENTED EXCEPTION to the capability-first rule (SPEC §1): here, domain
 * leads capability. A reader who arrives has already self-selected on the domain, and
 * leading with "multi-agent systems" at someone who came for finance is the mirror
 * image of the mistake the positioning pass corrected. The rule holds everywhere else.
 */

export const metadata: Metadata = {
  title: "AI for Finance & Accounting",
  description:
    "Aneeq Khatri builds AI agents for accounting and finance. Month-end close, bank reconciliation, invoice approval. With the governance finance actually requires: provable postings, human gates, refusal over guessing. He reconciled real books before automating them.",
};

/**
 * Each demand is a claim with a receipt. Nothing here is aspirational.
 *
 * Evidence is chosen for how well the project demonstrates the principle first and how
 * well it is captured second — in that order. Two of these deliberately still point at
 * projects with only stills: CloseOps is the one system whose orchestrator is
 * structurally unable to approve its own work, and FinAgent-Evals runs every case k=4
 * and publishes pass@1 beside pass^4, which is what "survives being repeated" means
 * literally. Repointing either at something with a nicer video would trade an accurate
 * claim for a watchable one.
 */
const DEMANDS = [
  {
    principle: "Every posting must be provable after the fact, not merely logged.",
    href: "/work/ledgerguard",
    evidence: "LedgerGuard",
  },
  {
    principle:
      "The model may pick the tool and explain the result. It must never be the thing that computes the number.",
    href: "/labs/revledger",
    evidence: "RevLedger",
  },
  {
    principle: "The thing that orchestrates the work cannot also approve it.",
    href: "/work/closeops",
    evidence: "CloseOps",
  },
  {
    principle:
      "When the evidence is weak, the correct output is a refusal, not a plausible answer.",
    href: "/labs/policyground",
    evidence: "PolicyGround",
  },
  {
    principle: "A human gates the commit. The agent prepares it.",
    // Was InvoiceOps, which demonstrates this with four screenshots. InvoiceAudit makes
    // the same claim — the extraction is an untrusted proposal and the router sends
    // uncertain documents to a person — and shows it happening in a narrated
    // walkthrough, on the same invoice-approval workflow.
    href: "/labs/invoiceaudit",
    evidence: "InvoiceAudit",
  },
  {
    principle: "Right once is not right. A run has to survive being repeated.",
    href: "/work/finagent-evals",
    evidence: "FinAgent-Evals",
  },
  {
    principle: "Uncertainty must be triageable, not hidden behind a confidence number.",
    href: "/work/ledgerlens",
    evidence: "LedgerLens",
  },
];

/**
 * The four finance problems this work is organised around.
 *
 * `failure` is written from the domain, not from the project — it is what a controller
 * would recognise, phrased the way they would phrase it. `response` is the engineering
 * answer, and the evidence column is read from the case study's own first metric so the
 * number here can never drift from the number on the case study.
 */
const FINANCE_PROBLEMS = [
  {
    area: "month-end close",
    failure:
      "A duplicate journal entry gets posted during a close and nobody finds it for three weeks, by which point the books are signed. The failure is silent: the ledger balances and the queue looks shorter than yesterday.",
    response:
      "A checklist with a DAG and risk tiers, idempotent dispatch, and an orchestrator that is structurally incapable of approving its own work. Five agents, a human gate at every risk boundary.",
    slug: "closeops",
  },
  {
    area: "bank reconciliation",
    failure:
      "An exception queue that a person has to work through one item at a time, where most of the effort is not deciding what to do but reconstructing what happened: which payment, which counterparty, spelled which way, in which of two systems.",
    response:
      "Root-cause hypotheses that must cite the records they came from. An uncited hypothesis cannot reach the database at all, so the reviewer is triaging evidence rather than trusting a score.",
    slug: "ledgerlens",
  },
  {
    area: "auditability",
    failure:
      "Someone asks how a number was arrived at, months later. A log tells you what the system did; it does not tell you what evidence the decision rested on, or why a reviewer overrode it.",
    response:
      "An audit trail that is an architecture rather than a log, plus a reviewer console where a human decision is captured as data, including the disagreements.",
    slug: "ledgerguard",
  },
  {
    area: "trusting the agent at all",
    failure:
      "An agent demo works. It works again. Then it is put in front of a month of real volume and the behaviour that was fine in a single run turns out not to be stable across repeats. That stability is what matters once it is unattended.",
    response:
      "An evaluation harness that scores the same case repeatedly and reports the gap between one attempt and four, with a frozen, hashed case set and evals that check the evals.",
    slug: "finagent-evals",
  },
] as const;

export default function FinancePage() {
  const ledgerlab = getCaseStudy("ledgerlab");
  const finagentEvals = getCaseStudy("finagent-evals");

  return (
    <>
      <Container className="finance-hero py-20"><div>
        <p className="text-xs text-muted uppercase" data-readout>
          domain
        </p>
        <h1 className="mt-5 max-w-wide text-h1">AI for Finance &amp; Accounting</h1>
        <p className="mt-7 max-w-read text-lead text-muted">
          Agents for the one domain where a wrong number is money lost and a broken audit.
        </p>

        {/* g · The finance-scoped answer block. The home block stays capability-scoped;
            these two must not be copies, or they compete for the same citation. */}
        <p className="mt-10 max-w-read border-l-2 border-border-strong pl-6 leading-relaxed text-muted">
          I build AI agents for accounting and finance. Month-end close, bank reconciliation,
          invoice approval. With the governance the work actually requires: postings that can
          be proven after the fact, humans gating every commit, and refusal instead of guessing
          when the evidence is thin. I reconciled real books before I automated any of it.
        </p>
        </div><StreamHero className="finance-scene min-w-0" />
      </Container>

      {/* b · The bar, immediately after the hero.

          A reader who came for finance wants to know what this person thinks the domain
          requires before they want the biography. The story is more persuasive once the
          claims it explains are already on the page. */}
      <Container className="py-20">
        <SectionHeader
          eyebrow="the bar"
          title="What finance demands of an agent"
          description="Seven requirements the domain imposes before an agent is allowed anywhere near the books. Each one links to the system on this site that demonstrates it."
        />

        <Stagger className="mt-12 grid gap-3">
          {DEMANDS.map((demand) => (
            <StaggerItem key={demand.href + demand.principle}>
              <Surface
                interactive
                className="group relative flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
              >
                <p className="max-w-read leading-relaxed text-text">{demand.principle}</p>
                <p className="inline-flex shrink-0 items-center gap-2 text-sm text-muted transition-colors duration-200 group-hover:text-text">
                  <Link href={demand.href} className="after:absolute after:inset-0">
                    {demand.evidence}
                  </Link>
                  <ArrowRight className="size-4" aria-hidden />
                </p>
              </Surface>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>

      {/* c · The story. Why this person, after the reader knows what the bar is. */}
      <section className="border-y border-border bg-surface/40">
        <Container className="finance-story py-20"><div>
          <p className="text-xs text-muted uppercase" data-readout>
            before any of this
          </p>
          <div className="mt-7 max-w-read space-y-5 leading-relaxed text-text">
            <StaggerItem>
              <p>
                <span className="text-text">{`I started as an accounts assistant, which in practice meant I was the person the bank statement landed on.`}</span>
              </p>
            </StaggerItem>
            <StaggerItem>
              <p>
                {`I reconciled bank feeds against the ledger, chased purchase orders that authorised one amount while the invoice billed another, matched payments to counterparties whose names were spelled three different ways across two systems, and wrote off the ones nothing in the books could explain.`}
              </p>
            </StaggerItem>
            <StaggerItem>
              <p>
                {`A close that goes wrong does not announce itself. It is quiet, the books balance, the queue is shorter than yesterday, and three weeks later someone finds the duplicate posting after the numbers have already been signed.`}
              </p>
            </StaggerItem>
            <StaggerItem>
              <p>
                {`I moved into software because most of that work was repetitive in a way that obviously should not have needed a person, and then into AI because agents are the first tools that can actually do the judgement-shaped parts of it.`}
              </p>
            </StaggerItem>
            <StaggerItem>
              <p className="text-text">
                Which is why everything I build is organised around proving the agent is right
                rather than making it capable: I already know exactly what it costs when nobody
                checks.
              </p>
            </StaggerItem>
          </div>
        </div><aside aria-labelledby="career-path-title"><h2 id="career-path-title" className="text-h3">The path into finance AI</h2><ol className="career-path">{[experience[6], experience[3], experience[0]].map(role => <li key={role.org}><p className="text-xs text-faint">{role.start} to {role.end}</p><h3 className="mt-2 text-lg">{role.title}</h3><p className="mt-1 text-sm text-muted">{role.org}</p></li>)}</ol></aside></Container>
      </section>

      {/*
        d · Organised by the finance problem, not by the project.

        This used to be the same five project cards that appear on /work, filtered by
        domain — so a finance reader who had already seen the work index got a second
        recital of it, sorted the same way, and was left to work out for themselves which
        card answered the problem they came with. Someone evaluating this page is not
        shopping for projects; they have a close that slips, a reconciliation queue, or an
        auditor asking how a number was arrived at.

        So the unit is the failure mode. Each one states what actually goes wrong in a
        finance function, what was built in response, and where the evidence is. The
        projects are still all reachable — they are now the answer to a question rather
        than the question.
      */}
      <section className="border-t border-border">
        <Container className="py-20">
          <SectionHeader
            eyebrow="the work"
            title="Four things that go wrong, and what was built for them"
            description="Every dataset behind these is synthetic. The failure modes are real: each one happens in a real finance function, and each links to the system built against it."
            align="between"
          >
            <Link
              href="/work"
              className="inline-flex shrink-0 items-center gap-2 text-sm text-muted transition-colors duration-200 hover:text-text"
            >
              All work
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </SectionHeader>

          <Stagger className="mt-12 grid gap-4">
            {FINANCE_PROBLEMS.map((item) => {
              const study = getCaseStudy(item.slug);
              if (!study) return null;
              const metric = study.metrics[0];

              return (
                <StaggerItem key={item.slug}>
                  <Surface interactive className="group relative p-6 sm:p-8">
                    <p className="text-xs text-faint uppercase" data-readout>
                      {item.area}
                    </p>

                    <div className="mt-5 grid gap-x-10 gap-y-6 lg:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <p className="text-xs text-faint uppercase" data-readout>
                          what goes wrong
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {item.failure}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-faint uppercase" data-readout>
                          what was built
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-text">
                          {item.response}
                        </p>
                      </div>

                      <div className="lg:max-w-56">
                        <p className="text-xs text-faint uppercase" data-readout>
                          evidence
                        </p>
                        <p className="mt-2 font-display text-h3 leading-none font-semibold tracking-tight">
                          {metric.prefix ?? ""}
                          {metric.decimals != null
                            ? metric.value.toFixed(metric.decimals)
                            : metric.value}
                          {metric.suffix ?? ""}
                        </p>
                        <p className="mt-2 text-xs leading-snug text-muted">
                          {metric.label}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition-colors duration-200 group-hover:text-text">
                          <Link
                            href={`/work/${study.slug}`}
                            className="after:absolute after:inset-0"
                          >
                            {study.name}
                          </Link>
                          <ArrowRight className="size-4" aria-hidden />
                        </p>
                      </div>
                    </div>
                  </Surface>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* e · Infrastructure given to the field, not just built for a domain. */}
      <section className="border-t border-border">
        <Container className="py-20">
          <SectionHeader
            eyebrow="open source"
            title="Infrastructure I've given the field"
            description="Most people have built things for finance AI. These two are for anyone building it. A public benchmark and a public fixture, both free to run."
          />

          <Stagger className="mt-12 grid gap-4 lg:grid-cols-2">
            {finagentEvals && (
              <StaggerItem>
                <Surface interactive className="flex h-full min-w-0 flex-col p-7">
                  <p className="text-xs text-muted uppercase" data-readout>
                    public benchmark
                  </p>
                  <h3 className="mt-4 text-h3">{finagentEvals.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {finagentEvals.tldr}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href={`/work/${finagentEvals.slug}`}>Case study</ButtonLink>
                    {finagentEvals.links.repo && (
                      <ButtonLink href={finagentEvals.links.repo} external>
                        Repo
                      </ButtonLink>
                    )}
                  </div>
                </Surface>
              </StaggerItem>
            )}

            {ledgerlab && (
              <StaggerItem>
                <Surface interactive className="flex h-full min-w-0 flex-col p-7">
                  <p className="text-xs text-muted uppercase" data-readout>
                    public fixture
                  </p>
                  <h3 className="mt-4 text-h3">{ledgerlab.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{ledgerlab.tldr}</p>

                  {/* `min-w-0` is load-bearing, not tidying. The <pre> below already has
                      `overflow-x-auto`, but a grid item and a flex child both default to
                      `min-width: auto`, so they refuse to shrink below their content and
                      the scroll container never engages — the code block pushed the page
                      199px wide at 375px instead. Caught by the horizontal-overflow check
                      in tests/functional.spec.ts. */}
                  {ledgerlab.connect && (
                    <div className="mt-6 min-w-0 flex-1">
                      <p className="text-xs text-faint" data-readout>
                        point your own client at it
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-bg p-4 text-xs leading-relaxed text-muted">
                        <code>{ledgerlab.connect.steps[0].code}</code>
                      </pre>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href={`/work/${ledgerlab.slug}`}>Case study</ButtonLink>
                    {ledgerlab.links.repo && (
                      <ButtonLink href={ledgerlab.links.repo} external>
                        Repo
                      </ButtonLink>
                    )}
                  </div>
                </Surface>
              </StaggerItem>
            )}
          </Stagger>
        </Container>
      </section>

      {/*
        f · The commercial CTA. This section is permitted to be more direct than the
        rest of the site — a deliberate exception recorded in SPEC §5.6f rather than a
        drift. The secondary audience in §1 is finance leaders looking for consulting,
        and this is the only page they are likely to land on. The restraint everywhere
        else is what earns this one ask.
      */}
      <section className="border-t border-border">
        <Container className="py-20">
          <div className="max-w-read">
            <StaggerItem>
              <p className="text-xs text-muted uppercase" data-readout>
                work together
              </p>
            </StaggerItem>
            <StaggerItem>
              <h2 className="mt-4 text-h2">Building AI for a finance team? Let’s talk.</h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 leading-relaxed text-muted">
                Whether you are putting agents near the close for the first time, or you
                already have some and need to know whether they can be trusted, that is the
                conversation I want. I have been on both sides of it. The one building the
                system, and the one who finds the duplicate three weeks later.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="primary">
                  Get in touch
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/resume">Read the resume</ButtonLink>
              </div>
            </StaggerItem>
          </div>
        </Container>
      </section>
    </>
  );
}
