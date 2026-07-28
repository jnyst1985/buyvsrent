# Development guide

Everything you need to clone this repo on another machine and work on it —
with an emphasis on the UI/UX, since that's the current focus.

## Quick start (fresh machine)

```bash
git clone https://github.com/jnyst1985/buyvsrent.git
cd buyvsrent
npm install
npm run dev          # http://localhost:4321
```

That's the whole setup for UI/UX work. **No secrets, API keys, or `.env` file are
required to run the site locally** — analytics simply don't load in dev, which is
what you want anyway.

```bash
npm run dev          # dev server, hot reload
npm run build        # static build → dist/
npm run preview      # serve the built dist/ locally
npm test             # engine + URL-codec tests (Vitest) — keep these green
npx tsc --noEmit     # type-check
```

Requires Node ≥ 20.3 (Node 26 is fine).

## What is NOT in Git (and why)

The code is 100% committed, but a few things live outside the repo by design.
None of them block UI/UX work; they matter only for production builds, deploys,
and the background automation.

| Thing | Where it lives | Needed for | On a new machine |
| --- | --- | --- | --- |
| `.env` (analytics IDs) | gitignored, local only | production build only | copy `.env.example` → `.env`; see below |
| Cloudflare deploy auth | `~/Library/.../.wrangler/` | `wrangler deploy` | run `wrangler login` once |
| Automation secrets | `~/.config/{gsc,telegram,clarity}/` | the scheduled jobs | leave on the primary Mac — see below |
| LaunchAgents (cron) | `~/Library/LaunchAgents/` | the scheduled jobs | **do not install on a 2nd machine** |

### `.env` — analytics IDs

