import { Star } from "lucide-react";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getAdmin } from "@/lib/admin-session";
import { hasDatabase } from "@/lib/db";
import {
  RELATIONSHIP_LABEL,
  listEntries,
  listInvites,
  type Entry,
  type Status,
} from "@/lib/feedback/store";
import { cn } from "@/lib/utils";
import {
  deleteEntryAction,
  revokeInviteAction,
  saveQuoteAction,
  setStatusAction,
} from "./actions";
import { InviteCreator } from "./invite-creator";

/**
 * The owner's feedback queue.
 *
 * Checks the session itself and redirects when there is none. That check protects the
 * page's *content*; each action behind it checks again, because the actions are
 * reachable without this page (see actions.ts).
 *
 * Every control is a plain form posting to a Server Action, so the whole queue works
 * with scripting off, apart from the copy-to-clipboard convenience.
 */
export default async function AdminFeedbackPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin");

  if (!hasDatabase()) {
    return (
      <Container className="inner-page py-20">
        <h1 className="text-h1">Feedback</h1>
        <p className="mt-8 max-w-read text-muted">
          No database is configured on this deployment. Set DATABASE_URL and run{" "}
          <code>npm run db:migrate</code>.
        </p>
      </Container>
    );
  }

  const [entries, invites] = await Promise.all([listEntries(), listInvites()]);
  const by = (s: Status) => entries.filter((e) => e.status === s);
  const pending = by("pending");
  const approved = by("approved");
  const rejected = by("rejected");

  return (
    <Container className="inner-page py-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs text-muted uppercase" data-readout>
            admin · signed in as {admin}
          </p>
          <h1 className="mt-5 text-h1">Feedback</h1>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button type="submit">Sign out</Button>
        </form>
      </div>

      <section className="mt-14 border-t border-border pt-10" aria-labelledby="invites-title">
        <h2 id="invites-title" className="text-h3">
          Invite someone
        </h2>
        <p className="mt-3 max-w-read text-sm leading-relaxed text-muted">
          Each link works once. Send it to one person; their submission arrives here as
          pending and appears on the site only after you approve it, and only if they
          allowed publication.
        </p>
        <div className="mt-6 max-w-wide">
          <InviteCreator />
        </div>
      </section>

      <Queue title="Waiting for review" entries={pending} empty="Nothing waiting." testId="pending" />
      <Queue title="Published" entries={approved} empty="Nothing published yet." testId="approved" />
      <Queue title="Rejected" entries={rejected} empty="Nothing rejected." testId="rejected" />

      <section className="mt-16 border-t border-border pt-10" aria-labelledby="links-title">
        <h2 id="links-title" className="text-h3">
          Links sent
        </h2>
        {invites.length === 0 ? (
          <p className="mt-4 text-sm text-faint">No links created yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border" data-testid="invite-list">
            {invites.map((inv) => {
              const state = inv.revokedAt ? "Withdrawn" : inv.usedAt ? "Used" : "Open";
              return (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm text-text">{inv.label}</p>
                    <p className="mt-0.5 text-xs text-faint" data-readout>
                      {RELATIONSHIP_LABEL[inv.relationship]} · created {fmt(inv.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted" data-readout>
                      {state}
                    </span>
                    {state === "Open" && (
                      <form action={revokeInviteAction}>
                        <input type="hidden" name="id" value={inv.id} />
                        <Button type="submit" className="px-3 py-1.5 text-xs">
                          Withdraw
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Container>
  );
}

function Queue({
  title,
  entries,
  empty,
  testId,
}: {
  title: string;
  entries: Entry[];
  empty: string;
  testId: string;
}) {
  return (
    <section className="mt-16 border-t border-border pt-10" data-testid={`queue-${testId}`}>
      <h2 className="text-h3">
        {title} <span className="text-base text-faint">{entries.length}</span>
      </h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-faint">{empty}</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </section>
  );
}

function EntryCard({ entry: e }: { entry: Entry }) {
  const shown = e.publishedQuote ?? e.quote;
  return (
    <article className="rounded-xl border border-border bg-surface p-5 sm:p-6" data-testid="entry" data-entry-name={e.name}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-text">
            {e.name}
            {e.profileUrl && (
              <a href={e.profileUrl} target="_blank" rel="noreferrer nofollow" className="ml-2 text-xs text-muted underline decoration-border underline-offset-4">
                profile
              </a>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {[e.role, e.company].filter(Boolean).join(", ") || "No role given"} ·{" "}
            {RELATIONSHIP_LABEL[e.relationship]}
          </p>
          <p className="mt-1 text-xs text-faint" data-readout>
            invited as “{e.inviteLabel}” · {fmt(e.createdAt)}
            {e.service ? ` · ${e.service}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/*
            Hidden text, not aria-label: a label on a generic span is prohibited ARIA and
            screen readers skip it, so the rating was silent. Caught by the axe check.
          */}
          <span className="flex items-center gap-0.5 text-accent">
            <span className="sr-only">{e.rating} out of 5</span>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} aria-hidden className={cn("size-4", i < e.rating ? "fill-current" : "text-faint")} />
            ))}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs",
              e.consent ? "border-border text-muted" : "border-border-strong text-text",
            )}
            data-testid="consent"
          >
            {e.consent ? "May be published" : "Private: no consent"}
          </span>
        </div>
      </div>

      <blockquote className="mt-4 max-w-read text-sm leading-relaxed whitespace-pre-line text-text">{shown}</blockquote>
      {e.publishedQuote && (
        <details className="mt-3 max-w-read text-xs text-muted">
          <summary className="cursor-pointer">Original, as written</summary>
          <p className="mt-2 whitespace-pre-line">{e.quote}</p>
        </details>
      )}

      {/* Trim for length only. The original is always kept beside it. */}
      <details className="mt-4 max-w-read">
        <summary className="cursor-pointer text-xs text-muted">Trim the published text</summary>
        <form action={saveQuoteAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={e.id} />
          <label htmlFor={`q-${e.id}`} className="sr-only">
            Published text for {e.name}
          </label>
          <textarea
            id={`q-${e.id}`}
            name="published_quote"
            defaultValue={shown}
            rows={5}
            maxLength={1200}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          />
          <p className="text-xs text-faint">Empty it and save to go back to the original.</p>
          <Button type="submit" className="px-3 py-1.5 text-xs">
            Save trim
          </Button>
        </form>
      </details>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {e.status !== "approved" && (
          <StatusButton id={e.id} status="approved" disabled={!e.consent} primary>
            {e.consent ? "Approve and publish" : "Cannot publish without consent"}
          </StatusButton>
        )}
        {e.status === "approved" && <StatusButton id={e.id} status="pending">Unpublish</StatusButton>}
        {e.status === "pending" && <StatusButton id={e.id} status="rejected">Reject</StatusButton>}
        {e.status === "rejected" && <StatusButton id={e.id} status="pending">Back to pending</StatusButton>}
        {e.status === "rejected" && (
          <form action={deleteEntryAction}>
            <input type="hidden" name="id" value={e.id} />
            <Button type="submit" className="px-3 py-1.5 text-xs">
              Delete permanently
            </Button>
          </form>
        )}
      </div>
    </article>
  );
}

function StatusButton({
  id,
  status,
  children,
  disabled = false,
  primary = false,
}: {
  id: number;
  status: Status;
  children: React.ReactNode;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <form action={setStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant={primary ? "primary" : "ghost"} disabled={disabled} className="px-3 py-1.5 text-xs">
        {children}
      </Button>
    </form>
  );
}

function fmt(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
