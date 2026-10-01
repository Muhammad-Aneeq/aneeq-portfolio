import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { CardLoop } from "@/components/media/card-loop";
import { Surface } from "@/components/ui/surface";
import type { CaseStudy } from "@/content/schema";
import { cn } from "@/lib/utils";

/**
 * A case study in the /work list: what it is, the one number that matters, and a
 * preview, side by side.
 *
 * It used to stack a problem label, the problem, a result label, the result, a
 * "why flagship" paragraph, tag chips, a readout line and a full-width capture: about
 * 1,300px per card, 7.3 screens for five projects. That is a case study's page, not a
 * list entry. The rationale and tags still live on each project's own page, which is
 * one click away; the list only has to tell a reader which one to open.
 *
 * The preview carries a view-transition name shared with the project page's header,
 * so opening a card morphs the preview into it.
 */
export function ProjectCard({ study, className }: { study: CaseStudy; className?: string }) {
  const headline = study.metrics[0];
  const hasCapture = Boolean(study.loop || study.shots[0]);

  return (
    <Surface
      interactive
      as="article"
      className={cn("group relative grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-center md:gap-10", className)}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-h3">
            {/*
              The focus ring is drawn on the link's full-card overlay, since the whole
              card is what the link activates.
            */}
            <Link
              href={`/work/${study.slug}`}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-text"
            >
              {study.name}
            </Link>
          </h2>
          <ArrowUpRight
            className="size-5 shrink-0 text-faint transition-colors duration-200 group-hover:text-text md:hidden"
            aria-hidden
          />
        </div>
        <p className="mt-2 max-w-tight text-sm leading-relaxed text-muted">{study.outcome}</p>

        {/* The one number, with the scope that makes it checkable. */}
        <p className="mt-6">
          <span className="block font-display text-h2 leading-none font-semibold tracking-tight">
            {headline.prefix ?? ""}
            {headline.value}
            {headline.suffix ?? ""}
          </span>
          <span className="mt-2 block max-w-sm text-sm leading-snug text-muted">{headline.label}</span>
        </p>

        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-text">
          Read the case study
          <ArrowUpRight className="size-4 text-faint transition-[color,translate] duration-200 group-hover:text-text motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
        </p>
      </div>

      {hasCapture ? (
        <ViewTransition name={`media-${study.slug}`} share="morph" default="none">
          {/*
            A matte, not a tint: light interfaces (LedgerLens measures 246 to 248 of 255)
            read as a hole in the dark theme without one. The evidence is untouched.
          */}
          <div className="aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface-2 p-1.5 ring-1 ring-border/60 ring-inset">
            {study.loop ? (
              <CardLoop loop={study.loop} className="rounded-md transition-[scale] duration-700 ease-out motion-safe:group-hover:scale-[1.03]" />
            ) : (
              <Image
                src={study.shots[0].src}
                width={study.shots[0].width}
                height={study.shots[0].height}
                alt={study.shots[0].alt}
                sizes="(min-width: 1024px) 600px, 92vw"
                className="h-full w-full rounded-md object-cover object-top transition-[scale] duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
              />
            )}
          </div>
        </ViewTransition>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs leading-relaxed text-faint">
          No capture yet. What it does and how it was verified is written up in the case
          study.
        </p>
      )}
    </Surface>
  );
}
