"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { site } from "@/lib/site";

/**
 * Feedback submission.
 *
 * Mail, not a database. A submission is emailed and nothing else happens to it: the
 * public wall renders from `src/content/feedback.ts`, which is edited by hand. That
 * keeps one property worth having on a portfolio, which is that no stranger can
 * publish text onto it. The cost is a manual step per entry, which at this volume is
 * the right trade.
 *
 * Deliberately close to `submitContact`: same validation shape, same honeypot, same
 * per-instance rate limit, same echoed values on failure. Two forms on one site that
 * behave differently under error is a worse outcome than a little duplication.
 */
export type FeedbackState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "role" | "message", string>>;
  /** Echoed back on failure so a rejected form does not lose what was written. */
  values?: { name: string; role: string; message: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Please give a name.").max(120),
  role: z.string().trim().max(160).optional(),
  message: z
    .string()
    .trim()
    .min(20, "A little more detail helps.")
    .max(600, "Please keep it under 600 characters."),
});

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

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  // Honeypot. Real people do not fill in a field they cannot see.
  if (formData.get("company")) {
    return { status: "ok", message: "Thank you. It has reached me." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FeedbackState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<FeedbackState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the form.", fieldErrors, values: raw };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return {
      status: "error",
      message: "That is a few in a short time. Please try again shortly.",
      values: raw,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? site.email;

  // Not configured yet. Say so plainly rather than pretending it was sent, which on a
  // feedback form would mean someone's words quietly going nowhere.
  if (!apiKey) {
    return {
      status: "error",
      message: `The form isn't connected to a mail provider yet. Please email ${site.email} directly.`,
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
        from: process.env.CONTACT_FROM ?? "onboarding@resend.dev", // see contact/actions.ts
        to,
        subject: `Portfolio feedback. ${parsed.data.name}`,
        text:
          `From: ${parsed.data.name}` +
          (parsed.data.role ? ` (${parsed.data.role})` : "") +
          `\n\n${parsed.data.message}\n\n` +
          `To publish this, add it to src/content/feedback.ts.`,
      }),
    });

    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  } catch {
    return {
      status: "error",
      message: `That did not send. Please email ${site.email} directly.`,
      values: raw,
    };
  }

  return {
    status: "ok",
    message: "Thank you. It has reached me, and I read every one.",
  };
}
