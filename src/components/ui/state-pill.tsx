import { cn } from "@/lib/utils";

/**
 * The three governance states the whole site is coloured by. These are not
 * decorative variants — they mean what they mean, everywhere. SPEC §3.2.
 */
export type GovernanceState = "pass" | "gate" | "halt";

const STYLES: Record<GovernanceState, { wrap: string; dot: string }> = {
  pass: { wrap: "border-pass/35 bg-pass-dim text-pass", dot: "bg-pass" },
  gate: { wrap: "border-gate/35 bg-gate-dim text-gate", dot: "bg-gate" },
  halt: { wrap: "border-halt/35 bg-halt-dim text-halt", dot: "bg-halt" },
};

export function StatePill({
  state,
  children,
  className,
}: {
  state: GovernanceState;
  children: React.ReactNode;
  className?: string;
}) {
  const s = STYLES[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
        s.wrap,
        className,
      )}
      data-readout
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", s.dot)} aria-hidden />
      {children}
    </span>
  );
}
