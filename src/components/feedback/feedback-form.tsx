"use client";

import { Star } from "lucide-react";
import { Fragment, useActionState, useEffect, useRef } from "react";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: FeedbackState = { status: "idle" };

/**
 * The invited feedback form.
 *
 * Mirrors ContactForm on purpose: same field wiring, same honeypot, same echoed values
 * on failure, same polite live region. It posts through a Server Action, so it works
 * with scripting off.
 *
 * Only name, rating and the feedback itself are required. Role, company, the work and
 * a profile link are optional because asking for all of it up front is a reason not to
 * bother. Consent is its own explicit tick: feedback without it is still welcome and
 * still reaches the owner, it simply never appears on the site.
 *
 * Once it succeeds the form is replaced by a confirmation, because the link is spent:
 * leaving a filled-in form on screen invites a second submit that can only fail.
 */
export function FeedbackForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(submitFeedback, initial);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // The reply is the last thing in the form and can land below the fold.
  useEffect(() => {
    if (state.status === "idle") return;
    statusRef.current?.scrollIntoView({ block: "center" });
  }, [state]);

  if (state.status === "ok") {
    return (
      <div className="mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8" data-testid="feedback-sent">
        <p role="status" aria-live="polite" className="text-h3">
          {state.message}
        </p>
        <p className="mt-3 max-w-read text-sm leading-relaxed text-muted">
          Nothing goes on the site until I have approved it, and only if you ticked the box
          allowing it. This link has now been used, so it will not accept another
          submission.
        </p>
      </div>
    );
  }

  const v = state.values;

  return (
    <form action={action} className="mt-8 space-y-6" noValidate>
      <input type="hidden" name="token" value={token} />

      {/* Honeypot: off-screen rather than display:none, and not reachable by tab. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="fb-company-website">Company website</label>
        <input id="fb-company-website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Your name" error={state.fieldErrors?.name}>
          {(a) => (
            <input {...a} key={`name-${v?.name ?? ""}`} defaultValue={v?.name ?? ""} type="text" required autoComplete="name" className={inputCls} />
          )}
        </Field>
        <Field id="role" label="Your role (optional)" error={state.fieldErrors?.role}>
          {(a) => (
            <input {...a} key={`role-${v?.role ?? ""}`} defaultValue={v?.role ?? ""} type="text" autoComplete="organization-title" className={inputCls} />
          )}
        </Field>
        <Field id="company" label="Company (optional)" error={state.fieldErrors?.company}>
          {(a) => (
            <input {...a} key={`company-${v?.company ?? ""}`} defaultValue={v?.company ?? ""} type="text" autoComplete="organization" className={inputCls} />
          )}
        </Field>
        <Field id="service" label="What was the work? (optional)" error={state.fieldErrors?.service}>
          {(a) => (
            <input {...a} key={`service-${v?.service ?? ""}`} defaultValue={v?.service ?? ""} type="text" placeholder="Agent engineering, evaluation, training…" className={inputCls} />
          )}
        </Field>
      </div>

      {/*
        A fieldset, because five radios are one question. Rendered 5 to 1 and reversed
        in CSS so the fill cascades down from the chosen star with scripting off.
      */}
      <fieldset>
        <legend className="block text-sm text-muted">How would you rate working together?</legend>
        <div
          className="rating-stars mt-2"
          {...(state.fieldErrors?.rating ? { "aria-describedby": "rating-error", "aria-invalid": true } : {})}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <Fragment key={n}>
              <input type="radio" id={`rating-${n}`} name="rating" value={n} required defaultChecked={v?.rating === String(n)} />
              <label htmlFor={`rating-${n}`}>
                <Star className="size-6" aria-hidden />
                <span className="sr-only">{n} out of 5</span>
              </label>
            </Fragment>
          ))}
        </div>
        {state.fieldErrors?.rating && (
          <p id="rating-error" className="mt-2 text-sm text-halt">
            {state.fieldErrors.rating}
          </p>
        )}
      </fieldset>

      <Field id="message" label="Your feedback or recommendation" error={state.fieldErrors?.message}>
        {(a) => (
          <textarea {...a} key={`message-${v?.message ?? ""}`} defaultValue={v?.message ?? ""} required rows={7} maxLength={1200} className={cn(inputCls, "resize-y")} />
        )}
      </Field>

      <Field id="profileUrl" label="LinkedIn or profile link (optional)" error={state.fieldErrors?.profileUrl}>
        {(a) => (
          <input {...a} key={`profile-${v?.profileUrl ?? ""}`} defaultValue={v?.profileUrl ?? ""} type="url" inputMode="url" placeholder="https://linkedin.com/in/…" className={inputCls} />
        )}
      </Field>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          key={`consent-${String(v?.consent ?? false)}`}
          defaultChecked={v?.consent ?? false}
          className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
        />
        <label htmlFor="consent" className="text-sm leading-relaxed text-muted">
          I agree this may be published on this site with my name, role and company.
          Leave it unticked and it stays private between us.
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending…" : "Send feedback"}
        </Button>
        <p className="text-xs text-faint">Nothing is published without your permission and my approval.</p>
      </div>

      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        className={cn("min-h-5 text-sm", state.status === "error" && "text-halt")}
      >
        {state.status === "error" && state.message ? state.message : ""}
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors duration-200 placeholder:text-faint focus-visible:border-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text aria-[invalid=true]:border-halt";

type FieldAria = { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string };

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  /** Render prop so the aria wiring cannot be forgotten at a call site. */
  children: (aria: FieldAria) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      <div className="mt-2">
        {children({ id, name: id, ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}) })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-halt">
          {error}
        </p>
      )}
    </div>
  );
}
