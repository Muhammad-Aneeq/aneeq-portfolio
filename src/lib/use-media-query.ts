"use client";

import { useSyncExternalStore } from "react";

/**
 * Media query as an external store rather than state-in-effect.
 *
 * The server snapshot is always `false`, which is deliberate: it means the server
 * renders the conservative branch (the static fallback), and the client upgrades only
 * if it actually qualifies. No hydration mismatch, and the heavy path can never be
 * what first paint is waiting on.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

let webglSupport: boolean | null = null;

/** Cached — getSnapshot runs often and must not allocate a canvas each time. */
function detectWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function detectCapableDevice(): boolean {
  if (!detectWebGL()) return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  // Undefined on Safari and Firefox — absence is not evidence of a weak device.
  if (typeof mem === "number" && mem < 4) return false;
  return true;
}

const subscribeNever = () => () => {};

export function useDeviceCapable(): boolean {
  return useSyncExternalStore(subscribeNever, detectCapableDevice, () => false);
}
