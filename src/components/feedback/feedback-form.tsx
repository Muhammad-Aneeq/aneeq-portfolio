"use client";

import { useActionState } from "react";
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
