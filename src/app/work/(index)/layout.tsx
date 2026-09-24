import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { projectCount } from "@/content";

/**
 * The hero both work tabs share.
 *
 * /work and /labs used to be two pages wearing the same tab strip, with different
 * headings, different intros and different layouts. Clicking a tab replaced the whole
 * page identity, so it read as navigating away rather than switching view, which is
 * exactly what a tab is supposed to avoid.
 *
 * In a route group so it wraps the two index views without touching `/work/[slug]`.
 * A layout at `app/work/layout.tsx` would have put this index hero on top of every
 * case study page as well.
 *
 * The heading counts both collections, so it stays true whichever tab is open.
 */
export default function WorkIndexLayout({ children }: { children: ReactNode }) {
  return (
    <Container className="py-20">
      {/* The 40–60 word answer block. First thing on the page, by design. */}
      <p className="text-xs text-muted uppercase" data-readout>
        engineering portfolio
      </p>
      <h1 className="mt-5 max-w-wide text-h1">
        {projectCount} projects. Built to be checked.
      </h1>
      <p className="mt-7 max-w-read text-lead text-muted">
        Governed multi-agent systems, proven where a wrong number costs the most. Every
        project gives the problem, the architecture, the decisions and their alternatives,
        and the evaluation method with its numbers. Each one also says what it cannot do,
        because that is the part that tells you whether to trust the rest.
      </p>

      <p className="mt-8 text-sm text-faint">
        All project data is synthetic. Individual projects document their datasets and
        limitations. Available walkthroughs are collected on{" "}
        <Link
          href="/demos"
          className="text-muted underline decoration-border underline-offset-4 transition-colors hover:text-text hover:decoration-text"
        >
          the demos page
        </Link>
        .
      </p>

      {children}
    </Container>
  );
}
