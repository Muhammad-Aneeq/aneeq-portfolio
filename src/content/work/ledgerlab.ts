import type { CaseStudyInput } from "@/content/schema";

export const ledgerlab: CaseStudyInput = {
  slug: "ledgerlab",
  name: "LedgerLab",
  title: "A messy world for agents, as MCP fixture",
  outcome:
    "An open MCP server that hands any agent a realistically messy world, applied to bank and ledger reconciliation",
  whyFlagship:
    "MCP, open source and test rigour together: 7 tools, FastMCP 3, 399 tests, £0 to run. The messy-world-as-fixture idea is domain-neutral; the world it ships happens to be a bank.",
  domain: "finance",
  order: 5,

  tldr:
    "An open MCP server that hands any client a realistically messy synthetic bank and ledger: mixed date formats, missing references, aliased payee names, duplicate payments. Seven tools, no ground truth reachable through any of them, and a live viewer that streams every tool call as your agent works.",

  tags: ["MCP", "open source", "synthetic data", "developer tooling"],
  stack: ["Python", "FastMCP 3", "FastAPI", "SQLite", "WebSockets", "React", "Docker"],
  // Verified public against the GitHub API, unlike most of the repo URLs in this
  // content, which point at repositories that have not been published yet.
  links: { repo: "https://github.com/Muhammad-Aneeq/ledgerlab", repoPublic: true },

  /*
    Loop only, no walkthrough. The source recording is 7m47s of a scrolling tool-call
    log — shipping it whole would make it the largest asset on the site by a wide
    margin, for something almost nobody watches to the end. The loop shows what the
    live feed looks like; the stills below carry the detail.
  */
  loop: {
    webm: "/media/ledgerlab/loop.webm",
    mp4: "/media/ledgerlab/loop.mp4",
    poster: "/media/ledgerlab/loop.jpg",
  },

  metrics: [
    {
      value: 399,
      label: "tests, green",
      note: "covering determinism, both transports, and 20 concurrent sessions.",
    },
    { value: 7, label: "MCP tools, fenced by a test that fails CI if an eighth appears" },
    { value: 3, label: "messiness profiles, byte-identical from profile and seed" },
    { value: 0, prefix: "£", label: "to run, it calls no LLMs at all" },
  ],

  problem: [
    "Finance AI cannot be demoed on real data, and the synthetic datasets that exist are toy-clean: every reference present, every name spelled the same way, every payment matching an invoice to the penny. Agents that look brilliant on that data fall over on the first real bank feed.",
    "LedgerLab generates books that are wrong in the ways real books are actually wrong, hands them to any MCP client in about a minute, and lets you watch the agent work. The messiness is not invented. It is the set of things that went wrong in books an ex-accountant used to close.",
  ],

  transfers: [
    "The idea is a deterministic, seeded, deliberately messy fixture world served over MCP, with the answer key held where no tool can reach it. Nothing about that is financial. The same server shape would give a support agent a messy ticket history, or a clinical agent a set of notes with inconsistent names and missing referrals.",
    "Withholding the joins that would make the task a string comparison is the reusable design move. Any agent benchmark that hands over a clean foreign key is measuring lookup rather than reasoning, whichever domain it is dressed in.",
    "Errors written as recoverable instructions. What went wrong, what is true, what to call next. Are a general MCP authoring practice, and the live tool-call feed showing payload size per call is how any team makes context cost visible.",
  ],

  constraints: [
    "Same profile plus same seed must produce a byte-identical world on any machine, every time. The dataset hashes are committed and asserted in CI.",
    "No tool may reach the answer key. This is checked three ways: by AST, by published schema, and by inspecting live responses.",
    "Seven tools, not eight. Tool bloat measurably degrades tool selection, so the count is enforced by a test.",
    "Results are paginated and capped at 50 rows. Rejected, not silently truncated. Because a payload is what a tool call costs an agent's context window.",
  ],

  architecture: {
    summary:
      "The MCP server is mounted inside the viewer's FastAPI process, which is what makes the event bus genuinely in-process: a tool call reaches the browser without a broker, a queue or a second service. Sessions are one SQLite world each, seeded on creation by a stdlib-only generator that also emits an answer key no tool can read.",
    trace: [
      {
        id: "seed",
        kind: "plan",
        label: "Seed a world",
        caption:
          "A profile and an integer seed produce a bank, a ledger, counterparties, invoices and notes, plus an answer key held out of reach.",
      },
      {
        id: "connect",
        kind: "tool",
        label: "Any MCP client connects",
        caption:
          "stdio for Claude Desktop, Streamable HTTP for LangGraph and everything else. Both tested end to end against real servers.",
      },
      {
        id: "search",
        kind: "route",
        label: "The agent has to work",
        caption:
          "A bank transaction carries a payee name, not a foreign key. Resolving it is a tool call, which is what stops the alias messiness being cosmetic.",
      },
      {
        id: "error",
        kind: "policy",
        label: "Errors are part of the product",
        caption:
          "Each one says what went wrong, what is actually true, and what to call next. So a wrong guess becomes a recoverable step rather than a dead end.",
      },
      {
        id: "orphan",
        kind: "halt",
        label: "Some payments have no explanation",
        caption:
          "Flagging one unknown is the correct answer. This is what stops an agent scoring well by confidently matching everything to something.",
      },
      {
        id: "feed",
        kind: "commit",
        label: "Every call streams to the viewer",
        caption:
          "Tool badge, argument preview, latency, payload size. Pausing buffers rather than disconnecting, so nothing is lost.",
      },
      {
        id: "grade",
        kind: "audit",
        label: "Grade what is in the session",
        caption:
          "The acceptance gate grades what actually ended up in the database, not what the client claims it did.",
      },
    ],
  },

  adrs: [
    {
      decision: "Withhold the joins that would make reconciliation a string comparison",
      alternatives:
        "Put counterparty_id on bank transactions and a transaction id on GL entries, as a clean schema would.",
      why: "A bank feed gives you a name, not a foreign key, and the GL holds what was booked while the bank side is unposted. Adding either join would make propose_match solvable by string equality and the acceptance test meaningless. The omissions are the product; they are documented as design decisions rather than left to look like bugs.",
    },
    {
      decision: "Cap results at 50 rows and reject rather than truncate",
      alternatives: "Return everything, or truncate silently with a note in the response.",
      why: "Silent truncation gives an agent a wrong answer that looks complete, which is the worst available failure. Rejecting forces pagination to be handled. Payload size is shown on every row of the live feed for the same reason. It is what a tool call costs an agent's context window, and it is the reason the cap exists at all.",
    },
    {
      decision: "Make the acceptance gate's headroom problem public rather than tightening the floor",
      alternatives:
        "Raise the thresholds to something that looks discriminating, or quietly leave the 70% floor unexplained.",
      why: "A roughly 200-line deterministic bookkeeping heuristic scores 100% coverage and 100% precision on all three profiles. So the gate proves an agent can complete this job reproducibly with zero API misuse. A genuine regression test. But it does not distinguish a good agent from a great one. Presenting a 70% floor as if it were tight would be dishonest, and making the world genuinely hard is the first item on the roadmap instead.",
    },
    {
      decision: "Mount the MCP server inside the viewer process",
      alternatives: "Run the MCP server and the viewer API as two services with a message broker between them.",
      why: "The event bus is the feature. Watching tool calls arrive live is most of the value. In-process means a call reaches the browser with no broker, no queue and no second service to run, which keeps the whole thing to one uvicorn process and a make target. Fan-out to two viewers, per-session isolation and backfill for a late joiner are all tested.",
    },
  ],

  evaluation: {
    summary:
      "The acceptance gate runs a reference LangGraph agent against a real server over Streamable HTTP and grades what ended up in the session rather than what the client reported. It passes on all three profiles, and the honest reading of that is in the limits below.",
    rows: [
      { metric: "clean profile", result: "100% coverage · 100% precision", note: "0 tool errors" },
      { metric: "realistic profile", result: "100% / 100%", note: "cause accuracy 23/23" },
      { metric: "nightmare profile", result: "100% / 100%", note: "cause accuracy 66/66" },
      { metric: "Determinism", result: "hashes identical", note: "across interpreters, against a patched clock, against committed hashes" },
      { metric: "Concurrency", result: "20 sessions", note: "reads and writes, no cross-session bleed" },
      { metric: "Tests", result: "398 passed, 1 skipped", note: "the skip is the live-LLM test" },
    ],
  },

  shots: [
    {
      src: "/media/ledgerlab/agent-work.png",
      width: 1440,
      height: 940,
      alt: "The session detail screen: 64 transactions, 61 matches proposed, 24 exceptions flagged, and a table of the agent's proposed matches with its stated reason for each.",
      caption:
        "One reference-agent run against a seeded world. Note the line under the progress bar: it is progress, not accuracy. The tools never tell an agent whether a match is correct. Grading happens against a ground-truth table no tool can reach, and the answer key is viewer-only.",
    },
    {
      src: "/media/ledgerlab/live-feed.png",
      width: 1440,
      height: 940,
      alt: "The live tool-call feed: each row shows the tool name, its arguments, latency in milliseconds and payload size in bytes.",
      caption:
        "Every tool call as it happens. Payload size is on each row because that is what the call costs the agent's context window. Which is the reason results are paginated and capped at 50 rows in the first place.",
    },
    {
      src: "/media/ledgerlab/world.png",
      width: 1440,
      height: 940,
      alt: "The world browser, showing counts per entity: bank feed, general ledger, invoices, counterparties, notes and chart of accounts.",
      caption:
        "The generated world, entity by entity, with the messiness annotated. Aliased payees, missing references, chaotic date formats, so you can see what the agent is actually up against.",
    },
    {
      src: "/media/ledgerlab/sessions.png",
      width: 1440,
      height: 940,
      alt: "The sessions screen: a card per world showing profile, seed, transaction count and the dataset hash.",
      caption:
        "A card per world. The dataset hash is on the card because same profile plus same seed must produce a byte-identical world, here it matches the value committed in CI.",
    },
  ],

  connect: {
    summary:
      "LedgerLab is an MCP server, so the useful demo is not a screenshot. It is pointing your own client at it and watching your agent work a messy set of books. Seven tools, no key, no account, read-only against a seeded synthetic bank.",
    steps: [
      {
        label: "Claude Desktop, or any client over Streamable HTTP",
        code: `{
  "mcpServers": {
    "ledgerlab": { "type": "http", "url": "<LEDGERLAB_URL>/mcp" }
  }
}`,
        note: "Restart the client, then ask it to reconcile the 2025-Q1 bank statement.",
      },
      {
        label: "LangGraph, or anything using the MCP adapters",
        code: `client = MultiServerMCPClient({
    "ledgerlab": {"transport": "streamable_http", "url": "<LEDGERLAB_URL>/mcp"},
}, handle_tool_errors=False)
tools = await client.get_tools()   # all 7`,
        note: "handle_tool_errors=False matters: the errors are part of the product, and your agent should be able to tell one from an answer.",
      },
      {
        label: "Just list the tools",
        code: `npx -y @modelcontextprotocol/inspector --cli <LEDGERLAB_URL>/mcp \\
  --transport http --method tools/list`,
      },
    ],
  },

  limits: [
    "The acceptance gate has no headroom. A deterministic heuristic scores 100% on every profile, so the gate is a regression test rather than a measure of agent quality. It cannot tell a good agent from a great one, and the thresholds should not be read as tight.",
    "The viewer's four screens have now been rendered and captured (above) and the acceptance gate re-run end to end. 100% coverage, 100% precision, 0 tool errors, 23/23 cause accuracy, against the committed dataset hash. What is still unverified is narrower than it was: the demo-mode type scale, autoscroll behaviour under sustained load, and how the feed reads on a projector.",
    "The live LLM path is implemented and unit-tested with a stub but has never run against a real model, so nothing here is evidence about how a real model handles these tool docstrings.",
    "docker compose was validated as configuration, not built and run end to end.",
    "There is no hosted public instance. Self-host-first is deliberate. A public instance invites abuse and would need auth and rate limits first. But it does mean \"connect in one minute\" still requires a clone.",
  ],
};
