import Link from "next/link";
import { Timeline, TimelineItem } from "@/components/motion/timeline";
import type { Role } from "@/content/resume";

/**
 * Roles as a timeline rather than a flat list.
 *
 * The survey found /resume rendering ~4,800px across five sections with zero images,
 * zero cards and zero animated elements — the single most text-heavy surface on the
 * site. A spine with a marker per role gives it a shape to scan, and the dates become a
 * column instead of a trailing detail.
 *
 * **One source, two depths.** `/teaching` and `/resume` render the same three teaching
 * roles from the same array in `content/resume.ts` — but they were rendering them
 * *identically*, so a reader arriving from one to the other met the same four bullets
 * twice and the second page added nothing. `/teaching` is an argument about teaching and
 * needs the headline of each role; `/resume` is the document someone reads when they have
 * already decided to check, and needs all of it.
 *
 * The truncation lives here rather than in the content, so there is still exactly one
 * place a bullet is written and no chance of a short version drifting from a long one.
 */
export function RoleList({
  roles,
  maxBullets,
  moreHref,
}: {
  roles: Role[];
  /** Show at most this many bullets per role. Omit for the full detail. */
  maxBullets?: number;
  /** Where the full detail lives, linked once when anything was truncated. */
  moreHref?: string;
}) {
  const truncated =
    maxBullets !== undefined && roles.some((r) => r.bullets.length > maxBullets);

  return (
    <>
    <Timeline className="mt-10 space-y-14">
      {roles.map((role) => (
        <TimelineItem
          key={`${role.org}-${role.title}`}
          meta={`${role.start} to ${role.end}`}
          title={
            <>
              {role.title}
              <span className="text-muted"> · {role.org}</span>
            </>
          }
          subtitle={`${role.orgNote ? `${role.orgNote} · ` : ""}${role.mode} · ${role.location}`}
        >
          <ul className="mt-5 space-y-3">
            {(maxBullets === undefined ? role.bullets : role.bullets.slice(0, maxBullets)).map(
              (b) => (
                <li
                  key={b.slice(0, 32)}
                  className="flex gap-3 text-sm leading-relaxed text-muted"
                >
                  <span
                    className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                    aria-hidden
                  />
                  {b}
                </li>
              ),
            )}
          </ul>
        </TimelineItem>
      ))}
    </Timeline>

    {/* Said once, at the end, rather than "+2 more" under every role — three identical
        disclosure links in a row is noise, and the destination is the same each time. */}
    {truncated && moreHref && (
      <Link
        href={moreHref}
        className="mt-10 inline-flex items-center gap-2 text-sm text-muted transition-colors duration-200 hover:text-text"
      >
        Full detail for each role on the resume <span aria-hidden>→</span>
      </Link>
    )}
    </>
  );
}
