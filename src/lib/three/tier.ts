"use client";

/**
 * The hero's capability ladder (SPEC §4.3).
 *
 * One decision, made once, logged, and assertable in a test — which is the whole
 * point of pulling it out of the component. The scene used to make this call inline
 * and the result was invisible to everything except a screenshot.
 *
 *   Tier 3  desktop, WebGL 2, dpr ≤ 1.75   transmission core · 60k particles · bloom · shadows
 *   Tier 2  ≥ 640px, dpr ≤ 1.25            fresnel core · 25k particles · no bloom · half shadows
 *   Tier 1  < 640px | memory < 4 | < 40fps NO CANVAS — static poster
 *   Tier 0  reduced motion | no WebGL | no JS   labelled SVG, no WebGL context at all
 *
 * Two rules the rest of the code depends on:
 *   - **Tiers 0 and 1 must never request the 3D chunk.** That is asserted in
 *     `tests/hero-tier.spec.ts` against the network log, because the bundle gate
 *     structurally cannot catch it: the chunk is correctly absent from the *initial*
 *     payload, which is all that gate measures. This exact failure already shipped once
 *     (PLAN REVIEW PASS — three.js downloading on phones, 407 KB, LCP 7.7s).
 *   - **Runtime may step DOWN, never up.** A scene oscillating between tiers is worse
 *     than one that is permanently conservative, and upward transitions are where the
 *     oscillation comes from.
 */

export type Tier = 0 | 1 | 2 | 3;

export type TierDecision = {
  tier: Tier;
  /** Why, in a form that survives being printed to a console or read in a test. */
  reason: string;
  signals: {
    reducedMotion: boolean;
    webgl2: boolean;
    webgl: boolean;
    width: number;
    dpr: number;
    deviceMemory: number | null;
    cores: number | null;
  };
};

/** Per SPEC §4.3. Exported so the scene and the lab read the same numbers. */
export const TIER_SETTINGS = {
  3: { particles: 0, core: "monolith", bloom: false, shadowRes: 0, dprCap: 1.75 },
  2: { particles: 0, core: "monolith", bloom: false, shadowRes: 0, dprCap: 1.25 },
  1: { particles: 0, core: "poster", bloom: false, shadowRes: 0, dprCap: 1 },
  0: { particles: 0, core: "svg", bloom: false, shadowRes: 0, dprCap: 1 },
} as const;

/**
 * Everything the scene needs to draw itself, derived from a tier.
 *
 * Deliberately a plain object with no three.js types, and deliberately here rather than
 * next to the scene: the hero gate needs it *before* deciding whether to load the 3D
 * chunk, and importing it from the scene module would drag three.js onto the home route —
 * which is the exact regression `tests/hero-tier.spec.ts` exists to prevent.
 */
export type SceneSettings = {
  particles: number;
  transmission: boolean;
  shadows: boolean;
  shadowRes: number;
  fogDensity: number;
  orbitSpeed: number;
  cycleSpeed: number;
  lightIntensity: number;
  /** Retained for the lab's sliders; the monolith scene does not use it. */
  glow: number;
  /** Forced cycle time, for the poster capture. `null` runs normally. */
  freezeAt: number | null;
};

export function settingsForTier(tier: Tier): SceneSettings {
  const t = TIER_SETTINGS[tier];
  return {
    particles: t.particles,
    transmission: t.core === "monolith",
    shadows: t.shadowRes > 0,
    shadowRes: t.shadowRes || 256,
    fogDensity: 0.018,
    orbitSpeed: 1,
    cycleSpeed: 1,
    lightIntensity: 1,
    glow: tier === 3 ? 0.32 : 0.18,
    freezeAt: null,
  };
}

let cachedWebgl: { webgl: boolean; webgl2: boolean } | null = null;

function detectWebGL() {
  if (cachedWebgl) return cachedWebgl;
  try {
    const canvas = document.createElement("canvas");
    const gl2 = Boolean(canvas.getContext("webgl2"));
    cachedWebgl = { webgl2: gl2, webgl: gl2 || Boolean(canvas.getContext("webgl")) };
  } catch {
    cachedWebgl = { webgl: false, webgl2: false };
  }
  return cachedWebgl;
}

/**
 * The synchronous decision, from static signals only.
 *
 * Deliberately does not wait for the FPS probe: a 2-second block before anything can
 * render would cost more than the tier is worth. The probe runs afterwards and may
 * demote (`probeFps` below), which is the only direction movement is allowed.
 */
