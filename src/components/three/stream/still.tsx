import { HALT_LABEL, STILL, type PostingState } from "@/components/three/stream/constants";
import { cn } from "@/lib/utils";

/**
 * Tier 0 — the scene as an inline SVG, server-rendered on every request.
 *
 * This is the version that always exists. It is in the HTML for crawlers, for answer
 * engines, for anyone with scripting off, for anyone whose bundle never arrives, for
 * reduced-motion readers, and for every device that does not clear the WebGL bar. The
 * canvas is an upgrade on top of it, never a prerequisite.
 *
 * It imports nothing from three.js — only the shared constants — so it costs the home
 * route no JavaScript at all, and it cannot drift from the live scene's geometry because
 * both read the same numbers.
 *
 * It renders the GATE frame specifically: one posting stopped at the gate in amber, the
 * queue compressed behind it, two already passed, one fallen off the track at CHECK. The
 * argument is legible without a single frame of animation.
 *
 * Colours come from CSS custom properties, so this follows the theme. That is the other
 * half of why the still is not a screenshot: a poster baked on a dark ground is a black
 * rectangle on paper.
 */

const STATE_FILL: Record<PostingState, string> = {
  neutral: "var(--border-strong)",
  pass: "var(--pass)",
  gate: "var(--gate)",
  halt: "var(--halt)",
};

export function StreamStill({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 78"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={
        "A stream of ledger postings moving left to right through three stations: check, gate and commit. " +
        "The leading posting is stopped at the gate awaiting a person's approval, with the queue compressed " +
        "behind it. Two postings have passed their check. One failed its check and has dropped off the track."
      }
    >
      {/* The rail. */}
      <line
        x1={STILL.from}
        y1={STILL.trackY}
        x2={STILL.to}
        y2={STILL.trackY}
        stroke="var(--border)"
        strokeWidth={0.4}
      />

      {/* Stations. The gate is drawn heavier because it is the one that can stop work. */}
      {STILL.stations.map((s) => (
        <g key={s.id}>
          <rect
            x={s.x - 3.4}
            y={STILL.trackY - 7.5}
            width={6.8}
            height={15}
            rx={0.8}
            fill="none"
            stroke={s.heavy ? "var(--gate)" : "var(--border-strong)"}
            strokeWidth={s.heavy ? 0.55 : 0.32}
            opacity={s.heavy ? 0.9 : 0.75}
          />
          <text
            x={s.x}
            y={STILL.trackY + 13}
            textAnchor="middle"
            fontSize={2.6}
            fill="var(--faint)"
            fontFamily="var(--font-mono)"
            letterSpacing={0.3}
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* Postings. */}
      {STILL.postings.map((p, i) => (
        <rect
          key={i}
          x={p.x - 2.2}
          y={p.fallen ? STILL.trackY + 6 : STILL.trackY - 2.6}
          width={4.4}
          height={5.2}
          rx={0.5}
          fill={STATE_FILL[p.state]}
          opacity={p.fallen ? 0.45 : p.state === "neutral" ? 0.55 : 0.95}
          transform={p.fallen ? `rotate(14 ${p.x} ${STILL.trackY + 8})` : undefined}
        />
      ))}

      {/* The two labels that carry the meaning, as real text. */}
      <text
        x={STILL.stations[1].x}
        y={STILL.trackY - 11}
        textAnchor="middle"
        fontSize={2.8}
        fill={"var(--gate)"}
        fontFamily="var(--font-mono)"
      >
        ⏸ awaiting approval
      </text>
      <text
        x={STILL.stations[0].x}
        y={STILL.trackY + 21}
        textAnchor="middle"
        fontSize={2.6}
        fill={"var(--halt)"}
        fontFamily="var(--font-mono)"
      >
        {HALT_LABEL.symbol} {HALT_LABEL.label}
      </text>
    </svg>
  );
}
