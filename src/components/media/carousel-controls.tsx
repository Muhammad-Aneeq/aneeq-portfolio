"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Previous / next and an "n of N" readout for a CSS scroll-snap track.
 *
 * The track itself stays a server-rendered scroll-snap list that works with no
 * JavaScript (swipe, scrollbar, keyboard); this only adds buttons on top. It scrolls
 * the track by one slide, so snapping, momentum and keyboard all keep working as before.
 */
export function CarouselControls({ count, label, children }: { count: number; label: string; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // The scrolling element is the server-rendered track inside; one slide's stride is the
  // distance between two slides, so the gap is included.
  const scroller = () => track.current?.querySelector<HTMLElement>(".shot-slider") ?? null;
  const stride = (el: HTMLElement) => {
    const [a, b] = el.children as unknown as HTMLElement[];
    return b ? b.offsetLeft - a.offsetLeft : el.clientWidth;
  };

  useEffect(() => {
    const el = scroller();
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(stride(el), 1)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (dir: -1 | 1) => {
    const el = scroller();
    if (!el) return;
    el.scrollBy({ left: dir * stride(el), behavior: "smooth" });
  };

  return (
    <div className="carousel">
      <div className="carousel-bar">
        <p className="text-xs text-faint uppercase" data-readout aria-live="polite">
          {index + 1} / {count} · {label}
        </p>
        <div className="flex gap-2">
          <button type="button" className="carousel-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous screen">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button type="button" className="carousel-btn" onClick={() => go(1)} disabled={index >= count - 1} aria-label="Next screen">
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
      <div ref={track} className="carousel-track-wrap">
        {children}
      </div>
    </div>
  );
}
