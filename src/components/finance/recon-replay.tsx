import { StateLegend } from "@/components/ui/state-legend";
import { cn } from "@/lib/utils";
import "./recon-replay.css";

/**
 * The /finance hero: a bank reconciliation, replayed.
 *
 * Replaces the three.js "posting stream". That scene drew a 90px strip of unlabelled
 * blocks in a 460px box, cut its blocks off at the canvas edge, lost them against the
 * dark ground, and shipped a WebGL engine to say "a queue waits at a gate". Every
 * AI-accounting product checked in the research (Rillet, DualEntry, and Linear outside
 * finance) shows the work itself instead: a product surface doing the job. So this
 * does the job a reader from finance recognises on sight.
 *
 * Five bank lines are matched to the ledger. One is off by 360.00, which is divisible by
 * nine: the accountant's tell for transposed digits. The agent does not fix it. It holds
 * the line for a person, and only after a (simulated) approval is the correction posted.
 * The hold is the longest phase in the cycle, because it is the argument.
 *
 * Pure CSS, no JavaScript and no library. The keyframes are generated below from one
 * timeline, so every element agrees on when things happen. The element's resting style
 * is the finished state (all five reconciled, the correction approved), which is what a
 * reader sees with reduced motion, without JavaScript, or in a screenshot.
 *
 * Text is never faded with opacity: states swap with `visibility`, and only lines,
 * tints and the stamp move. A mid-fade label would fail contrast for whoever caught it.
 */

const CYCLE = 14;
const RESET = 13.4;
const APPROVE = 8.6;
const POST = 9.4;
const EPS = 0.02;

type Row = {
  date: string;
  payee: string;
  bank: string;
  ledger: string;
  account: string;
  at: number;
  /** The keyed-wrong ledger amount shown until the correction posts. */
  wrong?: string;
};

const ROWS: Row[] = [
  { date: "03-02", payee: "Card clearing", bank: "+4,360.00", ledger: "4,360.00", account: "Card clearing", at: 1.0 },
  { date: "03-04", payee: "Cloud hosting", bank: "−2,180.00", ledger: "2,180.00", account: "Hosting expense", at: 1.9 },
  { date: "03-07", payee: "Northwind Ltd", bank: "+3,150.00", ledger: "3,150.00", wrong: "3,510.00", account: "Receivables", at: 2.8 },
  { date: "03-09", payee: "Payroll run", bank: "−8,900.00", ledger: "8,900.00", account: "Payroll", at: 3.7 },
  { date: "03-12", payee: "Office lease", bank: "−2,750.00", ledger: "2,750.00", account: "Rent", at: 4.6 },
];

const HELD = ROWS.findIndex((r) => r.wrong);

const pct = (t: number) => `${((Math.min(Math.max(t, 0), CYCLE) / CYCLE) * 100).toFixed(3)}%`;

/** One property's timeline: hold each value until the next change, then move to it over `d` seconds. */
function track(name: string, prop: string, initial: string, changes: [number, string, number?][]) {
  const frames = [`0%{${prop}:${initial}}`];
  let prev = initial;
  for (const [t, value, d = EPS] of changes) {
    frames.push(`${pct(t)}{${prop}:${prev}}`, `${pct(t + d)}{${prop}:${value}}`);
    prev = value;
  }
  frames.push(`100%{${prop}:${prev}}`);
  return `@keyframes ${name}{${frames.join("")}}`;
}

