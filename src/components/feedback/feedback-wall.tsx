import { Star } from "lucide-react";
import { connection } from "next/server";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { RELATIONSHIP_LABEL, listPublished, type PublicEntry } from "@/lib/feedback/store";
import { cn } from "@/lib/utils";

/**
 * Published feedback: only entries the owner approved AND the person consented to
 * publish. The store's query enforces both, so nothing here has to remember to.
 *
 * Two ways to render, chosen by `live`:
 *
 *   · live (/feedback): read on every request via `connection()`, so the page is
 *     always current and never needs a database at build time.
 *   · built ahead (home, services): read when the page is built and kept, so those
 *     pages stay static and fast. The admin actions call `revalidatePath` on them, so
 *     approving or unpublishing rebuilds them on the next visit. With no database at
 *     build time (CI) the query returns nothing and the section is simply absent.
 *
 * **Renders nothing while the list is empty**, the same rule the rest of the site
 * follows: a wall with no feedback is not a wall of placeholders. There are no sample
 * quotes anywhere in this codebase, and there must never be.
 */
export async function FeedbackWall({
  className,
  emptyNote = false,
  header,
  limit,
  live = false,
}: {
  className?: string;
  /** Show a one-line explanation instead of nothing when the list is empty. */
  emptyNote?: boolean;
  /**
   * The section heading. Omitted: the standard inner-page heading. `null`: none, as on
   * /feedback where the page title directly above already says it. Anything else: that,
   * as on the home page, whose sections have their own heading style.
   */
  header?: React.ReactNode;
  /** Show only the newest few, as a teaser linking to the full page. */
  limit?: number;
  live?: boolean;
}) {
  if (live) await connection();
  const all = await listPublished().catch(() => [] as PublicEntry[]);
  const entries = limit ? all.slice(0, limit) : all;
  if (entries.length === 0) {
    return emptyNote ? (
      <p className={cn("max-w-read text-sm leading-relaxed text-faint", className)}>
        Nothing published here yet. Entries appear once someone I have worked with has sent
        one and I have approved it, so this space stays empty rather than filling with
        examples.
      </p>
    ) : null;
  }

  const heading =
    header === undefined ? (
      <SectionHeader
        eyebrow="feedback"
        title="What people I have worked with say"
        description="From clients, former employers and colleagues, each sent through a personal link and published with their permission, unedited beyond trimming for length."
        className="mb-10"
      />
    ) : (
      header
    );

  return (
    <section className={className} data-testid="feedback-wall">
      {heading}

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((item) => (
          <StaggerItem key={item.id}>
            <Surface as="figure" className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                {/*
                  The stars sit on top of text that already says the number, so the rating
                  survives for anyone who cannot see them and never depends on colour alone.
                */}
                <p className="flex items-center gap-0.5 text-accent">
                  <span className="sr-only">{item.rating} out of 5</span>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden className={cn("size-4", i < item.rating ? "fill-current" : "text-faint")} />
                  ))}
                </p>
                <span className="text-xs text-faint" data-readout>
                  {RELATIONSHIP_LABEL[item.relationship]}
                </span>
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed whitespace-pre-line text-text">
                {item.quote}
              </blockquote>

              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium text-text">
                  {item.profileUrl ? (
                    <a
                      href={item.profileUrl}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="underline decoration-border underline-offset-4 transition-colors duration-200 hover:decoration-text"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </p>
                {(item.role || item.company) && (
                  <p className="mt-1 text-xs text-muted">{[item.role, item.company].filter(Boolean).join(", ")}</p>
                )}
                {item.service && (
                  <p className="mt-1.5 text-xs text-faint" data-readout>
                    {item.service}
                  </p>
                )}
              </figcaption>
            </Surface>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
