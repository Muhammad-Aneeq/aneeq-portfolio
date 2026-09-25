import { z } from "zod";

/**
 * Published feedback.
 *
 * **Deliberately empty.** Nothing appears on the site until a real person has sent
 * something and it has been added here by hand. The form on /feedback emails
 * submissions rather than writing to this file, so no text reaches the public page
 * without being chosen, and the page cannot be used to publish anything unreviewed.
 *
 * The wall renders nothing while this list is empty, which is the same rule the rest
 * of the site follows: a section is either backed by something real or it is not there.
 * There are no sample or placeholder entries, because a portfolio whose argument is
 * "every claim here is checkable" cannot open with invented praise.
 *
 * To publish one, append an entry:
 *
 * ```ts
 * {
 *   quote: "What they actually wrote, trimmed but never reworded.",
 *   name: "Their name",
 *   role: "Their role, and where",     // optional
 *   link: "https://linkedin.com/in/…", // optional, lets a reader verify the person
 *   date: "2026-09-25",                // ISO, the day it was received
 * }
 * ```
 */
export const feedbackSchema = z.object({
  quote: z.string().trim().min(20).max(600),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160).optional(),
  /** A profile a reader can check. Feedback nobody can trace is worth less. */
  link: z.string().url().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type Feedback = z.infer<typeof feedbackSchema>;

const entries: Feedback[] = [];

/** Newest first, validated at module load so a malformed entry fails the build. */
export const feedback: Feedback[] = entries
  .map((entry) => feedbackSchema.parse(entry))
  .sort((a, b) => b.date.localeCompare(a.date));
