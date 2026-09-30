import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getAdmin } from "@/lib/admin-session";

const ERRORS: Record<string, string> = {
  denied: "That GitHub account is not allowed in. Only the site owner can sign in here.",
  state: "The sign-in could not be verified. Please start again.",
  github: "GitHub did not complete the sign-in. Please try again.",
  "not-configured": "Sign-in is not configured on this deployment yet.",
};

/** The admin sign-in. Already signed in goes straight to the feedback queue. */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin/feedback");
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? ERRORS.github) : null;

  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        admin
      </p>
      <h1 className="mt-5 max-w-wide text-h1">Sign in</h1>
      <p className="mt-8 max-w-read text-lead text-muted">
        This area is for the site owner. Sign in with GitHub to review feedback and create
        invite links.
      </p>

      {message && (
        <p role="alert" className="mt-8 max-w-read rounded-lg border border-halt/40 px-4 py-3 text-sm text-halt" data-testid="signin-error">
          {message}
        </p>
      )}

      {/* A plain link, not a button: it is a navigation to GitHub and works without JS. */}
      <a
        href="/api/auth/signin/github"
        className="mt-10 inline-flex min-h-12 items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-on-ink transition-opacity hover:opacity-90"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.78.54A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
        </svg>
        Sign in with GitHub
      </a>
    </Container>
  );
}
