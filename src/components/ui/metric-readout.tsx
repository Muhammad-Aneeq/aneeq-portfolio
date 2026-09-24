import Link from "next/link";
import { cn } from "@/lib/utils";

export type Metric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /**
   * Attribution for a number that cannot be independently checked. Rendered
   * inline rather than hidden in a tooltip — saying so plainly is the point.
   */
  note?: string;
  /** Where the evidence for this number lives. Every claim should be clickable. */
  href?: string;
};

/**
 * A single instrument reading. Used in the home proof bar and in case-study
 * results sections — the research is blunt that quantified impact is what gets
 * scanned first, so these are large, mono, and linked to their evidence.
 */
export function MetricReadout({
  metric,
  size = "lg",
  className,
}: {
  metric: Metric;
  size?: "lg" | "sm";
  className?: string;
}) {
  /*
    Rendered directly, not counted up.

    The count-up was removed rather than shortened. It animated from zero to the real
    figure, which means that for the length of the animation the page displayed numbers
    that are not true — the proof bar was caught showing "1,946" where the figure is
    5,000. On a site whose argument is that every claim is a readout you can check,
    a readout that is briefly wrong is the one animation that contradicts the thesis.

    It is also server-rendered now, so the figure is in the HTML for crawlers and answer
    engines instead of arriving with a client component.
  */
  const body = (
    <>
      <span
        className={cn(
          "block font-display font-semibold tracking-tight text-text",
          size === "lg" ? "text-h1" : "text-h3",
        )}
        data-readout
      >
        {metric.prefix ?? ""}
        {metric.decimals != null ? metric.value.toFixed(metric.decimals) : metric.value}
        {metric.suffix ?? ""}
      </span>
      <span
        className={cn(
          "mt-2 block text-sm leading-snug text-muted",
          size === "sm" && "mt-1 text-xs",
        )}
      >
        {metric.label}
      </span>
      {metric.note && (
        <span className="mt-2 block max-w-56 text-xs leading-snug text-faint">
          {metric.note}
        </span>
      )}
    </>
  );

  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className={cn(
          "group block rounded-md transition-colors duration-200 hover:text-text",
          className,
        )}
      >
        {body}
        {/* Focus gets the same rule as hover — a keyboard reader tabbing the proof
            bar should see which number they are on, not just the outline. */}
        <span className="mt-2 block h-px w-8 bg-border transition-colors duration-300 group-hover:bg-ink group-focus-visible:bg-ink" />
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
