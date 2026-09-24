import Link from "next/link";
import { cn } from "@/lib/utils";

export type SectionTab = {
  href: string;
  label: string;
  /** Shown beside the label so a reader knows the size of each view before opening it. */
  count: number;
};

/**
 * One tab strip, used wherever a collection splits in two.
 *
 * Real links rather than client-side tab state, so each view keeps its own URL and
 * stays shareable, prerendered and reachable with JavaScript off. That is also why
 * the active tab is decided by the caller from its own route rather than read from
 * `usePathname`: this stays a server component and costs the page nothing.
 *
 * Extracted when /demos gained the same split /work and /labs already had. A second
 * hand-built strip would have drifted from the first within a change or two, which is
 * the failure docs/DESIGN-SYSTEM.md exists to prevent.
 */
export function SectionTabs({
  label,
  tabs,
  activeHref,
  className,
}: {
  /** Names the nav for screen readers, e.g. "Work sections". */
  label: string;
  tabs: SectionTab[];
  activeHref: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("mt-10 flex items-center gap-1 border-b border-border", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm transition-colors duration-200",
              isActive
                ? "border-text font-medium text-text"
                : "border-transparent text-muted hover:border-border-strong hover:text-text",
            )}
          >
            {tab.label}{" "}
            <span className={cn("ml-1", isActive ? "text-muted" : "text-faint")} data-readout>
              {tab.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
