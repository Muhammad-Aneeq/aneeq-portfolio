"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CardLoop } from "@/components/media/card-loop";
import { Surface } from "@/components/ui/surface";
import { TagRow } from "@/components/ui/tag-chip";
import { capabilityFilters, hasMedia } from "@/content";
import type { Lab } from "@/content/schema";
import { cn } from "@/lib/utils";

type Capability = Lab["capabilities"][number];
type Domain = Lab["domain"];

const DOMAIN_LABELS: Record<Domain, string> = {
  finance: "Finance",
  education: "Education",
  devtools: "Devtools",
  other: "Other",
};

export function LabsGrid({ labs }: { labs: Lab[] }) {
  const [filter, setFilter] = useState<Capability | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);

  /*
    One filter over every lab on the page, captured or not.

    The chips used to count only the labs with a capture, so this row read "All 9"
    while the tab directly above it read "Labs 11" — two counts of one collection,
    disagreeing because the two without a recording are listed further down as rows
    rather than shown as cards. Both now count the same eleven. The filter reaches
    that list too, so choosing a capability cannot leave unrelated rows sitting
    underneath a grid that has just been narrowed.
  */
  const matches = (l: Lab) =>
    (filter ? l.capabilities.includes(filter) : true) && (domain ? l.domain === domain : true);

  // Split after filtering, not before: a card needs a capture, a row does not.
  // Excluded here, not hidden with CSS — an uncaptured cell is never rendered.
  const visible = labs.filter(hasMedia).filter(matches);
  const visibleUncaptured = labs.filter((l) => !hasMedia(l)).filter(matches);

  // A value with nothing behind it renders no chip — the filter only offers breadth
  // the page can actually show (SPEC §5.3).
  const domains = [...new Set(labs.map((l) => l.domain))];

  if (labs.length === 0) return null;

  return (
    <>
      {labs.length > 2 && (
        <div className="flex flex-col gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by capability"
          >
            <FilterChip
              active={filter === null && domain === null}
              onClick={() => {
                setFilter(null);
                setDomain(null);
              }}
            >
              All {labs.length}
            </FilterChip>
            {capabilityFilters.map((cap) => {
              // Counts cover every lab, matching the tab above. Each one is reachable
              // from this page: as a card if it has a capture, as a row if it does not.
              const count = labs.filter((l) => l.capabilities.includes(cap.id)).length;
              if (count === 0) return null;
              return (
                <FilterChip
                  key={cap.id}
                  active={filter === cap.id}
                  onClick={() => setFilter(filter === cap.id ? null : cap.id)}
                >
                  {cap.label} {count}
                </FilterChip>
              );
            })}
          </div>

          {/*
            Domain group, second — capability-first is the positioning rule, and the chip
            order on this page is part of it (SPEC §1).

            With only one domain represented it is rendered as a label rather than a
            control. A filter with a single option is a button that cannot change
            anything: pressing it either does nothing visible or removes every card, and
            both outcomes teach a reader that the controls on this page are decorative.
            It becomes a real filter again on its own the moment a second domain has a
            captured project.
          */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-faint" data-readout>
              domain
            </span>
            {domains.length === 1 ? (
              <span className="text-xs text-muted" data-readout>
                {DOMAIN_LABELS[domains[0]]} · all {labs.length}
              </span>
            ) : (
              <span className="contents" role="group" aria-label="Filter by domain">
                {domains.map((d) => {
                  const count = labs.filter((l) => l.domain === d).length;
                  return (
                    <FilterChip
                      key={d}
                      active={domain === d}
                      onClick={() => setDomain(domain === d ? null : d)}
                    >
                      {DOMAIN_LABELS[d]} {count}
                    </FilterChip>
                  );
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/*
        A uniform grid, not a bento.

        The bento sized each cell from a per-project `span` and `rows`, which fought the
        media frame and lost. Measured at 1440px: every card but one rendered its capture
        between 24 and 47 pixels tall, at aspect ratios from 8:1 to 15.8:1, because the
        fixed row height overrode the 16/10 box. A screenshot at 15:1 is a decorative
        stripe, not evidence. The layout also left cards at five different vertical
        offsets with a single card stranded on one row and 200px of dead space on another.

        Equal columns fix both at once: the media frame governs its own height, and cards
        in a row stretch to match rather than being cut to a preset. Nine captured labs
        fill three rows of three exactly.
      */}
      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", labs.length > 2 ? "mt-10" : "mt-0")}>
        {visible.map((lab, i) => (
          <Surface
            key={lab.slug}
            interactive
            as="article"
            className="group relative flex h-full flex-col overflow-hidden"
          >
              {/*
                `object-[center_38%]` and a taller box, not `object-top`.

                Cropping to the top of an application screenshot shows its title bar and
                nav — the one part of any tool that looks like every other tool. What a
                reader needs from a thumbnail here is the behaviour: a refusal, a citation,
                an exception queue, an eval result. Those sit below the chrome, so the
                crop is biased down and the cell is taller to carry more of it.
              */}
              {/*
                A recording where one exists, the still otherwise — the same order of
                preference a case study card uses, so the two collections are showing
                evidence in the same language rather than one moving and one static.
              */}
              <div className="aspect-[16/10] overflow-hidden border-b border-border bg-surface-2">
                {lab.loop ? (
                  <CardLoop loop={lab.loop} className="object-[center_38%]" />
                ) : lab.walkthrough && !lab.shots[0] ? (
                  // Recorded but never screenshotted: the walkthrough's poster is the
                  // frame a reader would have seen anyway, so it stands in rather than
                  // the cell collapsing to an empty box. Dimensions are not known here,
                  // which is why this is a plain img and not next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lab.walkthrough.poster}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover object-[center_38%]"
                  />
                ) : (
                  <Image
                    src={lab.shots[0].src}
                    width={lab.shots[0].width}
                    height={lab.shots[0].height}
                    alt=""
                    // The first cell is above the fold and was measuring as the LCP
                    // element while marked lazy — which is the one thing an LCP image
                    // must never be. Prioritised; the rest stay lazy.
                    priority={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                    sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 96vw"
                    className="h-full w-full object-cover object-[center_38%]"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-h3">
                    <Link href={`/labs/${lab.slug}`} className="after:absolute after:inset-0">
                      {lab.name}
                    </Link>
                  </h2>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-faint transition-colors duration-200 group-hover:text-text"
                    aria-hidden
                  />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted">{lab.tagline}</p>

                <TagRow className="mt-auto pt-6" tags={lab.stack.slice(0, 3)} />
              </div>
          </Surface>
        ))}
      </div>

      {/*
        Projects without a capture are named rather than deleted. Showing a card with
        no screenshot reads as unfinished; deleting the project entirely would hide
        real work. A list is the honest middle.

        It sits inside the grid component so the filter above reaches it. Left in the
        page it would have been a fixed pair of rows under a grid that changes, which
        is how "All 11" starts meaning something different from what is on screen.
      */}
      {visibleUncaptured.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xs text-faint uppercase" data-readout>
            built, not yet captured
          </h2>
          <p className="mt-4 max-w-read text-sm text-muted">
            These run, and are written up in full. They join the grid above once their
            screens have been recorded.
          </p>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {visibleUncaptured.map((lab) => (
              <li key={lab.slug}>
                <Link
                  href={`/labs/${lab.slug}`}
                  className="group flex items-baseline justify-between gap-6 py-4 transition-colors duration-200 hover:text-text"
                >
                  <span className="flex-1">
                    <span className="font-display text-[1.0625rem] font-semibold">
                      {lab.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{lab.tagline}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-faint transition-colors duration-200 group-hover:text-text"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200",
        active
          ? "border-text bg-surface-2 font-medium text-text"
          : "border-border text-muted hover:border-border-strong hover:text-text",
      )}
      data-readout
    >
      {children}
    </button>
  );
}
