# Portfolio Spec — aneeqkhatri.com
**Owner:** Aneeq Khatri
**Date:** 2026-09-18
**Evidence base:** [`RESEARCH.md`](./RESEARCH.md) · **Review:** [`FEEDBACK.md`](./FEEDBACK.md)

**Changelog**
- *2026-09-18 · positioning pass: T-shape, `/finance` hub, nav reduced to six, domains config, title split.*
- *2026-09-18 · content pass: title broadened to AI Engineer, hero rewritten capability-first,
  proof bar replaced with legible numbers, Writing removed, capabilities rewritten in plain
  English, em dashes removed from all copy, footer social icons, GitHub handle corrected.*
- *2026-09-18 · **Hero v2 + motion system**: §4.1 rewritten to "The Governed Core" (refractive
  core, orbiting specialists, GPU particle flow); §4.4 added (WebGPU-first renderer, TSL
  shaders, verification gate); §4.3 rewritten as a four-tier ladder with the 3D chunk asserted
  absent on Tiers 0–1; §3.5 extended from uniform reveals to per-component choreography with
  GSAP scoped to three set-pieces and no smooth-scroll. Budgets unchanged. Two recorded
  decisions deliberately revisited and both documented in place: B4's vector-only poster (now
  split — Tier 0 SVG, Tier 1 raster) and B6's dropped Bricolage `wdth` axis (re-added only if
  fonts stay under 150 KB).*

---

## 0. Decisions locked

| Decision | Choice |
|---|---|
| **Positioning** | **T-shaped** (§1). Horizontal bar = AI engineering broadly; vertical stem = finance, as the proof. Educator is a visible pillar, never in the H1. |
| **Job title** | **"AI Engineer", not "Agentic AI Engineer".** Agentic work is most of what he does, but naming it in the title filters out every team hiring for RAG, LLM integration, evaluation or forward-deployed work. The speciality belongs in the body, where it reads as depth rather than as a limit. |
| **No em dashes** | Removed from every user-facing string. They read as a generated-text tell in 2026, and the copy loses nothing: a short trailing fragment becomes a comma, a full clause becomes its own sentence. Code comments keep theirs; nobody reads those but us. |
| **Writing** | **Cut.** Five posts, all about building this website rather than about AI engineering. A blog pointed at its own portfolio is not a senior signal. |
| **Capability-first rule** | Every title, header and one-liner is `<capability claim> — applied to <domain task>`. **One documented exception: `/finance`** (§5.6), where the domain leads. |
| Brand | **Personal** — "Aneeq Khatri". |
| **Nav ceiling** | **Six items, hard. Currently five:** Work · Finance · Teaching · About · Resume, plus the flag-gated `Ask` affordance. Writing was removed rather than kept for the sake of the slot. |
| **`/finance` hub** | **Yes** — the domain pillar gets a URL, because the leadership pillar has one (`/teaching`) and the asymmetry was making pillar three invisible. |
| **`/labs`** | **A tab inside `/work`** (`Case studies | Labs`), not a nav item. The route survives; the nav slot does not. |
| **`/demos`** | Route survives, off the nav. Linked from `/work` and the footer. |
| 3D scope | **Two signature moments** — hero, scroll-driven trace replay. 2D motion elsewhere. **Unchanged by the Hero v2 pass:** the hero is re-rendered, not multiplied. No third scene, no persistent canvas, no 3D navigation (FEEDBACK E3). |
| **Hero concept** | **"The Ledger"** (§4.1). One dark slab, etched with postings, that reveals its detail under the cursor and holds a read-head at the human gate. Supersedes both the wireframe graph and the "Governed Core" particle scene — both drew diagrams rather than objects. Run cycle and pass/gate/halt language unchanged. |
| **Renderer** | **WebGL 2 + GLSL. WebGPU measured and rejected** (§4.4). The WebGPU build is 186.1 KB gz tree-shaken, and 215.9 KB with the drei surface §4.1 needs, against a 250 KB chunk budget — leaving 34 KB for R3F, the store, the scene and post. Revisit only if the renderer drops under ~120 KB gz. **Superseded the original "WebGPU-first with a verification gate" decision, which was written before it was measured.** |
| **Tier ladder** | **Four tiers, not one mobile rule** (§4.3). Chosen at mount from device memory, cores, viewport, WebGPU/WebGL availability and a 2s FPS probe. `PerformanceMonitor` may step **down** only. The 3D chunk is **never requested** on Tiers 0–1, asserted in Playwright. |
| **GSAP** | **Scoped to exactly three set-pieces** — hero headline, scrubbed proof-bar counters, `/work` trace-replay pin — and code-split into those routes. If SplitText + core breaks the home budget, the headline falls back to a CSS `clip-path` reveal and GSAP leaves the home route. |
| **No smooth-scroll** | **No Lenis or equivalent.** It fights native scroll, breaks the `view()` timelines that make reveals cost 0 KB, and hurts accessibility on a site whose brand is trust. |
| Live agent | **Yes, in scope** — "Ask this portfolio" with visible citations, refusal path, published eval score. |
| **`/ask` flag rule** | **Live or absent — never "coming soon."** With no provider key the route 404s and every reference to it is absent from the build. |
| **Project fields** | `title` (≤ 8 words, capability only) · `outcome` (ends `— applied to …`) · `whyFlagship` (paragraph). Enforced by the schema, not by discipline. |
| **No placeholders** | Applied uniformly to **projects** (no padded eighth), **domains** (no greyed third cell), and **lab cells** (no cell without a real capture). |
| Project depth | **5 full case studies + 7 lab entries.** |

---

## 1. Positioning

**Primary audience:** hiring managers and founders at **agentic-AI and applied-AI teams of any
domain**, hiring remote. Finance and fintech teams are the deepest-fit subset of that audience,
not the boundary of it. Secondary: recruiters, and finance leaders looking for consulting.

**The claim the whole site defends:**
> I build production AI systems: agents, RAG, and the evals that keep them honest. My deepest
> specialisation is finance and accounting, where the cost of being wrong is highest.

### The shape: T-shaped, stated deliberately

- **The horizontal bar, the identity.** **AI Engineer**, broadly: multi-agent systems, retrieval,
  evaluation harnesses, observability, guardrails, MCP, LLM integration. Deliberately not
  "Agentic AI Engineer": agentic work is most of it, but the narrower title filters out every
  team hiring for RAG, evaluation or forward-deployed work.
- **The vertical stem — the proof.** Finance and accounting, where that standard has been proven
  under the hardest conditions available. **Finance is the argument *for* the engineering, not a
  fence around it.**
- **Educator — a visible pillar, never the headline.** Systems leadership at national scale.
  It appears as a pillar and a route; it does not appear in the H1.

Three pillars, in this order, because this is the order that differentiates:

1. **Reliability as the engineering standard** — evals, guardrails, human gates, observability.
   This is the senior signal the research says separates hireable from hobbyist, and it is
   domain-independent: every one of these systems would be the same engineering in claims
   adjudication or procurement.
2. **Scale of influence / systems leadership** — Head of Faculty at GIAIC, ~100 instructors,
   thousands trained. Evidence of setting a standard others build to, not just meeting one.
3. **Domain depth in finance** — ex-accountant who reconciled real books. Near-unique, and
   presented as **the deepest domain rather than the only one**: it is where the reliability
   standard was forged because finance punishes unreliability fastest, which is precisely what
   makes the resulting engineering portable.

### Positioning rule

**Capability-first, domain-second, in every title, header and one-liner.** The pattern is
`<capability claim>, applied to <domain task>`. A reader must be able to stop at the comma and
still know what was engineered. *(The separator was an em dash until the content pass removed
em dashes site-wide; the rule is unchanged, only the punctuation.)*

**The two-audience test.** Every line of copy must pass both, or it gets rewritten:

| Audience | Must think |
|---|---|
| Hiring manager, **non-finance** agentic-AI team | "This is for me — this person builds reliable agent systems." |
| Hiring manager, **fintech** | "He's one of us — he has actually closed a month." |

Failing either is a defect. Leading with "AI engineer for accounting" fails the first;
stripping finance out entirely fails the second and throws away the only genuinely rare thing
on the site.

**Messaging rule (from research):** lead with the outcome and the system, never the framework
name. "Five governed agents close a month with zero duplicate postings" beats "built with
LangGraph." Framework names appear in the stack strip, not the headline. *This is unchanged by
the positioning pass — "capability" means the engineering claim, never the library.*

