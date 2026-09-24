import { KIND_VAR } from "@/components/three/trace-replay/tones";
import type { TraceStation } from "@/content/schema";
import { cn } from "@/lib/utils";

/**
 * The static trace.
 *
 * Used for reduced motion, on mobile, and when WebGL is unavailable — and it is a
 * document rather than a picture of one, so it is the better artefact in every case
 * where someone is reading rather than browsing. The scroll version is the flourish;
 * this is the reference.
 */
export function TraceFallback({
  stations,
  className,
}: {
  stations: readonly TraceStation[];
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {/* The spine. Inset so it threads the dots rather than sitting behind the text. */}
      <span
        className="absolute top-2 bottom-2 left-[7px] w-px bg-border"
        aria-hidden
      />

      {stations.map((station, i) => (
        <li key={station.id} className="relative flex gap-5 pb-8 last:pb-0">
          <span
            className="relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-2 border-bg"
            style={{ backgroundColor: KIND_VAR[station.kind] }}
            aria-hidden
          />
          <div className="-mt-0.5 min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-xs text-faint" data-readout>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[1.0625rem] font-semibold">
                {station.label}
              </span>
              <span
                className="text-xs"
                style={{ color: KIND_VAR[station.kind] }}
                data-readout
              >
                {station.kind}
              </span>
            </p>
            <p className="mt-2 max-w-read text-sm leading-relaxed text-muted">
              {station.caption}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
