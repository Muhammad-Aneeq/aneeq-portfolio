"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CYCLE_SECONDS,
  HALT_EVERY,
  MAX_POSTINGS,
  POSTING,
  SPACING,
  STATE_HEX,
  STATIONS,
  TRACK,
  phaseAt,
  type PhaseId,
  type StreamPalette,
} from "@/components/three/stream/constants";

/**
 * The live scene.
 *
 * One InstancedMesh carries every posting; the three station frames and the rail are
 * plain line geometry. Triangle count is deliberately tiny — the subject is motion and
 * colour state, not surface detail, and a hero that costs 40k triangles to say "a queue
 * is waiting" has misunderstood its own point.
 *
 * **Per-instance colour is an instanced attribute, not a material per posting.** Sixteen
 * materials would be sixteen draw calls and sixteen shader programs for one object; one
 * attribute interpolated in the fragment shader is one of each.
 */

const VERT = /* glsl */ `
  attribute vec3 aState;      // rgb of this posting's current state colour
  attribute float aFade;      // 1 on the track, falls to 0 as a halted posting drops
  varying vec3 vState;
  varying float vFade;
  varying vec3 vNormal;

  void main() {
    vState = aState;
    vFade = aFade;
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uNeutral;   // the theme's resting slab colour
  uniform vec3 uLight;     // key light direction
  varying vec3 vState;
  varying float vFade;
  varying vec3 vNormal;

  void main() {
    // A posting at rest is the theme's neutral; a state colour is mixed in by how far
    // aState has been driven from zero. Mixing here rather than swapping materials is
    // what lets a posting *become* teal over 300ms instead of switching.
    float amount = clamp(length(vState), 0.0, 1.0);
    vec3 base = mix(uNeutral, vState, amount);

    // One directional term plus a flat ambient. Enough to read the slab as an object.
    float lambert = clamp(dot(normalize(vNormal), normalize(uLight)), 0.0, 1.0);
    vec3 lit = base * (0.55 + 0.45 * lambert);

    gl_FragColor = vec4(lit, vFade);
    if (gl_FragColor.a < 0.02) discard;
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

const STATE_RGB = {
  neutral: [0, 0, 0] as [number, number, number],
  pass: hexToRgb(STATE_HEX.pass),
  gate: hexToRgb(STATE_HEX.gate),
  halt: hexToRgb(STATE_HEX.halt),
};

/**
 * The simulation, as a class with methods.
 *
 * Not a `useMemo` returning an object literal, and not React state. The React Compiler's
 * immutability lint rejects mutating anything reachable from a hook result, and this is
 * mutated sixty times a second by design. A class instance held in a ref is the shape the
 * compiler accepts, and it keeps every per-frame write off the React path entirely.
 */
class Stream {
  readonly mesh: THREE.InstancedMesh;
  readonly stateAttr: THREE.InstancedBufferAttribute;
  readonly fadeAttr: THREE.InstancedBufferAttribute;
  readonly material: THREE.ShaderMaterial;
  private readonly dummy = new THREE.Object3D();
  /** Cycle index, so the halt event can fire every third pass. */
  private cycle = 0;
  private colours = STATE_RGB;

  constructor(neutral: THREE.Color) {
    const geo = new THREE.BoxGeometry(POSTING.width, POSTING.height, POSTING.depth);

    /*
      Built imperatively rather than declared as <shaderMaterial uniforms={...}>.
      That JSX form takes a *copy* of the uniform object at construction, so every
      per-frame write lands on an orphan the GPU never sees. That cost hours the last
      time this pattern appeared in this codebase; it is written down so it does not
      cost them again.
    */
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      uniforms: {
        uNeutral: { value: new THREE.Vector3(neutral.r, neutral.g, neutral.b) },
        uLight: { value: new THREE.Vector3(0.4, 0.9, 0.6) },
      },
    });

    this.mesh = new THREE.InstancedMesh(geo, this.material, MAX_POSTINGS);
    this.mesh.frustumCulled = false;

    this.stateAttr = new THREE.InstancedBufferAttribute(new Float32Array(MAX_POSTINGS * 3), 3);
    this.fadeAttr = new THREE.InstancedBufferAttribute(new Float32Array(MAX_POSTINGS), 1);
    this.stateAttr.setUsage(THREE.DynamicDrawUsage);
    this.fadeAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aState", this.stateAttr);
    geo.setAttribute("aFade", this.fadeAttr);
  }

  setPalette(palette: StreamPalette) {
    const c = new THREE.Color(palette.neutral);
    this.colours = { neutral: [0, 0, 0], pass: hexToRgb(palette.pass), gate: hexToRgb(palette.gate), halt: hexToRgb(palette.halt) };
    (this.material.uniforms.uNeutral.value as THREE.Vector3).set(c.r, c.g, c.b);
  }

  /**
   * Where the queue sits for a given cycle time.
   *
   * The lead posting's x is driven by the phase; every posting behind it is placed at
   * `lead - n * spacing`, and `spacing` is what compresses during the gate. That is the
   * whole trick: the queue backing up is not animated separately, it falls out of one
   * number shrinking.
   */
  private leadX(phase: PhaseId, t: number): number {
    const gate = STATIONS[1].x;
    const check = STATIONS[0].x;
    const commit = STATIONS[2].x;
    const ease = (v: number) => v * v * (3 - 2 * v);

    switch (phase) {
      case "flow":
        return THREE.MathUtils.lerp(TRACK.from, check, ease(t));
      case "check":
        return THREE.MathUtils.lerp(check, check + 0.7, ease(t));
      case "approach":
        return THREE.MathUtils.lerp(check + 0.7, gate, ease(t));
      case "gate":
      case "release":
        return gate;
      case "commit":
        return THREE.MathUtils.lerp(gate, commit, ease(t));
      case "settle":
        return THREE.MathUtils.lerp(commit, TRACK.to + 1.2, ease(t));
    }
  }

  private spacing(phase: PhaseId, t: number): number {
    // Compresses as the queue backs up behind a held gate, and recovers after release.
    if (phase === "approach") return THREE.MathUtils.lerp(SPACING, SPACING * 0.62, ease(t));
    if (phase === "gate") return SPACING * 0.62;
    if (phase === "release") return THREE.MathUtils.lerp(SPACING * 0.62, SPACING * 0.7, t);
    if (phase === "commit") return THREE.MathUtils.lerp(SPACING * 0.7, SPACING, ease(t));
    return SPACING;

    function ease(v: number) {
      return v * v * (3 - 2 * v);
    }
  }

  update(elapsed: number) {
    const cycleTime = elapsed % CYCLE_SECONDS;
    const nextCycle = Math.floor(elapsed / CYCLE_SECONDS);
    if (nextCycle !== this.cycle) this.cycle = nextCycle;

    const { phase, t } = phaseAt(cycleTime);
    const lead = this.leadX(phase.id, t);
    const gap = this.spacing(phase.id, t);
    const haltCycle = this.cycle % HALT_EVERY === HALT_EVERY - 1;

    for (let i = 0; i < MAX_POSTINGS; i++) {
      let x = lead - i * gap;
      let y = TRACK.y;
      let rot = 0;
      let fade = 1;

      // Wrap: a posting that has left the right edge re-enters on the left, so the
      // stream is continuous without allocating new instances.
      const span = TRACK.to - TRACK.from + 2.4;
      while (x < TRACK.from - 1.2) x += span;

      let state: [number, number, number] = this.colours.neutral;

      if (i === 0) {
        state = this.colours[phase.lead] ?? this.colours.neutral;
      } else if (x > STATIONS[0].x + 0.35 && x < STATIONS[2].x) {
        // Anything already past CHECK and not yet committed has passed its check.
        state = this.colours.pass;
      }

      /*
        The halt. On every third cycle one posting fails its check and falls off the
        track rather than continuing — the only event in the cycle where work is
        destroyed rather than delayed, and the reason the scene has a red at all.
      */
      if (haltCycle && i === 3 && phase.id !== "flow") {
        const fallen = THREE.MathUtils.clamp((cycleTime - 2.4) / 1.6, 0, 1);
        state = this.colours.halt;
        y = TRACK.y - fallen * 2.2;
        rot = fallen * 0.5;
        fade = 1 - fallen * 0.75;
      }

      this.dummy.position.set(x, y, 0);
      this.dummy.rotation.set(0, 0, rot);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      this.stateAttr.setXYZ(i, state[0], state[1], state[2]);
      this.fadeAttr.setX(i, fade);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.stateAttr.needsUpdate = true;
    this.fadeAttr.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export function StreamScene({
  palette,
  paused,
  onPhase,
}: {
  /** The theme's resting slab colour, as a CSS colour string. */
  palette: StreamPalette;
  paused: boolean;
  onPhase: (id: PhaseId, haltVisible: boolean) => void;
}) {
  const { invalidate } = useThree();
  const lastPhase = useRef<PhaseId | null>(null);
  const clock = useRef(0);

  /*
    Built once and never rebuilt. The theme colour is pushed in through `setNeutral`
    rather than being a dependency, because rebuilding would drop the InstancedMesh and
    restart the cycle from zero every time someone toggles the theme.
  */
  const stream = useMemo(() => new Stream(new THREE.Color(palette.neutral)), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    stream.setPalette(palette);
  }, [stream, palette]);

  useEffect(() => () => stream.dispose(), [stream]);

  useFrame((_, delta) => {
    if (paused) return;
    clock.current += Math.min(delta, 0.05);
    stream.update(clock.current);

    const { phase } = phaseAt(clock.current % CYCLE_SECONDS);
    const haltCycle =
      Math.floor(clock.current / CYCLE_SECONDS) % HALT_EVERY === HALT_EVERY - 1;
    if (phase.id !== lastPhase.current) {
      lastPhase.current = phase.id;
      onPhase(phase.id, haltCycle);
    }
    invalidate();
  });

  return (
    <>
      <primitive object={stream.mesh} />

      {/* The rail. */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([TRACK.from, TRACK.y - POSTING.height / 2 - 0.16, 0, TRACK.to, TRACK.y - POSTING.height / 2 - 0.16, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={palette.neutral} transparent opacity={0.7} />
      </line>

      {/* Station frames. The gate is heavier and carries its own colour, because it is
          the only one that can stop the stream. */}
      {STATIONS.map((s) => (
        <lineSegments key={s.id} position={[s.x, TRACK.y, 0]}>
          <edgesGeometry
            args={[new THREE.BoxGeometry(0.5, s.heavy ? 1.5 : 1.15, s.heavy ? 1.0 : 0.8)]}
          />
          <lineBasicMaterial
            color={s.heavy ? palette.gate : palette.neutral}
            transparent
            opacity={s.heavy ? 0.95 : 0.7}
          />
        </lineSegments>
      ))}

      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={0.7} />
    </>
  );
}