---

## 2. Information architecture

```
/                     Home
/finance              Domain hub, "AI for Finance & Accounting"
/work                 The 5 flagship case studies (index) — tabbed: Case studies | Labs
/work/[slug]          Full case study  × 5
/labs                 Bento grid, reached as the Labs tab of /work rather than from nav.
                      Only projects with a real capture. The rest are named in a list
                      below the grid rather than shown as empty cells or deleted outright.
/labs/[slug]          Light project page (problem, stack, links, screenshots)
/about                Story: accounts → software → agents
/teaching             GIAIC / PIAIC / SMIT — scale, curriculum, impact
/demos                Video reel — all walkthroughs in one place
/resume               HTML resume + PDF download
/contact              Server Action form + direct links
/ask                  "Ask this portfolio" full page (also a global ⌘K panel)

/llms.txt  /robots.txt  /sitemap.xml  /opengraph-image (dynamic)
```

**Nav — six items, and six is a ceiling:**

> **Work · Finance · Teaching · About · Resume**, plus the flag-gated `Ask`
> affordance (⌘K / floating pill).

**The six-item rule.** A seventh item does not get added; something gets removed instead.
Seven was already too many, and it was spending slots on `/labs` and `/demos` — a
sub-collection and a video reel — while the domain pillar had no URL at all. The nav is the
site's clearest statement of what matters, and it was voting for a video page over the
argument the whole site makes.

What moved, and why:
- **`/labs` → a tab inside `/work`.** Labs are the same kind of object as case studies, at
  less depth. `Case studies | Labs` says that; two sibling nav items said they were separate
  concerns. The route and every deep link survive.
- **`/demos` → off the nav.** A video reel is a supporting asset, not a destination. Reached
  from `/work` and the footer.
- **`/finance` → added.** See §5.6.

Nav is conventional and always visible. No gamified navigation; the research is explicit that
navigation must stay effortless.

### Flagship five (full case studies)

Three fields, because one string was doing three jobs badly. A title that had to be scannable,
carry the domain, *and* justify flagship status ended up doing none of them well.

- **`title`** — **≤ 8 words, capability only, no domain word.** This is what a reader scanning
  `/work` sees. A list of these alone must read as a list of engineering capabilities.
- **`outcome`** — one line, ends `— applied to <domain task>`. The proof, directly beneath.
- **`whyFlagship`** — a paragraph. Why this one earns a full case study.

| Slug | `title` (≤ 8 words) | `outcome` | `whyFlagship` |
|---|---|---|---|
| `closeops` | **Provably duplicate-free multi-agent orchestration** | Five governed agents with a provable no-duplicate guarantee — applied to month-end close | Multi-agent orchestration with a hard, provable correctness guarantee. An orchestrator that cannot self-approve, and a forced retry storm that still yields zero duplicates. The guarantee is the transferable artefact; the close is where it was proven. |
| `ledgerguard` | **Auditability as architecture, not logging** | An agent that can prove what it did, under seven governance checks — applied to bank reconciliation | Auditability designed in rather than logged after. A cloud-hosted agent on an enterprise stack, plus a one-number config change that demonstrates why two approval floors exist instead of one. |
| `ledgerlens` | **Making agent uncertainty triageable** | An exception workbench where an uncited hypothesis is deleted in code — applied to the breaks AI matching cannot close | The honest answer to what humans do with the 8–15% a model cannot close. Every high-volume classifier leaves a residue, and the workbench for it is usually the real product. Best UI and richest video assets. |
| `finagent-evals` | **An open benchmark for agent reliability** | A vendor-neutral benchmark for reliability under repetition — applied to finance reconciliation tasks | Owning a benchmark is the rarest senior signal on the site. The pass@1 versus pass^k gap is a finding about agents, not about ledgers; the suite happens to be built from reconciliation cases. |
| `ledgerlab` | **A messy world for agents, as MCP fixture** | An open MCP server that hands any agent a realistically messy world — applied to bank and ledger reconciliation | MCP, open source and test rigour together: 7 tools, FastMCP 3, 399 tests, £0 to run. The messy-world-as-fixture idea is domain-neutral; the world it ships happens to be a bank. |

*(`finagent-evals` is 6 words, `ledgerlab` 7 — both inside the cap. The original proposal for
`finagent-evals` ran to 8 with "under repetition"; the qualifier moved to `outcome`, where it
belongs, rather than spending a third of the title on it.)*

**Schema lint — enforced, not trusted.** `title` fails the build if it exceeds **8 words**, or
if it contains any of `ledger · bank · reconciliation · invoice · close · accounting · finance`.
A capability-first rule that lives only in a style guide reverts the first time someone is in a
hurry; this one fails CI. The word list is deliberately blunt — a false positive costs one
rewrite, and a false negative costs the positioning.

### Project schema — `domain`

Every project (flagship and lab) carries a required `domain` field:

```ts
domain: "finance" | "education" | "devtools" | "other"
```

It drives the **Domain filter** on `/labs`, and it feeds the domains config below.

### Domains config — `src/content/domains.ts`

Row 5.5 previously claimed to be "driven by the `domain` field, never hand-written." That was
not true and could not be: **no project has `domain: "education"`**, because teaching is not a
project. The cell was being fabricated by the component while the spec asserted it was derived —
the worst of both, since it looked principled and was not.

A typed config makes the honest thing explicit instead:

```ts
type DomainEntry = {
  id: Domain;
  label: string;
  evidenceHref: string;      // the cell is a link; a pillar without a URL is a claim
  projectCount: number;      // COMPUTED from projects — never written by hand
  stats: string[];           // hand-stated, and allowed to be, where no project backs them
};
```

| id | `evidenceHref` | `projectCount` | `stats` |
|---|---|---|---|
| `finance` | `/finance` | computed | 1 open benchmark · 1 open MCP fixture · All data synthetic |
| `education` | `/teaching` | 0 — no project backs it, and that is correct | ~100 instructors led · thousands trained |
| *(third)* | `/labs` | computed | **Added only when a project with a non-finance `domain` exists.** |

*(The brief for this config said "13 governed systems" as a finance stat. The derived count
is **12** — ReportSmith has a plan and a progress log but no code, and "no placeholder
projects" means it is not counted until it runs. The count therefore moved out of `stats`
and into `projectCount`, where it is computed rather than typed. `/about` hard-coded 13 and
was corrected for the same reason: two numbers for the same fact is how a site starts
contradicting itself.)*

The split is the point: `projectCount` is computed so it can never overstate the work, and
`stats` is hand-stated so a pillar with real evidence but no repository is not silently
dropped. Each cell links to `evidenceHref` — a pillar the reader cannot click into is an
assertion, which is what made the domain pillar weakest of the three.

See PLAN "Still open" for the candidate first non-finance flagship.

### Labs eight (bento cards + light pages)

`trace2evals` · `policyground` · `finxpia` · `invoiceops` · `finsight` · `spendsort` ·
`statementlens` · `reportsmith`

`reportsmith` ships only if it reaches a demonstrable state; otherwise the grid is seven.
**No placeholder projects.** An honest seven beats a padded eight — and the research is
explicit that breadth-over-depth is a top-five portfolio mistake.

---

## 3. Design system

### 3.1 Concept — "Instrument panel"

The visual language of the systems Aneeq builds: traces, graphs, gates, confidence pills, eval
readouts. Dark, precise, cinematic, editorially restrained. **Every ornament is a readout of
something real.** If a visual element doesn't encode information, it doesn't ship.

Governing principle, per 2026 research: *restraint, not emptiness. Intention over absence.*

### 3.2 Colour — the palette IS the state machine

The accent triad is lifted directly from his products' governance states. This is the brand
idea: the site is coloured by pass / gate / halt.

```css
/* Tailwind v4 @theme — OKLCH, CSS variables */
--color-bg:        oklch(0.145 0.018 255);  /* midnight — never pure black (Envato) */
--color-surface:   oklch(0.190 0.020 255);
--color-surface-2: oklch(0.235 0.022 255);
--color-border:    oklch(0.300 0.018 255);
--color-text:      oklch(0.965 0.004 255);
--color-muted:     oklch(0.700 0.014 255);

--color-pass:      oklch(0.800 0.150 172);  /* signal teal   — verified, committed, green-path */
--color-gate:      oklch(0.820 0.145  78);  /* signal amber  — human gate, needs approval */
--color-halt:      oklch(0.660 0.195  25);  /* signal red    — anomaly, refusal, halted */
```

