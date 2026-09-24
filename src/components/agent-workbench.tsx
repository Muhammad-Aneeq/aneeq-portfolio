"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Network, Database, ShieldCheck, ScanLine, ArrowUpRight } from "lucide-react";

const stages = [
  { name: "Orchestrate", Icon: Network, code: "agent.route(context)", title: "Give each agent a clear job.", description: "Specialist agents share context, call tools, and hand work back to an orchestrator. Every handoff is traceable." },
  { name: "Retrieve", Icon: Database, code: "evidence = retrieve(query)", title: "Ground the answer in evidence.", description: "Retrieve relevant records and documents. Keep citations attached so a reviewer can inspect where an answer came from." },
  { name: "Evaluate", Icon: ScanLine, code: "assert evaluation.passed", title: "Measure before you trust.", description: "Test repeated runs, check grounding, and catch regressions before a prompt or model change reaches the product." },
  { name: "Review", Icon: ShieldCheck, code: "await human.approval()", title: "Keep consequential decisions human.", description: "Risk boundaries require explicit approval. An agent can propose an action; it cannot approve its own work." },
];

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getServerMotion = () => true;

export function AgentWorkbench() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manual, setManual] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerMotion);
  useEffect(() => {
    if (reduced || !playing || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSelected(value => (value + 1) % stages.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reduced, playing, hovered, focused]);
  const stage = stages[selected];
  return <section className="workbench" aria-label="Explore my AI engineering approach"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="workbench-top"><span className="workbench-symbol" aria-hidden>✳</span><span>Inside the system</span><span className="workbench-note">Interactive sketch</span></div>
    <div className="workflow-map"><div className="workflow-input"><span aria-hidden>↳</span> A real-world problem</div><div className="workflow-spine" aria-hidden />
      <div className="workflow-stages" aria-label="Workflow stages">{stages.map(({ name, Icon }, index) => <button key={name} type="button" aria-current={selected === index ? "true" : undefined} onClick={() => { setPlaying(false); setManual(true); setSelected(index); }} className="workflow-stage"><Icon size={21} aria-hidden /><span>{name}</span><span className="workflow-step" aria-hidden="true">0{index + 1}</span></button>)}</div>
      <div className="workflow-output"><ShieldCheck size={15} aria-hidden /> An answer you can inspect</div></div>
    <div className="workbench-detail" aria-live={manual ? "polite" : "off"} aria-atomic="true"><code>{stage.code}</code><h2>{stage.title}</h2><p>{stage.description}</p></div>
    {!reduced && <div className="workbench-playback"><button type="button" onClick={() => { setManual(false); setPlaying(value => !value); }}>{playing ? "Pause walkthrough" : "Play walkthrough"}</button></div>}
    <Link className="workbench-link" href="/work/closeops">See it in CloseOps <ArrowUpRight size={16} aria-hidden /></Link>
  </section>;
}
