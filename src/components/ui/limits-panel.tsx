import { cn } from "@/lib/utils";

/**
 * "What this system cannot do."
 *
 * A first-class, styled section on every case study — built on the research
 * finding that a senior engineer's hallmark is knowing the limits of their own
 * system. Almost nobody publishes this, which is exactly why it is worth the
 * space. Tinted `halt`, because that is what the colour means.
 */
export function LimitsPanel({
  limits,
  className,
}: {
  limits: readonly string[];
  className?: string;
}) {
  return (
    <section
      aria-labelledby="limits-heading"
      className={cn(
        "rounded-xl border border-halt/30 bg-halt-dim p-6 sm:p-8",
        className,
      )}
    >
      <p className="text-xs text-halt uppercase" data-readout>
        limits
      </p>

      <h2 id="limits-heading" className="mt-3 text-h3">
        What this system cannot do
      </h2>

      <ul className="mt-6 space-y-3.5">
        {limits.map((limit) => (
          <li key={limit} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-halt"
              aria-hidden
            />
            {limit}
          </li>
        ))}
      </ul>
    </section>
  );
}
