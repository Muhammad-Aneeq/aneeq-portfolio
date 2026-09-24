"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { walkthroughSchema } from "@/content/schema";
import type { z } from "zod";

type Walkthrough = z.infer<typeof walkthroughSchema>;

/**
 * Facade-loaded walkthrough.
 *
 * Until it is asked for, this is an image and a button — no video element, no
 * player bytes, no preload. The video is only created on click, which is the
 * difference between a page that costs a poster and one that costs megabytes
 * nobody watched.
 */
export function Walkthrough({
  walkthrough,
  className,
}: {
  walkthrough: Walkthrough;
  /** Spacing from the call site, same as ShotGallery takes. */
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  const mins = Math.floor(walkthrough.seconds / 60);
  const secs = String(walkthrough.seconds % 60).padStart(2, "0");

  return (
    <figure className={className}>
      <div className="raised-surface relative overflow-hidden rounded-xl border border-border bg-surface">
        {playing ? (
          <video
            src={walkthrough.src}
            poster={walkthrough.poster}
            controls
            autoPlay
            playsInline
            className="h-auto w-full"
          >
            Your browser cannot play this video.{" "}
            <a href={walkthrough.src}>Download it instead.</a>
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block w-full cursor-pointer"
            aria-label={`Play the ${mins}:${secs} walkthrough`}
          >
            <Image
              src={walkthrough.poster}
              width={1280}
              height={800}
              alt=""
              sizes="(min-width: 1024px) 900px, 96vw"
              className="h-auto w-full"
            />
            {/*
              A dark scrim in both themes, not the theme's own background.

              `bg-bg/45` is near-white in the light theme, so it bleached the poster
              into grey mush and made a screenshot of a dense interface unreadable
              before anyone pressed play. Darkening slightly is what every video player
              does, and it works the same way on both grounds while still letting the
              play control sit clearly on top.
            */}
            <span className="absolute inset-0 grid place-items-center bg-black/35 transition-colors duration-200 group-hover:bg-black/20">
              {/*
                Fixed white with a dark glyph, not the theme's ink pair.

                `bg-ink` follows the theme, so in the light theme this was a dark circle
                that vanished against dark regions of a poster: measured 1.12:1 against
                a dark screenshot, well under the 3:1 a control needs to be findable.
                The poster underneath is arbitrary in both themes, so the control cannot
                derive its colour from the theme.

                The ring is what makes it hold everywhere. On a dark frame the white
                disc carries the boundary at 18:1 and the ring is invisible; on a white
                frame the disc nearly disappears and the ring carries it at 3.6:1.
                Measured across white, light-UI, mid-grey and dark-UI frames, the weaker
                of the two boundaries is never below 3:1.
              */}
              <span className="grid size-16 place-items-center rounded-full bg-white text-[#141821] shadow-lg ring-1 ring-black/55 transition-transform duration-300 group-hover:scale-105">
                <Play className="ml-0.5 size-6 fill-current" aria-hidden />
              </span>
            </span>
            <span
              className="absolute right-4 bottom-4 rounded-md bg-bg/80 px-2 py-1 text-xs text-muted"
              data-readout
            >
              {mins}:{secs}
            </span>
          </button>
        )}
      </div>

      <figcaption className="mt-4 max-w-read text-sm leading-relaxed text-muted">
        {walkthrough.caption}
      </figcaption>
    </figure>
  );
}
