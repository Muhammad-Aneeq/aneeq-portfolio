import { caseStudies, labs } from "@/content";
import { angle, education, experience, summary, teaching } from "@/content/resume";

/**
 * The retrieval corpus, assembled from the same typed content the pages render.
 * There is no separate ingest step and no copy to drift — if a case study changes,
 * the agent's answer changes with it on the next build.
 */

export type Chunk = {
  id: string;
  /** Human-readable source label shown on the citation chip. */
  label: string;
  /** Where clicking the chip goes. */
  href: string;
  text: string;
};

function chunk(id: string, label: string, href: string, text: string): Chunk {
  return { id, label, href, text: text.trim() };
}

function buildCorpus(): Chunk[] {
  const chunks: Chunk[] = [];

  // ---- resume + positioning -------------------------------------------------
  chunks.push(chunk("resume/summary", "resume · summary", "/resume", summary));
  chunks.push(chunk("about/angle", "about · the angle", "/about", angle));

  for (const role of [...experience, ...teaching]) {
    const href = teaching.includes(role) ? "/teaching" : "/resume";
    chunks.push(
      chunk(
        `role/${role.org}`,
        `${role.org} · ${role.title}`,
        href,
        `${role.title} at ${role.org}${role.orgNote ? ` (${role.orgNote})` : ""}, ${role.start} to ${role.end}, ${role.mode}, ${role.location}. ${role.bullets.join(" ")}`,
      ),
    );
  }

  chunks.push(
    chunk(
      "resume/education",
      "resume · education",
      "/resume",
      education.map((e) => `${e.title}, ${e.org}, ${e.period}. ${e.note ?? ""}`).join(" "),
    ),
  );

  // ---- case studies ---------------------------------------------------------
  for (const cs of caseStudies) {
    const base = `/work/${cs.slug}`;

    chunks.push(
      chunk(
        `${cs.slug}/overview`,
        `${cs.name} · overview`,
        base,
        `${cs.name}. ${cs.outcome}. ${cs.tldr} Tags: ${cs.tags.join(", ")}. Stack: ${cs.stack.join(", ")}.`,
      ),
    );

    chunks.push(
      chunk(
        `${cs.slug}/problem`,
        `${cs.name} · problem`,
        base,
        `${cs.name} problem and constraints. ${cs.problem.join(" ")} Constraints: ${cs.constraints.join(" ")}`,
      ),
    );

    /*
     * Its own chunk rather than appended to the problem chunk. "Does this transfer
     * outside finance?" is the question a non-finance hiring manager actually asks,
     * and burying the answer inside a passage about reconciliation would make it
     * retrievable only by someone already asking in finance vocabulary — which is
     * the retrieval-layer version of the positioning bug this pass exists to fix.
     */
    chunks.push(
      chunk(
        `${cs.slug}/transfers`,
        `${cs.name} · where else this applies`,
        base,
        `Where else the ${cs.name} pattern applies, outside finance and accounting: other domains, industries and use cases this architecture transfers to. ${cs.transfers.join(" ")}`,
      ),
    );

    chunks.push(
      chunk(
        `${cs.slug}/architecture`,
        `${cs.name} · architecture`,
        base,
        `${cs.name} architecture. ${cs.architecture.summary} ${cs.architecture.trace
          .map((s) => `${s.label}: ${s.caption}`)
          .join(" ")}`,
      ),
    );

    // One chunk per ADR — decisions are the most-asked-about part and deserve
    // to be retrievable individually rather than buried in a merged blob.
    cs.adrs.forEach((adr, i) => {
      chunks.push(
        chunk(
          `${cs.slug}/adr-${i + 1}`,
          `${cs.name} · decision ${i + 1}`,
          base,
          `${cs.name} decision: ${adr.decision}. Alternatives considered: ${adr.alternatives} Why: ${adr.why}`,
        ),
      );
    });

    chunks.push(
      chunk(
        `${cs.slug}/evaluation`,
        `${cs.name} · evaluation`,
        base,
        `${cs.name} evaluation and results. ${cs.evaluation.summary} ${cs.evaluation.rows
          .map((r) => `${r.metric}: ${r.result}${r.note ? ` (${r.note})` : ""}`)
          .join(". ")} Metrics: ${cs.metrics
          .map((m) => `${m.prefix ?? ""}${m.value}${m.suffix ?? ""} ${m.label}`)
          .join(", ")}.`,
      ),
    );

    chunks.push(
      chunk(
        `${cs.slug}/limits`,
        `${cs.name} · limits`,
        base,
        `What ${cs.name} cannot do, its limits, gaps and caveats. ${cs.limits.join(" ")}`,
      ),
    );
  }

  // ---- labs -----------------------------------------------------------------
  for (const lab of labs) {
    chunks.push(
      chunk(
        `lab/${lab.slug}`,
        `${lab.name} · lab`,
        `/labs/${lab.slug}`,
        `${lab.name}. ${lab.tagline}. ${lab.body.join(" ")} Limits: ${lab.limits.join(" ")} Capabilities: ${lab.capabilities.join(", ")}. Stack: ${lab.stack.join(", ")}.`,
      ),
    );
  }

  return chunks;
}

export const CORPUS: Chunk[] = buildCorpus();
