import { site } from "@/lib/site";

/**
 * The questions a recruiter or client asks first, answered before they have to.
 *
 * Every answer restates something the site already says elsewhere (the resume, /about,
 * /services, /teaching, the project limits), so the FAQ adds no new claim. Native
 * <details>, so it opens without JavaScript and is keyboard and screen-reader friendly
 * by default. Also emitted as FAQPage structured data for search and AI answers.
 */
const FAQ = [
  {
    q: "Are you available for new work?",
    a: `Yes. ${site.availability}, and to project work in the areas listed on the services page: agent engineering, evaluation and reliability, finance automation, and training. The form below or email is the quickest route.`,
  },
  {
    q: "Where are you based, and which time zone do you work in?",
    a: `I am based in ${site.location} and work remotely, in any time zone: my hours follow the team I am working with.`,
  },
  {
    q: "What do you specialise in?",
    a: "Agentic AI: designing, building, evaluating and operating multi-agent systems. That covers tool calling, retrieval, orchestration, context engineering and structured outputs, with evaluation pipelines, guardrails, human-in-the-loop controls and observability, so a system's behaviour is measured rather than assumed.",
  },
  {
    q: "What makes your background different?",
    a: "I worked in accounting before I moved into software, reconciling bank feeds against the ledger and closing the month. So I know where a plausible answer becomes a costly mistake, and I design agents around how finance teams actually work, with a person signing off where it matters.",
  },
  {
    q: "Do you only work on finance?",
    a: "No. Finance is my deepest domain, and its constraints are the strictest, but what I build transfers to any work that runs on documents, approvals and decisions: human gates at the risk boundaries, answers grounded in evidence, and evaluation that survives repetition.",
  },
  {
    q: "What is your stack?",
    a: "Python with LangGraph, LangChain, the OpenAI Agents SDK and MCP for the agents; TypeScript, React and Node.js for the product around them; and evaluation pipelines, guardrails, human-in-the-loop controls and observability on every system.",
  },
  {
    q: "Do you also train teams?",
    a: "Yes. I lead a faculty of around 100 instructors at the Governor Sindh Initiative and have trained thousands of engineers across Pakistan's national AI programmes. Training for teams and individuals is on the services page.",
  },
];

export function Faq({ className }: { className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <section className={className ? `faq ${className}` : "faq"} aria-labelledby="faq-title">
      <div className="portfolio-section-heading">
        <div>
          <p className="section-context">Before you ask</p>
          <h2 id="faq-title">Questions people ask first.</h2>
        </div>
      </div>
      <div className="faq-list" data-stagger>
        {FAQ.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary>
              <span>{q}</span>
              <span className="faq-icon" aria-hidden />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
