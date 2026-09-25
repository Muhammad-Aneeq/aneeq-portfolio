import { Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { feedback } from "@/content/feedback";
import { cn } from "@/lib/utils";

/**
 * Published client feedback.
 *
 * From people who were delivered work, which is why each entry carries a rating and
 * the service it applied to. A score with no name and no scope attached is decoration.
 *
 * **Renders nothing while the list is empty**, which is the same rule the rest of the
 * site follows: a card with no capture says so, a project with no repository does not
 * pretend to have one, and a wall with no feedback is not a wall of placeholders. An
 * empty testimonial section with sample quotes would be the single most damaging thing
 * on a portfolio whose whole argument is that its claims are checkable.
 *
 * So this is safe to drop onto any page. It appears the moment a real entry is added
 * to `src/content/feedback.ts` and not before.
 */
export function FeedbackWall({ className }: { className?: string }) {
  if (feedback.length === 0) return null;

  return (
    <section className={cn("border-t border-border pt-12", className)}>
      <SectionHeader
        eyebrow="client feedback"
        title="What clients have said"
        description="Sent by people after the work was delivered, and published unedited beyond trimming for length."
      />

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feedback.map((item) => (
          <StaggerItem key={`${item.name}-${item.date}`}>
            <Surface as="figure" className="flex h-full flex-col p-6">
              {/*
                The stars are decoration on top of text that already says the number,
                so the rating survives for anyone who cannot see them and never
                depends on colour alone.
              */}
              <p className="flex items-center gap-0.5 text-accent">
                <span className="sr-only">{item.rating} out of 5</span>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className={cn("size-4", i < item.rating ? "fill-current" : "text-faint")}
                  />
                ))}
              </p>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">
                {item.quote}
              </blockquote>

              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium text-text">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-border underline-offset-4 transition-colors duration-200 hover:decoration-text"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </p>
                {item.role && <p className="mt-1 text-xs text-muted">{item.role}</p>}
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

/**
 * The line shown where the wall would be, while there is nothing in it.
 *
 * Separate from the wall so a page can choose whether to acknowledge the gap. /feedback
 * does, because a page titled feedback that shows only a form looks broken. Other pages
 * that might carry the wall later would simply render nothing.
 */
export function FeedbackEmptyNote({ className }: { className?: string }) {
  if (feedback.length > 0) return null;

  return (
    <Reveal>
      <p className={cn("max-w-read text-sm leading-relaxed text-faint", className)}>
        No client feedback published yet. Entries appear once a client has sent one and
        I have added it, so this space stays empty rather than filling with examples.
      </p>
    </Reveal>
  );
}
