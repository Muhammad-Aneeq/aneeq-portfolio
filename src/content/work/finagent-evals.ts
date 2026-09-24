import type { CaseStudyInput } from "@/content/schema";

export const finagentEvals: CaseStudyInput = {
  slug: "finagent-evals",
  name: "FinAgent-Evals",
  title: "An open benchmark for agent reliability",
  outcome:
    "A vendor-neutral benchmark for reliability under repetition, applied to finance reconciliation tasks",
  whyFlagship:
    "Owning a benchmark is the rarest senior signal on the site. The pass@1 versus pass^k gap is a finding about agents, not about ledgers; the suite happens to be built from reconciliation cases.",
  domain: "finance",
  order: 3,

  tldr:
    "An open benchmark for agentic finance behaviour rather than model quality. It holds the model constant and asks whether the configuration around it picks the right tool, escalates when evidence runs out, and gives the same answer four times running. Every case runs k=4 and publishes pass@1 beside pass^4.",

  tags: ["evals", "benchmark", "reliability", "open source"],
  stack: ["Python", "LangGraph", "OpenAI Agents SDK", "uv", "Vite", "GitHub Pages"],
  links: { repo: "https://github.com/Muhammad-Aneeq/finagent-evals" },

  metrics: [
    {
      value: 37.8,
      decimals: 1,
      prefix: "−",
      suffix: "%",
      label: "gap between pass@1 and pass^4",
      note: "on the mock-flaky configuration, which scores 45.8% on one attempt and 8.0% across four. A smaller gap means a more reliable agent; a single-shot eval reports none of this.",
    },
    { value: 100, label: "cases across four difficulty tiers, frozen and hashed" },
    { value: 12, label: "properties the evals-of-the-evals check in CI" },
    { value: 298, label: "tests, 273 Python, 25 SPA" },
  ],

  problem: [
    "Most finance-AI benchmarks ask how good the model is. That is the right question, and somebody else is asking it. This one holds the model constant and asks a different one: does the agent configuration around it behave responsibly? Does it pick the right tool or guess from the prompt? When the evidence runs out, does it escalate or confabulate? Does it give the same answer four times running?",
    "The headline result is one configuration measured two ways. Asked once, it passes 45.8% of cases. Asked four times, the share it gets right every single time drops to 8.0%. That is not 46% good. It is unreliable, and a single-shot evaluation would never have told you.",
  ],

  transfers: [
    "The central finding is about agents, not about ledgers: single-shot evaluation systematically overstates reliability, and the pass@1 versus pass^k gap is the amount of a score that does not survive being asked again. That is true of a coding agent, a support agent or a research agent, and any of them can adopt the k-repetition harness unchanged.",
    "The tier-4 trap design. Cases where escalating is the only correct action, scored so that confident guessing loses. Is reusable wherever an agent must know the limits of its evidence. Clinical triage and incident response both need that measured rather than assumed.",
    "Benchmarking configurations rather than frameworks is the methodological transfer. Any team comparing agent stacks needs the manifest discipline here, or it publishes a framework ranking it cannot defend.",
  ],

  constraints: [
    "Vendor-neutral by construction: a row on the leaderboard is a fully-declared configuration committed as a manifest, and a test asserts no adapter reads a behavioural parameter its manifest does not declare.",
    "The reference adapters share a verbatim identical prompt, model, temperature and budget. Fair floors, not tuned champions. No framework is being crowned.",
    "An adapter never receives the case, only a metered tool broker, so the tool path is recorded by the harness rather than self-reported.",
    "The static leaderboard has no backend. It reads committed run artefacts and deploys to GitHub Pages.",
  ],

  architecture: {
    summary:
      "A generator turns seeded synthetic worlds into a frozen, hashed suite. Adapters receive only a metered tool broker, never the case itself. Which is the load-bearing decision, because everything else follows from it: budgets become enforceable, the tool path is observed rather than claimed, and \"the agent only knows what it looked up\" becomes a fact instead of a promise.",
    trace: [
      {
        id: "generate",
        kind: "plan",
        label: "Generate and freeze",
        caption:
          "100 cases in four tiers of 25, hashed. A case is a whole reconciliation workspace, not one transaction, MatchF1 needs a real denominator.",
      },
      {
        id: "broker",
        kind: "tool",
        label: "Metered tool broker",
        caption:
          "Seven tools with enforced budgets. The adapter never sees the case; it can only ask, and every ask is recorded by the harness.",
      },
      {
        id: "trap",
        kind: "halt",
        label: "Tier 4, escalation is the only right answer",
        caption:
          "Three trap families: a payment nothing explains, two invoices that fit equally, and a dispute whose deciding note has been removed.",
      },
      {
        id: "repeat",
        kind: "route",
        label: "Run it four times",
        caption:
          "Every case, k=4. This is where a configuration that looked competent stops looking competent.",
      },
      {
        id: "grade",
        kind: "policy",
        label: "Deterministic graders first",
        caption:
          "MatchF1, EscalationScore and PathValidity are computed offline. The expected outcome never reaches the judge.",
      },
      {
        id: "judge",
        kind: "commit",
        label: "Pinned judge, cached",
        caption: "A rubric-only LLM judge with a committed cache, so scores reproduce byte-identically.",
      },
      {
        id: "publish",
        kind: "audit",
        label: "Publish both numbers",
        caption:
          "pass@1 and pass^4 side by side. The gap between them is the entire point of the project.",
      },
    ],
  },

  adrs: [
    {
      decision: "Publish pass^4 next to pass@1, always",
      alternatives: "Report pass@1 like nearly every other benchmark does.",
      why: "pass@1 45.8% and pass^4 8.0% describe the same configuration. Reporting only the first would describe it as roughly half-competent, when what it actually is is unreliable. For a finance agent, a system that is right once in two attempts and consistent one time in twelve is not half a solution. It is a different category of thing, and only the second number says so.",
    },
    {
      decision: "The adapter never receives the case, only a metered broker",
      alternatives: "Hand the adapter the case and trust it to report which tools it used.",
      why: "Self-reported tool paths cannot be audited, and budgets cannot be enforced against an agent that already has the data. Routing everything through a broker makes the budget a hard ceiling, makes the path an observation rather than a claim, and turns \"the agent only knows what it looked up\" into a structural fact. The adversarial grader cases include a lying adapter, and it is caught.",
    },
    {
      decision: "Write evals for the evals",
      alternatives: "Rely on the unit test suite, which is already at 273 tests.",
      why: "Twelve properties are declared in prose. Each one something that, if it broke, would make every published number wrong while the unit tests stayed green. CI checks them with no network. This caught a systematic answer leak where status == paid correlated with the right answer across the whole suite, which in the ambiguity traps made supposedly-undecidable cases decidable. The benchmark would have been punishing sound reasoning.",
    },
    {
      decision: "Benchmark configurations, not frameworks",
      alternatives:
        "Tune each framework's adapter and publish a league table, which would get far more attention.",
      why: "The reference adapters are deliberately simple canonical loops sharing one verbatim identical prompt, model, temperature and budget. A framework scoring higher here means that configuration scored higher. Anyone reading a result as a framework ranking is reading it wrong, and the manifest requirement is what makes that checkable rather than a disclaimer.",
    },
  ],

  evaluation: {
    summary:
      "The checks found four bugs during the build that would each have invalidated every published number while the unit tests stayed green. That is the argument for grading the grader.",
    rows: [
      { metric: "mock-flaky pass@1", result: "45.8%" },
      { metric: "mock-flaky pass^4", result: "8.0%", note: "the gap is the finding" },
      { metric: "Answer leak", result: "found and fixed", note: "status == paid correlated with the answer suite-wide" },
      { metric: "Budget realism", result: "found and fixed", note: "60,000 tokens against a measured ~93,000 for a competent run" },
      { metric: "Holdout commitment", result: "found and fixed", note: "gitignore pattern silently excluded the sealed hash" },
      { metric: "Score reproducibility", result: "byte-identical", note: "judge cache-hit counts removed from scores.json" },
    ],
  },

  shots: [
    {
      src: "/media/finagent-evals/leaderboard.png",
      width: 2880,
      height: 1880,
      alt: "The leaderboard: two configurations with pass@1 → pass^k columns, a consistency-gap badge on each row, and three disclosure banners above the table.",
      caption:
        "The board leads with the gap, not the rank. mock holds 94.0% across all four repetitions; mock-flaky drops 45.8% → 8.0%, and the −37.8% badge is the number a single-shot eval would never have shown you. The three banners above the table are not a footnote. Synthetic data, a release-candidate suite, and no live runs are stated before any score is.",
    },
    {
      src: "/media/finagent-evals/compare.png",
      width: 2880,
      height: 1880,
      alt: "The compare view, showing headline, pass@1, pass^4, consistency gap, MatchF1, EscalationScore and PathValidity side by side for two configurations.",
      caption:
        "The same two configurations metric by metric. pass@1 falls 48.2% while pass^4 falls 86.0%. The spread between those two numbers is the whole argument for running every case k times.",
    },
    {
      src: "/media/finagent-evals/cases.png",
      width: 2880,
      height: 1880,
      alt: "The case explorer filtered to tier-4 traps, with one case open showing its seed, trap family, and a table of bank transactions in four different date formats with no references.",
      caption:
        "A tier-4 trap, open. Every case here contains a transaction where escalating is the only correct action, and the answer stays behind a Reveal button so you see exactly what the agent sees. Note the dates in the transaction table. 26/03/2025, 04-16-25, 03 Mar 2025, 28.02.25, and the references reading none.",
    },
    {
      src: "/media/finagent-evals/methodology.png",
      width: 2880,
      height: 1880,
      alt: "The methodology page, explaining what the benchmark measures and justifying each weight in the headline formula.",
      caption:
        "Every weight in the formula is argued for on the page rather than asserted. pass^k takes the largest share because an agent that is right once in four is not 25% useful in a month-end close, it is unusable.",
    },
  ],

  limits: [
    "The suite is v1.0-rc, not v1.0. The 100 cases are generated and machine-checked but not human-audited. 23 cases are flagged in an audit queue with the specific doubt attached to each. It should not be cited as v1.0.",
    "There are no live runs. No API key was available, so every committed result comes from a deterministic offline adapter and is labelled mock everywhere it appears. The results show the suite is solvable and the graders discriminate; they measure no LLM.",
    "The headline pass@1/pass^4 gap therefore describes a deliberately flaky mock configuration, not a real model. It demonstrates that the harness can detect inconsistency. It does not tell you how inconsistent GPT or Claude are on this suite.",
    "Running both reference adapters live with the pinned judge is estimated at roughly $34, and that spend is the single thing standing between this and a benchmark that measures something real.",
    "The leaderboard SPA has now been built and rendered in a browser, and its four screens are captured above. What that does not change is anything on this list above it: the screens show real committed artifacts, but the runs behind them are still the offline adapter.",
  ],
};
