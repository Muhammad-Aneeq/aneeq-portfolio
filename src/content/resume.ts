/**
 * Structured resume. Single source for /resume, the Person JSON-LD, and the corpus
 * the "Ask this portfolio" agent retrieves over — so those three can never disagree.
 */

export type Role = {
  title: string;
  org: string;
  orgNote?: string;
  start: string;
  end: string;
  mode: string;
  location: string;
  bullets: string[];
};

export const summary =
  "AI engineer with five years of industry experience, specialising in agentic AI: designing, building, evaluating and operating production multi-agent systems. I architect agent workflows in Python with LangChain, LangGraph, the OpenAI Agents SDK and MCP. Tool calling, retrieval, orchestration, context engineering, structured outputs. And back every system with evaluation pipelines, guardrails, human-in-the-loop controls and observability, so behaviour is measured rather than assumed. A full-stack TypeScript, React and Node.js background lets me carry an AI feature through the backend and into the product.";

/** The line the site leads with. It is the thing almost no competing AI engineer can say. */
/**
 * The angle — SPEC §5.1 Row 3, rewritten to the T-shape arc.
 *
 * Three movements, in this order, and the order is the whole point:
 *   1. the engineering standard (domain-neutral, and the identity)
 *   2. proven in finance (where the ex-accountant fact belongs — as the reason the
 *      proof is credible, not as the identity)
 *   3. applied wherever agents must be trusted (it must end pointing outward)
 *
 * Passes both halves of the two-audience test: a non-finance reader meets the
 * engineering first, a fintech reader still gets "he has actually closed a month".
 */
export const angleParts = {
  standard:
    "Most AI projects stall in the same place. The demo works, and nobody can say whether it will still work next week, on different data, in front of a customer. Closing that gap is evaluation, observability, guardrails and human oversight, and it is most of what I actually do.",
  proof:
    "I came up through full-stack TypeScript and React before Python, LangGraph and MCP, which means I can carry an AI feature from the agent graph through the API and into the screen someone uses. An AI feature is not finished when the model responds. It is finished when a person can see what it did and disagree with it.",
  transfer:
    "I have built twelve of these systems and taught the practice to more than 5,000 engineers. The domain I know best is finance, because that is where being wrong costs the most.",
} as const;

/** Flat form, for the retrieval corpus and anywhere prose is needed without markup. */
export const angle = `${angleParts.standard} ${angleParts.proof} ${angleParts.transfer}`;

