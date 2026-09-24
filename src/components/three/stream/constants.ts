/**
 * "The Posting Stream" — the hero scene, and the case-study trace, from one set of
 * numbers.
 *
 * A track runs left to right. Thin posting slabs travel along it through three stations:
 * CHECK, GATE and COMMIT. The lead posting stops dead at the gate for the longest phase
 * in the cycle while the queue compresses behind it, and nothing on the track moves until
 * a "signed" event releases it.
 *
 * **Why this replaces the monolith.** The slab it replaces was a single object whose
 * detail appeared under the cursor — legible, and static. It showed a system *being
 * inspected*; it never showed work being stopped. The argument this site makes is that a
 * person stands between an agent and the ledger, and the only way to render that is to
 * make something visibly wait. A queue compressing behind a held gate is that, and it is
 * readable in a still frame.
 *
 * Pure data. No three.js imports, so the Tier 0 SVG composes from exactly the same
 * numbers as the WebGL scene and the two cannot drift.
 */

/* --------------------------------------------------------------------------
   Geometry, in world units. The track runs along x.
-------------------------------------------------------------------------- */

export const TRACK = {
  from: -4.6,
  to: 4.6,
  /** The slab sits a little above the rail so it reads as carried, not embedded. */
  y: 0,
  depth: 0,
} as const;

export const POSTING = { width: 0.5, height: 0.6, depth: 0.22 } as const;

/** Spacing at rest. The gate phase compresses this. */
export const SPACING = 1.15;

/** Hard ceiling. The InstancedMesh is allocated once at this count. */
export const MAX_POSTINGS = 16;

export type StationId = "check" | "gate" | "commit";

export const STATIONS: { id: StationId; x: number; label: string; heavy: boolean }[] = [
  { id: "check", x: -1.75, label: "check", heavy: false },
  { id: "gate", x: 0.55, label: "gate", heavy: true },
  { id: "commit", x: 3.1, label: "commit", heavy: false },
];

/* --------------------------------------------------------------------------
   State colours. Hex, because WebGL cannot read a `var()`.

   These are the same three values as `--pass`, `--gate` and `--halt`, converted
   once. `neutral` differs per theme and is passed in at render time rather than
   frozen here — the scene has to sit on paper as well as on graphite.
-------------------------------------------------------------------------- */

export const STATE_HEX = {
  pass: "#4fd6b0",
  gate: "#f0b429",
  halt: "#f0544f",
} as const;

export type StreamPalette = { neutral: string; pass: string; gate: string; halt: string };

export type PostingState = "neutral" | "pass" | "gate" | "halt";

/* --------------------------------------------------------------------------
   The run cycle. 16.0s, seven phases.
-------------------------------------------------------------------------- */

export type PhaseId =
  | "flow"
  | "check"
  | "approach"
  | "gate"
  | "release"
  | "commit"
  | "settle";

export type Phase = {
  id: PhaseId;
  duration: number;
  /** The label shown while this phase runs, and the symbol beside it. */
  symbol: string;
  label: string;
  /** Which station the label belongs beside. `null` pins it to the lead posting. */
  at: StationId | null;
  /** State the lead posting holds during this phase. */
  lead: PostingState;
};

export const PHASES: Phase[] = [
  { id: "flow", duration: 2.4, symbol: "→", label: "in flight", at: null, lead: "neutral" },
  { id: "check", duration: 2.0, symbol: "✓", label: "passed", at: "check", lead: "pass" },
  {
    id: "approach",
    duration: 1.6,
    symbol: "→",
    label: "approaching the gate",
    at: "gate",
    lead: "pass",
  },
  /*
    The longest phase, and nothing on the track moves through it. This is the argument;
    everything else in the cycle is context for it.
  */
  {
    id: "gate",
    duration: 4.4,
    symbol: "⏸",
    label: "awaiting approval (simulated)",
    at: "gate",
    lead: "gate",
  },
  { id: "release", duration: 1.0, symbol: "✎", label: "signed", at: "gate", lead: "pass" },
  { id: "commit", duration: 2.2, symbol: "✓", label: "posted", at: "commit", lead: "pass" },
  { id: "settle", duration: 2.4, symbol: "→", label: "in flight", at: null, lead: "neutral" },
];

export const CYCLE_SECONDS = PHASES.reduce((s, p) => s + p.duration, 0);

/** Every third cycle, one posting fails CHECK and drops off the track. */
export const HALT_EVERY = 3;

export const HALT_LABEL = { symbol: "✗", label: "halted: anomaly" } as const;

/** Cumulative phase start times, so a lookup is a scan rather than a reduce per frame. */
export const PHASE_STARTS: number[] = (() => {
  const out: number[] = [];
  let t = 0;
  for (const p of PHASES) {
    out.push(t);
    t += p.duration;
  }
  return out;
})();

export function phaseAt(cycleTime: number): { phase: Phase; t: number; index: number } {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (cycleTime >= PHASE_STARTS[i]) {
      return {
        phase: PHASES[i],
        t: (cycleTime - PHASE_STARTS[i]) / PHASES[i].duration,
        index: i,
      };
    }
  }
  return { phase: PHASES[0], t: 0, index: 0 };
}

/* --------------------------------------------------------------------------
   Tier 0 layout — the still frame, at the moment that matters.

   Not a projection of the 3D scene. The still is composed directly in 2D at the
   GATE phase, because that is the one frame that carries the whole argument: a
   posting stopped, a queue backed up behind it, one already passed, one fallen.
   Projecting the live scene would put whatever moment the camera happened to be
   on in front of a reader who only ever sees one.
-------------------------------------------------------------------------- */

export type StillPosting = { x: number; state: PostingState; fallen?: boolean };

/** Positions in a 0–100 viewBox space, so the SVG and the CSS agree on units. */
export const STILL = {
  trackY: 52,
  from: 6,
  to: 94,
  stations: [
    { id: "check" as const, x: 30, label: "check", heavy: false },
    { id: "gate" as const, x: 58, label: "gate", heavy: true },
    { id: "commit" as const, x: 82, label: "commit", heavy: false },
  ],
  postings: [
    { x: 12, state: "neutral" },
    { x: 21, state: "neutral" },
    /* Compressed behind the gate — the spacing is the readout. */
    { x: 38, state: "neutral" },
    { x: 45, state: "pass" },
    { x: 51.5, state: "pass" },
    { x: 58, state: "gate" },
    /* Dropped off the track at CHECK on the halt cycle. */
    { x: 30, state: "halt", fallen: true },
  ] satisfies StillPosting[],
} as const;