These are **public** IDs (they're visible in the deployed page source), so there's
no secret here — they're just kept out of the repo so forks don't send data to this
property. For a production build that matches live, create `.env`:

```
PUBLIC_GA_MEASUREMENT_ID=G-J18VFSYEHD
PUBLIC_CLARITY_PROJECT_ID=xqyqdixga8
```

For local UI/UX work, skip this entirely — you don't want GA/Clarity firing while
you develop. `Analytics.astro` renders nothing when the vars are unset.

### Automation is machine-local — keep it on one Mac

The `automation/` scripts run as macOS LaunchAgents (a daily HN digest at 09:30, a
weekly SEO report Mondays 09:23) and push to Telegram. Their credentials live in
`~/.config/` and the schedulers in `~/Library/LaunchAgents/`. **Do not bootstrap
these on a second machine** — you'd get duplicate Telegram messages and double the
API calls (the Clarity export API is capped at 10/day). Edit the scripts anywhere;
just run them from one machine.

## Deploying (from any machine)

Deploys go through Cloudflare Workers, **not** git push. A `git push` is backup only.

```bash
npm run build && npx wrangler deploy      # after: wrangler login (once per machine)
```

`wrangler.jsonc` holds the Worker config and custom-domain routes. Security headers
are in `public/_headers`; the `/sitemap.xml` alias in `public/_redirects`; the
www→apex 301 is a Cloudflare zone Redirect Rule (dashboard, not in the repo).

## Project structure

```
src/
├── components/calculator/   ← the interactive UI (Preact island) — most UX work is here
├── layouts/                 ← page shells (BaseLayout = <head>, header, footer, SEO)
├── pages/                   ← routes (.astro static pages + .md content)
├── content/                 ← guides + section copy (Markdown collections)
├── data/                    ← faq.json, glossary.json
├── lib/engine/              ← the calculation engine (pure TS, framework-agnostic)
└── styles/global.css        ← design tokens + slider/prose styles
```

Content pages ship **zero JavaScript**; only the calculator hydrates.

## UI / design system

The full spec is **`DESIGN.md`**. Read it before changing anything visual — it
carries two rules that are easy to break by accident, summarised below.

Everything visual is driven by tokens in **`src/styles/global.css`** (`@theme
static` block) and consumed as Tailwind 4 utilities (`text-ink`, `bg-primary-pale`,
`border-hairline`, …). Change a token once, it propagates everywhere.

| Token | Value | Meaning |
| --- | --- | --- |
| `--color-primary` / `-pale` / `-deep` | `#b6f25c` / `#ecfbd2` / `#35590a` | the single acid accent, its surface tint, and its legible-as-ink form |
| `--color-ink` | `#0e0f0c` | headings, figures, inverted band backgrounds |
| `--color-body` / `--color-lose` | `#454745` / `#6f746d` | running text; the losing path |
| `--color-canvas` / `-soft` | `#ffffff` / `#e8ebe6` | the white/sage band alternation |
| `--color-hairline` | `#d3d8d1` | borders, table rules |
| `--color-cost-1…6` | neutral ramp | cost segments in the money bars only |
| `--field-h` / `-num-w` / `-unit-w` / `-w` | `36` / `62` / `50` / `140px` | the one numeric-field size, see below |

The old `--color-buy` / `--color-rent` blue-green pair is **gone**, not
deprecated-but-present. Nothing references it. Do not reintroduce it — see rule 1
below for why a fixed path-to-colour mapping is wrong here.

**`@theme static` is load-bearing.** Tailwind 4 tree-shakes `@theme` variables
that no CSS rule references, and several of these are consumed only from JS
(cost-ramp segments as inline styles, chart line colours as SVG attributes).
Without `static` they resolve to an empty string and elements render transparent
with no error.

### The two rules that are easy to get wrong

1. **Colour means "who is ahead", not "which path."** Acid green reads as
   positive, so binding it to the rent path would paint the loser green whenever
   buying wins. Whichever path leads takes `--color-primary-deep` (lines,
   figures) or `--color-primary-pale` (surfaces); the other takes
   `--color-lose`. Identity is carried by **position and label** — rent is always
   listed first, winning or losing — never by colour. A tie neutralises both
   sides. *This replaces the old fixed blue/green mapping; do not reintroduce
   it.* Colour-blind separation still holds, and more strongly than before:
   acid-versus-grey separates by lightness, not hue.
2. **The accent is a surface, not an ink.** `--color-primary` on white measures
   1.33:1. Anything that must be legible as type or a thin line uses
   `--color-primary-deep` (8.1:1 on white). Bar fills, CTA fills and pale card
   surfaces use `--color-primary` / `-pale`. On `--color-ink` surfaces the accent
   is fine as type (14.5:1).

Band colours are chosen so every card contrasts with the band under it, not by
blind alternation: borderless cards (`.mcard`, `.hc`, `.kcard`, `.fc`) sit on
sage, bordered ones (`.racecard`, `.cg`, `.wc`) sit on white. Flipping a band
without checking its cards produces invisible cards.

### The prose standard (one scale, modules differ)

**Every page that carries an argument uses the same reading column and the same
type scale.** What differs per page type is which *modules* attach. This is the
rule Jon settled: the site read as four different sites because the same job was
rendered at four different scales, not because the pages carried different
things.

| | value | applies to |
| --- | --- | --- |
| prose column | ~712px (`.narrow`, 760px minus gutters) | `.art`, `.prose-content`, `.msplit` content |
| body | 17px / 1.65 / `--color-prose` / 68ch | `.art p`, `.prose-content p`, `.pb` |
| section heading | `clamp(23px, 2.6vw, 29px)` | `.art h2`, `.prose-content h2`, `.msplit h2`, `.fgroup h2` |
| sub-heading | 19px | `.art h3`, `.prose-content h3` |
| page heading | sized to its container, see below | |

**Modules by page type** — a guide gets byline + reading time + inline live
calculator + related guides; a landing page gets a comparison table and a strong
CTA; a tool gets its interactive component above the prose; a reference page gets
the sticky TOC and deep-linkable entries. Schema follows the type
(`Article` / `WebApplication` / `FAQPage` / `TechArticle`).

**The one heading rule: size a heading to its column, never to the viewport.**
That is why an `.art h1` is 46px (it sits in a 712px column) and a `.phero h1` is
56px (it sits in a 1112px band) — one rule, two correct answers. The same rule is
why `.prose-content h2` had to come down from 40px: it was sized for a much wider
container than the 626px column it actually lived in, so nearly every heading
broke onto two or three lines.

### Three sizing rules, all learned the hard way

1. **Numeric fields are sized by tokens, never by their content.** A field is a
   two-column grid: the numeral column is `1fr` (right-aligned), the unit column
   is a fixed `--field-unit-w`. Every field therefore comes out `--field-w` wide
   whatever unit it carries, and the digits form a real column down the card.
   Sizing them by content gave six different widths between 116px and 150px
   inside one card, and three different control heights across the site. If you
   add a unit longer than `months`, raise `--field-unit-w` — do not let the box
   grow. `.cf .box` (boxed, assumption grid) and `.crow .ed` (underlined, inline
   in the hero) share the metrics but keep different frames on purpose.
2. **A live figure at display size must be sized to fit, not to a clamp.** The
   answer band's figure had `clamp(56px, 11vw, 132px)`, which at the default
   scenario put 569px of ink in a 573px column. One more digit — a bigger home
   price — ran the number straight through the copy beside it, with no break
   opportunity and nothing clipping it. `AnswerBand.tsx` now computes the
   string's width in ems (`emWidth`, from measured Manrope advances; tabular
   figures make it exact) and CSS sizes it with
   `min(132px, (100cqi - 4px) / --em)` against a container. The default still
   renders at exactly 132px, so the approved design is unchanged, and nothing
   overflows at any length. `mega-fit.test.ts` pins the advances against
   browser-measured ground truth — **re-measure them if the display font or
   `.mega`'s tracking changes.**
