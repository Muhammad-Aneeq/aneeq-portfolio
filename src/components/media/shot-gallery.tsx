import Image from "next/image";
import type { shotSchema } from "@/content/schema";
import type { z } from "zod";
import { cn } from "@/lib/utils";

type Shot = z.infer<typeof shotSchema>;

/**
 * Real screenshots of the running system, with their captions.
 *
 * Every image here was rendered by the project it belongs to. Projects with no capture
 * get no gallery rather than a mockup — which is why four of the five case studies have
 * one and LedgerGuard, whose only capture is a hover loop, does not.
 *
 * **Wider than the prose column.** These are dense application screens: a reconciliation
 * queue, an eval leaderboard, a close trace. Constrained to the 44rem reading measure
 * their UI text renders at a size nobody can read, which makes the evidence decorative —
 * the opposite of the point. `breakout` lets a case study pull them out to the page
 * width where the interface is legible, while the caption stays on the reading measure
 * so the page still has a text column.
 *
 * Each one also links to the original file. A screenshot you cannot open at full size is
 * an assertion; one you can is evidence.
 */
export function ShotGallery({
  shots,
  className,
  breakout = false,
  variant = "stack",
}: {
  shots: readonly Shot[];
  className?: string;
  /** Let the images exceed the prose column up to the page container width. */
  breakout?: boolean;
  /**
   * `stack` is a detail page: every screenshot in sequence with its caption under it,
   * because there the captions are the argument and a reader is meant to read them all.
   *
   * `slider` is /demos, which lists many projects at once. Four full-width screenshots
   * per project turned that page into a wall — the projects stopped being scannable,
   * which is the one thing an index has to be. The slider gives each project a single
   * screen's worth of height and lets anyone who wants the rest swipe through them.
   */
  variant?: "stack" | "slider";
}) {
  if (shots.length === 0) return null;

  // One screenshot is not a carousel. A lone slide in a scroll track just adds a
  // scrollbar and an instruction to scroll something that does not move.
  if (variant === "slider" && shots.length > 1) {
    return (
      <div className={className}>
        <p className="text-xs text-faint uppercase" data-readout>
          {shots.length} screens · scroll to see them all
        </p>

        {/*
          A CSS scroll-snap track, not a JavaScript carousel.

          It needs no hydration, so it works with scripting off like everything else
          here, and it costs the route nothing. `tabIndex` is required rather than
          decorative: a scrollable region that cannot be reached by keyboard is a
          WCAG failure, and the browser will not focus this one on its own.
        */}
        <div
          role="group"
          aria-label={`${shots.length} screens`}
          tabIndex={0}
          className="shot-slider mt-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5"
        >
          {shots.map((shot, i) => (
            <figure key={shot.src} className="w-full shrink-0 snap-start">
              <Frame shot={shot} eager={i === 0} breakout={false} />
              <Caption shot={shot} />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-12", className)}>
      {shots.map((shot, i) => (
        <figure key={shot.src}>
          <Frame shot={shot} eager={i === 0} breakout={breakout} />
          <Caption shot={shot} />
        </figure>
      ))}
    </div>
  );
}

function Frame({
  shot,
  eager,
  breakout,
}: {
  shot: Shot;
  eager: boolean;
  breakout: boolean;
}) {
  return (
    <div
      className={cn(
        // `raised-surface`: these are the largest visual elements on a case study
        // or lab page, and without the shared shadow they were the only blocks on
        // the site still sitting flat on the page ground.
        "raised-surface overflow-hidden rounded-xl border border-border bg-surface",
        breakout && "xl:-mx-24 2xl:-mx-40",
      )}
    >
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        // The first shot is likely near the fold on a case study; the rest
        // can wait until they are scrolled to.
        loading={eager ? "eager" : "lazy"}
        /*
          These describe the real rendered width, which the previous value did not.
          Measured on /demos at a 1440px viewport: the images lay out at 1182px
          while `sizes` claimed 900px, so the browser selected the 1080px candidate
          for a 1182px slot and every screenshot was being upscaled ~10%. On
          screenshots of dense UI that is exactly where it shows.
        */
        sizes={
          breakout
            ? "(min-width: 1536px) 1400px, (min-width: 1280px) 1200px, (min-width: 1024px) 900px, 96vw"
            : "(min-width: 1280px) 1200px, (min-width: 1024px) 900px, 96vw"
        }
        className="h-auto w-full"
      />
    </div>
  );
}

function Caption({ shot }: { shot: Shot }) {
  return (
    <figcaption className="mt-4 max-w-read text-sm leading-relaxed text-muted">
      {shot.caption}{" "}
      <a
        href={shot.src}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap text-faint underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-muted hover:decoration-muted"
      >
        View full size
      </a>
    </figcaption>
  );
}
