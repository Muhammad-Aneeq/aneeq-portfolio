"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { STATE_HEX, type StreamPalette } from "@/components/three/stream/constants";
import { StreamStill } from "@/components/three/stream/still";
import { StateLegend } from "@/components/ui/state-legend";
import {
  applyFpsProbe,
  logTier,
  probeFps,
  tierStore,
  type Tier,
} from "@/lib/three/tier";

const Canvas = dynamic(
  () => import("@/components/three/stream/canvas").then((m) => m.StreamCanvas),
  { ssr: false, loading: () => <StreamStill /> },
);

/**
 * The tier gate.
 *
 * The capability decision happens *here*, before the chunk is fetched — the placement is
 * the whole point. When this logic lived inside the lazy import, every visitor downloaded
 * and parsed three.js and the component then declined to render it: measured once at
 * 407 KB of script and a 7.7s LCP on a throttled mobile run, for a scene nobody saw.
 *
 * Tiers 2 and 3 get the canvas; 1 and 0 get the still. There is deliberately no poster
 * image tier any more — the still is an inline SVG that follows the theme, which a baked
 * PNG cannot. A poster rendered on graphite is a black rectangle on paper, and that is
 * exactly what the previous hero did when the light theme arrived.
 */
export function StreamHero({ className }: { className?: string }) {
  const base = useSyncExternalStore(
    tierStore.subscribe,
    tierStore.getSnapshot,
    tierStore.getServerSnapshot,
  );

  const [demotedTo, setDemotedTo] = useState<Tier | null>(null);
  const [ready, setReady] = useState(false);
  const [palette, setPalette] = useState<StreamPalette>({ neutral: "#657080", ...STATE_HEX });
  const tier: Tier = demotedTo !== null && demotedTo < base.tier ? demotedTo : base.tier;

  /*
    The slab colour is read from the live theme rather than hard-coded, and re-read when
    the theme class changes. WebGL cannot resolve a `var()`, so this is the bridge: one
    read on mount and one on each theme flip, never per frame.

    It goes through a canvas rather than straight to three.js. The tokens are authored in
    `oklch()`, and Chromium serialises the computed value as `lab(69.87% .847 5.3)` — which
    `THREE.Color` cannot parse. It does not throw; it warns and leaves the colour black,
    so the postings rendered as black slabs on a black ground and the scene looked empty.
    Painting one pixel and reading it back gets sRGB bytes for any colour the *browser*
    can parse, which is the only definition that matters here.
  */
  useEffect(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx2d = cv.getContext("2d", { willReadFrequently: true });

    const read = () => {
      if (!ctx2d) return;
      const styles = getComputedStyle(document.documentElement);
      const colour = (token: string) => {
        const raw = styles.getPropertyValue(token).trim();
        ctx2d.clearRect(0, 0, 1, 1);
        ctx2d.fillStyle = raw;
        ctx2d.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx2d.getImageData(0, 0, 1, 1).data;
        return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
      };
      setPalette({ neutral: colour("--border-strong"), pass: colour("--pass"), gate: colour("--gate"), halt: colour("--halt") });
    };

    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (base.tier < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const forced = base.reason.startsWith("forced");
    let cancelled = false;
    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 400);

    const handle = schedule(async () => {
      if (!forced) {
        const fps = await probeFps(2000);
        if (cancelled) return;
        const settled = applyFpsProbe(base, fps);
        if (settled.tier !== base.tier) {
          logTier(settled);
          setDemotedTo(settled.tier);
          if (settled.tier < 2) return;
        }
      }
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function" && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle as unknown as number);
      }
    };
  }, [base]);

  const live = tier >= 2 && ready;

  return (
    <figure className={className} data-scene-neutral={palette.neutral}>
      <div className="aspect-[4/3] w-full sm:aspect-[3/2]">
        {live ? (
          <Canvas
            tier={tier}
            palette={palette}
            onTierDrop={() => setDemotedTo((tier - 1) as Tier)}
          />
        ) : (
          <StreamStill />
        )}
      </div>

      <StateLegend className="mt-4" />

      {/*
        Server-rendered on every tier, including the still.

        Nothing releases the gate in this replay but the loop itself. An animation of a
        governance control approving its own work, on a site whose argument is that a
        person must stand in that position, is the one element here that could be read as
        a claim rather than a picture. So it says what it is.
      */}
      <figcaption className="mt-3 text-xs leading-relaxed text-faint" data-readout>
        Illustrative replay. The approval step is simulated; in the real systems a person
        signs it.
      </figcaption>
    </figure>
  );
}
