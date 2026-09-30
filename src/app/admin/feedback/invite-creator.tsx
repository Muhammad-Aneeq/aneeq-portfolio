"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { createInviteAction, type InviteState } from "./actions";

const initial: InviteState = { status: "idle" };

/**
 * Create an invite and show its link once.
 *
 * Once, because only a hash of the token is stored: after this panel is replaced the
 * link cannot be recovered, only revoked and reissued. The copy button is a
 * convenience; the link is also plain selectable text, so it works with scripting off.
 */
export function InviteCreator() {
  const [state, action, pending] = useActionState(createInviteAction, initial);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <form action={action} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
        <div>
          <label htmlFor="invite-label" className="block text-sm text-muted">
            Who is this link for?
          </label>
          <input
            id="invite-label"
            name="label"
            required
            maxLength={120}
            placeholder="e.g. Sarah at Northwind, invoice pipeline project"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          />
        </div>
        <div>
          <label htmlFor="invite-relationship" className="block text-sm text-muted">
            Relationship
          </label>
          <select
            id="invite-relationship"
            name="relationship"
            defaultValue="client"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            <option value="client">Client</option>
            <option value="employer">Former employer</option>
            <option value="colleague">Colleague</option>
          </select>
        </div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Creating…" : "Create link"}
        </Button>
      </form>

      {state.status === "error" && (
        <p role="alert" className="mt-3 text-sm text-halt">
          {state.message}
        </p>
      )}

      {state.status === "ok" && state.link && (
        <div className="mt-5 rounded-lg border border-border bg-surface-2 p-4" data-testid="new-invite">
          <p className="text-sm text-text">
            Link for <strong className="font-semibold">{state.label}</strong>. Copy it now: it
            is shown only once and cannot be recovered later.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-xs break-all text-text select-all" data-testid="new-invite-link">
              {state.link}
            </code>
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(state.link!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