export const experience: Role[] = [
  {
    title: "AI Engineer",
    org: "Voya AI",
    start: "Dec 2025",
    end: "Present",
    mode: "Full-time · Remote",
    location: "Sarasota, Florida, USA",
    bullets: [
      "Design, build and operate production multi-agent systems in Python with LangChain and LangGraph, covering tool calling, retrieval, orchestration, context management and structured outputs",
      "Architect multi-agent systems of 5 to 6 specialised agents that coordinate, share context and delegate end-to-end tasks, cutting manual intervention on operational workflows by ~30%",
      "Build integrations between agents and enterprise systems. External APIs, databases, third-party services and vector stores, sustaining 80%+ tool-selection accuracy in production",
      "Implement evaluation pipelines measuring output quality, agent behaviour and regressions, with curated eval datasets, automated evaluators and LLM-as-judge scoring gating every prompt and model change",
      "Build observability, tracing and debugging for AI systems with LangSmith and Langfuse, diagnosing failures across prompts, model behaviour and external integrations",
      "Apply secure engineering practice to agent systems: authentication and authorization, RBAC, secrets management, audit logging and secure tool execution, with guardrails and human-in-the-loop controls on actions that carry real-world consequences",
      "Reason about reliability, latency and cost as first-class constraints, profiling agent workflows and managing tradeoffs across model providers",
      "Ship via Docker and GitHub Actions CI/CD to AWS",
    ],
  },
  {
    title: "Agentic AI Engineer & Trainer",
    org: "PIAIC",
    orgNote: "Presidential Initiative for AI and Computing",
    start: "Aug 2025",
    end: "Present",
    mode: "Part-time · Hybrid",
    location: "Pakistan",
    bullets: [
      "Engineer AI-native products including an accounting platform and e-commerce systems using the OpenAI Agents SDK, CrewAI and MCP, applying spec-driven and test-driven development to keep agentic systems predictable",
      "Build RAG pipelines over document and structured data using embeddings and vector databases for retrieval-grounded analysis and content generation",
      "Ship reference implementations adopted across national programme projects, and mentor engineers in agent development and evaluation practice",
    ],
  },
  {
    title: "Full-Stack Developer (AI Focused)",
    org: "Celeritas Digital",
    start: "Sep 2024",
    end: "Jul 2025",
    mode: "Full-time · Hybrid",
    location: "Karachi, Pakistan",
    bullets: [
      "Integrated AI-powered features into existing products, strengthening core functionality and driving a ~15% improvement in user engagement",
      "Proposed and prototyped new generative-AI capabilities, several of which were adopted into the product roadmap",
      "Shipped on schedule in a fast-moving product team, working across frontend and backend alongside product, design and QA",
    ],
  },
  {
    title: "Software Engineer",
    org: "Avialdo Solutions",
    start: "Jun 2023",
    end: "Sep 2024",
    mode: "Full-time · Hybrid",
    location: "Karachi, Pakistan",
    bullets: [
      "Owned delivery of critical features end to end, from technical design through deployment, improving team velocity and response times",
      "Mentored junior developers through code review and pair programming, set code-quality standards, and covered team-lead responsibilities when needed",
    ],
  },
  {
    title: "MERN Stack Developer",
    org: "SoftApps LLC",
    start: "Dec 2022",
    end: "Jun 2023",
    mode: "Full-time · Onsite",
    location: "Karachi, Pakistan",
    bullets: [
      "Built web and cross-platform applications with React, React Native, Node.js, Express and MongoDB, delivering features from concept to production",
      "Designed and optimised RESTful APIs and event-driven services with Kafka for performance and scalability as traffic grew",
    ],
  },
  {
    title: "Web Developer Intern",
    org: "RIKSOF",
    start: "Sep 2022",
    end: "Nov 2022",
    mode: "Full-time · Onsite",
    location: "Karachi, Pakistan",
    bullets: ["Contributed to client projects, working hands-on with real production codebases"],
  },
  {
    title: "Accounts Assistant",
    org: "Daily Dubai Restaurant",
    start: "Nov 2020",
    end: "Feb 2022",
    mode: "Full-time",
    location: "Karachi, Pakistan",
    bullets: [
      "Where the career began: bookkeeping, account reconciliation, balance-sheet preparation and the core financial tasks that keep a business running",
      "This is where the repetitive, detail-heavy work that finance teams carry every day became obvious, the exact problems now solved with agents",
    ],
  },
];

export const teaching: Role[] = [
  {
    title: "Head of Faculty & Lead Trainer",
    org: "GIAIC",
    orgNote: "Governor Sindh Initiative for AI and Computing",
    start: "Feb 2024",
    end: "Present",
    mode: "Part-time",
    location: "Karachi, Pakistan",
    bullets: [
      "Lead a faculty of ~100 instructors across multiple cohorts, setting teaching standards and ensuring consistent delivery at national scale",
      "Trained over 5,000 engineers in agentic AI through Pakistan's national AI programmes",
      "Own end-to-end academic quality assurance: class synchronisation, content fidelity, syllabus adherence and student progress tracking",
      "Mentor both students and instructors, collaborating with industry experts to keep courses aligned with real-world demands",
    ],
  },
  {
    /*
     * PIAIC also appears under `experience`, where the bullets are the engineering
     * half of the role. It belongs in both lists because it genuinely is both, and
     * the teaching page was previously showing only two of the three institutions
     * the copy above it claims.
     */
    title: "Agentic AI Trainer",
    org: "PIAIC",
    orgNote: "Presidential Initiative for AI and Computing",
    start: "Aug 2025",
    end: "Present",
    mode: "Part-time · Hybrid",
    location: "Pakistan",
    bullets: [
      "Teach agentic AI across national cohorts: agent architectures, tool and function calling, retrieval, and the evaluation practice that tells a student whether their agent actually works",
      "Ship reference implementations that are adopted across national programme projects, so the teaching material and the production patterns stay the same thing",
      "Mentor engineers through the step most courses skip, moving from an agent that answers to an agent that can be trusted with a real task",
    ],
  },
  {
    title: "Lead AI Trainer",
    org: "Saylani Mass IT Training (SMIT)",
    start: "Aug 2026",
    end: "Present",
    mode: "Part-time",
    location: "Karachi, Pakistan",
    bullets: [
      "Design and deliver hands-on agentic AI training covering multi-agent architectures, tool calling and agent evaluation",
      "Bridge classroom AI and production AI: students build, break, test and ship real agentic workflows rather than following demos",
    ],
  },
];

