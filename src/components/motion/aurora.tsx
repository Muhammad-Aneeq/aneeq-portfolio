"use client";

import { useEffect, useRef } from "react";

/**
 * The home hero's backdrop: a live agent network (network-canvas.ts) over a soft accent
 * wash. Server-rendered as the wash alone, which is the fallback for no JavaScript; the
 * canvas is imported after first paint and fades in over it. Colours come from the live
 * theme's tokens and are re-read when the theme flips.
 *
 * It replaced a WebGL aurora that read as a muddy purple haze on the dark theme.
 */
export function Aurora() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    let stopped = false;
    let handle: { redraw: () => void; stop: () => void } | null = null;

    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const light = document.documentElement.classList.contains("light");
      return {
        node: s.getPropertyValue("--net-node").trim() || "#c9d4ff",
        line: s.getPropertyValue("--net-line").trim() || "#8fa6ff",
        pulse: s.getPropertyValue("--net-pulse").trim() || "#ffffff",
        strength: light ? 0.75 : 1,
      };
    };
    let colours = read();
    const mo = new MutationObserver(() => { colours = read(); handle?.redraw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    idle(async () => {
      const { startNetwork } = await import("./network-canvas");
      if (stopped) return;
      handle = startNetwork(el, () => colours, still);
      if (handle) box.dataset.live = "";
    });

    return () => { stopped = true; mo.disconnect(); handle?.stop(); };
  }, []);

  return (
    <div ref={wrap} className="hero-aurora" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
