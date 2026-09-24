import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ADRCard } from "@/components/ui/adr-card";
import { BentoCell, BentoGrid } from "@/components/ui/bento";
import { ButtonLink } from "@/components/ui/button";
import { LimitsPanel } from "@/components/ui/limits-panel";
import { LinkCluster } from "@/components/ui/link-cluster";
import { MetricReadout } from "@/components/ui/metric-readout";
import { SectionHeader } from "@/components/ui/section-header";
import { StatePill } from "@/components/ui/state-pill";
import { Surface } from "@/components/ui/surface";
import { TagRow } from "@/components/ui/tag-chip";

export const metadata: Metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

/**
 * Every primitive, in one place, in both themes. This is the Phase 1 review gate
 * from docs/PLAN.md — the cheapest possible moment to change the visual language.
 * Not linked from anywhere and noindexed.
 */
export default function KitchenSinkPage() {
  return (
    <Container className="py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        internal · not indexed
      </p>
      <h1 className="mt-4 text-h1">Kitchen sink</h1>
      <p className="mt-4 max-w-(--container-prose) text-lead text-muted">
        Every primitive the pages are built from. Toggle the theme in the nav to check both.
      </p>

      <Block title="Type scale">
        <p className="text-display">Display</p>
        <p className="text-h1">Heading one</p>
        <p className="text-h2">Heading two</p>
        <p className="text-h3">Heading three</p>
        <p className="text-lead text-muted">
          Lead paragraph. Most people building AI for accounting have never done the work.
        </p>
        <p className="max-w-(--container-prose) text-muted">
          Body copy. I design and ship production multi-agent systems for accounting and
          finance, with reliability as the core engineering standard.
        </p>
        <p className="text-sm text-faint" data-readout>
          Mono readout · 80%+ tool-selection accuracy · 399 tests · £0 to run
        </p>
      </Block>

      <Block title="Governance states">
        <div className="flex flex-wrap gap-3">
          <StatePill state="pass">committed</StatePill>
          <StatePill state="gate">awaiting human approval</StatePill>
          <StatePill state="halt">anomaly. Escalated</StatePill>
        </div>
        <p className="max-w-(--container-prose) text-sm text-muted">
          These three are the entire accent palette. If something on the site is coloured,
          it is because it is in one of these states. There is no decorative use.
        </p>
      </Block>

      <Block title="Metrics">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <MetricReadout
            metric={{ value: 80, suffix: "%+", label: "tool-selection accuracy in production", href: "/work" }}
          />
          <MetricReadout
            metric={{ value: 30, prefix: "~", suffix: "%", label: "manual intervention removed", href: "/work" }}
          />
          <MetricReadout metric={{ value: 6, label: "specialised agents coordinating" }} />
          <MetricReadout metric={{ value: 100, prefix: "~", label: "instructors led", href: "/teaching" }} />
        </div>
      </Block>

      <Block title="Buttons & links">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/work" variant="primary">
            View work
          </ButtonLink>
          {/* Deliberately neutral: this page is a component demo, and naming a
              flag-gated feature here would leak it into the build when off. */}
          <ButtonLink href="/work">Secondary action</ButtonLink>
        </div>
        <LinkCluster links={{ demo: "#", video: "#", repo: "#" }} />
        <LinkCluster links={{ video: "#" }} />
      </Block>

      <Block title="Tags">
        <TagRow tags={["LangGraph", "A2A protocol", "FastAPI", "evals", "human-in-the-loop"]} />
      </Block>

      <Block title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2">
          <Surface className="p-6">
            <h3 className="text-h3">Static surface</h3>
            <p className="mt-3 text-sm text-muted">
              Borders define the panel. No shadow at rest.
            </p>
          </Surface>
          <Surface interactive className="p-6">
            <h3 className="text-h3">Interactive surface</h3>
            <p className="mt-3 text-sm text-muted">
              Hover or tab to it. Lift plus a pass-tinted border. Raised always means
              interactive.
            </p>
          </Surface>
        </div>
      </Block>

      <Block title="Bento grid">
        <BentoGrid>
          <BentoCell span={4} rows={2}>
            <Surface interactive className="flex h-full flex-col justify-between p-6">
              <div>
                <h3 className="text-h3">LedgerLab</h3>
                <p className="mt-3 max-w-tight text-sm text-muted">
                  A fake bank for agents to reconcile. An open MCP server handing any client a
                  realistically messy synthetic ledger.
                </p>
              </div>
              <TagRow className="mt-6" tags={["MCP", "FastMCP 3", "399 tests"]} />
            </Surface>
          </BentoCell>
          <BentoCell span={2}>
            <Surface interactive className="h-full p-6">
              <h3 className="text-h3">FinXPIA</h3>
              <p className="mt-3 text-sm text-muted">Prompt-injection corpus + benign twins.</p>
            </Surface>
          </BentoCell>
          <BentoCell span={2}>
            <Surface interactive className="h-full p-6">
              <h3 className="text-h3">Trace2Evals</h3>
              <p className="mt-3 text-sm text-muted">Agent failures become owned eval cases.</p>
            </Surface>
          </BentoCell>
          <BentoCell span={3}>
            <Surface interactive className="h-full p-6">
              <h3 className="text-h3">PolicyGround</h3>
              <p className="mt-3 text-sm text-muted">
                Governed finance RAG. Every claim cited; weak retrieval refuses.
              </p>
            </Surface>
          </BentoCell>
          <BentoCell span={3}>
            <Surface interactive className="h-full p-6">
              <h3 className="text-h3">InvoiceOps</h3>
              <p className="mt-3 text-sm text-muted">
                Extract → policy-check → confidence-route → human-gate → audit.
              </p>
            </Surface>
          </BentoCell>
        </BentoGrid>
      </Block>

      <Block title="Decision records">
        <div className="grid gap-4 lg:grid-cols-2">
          <ADRCard
            index={0}
            adr={{
              decision: "No vector database for the site's RAG agent",
              alternatives: "Pinecone, Qdrant, pgvector. All used elsewhere in these projects.",
              why: "The corpus is ~150 chunks. Build-time embeddings plus cosine similarity in a route handler is faster, free, and has no operational surface. A managed store here would be cost and latency with no retrieval benefit.",
            }}
          />
          <ADRCard
            index={1}
            adr={{
              decision: "Orchestrator cannot approve its own work",
              alternatives: "A single agent with a self-check step, or an LLM-as-judge gate.",
              why: "Self-approval collapses the audit trail. Separating dispatch from approval means every posting has a human signature behind it, which is what makes the close defensible.",
            }}
          />
        </div>
      </Block>

      <Block title="Limits panel">
        <LimitsPanel
          limits={[
            "It cannot reconcile against a real bank feed. Every ledger in this repository is synthetic, generated by ledgerfab.",
            "Tool-selection accuracy is measured at 80%+ on the eval set, which means roughly one call in five still needs the retry path. It is not autonomous.",
            "The policy checks encode a 30-document synthetic accounting manual. They are not a substitute for a real firm's controls.",
          ]}
        />
      </Block>

      <Block title="Motion">
        <Reveal>
          <p className="text-muted">This block faded and rose once, on first view.</p>
        </Reveal>
        <Stagger className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Staggered one", "Staggered two", "Staggered three"].map((t) => (
            <StaggerItem key={t}>
              <Surface className="p-4 text-sm text-muted">{t}</Surface>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-4 max-w-(--container-prose) text-sm text-faint">
          With <code className="text-text">prefers-reduced-motion</code> set, every block above
          renders instantly and the counters show their final values. Nothing is hidden behind
          an animation.
        </p>
      </Block>
    </Container>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-20">
      <SectionHeader eyebrow="component" title={title} />
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}
