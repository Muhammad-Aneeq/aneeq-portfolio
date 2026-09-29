"use client";

import { useEffect, useRef } from "react";
import type { loopSchema } from "@/content/schema";
import type { z } from "zod";
import { useDeviceCapable, useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Loop = z.infer<typeof loopSchema>;

/**
 * Muted micro-loop for a card: the poster by default, the loop on intent.
 *
 * It used to play whenever a quarter of the card was on screen, so the work grid
 * could run nine videos at once. Movement everywhere means nothing draws the eye,
 * and it spent data on clips nobody had asked to watch. Now the poster (taken at the
 * loop's first frame, so the switch is seamless) stays put until the card is hovered
 * or keyboard-focused, and the loop stops and rewinds when that ends.
 *
 * Touch devices have no hover, so they keep the poster; the project page plays the
 * full walkthrough. `preload="none"` means a clip is fetched only when first played.
 * Under reduced motion, or on a device that cannot afford the decode, no video
 * element is created at all.
 */
export function CardLoop({ loop, className }: { loop: Loop; className?: string }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const capable = useDeviceCapable();
  const ref = useRef<HTMLVideoElement>(null);

  // Keyed on the media queries: they can resolve after the first render, and a
  // mount-only effect would then never find the video it is meant to wire up.
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover) return;

    // The whole card is the target, not the frame: people hover the title too.
    const card = el.closest("a, article") ?? el;
    const play = () => void el.play().catch(() => {});
    const stop = () => {
      el.pause();
      el.currentTime = 0;
    };
    const blur = (e: Event) => {
      const next = (e as FocusEvent).relatedTarget;
      if (!(next instanceof Node) || !card.contains(next)) stop();
    };

    card.addEventListener("pointerenter", play);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", blur);
    return () => {
      card.removeEventListener("pointerenter", play);
      card.removeEventListener("pointerleave", stop);
      card.removeEventListener("focusin", play);
      card.removeEventListener("focusout", blur);
    };
  }, [canHover, reduced, capable]);

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
