"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type Source = { n: number; label: string; href: string };

type State =
  | { kind: "idle" }
  | { kind: "streaming"; answer: string; sources: Source[] }
  | { kind: "answered"; answer: string; sources: Source[] }
  | { kind: "refused"; message: string }
  /** The model did not respond in time; this is what retrieval found. */
  | { kind: "degraded"; passage: string; label: string; href: string };

const SUGGESTIONS = [
  "What evals does CloseOps run?",
  "How is LedgerGuard's confidence score calculated?",
  "What can LedgerLab's acceptance gate not tell you?",
  "What did he do before software?",
];

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = state.kind === "streaming";

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || busy) return;

    setQuestion(trimmed);
    setState({ kind: "streaming", answer: "", sources: [] });

    let res: Response;
    try {
      res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
    } catch {
      setState({ kind: "refused", message: "Couldn't reach the agent. Check your connection." });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      setState({ kind: "refused", message: "The agent returned nothing." });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    let sources: Source[] = [];

    // NDJSON: one JSON event per line. A partial final line stays in the buffer
    // until the next chunk completes it.
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let event: { type: string; [k: string]: unknown };
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }

        if (event.type === "sources") {
          sources = event.sources as Source[];
          setState({ kind: "streaming", answer, sources });
        } else if (event.type === "delta") {
          answer += event.text as string;
          setState({ kind: "streaming", answer, sources });
        } else if (event.type === "refusal") {
          setState({ kind: "refused", message: event.message as string });
          return;
        } else if (event.type === "degraded") {
          setState({
            kind: "degraded",
            passage: event.passage as string,
            label: event.label as string,
            href: event.href as string,
          });
          return;
        }
      }
    }

    setState({ kind: "answered", answer, sources });
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          Ask a question about Aneeq’s work
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 focus-within:border-text">
          <span className="text-muted" data-readout aria-hidden>
            &gt;
          </span>
          <input
            id="ask-input"
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={400}
            placeholder="What evals does CloseOps run?"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-faint"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !question.trim()}
            aria-label="Ask"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-ink text-on-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </form>

      {state.kind === "idle" && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => void ask(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors duration-200 hover:border-border-strong/50 hover:text-text"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite" aria-atomic="false">
        {state.kind === "refused" && (
          <Surface className="mt-6 border-halt/30 bg-halt-dim p-6">
            <p className="text-xs text-halt uppercase" data-readout>
              refused
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{state.message}</p>
            <p className="mt-4 text-xs text-faint">
              This is the designed path, not a failure. Retrieval decides it before the model
              is called, so a question outside the corpus costs nothing and cannot be talked
              into an answer.
            </p>
          </Surface>
        )}

        {state.kind === "degraded" && (
          <Surface className="mt-6 border-gate/30 bg-gate-dim p-6">
            <p className="text-xs text-gate uppercase" data-readout>
              model unavailable. Retrieval only
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The model didn’t respond in time. Here is the passage retrieval found,
              unedited. Which is what any answer would have been drawn from anyway.
            </p>
            <p className="mt-5 border-l-2 border-gate/40 pl-4 text-sm leading-relaxed text-text">
              {state.passage}
            </p>
            <Link
              href={state.href}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors duration-200 hover:border-border-strong/50 hover:text-text"
              data-readout
            >
              <span className="text-pass">[1]</span>
              {state.label}
            </Link>
          </Surface>
        )}

        {(state.kind === "streaming" || state.kind === "answered") && (
          <Surface className="mt-6 p-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-text">
              {state.answer}
              {state.kind === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-muted align-text-bottom" />
              )}
            </p>

            {state.sources.length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs text-faint" data-readout>
                  sources
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {state.sources.map((s) => (
                    <li key={s.n}>
                      <Link
                        href={s.href}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs",
                          "text-muted transition-colors duration-200 hover:border-border-strong/50 hover:text-text",
                        )}
                        data-readout
                      >
                        <span className="text-pass">[{s.n}]</span>
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Surface>
        )}
      </div>
    </div>
  );
}
