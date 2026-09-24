"use client";

import { useEffect, useRef } from "react";
import type { loopSchema } from "@/content/schema";
import type { z } from "zod";
import { useDeviceCapable, useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Loop = z.infer<typeof loopSchema>;

/**
 * Muted micro-loop for a card.
 *
 * `preload="none"` and play gated on intersection: a card that never scrolls into
 * view never fetches its clip. Under reduced motion it stays a poster image and no
 * video element is created at all.
 */
export function CardLoop({ loop, className }: { loop: Loop; className?: string }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const capable = useDeviceCapable();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced || !capable) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={loop.poster}
        alt=""
        className={cn("h-full w-full object-cover", className)}
        loading="lazy"
      />
    );
  }

  return (
    <video
      ref={ref}
      poster={loop.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={cn("h-full w-full object-cover", className)}
    >
      <source src={loop.webm} type="video/webm" />
      <source src={loop.mp4} type="video/mp4" />
    </video>
  );
}