function buildCss() {
  const css: string[] = [];
  const play = (selector: string, name: string) =>
    `.rr ${selector}{animation:${name} ${CYCLE}s linear infinite}`;

  ROWS.forEach((row, i) => {
    const r = `[data-row="${i}"]`;
    const held = i === HELD;
    const done = held ? POST : row.at;

    css.push(track(`rr-${i}-link`, "transform", "scaleX(0)", [[row.at, "scaleX(1)", 0.35], [RESET, "scaleX(0)", 0.3]]));
    css.push(play(`${r} .rr-link`, `rr-${i}-link`));
    css.push(track(`rr-${i}-pending`, "visibility", "visible", [[row.at, "hidden"], [RESET, "visible"]]));
    css.push(play(`${r} .rr-st-pending`, `rr-${i}-pending`));
    css.push(track(`rr-${i}-ok`, "visibility", "hidden", [[done + 0.3, "visible"], [RESET, "hidden"]]));
    css.push(play(`${r} .rr-st-ok`, `rr-${i}-ok`));

    if (held) {
      css.push(track("rr-held-st", "visibility", "hidden", [[row.at + 0.3, "visible"], [POST + 0.3, "hidden"], [RESET, "hidden"]]));
      css.push(play(`${r} .rr-st-held`, "rr-held-st"));
      css.push(track("rr-held-line", "background-color", "var(--gate)", [[POST, "var(--pass)", 0.3], [RESET, "var(--gate)"]]));
      css.push(`.rr ${r} .rr-link{animation:rr-${i}-link ${CYCLE}s linear infinite,rr-held-line ${CYCLE}s linear infinite}`);
      css.push(track("rr-held-bg", "background-color", "transparent", [[row.at, "var(--gate-dim)", 0.3], [POST, "var(--pass-dim)", 0.3], [POST + 0.9, "transparent", 0.6]]));
      css.push(play(`${r}`, "rr-held-bg"));
      css.push(track("rr-wrong", "visibility", "visible", [[POST, "hidden"], [RESET, "visible"]]));
      css.push(play(`${r} .rr-amt-wrong`, "rr-wrong"));
      css.push(track("rr-right", "visibility", "hidden", [[POST, "visible"], [RESET, "hidden"]]));
      css.push(play(`${r} .rr-amt-right`, "rr-right"));
      css.push(track("rr-stamp-v", "visibility", "hidden", [[APPROVE, "visible"], [RESET, "hidden"]]));
      css.push(track("rr-stamp-t", "transform", "scale(1.9) rotate(-14deg)", [[APPROVE, "scale(1) rotate(-8deg)", 0.28], [RESET, "scale(1.9) rotate(-14deg)"]]));
      css.push(`.rr .rr-stamp{animation:rr-stamp-v ${CYCLE}s linear infinite,rr-stamp-t ${CYCLE}s linear infinite}`);
    } else {
      css.push(track(`rr-${i}-bg`, "background-color", "transparent", [[row.at, "var(--pass-dim)", 0.2], [row.at + 0.7, "transparent", 0.6]]));
      css.push(play(`${r}`, `rr-${i}-bg`));
    }
  });

  // The agent's cursor: walks the rows as it matches them, then parks on the held line
  // until a person releases it.
  const at = (i: number) => `translateY(calc(var(--rr-row) * ${i}))`;
  const moves: [number, string, number?][] = ROWS.map((row, i) => [Math.max(row.at - 0.45, 0.4), at(i), 0.3]);
  moves.push([ROWS[ROWS.length - 1].at + 0.6, at(HELD), 0.45], [RESET, at(0)]);
  css.push(track("rr-scan-t", "transform", at(0), moves));
  css.push(track("rr-scan-v", "visibility", "hidden", [[0.4, "visible"], [APPROVE, "hidden"]]));
  css.push(track("rr-scan-c", "border-color", "var(--border-strong)", [[ROWS[ROWS.length - 1].at + 0.6, "var(--gate)", 0.3], [RESET, "var(--border-strong)"]]));
  css.push(`.rr .rr-scan{animation:rr-scan-t ${CYCLE}s linear infinite,rr-scan-v ${CYCLE}s linear infinite,rr-scan-c ${CYCLE}s linear infinite}`);

  // The matched count. The held line only counts once it is posted.
  const counts = ROWS.map((row, i) => (i === HELD ? POST : row.at) + 0.3).sort((a, b) => a - b);
  css.push(track("rr-count", "--rr-n", "0", [...counts.map((t, n) => [t, String(n + 1)] as [number, string]), [RESET, "0"]]));
  css.push(play(".rr-count", "rr-count"));

  // The status line under the table.
  css.push(track("rr-msg-scan", "visibility", "visible", [[ROWS[HELD].at + 0.3, "hidden"], [RESET, "visible"]]));
  css.push(play(".rr-msg-scan", "rr-msg-scan"));
  css.push(track("rr-msg-held", "visibility", "hidden", [[ROWS[HELD].at + 0.3, "visible"], [APPROVE, "hidden"]]));
  css.push(play(".rr-msg-held", "rr-msg-held"));
  css.push(track("rr-msg-approved", "visibility", "hidden", [[APPROVE, "visible"], [POST + 0.3, "hidden"]]));
  css.push(play(".rr-msg-approved", "rr-msg-approved"));
  css.push(track("rr-msg-done", "visibility", "hidden", [[POST + 0.3, "visible"], [RESET, "hidden"]]));
  css.push(play(".rr-msg-done", "rr-msg-done"));

  return `@media (prefers-reduced-motion: no-preference){${css.join("")}}`;
}