`pass` is the primary accent — links, focus rings, key CTAs. `gate` and `halt` are used only
where they mean what they mean. Light mode is a supported inversion (`next-themes`), not the
default.

### 3.3 Typography (variable fonts — 2026 trend, used functionally)

| Role | Face | Notes |
|---|---|---|
| Display | **Bricolage Grotesque Variable** | Optical-size + width axes actually animated on the hero. Distinctive, editorial, free. |
| Body | **Inter Variable** | Neutral, superb at small sizes. |
| Mono | **JetBrains Mono Variable** | All instrument readouts, metrics, code, trace labels. |

Self-hosted via `next/font/local`, `display: swap`, preloaded (a top-4 LCP fix per research).
Fluid type scale with `clamp()`. Mono is a *semantic* choice — anything that is a measured
value is set in mono.

### 3.4 Texture & surface

- **Grain:** SVG `feTurbulence` noise overlay, ~3% opacity, `pointer-events: none`, fixed.
  Cheap, and delivers the "tactile texture" trend without an image request.
- **Glassmorphism:** restricted to HUD-style overlays (⌘K panel, video controls, sticky
  architecture legend). Never on content surfaces.
- **Bento grid:** `/labs` only — the research finding is that bento wins when visitors explore
  *in parallel* rather than following a sequence, which is exactly the 8-project case.
  **`/finance` uses the `/work` case-card list, not bento** (§5.6d), and reuses that component
  rather than introducing a second one. Bento invites parallel browsing; the finance hub is
  making a sequential argument, and the same cards in the same order are what make it read as
  a deeper cut of `/work` rather than a separate site.
- **Borders over shadows.** 1px hairlines in `--color-border` define surfaces; elevation is
  used sparingly on hover (`translateY(-4px)`, 300–400ms).

### 3.5 Motion

> **Superseded by AS BUILT (PLAN.md).** Motion server-rendered `style="opacity:0"`
> onto 18 home-page elements, so the content depended on a bundle loading. Scroll
> reveals are now CSS transitions driven by an `IntersectionObserver`, with the
> hidden state scoped to `html.js` (set by an inline script before first paint).
> The stagger cadence is an `nth-child` CSS cascade. Motion remains only inside the
> lazily-loaded scroll-replay canvas; it is absent from the home route entirely,
> which is 30 KB gz of the bundle budget. Enforced by `tests/no-js.spec.ts`.
>
> **Revised again (scroll-linked reveals).** The reveal is now driven by scroll
> *position* rather than a timer, wherever the browser supports it: a
> `@supports (animation-timeline: view())` block runs the same keyframes on a
> `view()` timeline, so a section rises as the reader brings it up the viewport
> and reverses if they scroll back. Travel went 12px → 24px with a 0.98 → 1
> scale. The transition-based path above is untouched and remains the fallback
> for Safari and Firefox; `html.js` gates both identically, so the no-JS
> guarantee is unchanged. Cost: 0 KB — the timeline is evaluated by the
> compositor, and no JavaScript runs on the animation path at all.
>
> This changed what the axe sweep measures, and for the better. A scroll-linked
> element sits at *partial* opacity part-way up the viewport, and axe computes
> contrast against the blended colour — it correctly reported 1.36:1 on a tag
> that is 4.5:1 at rest. The fix was to settle reveals before auditing
> (`tests/settle.ts`), which also made the audit stricter: under the old
> observer-driven reveal everything below the fold sat at opacity 0, and axe
> skips fully transparent nodes, so those elements had never been
> contrast-checked at all.

> **Extended again — choreography (this pass).** The foundation above is correct and
> stays. What it is not is *composed*: every element on the site fades and rises 24px,
> which is technically right and completely anonymous. A reader cannot tell the proof
> bar from a paragraph by how it arrives. The revision below keeps every guarantee —
> CSS-first, `html.js` gating, no-JS, reduced-motion, settle-before-audit — and spends
> motion **per component**, so that what moves says something about what it is.

#### Libraries, and what each is allowed to do

| Library | Scope | Cost |
|---|---|---|
| **CSS scroll-driven animations** | The default for all reveals. Unchanged. | **0 KB** |
| **GSAP** (free tier, incl. SplitText) | **Exactly three set-pieces**: the hero headline reveal, the scrubbed proof-bar counters, the `/work` trace-replay scroll pin. Code-split into those routes only. | measured, see below |
| **Motion v12** | Inside the lazily-loaded canvases only. Unchanged. | lazy |

- **GSAP is asserted absent from the home bundle's initial chunk.** The conditional this
  section used to carry — *measure, and if SplitText + core exceeds the remaining home budget,
  fall back to CSS* — **has been measured and resolved. GSAP leaves the home route.**

  > **Measured:** `gsap` core + `ScrollTrigger` + `SplitText`, bundled and minified,
  > **46.0 KB gz**. Home route sits at **195.3 KB** against a **200 KB** budget — **4.7 KB of
  > headroom**, so GSAP wanted very nearly ten times what was available. Not a close call, and
  > not a matter of taste.
  >
  > **Therefore, on the home route:** the hero headline ships as a **CSS `clip-path` word
  > reveal**, and the **scrubbed proof-bar counters use Motion's `scroll()` or a rAF tween
  > rather than `ScrollTrigger`** — the counters are on the home route too, which the original
  > wording did not account for. GSAP remains available for the **`/work` trace-replay scroll
  > pin**, which is not under the 200 KB gate.
  >
  > This is the second time this trade has been made: PLAN's AS BUILT records removing Motion
  > from the home route for 30 KB. The pattern is worth naming — **the home route has no room
  > for an animation library, and probably never will**, because its budget is ~153 KB of
  > framework floor plus ~47 KB for an entire site.
- **No Lenis, no smooth-scroll library.** It fights native scroll, breaks `view()` timelines —
  which are the entire 0 KB reveal system above — and hurts accessibility. On a site whose
  brand is trust, hijacking the scrollbar is the wrong first impression.

