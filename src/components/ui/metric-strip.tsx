import Link from "next/link";
import type { SiteMetric } from "@/content/metrics";
import { cn } from "@/lib/utils";

/**
 * The one way a group of site-level figures is rendered.
 *
 * Two layouts of the same component rather than two components: `rule` is the
 * four-across band with a border above and below, `grid` is the 2×2 block used where
 * a strip sits beside prose. They share the readout, the label, the scope line and the
 * evidence link, so a figure cannot look like a different kind of claim depending on
 * which page it appears on.
 *
 * **Values are shown immediately, not counted up.** The count-up used to run here. It
 * was removed because it is a readout of a fact, and a readout that spends 900ms
 * displaying numbers that are not true — 1,946 on the way to 5,000 — is worse than no
 * animation at all on a site whose whole argument is that its claims can be checked.
 */
export function MetricStrip({
  metrics,
  layout = "rule",
  className,
}: {
  metrics: readonly SiteMetric[];
  layout?: "rule" | "grid";
  className?: string;
}) {
  /*
    A `ul`, not a `dl`.

    The first version was a definition list, which axe correctly rejected twice over: the
    evidence link sits between the `dl` and its terms, so the `dl` had disallowed direct
    children, and the figure is rendered *above* its label, so every pair was a `dd`
    before its `dt`. Fixing the order would have inverted the visual hierarchy — the
    number is the thing being read first, deliberately. A list of figures is a list;
    reaching for `dl` was semantics applied for their own sake.
  */
  return (
    <ul data-stagger
      className={cn(
        layout === "rule"
          ? "grid grid-cols-2 gap-x-8 gap-y-10 border-y border-border py-10 sm:grid-cols-4"
          : "grid grid-cols-2 gap-x-8 gap-y-10",
        className,
      )}
    >
      {metrics.map((m) => {
        const body = (
          <>
            <span className="block font-display text-h2 leading-none font-semibold tracking-tight text-text">
              {m.value}
            </span>
            <span className="mt-3 block text-sm leading-snug text-muted">{m.label}</span>
            {m.scope && (
              <span className="mt-2 block text-xs leading-snug text-faint">{m.scope}</span>
            )}
          </>
        );

        return (
          <li data-reveal key={m.id} className="min-w-0">
            {m.href ? (
              <Link
                href={m.href}
                className="metric-link group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text"
              >
                {body}
                <span
                  aria-hidden
                  className="mt-3 block h-px w-8 bg-border group-hover:bg-ink group-focus-visible:bg-ink"
                />
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