const KEYFRAMES = buildCss();

const LABEL =
  "Illustrative bank reconciliation. Five bank lines are matched to the ledger. One differs by 360.00, divisible by nine, so likely transposed digits: the agent holds it for a person instead of fixing it. After a simulated approval the correction posts and all five reconcile.";

export function ReconReplay({ className }: { className?: string }) {
  return (
    <figure className={cn("rr-figure", className)}>
      <style href="recon-replay-keyframes" precedence="default">{KEYFRAMES}</style>

      <div className="rr" role="img" aria-label={LABEL}>
        <div className="rr-head">
          <span className="rr-title">
            <span className="rr-live" aria-hidden />
            Reconciling · Operating account · March
          </span>
          <span className="rr-count" data-readout />
        </div>

        <div className="rr-cols" data-readout>
          <span>Bank feed</span>
          <span>Ledger</span>
        </div>

        <div className="rr-rows">
          <span className="rr-scan" aria-hidden />
          {ROWS.map((row, i) => (
            <div className="rr-row" data-row={i} key={row.date}>
              <span className="rr-date" data-readout>{row.date}</span>
              <span className="rr-payee">{row.payee}</span>
              <span className="rr-amt">{row.bank}</span>
              <span className="rr-match">
                <span className="rr-link" data-held={row.wrong ? "" : undefined} />
                <span className="rr-st rr-st-pending">…</span>
                <span className="rr-st rr-st-ok">✓</span>
                {row.wrong && <span className="rr-st rr-st-held">⏸</span>}
              </span>
              <span className="rr-amt rr-ledger">
                {row.wrong ? (
                  <>
                    <span className="rr-amt-wrong">{row.wrong}</span>
                    <span className="rr-amt-right">{row.ledger}</span>
                  </>
                ) : (
                  row.ledger
                )}
              </span>
              <span className="rr-acct">{row.account}</span>
              {row.wrong && <span className="rr-stamp" data-readout>Approved</span>}
            </div>
          ))}
        </div>

        <div className="rr-msg" data-readout>
          <span className="rr-msg-scan">→ matching bank lines to the ledger</span>
          <span className="rr-msg-held">
            ⏸ Northwind is off by 360.00. Divisible by 9: likely transposed digits. Held for a person.
          </span>
          <span className="rr-msg-approved">✎ correction approved (simulated)</span>
          <span className="rr-msg-done">✓ 5 of 5 reconciled · 1 correction approved</span>
        </div>
      </div>

      <StateLegend className="mt-4" />

      {/*
        Server-rendered on every path. An animation of a governance control approving its
        own work, on a site whose argument is that a person must stand there, would read
        as a claim rather than a picture. So it says what it is.
      */}
      <figcaption className="mt-3 text-xs leading-relaxed text-faint" data-readout>
        Illustrative replay. The approval step is simulated; in the real systems a person
        signs it.
      </figcaption>
    </figure>
  );
}
