import { z } from "zod";

/**
 * Content schema.
 *
 * SPEC §2 called for MDX + frontmatter. This is typed TypeScript validated by Zod
 * instead, for one reason: the case-study template is highly regular — every section
 * is a short list or a small set of paragraphs — so a typed object can *guarantee*
 * that no case study ships without its TL;DR, its ADRs, its eval numbers or its
 * Limits section. MDX frontmatter can only guarantee the frontmatter. Free-form prose
 * was not what this content needed; completeness was.
 */

export const linksSchema = z.object({
  demo: z.string().url().optional(),
  repo: z.string().url().optional(),
  video: z.string().optional(),
  /**
   * This specific repository is public and has passed the pre-flight in PLAN.md §A2.
   *
   * `REPOS_PUBLIC` flips every repo at once, which was right while none of them were
   * published and wrong now that some are: it can only say "all dark" or "all live",
   * so three public repositories were being advertised as private while eleven
   * unpublished ones would have gone live together. Per-project, a repo becomes
   * clickable exactly when someone has confirmed it exists and is clean.
   */
  repoPublic: z.boolean().optional(),
});

export const metricSchema = z.object({
  value: z.number(),
  // Up to 6: per-exception model cost is a real metric and lands around $0.00098.
  decimals: z.number().int().min(0).max(6).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  label: z.string().min(3),
  /**
   * The qualifier that makes the number checkable: what it was measured against, and
   * which direction is good.
   *
   * A headline "0" tells a reader nothing — zero of what, out of how many attempts?
   * "0 duplicate postings" in the label plus "under 36 concurrent forced retries" here
   * is the difference between a figure and a claim. Likewise a "−37.8%" needs to say
   * that it is a gap between two pass rates and that smaller is better, or a reader
   * reasonably assumes something got 37.8% worse.
   */
  note: z.string().optional(),
  href: z.string().optional(),
});

export const adrSchema = z.object({
  decision: z.string().min(10),
  alternatives: z.string().min(10),
  why: z.string().min(30),
});

/** A station on the scroll-driven trace replay. `kind` picks its colour and glyph. */
export const traceStationSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["plan", "tool", "policy", "route", "gate", "commit", "audit", "halt"]),
  caption: z.string().min(20),
});

export const evalRowSchema = z.object({
  metric: z.string(),
  result: z.string(),
  note: z.string().optional(),
});

/** A real screenshot of the running system. Dimensions are required so next/image
 *  can reserve the box and the page never shifts while one loads. */
export const shotSchema = z.object({
  src: z.string().startsWith("/media/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Describes the image for a screen reader — not a repeat of the caption. */
  alt: z.string().min(15),
  caption: z.string().min(15),
});

/** A click-to-play walkthrough. Facade-loaded: the poster is an image until asked. */
export const walkthroughSchema = z.object({
  src: z.string().startsWith("/media/"),
  poster: z.string().startsWith("/media/"),
  seconds: z.number().int().positive(),
  caption: z.string().min(15),
});

/** A muted autoplay loop for a card. WebM first, MP4 fallback. */
export const loopSchema = z.object({
  webm: z.string().startsWith("/media/"),
  mp4: z.string().startsWith("/media/"),
  poster: z.string().startsWith("/media/"),
});

/**
 * The domain a project was applied to — SPEC §2.
 *
 * Drives the home Domains strip and the /labs domain filter, and it is required so
 * the T-shape claim can only ever assert breadth the content can enumerate. Today
 * every project is `finance`, so the strip renders two cells rather than inventing a
 * third. That is the point: the field makes the honest answer the automatic one.
 */
export const domainSchema = z.enum(["finance", "education", "devtools", "other"]);

/**
 * Words a capability title may not contain — SPEC §2.
 *
 * Deliberately blunt. A false positive costs one rewrite; a false negative costs the
 * positioning, because a domain-first title is exactly the thing that reverts first
 * when someone is in a hurry. A rule that lives only in a style guide is a rule that
 * is already broken somewhere.
 */
const TITLE_BANNED = [
  "ledger",
  "bank",
  "reconciliation",
  "invoice",
  "close",
  "accounting",
  "finance",
] as const;

const MAX_TITLE_WORDS = 8;

/** ≤ 8 words, capability only, no domain word. What a reader scanning /work sees. */
export const capabilityTitleSchema = z
  .string()
  .min(10)
  .superRefine((value, ctx) => {
    const words = value.trim().split(/\s+/);
    if (words.length > MAX_TITLE_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `title is ${words.length} words ("${value}"). The cap is ${MAX_TITLE_WORDS}; it is what a reader scanning /work sees, and a scannable list cannot be made of sentences.`,
      });
    }
    const hit = TITLE_BANNED.find((w) => new RegExp(`\\b${w}`, "i").test(value));
    if (hit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `title contains the domain word "${hit}" ("${value}"). SPEC §1 is capability-first: the domain belongs in \`outcome\`, after the em dash.`,
      });
    }
  });

