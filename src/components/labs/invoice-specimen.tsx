import "./invoice-specimen.css";

/**
 * "The repair that tried to cheat": InvoiceAudit's pipeline, told as you scroll.
 *
 * A specimen invoice is extracted, checked by arithmetic, repaired twice, and the second
 * repair is caught: it makes the sums pass by editing the total alone, with no corrected
 * reading behind it. That is the project's actual argument (a separate detector flags
 * aggregate-only changes that satisfy arithmetic without evidence), so the animation is
 * the claim, shown rather than described. Every figure is fictional.
 *
 * How it moves: the figure sits in a tall wrapper with a named view timeline, and the
 * stage inside is sticky, so the page keeps scrolling at its own speed while the story
 * advances with it. Nothing is hijacked. Every state change is a keyframe generated from
 * STORY below, at a percentage of the wrapper's `contain` range.
 *
 * At rest the figure is the finished story: both repairs shown as before → after, all
 * three checks resolved, the detector's flag and the review stamp. That is what reduced
 * motion, narrow or short screens, no-JS and unsupported browsers get, so nobody sees
 * half a sequence. Text swaps with `visibility`, never a fade.
 */

/** Story points, as percentages of the scroll range. */
const AT = {
  rows: [3, 5.5, 8, 10.5, 13, 15.5, 18, 20.5],
  check: [26, 30, 34],
  repair1: 44,
  recheck1: 49,
  repair2: 58,
  recheck2: 62,
  detect: 72,
  stamp: 86,
  routed: 88,
};

const STEPS = [
  { id: "extract", label: "Extract", from: 0, to: 23 },
  { id: "check", label: "Check", from: 23, to: 40 },
  { id: "repair", label: "Repair", from: 40, to: 68 },
  { id: "recheck", label: "Re-check", from: 68, to: 82 },
  { id: "route", label: "Route", from: 82, to: 100 },
];

const NOTES = [
  { at: 0, text: "The model proposes a record. It is treated as an untrusted proposal." },
  { at: 23, text: "Deterministic arithmetic checks it. Three rules fail: 6 × 120.00 is 720.00, not 702.00." },
  { at: 40, text: "Repair 1 re-reads line 2 from the source: 702.00 was 720.00." },
  { at: 54, text: "Repair 2 edits the total alone, and now every sum passes." },
  { at: 68, text: "A second check compares the records: the total moved with no new reading behind it." },
  { at: 82, text: "Arithmetic alone would have accepted this. It goes to a person." },
];

type Track = { prop: string; initial: string; changes: [number, string][] };

const EPS = 0.25;
function keyframes(name: string, { prop, initial, changes }: Track) {
  const frames = [`0%{${prop}:${initial}}`];
  let prev = initial;
  for (const [at, value] of changes) {
    frames.push(`${Math.max(at - EPS, 0).toFixed(2)}%{${prop}:${prev}}`, `${at.toFixed(2)}%{${prop}:${value}}`);
    prev = value;
  }
  frames.push(`100%{${prop}:${prev}}`);
  return `@keyframes ${name}{${frames.join("")}}`;
}

