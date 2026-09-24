import { caseStudies, labs } from "@/content";
import { ASK_ENABLED } from "@/lib/features";
import { site } from "@/lib/site";

/**
 * /llms.txt — a map of this site for answer engines.
 *
 * Worth being precise about what this does: Google states it does not consume
 * llms.txt and that publishing one neither helps nor harms Search. This is for
 * ChatGPT, Claude and Perplexity, where the unit of success is a cited passage
 * rather than a ranked link. It costs one file, so it ships.
 */
export function GET() {
  const body = `# ${site.name}

> ${site.description}

${site.role} · ${site.location} · ${site.availability}

## Case studies

${caseStudies
  .map((c) => `- [${c.name}](${site.url}/work/${c.slug}): ${c.tldr}`)
  .join("\n\n")}

## Labs

${labs.map((l) => `- [${l.name}](${site.url}/labs/${l.slug}): ${l.tagline}. ${l.body[0]}`).join("\n\n")}

## Pages

- [AI for Finance & Accounting](${site.url}/finance): the domain hub. What finance demands of an agent, the systems built against those demands, and the open benchmark and MCP fixture released for anyone building in the field.
- [Demos](${site.url}/demos): walkthroughs and screens captured from the running systems.
- [Services](${site.url}/services): agent engineering, evaluation and reliability, finance automation advisory, and training for teams and individuals. Each one linked to a system on the site that demonstrates it.
- [About](${site.url}/about): how an accountant who closed the month became an engineer who builds agents for it.
- [Teaching](${site.url}/teaching): systems leadership. Head of Faculty at the Governor Sindh Initiative, leading ~100 instructors; trainer at PIAIC and Saylani.
- [Resume](${site.url}/resume): full experience, skills and education.
${ASK_ENABLED ? `- [Ask this portfolio](${site.url}/ask): a governed retrieval agent over this content, with its eval scores published.\n` : ""}- [Contact](${site.url}/contact): ${site.email}

## Notes

All project data on this site is synthetic. No real organisation's financial data appears anywhere.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