/**
 * `plain` is the cluster explained without jargon, for the reader who is hiring an
 * AI engineer without being one. The chips underneath stay technical, because the
 * engineer who reviews this page afterwards needs them. Both audiences read the same
 * card; neither is asked to decode the other's version.
 */
export type SkillCluster = { title: string; plain: string; items: string[] };

export const skills: SkillCluster[] = [
  {
    title: "AI system design",
    plain:
      "Designing the AI itself: what it is allowed to do, when it must ask a person first, and how it behaves when it is unsure.",
    items: [
      "Tool and function calling",
      "Agent orchestration",
      "Multi-agent systems",
      "Context engineering",
      "Structured outputs",
      "Agent memory",
      "Guardrails",
      "Human-in-the-loop controls",
    ],
  },
  {
    title: "Agent & LLM frameworks",
    plain:
      "The tools I build with. Software that lets an AI use your systems rather than just answer questions about them.",
    items: [
      "LangChain",
      "LangGraph",
      "CrewAI",
      "OpenAI Agents SDK",
      "MCP",
      "OpenAI API",
      "AWS Bedrock",
      "n8n",
    ],
  },
  {
    title: "Retrieval",
    plain:
      "Making AI answer from your documents and data instead of from guesswork, with a link back to the source for every claim.",
    items: [
      "RAG architectures",
      "Embeddings",
      "Semantic & vector search",
      "Chunking and indexing",
      "pgvector",
      "Pinecone",
      "Qdrant",
      "Chroma",
    ],
  },
  {
    title: "Evaluation & observability",
    plain:
      "Measuring whether the AI is actually right, catching it when it stops being right, and showing you the evidence either way.",
    items: [
      "Eval pipelines",
      "LLM-as-judge",
      "Automated evaluators",
      "Eval dataset curation",
      "Regression tracking",
      "LangSmith",
      "Langfuse",
      "Tracing & debugging",
    ],
  },
  {
    title: "Security & governance",
    plain:
      "Controlling who can see what, keeping a record of every action, and making sure the AI cannot do anything it was not authorised to.",
    items: [
      "AuthN / AuthZ",
      "RBAC",
      "Secrets management",
      "Audit logging",
      "Secure tool execution",
      "Policy enforcement",
      "Data handling & privacy",
    ],
  },
  {
    title: "Languages & backend",
    plain:
      "Building the software around the AI: the APIs, the services and the databases that turn a model into a working product.",
    items: [
      "Python",
      "TypeScript",
      "FastAPI",
      "Django",
      "Node.js",
      "NestJS",
      "REST",
      "GraphQL",
      "Microservices",
      "SQL",
    ],
  },
  {
    title: "Data & infrastructure",
    plain:
      "Running it reliably in the cloud, so it keeps working after launch day.",
    items: [
      "PostgreSQL",
      "MongoDB",
      "Kafka",
      "Docker",
      "AWS",
      "GCP",
      "Azure AI",
      "GitHub Actions",
      "TDD",
    ],
  },
];

export type Credential = { title: string; org: string; period: string; note?: string };

export const education: Credential[] = [
  {
    title: "BS Computer Science",
    org: "Virtual University of Pakistan",
    period: "Apr 2023 to Dec 2026 (expected)",
  },
  {
    title: "Certified Cloud Applied Agentic AI Engineer",
    org: "PIAIC",
    period: "Oct 2022 to Sep 2024",
    note: "Agentic AI, generative AI, LLMs, microservices, TDD, event-driven architecture",
  },
  {
    title: "AWS Developer Associate (training programme)",
    org: "SMIT",
    period: "Aug 2024 to Jan 2025",
  },
  { title: "MERN Stack Development", org: "Jawan Pakistan", period: "Apr 2022 to Jan 2023" },
  {
    title: "Microsoft AI-103 · Azure AI Engineer",
    org: "In progress",
    period: "Current",
  },
];