function buildCss() {
  const css: string[] = [];
  const play = (selector: string, ...names: string[]) =>
    `.is-wrap ${selector}{animation-name:${names.join(",")};animation-timing-function:linear;animation-fill-mode:both;animation-timeline:--specimen;animation-range:contain 0% contain 100%}`;
  const show = (name: string, at: number, until?: number) =>
    keyframes(name, { prop: "visibility", initial: "hidden", changes: until === undefined ? [[at, "visible"]] : [[at, "visible"], [until, "hidden"]] });
  const tint = (color: string) => `inset 0 0 0 1.5px var(${color})`;

  // Extracted fields arrive one by one.
  AT.rows.forEach((at, i) => {
    css.push(show(`is-row-${i}`, at), play(`[data-row="${i}"]`, `is-row-${i}`));
  });

  // Field outlines: red where a check fails, then the outcome.
  const outline = (name: string, changes: [number, string][]) =>
    keyframes(name, { prop: "box-shadow", initial: "inset 0 0 0 1.5px transparent", changes });
  css.push(outline("is-f-line2", [[AT.check[0], tint("--halt")], [AT.repair1, tint("--pass")], [AT.repair1 + 6, "inset 0 0 0 1.5px transparent"]]), play('[data-row="4"]', "is-row-4", "is-f-line2"));
  css.push(outline("is-f-sub", [[AT.check[1], tint("--halt")], [AT.recheck1, "inset 0 0 0 1.5px transparent"]]), play('[data-row="5"]', "is-row-5", "is-f-sub"));
  css.push(outline("is-f-total", [[AT.check[2], tint("--halt")], [AT.repair2, tint("--halt")], [AT.detect, tint("--gate")]]), play('[data-row="7"]', "is-row-7", "is-f-total"));

  // The two repaired values: plain until repaired, then struck → new.
  css.push(show("is-orig-l2", AT.rows[4], AT.repair1), play('[data-row="4"] .is-orig', "is-orig-l2"));
  css.push(show("is-fix-l2", AT.repair1), play('[data-row="4"] .is-fix', "is-fix-l2"));
  css.push(show("is-orig-tot", AT.rows[7], AT.repair2), play('[data-row="7"] .is-orig', "is-orig-tot"));
  css.push(show("is-fix-tot", AT.repair2), play('[data-row="7"] .is-fix', "is-fix-tot"));

  // Checks: each appears failing, then resolves.
  const resolved = [AT.recheck1, AT.recheck1, AT.recheck2];
  AT.check.forEach((at, i) => {
    css.push(show(`is-chk-${i}`, at), play(`[data-check="${i}"]`, `is-chk-${i}`));
    css.push(show(`is-chk-x-${i}`, at, resolved[i]), play(`[data-check="${i}"] .is-x`, `is-chk-x-${i}`));
    css.push(show(`is-chk-ok-${i}`, resolved[i]), play(`[data-check="${i}"] .is-ok`, `is-chk-ok-${i}`));
  });

  // Repair log, detector, stamp, final line.
  css.push(show("is-log-1", AT.repair1), play('[data-log="1"]', "is-log-1"));
  css.push(show("is-log-2", AT.repair2), play('[data-log="2"]', "is-log-2"));
  css.push(show("is-detect", AT.detect), play(".is-detect", "is-detect"));
  css.push(show("is-stamp-v", AT.stamp));
  css.push(keyframes("is-stamp-t", { prop: "transform", initial: "scale(1.8) rotate(-12deg)", changes: [[AT.stamp, "scale(1.8) rotate(-12deg)"], [AT.stamp + 2, "scale(1) rotate(-6deg)"]] }));
  css.push(play(".is-stamp", "is-stamp-v", "is-stamp-t"));
  css.push(show("is-routed", AT.routed), play(".is-routed", "is-routed"));

  // The stepper and the narration.
  STEPS.forEach((s, i) => {
    const on = "var(--accent)", off = "var(--border)";
    css.push(keyframes(`is-step-${i}`, { prop: "border-color", initial: s.from === 0 ? on : off, changes: [...(s.from > 0 ? [[s.from, on] as [number, string]] : []), ...(s.to < 100 ? [[s.to, off] as [number, string]] : [])] }));
    css.push(play(`[data-step="${i}"]`, `is-step-${i}`));
  });
  NOTES.forEach((n, i) => {
    const next = NOTES[i + 1]?.at;
    css.push(keyframes(`is-note-${i}`, { prop: "visibility", initial: n.at === 0 ? "visible" : "hidden", changes: [...(n.at > 0 ? [[n.at, "visible"] as [number, string]] : []), ...(next !== undefined ? [[next, "hidden"] as [number, string]] : [])] }));
    css.push(play(`[data-note="${i}"]`, `is-note-${i}`));
  });

  return `@media (prefers-reduced-motion:no-preference) and (min-width:960px) and (min-height:680px){@supports (animation-timeline:view()){${css.join("")}}}`;
}

const KEYFRAMES = buildCss();

