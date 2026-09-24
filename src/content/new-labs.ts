import type { LabInput } from "@/content/schema";

// Source evidence and repository discrepancies are recorded in docs/ROUND-2.md.
export const newLabs: LabInput[] = [
  {
    slug: "revledger", name: "RevLedger", order: 8, domain: "finance",
    dataNote: "The repository tests synthetic fixtures and provided sample CSVs. The sample's provenance is not documented as synthetic.",
    tagline: "Tool-grounded answers over a deterministic subscription revenue engine",
    capabilities: ["agents", "evals"],
    stack: ["Python", "FastAPI", "pandas", "LangChain", "React", "Docker"],
    // `revledger`, not `earlybird`. The working folder is called earlybird and that
    // repository is private, so the link a visitor clicked resolved to a 404. This is
    // the public mirror of the same project.
    links: { repo: "https://github.com/Muhammad-Aneeq/revledger", repoPublic: true }, span: 2, rows: 1,
    walkthrough: {
      src: "/media/revledger/walkthrough.mp4",
      poster: "/media/revledger/walkthrough.jpg",
      seconds: 102,
      caption:
        "The agent refuses the first question because no data is loaded, then the sample goes in and the same question is answered from the computed schedule rather than from the model.",
    },
    loop: {
      webm: "/media/revledger/loop.webm",
      mp4: "/media/revledger/loop.mp4",
      poster: "/media/revledger/loop.jpg",
    },
    body: [
      "Prepaid class packages bring cash in before the service is delivered. RevLedger reads sales and attendance CSVs, then computes journal entries, a deferred-revenue roll-forward, breakage and a P&L summary. A React interface exposes the reports and CSV or JSON downloads.",
      "The accounting engine uses Decimal amounts and eight exact validation checks, including global and per-transaction balance, customer conservation and over-consumption. These checks establish internal consistency under the encoded assumptions; they are not independent certification of accounting-standard compliance.",
      "A LangChain agent has six focused tools over the computed results. Python calculates the figures; the model selects tools and explains their output. The chat records the tools used and supports conversation memory. Processing and reports work without an API key; live chat requires one.",
    ],
    limits: [
      "The sample has no explicit expiry dates. Unused credits are treated as expiring on 31 May 2025, the end of the data period. This is a documented modelling assumption, not a general revenue-recognition policy.",
      "The latest processed result lives in memory. This is a built accounting prototype, not a deployed multi-tenant accounting service. Passing balance checks does not establish the accuracy of every generated chat answer.",
    ],
  },
  {
    slug: "invoiceaudit", name: "InvoiceAudit", order: 9, domain: "finance",
    tagline: "Vision extraction checked by arithmetic, with bounded repair and a second check on the repair itself",
    capabilities: ["agents", "evals", "governance"],
    stack: ["Python", "Pydantic", "OpenAI", "FastAPI", "React", "pytest"],
    links: { repo: "https://github.com/Muhammad-Aneeq/InvoiceAudit", repoPublic: true }, span: 2, rows: 1,
    walkthrough: {
      src: "/media/invoiceaudit/walkthrough.mp4",
      poster: "/media/invoiceaudit/walkthrough.jpg",
      seconds: 94,
      caption:
        "An invoice where the extraction is plausible and wrong. The arithmetic catches three violations, the repair loop runs, and a second check watches the repair for gaming the sums.",
    },
    loop: {
      webm: "/media/invoiceaudit/loop.webm",
      mp4: "/media/invoiceaudit/loop.mp4",
      poster: "/media/invoiceaudit/loop.jpg",
    },
    body: [
      "InvoiceAudit treats a model extraction as an untrusted proposal. Deterministic arithmetic checks the record, quantified failures guide a bounded repair loop, and the router sends uncertain documents for human review. The web interface shows the source document beside violations and the repair trace.",
      "A separate detector compares the original and repaired records. It flags aggregate-only changes that can satisfy arithmetic without evidence of a corrected source reading. The loop is plain Python, with iteration and token limits plus a no-progress stop; there is no second model acting as the arithmetic judge.",
      "The checked-in evaluation report covers 32 synthetic documents using gpt-5.4-nano-2026-03-17. Document accuracy rises from 78.1% to 81.2%, but auto-accept precision falls from 83.3% to 82.3%. The report marks the precision criterion as failed. Better document accuracy is not evidence that unattended acceptance became safer.",
    ],
    limits: [
      "The README describes a different model run with perfect extraction and no useful repair evidence. The current checked-in report records the weaker-model run above. These are different evaluations and must not be combined into one result.",
      "All evaluation documents are synthetic. Arithmetic cannot catch a consistent but wrong extraction. The repair detector can flag legitimate corrections and misses some changes that alter line items and aggregates together.",
    ],
  },
  {
    slug: "payment-reconciliation", name: "Payment Reconciliation", order: 10, domain: "finance",
    tagline: "Deterministic payout decomposition and matching, with an auditable queue for human review",
    capabilities: ["agents", "evals", "governance"],
    stack: ["Python", "FastAPI", "PostgreSQL", "LangGraph", "React", "pytest"],
    links: {}, span: 2, rows: 1,
    body: [
      "A net Stripe deposit hides revenue, fees, refunds, disputes and FX. This preparation agent decomposes payouts into ledger entries, matches them to bank deposits, and puts unresolved discrepancies into a React exception queue. A person remains the checker; it does not reconcile a ledger vendor account directly.",
      "Payout arithmetic and ledger posting are deterministic. CSV and OFX ingestion, exact and subset-sum matching, a double-entry ledger and separate decision/review audit records support the workflow. Ledger and audit histories are append-only with hash chains, and money uses Decimal rather than float.",
      "The repository documents 167 passing tests and a 600-instance synthetic scenario catalogue. Its L1 report records 100% precision and 81.18% recall against 510 ground-truth pairs. Those are fixture results, not client outcomes or a guarantee on live bank data.",
    ],
    limits: [
      "Live Stripe ingestion and real-payout replay are blocked on a Stripe test-mode key. QBO write-back and divergence detection require developer-app credentials and a sandbox company.",
      "Explanation, classification and correction drafting currently use FakeLLMClient, explicitly labelled as not a real model. The live Anthropic client is an unimplemented stub. These parts demonstrate graph plumbing, not measured language-model reasoning.",
      "The synthetic scenario catalogue has not been reviewed by a working bookkeeper or accountant. Some conformal risk bands are not certifiable at the available calibration size. There is no claim of a deployed client integration.",
    ],
  },
];
