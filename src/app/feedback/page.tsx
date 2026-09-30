import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { FeedbackWall } from "@/components/feedback/feedback-wall";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Feedback and recommendations from clients, former employers and colleagues of Aneeq Khatri, each sent through a personal link and published with permission.",
};

/**
 * The public face of feedback: what has been approved, and how it got here.
 *
 * There is no open form on this page any more. Feedback arrives through personal
 * invite links, one per person, which is what lets every entry here honestly claim to
 * come from someone who worked with me. An open form cannot make that claim, and
 * would have to be moderated for spam as well as for content.
 */
export default function FeedbackPage() {
  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        feedback
      </p>
      <h1 className="mt-5 max-w-wide text-h1">From people I have worked with</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-8 max-w-read text-lead text-muted">
        Clients, former employers and colleagues. Each one was sent a personal link, wrote
        in their own words, and agreed to be named here. Every entry is approved before it
        appears, and nothing is changed beyond trimming for length.
      </p>

      <FeedbackWall className="mt-14" emptyNote header={null} live />

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-xs text-faint uppercase" data-readout>
          worked together?
        </h2>
        <p className="mt-4 max-w-read text-muted">
          If we have worked together and you would like to leave feedback, I will send you
          a personal link.{" "}
          <Link
            href="/contact"
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
          >
            Ask for one here
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
