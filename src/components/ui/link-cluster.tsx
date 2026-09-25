import { ExternalLink, Lock, PlayCircle } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { REPOS_PUBLIC } from "@/lib/features";
import { cn } from "@/lib/utils";

export type ProjectLinks = {
  /** A deployed URL. The single strongest recruiter signal. */
  demo?: string;
  repo?: string;
  video?: string;
  /** This repo is confirmed public. Mirrors `repoPublic` in content/schema.ts. */
  repoPublic?: boolean;
};

const ITEM =
  "inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors duration-200 hover:border-border-strong/50 hover:text-text";

/**
 * Link row for a project.
 *
 * The repo URL is in the content whether or not the repository is public — but
 * rendering it while it is private would hand a hiring manager a 404, which is
 * worse than saying so. `REPOS_PUBLIC` flips all of them at once, so the site
 * never advertises a link it cannot honour.
 */
export function LinkCluster({
  links,
  className,
}: {
  links: ProjectLinks;
  className?: string;
}) {
  // Either the global switch after a full pre-flight, or this one repo confirmed
  // public on its own. See `repoPublic` in content/schema.ts.
  const repoVisible = Boolean(links.repo) && (REPOS_PUBLIC || links.repoPublic === true);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.demo && (
        <a href={links.demo} target="_blank" rel="noreferrer" className={ITEM}>
          <ExternalLink className="size-4" aria-hidden />
          Live demo
        </a>
      )}

      {links.video && (
        <a href={links.video} target="_blank" rel="noreferrer" className={ITEM}>
          <PlayCircle className="size-4" aria-hidden />
          Walkthrough
        </a>
      )}

      {repoVisible ? (
        <a href={links.repo} target="_blank" rel="noreferrer" className={ITEM}>
          <GithubIcon className="size-4" aria-hidden />
          Repo
        </a>
      ) : (
        /*
          "Walkthrough on request", not "Private, walkthrough on request".

          Checked every repo URL in the content against the GitHub API: eleven are
          public and now linked, and four resolve to nothing at all rather than to a
          private repository. Calling those private was a specific claim about a
          repository that does not exist. The offer is the true part, so that is what
          is left standing.
        */
        <span className={cn(ITEM, "cursor-default text-faint hover:border-border")}>
          <Lock className="size-4" aria-hidden />
          Walkthrough on request
        </span>
      )}
    </div>
  );
}
