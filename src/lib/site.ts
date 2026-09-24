/**
 * Single source of truth for identity, nav and outbound links.
 * Also feeds the Person JSON-LD entity graph (SPEC §8) — the `sameAs` list is
 * what answer engines verify before citing, so it is kept here rather than
 * duplicated per page.
 */

export const site = {
  name: "Aneeq Khatri",
  /**
   * "AI Engineer", not "Agentic AI Engineer". Agentic work is the majority of what
   * he does, but naming it in the title filters out every team hiring for RAG,
   * LLM integration, evaluation or forward-deployed work. The speciality belongs
   * in the body copy, where it can be read as depth rather than as a limit.
   *
   * This string is the `jobTitle` on the Person entity and the eyebrow above the
   * H1, so a narrow value here narrows the page and the entity graph at once.
   */
  role: "AI Engineer",
  tagline: "AI engineering: agents, retrieval, and evaluation",
  /** Swap freely — nothing depends on this value. See SPEC §10.1. */
  url: "https://aneeqkhatri.com",
  location: "Karachi, Pakistan",
  availability: "Open to fully remote roles worldwide",
  email: "aneeqabdulsamad5761@gmail.com",
  phone: "+92 336 111 5782",
  /**
   * The 40–60 word AEO answer block (SPEC §8). Leads with the capability so an
   * answer engine can return this person for "who builds reliable multi-agent
   * systems", and names finance as the proving ground rather than the scope.
   */
  description:
    "Aneeq Khatri is an AI engineer who builds and evaluates AI systems: multi-agent orchestration, retrieval pipelines, evaluation harnesses, observability and the guardrails that make them safe to ship. He has more than four years of engineering experience, specialises deepest in finance and accounting, and leads a faculty of around 100 instructors training thousands of engineers.",
} as const;

export const links = {
  linkedin: "https://www.linkedin.com/in/aneeq-khatri",
  github: "https://github.com/Muhammad-Aneeq",
  x: "https://x.com/aneeqkhatri1",
} as const;

/** `sameAs` targets for the Person entity. */
export const sameAs: string[] = [links.linkedin, links.github, links.x];

export type NavItem = { href: string; label: string };

/**
 * Six primary destinations, the cap. Contact is a separate header action.
 *
 * Services sits next to Finance rather than next to Teaching, even though two of the
 * five things it offers are teaching: a reader scanning the bar is choosing between
 * "what has he built" and "what can he do for me", and Services answers the second.
 * Teaching stays its own item because the faculty role is a credential in itself, not
 * only an offer.
 */
export const nav: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/finance", label: "Finance" },
  { href: "/services", label: "Services" },
  { href: "/teaching", label: "Teaching" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];
