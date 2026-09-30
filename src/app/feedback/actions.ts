"use server";

import { z } from "zod";
import { submitWithInvite } from "@/lib/feedback/store";
import { site } from "@/lib/site";

/**
 * A feedback submission from someone holding an invite link.
 *
 * Stored as pending and nothing else. It reaches the public page only after the owner
 * approves it from /admin/feedback, and only if the person ticked consent. The invite
 * is spent by the same database statement that stores the entry, so one link produces
 * at most one submission.
 *
 * No rate limit of its own, unlike the contact form: an invite is a secret, single-use
 * credential, so an attacker without one cannot submit at all, and with one can submit
 * exactly once.
 */
export type FeedbackState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<"name" | "role" | "company" | "service" | "rating" | "message" | "profileUrl", string>
  >;
  /** Echoed back on failure so a rejected form does not lose what was written. */
  values?: {
    name: string;
    role: string;
    company: string;
    service: string;
    rating: string;
    message: string;
    profileUrl: string;
    consent: boolean;
  };
};

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || undefined);

const schema = z.object({
  name: z.string().trim().min(2, "Please give your name.").max(120),
  role: optional(160),
  company: optional(160),
  service: optional(160),
  rating: z.coerce
    .number({ message: "Please choose a rating." })
    .int()
    .min(1, "Please choose a rating.")
    .max(5, "Please choose a rating."),
  message: z
    .string()
    .trim()
    .min(20, "A little more detail helps.")
    .max(1200, "Please keep it under 1,200 characters."),
  profileUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Please give a full https:// link.")
    .transform((v) => v || undefined),
  consent: z.boolean(),
});

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  // A hidden field rather than a bound argument, so the form still posts with
  // scripting off. It is only a lookup key: the database decides whether it is valid.
  const token = String(formData.get("token") ?? "");

  // Honeypot. Real people do not fill in a field they cannot see.
  if (formData.get("company_website")) {
    return { status: "ok", message: "Thank you. That has been sent." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    company: String(formData.get("company") ?? ""),
    service: String(formData.get("service") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    message: String(formData.get("message") ?? ""),
    profileUrl: String(formData.get("profileUrl") ?? ""),
    consent: formData.get("consent") === "on",
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

  let stored: boolean;
  try {
    stored = await submitWithInvite(token, {
      name: parsed.data.name,
      role: parsed.data.role,
      company: parsed.data.company,
      service: parsed.data.service,
      rating: parsed.data.rating,
      quote: parsed.data.message,
      profileUrl: parsed.data.profileUrl,
      consent: parsed.data.consent,
    });
  } catch {
    return {
      status: "error",
      message: `That did not save. Please try again, or email ${site.email} directly.`,
      values: raw,
    };
  }

  if (!stored) {
    return {
      status: "error",
      message: "This link has already been used or is no longer active.",
      values: raw,
    };
  }

  await notifyOwner(parsed.data.name, parsed.data.rating).catch(() => {});

  // A receipt, not a promise: it confirms delivery, which is what the sender needs.
  return { status: "ok", message: "Thank you. That has been sent." };
}

/**
 * An email to the owner that something is waiting, when Resend is configured.
 *
 * Deliberately carries no feedback text. The email is a nudge to open the admin page,
 * so nothing unapproved has to sit in an inbox, and a failed send never fails the
 * submission: the entry is already stored.
 */
async function notifyOwner(name: string, rating: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "onboarding@resend.dev", // see contact/actions.ts
      to: process.env.CONTACT_TO ?? site.email,
      subject: `New feedback waiting for review: ${name}, ${rating}/5`,
      text: `${name} left feedback (${rating}/5). Review it at /admin/feedback.`,
    }),
  });
}