export const caseStudySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),

  /** SPEC §2 — the three fields that replaced one overloaded `tagline`. */
  title: capabilityTitleSchema,
  /**
   * One line, ending `— applied to <domain task>`. The proof, directly beneath the
   * title. A reader must be able to stop at the em dash and still know what was built.
   */
  outcome: z.string().min(20),
  /** Why this one earns a full case study. Shown on the /work index. */
  whyFlagship: z.string().min(80),

  domain: domainSchema,
  order: z.number().int(),

  /**
   * 40–60 words, plain prose, no jargon run-up. This is the passage answer engines
   * extract and cite (SPEC §8), so the word count is enforced rather than suggested.
   */
  tldr: z.string(),

  tags: z.array(z.string()).min(2),
  stack: z.array(z.string()).min(3),
  links: linksSchema,
  metrics: z.array(metricSchema).min(2).max(4),

  problem: z.array(z.string().min(40)).min(1),
  constraints: z.array(z.string().min(20)).min(2),

  /**
   * "Where else this pattern applies" — SPEC §5.2 step 3. The transfer signal, and
   * required rather than optional: it is the difference between "he built finance
   * software" and "he solved a class of problem and finance is where he proved it."
   *
   * Name concrete tasks rather than industries, claim only what the architecture
   * actually supports, and never imply the project has shipped in that domain.
   */
  transfers: z.array(z.string().min(60)).min(2).max(3),

  architecture: z.object({
    summary: z.string().min(60),
    trace: z.array(traceStationSchema).min(4).max(9),
  }),

  adrs: z.array(adrSchema).min(2),

  evaluation: z.object({
    summary: z.string().min(60),
    rows: z.array(evalRowSchema).min(2),
  }),

  /** The senior-signal section. A case study without limits fails the build. */
  limits: z.array(z.string().min(40)).min(3),

  /**
   * How a stranger connects to the running thing. Present only where the project
   * is actually reachable — the point is that someone can try it without reading
   * the code, which is the acceptance test for a live demo.
   */
  connect: z
    .object({
      summary: z.string().min(40),
      steps: z.array(
        z.object({
          label: z.string().min(5),
          code: z.string().min(5),
          note: z.string().optional(),
        }),
      ).min(1),
    })
    .optional(),

  /** Real captures only. A project with none shows none — nothing is mocked up. */
  shots: z.array(shotSchema).default([]),
  walkthrough: walkthroughSchema.optional(),
  loop: loopSchema.optional(),
});

export const labSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  /** Capability-first, same rule as a case study. */
  tagline: z.string().min(20),
  domain: domainSchema,
  order: z.number().int(),
  /** Drives the /labs capability filter chips. */
  capabilities: z.array(
    z.enum(["agents", "rag", "evals", "mcp", "security", "governance"]),
  ).min(1),
  stack: z.array(z.string()).min(2),
  links: linksSchema,
  body: z.array(z.string().min(40)).min(1),
  limits: z.array(z.string().min(40)).default([]),
  dataNote: z.string().default("All data in this project is synthetic."),
  /** Bento cell sizing. */
  span: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  rows: z.union([z.literal(1), z.literal(2)]),
  shots: z.array(shotSchema).default([]),
  /*
    Same two media fields a case study carries, and for the same reason: whether a
    project has a recorded demo is a fact about the project, not about which of the
    two content types it happens to be filed under. RevLedger and InvoiceAudit are
    labs with narrated walkthroughs; without these they could only ever show stills.
  */
  walkthrough: walkthroughSchema.optional(),
  loop: loopSchema.optional(),
});

/**
 * Output types — what components consume. Defaults are filled in, so `shots` is
 * always an array here rather than possibly undefined.
 */
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Lab = z.infer<typeof labSchema>;

/**
 * Input types — what the content files are written against. A project with no
 * screenshots simply omits `shots` instead of writing an empty array.
 */
export type CaseStudyInput = z.input<typeof caseStudySchema>;
export type LabInput = z.input<typeof labSchema>;
export type TraceStation = z.infer<typeof traceStationSchema>;
export type EvalRow = z.infer<typeof evalRowSchema>;
export type Domain = z.infer<typeof domainSchema>;

/** Enforced separately from the schema so the error message can be useful. */
export function assertTldrLength(cs: CaseStudy) {
  const words = cs.tldr.trim().split(/\s+/).length;
  if (words < 40 || words > 60) {
    throw new Error(
      `[content] ${cs.slug}: TL;DR is ${words} words. It must be 40 to 60; it is the passage answer engines quote.`,
    );
  }
}
