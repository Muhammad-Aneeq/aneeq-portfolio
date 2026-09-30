"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import {
  RELATIONSHIPS,
  createInvite,
  deleteEntry,
  revokeInvite,
  setPublishedQuote,
  setStatus,
  type Status,
} from "@/lib/feedback/store";

/**
 * Admin actions. Every one calls `requireAdmin()` FIRST.
 *
 * A Server Action is a public endpoint: anyone can post to it without ever loading the
 * admin page, so the page being behind a login protects nothing on its own. The
 * session check lives in each action for exactly that reason, and a missing or forged
 * cookie throws before any database call is reached.
 */

function refresh() {
  revalidatePath("/admin/feedback");
  revalidatePath("/feedback");
}

const id = z.coerce.number().int().positive();

export type InviteState = { status: "idle" | "ok" | "error"; link?: string; label?: string; message?: string };

export async function createInviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  await requireAdmin();

  const parsed = z
    .object({
      label: z.string().trim().min(2, "Say who this link is for.").max(120),
      relationship: z.enum(RELATIONSHIPS),
    })
    .safeParse({ label: formData.get("label"), relationship: formData.get("relationship") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };

  const token = await createInvite(parsed.data.label, parsed.data.relationship);

  // Built from the request's own host, so the link is right on localhost and live.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  refresh();
  return { status: "ok", label: parsed.data.label, link: `${proto}://${host}/feedback/${token}` };
}

export async function revokeInviteAction(formData: FormData) {
  await requireAdmin();
  await revokeInvite(id.parse(formData.get("id")));
  refresh();
}

export async function setStatusAction(formData: FormData) {
  await requireAdmin();
  const status = z.enum(["pending", "approved", "rejected"]).parse(formData.get("status")) as Status;
  await setStatus(id.parse(formData.get("id")), status);
  refresh();
}

export async function saveQuoteAction(formData: FormData) {
  await requireAdmin();
  const text = z.string().max(1200).parse(String(formData.get("published_quote") ?? ""));
  await setPublishedQuote(id.parse(formData.get("id")), text);
  refresh();
}

export async function deleteEntryAction(formData: FormData) {
  await requireAdmin();
  await deleteEntry(id.parse(formData.get("id")));
  refresh();
}
