"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { site } from "@/lib/site";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  /**
   * What the sender typed, echoed back so the form can refill itself.
   *
   * React resets an uncontrolled form once a Server Action resolves. That is the right
   * default for a form that succeeded and the wrong one for a form that failed
   * validation: mistyping an email address was wiping the message with it, and the only
   * recovery was to type the whole thing again. Anyone who had written a few paragraphs
   * would simply leave.
   *
   * Only returned on failure. A successful submission still clears, which is what
   * "Thanks, I'll be in touch" should leave behind.
   */
  values?: { name: string; email: string; message: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Please give a name.").max(120),
  email: z.email("That does not look like an email address.").max(200),
  message: z.string().trim().min(20, "A little more detail helps.").max(4000),
});

/**
 * In-memory, per-instance rate limit. Good enough for a personal site and honest
 * about what it is: on a multi-instance deploy each instance keeps its own counter.
 * A shared store is the upgrade if this ever matters.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot. Real people do not fill in a field they cannot see.
  if (formData.get("company")) {
    return { status: "ok", message: "Thanks. I'll be in touch." };
  }

  // Kept as strings so they can be handed straight back to the form on any failure.
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "message") {
        fieldErrors[field] ??= issue.message;
      }
    }
    return { status: "error", message: "Please check the form.", fieldErrors, values: raw };
  }

  const head = await headers();
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return {
      status: "error",
      message: `That's a few messages in a short window. Email ${site.email} directly and it will get there.`,
      values: raw,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? site.email;

  // Not configured yet. Say so plainly rather than pretending the message was sent —
  // a form that silently drops mail is worse than no form.
  if (!apiKey) {
    return {
      status: "error",
      message: `The form isn't connected to a mail provider yet. Please email ${site.email} directly. It reaches me immediately.`,
      values: raw,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "portfolio@aneeqkhatri.com",
        to,
        reply_to: parsed.data.email,
        subject: `Portfolio enquiry. ${parsed.data.name}`,
        text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
      }),
    });

    if (!res.ok) throw new Error(`provider responded ${res.status}`);

    return { status: "ok", message: "Thanks. I'll be in touch." };
  } catch {
    return {
      status: "error",
      message: `Something went wrong sending that. Please email ${site.email} directly.`,
      values: raw,
    };
  }
}
