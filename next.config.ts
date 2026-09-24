import type { NextConfig } from "next";

/**
 * `NEXT_PUBLIC_ASK_ENABLED` is derived at build time from whether a provider key
 * exists — it is never set by hand. That keeps one source of truth: if the key is
 * absent, `/ask` 404s and every reference to it (nav pill, home teaser, llms.txt,
 * sitemap) disappears from the build. A signature feature is either live or it
 * does not exist; a "coming soon" page is worse than neither.
 */
const askEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

/**
 * Repo URLs are already in the content, but rendering a link to a private repo
 * gives a hiring manager a 404 — worse than saying it is private. So the links
 * stay dark until this is set, at which point all five light up at once.
 * Set `REPOS_PUBLIC=1` after flipping visibility on GitHub.
 */
const reposPublic = process.env.REPOS_PUBLIC === "1";

/** Set `LEDGERLAB_DEMO_URL` once LedgerLab is deployed; the Live demo link and
 *  its health pill appear together. */
const ledgerlabDemoUrl = process.env.LEDGERLAB_DEMO_URL ?? "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ASK_ENABLED: askEnabled ? "1" : "",
    NEXT_PUBLIC_REPOS_PUBLIC: reposPublic ? "1" : "",
    NEXT_PUBLIC_LEDGERLAB_DEMO_URL: ledgerlabDemoUrl,
  },

  /**
   * /demos used to open on the case studies, with the labs at /demos/labs. It now
   * opens on the labs, because two of the three narrated demos are labs and they were
   * sitting below the fold behind a tab. The old URL is kept alive rather than left to
   * 404: it is in browser history, and a tab still holding the previous JavaScript
   * bundle will navigate to it on the next click.
   *
   * Not permanent. A 308 is cached by the browser indefinitely, which is the wrong
   * trade for a path this young — if the split is reorganised again, every visitor who
   * followed it once would keep being sent to a stale destination.
   */
  async redirects() {
    return [{ source: "/demos/labs", destination: "/demos", permanent: false }];
  },
};

export default nextConfig;
