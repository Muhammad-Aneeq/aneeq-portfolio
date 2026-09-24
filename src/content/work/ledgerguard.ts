import type { CaseStudyInput } from "@/content/schema";

export const ledgerguard: CaseStudyInput = {
  slug: "ledgerguard",
  name: "LedgerGuard",
  title: "Auditability as architecture, not logging",
  outcome:
    "An agent that can prove what it did, under seven governance checks, applied to bank reconciliation",
  whyFlagship:
    "Auditability designed in rather than logged after. A cloud-hosted agent on an enterprise stack, plus a one-number config change that demonstrates why two approval floors exist instead of one.",
  domain: "finance",
  order: 2,

  tldr:
    "LedgerGuard reconciles a bank statement and can reconstruct every decision it made. Confidence is arithmetic over five named ledger features, never a model's self-report. Seven governance checks each run offline as one command. Check six lowers one threshold and shows an accuracy gate passing a configuration that silently stops reviewing short payments.",

  tags: ["governance", "auditability", "human-in-the-loop", "Azure AI Foundry"],
  stack: ["Python", "LangGraph", "FastAPI", "Postgres", "OpenTelemetry", "Azure Bicep", "React"],
  links: { repo: "https://github.com/Muhammad-Aneeq/LedgerGuard" },

  /*
    Loop only. The source is 4m39s and silent; a full walkthrough of it would be one
    of the largest assets on the site for a recording few people finish. The loop
    shows the run moving, and this case study already carries the argument in prose.
  */
  loop: {
    webm: "/media/ledgerguard/loop.webm",
    mp4: "/media/ledgerguard/loop.mp4",
    poster: "/media/ledgerguard/loop.jpg",
  },

  metrics: [
    {
      value: 38,
      label: "decisions in one reconciliation",
      note: "24 auto-posted, 14 paused for a human. The split is the point: the system declines to decide where it should not.",
    },
    { value: 45, label: "OTel spans read back through the collector" },
    { value: 7, label: "governance checks, each independently demoable offline" },
    { value: 4, label: "real scorer bugs found by running the eval suite" },
  ],

  problem: [
    "Reconciliation is the ideal first job for a finance agent: high volume, rule-shaped, genuinely tedious. It is also the worst possible place for a confident guess. Marking an invoice settled when it was short-paid quietly writes off money somebody still owes. And the mistake is invisible, because the books balance, the queue is short, and everybody is pleased.",
    "So the whole system is built around one claim: every decision it makes is reconstructable, and every decision it declines to make is on the record. A reviewer asking \"why 0.62?\" gets an itemised answer that adds up, because the confidence score is arithmetic over five named features read from the ledger rather than a number a model reported about itself.",
  ],

  transfers: [
    "The transferable artefact is an audit trail that is an architecture rather than a log, plus a reviewer console where a human decision is captured as data. Clinical decision support has the same requirement: a recommendation is worthless unless a reviewer can see what evidence produced it and record why they overrode it.",
    "Legal document review needs the two-floor pattern specifically. The one-number config change here demonstrates why a single confidence threshold collapses under a shifting document mix. The same failure a contract-triage agent hits when a new counterparty template arrives.",
    "Any regulated workflow where a decision must be defensible months later. Benefits eligibility, KYC review, export-control screening. Needs the governance checks to run as gates in the graph rather than as assertions in a test suite.",
  ],

  constraints: [
    "All data is synthetic, generated from seeded templates. No real financial data is used anywhere, including in the security payloads.",
    "The same container must run locally and under Azure AI Foundry. Not a near-copy, the same image, with one switch selecting provider, secrets, trace exporter and approval producer.",
    "A match cannot reach the database without a reason and citations that resolve to evidence the agent actually looked up.",
    "Every check must run offline, with no API key and no cloud account.",
  ],

  architecture: {
    summary:
      "A LangGraph graph loads a period, fetches data over MCP, proposes matches, scores confidence arithmetically, then routes: at or above 0.85 it finalises; below that it emits an approval request and interrupts, checkpointing to Postgres. A signed callback resumes it. The Reviewer Console's Approve button does not apply a decision directly. It signs the same contract a Teams card would and posts it over loopback, deliberately the long way round.",
    trace: [
      {
        id: "load",
        kind: "plan",
        label: "Load period",
        caption: "2025-Q1 against ledgerlab's realistic profile, seed 42. 38 transactions to decide.",
      },
      {
        id: "fetch",
        kind: "tool",
        label: "Fetch over MCP",
        caption:
          "Seven MCP tools over Streamable HTTP. A committed fixture export sits behind the same interface as a fallback, a fallback, not a mock.",
      },
      {
        id: "score",
        kind: "policy",
        label: "Score confidence",
        caption:
          "Arithmetic over five named features read from the ledger. There is no code path from prose to the number, which is why the injection corpus scores 0% attack success structurally rather than by filtering.",
      },
      {
        id: "route",
        kind: "route",
        label: "Route on threshold",
        caption:
          "≥0.85 auto-posts. 0.60 to 0.85 and below both go to a human. 24 auto-posted; 14 paused.",
      },
      {
        id: "abstain",
        kind: "halt",
        label: "Abstain where evidence runs out",
        caption:
          "Three of the fourteen propose no target at all. An escalation that names nothing beats a guess that names something.",
      },
      {
        id: "gate",
        kind: "gate",
        label: "Interrupt and checkpoint",
        caption:
          "The graph interrupts and checkpoints to Postgres. Duplicate delivery of the same decision returns replayed: true and resumes nothing.",
      },
      {
        id: "resume",
        kind: "commit",
        label: "Resume and complete",
        caption:
          "Fourteen decisions posted through the console's own signed callback; the last one resumed the graph and the run completed.",
      },
      {
        id: "export",
        kind: "audit",
        label: "Audit export",
        caption:
          "38 rows, every one with its trace id, corrected rows carrying the agent's original proposal alongside the reviewer's choice.",
      },
    ],
  },

  adrs: [
    {
      decision: "Confidence is arithmetic over ledger features, never a model's self-report",
      alternatives: "Ask the model for a confidence score, which is what most agent stacks do.",
      why: "A reviewer asking why 0.62 needs an answer that adds up, and a self-reported score cannot give one. It also turned out to be the security property: the prompt-injection corpus scores 0% attack success and 0% false-block rate not because a filter catches attacks, but because a memo is not one of the five features, so there is no code path from prose to the number.",
    },
    {
      decision: "The Approve button posts the Teams contract to itself over loopback",
      alternatives:
        "Have the console apply the decision directly, one fewer hop, obviously simpler.",
      why: "The spec calls the Logic-Apps-to-LangGraph resume the highest-risk integration in the project. Routing the console's own button through the identical signed contract means every click in local development exercises the Teams path, so that risk got spent in week one instead of on a deploy day. A contract test asserts the Logic App's outgoing body against the same Pydantic model, which is how a 422-on-every-card bug was caught before deployment rather than after.",
    },
    {
      decision: "Gate the deploy on two floors, not one",
      alternatives: "Gate on matching accuracy, the metric everybody reports.",
      why: "Check six demonstrates why. A degraded config differing by one number. The auto threshold, 0.85 to 0.75, to shorten a queue reviewers had complained about. Holds MatchF1 at a perfect 1.0000 while EscalationScore falls to 0.6700. Nothing errors, every decision still carries grounded citations, and the queue halves. What actually happened is that all seven short-payment escalations stopped being reviewed, so short-paid invoices are now marked settled with no human involved. A gate on matching accuracy alone would have passed it.",
    },
    {
      decision: "Enforce dependency direction in the image build, not by convention",
      alternatives: "A lint rule or a code-review norm about which package imports which.",
      why: "The agent image cannot import the companion or the benchmark, and the companion cannot import LangGraph. Because the builds do not contain them. A convention degrades the first time someone is in a hurry; a build failure does not.",
    },
  ],

  evaluation: {
    summary:
      "Running the eval suite found four real defects in the confidence scorer that no unit test in the repository would have caught. The first run scored MatchF1 0.4827 and EscalationScore 0.4365. Each defect now has a named regression test. That is why the gate earns its place rather than decorating the pipeline.",
    rows: [
      { metric: "MatchF1", result: "1.0000", note: "100 cases × k=4, mode: offline" },
      { metric: "EscalationScore", result: "1.0000", note: "floor is 0.90" },
      { metric: "Traces", result: "38/38", note: "45 spans read back through the collector" },
      { metric: "Prompt-injection run", result: "0% attack success", note: "0% false-block, 0 suppressed reviews, 120 cases" },
      { metric: "Tests", result: "367", note: "agent 171 · backend 171 · frontend 25" },
      { metric: "Azure IaC", result: "8 templates, 0 errors", note: "pinned standalone Bicep 0.31.92" },
    ],
  },

  limits: [
    "MODEL_MODE=mock throughout. No API key was available. The reasoner is deterministic, so nothing here is evidence about how a real model behaves. The governance claims are unaffected only because confidence is arithmetic by design and never asks a model how sure it is; every surface that shows a score carries its mode label.",
    "A perfect 1.0000 on a synthetic suite whose generator is readable in a sibling directory is a much weaker claim than one on real bank data. Check one prints that caveat on every run.",
    "The injection run tests the decision, not the explanation. A live model could be talked into a misleading explanation of a correct decision, and a reviewer approving on the strength of that explanation is a real attack path. It is untested.",
    "It has never been deployed to Azure. No subscription is attached. The IaC compiles and the runbook has the exact human steps, but nothing in the repository claims to be deployed.",
    "The console has since been rendered and recorded, so the earlier statement here that it never had is withdrawn. What the recording shows is a local run in mock mode, with the accuracy floor badge reading PASS MOCK on screen: the interface is real, the reasoning behind the numbers in it is still deterministic.",
    "Branch protection is not configured. CI's deploy job depends on the evals gate, but anyone with push access can bypass a pipeline. That one GitHub setting is what turns check six from a demonstration into a control, and it is not in the repository.",
  ],
};
