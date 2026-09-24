import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CardLoop } from "@/components/media/card-loop";
import { Surface } from "@/components/ui/surface";
import { TagRow } from "@/components/ui/tag-chip";
import type { CaseStudy } from "@/content/schema";
import { cn } from "@/lib/utils";

/**
 * One card vocabulary for a project, in two densities.
 *
 * `compact` is the home page: name, the problem, the result in context, and a link to
 * the evidence. `full` is `/work`: the same four things in the same order, plus the
 * outcome line, tags, the flagship rationale and a capture.
 *
 * They are one component because the previous two were drifting. On `/work` a card with
 * a screenshot was roughly twice the height of one without, so the collection read as
 * "these three are the real projects and those two are filler" — which is not what the
 * content says. **Media is evidence appended to a card, never the thing that sets its
 * height**: the comparable part (name, problem, result, evidence) is identical in
 * structure for every project whether or not anyone has captured it yet.
 */

/**
 * The problem in one line, taken from the case study's own first paragraph rather than
 * written again here. Two sources for the same claim is how they drift apart.
 */
function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return (m?.[0] ?? text).trim();
}

export function ProjectCard({
  study,
  variant = "full",
  className,
  showWhyFlagship = false,
}: {
  study: CaseStudy;
  variant?: "compact" | "full";
  className?: string;
  /** Only the /work index asks "why is this one a full case study" (SPEC §5.2). */
  showWhyFlagship?: boolean;
}) {
  const headline = study.metrics[0];
  const compact = variant === "compact";
  const hasCapture = Boolean(study.loop || study.shots[0]);

  return (
    <Surface
      interactive
      as="article"
      className={cn("group relative flex h-full flex-col p-6 sm:p-8", className)}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-h3">
            {/*
              The focus ring is drawn on the link's own full-card overlay.

              This link stretches across the whole card via `after:absolute after:inset-0`,
              so the global `:focus-visible` outline landed on its inline text box — a ring
              around the title only, while the thing being activated is the entire card.
              Suppressing the outline on the link and putting it on the overlay instead
              rings what is actually focused. Verified by tabbing: before this, three cards
              on the home page and five on /work had no visible focus indicator at all.
            */}
            <Link
              href={`/work/${study.slug}`}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-text"
            >
              {study.name}
            </Link>
          </h2>
          <p className="mt-2 max-w-tight font-medium text-text">{study.title}</p>
        </div>
        <ArrowUpRight
          className="size-5 shrink-0 text-faint transition-colors duration-200 group-hover:text-text"
          aria-hidden
        />
      </div>

      {/* The problem. Labelled, because a reader scanning five cards needs to know
          which line is which without reading all of them. */}
      <p className="mt-6 text-xs text-faint uppercase" data-readout>
        the problem
      </p>
      <p className="mt-2 max-w-tight text-sm leading-relaxed text-muted">
        {compact ? firstSentence(study.problem[0]) : study.outcome}
      </p>

      {/* The result, with the scope that makes it checkable. */}
      <p className="mt-6 text-xs text-faint uppercase" data-readout>
        the result
      </p>
      <p className="mt-2">
        <span className="block font-display text-h2 leading-none font-semibold tracking-tight">
          {headline.prefix ?? ""}
          {headline.value}
          {headline.suffix ?? ""}
        </span>
        <span className="mt-2 block max-w-sm text-sm leading-snug text-muted">
          {headline.label}
        </span>
        {headline.note && (
          <span className="mt-1.5 block max-w-sm text-xs leading-snug text-faint">
            {headline.note}
          </span>
        )}
      </p>

      {showWhyFlagship && (
        <p className="mt-6 max-w-read border-l border-border pl-4 text-sm leading-relaxed text-faint">
          {study.whyFlagship}
        </p>
      )}

      {!compact && <TagRow className="mt-7" tags={study.tags} />}

      {/* `mt-auto` so the evidence line sits on the card's floor whatever the prose
          above it does. Cards in a row then agree on where their last line is. */}
      <p className="mt-auto pt-7 text-xs text-faint" data-readout>
        {hasCapture ? "read the case study · screens captured" : "read the case study"}
      </p>

      {/*
        Media, only where a capture exists, and an explicit statement where one does not.

        A container that reserves height and holds nothing reads as a broken image. The
        alternative is not a spinner or a placeholder graphic — it is saying so.

        This was written for LedgerGuard, whose case study then stated its console had
        never been rendered in a browser. It has since been recorded, so LedgerGuard now
        takes the first branch and the limitation was withdrawn rather than left standing
        beside a video of the thing it said did not exist. The branch stays for whichever
        project is next without a capture.
      */}
      {!compact &&
        (hasCapture ? (
          /*
            A matte, not a tint.

            LedgerLens's interface is genuinely light — all four captures measure 246–248
            of 255 mean luminance — so on the dark theme its card image reads as a white
            block punched through the page. The honest options were: find a dark capture
            (none exists), or darken the screenshot, which would misrepresent the product.

            So neither. The frame gets an inset ring and a small matte instead, which is
            what a light screenshot in a dark document needs: something that says "this is
            a picture of a screen" rather than "this is a hole". The evidence is untouched.
          */
          <div className="mt-6 aspect-[16/7] overflow-hidden rounded-lg border border-border bg-surface-2 p-1.5 ring-1 ring-border/60 ring-inset">
            {study.loop ? (
              <CardLoop loop={study.loop} />
            ) : (
              <Image
                src={study.shots[0].src}
                width={study.shots[0].width}
                height={study.shots[0].height}
                alt={study.shots[0].alt}
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 92vw"
                className="h-full w-full rounded-md object-cover object-top"
              />
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border px-4 py-3 text-xs leading-relaxed text-faint">
            No capture yet. This one has not been rendered in a browser. What it does
            and how it was verified is written up in the case study.
          </p>
        ))}
    </Surface>
  );
}
