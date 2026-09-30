import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { RELATIONSHIP_LABEL, findOpenInvite } from "@/lib/feedback/store";

/**
 * The page behind a personal feedback link.
 *
 * Not indexed and not in the sitemap: the URL contains a secret, and a search result
 * pointing at someone's personal link would be both useless and a leak. The token is
 * only a lookup key. Whether it is valid, unused and unrevoked is decided by the
 * database, both here and again at submission time.
 */
export const metadata: Metadata = {
  title: "Leave feedback",
  robots: { index: false, follow: false },
};

export default async function InvitedFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findOpenInvite(token).catch(() => null);

  if (!invite) {
    return (
      <Container className="inner-page py-20">
        <p className="text-xs text-muted uppercase" data-readout>
          feedback
        </p>
        <h1 className="mt-5 max-w-wide text-h1">This link is no longer active</h1>
        <p className="mt-8 max-w-read text-lead text-muted" data-testid="invite-invalid">
          It may have been used already, since each link accepts one submission, or it may
          have been withdrawn. If you still want to leave feedback,{" "}
          <Link
            href="/contact"
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
          >
            get in touch
          </Link>{" "}
          and I will send a fresh one.
        </p>
      </Container>
    );
  }

  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        feedback · {RELATIONSHIP_LABEL[invite.relationship].toLowerCase()}
      </p>
      <h1 className="mt-5 max-w-wide text-h1">How was working together?</h1>
      <p className="mt-8 max-w-read text-lead text-muted">
        Thank you for taking the time. Say what went well and what did not: a specific
        criticism is worth more to me than general praise. Nothing is published unless you
        allow it below, and never before I have approved it.
      </p>

      <div className="max-w-wide">
        <FeedbackForm token={token} />
      </div>
    </Container>
  );
}
