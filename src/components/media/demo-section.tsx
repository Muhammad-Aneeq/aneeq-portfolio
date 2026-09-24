import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ShotGallery } from "@/components/media/shot-gallery";
import { Walkthrough } from "@/components/media/walkthrough";
import type { CaseStudy, Lab } from "@/content/schema";

/**
 * One project's entry on /demos: what it is, the walkthrough, then the screens.
 *
 * Case studies and labs render through the same component because on this page they
 * are the same object — a name, a line of context, and the evidence. The two tabs
 * differ in which collection they draw from and where the link goes, not in how a
 * recording is presented.
 *
 * A rule and generous space above each entry, rather than whitespace alone. This page
 * is a long stack, and with only margins between entries one project ran into the
 * next: a reader scrolling past four screenshots could not tell where CloseOps ended
 * and LedgerLens began. The rule is the same separator the editorial sections use
 * elsewhere, so the page reads as part of the site.
 */
export function DemoSection({
  project,
  href,
  linkLabel,
  summary,
}: {
  project: CaseStudy | Lab;
  href: string;
  linkLabel: string;
  summary: string;
}) {
  return (
    <Reveal as="section" className="border-t border-border pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-h2">
          <Link href={href} className="transition-colors duration-200 hover:text-text">
            {project.name}
          </Link>
        </h2>
        <Link
          href={href}
          className="text-sm text-accent transition-colors duration-200 hover:text-text"
        >
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      </div>
      <p className="mt-3 max-w-read text-muted">{summary}</p>

      {project.walkthrough && (
        <div className="mt-10">
          <Walkthrough walkthrough={project.walkthrough} />
        </div>
      )}

      {/*
        Slider, not a stack. /demos lists every project at once, and a project with four
        full-width screenshots pushed the next one entirely off screen.
      */}
      <ShotGallery shots={project.shots} className="mt-12" variant="slider" />
    </Reveal>
  );
}
