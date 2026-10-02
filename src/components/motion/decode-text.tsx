"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/";

/**
 * Text that resolves from machine noise into the real words when it first comes into
 * view, or whenever `text` changes. For code-style labels set in the mono face, so the
 * scramble never changes their width.
 *
 * The real text is what renders on the server and what stays in the DOM at rest, so
 * no-JS, reduced motion and search engines only ever see the words. While it runs, the
 * noise is aria-hidden and the real text sits beside it for screen readers.
 */
export function DecodeText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const DURATION = 650;
      const step = (now: number) => {
        const p = Math.min((now - t0) / DURATION, 1);
        const settled = Math.floor(p * text.length);
        setShown(
          p >= 1
            ? null
            : [...text].map((c, i) => (i < settled || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""),
        );
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        run();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={className}>
      {shown === null ? (
        text
      ) : (
        <>
          <span aria-hidden>{shown}</span>
          <span className="sr-only">{text}</span>
        </>
      )}
    </span>
  );
}
