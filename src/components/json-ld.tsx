import type { CaseStudy } from "@/content/schema";
import { sameAs, site } from "@/lib/site";

/**
 * Structured data.
 *
 * The `sameAs` list is the load-bearing part: it is what ties this site to the
 * LinkedIn and GitHub profiles as one entity, and the entity graph is what answer
 * engines verify before they will cite a source (SPEC §8).
 */

function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Serialised server-side from typed objects — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: site.name,
        url: site.url,
        email: `mailto:${site.email}`,
        jobTitle: site.role,
        description: site.description,
        sameAs,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Karachi",
          addressCountry: "PK",
        },
        worksFor: { "@type": "Organization", name: "Voya AI" },
        /*
         * SPEC §8. Ordering is not cosmetic: `knowsAbout` reads as a ranked entity
         * list to an answer engine, and the first entries are what it associates the
         * person with. A finance-scoped entity graph cannot be returned for "who
         * builds reliable multi-agent systems" — the most valuable question here.
         * Finance stays in the list, deliberately not first.
         */
        knowsAbout: [
          "Multi-agent systems",
          "AI evaluation and benchmarking",
          "LLM observability",
          "AI governance and guardrails",
          "Model Context Protocol (MCP)",
          "Agent reliability engineering",
          "Retrieval-augmented generation",
          "Large language models",
          "Finance and accounting automation",
          "Technical curriculum and faculty leadership",
        ],
      }}
    />
  );
}

export function CaseStudyJsonLd({ study }: { study: CaseStudy }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: study.name,
        headline: study.outcome,
        abstract: study.tldr,
        url: `${site.url}/work/${study.slug}`,
        codeRepository: study.links.repo,
        programmingLanguage: study.stack,
        keywords: study.tags.join(", "),
        author: { "@type": "Person", name: site.name, url: site.url, sameAs },
      }}
    />
  );
}
