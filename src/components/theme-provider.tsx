"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, type ComponentProps } from "react";

/* Kept in step with `--bg` in globals.css: graphite and cool paper. */
const THEME_COLOR = { dark: "#141821", light: "#eef1f7" } as const;

/**
 * Keeps `<meta name="theme-color">` honest.
 *
 * The static `viewport.themeColor` in layout.tsx keys off `prefers-color-scheme`
 * alone, which is now only half the story: the theme resolves from an explicit
 * stored choice first, the OS preference second, dark third. A visitor who has
 * chosen light on a dark OS would otherwise get the light page under dark browser
 * chrome, which on iOS Safari is a visible band of the wrong colour.
 *
 * Doing it here rather than in `generateViewport` is deliberate. A cookie-driven
 * viewport makes the route dynamic â€” the Next docs are explicit that runtime data
 * in `generateViewport()` forces a Suspense boundary around <body> or an
 * `instant = false` opt-out. Every route here is prerendered and sits under a
 * Lighthouse budget; trading that for a meta tag would be a bad deal. The tag is
 * cosmetic, so correcting it on the client is the proportionate fix.
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = THEME_COLOR[resolvedTheme === "light" ? "light" : "dark"];
    const tags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

    if (tags.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
      return;
    }

    // Next may emit more than one (one per media query). Collapse them: drop the
    // media attribute so none of them can win on an OS preference we do not use.
    tags.forEach((tag) => {
      tag.removeAttribute("media");
      tag.content = color;
    });
  }, [resolvedTheme]);

  return null;
}

/*
  "Dark when the OS states no preference" â€” and why there is no code here for it.

  I wrote a component to handle that case, then measured whether the case is observable.
  It is not. In Chromium, a context with `prefers-color-scheme: no-preference` reports
  `(prefers-color-scheme: light)` as **true** and `(prefers-color-scheme: no-preference)`
  as false â€” the `no-preference` keyword was dropped from the colour-scheme media feature,
  so a browser with no stated preference is indistinguishable from one that asked for
  light. A component branching on "neither query matches" could never run.

  Dark is still the default in the case that genuinely has no signal: with JavaScript
  disabled no class is written at all, and `:root` in globals.css carries the dark tokens.
  That is asserted in tests/a11y.spec.ts rather than described here.
*/

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
