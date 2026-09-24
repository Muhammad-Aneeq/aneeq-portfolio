import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AskPanel } from "@/components/ask/ask-panel";
import { Container } from "@/components/layout/container";
import { ADRCard } from "@/components/ui/adr-card";
import { MetricReadout } from "@/components/ui/metric-readout";
import scores from "@/lib/ask/scores.json";
import { ASK_ENABLED } from "@/lib/features";

/**
 * A `metadata` export is evaluated even when the component calls `notFound()`,
 * which leaked the page title into the 404's HTML. Generating it lets the flag
 * gate the metadata too, so a disabled agent leaves no trace anywhere in the build.
 */
export function generateMetadata(): Metadata {
  if (!ASK_ENABLED) return {};
  return {
    title: "Ask this portfolio",
    description:
      "A governed retrieval agent over Aneeq Khatri's resume and case studies. It cites every claim, refuses when retrieval is weak instead of composing something plausible, and publishes the eval scores that gate it.",
  };
}

const pct = (rate: number) => Math.round(rate * 100);

export default function AskPage() {
  // Not a "coming soon" page. With no provider key the route does not exist,
  // and nothing anywhere on the site links to it.
  if (!ASK_ENABLED) notFound();

  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        ask this portfolio
      </p>
      <h1 className="mt-5 text-h1">The site is its own demo</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-8 max-w-read text-lead text-muted">
        A retrieval agent over this resume and these case studies. It cites every claim,
        and when retrieval is weak it refuses rather than composing something plausible.
        The refusal is decided before the model is called, so an out-of-scope question
        costs nothing and cannot be argued into an answer.
      </p>

      <div className="mt-12">
        <AskPanel />
      </div>

      <section className="mt-20 border-t border-border pt-12">
        <h2 className="text-xs text-muted uppercase" data-readout>
          published scores
        </h2>
        <p className="mt-4 text-muted">
          These come from the eval suite that gates every push. They are written by the
          run, not typed into this page. If the suite fails, the build fails.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <MetricReadout
            metric={{
              value: pct(scores.retrieval.rate),
              suffix: "%",
              label: `retrieval. Correct passage in top 3 (${scores.retrieval.passed}/${scores.retrieval.total})`,
            }}
            size="sm"
          />
          <MetricReadout
            metric={{
              value: pct(scores.refusal.rate),
              suffix: "%",
              label: `refusal. Out-of-scope questions declined (${scores.refusal.passed}/${scores.refusal.total})`,
            }}
            size="sm"
          />
          <MetricReadout
            metric={{
              value: pct(scores.injection.rate),
              suffix: "%",
              label: `injection. Scope held against ${scores.injection.total} payloads`,
            }}
            size="sm"
          />
          <MetricReadout
            metric={{ value: scores.corpusChunks, label: "chunks in the corpus" }}
            size="sm"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-faint">
          <span data-readout>
            {scores.commit === "local" ? "local run" : `commit ${scores.commit}`}
          </span>
          {/*
            The suite grades retrieval and refusal, which run offline. Generation
            quality is not graded, so it is reported as pending rather than left
            for a reader to assume the three numbers above cover it.
          */}
          <span className="inline-flex items-center gap-2" data-readout>
            <span className="size-1.5 rounded-full bg-gate" aria-hidden />
            groundedness of generated wording: eval pending
          </span>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-h2">How it works</h2>
        <p className="mt-6 leading-relaxed text-muted">
          The corpus is built from the same typed content these pages render. There is no
          separate ingest step and no copy to drift. A question is scored against it with
          BM25, and two thresholds decide whether an answer happens at all: how strongly
          the best passage matches, and how much of the question that passage actually
          accounts for. Only if both clear does a model see anything.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          That ordering is the whole design. Scope is enforced by retrieval, not by the
          system prompt. So a prompt-injection payload has no path to widen it. It is the
          same argument as LedgerGuard’s confidence scorer: if there is no code path
          from prose to the decision, there is nothing to talk into changing its mind.
        </p>

        <div className="mt-10 grid gap-4">
          <ADRCard
            index={0}
            adr={{
              decision: "No vector database",
              alternatives: "Pinecone, Qdrant or pgvector, all of which are used in the projects on this site.",
              why: `The corpus is ${scores.corpusChunks} chunks. A managed vector store here would add an operational surface, a network hop and a bill, and return the same passages. Reaching for one anyway would be the reflex this site argues against.`,
            }}
          />
          <ADRCard
            index={1}
            adr={{
              decision: "No embeddings either, BM25, scored in process",
              alternatives: "Build-time embeddings plus cosine similarity, which is what the spec called for.",
              why: "At this size, with a question and a corpus that share vocabulary, lexical scoring retrieves the right passage. And it needs no embedding provider, no API key and no build-time network call. The honest cost is that a question phrased entirely in synonyms will retrieve worse than embeddings would. The vector version of this problem is PolicyGround.",
            }}
          />
          <ADRCard
            index={2}
            adr={{
              decision: "Refuse on retrieval, before the model runs",
              alternatives: "Instruct the model to decline when the passages do not contain the answer.",
              why: "A prompt instruction is a request. Deciding in code means an out-of-scope question never reaches a model at all. It costs nothing, it cannot be negotiated with, and the eval suite can measure it offline on every push. The system prompt still carries the same rule, as a second layer rather than the only one.",
            }}
          />
        </div>
      </section>

      <section className="mt-20 rounded-xl border border-halt/30 bg-halt-dim p-6 sm:p-8">
        <p className="text-xs text-halt uppercase" data-readout>
          limits
        </p>
        <h2 className="mt-3 text-h3">What this agent cannot do</h2>
        <ul className="mt-6 space-y-3.5">
          {[
            "It only knows this site. It cannot tell you anything about Aneeq that is not already on the work, labs, about, teaching or resume pages.",
            "Lexical retrieval means a question phrased entirely in synonyms of the corpus's wording will retrieve worse than an embedding-based index would. That is a real tradeoff, taken deliberately.",
            "The eval suite grades retrieval and refusal, which run offline. It does not grade the model's generated wording. A groundedness judge over live answers is the missing piece, and it would cost money to run on every push.",
            "Rate limiting and the daily token cap are per-instance and in memory. On a multi-instance deployment each instance would keep its own counter.",
          ].map((limit) => (
            <li key={limit} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-halt" aria-hidden />
              {limit}
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
