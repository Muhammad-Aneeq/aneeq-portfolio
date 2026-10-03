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
    a: `${site.location}, on Pakistan Standard Time (UTC+5). I work remotely, building for teams everywhere.`,
  },
  {
    q: "Have these systems run in production at a client?",
    a: "Not these ones. The projects on this site are built and evaluated on synthetic data, and none is yet in production at a client; each case study says what its system cannot do. My production work is in my current role at Voya AI, where I design, build and operate production multi-agent systems.",
  },
  {
    q: "Why is all the project data synthetic?",
    a: "Real books belong to real companies. Every project runs on generated companies, counterparties, invoices and bank transactions from a seeded data engine, so the numbers can be published and rerun. None of it corresponds to a real organisation, and nothing is ever posted to a real system.",
  },
  {
    q: "Do you only work on finance?",
    a: "No. Finance is my deepest domain because I worked in accounting before I automated it, and its constraints are the strictest. The same patterns (human gates at risk boundaries, grounding, evaluation that survives repetition) transfer, and each case study sets out where: claims, procurement approval, clinical decision support, moderation and legal review.",
  },
  {
    q: "What is your stack?",
    a: "Python with LangGraph, LangChain, the OpenAI Agents SDK and MCP for the agents; TypeScript, React and Node.js for the product around them; and evaluation pipelines, guardrails, human-in-the-loop controls and observability on every system.",
  },
  {
    q: "Can I see the code?",
    a: "Yes, wherever it is public: each project page links its repository, and the walkthroughs are recorded from the running systems, unedited.",
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
