import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackEmptyNote, FeedbackWall } from "@/components/feedback/feedback-wall";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Client feedback on work delivered by Aneeq Khatri: agent engineering, evaluation, finance automation and training. Rate the work and say how it went.",
};

export default function FeedbackPage() {
  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        feedback
      </p>
      <h1 className="mt-5 max-w-wide text-h1">How did the work go?</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-8 max-w-read text-lead text-muted">
        For clients I have delivered work to. Rate it, say what went well and what did
        not, and I will use it to do the next one better. Criticism is more useful than
        praise, and a specific objection is the most useful of all. It reaches me by
        email, and nothing appears on this page unless I put it there.
      </p>

      {/* Renders nothing until a real entry exists; the note takes its place. */}
      <FeedbackWall className="mt-16" />
      <FeedbackEmptyNote className="mt-10" />

      <section className="mt-12 border-t border-border pt-12">
        <h2 className="text-h2">Leave feedback</h2>
        <p className="mt-4 max-w-read text-muted">
          If you would rather write at length, {""}
          <a
            href={`mailto:${site.email}`}
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
          >
            email me directly
          </a>
          . Either reaches the same place.
        </p>

        <div className="max-w-wide">
          <FeedbackForm />
        </div>
      </section>

      <Reveal>
        <p className="mt-14 max-w-read text-sm leading-relaxed text-faint">
          Published entries are shown with the name of whoever sent them, plus their role
          and a profile link where they gave one, so a reader can check who said it. A
          rating on its own proves nothing. Anonymous feedback is still welcome; it simply
          stays between us rather than going on the page.
        </p>
      </Reveal>
    </Container>
  );
}
