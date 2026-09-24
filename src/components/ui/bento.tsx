import { cn } from "@/lib/utils";

/**
 * Bento grid — used only on /labs.
 *
 * The research finding is specific: bento wins when visitors explore options in
 * parallel rather than following a sequence. Eight sibling projects with no
 * reading order is exactly that case; the case studies, which do have an order,
 * stay in a conventional list.
 */
export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[15rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Column span at `lg` and up. Below that, cells stack to keep the reading order sane. */
export type BentoSpan = 2 | 3 | 4;

const SPANS: Record<BentoSpan, string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};

const ROWS: Record<number, string> = {
  1: "lg:row-span-1",
  2: "lg:row-span-2",
};

export function BentoCell({
  span = 2,
  rows = 1,
  className,
  children,
}: {
  span?: BentoSpan;
  rows?: 1 | 2;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(SPANS[span], ROWS[rows], className)}>{children}</div>;
}
