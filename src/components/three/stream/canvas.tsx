"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { StreamScene } from "@/components/three/stream/scene";
import {
  HALT_LABEL,
  PHASES,
  type StreamPalette,
  type PhaseId,
} from "@/components/three/stream/constants";
import type { Tier } from "@/lib/three/tier";

/**
 * The canvas, its labels, and the two reasons it stops rendering.
 *
 * **Labels are HTML, not textures.** They are the part of this scene that carries the
 * meaning — "awaiting approval", "halted" — and baking them into a texture would put the
 * one thing a reader has to understand outside the DOM, unreadable to a screen reader and
 * unselectable by anyone. They sit in an absolutely-positioned overlay and are swapped by
 * phase, with `aria-live` so a non-sighted reader hears the cycle rather than missing it.
 *
 * **It pauses twice over.** An IntersectionObserver stops the loop when the hero scrolls
 * away, and the document's visibility state stops it when the tab is backgrounded. An
 * infinite render loop for a canvas nobody is looking at is the single most expensive
 * thing a page like this can do, and neither browser will stop it for you.
 */

const DPR_CAP: Record<number, number> = { 3: 1.75, 2: 1.25 };


export function StreamCanvas({
  tier,
  palette,
  onTierDrop,
}: {
  tier: Tier;
  palette: StreamPalette;
  onTierDrop: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<PhaseId>("flow");
  const [haltVisible, setHaltVisible] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const current = PHASES.find((p) => p.id === phase) ?? PHASES[0];
  const paused = offscreen || hidden;

  return (
    <div ref={host} className="relative h-full w-full">
      <Canvas
        /*
          Framed to fit the whole track, not cropped to it. The rail spans 9.2 world
          units; at fov 32 on a 3:2 box that needs ~11 units of distance, and the first
          pass sat at 7.4 — so postings ran off both edges and the three stations, which
          are the thing being explained, were half out of frame. Slightly elevated and
          yawed so the slabs read as objects with thickness rather than as rectangles.
        */
        camera={{ position: [0.8, 3.1, 11.6], fov: 32 }}
        dpr={[1, DPR_CAP[tier] ?? 1]}
        gl={{ antialias: tier >= 3, alpha: true, powerPreference: "high-performance" }}
        frameloop={paused ? "never" : "always"}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          camera.lookAt(0.2, -0.1, 0);
        }}
        /* A context loss on a decorative layer should degrade, not blank the hero. */
        onError={onTierDrop}
      >
        <StreamScene
          palette={palette}
          paused={paused}
          onPhase={(id, halt) => {
            setPhase(id);
            setHaltVisible(halt);
          }}
        />
      </Canvas>

      {/*
        The phase readout. Real text, announced politely so the cycle is available to a
        screen reader as a sequence of states rather than as nothing at all.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-5 gap-y-1"
        aria-live="polite"
      >
        <p className="text-xs" data-readout>
          <span style={{ color: current.lead === "neutral" ? "var(--muted)" : `var(--${current.lead})` }} aria-hidden>
            {current.symbol}{" "}
          </span>
          <span className="text-muted">{current.label}</span>
        </p>

        {haltVisible && (
          <p className="text-xs" data-readout>
            <span style={{ color: "var(--halt)" }} aria-hidden>
              {HALT_LABEL.symbol}{" "}
            </span>
            <span className="text-muted">{HALT_LABEL.label}</span>
          </p>
        )}
      </div>
    </div>
  );
}
