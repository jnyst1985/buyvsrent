---
version: 1.0
name: RentVsBuyMath-design-system
description: |
  A calculator that argues for its own honesty. Sage-tinted canvas with white
  cards as the only elevation cue, one acid-green accent used scarcely, near-black
  ink, and a heavy geometric sans (Manrope 800) carrying every headline and every
  figure. Derived from Wise's design language and adapted for a product whose job
  is to be believed: colour encodes *who is winning* rather than *which path*, and
  the accent is a surface colour that never touches thin type. Light-only by design.

colors:
  primary: "#b6f25c"
  primary-pale: "#ecfbd2"
  primary-deep: "#35590a"
  on-primary: "#0e0f0c"
  ink: "#0e0f0c"
  body: "#454745"
  lose: "#6f746d"
  canvas: "#ffffff"
  canvas-soft: "#e8ebe6"
  hairline: "#d3d8d1"
  on-dark: "#ffffff"
  on-dark-mute: "#b3bbae"
  cost-1: "#9aa197"
  cost-2: "#aeb4aa"
  cost-3: "#c0c6bc"
  cost-4: "#cfd4cb"
  cost-5: "#dbe0d7"
  cost-6: "#e5e9e1"

typography:
  mega:
    fontFamily: Manrope
    fontSize: clamp(56px, 11vw, 132px)
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: -0.04em
  display-xl:
    fontFamily: Manrope
    fontSize: clamp(34px, 5vw, 60px)
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Manrope
    fontSize: clamp(28px, 3.4vw, 40px)
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.028em
  display-md:
    fontFamily: Manrope
    fontSize: clamp(20px, 2.8vw, 34px)
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.025em
  amount-lg:
    fontFamily: Manrope
    fontSize: clamp(26px, 3.2vw, 38px)
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.028em
  amount-md:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: 800
    letterSpacing: -0.02em
  heading-sm:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: 800
    letterSpacing: -0.02em
  lede:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 14.5px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: Inter
    fontSize: 13.5px
    fontWeight: 600
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
  table-head:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: 700
    letterSpacing: 0.05em
    textTransform: uppercase
  tag:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 700
    letterSpacing: 0.07em
    textTransform: uppercase
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
  mono:
    fontFamily: ui-monospace
    fontSize: 13px
    lineHeight: 1.62

rounded:
  none: 0px
  input: 12px
  card: 24px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 64px

components:
  nav-bar:
    backgroundColor: "rgba(255,255,255,0.92)"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 11px 24px
  nav-jump-link:
    backgroundColor: transparent
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: 6px 10px
  nav-jump-link-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.card}"
    padding: 12px 24px
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.card}"
    padding: 12px 24px
  converter-card:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  amount-field:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.ink}"
    typography: "{typography.amount-md}"
    rounded: "{rounded.input}"
  amount-field-winner:
    backgroundColor: "{colors.primary-pale}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.input}"
  connector-row:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
  win-tag:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-dark}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: 2px 9px
  card-neutral:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  card-winner:
    backgroundColor: "{colors.primary-pale}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  card-inverted:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  band-answer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.primary}"
    typography: "{typography.mega}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  stacked-bar:
    backgroundColor: "{colors.canvas-soft}"
    rounded: 10px
    height: 46px
  segment-tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.input}"
    padding: 10px 13px
  data-table:
    headerTypography: "{typography.table-head}"
    headerBorder: "2px solid {colors.ink}"
    rowBorder: "1px solid {colors.hairline}"
    cellPadding: 12px 14px
  table-row-current:
    backgroundColor: "{colors.primary-pale}"
    rounded: "{rounded.input}"
  code-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas-soft}"
    typography: "{typography.mono}"
    rounded: 16px
    padding: 18px
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas-soft}"
    typography: "{typography.body-sm}"
    padding: 48px 24px 40px
---

## Overview

The page has one job: produce a number a stranger will believe. Everything in the
system serves that.

The canvas alternates between sage `{colors.canvas-soft}` and white `{colors.canvas}`
in full-bleed bands, and elevation is carried entirely by that surface contrast -
there are no drop shadows anywhere except the segment tooltip. Cards round at a
generous 24px (`{rounded.card}`); so do buttons. Inputs round tighter at 12px.

Type is two faces. **Manrope 800** carries every headline and every figure -
the heaviness is the brand voice, and using it for money as well as headlines is
what makes the numbers feel like the point of the page. **Inter 400/600** carries
everything else. There is no serif, no italic display, no third weight of Manrope.

The accent is a single acid green `{colors.primary}`, and it is scarce - at most one
acid CTA per fold. There is no second brand colour.

**Key Characteristics:**
- Sage/white band alternation as the only elevation language; no shadows on cards
- Manrope 800 for headlines *and* money; Inter for prose and labels
- One accent, `{colors.primary}`, used as a surface - never as thin type (see the ink rule below)
- Colour encodes **who is ahead**, not which path (see the winner rule below)
- 24px radius on cards and buttons; 12px on inputs; pills only for tags and nav
- Every band uses the same `{spacing.section}` top and bottom - no exceptions

