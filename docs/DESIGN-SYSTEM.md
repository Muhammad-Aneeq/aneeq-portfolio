# The design system

## Why this exists

The site had a colour and type token system from the start, and no layout system at all.
Colours, fonts and motion all came from named tokens; how wide a paragraph should be was
decided page by page. Measured across fourteen routes at 1440px:

| | Before |
|---|---|
| Distinct prose widths | **23** — 272, 424, 432, 448, 464, 472, 488, 528, 536, 568, 576, 608, 624, 640, 656, 672, 704, 736, 744, 768, 864, 1120, 1184 |
| Distinct `h2` sizes | **7** — 12, 17, 28, 38, 42, 44, 51 |
| Distinct container widths | **4** — 704, 1200, 1248, 1440 |

Twenty-three measures is not a system, it is twenty-three decisions taken independently and
never compared. Two of those `h2` sizes are 12px and 17px, which means a heading was being
used as a label. This file is the rule set that replaces those decisions, and
`tests/design-system.spec.ts` enforces it so the count cannot creep back up.

---

## 1. Width

### The container

Every page uses the same shell: `<Container>`, which is `--container-page` (78rem) with
`px-5 sm:px-8`. There is no second page width. `width="prose"` is gone — it made `/contact`
and `/ask` 704px wide while every neighbour was 1248px, which read as two different sites.

**A page is wide. Text inside it is narrow.** Those are separate decisions, and conflating
them is what produced the 23 measures: a page that wanted readable paragraphs shrank the
entire shell, taking its headings, media and grids down with it.

### Measures

Text gets its width from one of four tokens, never from an ad-hoc `max-w-*`:

| Token | Width | For |
|---|---|---|
| `max-w-tight` | 34rem | captions, asides, form help, figure notes |
| `max-w-read` | 44rem | body copy — the default for any paragraph |
| `max-w-wide` | 56rem | leads, intros, answer blocks, pull quotes |
| *(none)* | full | media, grids, tables, metric rows, code blocks |

`--container-read` is 44rem because that lands around 75 characters at the body size, which
is the readable range. Going wider does not make a page feel more generous, it makes lines
harder to track back. **The fix for a page that feels empty is never a longer line.** It is
the two-column rhythm below.

---

## 2. Type

Headings use the scale in `globals.css` and nothing else: `text-display`, `text-h1`,
`text-h2`, `text-h3`, `text-lead`. No heading carries a hand-set size.

A label that sits *above* a heading — "the problem", "domain", "lab" — is an **eyebrow**,
and it is a `<p>`:

```tsx
<p className="text-xs text-muted uppercase" data-readout>the problem</p>
```

It is not in the document outline because it is not a section, it is a tag on one.

### Headings that read as labels

Some sections are genuinely sections but should not shout: the `Summary` and `Experience`
markers on `/resume`, `published scores` on `/ask`. These stay `<h2>` — a screen reader
navigates by them and removing them from the outline to win a type-scale argument would be
a real accessibility loss — but they render at label size.

So an `h2` has exactly two permitted treatments, and the test enforces both:

| Treatment | Size | For |
|---|---|---|
| `text-h2` | the scale | a section a reader is meant to notice |
| `text-xs uppercase` + `data-readout` | 12px | a compact section marker in a dense document |

Anything else is drift. The audit's 17px, 38px, 44px and 51px `h2` sizes came from the home
page stylesheet hand-setting its own clamps instead of using the scale; those now read
`var(--text-h2)` and the four sizes collapsed into one.

---

## 3. Rhythm

| | Value |
|---|---|
| Page top and bottom padding | `py-20` (`py-16 sm:py-20` on detail pages) |
| Between major sections | `editorial-section` — a rule, 40px, then content |
| Between a heading and its body | `mt-5` |
| Between sibling paragraphs | `space-y-5` |

### The editorial section

This is the default layout for any text-heavy section, and the answer to "this page looks
empty":

```tsx
<section className="editorial-section">
  <h2 className="text-h2">What it does</h2>
  <div className="space-y-5 leading-relaxed text-muted">…</div>
</section>
```

A 1fr rail holds the heading, 2fr holds the body. The page uses its full width, the text
keeps its readable measure, and the left rail gives the eye somewhere to rest. `/about`,
`/teaching`, `/resume`, `/labs/[slug]` and `/work/[slug]` all use it, so they share a
vertical rhythm rather than each inventing one.

Its second child is the content, so a direct `<ul>` under the heading both lands in the
right column and stays a sibling for selectors like `#limits-title + ul`.

---

## 4. Page archetypes

Every route is one of four shapes. New pages pick one rather than starting over.

**Index** — `/work`, `/labs`, `/demos`
Eyebrow, `h1`, a `max-w-wide` answer block, then a grid or a list of entries separated by
rules.

**Detail** — `/work/[slug]`, `/labs/[slug]`
A browse row (`BackLink` plus "All demos" and the matching index), header, **the recording
at full container width**, then editorial sections. The recording sits above the figures and
the summary: those are claims about the system, the recording is the system.

**Editorial** — `/about`, `/teaching`, `/finance`, `/resume`
Eyebrow, `h1`, `max-w-wide` intro, then editorial sections throughout.

**Utility** — `/contact`, `/ask`
Same shell and header as the others; the form or panel sits in a raised surface rather than
bare on the page ground.

---

## 5. Surfaces and depth

Covered by the colour tokens, summarised here so it is in one place:

- A card is `Surface`. `interactive` adds lift, border brighten and shadow on hover.
- Raised things carry `--shadow-md`, floating things `--shadow-lg`, both with a
  `--edge` inset highlight along the top.
- Light inverts the dark relationship: the page ground is tinted and cards are white.
- `--pass`, `--gate` and `--halt` mean verified, awaiting a person, and stopped. They are
  never decoration, and always paired with a word or symbol.

---

## 6. What the test enforces

`tests/design-system.spec.ts` walks every public route at 1440px and asserts:

1. Any element that **sets its own** `max-width` uses `--container-tight`, `--container-read`
   or `--container-wide`. Scope matters here: a paragraph sized by the card or grid cell it
   sits in is the layout's decision, not a measure, and forcing a token onto it would be the
   wrong fix. Only self-constraining elements are in scope.
2. Every `h2` font size is the label size or comes from the type scale.
3. The container width is 1248px on every page.

Counting *every* paragraph's rendered width is a bad metric and the first version of this
did exactly that — it reported twenty-five widths on a conformant site, because a card
three columns wide legitimately produces a different paragraph width from a card two
columns wide. The number that matters is how many **decisions** exist, not how many
outcomes those decisions produce.

It fails on drift rather than on ugliness — it cannot tell you a page is badly designed, only
that it has stopped agreeing with the rest of the site. That is the part that rots silently.