3. **Section headings in a prose column get no `ch` measure cap.** A `32ch` cap
   computed to 625px inside a 712px column, so a heading needing 705px on one
   line was broken in two by the cap alone — it reads as a bug, because it is
   one. `.art h2`, `.prose-content h2` and `.feat h2` set `max-width: none`
   **explicitly**: they sit inside a `.band`, and merely deleting the
   declaration lets `.band h2`'s own cap take over. `text-wrap: balance` handles
   the headings that genuinely need two lines. Hero headings (`.hero h1`,
   `.phero h1`) keep their tight caps — there a deliberate two-line break is the
   design.

Every full-bleed band uses the `.band` helper, which carries the single `--sect`
rhythm token (64px desktop / 44px mobile). Do not hand-tune section padding.

**Bands butt directly against each other; spacing is always a band's own
padding, never a margin between them.** The footer had `margin-top: var(--sect)`,
which put 64px of *body background* between the last section and the footer — on
every page. It was invisible wherever the band above happened to be white, and
rendered as a stray white stripe wherever it was sage. If a band looks like it
needs breathing room, increase its padding.

**One footnote treatment.** A note that tells you how to read the thing directly
above it — `.mfoot` under the money bars, `.racenote` under the chart, the rate
table and the audit table — gets the 3px acid left rule and a 62ch measure.
They are defined in a single rule block for that reason; only `.mfoot` used to
have the rule, which read as a decision but was an accident. `.fine` is
deliberately excluded: that is a card's own fine print, already inside a
bordered card, where a second vertical rule is just noise.

Type is self-hosted from `public/fonts/` — **Manrope 800** for every headline
*and* every figure, **Inter 400/600** for everything else. Latin subset only.
They are not loaded from Google Fonts: the CSP allows neither
`fonts.googleapis.com` nor `fonts.gstatic.com`, and widening it for a font is
the wrong trade on a site that advertises no third-party data collection.

The site is **light-mode only** by deliberate choice. Do not invent a dark theme.

### Brand marks

`public/favicon.svg` (plus the 32px PNG, the 180px apple icon, and a hand-built
`favicon.ico`) and `public/og/default.png` are **acid-on-ink**, drawing two paths
that leave the same point and never meet — the site's thesis and the shape of its
own race chart. The previous set was a blue house with green bars, i.e. the
retired palette, which is why they had to be redrawn.

There is no image tooling on this machine: the PNGs are rendered by screenshotting
the SVG at exact pixel sizes through Playwright, and the `.ico` is a hand-written
ICO container wrapping the 32px PNG (valid, and what every current browser reads).
The OG card is built from HTML using the self-hosted woff2 files so it matches the
site's type exactly. **It deliberately carries no figures** — a static image
quoting `$67,000` is the same drift bug the engine tests exist to prevent.

### Facts published in more than one place

`src/lib/site.ts` holds them, `site-facts.test.ts` guards them. The test count
had drifted twice: the footer said 57 on *every page* while the README said 72 and
the suite ran 88. The footer now imports `TEST_COUNT`; the two files that state it
as literal text are asserted to contain the current value, so bumping the constant
names what is left to edit. Note the constant is self-referential — adding tests
changes the number it must state.

### The homepage island