## The two rules that are easy to get wrong

### 1. The winner rule - colour means "ahead", not "which path"

Acid green reads as *positive*. If it were bound to the rent path, it would paint
the loser green every time buying wins. So:

- **Colour is dynamic.** Whichever path is ahead takes `{colors.primary-deep}`
  (lines, figures) or `{colors.primary-pale}` (surfaces). The other takes
  `{colors.lose}` or plain white.
- **Identity is carried by position and label**, never by colour. Rent is always
  listed first - first row, first legend entry, first card - whether it is winning
  or losing, and every line and card is named.
- **A tie neutralises both sides.** No winner tint, no win tag, both chart lines in
  `{colors.lose}`, and the copy says "level" rather than naming a winner.

Do not reintroduce a fixed green=rent / blue=buy mapping. It was the previous
system's rule and it does not survive this palette.

### 2. The ink rule - the accent is a surface, not an ink

`{colors.primary}` on white measures ~1.4:1. It is unreadable as type or as a
2px line on any light surface. Therefore:

| Context | Use |
|---|---|
| Chart lines, big figures, links on light | `{colors.primary-deep}` (8.1:1 on white, 6.8:1 on sage) |
| Bar segments, CTA fills, pale card surfaces | `{colors.primary}` / `{colors.primary-pale}` |
| Type on `{colors.ink}` surfaces | `{colors.primary}` (14.5:1) |
| The losing chart line | `{colors.lose}` (4.7:1 white, 3.9:1 sage - clears the 3:1 graphics floor) |

## Colors

### Brand
- **Acid** (`{colors.primary}` - `#b6f25c`): the single accent. CTA fills, "stays yours" bar segments, type on ink surfaces. One acid CTA per fold, maximum.
- **Acid Pale** (`{colors.primary-pale}` - `#ecfbd2`): the winner surface - winning card, winning output field, current table row.
- **Acid Deep** (`{colors.primary-deep}` - `#35590a`): the accent as ink. Winning chart line, winning figures, inline links, focus rings.

### Surface
- **Canvas** (`{colors.canvas}` - `#ffffff`): card interiors and alternating bands.
- **Canvas Soft** (`{colors.canvas-soft}` - `#e8ebe6`): the sage band. Defines the mood; also fills unit chips and connector nodes.
- **Ink** (`{colors.ink}` - `#0e0f0c`): the answer band, the tipping-point card, the code block, the footer, the tooltip.
- **Hairline** (`{colors.hairline}` - `#d3d8d1`): card borders, table rules, the connector spine.

### Text
- **Ink** (`{colors.ink}`): headings, figures, primary text.
- **Body** (`{colors.body}` - `#454745`): running text, labels, captions. 9.4:1 on white.
- **Lose** (`{colors.lose}` - `#6f746d`): the losing path's line and its "behind" flag.
- **On Dark Mute** (`{colors.on-dark-mute}` - `#b3bbae`): secondary text on ink surfaces.

### Cost ramp
`{colors.cost-1}` through `{colors.cost-6}` are a six-step neutral ramp used **only**
for cost segments inside the money bars, assigned in order of appearance. They carry
no meaning individually - they exist to separate adjacent segments. Money that stays
yours is always `{colors.primary}`, never a ramp step.

## Typography

Two families, loaded from Google Fonts:

- **Manrope** at weight 800 only. Headlines, money, tags. Substitutes for Wise Sans; do not use lighter weights for display.
- **Inter** at 400 and 600. Body, labels, buttons, table cells.
- **ui-monospace** for the copy-paste block and any CLI-style output.

### Measure caps - and why they exist

Line length is capped everywhere. Past ~85 characters the eye loses its place
returning to the next line. But a cap that is too tight produces orphaned words,
which reads as an accident rather than a decision:

| Role | max-width | Notes |
|---|---|---|
| h1 | 13ch | Plus `text-wrap: balance` |
| h2 | 32ch | Every current heading fits on one line |
| Answer sub-headline | 34ch | Plus `text-wrap: balance` |
| Section sub / prose | 62ch | Plus `text-wrap: pretty` |
| Footnotes | 62ch | Anchored with a 3px `{colors.primary}` left rule so the narrow column reads as deliberate |

`text-wrap: balance` on every display role, `pretty` on paragraphs. Nothing renders
below 11px.

## Layout

- Container `max-width: 1160px`, 24px gutters.
- **One section token.** Every band uses `--sect` (64px desktop / 44px mobile) for both top and bottom padding. Never hand-tune a section's padding - inconsistent rhythm is the most visible sloppiness in a long page.
- Grids: trio and honest-cards 3-up/2-up; assumptions 2×2; hero splits `1fr / 520px`.
- Breakpoints: 1000px (hero and trio stack), 820px (2-col grids to 1), 760px (assumptions to 1), 700px (nav wraps, external links hide).

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Sage or white band | Default |
| 1 | White card + 1px `{colors.hairline}` | Neutral cards |
| 2 | Surface tint (`{colors.primary-pale}`) | The winner |
| 3 | Inversion to `{colors.ink}` | Answer band, tipping card, footer, code block |
| 4 | Radial acid bloom, 55% opacity, clipped by the card | Winner card only |

