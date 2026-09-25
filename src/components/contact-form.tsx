"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: ContactState = { status: "idle" };

/**
 * The contact form.
 *
 * The validation, rate limiting and honesty about not being wired to a mail provider
 * were already here and all work. What was missing was the wiring that makes any of it
 * reach a screen reader:
 *
 *   · error text was rendered next to an input but never associated with it, so a
 *     non-sighted reader tabbing into a field in an error state heard "Email, edit text"
 *     and nothing about what was wrong with it. Now `aria-describedby` + `aria-invalid`.
 *   · the form-level status lived inside `{condition && ...}`, so the live region did not
 *     exist in the DOM until the moment it had something to say. Assistive tech has
 *     nothing to observe in that case and the announcement is unreliable. The region is
 *     now always present and only its contents change.
 *   · `outline-none` removed the focus ring and replaced it with a border colour change,
 *     which is both low-contrast and invisible to anyone who cannot distinguish it. The
 *     ring is back, on every field and on the submit button.
 */
export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const statusRef = useRef<HTMLParagraphElement>(null);

  /*
    Bring the reply into view once there is one.

    The live region is the last thing in the form, and on /contact the panel is tall
    enough that it sat below the fold: pressing Send produced no visible change, so the
    form read as broken while it was working perfectly. On the home page the same form
    happened to fit, which is why only one of them looked wrong.

    `block: "center"`, not `"nearest"`. Nearest scrolls the minimum distance, which
    parked the reply flush against the bottom edge of the viewport: on screen by one
    pixel and still easy to miss. Centring it puts the answer where the eye already is.
  */
  useEffect(() => {
    if (state.status === "idle") return;
    statusRef.current?.scrollIntoView({ block: "center" });
  }, [state]);

  return (
    <form action={action} className="mt-10 space-y-6" noValidate>
      {/* Honeypot: off-screen rather than display:none, and not reachable by tab. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/*
        `defaultValue` from the action's echoed values, and `key` so React re-mounts the
        input when they change.

        A Server Action resets an uncontrolled form when it resolves. On success that is
        correct. On a validation failure it meant a mistyped email address took the whole
        message with it — and the only way back was to type it again, which on a contact
        form is the moment someone gives up and does not write at all.
      */}
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

      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        {(a) => (
          <input
            {...a}
            key={`email-${state.values?.email ?? ""}`}
            defaultValue={state.values?.email ?? ""}
            type="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        )}
      </Field>

      <Field id="message" label="Message" error={state.fieldErrors?.message}>
        {(a) => (
          <textarea
            {...a}
            key={`message-${state.values?.message ?? ""}`}
            defaultValue={state.values?.message ?? ""}
            required
            rows={6}
            className={cn(inputCls, "resize-y")}
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>

      {/*
        Always in the DOM so it can be observed, even when empty. `aria-live="polite"`
        rather than `assertive`: the result of a form you just submitted is worth waiting
        for the current utterance to finish.
      */}
      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm",
          /* Success is neutral. A delivered message is not a verified claim, and
             `--pass` is reserved for governance states. The error keeps `--halt`:
             something genuinely stopped, and red-on-error is worth the one exception
             to "never colour alone" because the text says so too. */
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
