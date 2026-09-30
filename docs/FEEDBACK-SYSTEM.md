# Feedback system

Invite-only feedback from clients, former employers and colleagues, approved by the
owner before anything is published.

## How it works

1. **Invite.** At `/admin/feedback` the owner creates a link for one person, labelled
   with who it is for and the relationship (client, former employer, colleague).
   The link is shown **once**: only a SHA-256 hash of its token is stored, so a lost
   link cannot be recovered, only withdrawn and reissued.
2. **Submit.** The person opens `/feedback/<token>`, gives a name, a 1 to 5 rating and
   their feedback, with role, company, the work and a profile link optional, and
   ticks consent if it may be published. One link, one submission: the submission and
   the spending of the link happen in a single SQL statement.
3. **Review.** The entry arrives as *pending*. The owner can trim the published text
   (the original is always kept beside it), approve, reject, unpublish or delete.
   Approval is refused without consent.
4. **Publish.** `/feedback` shows entries that are approved **and** consented. The
   public query filters on both itself, so a row forced to "approved" in the database
   without consent still does not appear.

If `RESEND_API_KEY` is set, the owner gets an email when something is waiting. The email
carries no feedback text, only a nudge to open the admin page.

## Pieces

| Where | What |
|---|---|
| `src/lib/db.ts` | The only file that reads `DATABASE_URL`. Neon's HTTP driver. |
| `src/lib/feedback/store.ts` | Every feedback query. The only place feedback SQL is written. |
| `src/lib/admin-session.ts` | Signed session cookie (HMAC-SHA256 with `AUTH_SECRET`), 12 hours. |
| `src/app/api/auth/*` | GitHub sign-in, callback and sign-out. |
| `src/app/admin/feedback/` | The owner's queue. Every action re-checks the session. |
| `src/app/feedback/[token]/` | The invited form. Not indexed. |
| `scripts/db-migrate.ts` | Creates the tables. Idempotent. |
| `tests/feedback-flow.spec.ts` | End-to-end: access control, the full flow, consent, axe. |

## Environment variables

| Name | Local (`.env.local`) | Production (Vercel) |
|---|---|---|
| `DATABASE_URL` | Neon `dev` branch | Set automatically by the Neon integration |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth app with callback `http://localhost:3000/api/auth/callback/github` | A **second** OAuth app with callback `https://<live domain>/api/auth/callback/github` |
| `AUTH_SECRET` | Generated locally | A **different** random value |
| `ADMIN_GITHUB_LOGIN` | `Muhammad-Aneeq` | `Muhammad-Aneeq` |
| `RESEND_API_KEY` | Optional | Optional |

Without a database the site still builds and runs: the wall is empty, invite links
show the inactive page, and admin sign-in reports that it is not configured. CI relies
on this.

## Going live

1. Create the production GitHub OAuth app and add the four variables above to Vercel
   (Production).
2. Create the tables on the production branch, once:
   `DATABASE_URL="<production connection string>" npm run db:migrate`
3. Deploy, open `/admin`, sign in with GitHub.

## Tests

`npx playwright test tests/feedback-flow.spec.ts` runs against the database in
`.env.local`. It signs in by minting a session cookie with `AUTH_SECRET` rather than
driving GitHub, which would need real credentials, and it checks both ends of the
GitHub hop separately. Every row it creates is labelled with the run's id and deleted
afterwards. In CI, with no database, the file skips.
