"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Read by `BackLink` to decide whether stepping back stays on this site. */
export const PREV_PATH_KEY = "prev-path";
const CURRENT_PATH_KEY = "current-path";

/**
 * Remembers the page you came from, so "Back" can mean back.
 *
 * Neither of the obvious signals works here. `document.referrer` is empty for every
 * client-side navigation, which is precisely the case that matters. `history.length`
 * counts the blank page a tab opens on, so a visitor arriving straight from a shared
 * link looks identical to one who has been browsing — and stepping back lands them on
 * `about:blank`. Next's own history state carries no index to read either.
 *
 * So this records it. `sessionStorage` is per-tab, which is the right scope: a new tab
 * opened on a project page starts with nothing recorded and correctly falls back to a
 * real link, while a tab that has been browsing keeps its trail.
 */
export function NavigationMemory() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const current = sessionStorage.getItem(CURRENT_PATH_KEY);
      // Guarded so a reload, which re-runs this with an unchanged pathname, does not
      // overwrite the genuine previous page with the current one.
      if (current && current !== pathname) {
        sessionStorage.setItem(PREV_PATH_KEY, current);
      }
      sessionStorage.setItem(CURRENT_PATH_KEY, pathname);
    } catch {
      // Safari private mode and some extensions throw on storage. A back link that
      // falls back to its href is a fine outcome; a crashed layout is not.
    }
  }, [pathname]);

  return null;
}
