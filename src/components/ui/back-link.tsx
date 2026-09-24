"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PREV_PATH_KEY } from "@/components/navigation-memory";
import { cn } from "@/lib/utils";

/**
 * "Back" that means back.
 *
 * A project page can be reached from the home demo strip, from /work, from /labs or
 * from /demos, and a hard-coded link to /labs sent everyone to the same place
 * regardless — which is wrong three times out of four and loses the reader's position
 * in a list they had scrolled.
 *
 * It renders a real anchor to `fallbackHref`, so with JavaScript disabled, or on a
 * cold arrival from a search result or a shared link, it is an ordinary working link.
 * Only when the previous page was on this site does it intercept the click and step
 * back through history instead. Modified clicks — new tab, new window, middle click —
 * are left alone, because hijacking those is how you break someone's workflow.
 */
export function BackLink({
  fallbackHref,
  children,
  className,
}: {
  /** Where to go when there is no same-site page to return to. */
  fallbackHref: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <a
      href={fallbackHref}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;

        /*
          Read at click time, not at mount.

          Reading it once in a mount effect raced `NavigationMemory`: both run on the
          same client-side navigation, and when this one won the race it saw no stored
          path, latched `false`, and never re-checked — so Back fell through to /labs
          even though the visitor had arrived from the home page. By the time anyone
          clicks, every effect has long since run, so ordering cannot matter.
        */
        let cameFromThisSite = false;
        try {
          cameFromThisSite = Boolean(sessionStorage.getItem(PREV_PATH_KEY));
        } catch {
          // Storage unavailable (Safari private mode, some extensions). Falling
          // through to the href is the correct outcome.
        }

        // `router.back()` rather than a link to the stored path, so the browser
        // restores the reader's scroll position in the list they came from.
        if (cameFromThisSite) {
          event.preventDefault();
          router.back();
        }
      }}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted transition-colors duration-200 hover:text-text",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </a>
  );
}
