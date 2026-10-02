"use client";

import { useEffect } from "react";

const TARGETS = ".interactive-surface, .demo-card";

/**
 * Cursor spotlight for cards: one delegated listener for the whole site that writes the
 * pointer position into --mx / --my on whichever card is under it; CSS paints the glow
 * (see `.spot` rules in workbench.css). Mouse and trackpad only: on touch there is no
 * hover to follow.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(TARGETS);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