#### Vocabulary — standardised as CSS custom properties and GSAP defaults

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);   /* entrances */
--ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);  /* state changes */
```

| Property | Value |
|---|---|
| Hero durations | 600–1100 ms |
| Everything else | 300–450 ms |
| Stagger | 40–60 ms |
| Animatable properties | **`transform` + `opacity` only.** `clip-path` permitted for masks. |

#### Per component

| Component | Motion |
|---|---|
| **Hero headline** | SplitText by word; each word **rises from behind a clipped mask** — not a fade. `--ease-out-expo`, 1.1 s, 40 ms stagger. Then the word **"prove"** animates Bricolage's **width axis** condensed → normal over 600 ms, so the variable font is used *functionally* rather than decoratively. Sub-headline and disclosure follow at **+300 ms** with a plain rise. |
| **Nav** | 300 ms fade in after the headline settles. Theme-toggle icon morphs in 150 ms. |
| **Proof bar** | Counters are **scrubbed to scroll** and complete as the bar crosses viewport centre. Digits roll **slot-machine style in mono**. A 2px `pass`-teal underline draws in on completion. |
| **Featured cards** | **Cursor-following border glow** — radial gradient at pointer position, `--color-pass` at ~25%, 160px radius, tracked with a **rAF-throttled `pointermove`**. −4px lift. Micro-loop plays on hover. **No tilt.** |
| **Capability map** | Diagonal cascade reveal (`nth-child` delays, 40 ms). Hover reveals the tools with a 200 ms `clip-path` wipe. |
| **Domain depth** + **Systems leadership** | Identical reveal, **mirrored direction** — left band enters from the left, right band from the right — so the two pillars read as parallel. This is §5.1 Row 5.5's "parity is the actual design requirement" expressed in motion. |
| **Buttons** | **Magnetic pull ≤ 6px** toward the cursor inside a 40px radius, spring return. **`@media (hover: hover)` only.** |
| **Page transitions** | 200 ms cross-fade via the **View Transitions API** where supported. Nothing else. |

#### Reduced motion

**Every item above degrades to its instant static state.** Magnetic buttons and glow borders
are **disabled**, not slowed. **SplitText is not loaded at all** — a reduced-motion reader
should not pay bytes for an effect they will never see.

- Hover: lift −4px, border brightens to `pass` at 30%.
- Page transitions: 200ms cross-fade only. No shader wipes — they add INP for nothing.
- **`prefers-reduced-motion` kills every non-essential animation**, and switches both 3D
  scenes to their Tier 0 fallback (§4.3). Non-negotiable; enforced in CI via axe + a
  Playwright run with the media feature emulated.

> **Dependency this creates on §3.3 — flagged, not silently actioned.** The headline
> requires Bricolage's **`wdth` axis**, and review item B6 **deliberately removed** it: three
> preloaded variable fonts came to 215 KB, Bricolage was requesting `opsz` and `wdth` "on the
> stated grounds that the hero animates them — it does not", and dropping both took fonts
> **215 → 118 KB**. That finding was correct at the time. This spec now makes the hero
> actually animate `wdth`, which reverses the premise — but **only for `wdth`; `opsz` stays
> dropped.** Re-adding the axis must keep fonts **under the 150 KB budget**, measured, and if
> it does not, the width animation is cut before the budget is. §3.3's table is otherwise
> untouched.

---

## 4. The two 3D moments

Both are **procedural geometry and shaders only — zero model files.** The research names asset
weight as the dominant 3D failure mode (a 50MB glTF destroys load time regardless of render
code). Building from instanced primitives and shaders sidesteps the entire class of problem
and keeps the 3D chunk in the low hundreds of KB.

Stack: `@react-three/fiber` + `@react-three/drei` + `three`. State in **Zustand, not Context** —
Context cascades re-renders through the whole scene subtree.

### 4.1 Hero — "The Ledger"

> **Supersedes both the wireframe agent graph and "The Governed Core".** Two concepts were
> built and rejected before this one, and the reason was the same each time: they drew a
> *diagram* of the system — seven labelled nodes, edges, packets — and a diagram is legible
> without being cinematic. Every 2026 hero worth copying does **one object, extremely well**
> (Hubtown, Oryzo, Shopify Editions). This is that.
>
> Removed outright: the node graph, the orbiting specialists, the GPU particle flow, the
> tube edges, the contact shadows, the caption line.

**The object.** A single dark slab, centre-right, filling most of its column, standing on
its own reflection. Etched with nineteen ledger rows. At rest it is a silhouette with a
teal edge — visibly an object, deliberately not yet readable.

**The interaction, which is the whole idea.** The cursor is a light. Wherever it passes,
the slab's etched detail resolves out of the dark; where it has not been, the rows stay
latent. **The scene does not show you everything at once. It shows you what you inspect.**
That is not an effect chosen for looking expensive — it is the argument the entire site
makes, rendered: a record you can audit, that answers when questioned.

- Screen-space spotlight, aspect-corrected, damped so the light trails the pointer.
- Radius ≈ 0.62 in NDC — roughly a third of the viewport.
- Fades out over ~220ms when the pointer leaves, in **real seconds** rather than frames,
  so it behaves identically at 2fps and 120fps.

**The run cycle (~14s), unchanged in meaning.** A read-head descends the slab:

> idle → **scan** → **tool call** → **GATE**: the head stops dead on the amber row and
> throbs, for the longest phase in the cycle → **approve** releases it → **COMMIT**: the
> teal row flares → settle.

Every third cycle the **halt** row runs red. The head does not move through the gate phase,
and that stillness is the point — a system that pauses for a person is the claim, and the
viewer should feel the pause before reading a word about it.

The head is also the reason the scene works for a reader who never touches the mouse: it is
visible without the cursor, so the hero is never inert.

**Marked rows carry the governance triad and nothing else does** (§3.2): amber gate, teal
commit, red halt, and one muted tool-call row. Every other row is a plain posting. The rule
from §3.1 holds — nothing here is decoration that happens to look expensive.

**Cost.** One box, one fragment shader, one mirrored copy. No particles, no post-processing,
no environment map, no instancing, **6 draw calls**. The lazy 3D payload fell from 249.2 KB
to **233.7 KB** — it is now three.js and almost nothing else.

> **Implementation note worth keeping.** The materials are constructed imperatively
> (`new THREE.ShaderMaterial`) and attached with `material={…}`, never declared as
> `<shaderMaterial uniforms={…}>`. That JSX form takes a **copy** of the uniforms at
> construction, so every per-frame write lands on an orphaned object: the slab renders its
> static detail perfectly and ignores the cursor entirely. It cost an hour to find, because
> the shader was correct the whole time and only the plumbing was wrong.

### 4.2 Case study — scroll-driven trace replay

R3F orthographic scene pinned in a case study's architecture section. Scroll progress
(`useScroll`) dollies a camera along a horizontal trace timeline:

```
plan → tool call → tool call → policy check → confidence route → human gate → commit → audit
```

Each station lights as it enters frame and pins an explanatory caption beside it. This is a
scrollytelling architecture diagram — it satisfies the trend (60% of users are more likely to
reach the end of a page with scroll-triggered animation) while delivering the artefact
recruiters rank third-most-important.

Falls back to a static labelled SVG diagram under reduced-motion, on mobile, and if WebGL is
unavailable.

### 4.3 3D performance contract

Non-negotiable rules, derived from the Core Web Vitals research (INP is the most-failed vital
in 2026 at 43%, and heavy main-thread JS is the cause):

1. **The hero's LCP element is server-rendered text.** The canvas is `next/dynamic`,
   `ssr: false`, and mounts *after* first paint. It never competes for LCP.
2. `<PerformanceMonitor>` from drei — auto-downgrades DPR when FPS drops below 45.
3. `dpr={[1, 1.75]}` desktop, `[1, 1.25]` mobile.
4. `IntersectionObserver` pauses `frameloop` the moment the canvas leaves the viewport.
5. `<Preload all />` before reveal; a poster image holds the space to keep CLS at 0.
6. **The tier ladder (below) replaces the old single mobile rule.**
7. `prefers-reduced-motion`: **the labelled SVG diagram / text timeline, not a frozen
   frame.** *Superseded by AS BUILT.* Same static outcome, but a screen reader can
   read it, it is crisp at any DPR, and no WebGL context is created at all. The SVG
   is composed at the gate-pulse instant of the run cycle rather than showing a
   neutral idle state, because on a phone it *is* the signature moment (review B4).
   Asserted by `tests/reduced-motion.spec.ts`, which checks no canvas exists.
   **This is Tier 0 below, and it is unchanged.**
8. Instanced meshes throughout; target **< 25 draw calls** per scene.
9. **The budget wins, not the effect.** When a gate in §8 and an element of §4.1 disagree,
   the element is cut. Documented degradation order: particles → contact shadows →
   transmission material → bloom.

#### The tier ladder

Chosen once at mount from `deviceMemory`, `hardwareConcurrency`, viewport width,
WebGPU/WebGL availability, and a **2-second FPS probe**. One decision, logged, testable.

| Tier | Selected when | Scene |
|---|---|---|
| **3** | Desktop · WebGPU or WebGL 2 · `dpr ≤ 1.75` | Transmission core · **60k** particles · selective bloom · contact shadows |
| **2** | Laptop or high-end mobile ≥ 640px · `dpr ≤ 1.25` | Fresnel/thin-film core · **25k** particles · **no bloom** · contact shadows at half resolution |
| **1** | `< 640px` **or** `deviceMemory < 4` **or** FPS probe `< 40` | **No canvas.** Static poster, composed at the gate-pulse instant. AVIF + WebP, **≤ 60 KB**, 2× for the breakpoint |
| **0** | `prefers-reduced-motion` · no WebGL · no JS | The labelled SVG diagram / text timeline. Screen-reader readable. **No WebGL context is created** |

- **`PerformanceMonitor` may step DOWN a tier at runtime, never up.** A scene that oscillates
  between tiers is worse than one that is permanently conservative, and upward transitions are
  where that oscillation comes from.
- **The tier is logged to the console in development** so it can be asserted in tests rather
  than inferred from a screenshot.
- **The 3D chunk must never be requested on Tier 0 or Tier 1.** This is the failure the
  Lighthouse gate already caught once (PLAN REVIEW PASS: three.js was downloading on phones
  because the capability check lived *inside* the lazy import, costing 407 KB of script
  transfer and 3.6 s of LCP). It is now an explicit assertion: **Playwright checks the network
  log under a 375px viewport and under reduced-motion and fails if the chunk is requested.**
  The bundle gate cannot catch this — the chunk is correctly absent from the *initial* payload,
  which is all that gate measures.

> **Tier 1 reverses part of review item B4, deliberately.** B4 asked for an AVIF raster poster
> and the review pass rejected it: the vector SVG is ~2 KB, needs no request, decodes
> instantly, is crisp at every DPR and is readable by a screen reader. That reasoning was
> right for a scene made of seven flat wireframes — an SVG can represent that faithfully.
> It is not right for a refractive core with contact shadows and 60k bloomed particles, where
> a 2 KB vector would be a different picture rather than a smaller one. So the fallback
> **splits**: Tier 0 (accessibility and no-JS) keeps the labelled SVG exactly as B4's revision
> left it, and Tier 1 (capable device, small screen) gets the raster poster B4 originally
> asked for. The accessible path never regresses to a picture with no text.

#### Budgets — unchanged, and still asserted

Asserted by `npm run check:bundle` and Lighthouse CI. **These numbers do not move for this
work.**

| Metric | Target |
|---|---|
| 3D chunk (lazy) | < 250 KB gz |
| Home JS (excl. 3D) | < 200 KB gz |
| Fonts (preloaded) | < 150 KB |
| LCP | < 2.0 s |
| INP | < 150 ms |
| CLS | < 0.05 |
| Lighthouse mobile perf | ≥ 90 |
| Lighthouse a11y | 100 |
| **3D chunk never requested on Tier 0/1** | **asserted in Playwright** |

### 4.4 Renderer — WebGL 2 and GLSL. WebGPU measured and rejected.

**Shipped: three's classic `WebGLRenderer`, custom shaders in GLSL, particle simulation on
FBO ping-pong (drei `useFBO`).** No WebGPU, no TSL.

This section previously specified WebGPU-first with TSL shaders, behind a verification gate on
the real device matrix. **The gate never got to run: the bundle measurement closed the
question first.** Numbers, from real builds, minified and gzipped, each isolated in its own
chunk:

| | gz |
|---|---|
| `three/webgpu` + `three/tsl` — bare renderer, one node material, one trivial TSL function | **186.1 KB** |
| drei surface §4.1 requires — transmission, `Environment`, `Lightformer`, `ContactShadows`, `useFBO` | **29.8 KB** |
| **Subtotal, before R3F, zustand, the scene or post-processing** | **215.9 KB** |
| **3D chunk budget (§8, unchanged)** | **250 KB** |

That leaves **34 KB** for React Three Fiber, the state store, the entire scene and the
post-processing chain. It is not close. For reference, `three.webgpu.js` is **436.0 KB gz**
against `three.module.js` at **128.3 KB**; tree-shaking cuts the WebGPU build to 186.1, which
helps enormously and is still nowhere near enough.

> **And the original escape hatch was not a reachable state.** This section used to say: if
> the gate fails, "ship WebGL 2 only for this release and *keep the TSL shaders* — the
> migration is then a config switch later." That is wrong, and worth recording as wrong. TSL
> node materials only execute through `WebGPURenderer` (which carries its own WebGL 2
> backend); the classic `WebGLRenderer` cannot consume them. Keeping TSL means keeping the
> 186 KB build. **It is TSL or the budget, never both** — so there was no partial adoption to
> retreat to, and the honest outcome is GLSL.

**Nothing in §4.1's visual concept is lost.** Refractive transmission, selective bloom,
contact shadows, procedural `<Lightformer>` environments and 20k–60k FBO-simulated particles
are all WebGL 2 capabilities and predate WebGPU by years. What is lost is writing the shaders
once instead of once — a maintenance convenience, not a pixel.

**Revisit condition, stated so this is a decision and not a dead end.** Re-measure when
three's WebGPU build ships a genuinely tree-shakeable node system. The threshold is
arithmetic: the renderer must come in **under ~120 KB gz** for the rest of §4.1 to fit. Until
then this stays closed, and §10 carries the figure so nobody re-litigates it from memory.

**Write it up.** The case study for this site should carry **this** decision, not the one
originally planned: a candidate technology adopted in a spec, measured before implementation,
and dropped on evidence with the number recorded. That is a better §5.2 step 5 artefact than
"we used WebGPU" would have been — and it is the kind of thing the site's whole argument
claims to be about. Measuring before building is the point.

> **Consequence for the bundle gate.** `scripts/check-bundle.ts` identifies the 3D chunk by
> the literal string `WebGLRenderer`. With `three/webgpu` on the dependency graph that matched
> **five chunks instead of one**, because the WebGPU build contains a WebGL backend. It is
> correct again now that WebGPU is out, but if this decision is ever revisited, **the gate's
> detection has to change first** — otherwise the first thing the new renderer breaks is the
> thing that measures it.

---

## 5. Page specs

### 5.1 Home

| # | Section | Content |
|---|---|---|
| 1 | **Hero** | SSR headline — *"I build multi-agent systems you can prove are right."* **The H1 is the system claim and nothing else: no domain, no job title, no institution.** Sub-headline carries the proof and the domain: *"I proved it in finance first — where a wrong number is money lost and a broken audit."* Then role, location, remote-worldwide availability. **The ex-accountant line moves out of the hero** into the sub-headline's shadow or Row 3, because a hiring manager at a non-finance agent team must reach the end of the H1 still thinking this is for them. Keep the synthetic-data disclosure line above the fold (FEEDBACK B3). ~~WebGL agent graph mounts beside it.~~ **The hero scene is now "The Governed Core" (§4.1), and the headline sits *in front of* it rather than beside it — that change of preposition is the whole point of the §4.1 rewrite.**<br><br>**Speciality readout (added 2026-09-18).** Directly beneath the sub-headline: *"deepest in finance & accounting — N governed systems"* followed by the four named specialities — **month-end close · bank reconciliation · invoice approval · exception triage**. `N` is **derived from the content**, never typed, so it cannot drift from the work that exists. This does not weaken the capability-first rule: the H1 stays domain-free, and §1 already puts the domain on the line beneath it. What it fixes is that the hero named the domain *in passing* ("I proved it in finance first") without ever saying what the speciality actually consists of — a finance reader could read the whole fold and not learn that month-end close was in scope.<br><br>**CTAs: `View the work` · `AI for finance` · `Ask this portfolio`** (the last flag-gated). The finance CTA is a **second button, not a third-tier text link**: a reader who came for the domain should reach `/finance` in one click from the fold rather than scrolling to Domain depth to discover it exists. |
| 2 | **Proof bar** | Four animated mono counters, **each linking to a page where the number can be seen**: **`37.8 pt` — "reliability drop, pass@1 → pass^4"** → `/work/finagent-evals` · `0` duplicate postings under 36 forced retries → `/work/closeops` · `80%+` tool-selection accuracy → `/resume`, carrying an inline attribution that it is client work from internal evaluation and not independently verifiable · `~100` instructors led → `/teaching`. *Revised: the first two were previously unlinkable Voya figures. An unverifiable metric in the hero of a site arguing for provable systems undercuts the argument.*<br><br>**Counter 1 reframed (2026-09-18).** `−37.8%` read as a percentage of something and needed its label to mean anything; a counter that cannot be read without its caption is decoration. It is a drop of **37.8 percentage points** (pass@1 45.8% → pass^4 8.0% on the flaky configuration), so `37.8 pt` is both shorter and literally correct, and "reliability drop" tells you the direction without the caption. **The proposed alternative — `62%` pass^4 — was rejected because FinAgent-Evals does not produce that number:** measured pass^4 is 8.0% (flaky) and 94.0% (stable). Publishing an invented 62% on the one counter that links to the benchmark proving agents are unreliable would be self-refuting. |
| 3 | **The angle** | **Rewritten to the T-shape arc: engineering standard → proven in finance → applied wherever agents must be trusted.** Three movements. (1) The standard: agents are only useful if you can show they are right, which means evals, gates and an audit trail — that is the engineering. (2) The proof: finance is where that standard gets tested hardest, and the ex-accountant background belongs *here*, as the reason the proof is credible rather than as the identity. **The ex-accountant sentence ends with a link to `/finance`** — a reader who wants that thread pulled should not have to look for where it continues. (3) The transfer: the same machinery is what any domain needs the moment an agent's output reaches a decision that matters — claims, procurement, clinical ops. Must end pointing outward, not inward. |
| 4 | **Featured work** | 3 of the 5 flagships as large cards, each with a muted autoplay micro-loop, one metric, one-line outcome. |
| 5 | **Capability map** | Instrument-panel grid of the 7 skill clusters from the resume. Hover reveals the tools within. Not a logo soup — grouped by *what it does*. |
| 5.5 | **Domain depth** | *Renamed from "Domains strip".* Driven by the **domains config** (§2), not by a component inventing an education cell the project data cannot support. Each cell **links to its `evidenceHref`** — `/finance`, `/teaching` — because a pillar you cannot click into is an assertion. A third cell is added **only when a project with a non-finance `domain` exists**; with none, two cells, still balanced, never greyed, never "coming soon" (FEEDBACK E7 applied to domains).<br><br>**Given the same visual weight and layout as Row 7 (Systems leadership),** and that parity is the actual design requirement rather than a preference: these are pillars two and three of §1, and rendering one as a thin strip and the other as a full section states a ranking the positioning does not intend. |
| 6 | **Ask teaser** | Live input. Type a question → routes to `/ask` with it prefilled. Shows a real cited answer as a demo. |
| 7 | **Systems leadership** | *Retitled from "Teaching & scale".* Framed as setting an engineering standard others build to: the ~100-instructor faculty, the cohort scale, the three institutions, with the numbers. **Must carry one engineering artefact** per FEEDBACK C5 — the eval rubric or the classroom-AI-vs-production-AI comparison — so it reads as leadership of a technical system rather than as a teaching credit. |
| 8 | **Now / Contact** | Availability, timezone, response promise, direct links. Availability copy leads with agentic/applied AI and lists finance as a domain, not as the filter. **Plus a second, quieter CTA: "Finance team? Start at /finance."** Deliberately secondary — the primary CTA stays domain-neutral for the larger audience, and this one catches the higher-intent reader without the page having to choose between them. |

### 5.2 Case study template (`/work/[slug]`)

This structure is the spec's highest-leverage artefact — it's the direct translation of what
the hiring research says gets evaluated.

1. **Header** — name, `title`, `outcome`, tag row, and a link cluster: `Live demo` · `Repo` ·
   `Video walkthrough`. Above the fold, always.

   The three fields from §2 do three distinct jobs here and are not interchangeable:
   **`title`** (≤ 8 words, capability only, schema-linted against a domain-word list) is what
   a reader scanning `/work` sees — that list alone must read as engineering capabilities, not
   accounting workflows. **`outcome`** sits directly beneath it and is where the finance task
   appears, ending `— applied to <domain task>`. **`whyFlagship`** does not appear in the
   header at all; it belongs on the `/work` index, where the question "why is this one a full
   case study" is actually being asked.
2. **TL;DR block** — a 40–60 word direct answer. *Doubles as the AEO citation target* — the
   research says answer engines extract exactly this shape. Lead the first sentence with the
   capability so the extracted passage carries it.
3. **Problem & constraints** — including the synthetic-data disclosure, stated plainly.
   **Required sub-section: "Where else this pattern applies."** 2–3 sentences naming
   non-finance contexts the same architecture serves — healthcare claims adjudication, legal
   document review, procurement approval chains, developer tooling. This is the **transfer
   signal**, and it is the single highest-leverage addition for a general hiring manager:
   it is the difference between "he built finance software" and "he solved a class of problem
   and finance is where he proved it." Rules: name concrete tasks rather than industries,
   claim only what the architecture actually supports, and never imply the project has
   shipped in that domain.
4. **Architecture** — the scroll-driven trace replay (§4.2) + a static diagram for print/share.
5. **Key decisions** — ADR-style cards: *Decision · Alternatives considered · Why*. This is
   where senior judgement becomes visible.
6. **Evaluation & results** — the eval methodology, the dataset, and the numbers. Mono
   readouts, not prose.
7. **Limits — what this system cannot do.** A first-class, styled section. The research line
   this exists for: *"A senior engineer's hallmark is knowing what their system cannot do."*
   Almost nobody does this; it will be remembered.
8. **Demo** — 60–120s walkthrough, facade-loaded.
9. **Stack & repo** — framework names live here, at the bottom, where they belong.

### 5.3 `/labs` — the Labs tab of `/work`

**Reached as a tab, not from nav.** `/work` carries a two-tab control — `Case studies | Labs` —
and `/labs` is the second tab. The route, its deep links and `/labs/[slug]` all survive
unchanged; what changes is that labs are presented as *the same kind of object as a case study,
at less depth*, which is what they are. Two sibling nav items implied two separate concerns and
spent a scarce nav slot saying something untrue.

Bento grid, cells of mixed span. Each cell: name, one-line, 2–3 tech chips, a hover
micro-loop or screenshot, links. Hover lifts −4px with a `pass`-tinted border.

**Two filter groups, capability first:**
- **Capability** — agents · RAG · evals · MCP · security · governance.
- **Domain** — finance · education · devtools · other. Rendered from the `domain` field (§2),
  and a value with no projects behind it does not render a chip. With everything currently
  `finance`, the domain group shows one chip — which is honest, and which will become the
  visible proof of breadth the moment it does not.

### 5.4 `/teaching`

**Route kept.** Under-sold today and worth a full page: the ~100-instructor faculty, the cohort
scale, the curriculum philosophy ("classroom AI vs production AI"), and the three institutions.

**Frame it as *systems leadership*, because that's what it is** — and under the T-shape this is
pillar two, not a footnote. The claim is not "he teaches"; it is "he set the standard ~100
instructors build to, at national scale." That is evidence of technical judgement being
adopted by other people, which is precisely what a staff-level hire is being assessed for.
It earns a pillar and a route; it does not appear in the H1.

**Rule:** the page must carry **at least one engineering artefact** — the curriculum's eval
rubric, the classroom-AI-vs-production-AI architecture comparison, or a cohort capstone eval
table. Without one it reads as an instructor bio, which is the opposite of the intent.
Institution logos: **maximum three**, no larger than the tech chips on `/labs`.

### 5.5 `/ask` — see §6.

### 5.6 `/finance` — domain hub

**Why this page exists.** Finance is pillar three of §1 and was the only pillar without a URL.
Pillar two has `/teaching`; pillar one has the entire site. So the pillar carrying the rarest,
least reproducible thing on the CV — someone who actually closed books — was the one a reader
could not navigate to. This page fixes that asymmetry, and it is also the finance-scoped
retrieval target: `/` answers "who builds reliable agent systems", this answers "who builds AI
for finance", and neither has to compromise for the other.

> **The documented exception to the capability-first rule (§1).** This is the one page where
> **domain leads capability**, by design. A reader who arrives here has already self-selected
> on the domain; leading with "multi-agent systems" at someone who came for finance is the
> mirror image of the mistake the positioning pass just corrected. The rule holds everywhere
> else, and this exception is stated so it cannot be cited as precedent.

**a. Header.** Title **"AI for Finance & Accounting"**. One-line claim: *"Agents for the one
domain where a wrong number is money lost and a broken audit."*

**b. Story — five sentences, first person, concrete.** Accounts assistant → what was actually
reconciled → what a failed close feels like → software → agents. **This is where the
ex-accountant identity lives in full**, at a length the home page cannot afford. It must be
specific enough that someone who has done the job recognises it immediately: named artefacts,
real volumes, the actual texture of a bad close. Generic "I came from finance" prose is worse than
nothing here, because this is the page a finance reader will judge hardest.

**c. "What finance demands of an agent"** — 4–6 principles, one sentence each, **each mapped to
a governance idea already implemented on the site and linked to the case study that
demonstrates it**. Not aspirational; each line is a claim with a receipt.

| Principle | Demonstrated by |
|---|---|
| Every posting must be provable after the fact, not merely logged. | `/work/ledgerguard` |
| The thing that orchestrates the work cannot also approve it. | `/work/closeops` |
| When retrieval is weak, the correct output is a refusal, not a plausible answer. | `/labs/policyground` |
| A human gates the commit; the agent prepares it. | `/work/closeops` · `/labs/invoiceops` |
| Right once is not right — a run must survive being repeated. | `/work/finagent-evals` |
| Uncertainty must be triageable rather than hidden behind a confidence number. | `/work/ledgerlens` |

**d. Finance case studies.** The **same case cards as `/work`** — the existing component,
filtered on `domain === "finance"`. Not bento (§3.4), and **not a new component**: a second
card that looks almost like the first is how design systems rot, and reusing it is what makes
this page read as a deeper cut of `/work` rather than a parallel site.

**e. "Infrastructure I've given the field."** FinAgent-Evals and LedgerLab, called out
specifically as a **public benchmark** and a **public fixture** — with repo links and the
LedgerLab connect snippet inline. This is the strongest section on the page for a senior
reader: most candidates have built things *for* a domain; very few have contributed
infrastructure *to* it.

**f. CTA — "Building AI for a finance team? Let's talk."**
**This section is permitted to be more commercial than the rest of the site**, and that is a
deliberate exception recorded here rather than a drift. The secondary audience in §1 is finance
leaders looking for consulting, and this is the only page they are likely to land on. The
restraint elsewhere is what earns this one direct ask.

**g. Answer block.** 40–60 words at the top, **finance-scoped** — this page is the
finance-scoped AEO target, while the home block stays capability-scoped (§8). The two must not
be copies of each other, or they compete for the same citation and neither wins.

---

## 6. "Ask this portfolio" — governed RAG agent

The portfolio becomes its own demo. This is the one screen a hiring manager will screenshot.

**Corpus:** resume, the 5 case studies, the lab entries, about, teaching. **65 chunks**
(measured; the estimate here was 120–200).

**Architecture — deliberately boring, and that's the point:**

> **Superseded by AS BUILT (PLAN.md).** No embeddings either: retrieval is **BM25
> scored in process**. Same reasoning that ruled out a vector store, carried one step
> further — 65 chunks, question and corpus sharing vocabulary, no embedding provider,
> no API key, no build-time network call, no artefact to keep in sync. The cost (a
> question phrased entirely in synonyms retrieves worse) is stated on the page.
> Refusal is a two-threshold test: IDF-weighted **coverage of the question by the
> retrieved passages**, plus a score floor. Two earlier designs failed the eval suite
> before this one — the reasoning is in `src/lib/ask/retrieve.ts`.

- Chunk **at build time** from the same typed objects the pages render.
- Retrieval in a Route Handler. **No vector DB.** At this corpus size a managed
  vector store is cost and latency with no benefit — and being able to explain that
  tradeoff is itself a senior signal worth writing up on the page.
- Streaming answers with inline citation markers that scroll-link to the source anchor.
- **Feature-flagged.** `NEXT_PUBLIC_ASK_ENABLED` is derived at build time from whether
  a provider key exists. With no key, `/ask` 404s and every reference to it — nav pill,
  home teaser, sitemap, `llms.txt`, even the page title — is absent from the build.
  A signature feature is live or it does not exist; a "coming soon" page is worse than
  neither.
- **Degrades to retrieval.** If the model produces no first token within 5s, the answer
  is replaced by the top retrieved passage, unedited, labelled as such. A provider
  outage is not an error state.

**The governance surface (this is the actual product):**
- **Visible citations** — every claim carries a source chip; click scrolls to the passage.
- **Explicit refusal** — if top-k similarity is below threshold, it refuses and says so, in
  `halt` red. Demonstrated, not hidden.
- **Scope statement** — "I answer from Aneeq's resume and case studies only."
- **Published eval score** — a 25–30 question eval suite runs in CI; the groundedness and
  refusal-accuracy numbers are rendered live on the page with the commit they came from.
- **Prompt-injection resistance** — FinXPIA is literally a prompt-injection corpus. Reuse a
  slice of it as a test set and publish the pass rate. Nobody else's portfolio does this.

**Abuse & cost controls:**
- IP rate limit (Vercel KV / Upstash), input length cap, `max_tokens` cap.
- Daily token ceiling; on breach, degrade gracefully to a cached-answers mode rather than error.
- No PII collection, no chat persistence beyond the session.

**Provider:** Anthropic Claude. *Implementation note: load the `claude-api` skill before
writing any of this code — model IDs, streaming, and caching params must come from there, not
from memory.*

---

## 7. Media pipeline

**Micro-loops** (cards, hero, bento): 4–6s, muted, no audio track, ≤ 1.5 MB.
`ffmpeg` → WebM (VP9) + MP4 (H.264) fallback + JPEG poster. `preload="none"`,
`IntersectionObserver`-gated play, pause off-screen, never autoplay under reduced-motion.
Source material: ~~`LedgerLens/videos/`, `InvoiceAudit/videos/`~~ — *superseded:* those
clips are **720×1280 portrait LinkedIn footage**, not screen recordings. No transcode
makes a vertical phone video into a UI demo. The one usable source was
`LedgerLens/docs/demo/ledgerlens-demo.webm` at 1440×900.

**Walkthroughs** (one per flagship): ~~Cloudflare Stream~~ — *superseded:* **self-hosted
MP4**. The full 3m35s walkthrough compresses to **2.3 MB** (screen recordings are mostly
static pixels), so a video CDN buys nothing at this size. Still a **facade**: poster image
→ real player only on click, so player JS never touches initial load. Captions required.
Built by `npm run media` with a project-local `ffmpeg` dev dependency — not a system install.

**Story footage** (`story-one/`, `story-two/`): brand/marketing clips. Use as an `/about`
background or a `/demos` intro — **not** as project demos.

**Known gap — screenshots are missing** for SpendSort, LedgerLab, InvoiceOps, FinAgent-Evals
and LedgerLens (their own READMEs flag it). Capturing these is a build prerequisite, tracked in
the plan. Nothing will be faked or borrowed.

---

## 8. Performance, accessibility, discoverability

### Budget (enforced in CI — build fails on breach)

Tooling: **`@lhci/cli`** (`lighthouserc.json`), mobile preset with Moto-G-class
throttling (4× CPU slowdown, 1.6 Mbps), 3 runs, against three routes: **`/`**,
**`/work/closeops`**, **`/labs`**. Desktop numbers are not evidence. Bundle sizes are
asserted separately by `npm run check:bundle`, which reads the build output.

| Metric | Target | Threshold it beats |
|---|---|---|
| LCP | < 2.0 s | 2.5 s |
| INP | < 150 ms | 200 ms |
| CLS | < 0.05 | 0.1 |
| Home JS (excl. lazy 3D) | **< 200 KB gz** | — |
| 3D chunk (lazy) | < 250 KB gz | — |
| 3D chunk absent from initial payload | asserted | — |
| Fonts (preloaded) | < 150 KB | — |
| Lighthouse mobile perf | ≥ 90 | — |
| Lighthouse a11y | 100 | — |

> **On the 200 KB.** This spec originally said 180, written before anything was
> measured. Measured: react-dom is 70 KB gz and the React/Next App Router runtime a
> further 83 — a **~153 KB floor** before a line of this site's code. 180 would have
> left 27 KB for the whole application and failed permanently, and a gate that can
> never pass is a gate someone deletes. At 200 the app code gets a real ~47 KB and
> the gate still bites: the build sits at 195 KB, so a 60 KB dependency breaks it.
> Verified by deliberately adding one. Lower this as app code shrinks; never raise
> it quietly.

> **Which Lighthouse assertions block, and why not all of them.**
> `error` on the deterministic ones — accessibility, SEO, best practices, CLS, and
> the byte budgets. Those do not vary with the machine.
> `warn` on performance score, LCP, TBT and Speed Index, because under `simulate`
> throttling those are a function of the *host's* spare CPU. Measured on a
> development machine at 67% load they read TBT ≈ 4.7 s and performance ≈ 52; the
> same build unthrottled on the same machine reads **TBT 33 ms, performance 96**.
> The site was never the problem; the measurement was. Blocking a build on a number
> that swings 140× with background load produces exactly the flaky gate people
> learn to skip.
>
> **Reference (unthrottled, `/`): performance 96 · LCP 2330 ms · TBT 33 ms · CLS 0.**
> Run `npm run lh:summary` after any Lighthouse run for the per-route medians.
> **Calibrate once on the real CI runner and promote the four timing assertions
> from `warn` to `error`** — that is a real open item, not a permanent exemption.

### Accessibility
WCAG 2.2 AA. Full keyboard nav with visible `pass`-coloured focus rings. `prefers-reduced-motion`
honoured globally. Captions on all walkthroughs. Every 3D scene has a text-equivalent fallback.

Gates — **four Playwright passes**, all with `@axe-core/playwright`:
1. **dark** (default theme)
2. **light** — seeds next-themes' `localStorage` key rather than using Playwright's
   `colorScheme`, because the site is class-based with `enableSystem={false}` and
   `colorScheme` would silently audit the dark theme twice. This pass caught the
   active filter chip at 4.15:1.
3. **reduced-motion** — asserts no canvas is created and the labelled fallbacks render.
4. **no-JavaScript** — asserts the headline, proof bar, card titles, limits section and
   contact address are all visible with scripting off, and that nothing is left hidden
   by an un-run animation.

### SEO / AEO
Answer engines are a real recruiter channel in 2026, and the unit of success is a cited
passage, not a ranked link.
- Every page opens with a **40–60 word direct answer** — the shape LLMs extract.

**The home answer block leads with the capability, and names finance as a domain.** An answer
engine asked "who builds reliable multi-agent systems?" must be able to return this person;
today's block would only surface for finance-scoped questions, which is the retrieval-layer
version of the same positioning bug. Target shape (40–60 words):

> Aneeq Khatri is an agentic AI engineer who builds multi-agent systems that can be proven
> correct — evaluation harnesses, governance gates, human approval and full observability. He
> proved the approach in accounting and finance, the domain that punishes unreliability
> fastest, and leads a ~100-instructor faculty teaching it at national scale.

- `Person` JSON-LD with `sameAs` → LinkedIn, GitHub, and the training institutions; plus
  `SoftwareSourceCode` / `CreativeWork` per project. The entity graph is what gets verified
  before a citation.

**`jobTitle` and `knowsAbout` lead with agentic AI; finance is one entry in a list, not the
title.**

```jsonc
"jobTitle": "Agentic AI Engineer",          // was: "AI Engineer for accounting and finance"
"knowsAbout": [
  "Multi-agent systems", "AI evaluation and benchmarking", "LLM observability",
  "AI governance and guardrails", "Model Context Protocol (MCP)",
  "Retrieval-augmented generation", "Agent reliability engineering",
  "Finance and accounting automation",      // present, and deliberately not first
  "Technical curriculum and faculty leadership"
]
```

The ordering is not cosmetic: `knowsAbout` is a ranked entity list to an answer engine, and the
first three entries are what it will associate the person with.
- `/llms.txt` at root pointing at the best pages — **including `/finance` and `/teaching`**,
  which are the two pillar pages and the two scoped retrieval targets. Omitting them left the
  file describing only pillar one. *(Caveat: Google states it does not consume
  `llms.txt` and it neither helps nor harms Google rankings — this is for ChatGPT, Claude and
  Perplexity. It costs ten minutes, so it ships.)*
- Dynamic OG images per project via `next/og`.

---

## 9. Tech stack

*As built. The original list is preserved in the AS BUILT table in PLAN.md.*

```
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict)
Tailwind CSS v4 (OKLCH tokens via @theme)
@react-three/fiber + @react-three/drei + three · zustand   [lazy, 3D only]
  └─ classic WebGLRenderer + GLSL. NOT three/webgpu, NOT TSL — measured
     at 186.1 KB gz against a 250 KB budget and rejected (§4.4)
  └─ drei MeshTransmissionMaterial, Environment/Lightformer,
     ContactShadows, useFBO                      [lazy, 3D only, 29.8 KB gz]
