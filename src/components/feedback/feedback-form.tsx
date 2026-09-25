"use client";

import { Star } from "lucide-react";
import { Fragment, useActionState, useEffect, useRef } from "react";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: FeedbackState = { status: "idle" };

/**
 * Feedback form.
 *
 * Mirrors ContactForm on purpose: same field wiring, same honeypot, same echoed
 * values on failure, same polite live region. A visitor who has met one of these
 * forms should not have to learn the other.
 *
 * Only `name` and the feedback itself are required. Role is optional because asking
 * for a job title before someone can say something useful is a reason not to bother,
 * and an email field is absent entirely: this is not a lead form.
 */
export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitFeedback, initial);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // Same reason as ContactForm: the reply is the last thing in the form and can
  // land below the fold, making a working submission look like a dead button.
  useEffect(() => {
    if (state.status === "idle") return;
    statusRef.current?.scrollIntoView({ block: "center" });
  }, [state]);

  return (
    <form action={action} className="mt-8 space-y-6" noValidate>
      {/* Honeypot: off-screen rather than display:none, and not reachable by tab. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="fb-company">Company</label>
        <input id="fb-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={state.fieldErrors?.name}>
          {(a) => (
            <input
              {...a}
              key={`name-${state.values?.name ?? ""}`}
              defaultValue={state.values?.name ?? ""}
              type="text"
              required
              autoComplete="name"
              className={inputCls}
            />
          )}
        </Field>

        <Field id="role" label="Role and company (optional)" error={state.fieldErrors?.role}>
          {(a) => (
            <input
              {...a}
              key={`role-${state.values?.role ?? ""}`}
              defaultValue={state.values?.role ?? ""}
              type="text"
              autoComplete="organization-title"
              className={inputCls}
            />
          )}
        </Field>
      </div>

      <Field id="service" label="What was the work? (optional)" error={state.fieldErrors?.service}>
        {(a) => (
          <input
            {...a}
            key={`service-${state.values?.service ?? ""}`}
            defaultValue={state.values?.service ?? ""}
            type="text"
            placeholder="Agent engineering, evaluation, training…"
            className={inputCls}
          />
        )}
      </Field>

      {/*
        A fieldset, because five radios are one question. Without the grouping a screen
        reader announces "1 out of 5, radio" with no idea what is being rated.

        Rendered 5 to 1 and reversed in CSS so the fill can cascade down from the chosen
        star. The label text is the accessible name; the star is decoration on top.
      */}
      <fieldset>
        <legend className="block text-sm text-muted">How would you rate the work?</legend>
        <div
          className="rating-stars mt-2"
          {...(state.fieldErrors?.rating
            ? { "aria-describedby": "rating-error", "aria-invalid": true }
            : {})}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <Fragment key={n}>
              <input
                type="radio"
                id={`rating-${n}`}
                name="rating"
                value={n}
                required
                defaultChecked={state.values?.rating === String(n)}
              />
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

      <Field id="message" label="Your feedback" error={state.fieldErrors?.message}>
        {(a) => (
          <textarea
            {...a}
            key={`message-${state.values?.message ?? ""}`}
            defaultValue={state.values?.message ?? ""}
            required
            rows={5}
            maxLength={600}
            className={cn(inputCls, "resize-y")}
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending…" : "Send feedback"}
        </Button>
        <p className="text-xs text-faint">
          Nothing is published automatically. I add entries by hand.
        </p>
      </div>

      {/*
        Always in the DOM so it can be observed, even when empty. `aria-live="polite"`
        rather than `assertive`: the result of a form you just submitted is worth
        waiting for the current utterance to finish.
      */}
      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm",
          state.status === "ok" && "text-text",
          state.status === "error" && "text-halt",
        )}
      >
        {state.status !== "idle" && state.message ? state.message : ""}
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors duration-200 placeholder:text-faint focus-visible:border-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text aria-[invalid=true]:border-halt";

type FieldAria = {
  id: string;
  name: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

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
        {children({
          id,
          name: id,
          ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}),
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-halt">
          {error}
        </p>
      )}
    </div>
  );
}
