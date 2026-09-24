/**
 * Build-time feature flags.
 *
 * All three are inlined by Next at build time from next.config.ts, so they are
 * safe in both server and client components and cost nothing at runtime. When a
 * flag is false the bundler can drop the branches behind it entirely.
 *
 * The pattern throughout: a feature is either live or it does not exist on the
 * site. Nothing renders a link to something that is not there yet.
 */

/** True when a provider key was present at build time. */
export const ASK_ENABLED = process.env.NEXT_PUBLIC_ASK_ENABLED === "1";

/** True once the project repositories are public. */
export const REPOS_PUBLIC = process.env.NEXT_PUBLIC_REPOS_PUBLIC === "1";

/** Set once LedgerLab is deployed. Empty string means no live demo yet. */
export const LEDGERLAB_DEMO_URL = process.env.NEXT_PUBLIC_LEDGERLAB_DEMO_URL ?? "";
