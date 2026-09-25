import { z } from "zod";

/**
 * Client feedback.
 *
 * Written by people who have actually been delivered work, not by site visitors with
 * an opinion on the copy. That is why an entry carries a rating and the service it
 * applied to: a five out of five means nothing unless a reader can see what was
 * bought and who is saying it.
 *
 * **Deliberately empty.** Nothing appears on the site until a real client has sent
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
 *   role: "Their role, and where",      // optional
 *   service: "Agent engineering",       // optional, what the work was
 *   rating: 5,                          // 1 to 5, as they gave it
 *   link: "https://linkedin.com/in/…",  // optional, lets a reader verify the person
 *   date: "2026-09-25",                 // ISO, the day it was received
 * }
 * ```
 */
export const feedbackSchema = z.object({
  quote: z.string().trim().min(20).max(600),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160).optional(),
  /** What the engagement was. Gives a reader the context the rating applies to. */
  service: z.string().trim().min(2).max(160).optional(),
  rating: z.number().int().min(1).max(5),
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
