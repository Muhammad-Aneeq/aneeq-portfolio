/**
 * The hero's agent network: nodes drift and link to their neighbours, and small pulses
 * travel along the links like messages between agents. Nodes near the cursor brighten
 * and lean towards it. Canvas 2D, no library, imported after first paint (network.tsx).
 *
 * Cost control: the node count scales with area and is capped, the device pixel ratio
 * is capped at 1.5, and the loop stops off-screen and in hidden tabs. Reduced motion
 * draws one still frame.
 */

export type NetworkColours = { node: string; line: string; pulse: string; strength: number };

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Pulse = { a: number; b: number; t: number; speed: number };

export function startNetwork(canvas: HTMLCanvasElement, colours: () => NetworkColours, still: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const LINK = 150;
  const CURSOR = 170;
  let w = 0, h = 0, dpr = 1;
  let nodes: Node[] = [];
  const pulses: Pulse[] = [];
  const pointer = { x: -9999, y: -9999 };

  const seed = () => {
    const count = Math.min(90, Math.round((w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1 + Math.random() * 1.6,
    }));
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const nw = canvas.clientWidth, nh = canvas.clientHeight;
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  };
  const onLeave = () => { pointer.x = pointer.y = -9999; };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  const frame = (dt: number) => {
    resize();
    const c = colours();
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      // Lean towards the cursor when it is near.
      const dx = pointer.x - n.x, dy = pointer.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < CURSOR && d > 1) { n.vx += (dx / d) * 0.006; n.vy += (dy / d) * 0.006; }
      n.vx *= 0.995; n.vy *= 0.995;
      // Keep a little drift so the field never freezes.
      if (Math.abs(n.vx) + Math.abs(n.vy) < 0.05) { n.vx += (Math.random() - 0.5) * 0.04; n.vy += (Math.random() - 0.5) * 0.04; }
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
    }

    // Links between neighbours, fading with distance.
    ctx.lineWidth = 1;
    const links: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK) continue;
        links.push([i, j]);
        const near = Math.max(0, 1 - Math.min(Math.hypot(pointer.x - a.x, pointer.y - a.y), Math.hypot(pointer.x - b.x, pointer.y - b.y)) / CURSOR);
        ctx.globalAlpha = (1 - d / LINK) * (0.28 + near * 0.55) * c.strength;
        ctx.strokeStyle = c.line;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // Messages: a few pulses travelling along links at any moment.
    if (!still && links.length && pulses.length < 7 && Math.random() < 0.05) {
      const [a, b] = links[(Math.random() * links.length) | 0];
      pulses.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.01 });
    }
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += p.speed * dt;
      const a = nodes[p.a], b = nodes[p.b];
      if (p.t >= 1 || !a || !b || Math.hypot(a.x - b.x, a.y - b.y) > LINK * 1.2) { pulses.splice(k, 1); continue; }
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, c.pulse); g.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.9 * c.strength;
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }

    // Nodes, brighter near the cursor.
    ctx.fillStyle = c.node;
    for (const n of nodes) {
      const near = Math.max(0, 1 - Math.hypot(pointer.x - n.x, pointer.y - n.y) / CURSOR);
      ctx.globalAlpha = (0.45 + near * 0.55) * c.strength;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + near * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const cleanupInput = () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
  };

  if (still) {
    frame(0);
    cleanupInput();
    return { redraw: () => frame(0), stop: () => {} };
  }

  let raf = 0, last = 0, visible = true;
  const loop = (now: number) => {
    const dt = last ? Math.min((now - last) / 16.7, 3) : 1;
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  const play = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
  const pause = () => { cancelAnimationFrame(raf); raf = 0; };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else pause(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVis);
  play();

  return {
    redraw: () => frame(0),
    stop: () => { pause(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); cleanupInput(); },
  };
}
