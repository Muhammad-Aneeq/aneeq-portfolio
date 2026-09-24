import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Aneeq Khatri builds governed AI agents for finance and teaches the engineering practice behind them: agent engineering, evaluation and reliability, finance automation advisory, and hands-on training for teams and individuals.",
};

/**
 * Two kinds of work, five ways in.
 *
 * Every service carries links to systems already on this site. That is the whole design
 * of the page: a services list is the easiest place on a portfolio to write something
 * unfalsifiable, so each claim here has to be checkable by clicking it. Where a service
 * has no such evidence it says so in its own words rather than borrowing credibility
 * from the ones that do.
 */
const SERVICES = [
  {
    id: "agents",
    /*
      Written domain-neutral on purpose.

      It used to open "workflows where a wrong number costs money" and list three
      finance systems, which made it read as a narrower version of the finance advisory
      below it. The two are different offers: this one is the engineering, and the
      transferable claim is the governance shape rather than the ledger. The domains
      named in the note are not invented for this page, they are the `transfers`
      sections the case studies already carry.
    */
    name: "AI agent engineering",
    summary:
      "Multi-agent systems for workflows where being confidently wrong is expensive. Human gates at the risk boundaries, decisions that can be reconstructed months later, and a refusal when the evidence runs out rather than a plausible guess.",
    detail: [
      "Architecture and build, from the graph and its tools to the approval path and the audit trail.",
      "Governance designed in rather than logged after: the component that orchestrates the work cannot also approve it.",
      "Proven against finance data because that is where the constraints are strictest. Each case study sets out where the same pattern transfers: claims adjudication, procurement approval, clinical decision support, moderation and fraud triage, legal document review.",
    ],
    evidence: [
      { label: "CloseOps", href: "/work/closeops" },
      { label: "LedgerGuard", href: "/work/ledgerguard" },
      { label: "RevLedger", href: "/labs/revledger" },
    ],
  },
  {
    id: "evals",
    name: "Evaluation and reliability",
    summary:
      "An agent that worked once is not an agent that works. Benchmarks that run every case repeatedly and publish the spread, and regression suites built from the failures a system has already had.",
    detail: [
      "Eval harnesses that hold the model constant and test the configuration around it.",
      "Turning production traces into versioned cases, so a failure that has happened once cannot quietly return.",
    ],
    evidence: [
      { label: "FinAgent-Evals", href: "/work/finagent-evals" },
      { label: "Trace2Evals", href: "/labs/trace2evals" },
    ],
  },
  {
    id: "finance",
    name: "Finance automation advisory",
    summary:
      "Month-end close, bank reconciliation, invoice approval, expense categorisation. The accounting judgment rather than the engineering: what a controller will sign off, and what no amount of model quality will make acceptable.",
    detail: [
      "Where automation is safe, where it is not, and what has to be true before a number posts without a person.",
      "Reviewing an existing pipeline against the governance a controller would actually ask for.",
      "Scoped by someone who reconciled the books before automating them, so the plan accounts for what the domain will not tolerate.",
    ],
    evidence: [
      { label: "LedgerLens", href: "/work/ledgerlens" },
      { label: "InvoiceAudit", href: "/labs/invoiceaudit" },
      { label: "StatementLens", href: "/labs/statementlens" },
    ],
  },
  {
    id: "teams",
    name: "Corporate training and workshops",
    summary:
      "Hands-on sessions for engineering teams shipping AI features: agent architecture, tool calling, evaluation, and the governance that decides whether a feature survives contact with production.",
    detail: [
      "Built the way the courses are built, around building and breaking a real system rather than slides.",
    ],
    /*
      Stated plainly because it is true and the alternative is implying clients that do
      not exist. The teaching record is large and verifiable; it is simply not corporate,
      and a reader deciding whether to hire a trainer should be told which it is.
    */
    note: "New as a corporate offering. The teaching record behind it is national programmes rather than companies: around a hundred instructors led at the Governor Sindh Initiative, and courses taught at PIAIC and Saylani.",
    evidence: [{ label: "Teaching", href: "/teaching" }],
  },
  {
    id: "individuals",
    name: "AI engineering training for individuals",
    summary:
      "The material taught at PIAIC, Saylani and the Governor Sindh Initiative, for engineers moving into agentic AI. Build, break, test and ship a real workflow, rather than assembling a portfolio of demos.",
    detail: [
      "Multi-agent architectures, tool calling, retrieval, evaluation, and the reliability practice that separates a demo from a system.",
    ],
    evidence: [{ label: "Teaching", href: "/teaching" }],
  },
];

export default function ServicesPage() {
  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        services
      </p>
      <h1 className="mt-5 max-w-wide text-h1">What I build, and what I teach</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-8 max-w-read text-lead text-muted">
        Two kinds of work: building governed AI systems for teams who need the output to
        stand up to review, and teaching the engineering practice behind them. Each one
        below links to a system on this site that demonstrates it, so the claim is
        checkable before any conversation starts.
      </p>

      <Stagger className="mt-14 grid gap-4">
        {SERVICES.map((service) => (
          <StaggerItem key={service.id}>
            <Surface className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <h2 className="text-h3">{service.name}</h2>
                <p className="mt-3 max-w-read leading-relaxed text-text">{service.summary}</p>
              </div>

              <ul className="max-w-read space-y-2.5 text-sm leading-relaxed text-muted">
                {service.detail.map((line) => (
                  <li key={line} className="border-l border-border pl-4">
                    {line}
                  </li>
                ))}
              </ul>

              {service.note && (
                <p className="max-w-read rounded-lg border border-dashed border-border px-4 py-3 text-sm leading-relaxed text-faint">
                  {service.note}
                </p>
              )}

              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-faint">
                <span data-readout className="text-xs uppercase">
                  evidence
                </span>
                {service.evidence.map((item, i) => (
                  <span key={item.href} className="contents">
                    {i > 0 && <span aria-hidden>·</span>}
                    <Link
                      href={item.href}
                      className="text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text hover:decoration-text"
                    >
                      {item.label}
                    </Link>
                  </span>
                ))}
              </p>
            </Surface>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="mt-20 border-t border-border pt-12">
        <SectionHeader
          eyebrow="working together"
          title="Where this stands today"
          description="Stated rather than implied, because availability is the first thing a reader is trying to work out."
        />

        <div className="mt-8 max-w-read space-y-5 leading-relaxed text-text">
          <Reveal>
            <p>
              I am open to fully remote roles worldwide, and that remains the primary
              route. The work above is available alongside it.
            </p>
          </Reveal>
          <Reveal>
            <p className="text-muted">
              Every project linked from this page uses synthetic data. The systems are
              real and were run to produce the recordings and screenshots on this site,
              but no client data appears anywhere in them.
            </p>
          </Reveal>
        </div>

        <div className="mt-10">
          <ButtonLink href="/contact">Describe the problem</ButtonLink>
        </div>
      </section>
    </Container>
  );
}