const LABEL =
  "Illustrative specimen of InvoiceAudit's pipeline. A model extracts an invoice; arithmetic finds three violations. Repair 1 re-reads line 2 from the source, 702.00 to 720.00. Repair 2 changes only the total, from 2,706.00 to 2,724.00, which makes every sum pass. The repair detector flags that aggregate-only change because no corrected source reading supports it, and the invoice is routed to a person.";

export function InvoiceSpecimen() {
  return (
    <section className="is-section" aria-labelledby="specimen-title">
      <h2 id="specimen-title" className="text-h2">The repair that tried to cheat</h2>
      <p className="mt-4 max-w-read leading-relaxed text-muted">
        Scroll through one invoice. Getting the sums to pass is easy; the point is noticing
        when a repair passes them without a reason.
      </p>

      <style href="invoice-specimen-keyframes" precedence="default">{KEYFRAMES}</style>

      <div className="is-wrap">
        <figure className="is-stage">
          <div className="is-card" role="img" aria-label={LABEL}>
            <ol className="is-steps" data-readout>
              {STEPS.map((s, i) => (
                <li key={s.id} data-step={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span> {s.label}
                </li>
              ))}
            </ol>

            <p className="is-note">
              {NOTES.map((n, i) => (
                <span key={n.at} data-note={i}>{n.text}</span>
              ))}
            </p>

            <div className="is-grid">
              <div className="is-doc">
                <div className="is-doc-head" data-readout>
                  <span>Specimen · not a real invoice</span>
                  <span>INV-2041</span>
                </div>
                <div className="is-fields">
                    <Field row={0} label="Vendor" value="Harbourline Services" />
                    <Field row={1} label="Invoice date" value="2026-03-14" />
                    <Field row={2} label="Hosting · 12 × 85.00" value="1,020.00" />
                    <Field row={3} label="Licences · 3 × 240.00" value="720.00" />
                    <Field row={4} label="Support · 6 × 120.00" value="702.00" fix="720.00" note="re-read p.1, line 8" />
                    <Field row={5} label="Subtotal" value="2,460.00" />
                    <Field row={6} label="Tax" value="264.00" />
                    <Field row={7} label="Total" value="2,706.00" fix="2,724.00" note="no new reading" />
                </div>
              </div>

              <div className="is-checks">
                <p className="is-col-head" data-readout>Arithmetic</p>
                <Check i={0} text="Each line: quantity × price = amount" />
                <Check i={1} text="Line amounts sum to the subtotal" />
                <Check i={2} text="Subtotal + tax = total" />

                <p className="is-col-head mt-5" data-readout>Repair log</p>
                <p className="is-log" data-log="1">↻ Iteration 1: support line re-read from source</p>
                <p className="is-log" data-log="2">↻ Iteration 2: total set to 2,724.00</p>

                <p className="is-detect">
                  <span aria-hidden>⏸</span> Repair detector: aggregate-only change. The total moved, no line or source reading did.
                </p>
                <p className="is-routed" data-readout>→ routed to a person</p>
              </div>
            </div>
            <span className="is-stamp" data-readout>Held for review</span>
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-faint" data-readout>
            Illustrative specimen. Every figure is fictional; the steps follow InvoiceAudit&apos;s
            pipeline. On the source the tax reads 246.00: the misread was there, and the repair
            changed the total instead.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Field({ row, label, value, fix, note }: { row: number; label: string; value: string; fix?: string; note?: string }) {
  return (
    <div className="is-field" data-row={row}>
      <span className="is-label">{label}</span>
      <span className="is-value">
        {fix ? (
          <span className="is-val">
            <span className="is-orig">{value}</span>
            <span className="is-fix">
              <s>{value}</s> → {fix} <em>{note}</em>
            </span>
          </span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function Check({ i, text }: { i: number; text: string }) {
  return (
    <p className="is-check" data-check={i}>
      <span className="is-mark">
        <span className="is-x">✗</span>
        <span className="is-ok">✓</span>
      </span>
      {text}
    </p>
  );
}