`HomePage.tsx` is the root, mounted with **`client:load`** from
`src/pages/index.astro` — not `client:only`. It server-renders at the default
scenario so every figure, heading and FAQ answer is in the HTML a crawler
receives, then hydrates for interaction. Keep it that way: `client:only` ships an
empty homepage, which is a bad trade on a page whose whole value is its content.
A shared link is applied after first paint.

How it's wired (worth knowing before you refactor, so you don't reintroduce
fixed bugs):

- **Two-speed recompute**: inputs live in one state object. `simulateCore()` runs
  synchronously on every change; the expensive pass — `analyzeScenario()` plus the
  nine-rung `rateLadder()` — is debounced 160 ms. The first analysis runs eagerly
  at init so there is no "Computing…" flash.
- **No layout shift**: while the deferred pass recomputes, the last values stay on
  screen dimmed instead of unmounting. Collapsing those rows mid-recompute was a
  real bug.
- **Winner state is derived, never stored.** Every render recomputes who is
  ahead and reapplies tint, tag, flags, legend and line colour together, so they
  cannot disagree.
- **URL = share artifact**: inputs encode into the query string (`urlParams.ts`),
  debounced, preserving non-owned params (utm_*). Legacy short links still decode.
- **Domain math lives in `src/lib/engine/`,** never in components — including the
  money decomposition (`decompose.ts`) and the rate ladder (`ladder.ts`), both of
  which have their own tests.
- **The chart crosshair has two traps, both already sprung once.** (a) A touch
  pointer is destroyed straight after `pointerup`, which fires `pointerleave`
  immediately — so clearing on leave made a tap show the readout and hide it in
  the same tick. `onPointerLeave` ignores `pointerType === 'touch'`. (b) The
  readout's side is chosen from real geometry, not a fraction of the plot: at
  390px the card is half the plot width, so a "flip past 62%" rule still ran it
  25px off the card and pushed the page wider than the viewport. Its `left` and
  `width` both come from the component; CSS must not second-guess either.

Component map:

| File | Role |
| --- | --- |
| `HomePage.tsx` | root island: state, two-speed recompute, URL sync, section composition |
| `ConverterCard.tsx` | the signature hero: rent in, ten-year position out |
| `AnswerBand.tsx` | the inverted ink band; gap figure auto-fitted to its column, 132px max |
| `Trio.tsx` | rent / buy / tipping-point cards |
| `MoneyBars.tsx` | monthly decomposition, receipt legend, segment tooltip |
| `RaceChart.tsx` | SVG net-worth chart, re-rendered at container size via ResizeObserver; hover/tap/arrow-key crosshair readout |
| `FlipLevers.tsx` | sensitivity rewritten as plain sentences |
| `RatesTable.tsx` | the nine-rung rate ladder |
| `CustomizeGrid.tsx` | 20 assumptions, four groups, per-group reset |
| `KeepResult.tsx` | the copy-paste-to-AI block and scenario link |
| `AuditTable.tsx` | year-by-year net worth |
| `inputs.tsx` | caret-preserving money field + inline number field |
| `FivePercentRule.tsx`, `PriceToRent.tsx` | the two standalone `/calculators/*` tools |

### Tables below 700px

Horizontal scroll is the wrong default — it slices the last column mid-word and
reads as broken. Pick by column count: 3 or fewer, leave it; 4-5 with one row
that matters, stack each row into a block via `data-label` (the rate table, whose
wrapper takes `.rwrap-stack`); 6+ being scanned down a column, mark the
supporting columns `.sup` and hide them (the audit table). Authoring
`data-label` at render time is the cheap moment — retrofitting it is not.

Do not put domain math in components — it belongs in `src/lib/engine/`, which has
its own tests (`npm test`). The engine is documented on
[/methodology](https://rentvsbuymath.com/methodology).

## Analytics & behavior data (for UX decisions)

- **GA4** (`G-J18VFSYEHD`) — acquisition and events.
- **Microsoft Clarity** (`xqyqdixga8`) — session replays + heatmaps; the best signal
  for where users struggle on the calculator. Watch which sliders get rage-clicks
  and where people drop. The weekly SEO report folds in a Clarity snapshot.
- **Cloudflare Web Analytics** — cookie-free pageviews, zero-config.

Before assuming traffic numbers are real users, sanity-check engagement: new domains
attract scanner/bot noise that inflates raw sessions. Trust *engaged* sessions.
