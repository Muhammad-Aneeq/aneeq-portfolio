import type { LabInput } from "@/content/schema";
import { newLabs } from "@/content/new-labs";

/**
 * The lab grid.
 *
 * Eight. ReportSmith was excluded while it had a plan, a progress log and a blockers
 * file and no code; it now has a backend, a frontend, evals and a recorded demo, so
 * it ships. SPEC §2 still bars placeholder projects.
 */
export const labs: LabInput[] = [
  ...newLabs,
  {
    slug: "policyground",
    name: "PolicyGround",
    tagline:
      "Governed RAG where weak retrieval refuses instead of guessing, applied to a finance policy manual",
    domain: "finance",
    order: 1,
    capabilities: ["rag", "governance", "evals"],
    stack: ["Python", "LangGraph", "FastAPI", "pgvector", "React"],
    links: { repo: "https://github.com/Muhammad-Aneeq/policyground", repoPublic: true },
    walkthrough: {
      src: "/media/policyground/walkthrough.mp4",
      poster: "/media/policyground/walkthrough.jpg",
      seconds: 53,
      caption:
        "The same question asked as three roles. Guest and staff are refused with the restricted passages never retrieved, and the controller is answered with every claim carrying a citation.",
    },
    loop: {
      webm: "/media/policyground/loop.webm",
      mp4: "/media/policyground/loop.mp4",
      poster: "/media/policyground/loop.jpg",
    },
    span: 4,
    rows: 2,
    body: [
      "Every claim is cited, weak retrieval refuses rather than composing something plausible, sensitivity labels decide what is retrievable at all, and groundedness is gated in CI rather than checked by hand.",
      "The graph is retrieve → assess_sufficiency → (refuse | compose → citation_check). Refusal is a node, not an apology appended to an answer. Which is the difference between a system that declines and one that hedges.",
      "The label filter lives in the retriever protocol rather than in the prompt, so a role that cannot see a document cannot have it summarised at them either. The corpus is a 30-policy synthetic accounting manual written for the project; no real policy text and no accounting-standard text is reproduced.",
    ],
    shots: [
      {
        src: "/media/policyground/roles.png",
        width: 1280,
        height: 720,
        alt: "The roles demo: one question asked at guest, staff and controller. Guest and staff are refused with passages withheld by the label filter; the controller is answered.",
        caption:
          "One question, three roles, side by side. Guest and staff are refused with six passages withheld by the label filter; the controller is answered from two restricted sources. The line above the panels is the design decision. The filter runs inside the retriever, so restricted passages are never read rather than read and then hidden.",
      },
      {
        src: "/media/policyground/refusal.png",
        width: 1280,
        height: 720,
        alt: "A refusal: the question scored 0.46 against a 0.80 threshold, with the nearest sections listed under a heading saying they are not an answer.",
        caption:
          "Refusal is a node, not an apology appended to an answer. It scores the retrieval (0.46 against a 0.80 threshold), says plainly that it will not infer, lists the closest sections under a heading insisting they are not an answer, and logs the question as a possible gap in the manual.",
      },
      {
        src: "/media/policyground/answer.png",
        width: 1280,
        height: 720,
        alt: "An answered question: each claim carries a numbered citation, with the cited passages shown in a sources panel alongside their sensitivity label and version.",
        caption:
          "The same machinery when retrieval is sufficient (0.94). Every claim carries a numbered citation and the panel states the rule: uncited claims are removed before render. The prose is blunt because this ran with no model credential. Composition falls back to an extractive stub, while citation, label filtering and refusal stay deterministic and unaffected.",
      },
    ],
  },
  {
    slug: "trace2evals",
    name: "Trace2Evals",
    tagline:
      "Production agent failures turned into versioned eval cases, applied to finance agent traces",
    domain: "finance",
    order: 2,
    capabilities: ["evals", "agents"],
    stack: ["Python", "OpenTelemetry", "LangSmith", "React"],
    links: { repo: "https://github.com/Muhammad-Aneeq/trace2evals", repoPublic: true },
    walkthrough: {
      src: "/media/trace2evals/walkthrough.mp4",
      poster: "/media/trace2evals/walkthrough.jpg",
      seconds: 115,
      caption:
        "Twelve fixture files in two trace formats dropped in live. Malformed records are reported rather than dropped and PII is redacted before it reaches a screen, then runs are labelled in three keystrokes and exported as plain JSONL and a pytest suite.",
    },
    loop: {
      webm: "/media/trace2evals/loop.webm",
      mp4: "/media/trace2evals/loop.mp4",
      poster: "/media/trace2evals/loop.jpg",
    },
    span: 2,
    rows: 1,
    body: [
      "Import agent traces from OpenTelemetry JSON or LangSmith run exports, label them fast in a keyboard-first UI, and export versioned, framework-neutral eval cases: cases.jsonl, a generated pytest suite, and an optional Promptfoo config.",
      "No LLM calls, no telemetry, no network at runtime. Traces never leave the machine. Redaction runs between parsing and normalisation rather than after, so PII never reaches the stored model in the first place.",
    ],
    shots: [
      {
        src: "/media/trace2evals/label.png",
        width: 1600,
        height: 900,
        alt: "The labelling screen: a trace's input, final output and step timeline above verdict buttons, failure tags and a keyboard legend.",
        caption:
          "The labelling screen. Verdict on R/W/P, failure tags on keys 1 through 7, commit on enter. And a median-seconds-per-label readout with a target of under ten, because a labelling tool that is slow does not get used.",
      },
      {
        src: "/media/trace2evals/cases.png",
        width: 1600,
        height: 900,
        alt: "The eval cases screen, showing labelled runs converted into versioned cases with pre-filled assertions.",
        caption:
          "Labelled runs become versioned cases with assertions pre-filled from what the trace actually did.",
      },
      {
        src: "/media/trace2evals/export.png",
        width: 1600,
        height: 900,
        alt: "The export screen, offering cases.jsonl, a generated pytest suite and a Promptfoo config.",
        caption:
          "Framework-neutral output you own: cases.jsonl, a generated pytest suite, an optional Promptfoo config. Nothing is locked to this tool.",
      },
    ],
  },
  {
    slug: "finxpia",
    name: "FinXPIA",
    tagline:
      "A prompt-injection corpus with benign twins, so it measures discrimination not blocking, applied to finance documents",
    domain: "finance",
    order: 3,
    capabilities: ["security", "evals"],
    stack: ["Python", "Promptfoo", "PyRIT"],
    links: { repo: "https://github.com/Muhammad-Aneeq/finxpia", repoPublic: true },
    walkthrough: {
      src: "/media/finxpia/walkthrough.mp4",
      poster: "/media/finxpia/walkthrough.jpg",
      seconds: 66,
      caption:
        "The same sixty documents through a naive agent and a guarded one. Attack success falls from 36.7% to 1.7% with no increase in false blocks, and the run exports as a timestamped report tied to a corpus hash.",
    },
    loop: {
      webm: "/media/finxpia/loop.webm",
      mp4: "/media/finxpia/loop.mp4",
      poster: "/media/finxpia/loop.jpg",
    },
    span: 2,
    rows: 1,
    body: [
      "Around 60 finance-document prompt-injection cases and 60 benign twins, shipped as both a Promptfoo dataset and a PyRIT dataset with a compliance-ready report dashboard. The twins are the point: a corpus that only contains attacks measures blocking, not discrimination.",
      "Defensive tooling, and declawed deliberately. Every case instantiates an already-public documented pattern. There is no novel attack research here. Exfiltration destinations use only reserved unroutable domains and structurally invalid IBANs, and the CSV vector uses the formula-injection shape wrapped in an inert text function. Both are enforced by tests rather than by convention.",
    ],
    shots: [
      {
        src: "/media/finxpia/summary.png",
        width: 2400,
        height: 2571,
        alt: "The FinXPIA report dashboard summarising attack success rate, false-block rate and per-vector results.",
        caption:
          "The compliance report. Attack success and false-block rate side by side, because a corpus that only measures blocking tells you half the story.",
      },
      {
        src: "/media/finxpia/heatmap.png",
        width: 2400,
        height: 2143,
        alt: "A heatmap of attack success across injection vectors and document types.",
        caption:
          "Per-vector results across document types, with the benign twins scored alongside.",
      },
    ],
  },
  {
    slug: "invoiceops",
    name: "InvoiceOps",
    tagline:
      "No value the LLM produces can reach a policy decision, applied to invoice approval",
    domain: "finance",
    order: 4,
    capabilities: ["agents", "governance"],
    stack: ["Python", "LangGraph", "FastAPI", "Azure Bicep"],
    links: { repo: "https://github.com/Muhammad-Aneeq/InvoiceOps" },
    span: 3,
    rows: 1,
    body: [
      "A governed accounts-payable intake pipeline: extract → policy-check → confidence-route → human-gate → audit. Drop an invoice PDF in a watched folder and it comes out as auto-record, needs-approval or rejected, with a human-readable reason on every decision and a per-field confidence on every extracted value.",
      "Everyone building invoice automation hits the same question. How much of the decision do you let the model make? For money movement the honest answer is none of it, and this is what taking that seriously looks like when it is enforced architecturally rather than by convention.",
    ],
    shots: [
      {
        src: "/media/invoiceops/trail-gated.png",
        width: 2880,
        height: 1880,
        alt: "One invoice's audit trail: the pipeline stage by stage, five policy checks each with a plain-English reason, per-field extraction confidences, and a vendor-resolution panel.",
        caption:
          "The claim in the tagline, on screen. The vendor-resolution panel is labelled the one place an LLM is involved, and underneath it: stored for this trail and never read by the policy engine. PolicyInput has no field it could be assigned to. Every policy check carries its arithmetic, not a verdict.",
      },
      {
        src: "/media/invoiceops/intake.png",
        width: 2880,
        height: 1880,
        alt: "The intake feed: fourteen invoices as cards, each with a route badge and a confidence band, several showing OCR damage in the vendor names.",
        caption:
          "Fourteen synthetic invoices, routed. The damage is the point. Orre1l Partners with a digit for an l, a category reading faci1ities, one card noting it was printed as “Acme Logistics Lt”, and two duplicate submissions that resolved to no vendor at all and stopped on two failed rules each.",
      },
      {
        src: "/media/invoiceops/exceptions.png",
        width: 2880,
        height: 1880,
        alt: "The exception queue: each held invoice states why it stopped, with approve and reject buttons and an optional note field.",
        caption:
          "Why this stopped, every time, in a sentence a controller can act on. A PO that was never raised, or an invoice billing £947.64 against one authorising £740.58, over by 28.0% on a 1.0% tolerance. Note the second card: confidence was High at 0.85 and it was gated anyway, because confidence and policy are separate gates.",
      },
      {
        src: "/media/invoiceops/confidence.png",
        width: 2880,
        height: 1880,
        alt: "Confidence analytics: per-field histograms against the auto-record threshold, with four fields marked critical.",
        caption:
          "Per-field confidence against the 0.85 auto-record threshold, and the reason only four fields are marked critical is written on the page: a hazy line-item description does not escalate an invoice, a hazy amount does.",
      },
    ],
  },
  {
    slug: "statementlens",
    name: "StatementLens",
    tagline:
      "Analysis with receipts, where the model never sees the source data, applied to financial statements",
    domain: "finance",
    order: 5,
    capabilities: ["agents", "governance", "evals"],
    stack: ["Python", "LangGraph", "FastAPI", "React"],
    links: { repo: "https://github.com/Muhammad-Aneeq/statementlens", repoPublic: true },
    walkthrough: {
      src: "/media/statementlens/walkthrough.mp4",
      poster: "/media/statementlens/walkthrough.jpg",
      seconds: 105,
      caption:
        "Statements computed from the profile, then written up live by the model without it ever seeing the statements. Every figure in the commentary is a chip that opens the computation behind it.",
    },
    loop: {
      webm: "/media/statementlens/loop.webm",
      mp4: "/media/statementlens/loop.mp4",
      poster: "/media/statementlens/loop.jpg",
    },
    span: 3,
    rows: 1,
    body: [
      "Multi-period P&L, balance sheet and cash flow become a computed ratio pack, deterministic trends, YAML-ruled red flags, and a narrative in which every number traces back to a computation you can click into.",
      "The headline decision is structural rather than procedural: the composer's input type has no field for a statement line and its builder has no parameter to pass one, so blindness is enforced by a signature, not a comment. A test asserts that every numeric literal in the rendered prompt is reachable from some computation, any other number fails the build.",
      "The 'what these statements cannot tell us' section is a post-condition asserted in code. If the model omits it, a deterministic one is composed from the statement set's own structural gaps.",
    ],
  },
  {
    slug: "finsight",
    name: "FinSight",
    tagline:
      "A governed semantic model with its accuracy published and its scope visible, applied to finance reporting",
    domain: "finance",
    order: 6,
    capabilities: ["rag", "evals", "governance"],
    stack: ["Microsoft Fabric", "Copilot Studio", "DuckDB", "DAX", "Python"],
    links: { repo: "https://github.com/Muhammad-Aneeq/finsight" },
    span: 3,
    rows: 1,
    body: [
      "A controller asks which cost centres moved more than 10% last month, and why. And gets an answer grounded in a governed finance semantic model, read-only, with the accuracy published and the scope visible.",
      "Microsoft's Fabric Data Agent consumed by a Copilot Studio agent is their newest governed-data pattern and there is almost no complete public finance example of it. The agent itself does not exist yet: the spec gates the project on verifying that the paid Microsoft surfaces fit a personal budget, and that verification is a human's portal session. So this is deliberately the buildable half. The star schema, the 13 DAX measures, a 30-question accuracy suite with SQL-computed ground truth, and a governance transparency page, built so the portal session is short and scripted.",
    ],
  },
  {
    slug: "spendsort",
    name: "SpendSort",
    tagline:
      "Confidence, gate, learn. The simplest honest agent loop, applied to expense categorisation",
    domain: "finance",
    order: 7,
    capabilities: ["agents", "governance"],
    stack: ["Python", "LangGraph", "FastAPI", "SQLite", "React"],
    links: { repo: "https://github.com/Muhammad-Aneeq/spendsort", repoPublic: true },
    walkthrough: {
      src: "/media/spendsort/walkthrough.mp4",
      poster: "/media/spendsort/walkthrough.jpg",
      seconds: 95,
      caption:
        "A month of card transactions categorised, with anything under the confidence gate held for review. An override is written to vendor memory, so the next run covers more from memory and calls the model less.",
    },
    loop: {
      webm: "/media/spendsort/loop.webm",
      mp4: "/media/spendsort/loop.mp4",
      poster: "/media/spendsort/loop.jpg",
    },
    span: 3,
    rows: 1,
    body: [
      "It categorises card transactions, tells you how sure it is, and only acts alone when it has earned the right to. Expense categorisation is the highest-volume, lowest-risk finance AI workflow, the right first agent to build.",
      "Four nodes: normalise the vendor, check memory, categorise if it is a miss, and route on confidence. The memory is what makes the pattern worth shipping. A confirmed categorisation becomes a hit next month, so the gated fraction falls as the system learns rather than staying constant forever.",
    ],
  },
  {
    slug: "reportsmith",
    name: "ReportSmith",
    tagline:
      "A monthly finance pack narrated by a model that cannot invent a number, applied to management reporting",
    domain: "finance",
    order: 11,
    capabilities: ["agents", "governance", "evals"],
    stack: ["Python", "FastAPI", "LangGraph", "React", "Vite", "SQLite"],
    links: { repo: "https://github.com/Muhammad-Aneeq/reportsmith", repoPublic: true },
    span: 3,
    rows: 1,
    walkthrough: {
      src: "/media/reportsmith/walkthrough.mp4",
      poster: "/media/reportsmith/walkthrough.jpg",
      seconds: 60,
      caption:
        "Assemble a period, review the draft beside the figures each section was allowed to cite, watch it refuse to issue while gaps are open, waive them with a reason, sign, then verify the archived pack against its hash.",
    },
    loop: {
      webm: "/media/reportsmith/loop.webm",
      mp4: "/media/reportsmith/loop.mp4",
      poster: "/media/reportsmith/loop.jpg",
    },
    body: [
      "The pack is defined once as a versioned YAML template and assembled from live data each period. Tables and KPIs are computed in code with no model involved, so the same data and template produce identical output. Narratives are drafted from that section's bound figures only, and every number the model writes is cross-checked against those figures before it survives.",
      "A missing or failed binding becomes an explicit gap rather than a silent omission, and the pack cannot be issued while a gap is open: it is either resolved or waived with a reason that is recorded. Review is section by section with word-level tracked edits, then a sign-off, then an immutable archive with a content hash and a live integrity check.",
      "It composes the other projects rather than rebuilding them. The synthetic world and the statement engine are vendored from LedgerLab with a drift-checked manifest, and the categorised-spend adapter is built against SpendSort's real export schema with fixtures generated by running it. Nothing imports across a sibling path at runtime.",
    ],
    limits: [
      "The ratio pack, the red-flag rules and the numeric cross-check are computed in this repository to StatementLens's own shapes, because StatementLens has not yet reached those phases upstream. The cross-check originates here and is written to be lifted across later, so today it is a design agreement rather than shared code.",
      "The live path was run and measured at 87 of 87 figures verified against gpt-5.6-luna. That is fidelity of the narration to the bound figures, not a judgement that the figures themselves answer a controller's question, and every figure in the repository is generated by ledgerfab from a fixed seed.",
    ],
  },
];