The only drop shadow in the system is on `{component.segment-tooltip}`. Cards never
have one.

## Components

**`converter-card`** - the signature component. Two paired amount fields (rent, price),
a connector spine of secondary inputs (rate, stay) with 23px sage nodes, then the
output field. The output field takes `{component.amount-field-winner}` and a
`{component.win-tag}` whenever there is a winner. The magnitude sits below in a quiet
sage badge - the card states *who* wins loudly and *by how much* quietly, because the
answer band immediately below states the magnitude at 132px.

**`band-answer`** - full-bleed ink band, the gap figure in `{typography.mega}` acid.
One per page.

**`stacked-bar`** - monthly cost decomposition. Solid `{colors.primary}` = money that
stays yours; cost ramp = money gone. Segments under 1.5% of total are dropped from
the bar; drawn segments are then **scaled to fill exactly 100%** while the legend
keeps true values. Legend is the receipt style: one row per segment, dot, name, dotted
leader, right-aligned value.

**`segment-tooltip`** - on hover and on keyboard focus. Colour dot, name, value at
`{typography.amount-md}`, and share of the monthly total. Hides on genuine mouse-leave
only (check `relatedTarget`; `mouseout` bubbles from child labels), and re-resolves on
scroll rather than blindly hiding.

**`data-table`** - 2px ink header rule, uppercase header, right-aligned numerics with
`tabular-nums`. The row matching the user's current scenario takes
`{component.table-row-current}` plus a "your rate" tag.

### Tables below 700px

Horizontal scroll is the wrong default. A table that scrolls sideways cuts its last
column mid-word and reads as broken, not as scrollable. Pick by column count:

| Columns | Mobile treatment |
|---|---|
| 3 or fewer | Leave it. Three columns fit at 390px. |
| 4-5, one row matters | **Stack into blocks.** `thead` hidden, each `tr` becomes a bordered 16px-radius card, each `td` a flex row that draws its own label from `data-label`. The first cell becomes the block heading in Manrope 800 with a rule under it. This is what the rate table does. |
| 6+, scanning a column | **Drop the supporting columns.** Mark them `.sup` and hide below 700px rather than stacking dozens of rows into dozens of blocks. This is what the audit table does - year, both net worths and the difference survive; home value and loan balance do not. |

Every cell that can be hidden or stacked needs a `data-label`, authored at render
time. Retro-fitting labels to an existing table is the expensive part, so add them
when the table is built.

## Do's and Don'ts

### Do
- Alternate sage and white in full-bleed bands; let surface contrast do the elevation.
- Set every headline and every figure in Manrope 800.
- Keep `{colors.primary}` to one CTA per fold.
- Use `{colors.primary-deep}` any time the accent needs to be legible as type or a line.
- Recolour by outcome and label by identity.
- Cap measure on every text role and add `text-wrap: balance` / `pretty`.
- Give both money bars the same total - the invest-the-difference symmetry is the point of the section, not a coincidence.

### Don't
- Don't put `{colors.primary}` on white as type, a thin line, or a small icon.
- Don't add a second accent colour, including for charts.
- Don't bind colour to rent-versus-buy.
- Don't put a drop shadow on a card.
- Don't hand-tune section padding.
- Don't hide the math behind a disclosure triangle - the audit table and the FAQ stay open.
- Don't reintroduce a sparkline on the result card. Killed twice; the card is number-led.

## Interaction patterns (load-bearing)

1. **Two-speed recompute.** Every input event runs one `simulateCore` and repaints the card, answer, trio, money bars, audit and chart. The expensive pass - tipping rent, sensitivity, the nine-row rate table - is debounced 160ms.
2. **Winner state is derived, never stored.** Every render recomputes who is ahead and reapplies tint, tag, flags, legend and line colour together, so they can never disagree.
3. **Clamp on commit.** Fields clamp to their range on input but reconcile the displayed value on blur; money fields reformat with thousands separators while preserving caret position.
4. **Scroll spy** on the jump nav via IntersectionObserver, `rootMargin: -64px 0px -60% 0px`.
5. **Reduced motion** gates smooth scrolling and the tooltip transition.
6. **Charts re-render at container size** via ResizeObserver; SVG is never CSS-stretched, which would distort the type.

## Known gaps

- No dark mode, by design. Do not invent one.
- Methodology and Guides page templates are not yet covered here.
- The share/download image card from the previous system was dropped; the copy-paste text block replaces it.
- The cost ramp is assigned by order of appearance, so a segment can change shade when another appears or disappears. Acceptable because the ramp carries no meaning, but do not build anything that depends on a segment's specific shade.

---

*This file is the design spec for rentvsbuymath.com, authored alongside the H
direction and copied into the repo so it travels with the code it governs.
`DEVELOPMENT.md` summarises the two rules most easily broken by accident; this is
the full version.*
