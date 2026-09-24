import type { TraceStation } from "@/content/schema";

/**
 * Station kind → the governance colour it belongs to. Shared by the WebGL replay and
 * the static timeline so the two always agree.
 */
export const KIND_HEX: Record<TraceStation["kind"], string> = {
  plan: "#7b8794",
  tool: "#4fd6b0",
  policy: "#4fd6b0",
  route: "#4fd6b0",
  gate: "#f0b429",
  commit: "#4fd6b0",
  audit: "#7b8794",
  halt: "#f0544f",
};

export const KIND_VAR: Record<TraceStation["kind"], string> = {
  plan: "var(--muted)",
  tool: "var(--pass)",
  policy: "var(--pass)",
  route: "var(--pass)",
  gate: "var(--gate)",
  commit: "var(--pass)",
  audit: "var(--muted)",
  halt: "var(--halt)",
};