export function resolveTier(): TierDecision {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const signals = {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ...detectWebGL(),
    width: window.innerWidth,
    dpr: window.devicePixelRatio || 1,
    deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    cores: typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : null,
  };

  const decide = (): { tier: Tier; reason: string } => {
    if (signals.reducedMotion) return { tier: 0, reason: "prefers-reduced-motion" };
    if (!signals.webgl) return { tier: 0, reason: "no WebGL context available" };

    if (signals.width < 640) return { tier: 1, reason: `viewport ${signals.width}px < 640` };
    // Absence is not evidence of a weak device — Safari and Firefox do not report it.
    if (signals.deviceMemory !== null && signals.deviceMemory < 4) {
      return { tier: 1, reason: `deviceMemory ${signals.deviceMemory} < 4` };
    }
    if (signals.cores !== null && signals.cores <= 2) {
      return { tier: 1, reason: `hardwareConcurrency ${signals.cores} <= 2` };
    }

    if (!signals.webgl2) return { tier: 2, reason: "WebGL 1 only" };
    if (signals.dpr > TIER_SETTINGS[3].dprCap) {
      return { tier: 2, reason: `dpr ${signals.dpr} > ${TIER_SETTINGS[3].dprCap}` };
    }
    // A high-end phone in landscape can clear every gate above; keep it off Tier 3,
    // where the transmission render-target resolve is the expensive part.
    if (signals.width < 1024) return { tier: 2, reason: `viewport ${signals.width}px < 1024` };

    return { tier: 3, reason: "desktop, WebGL 2, dpr within cap" };
  };

  const { tier, reason } = decide();
  return { tier, reason, signals };
}

/**
 * The 2-second FPS probe.
 *
 * Measures raw `requestAnimationFrame` cadence *before* a WebGL context exists, so it
 * reads what the device has spare rather than what the scene costs. Runs during the
 * `requestIdleCallback` window the canvas already waits on, so it is not additive.
 */
export function probeFps(durationMs = 2000): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      frames++;
      if (now - start < durationMs) requestAnimationFrame(step);
      else resolve(Math.round((frames / (now - start)) * 1000));
    };
    requestAnimationFrame(step);
  });
}

/** Tier 1 if the device cannot hold 40fps doing nothing. Never promotes. */
export function applyFpsProbe(decision: TierDecision, fps: number): TierDecision {
  if (decision.tier <= 1 || fps >= 40) return decision;
  return { ...decision, tier: 1, reason: `FPS probe ${fps} < 40 (was tier ${decision.tier})` };
}

/** Runtime demotion for `<PerformanceMonitor onDecline>`. Down only. */
export function stepDown(decision: TierDecision): TierDecision {
  if (decision.tier === 0) return decision;
  const tier = (decision.tier - 1) as Tier;
  return { ...decision, tier, reason: `stepped down from ${decision.tier} at runtime` };
}

/**
 * Test and lab override: `?tier=2` forces a tier.
 *
 * Exists so `/_dev/hero-lab` can screenshot all four states and so Playwright can assert
 * each one without emulating a whole device. Guarded to development and the dev route,
 * because a query parameter that changes what ships is a query parameter someone will
 * eventually find in production.
 */
export function forcedTier(): Tier | null {
  if (process.env.NODE_ENV === "production" && !location.pathname.startsWith("/dev/")) {
    return null;
  }
  const raw = new URLSearchParams(location.search).get("tier");
  if (raw === null) return null;
  const n = Number(raw);
  return n === 0 || n === 1 || n === 2 || n === 3 ? n : null;
}

/** Dev-only, and the reason the tier is assertable rather than inferred from a screenshot. */
export function logTier(decision: TierDecision) {
  if (process.env.NODE_ENV === "production") return;
  console.log(`[hero] tier ${decision.tier}: ${decision.reason}`, decision.signals);
}

/* ---------------------------------------------------------------------------
   The synchronous decision as an external store.

   Same shape as `use-media-query.ts`, and for the same reason: the server snapshot is
   the conservative branch (Tier 0, the labelled SVG), and the client upgrades only if it
   actually qualifies. No hydration mismatch, no `setState` in an effect body — which the
   React Compiler rules reject — and first paint is never waiting on a capability probe.

   The snapshot is cached because `getSnapshot` must be referentially stable; resolving
   the tier allocates a canvas to test WebGL, so recomputing per call would be doubly wrong.
--------------------------------------------------------------------------- */

let cachedDecision: TierDecision | null = null;

function clientSnapshot(): TierDecision {
  if (cachedDecision) return cachedDecision;
  const forced = forcedTier();
  const base = resolveTier();
  cachedDecision =
    forced !== null ? { ...base, tier: forced, reason: `forced ?tier=${forced}` } : base;
  logTier(cachedDecision);
  return cachedDecision;
}

const SERVER_DECISION: TierDecision = {
  tier: 0,
  reason: "server render: no capability signals available",
  signals: {
    reducedMotion: false,
    webgl: false,
    webgl2: false,
    width: 0,
    dpr: 1,
    deviceMemory: null,
    cores: null,
  },
};

export const tierStore = {
  subscribe: () => () => {},
  getSnapshot: clientSnapshot,
  getServerSnapshot: () => SERVER_DECISION,
};
