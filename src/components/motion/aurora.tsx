"use client";

import { useEffect, useRef } from "react";

/**
 * The home hero's aurora. Server-rendered as a soft CSS gradient (the fallback, and what
 * shows with no JavaScript or no WebGL); the shader is imported after the page has
 * painted and fades in over it. Colours come from --aurora-a / --aurora-b on the live
 * theme, re-read when the theme flips.
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

    // Theme tokens are authored in oklch; a 1px canvas turns them into sRGB floats.
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const read = (token: string): [number, number, number] => {
      if (!probe) return [0.6, 0.65, 1];
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#a9baff";
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255];
    };
    let colours = { a: read("--aurora-a"), b: read("--aurora-b"), strength: document.documentElement.classList.contains("light") ? 0.55 : 0.85 };
    const mo = new MutationObserver(() => {
      colours = { a: read("--aurora-a"), b: read("--aurora-b"), strength: document.documentElement.classList.contains("light") ? 0.55 : 0.85 };
      handle?.redraw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    idle(async () => {
      const { startAurora } = await import("./aurora-gl");
      if (stopped) return;
      handle = startAurora(el, () => colours, still);
      if (handle) box.dataset.live = "";
    });

    return () => {
      stopped = true;
      mo.disconnect();
      handle?.stop();
    };
  }, []);

  return (
    <div ref={wrap} className="hero-aurora" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
