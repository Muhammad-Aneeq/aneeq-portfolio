import type { CaseStudyInput } from "@/content/schema";

export const ledgerlens: CaseStudyInput = {
  slug: "ledgerlens",
  name: "LedgerLens",
  title: "Making agent uncertainty triageable",
  outcome:
    "An exception workbench where an uncited hypothesis is deleted in code, applied to the breaks AI matching cannot close",
  whyFlagship:
    "The honest answer to what humans do with the 8 to 15% a model cannot close. Every high-volume classifier leaves a residue, and the workbench for it is usually the real product. Best UI and richest video assets.",
  domain: "finance",
  order: 4,

  tldr:
    "Residual reconciliation exceptions fail for lack of context, not algorithm quality, so a human investigates each one cold. LedgerLens has a LangGraph agent gather the related invoices, prior payments and notes, then draft root-cause hypotheses that must cite evidence or be deleted before storage. The reviewer confirms in one keystroke.",

  tags: ["agents", "grounding", "human-in-the-loop", "evals"],
  stack: ["Python", "LangGraph", "FastAPI", "SQLite", "React", "Vite", "WebSockets"],
  links: { repo: "https://github.com/Muhammad-Aneeq/LedgerLens", repoPublic: true },

  metrics: [
    {
      value: 96,
      suffix: "%",
      label: "top-1 root-cause accuracy",
      note: "on the live model path, over synthetic reconciliation exceptions. Higher is better.",
    },
    { value: 100, suffix: "%", label: "citations resolving to in-context records (58/58)" },
    { value: 0, label: "uncited hypotheses that reached the database, ever" },
    { value: 0.00098, decimals: 5, prefix: "$", label: "cost per exception investigated" },
  ],

  problem: [
    "AI matching engines stall somewhere between 85% and 92%. The exceptions they leave behind do not fail because the algorithm is weak. They fail because the deciding context is somewhere else: a prior payment, an invoice under a different name, a bookkeeper's note about a dispute. So a human investigates each one from scratch.",
    "LedgerLens splits that differently. The AI does the investigation; the human does the judgment. A LangGraph agent gathers the context pack, drafts one to three root-cause hypotheses, and each one must cite evidence that resolves to a record it actually saw. A reviewer confirms with one keystroke instead of digging.",
  ],

  transfers: [
    "Every high-volume classifier leaves a residue it cannot close, and the interesting product is almost always the queue for that residue rather than the model. Content moderation appeals, fraud-alert triage and medical-coding review are the same shape: a confident bulk path plus a human workbench for what it refused.",
    "The enforced rule. An uncited hypothesis is deleted before render, in code rather than by prompt. Transfers to any assistive tool whose suggestions a professional is accountable for. A radiology second-read or a legal citation check fails in exactly the way an uncited reconciliation hypothesis does.",
    "The pattern library, where a resolved exception becomes a reusable rule, is how any triage queue stops growing linearly with volume.",
  ],

  constraints: [
    "Matching itself is an explicit non-goal. This tool starts where the matching engine gives up.",
    "A per-batch cost cap is checked before each call, so it is a ceiling rather than a target.",
    "Ambiguous dates are flagged, never guessed, 03/04/2025 is not silently resolved.",
    "unknown is a first-class answer, styled neutrally and measured, and the agent is rewarded for it when context is genuinely absent.",
  ],

  architecture: {
    summary:
      "A five-node LangGraph graph: load the exception, gather context, hypothesise, ground-check, rank. With one re-ask if grounding drops everything. The ground check is a deterministic node, not a prompt instruction, and the runner is the only code that writes a hypothesis row, writing only from the graph's final state. That is what makes \"uncited hypotheses never reach the UI\" structural rather than conventional.",
    trace: [
      {
        id: "load",
        kind: "plan",
        label: "Load exception",
        caption: "One residual transaction the matching engine could not settle.",
      },
      {
        id: "gather",
        kind: "tool",
        label: "Gather context pack",
        caption:
          "Related invoices, prior payments from the same counterparty, and the notes that decide disputes.",
      },
      {
        id: "hypothesise",
        kind: "route",
        label: "Draft 1 to 3 hypotheses",
        caption:
          "Each is {statement, root_cause_type, confidence, evidence[]} across seven root causes.",
      },
      {
        id: "ground",
        kind: "policy",
        label: "Ground check, deterministic",
        caption:
          "Three checks: it must cite something, every cited id must resolve to a real stored record, and that record must have been in this exception's context pack.",
      },
      {
        id: "drop",
        kind: "halt",
        label: "Uncited drafts are deleted",
        caption:
          "Not flagged, not down-ranked. Deleted. A hypothesis citing a plausible-looking id it never saw is a lucky guess, and it goes too.",
      },
      {
        id: "rank",
        kind: "commit",
        label: "Rank and store",
        caption:
          "The runner writes only from the graph's final state, so the database cannot hold an ungrounded claim.",
      },
      {
        id: "verdict",
        kind: "audit",
        label: "Reviewer verdict, immutable",
        caption:
          "C confirm, X correct, R reject. A second verdict on the same exception is a 409, not an overwrite.",
      },
    ],
  },

  adrs: [
    {
      decision: "Ground-check in a deterministic node, not in the prompt",
      alternatives:
        "Instruct the model to cite its sources and validate the citations afterwards, flagging bad ones.",
      why: "Prompt instructions are requests. The check is three lines of Python that delete an uncited draft before it is stored, rendered or counted. A test proves it at the database level: a deliberately sabotaging investigator emits a 0.99-confidence claim with no evidence and a 0.97-confidence claim citing an invented invoice, and both tables come back empty.",
    },
    {
      decision: "Make unknown a rewarded answer rather than a failure state",
      alternatives: "Always produce a best-guess root cause and let confidence carry the uncertainty.",
      why: "Some payments genuinely have no explanation in the books. An agent that always answers scores well by confidently matching everything to something, which is exactly the behaviour that makes a reconciliation tool dangerous. Measuring unknown honesty and over-abstention as separate metrics means refusing correctly and refusing lazily are distinguishable.",
    },
    {
      decision: "Let heavily truncated counterparty names form their own pattern group",
      alternatives:
        "Normalise harder so ACME 4471 and ACMESUPPLIES land in the same group as a human would expect.",
      why: "No string rule rejoins those without also merging Acme Supplies with Acme Logistics, and one misleading pattern is worse than two split ones. Retrieval works around it with a prefix fallback, because there a wrong candidate is only a distractor the agent rejects. Pattern grouping deliberately does not, and a test named after the limitation asserts the behaviour.",
    },
    {
      decision: "Forbid the deterministic fallback from reading the answer key, by test",
      alternatives: "Trust that the fake LLM used for offline runs is written honestly.",
      why: "The heuristic path is what CI runs and what every committed baseline number comes from. If it could see ground truth, every one of those numbers would be theatre. A test asserts it cannot, so the baseline is honest rather than rigged. Which is what makes the live model's improvement over it meaningful.",
    },
  ],

  evaluation: {
    summary:
      "The live model path has been run end to end. The only flagship here where that is true. Grounding held against a real model, which is the first adversary capable of inventing a plausible invoice id. The eval suite also caught two real bugs during the build, and both fixes were to the data rather than the classifier.",
    rows: [
      { metric: "Top-1 root cause (live model, 25-case demo set)", result: "96.0%", note: "24/25. Heuristic baseline was 84.0%" },
      { metric: "Top-1 root cause (heuristic, 30-case suite)", result: "93.3%", note: "different data and difficulty mix, not comparable to the above" },
      { metric: "Evidence validity", result: "100.0%", note: "structural; gates CI unconditionally" },
      { metric: "unknown honesty", result: "100.0%", note: "refused to guess on all 7 unanswerable cases" },
      { metric: "Over-abstention", result: "0.0%", note: "never abandoned an answerable case" },
      { metric: "Tests", result: "179", note: "no network, no spend" },
    ],
  },

  shots: [
    {
      src: "/media/ledgerlens/queue.png",
      width: 1440,
      height: 900,
      alt: "The review queue: 25 exceptions with root-cause chips, confidence pills and a batch progress bar.",
      caption:
        "The review queue. Root-cause chips, confidence pills, and a batch run in progress over the WebSocket.",
    },
    {
      src: "/media/ledgerlens/detail.png",
      width: 1440,
      height: 900,
      alt: "An exception detail view in three panes: the transaction, ranked hypotheses with evidence chips, and the evidence panel with matched fields highlighted.",
      caption:
        "One exception. Ranked hypotheses, each with the evidence chips it cited. Click one and the source record opens with the matching fields highlighted.",
    },
    {
      src: "/media/ledgerlens/patterns.png",
      width: 1440,
      height: 900,
      alt: "The pattern library, grouping confirmed resolutions by root cause and counterparty.",
      caption:
        "The pattern library. Confirmed resolutions group by root cause and counterparty, so the third occurrence arrives with 'seen 3 times before' attached.",
    },
    {
      src: "/media/ledgerlens/report.png",
      width: 2560,
      height: 1720,
      alt: "The resolution report, showing the AI top-one agreement tile above an immutable verdict log.",
      caption:
        "The resolution report. Note the caveat in the limits below: the agreement figure only means something once corrections are in the log.",
    },
  ],

  walkthrough: {
    src: "/media/ledgerlens/walkthrough.mp4",
    poster: "/media/ledgerlens/walkthrough.jpg",
    seconds: 108,
    caption:
      "A narrated run through the exception workbench: import, the queue, opening a transaction, and reading the evidence behind a match before confirming it.",
  },

  loop: {
    webm: "/media/ledgerlens/loop.webm",
    mp4: "/media/ledgerlens/loop.mp4",
    poster: "/media/ledgerlens/loop.jpg",
  },

  limits: [
    "The 96.0% and the 93.3% are different datasets and must not be conflated. The live figure is a 25-exception realistic/seed-42 demo set; the heuristic figure is a 30-case nightmare/seed-7 suite. The live eval suite itself has not been run, and that is the remaining measurement.",
    "One live-model miss remains, and on inspection it appears to be a ground-truth data bug rather than a model error. Which is itself a reason not to read a single-digit difference as signal.",
    "Every GPT-5.x model rejects temperature 0.2, so the live config runs at the mandatory default of 1 while the spec pins 0.2 and a test still asserts it. That test currently fails against any GPT-5.x model, and the conflict is unresolved.",
    "Bank-truncated counterparty names are a known unfixed limitation. A statement line reading ACME 4471 will not join the invoice filed under ACMESUPPLIES in the pattern library, by choice.",
    "The AI top-1 agreement figure on the report is only meaningful once corrections and rejections are in the log. A reviewer who confirms everything scores it 100% by construction, since confirming adopts the top hypothesis.",
    "Live intake from an upstream MCP server returns 501 by design, naming the missing dependency rather than shipping untested plumbing. CSV intake is the supported path.",
  ],
};