postprocessing (SelectiveBloom + Vignette ONLY)  [lazy, 3D only, 26.7 KB gz]
gsap incl. ScrollTrigger + SplitText             [46.0 KB gz — /work ONLY;
     measured out of the home route, which has 4.7 KB of headroom (§3.5)]
Motion v12                                                 [lazy, scroll replay only]
next-themes · next/font (self-hosted variable) · lucide-react
Typed TS + zod content pipeline (validated at module load, fails the build)
@anthropic-ai/sdk                                          [server, ask agent]
Server Actions (contact) · Route Handlers (ask agent, llms.txt, RSS)
Vercel · self-hosted MP4 (ffmpeg-static, `npm run media`)
CI: GitHub Actions —
  typecheck · lint · retrieval eval suite · UTF-8 encoding scan ·
  build · bundle budget · Playwright + axe (dark, light, reduced-motion, no-JS) ·
  Lighthouse CI
```

**Dropped from the original stack:** shadcn/ui (its background/foreground vocabulary
would have to be overridden to reach the pass/gate/halt triad), MDX + gray-matter
(frontmatter can only guarantee frontmatter — see §2), Cloudflare Stream (§7).

**Deliberate omissions:** no CMS (typed content in-repo is faster and version-controlled),
no vector DB *and no embeddings* (§6), no analytics beyond Vercel's privacy-preserving
pageviews, no cookie banner because there are no cookies to consent to, **no smooth-scroll
library** (§3.5), and **no HDR environment files** — the hero's lighting is procedural
`<Lightformer>` panels, because an environment map would reintroduce exactly the asset-weight
failure mode §4's preamble exists to avoid.

**Lazy, and asserted lazy.** Everything marked `[lazy, 3D only]` above lives in the 3D chunk
and must never appear in the home route's initial payload — asserted by `npm run check:bundle`
and, for Tiers 0–1, by the Playwright network assertion in §4.3. `gsap` is the one new
dependency that may touch a route's initial chunk, and only if the §3.5 measurement permits.

---

## 10. Open items

Everything here is wired and dark, waiting on one input. Nothing needs a code change.

| # | Item | Decision needed | What lights up |
|---|---|---|---|
| 1 | **Domain** | Spec assumes `aneeqkhatri.com`. Swap freely. | `site.url` — canonical URLs, JSON-LD, sitemap, RSS |
| 2 | **Repo visibility** | Make the flagship five public, then set `REPOS_PUBLIC=1`. Repo URLs are already in the content; the links stay dark until this is set, because a link to a private repo is a 404 and that is worse than saying it is private. If one cannot be public, demote it to `/labs` and promote a lab — the flagship row must be 5/5 clickable. | Every `Repo` link, site-wide |
| 3 | **Provider key** | `ANTHROPIC_API_KEY` in the Vercel environment. | `/ask` and every reference to it. Without it the route 404s and the feature is absent from the build — verified both ways. |
| 4 | **Mail provider** | `RESEND_API_KEY`. Until then the contact form says so and points at the email address rather than dropping mail. | Contact form delivery |
| 5 | **Live demo** | Deploy LedgerLab (free tier, read-only, rate-limited), then set `LEDGERLAB_DEMO_URL`. The connection instructions are already on the case study and switch from `localhost` to the real host automatically. **Highest-value open item** — "deployed service" is the strongest recruiter signal and video is a substitute, not an equal. | `Live demo` link + the connect snippets |
| 6 | **Remaining screenshots** | Boot each project locally and capture. Each README lists the screens. Order by leverage: FinAgent-Evals, LedgerLab, InvoiceOps, PolicyGround, Trace2Evals. | Their `/labs` bento cells (currently they appear in the named list instead) |
| 7 | **Resume dates** | Confirm: Voya `Dec 2025 – Present`, SMIT `Aug 2026 – Present`, PIAIC `Aug 2025 – Present`, GIAIC `Feb 2024 – Present`, BS CS expected `Dec 2026`. | Nothing — verification only |
| 8 | **Lighthouse timing assertions** | Calibrate **LCP, TBT, Speed Index and the performance score** on the real CI runner, then promote them from `warn` to `error`. See the §8 note for why they are `warn` today: under `simulate` throttling these read as a function of the host's spare CPU, and the same build measured TBT 4.7 s on a loaded machine and 33 ms unloaded. **Owner: build, not Aneeq** — this is the one open item that is not waiting on a credential or a decision. | Nothing visible. **Until promoted, the §8 budget is only partially enforced:** the deterministic assertions (a11y, SEO, best practices, CLS, byte budgets) block, and the four timing assertions do not. A budget that is half a gate should be described as half a gate. |
| 9 | **WebGPU — closed on measurement, revisit on a number** | ~~Verify transmission + selective bloom on the WebGPU device matrix.~~ **Closed before the device matrix was reached:** `three/webgpu` tree-shakes to **186.1 KB gz**, 215.9 with the drei surface §4.1 needs, against a 250 KB chunk budget. Re-open only when three's WebGPU renderer measures **under ~120 KB gz** — that is the arithmetic threshold at which the rest of §4.1 fits. **Owner: build.** Re-measure at a major three release; do not re-litigate from memory. | Nothing today. WebGL 2 ships the complete §4.1 concept — transmission, bloom, contact shadows and FBO particles are all WebGL 2 capabilities. The only thing WebGPU would have bought is writing each shader once instead of once. |
| 10 | **Poster regeneration after hero changes** | The Tier 1 poster (§4.3) is a **build artefact of the scene**, so any change to the hero's geometry, material, lighting or run cycle **invalidates it**. Regenerate with `npm run poster` and re-check it is ≤ 60 KB. **Owner: build.** A stale poster is the one failure mode here that no existing gate catches — the bundle gate weighs it, Lighthouse scores it, and neither knows it depicts the wrong scene. | The Tier 1 hero for every small-screen visitor — which, on a link tapped from LinkedIn, is a large share of all first views. |
