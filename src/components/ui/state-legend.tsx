import { cn } from "@/lib/utils";

/**
 * The three-colour code, spelled out where it is used.
 *
 * The site has exactly one colour system that carries meaning — teal passed, amber
 * awaiting a person, red stopped — and until now a reader had to infer it across five
 * pages. Worse, the same teal was also on buttons, eyebrows, links and focus rings, so
 * the inference available to them was wrong.
 *
 * With the accent removed from everything decorative, the code is learnable; this makes
 * it learnable in one glance, next to the scene that uses it. Three words, three
 * swatches, once per surface.
 *
 * Each entry is a **symbol and a word as well as a colour**, so it survives greyscale
 * printing, colour blindness, and the case where the reader simply is not looking for a
 * legend.
 */

const STATES = [
  { symbol: "✓", label: "passed", swatch: "bg-pass", text: "text-pass" },
  { symbol: "⏸", label: "awaiting a person", swatch: "bg-gate", text: "text-gate" },
  { symbol: "✗", label: "stopped", swatch: "bg-halt", text: "text-halt" },
] as const;

export function StateLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
      aria-label="What the colours mean"
    >
      {STATES.map((s) => (
        <li key={s.label} className="flex items-center gap-2 text-xs" data-readout>
          <span
            aria-hidden
            className={cn("size-1.5 shrink-0 rounded-full", s.swatch)}
          />
          <span className={cn("shrink-0", s.text)} aria-hidden>
            {s.symbol}
          </span>
          <span className="text-muted">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
