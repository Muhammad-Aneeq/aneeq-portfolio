import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_QUESTION_LENGTH,
  budgetExhausted,
  rateLimited,
  recordSpend,
} from "@/lib/ask/guards";
import { retrieve, shouldRefuse } from "@/lib/ask/retrieve";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().trim().min(3).max(MAX_QUESTION_LENGTH),
});

/**
 * The system prompt is the governance surface. Two rules do the work: answer only
 * from the passages, and refuse rather than reach. The refusal path is also enforced
 * before the model is ever called (see `shouldRefuse`) — the prompt is the second
 * layer, not the only one.
 */
const SYSTEM = `You answer questions about ${site.name}, an agentic AI engineer who builds multi-agent systems you can prove are right, proven first in accounting and finance.

You will be given numbered passages retrieved from his resume, case studies and project write-ups. Answer ONLY from those passages.

Rules:
- Cite the passages you used with bracketed numbers, like [1] or [2][3], placed inline where the claim appears.
- If the passages do not contain the answer, say so plainly in one sentence. Do not reason from general knowledge about AI engineering, and do not infer facts the passages do not state.
- Never invent a metric, date, employer, project name or number. If a figure is not in a passage, it does not exist.
- Be concise: two to four sentences unless the question genuinely needs more. No preamble, no "based on the passages".
- Write in third person about Aneeq. Plain prose, no headings, no bullet lists.`;

/** If the model has not produced a first token by now, fall back to retrieval. */
const FIRST_TOKEN_TIMEOUT_MS = 5_000;

type Event =
  | { type: "sources"; sources: { n: number; label: string; href: string }[] }
  | { type: "delta"; text: string }
  | { type: "refusal"; message: string }
  | { type: "degraded"; passage: string; label: string; href: string }
  | { type: "done"; outputTokens: number };

function stream(events: AsyncIterable<Event>): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ type: "refusal", message: "Something went wrong answering that. Try again, or email me directly." } satisfies Event)}\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

async function* refuse(message: string): AsyncIterable<Event> {
  yield { type: "refusal", message };
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return stream(refuse("That question is empty or too long. Keep it under 400 characters."));
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return stream(
      refuse(`That's a lot of questions in an hour. Email ${site.email} and you'll get a better answer anyway.`),
    );
  }

  if (budgetExhausted()) {
    return stream(
      refuse("The agent has hit its daily token budget. A deliberate cap, not an outage. It resets at midnight UTC."),
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return stream(
      refuse("The agent isn't connected to a model yet. Everything it would cite is on the work and labs pages."),
    );
  }

  const question = parsed.data.question;
  const results = retrieve(question, 5);

  // The refusal is decided by retrieval, before any model call. A weak-retrieval
  // question costs nothing and cannot be talked into an answer by the prompt.
  if (shouldRefuse(question, results)) {
    return stream(
      refuse(
        "That isn't in what I know about. I only answer from Aneeq's resume, case studies and project write-ups. Try asking about one of the projects, his evaluation approach, or his background.",
      ),
    );
  }

  const sources = results.map((r, i) => ({
    n: i + 1,
    label: r.chunk.label,
    href: r.chunk.href,
  }));

  const passages = results
    .map((r, i) => `[${i + 1}] (${r.chunk.label})\n${r.chunk.text}`)
    .join("\n\n");

  const client = new Anthropic({ apiKey });

  async function* run(): AsyncIterable<Event> {
    yield { type: "sources", sources };

    const top = results[0];
    const controller = new AbortController();

    // A provider outage should degrade to what retrieval already found, not to an
    // error. The passage is on the page either way — the model only rephrases it.
    const timer = setTimeout(() => controller.abort(), FIRST_TOKEN_TIMEOUT_MS);
    let firstToken = true;

    try {
      const model = client.messages.stream(
        {
          model: "claude-opus-5",
          // Short grounded answers. A low cap is the point here, not an oversight.
          max_tokens: 700,
          system: SYSTEM,
          // Thinking stays on (the default) at low effort: this is a short extractive
          // answer, so depth buys nothing — and disabling thinking on this model can
          // leak internal tags into the visible response.
          output_config: { effort: "low" },
          messages: [
            {
              role: "user",
              content: `Passages:\n\n${passages}\n\n---\n\nQuestion: ${question}`,
            },
          ],
        },
        { signal: controller.signal },
      );

      for await (const event of model) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          if (firstToken) {
            // Generation started, so the timeout has done its job.
            clearTimeout(timer);
            firstToken = false;
          }
          yield { type: "delta", text: event.delta.text };
        }
      }

      const final = await model.finalMessage();
      recordSpend(final.usage.output_tokens);
      yield { type: "done", outputTokens: final.usage.output_tokens };
    } catch {
      if (firstToken) {
        yield {
          type: "degraded",
          passage: top.chunk.text,
          label: top.chunk.label,
          href: top.chunk.href,
        };
      } else {
        // Failed mid-answer. Say so rather than leaving a truncated sentence
        // looking like a complete one.
        yield { type: "refusal", message: "That answer was cut off. Try asking again." };
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return stream(run());
}
