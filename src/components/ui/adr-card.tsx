import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export type ADR = {
  decision: string;
  alternatives: string;
  why: string;
};

/**
 * Architectural Decision Record, rendered.
 *
 * This is where senior judgement becomes visible: not "I used LangGraph" but
 * "here is what I considered and why I ruled it out". The research names
 * architecture and decision-making as the clearest mid-vs-senior tell.
 */
export function ADRCard({ adr, index }: { adr: ADR; index: number }) {
  return (
    <Surface className="p-6">
      <p className="text-xs text-faint" data-readout>
        ADR-{String(index + 1).padStart(2, "0")}
      </p>

      <h3 className="mt-3 max-w-read text-h3">{adr.decision}</h3>

      {/* Alternative, then verdict, then reason — the same three rows in the same order
          on every record, so five of them can be scanned rather than read end to end. */}
      <dl className="mt-5 max-w-wide space-y-4 text-sm">
        <Row term="Alternative" detail={adr.alternatives} />
        <Row term="Why not" detail={adr.why} accent />
      </dl>
    </Surface>
  );
}

function Row({
  term,
  detail,
  accent = false,
}: {
  term: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <dt className={cn("text-xs", accent ? "text-text" : "text-faint")} data-readout>
        {term}
      </dt>
      <dd className="leading-relaxed text-muted">{detail}</dd>
    </div>
  );
}
