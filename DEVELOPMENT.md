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

Everything visual is driven by tokens in **`src/styles/global.css`** (`@theme`
block) and consumed as Tailwind 4 utilities (`text-ink`, `bg-rent-soft`,
`border-hairline`, …). Change a token once, it propagates everywhere.

| Token | Value | Meaning |
| --- | --- | --- |
| `--color-buy` / `-soft` | `#2563eb` / `#dbeafe` | buying side (blue) |
| `--color-rent` / `-soft` | `#059669` / `#d1fae5` | renting side (green) |
| `--color-ink` / `-secondary` / `-muted` | `#111827` / `#4b5563` / `#6b7280` | text hierarchy |
| `--color-surface` / `-raised` | `#ffffff` / `#f9fafb` | backgrounds |
| `--color-hairline` | `#e5e7eb` | borders, dividers |

The site is **light-mode only** by deliberate choice (standard for finance tools);
tokens are structured so a dark theme could be added later. The blue/green pair is
validated for contrast and color-blind separation — keep that if you re-skin.

### The calculator island

`Calculator.tsx` is the root, mounted with `client:only="preact"` from
`src/pages/index.astro`. How it's wired (worth knowing before you refactor, so you
don't reintroduce fixed bugs):

- **State → results**: inputs live in one state object. `simulateCore()` (the cheap
  path) runs synchronously on every change; the expensive `analyzeScenario()`
  (sensitivity table + tipping-point rent) is deferred ~150 ms.
- **No layout shift**: while the deferred analysis recomputes, the last values stay
  on screen dimmed (`analysisPending`) instead of unmounting. Preserve this in
  `VerdictBanner.tsx` and `Sensitivity.tsx` — collapsing those rows mid-recompute
  was a real bug we fixed.
- **URL = share artifact**: inputs encode into the query string (`urlParams.ts`),
  debounced, preserving non-owned params (utm_*). Legacy short links still decode.

Component map:

| File | Role |
| --- | --- |
| `Calculator.tsx` | root island: state, presets, debounced URL sync, error boundary |
| `VerdictBanner.tsx` | the headline answer (narrative net-worth sentence) + tipping-point line |
| `NetWorthChart.tsx` | hand-rolled SVG line chart with hover crosshair/tooltip |
| `fields.tsx` | `SliderField`, `CompactNumber`, `Toggle`, `Group` — the input primitives |
| `MonthlyCosts.tsx` | after-tax monthly cost breakdown |
| `Sensitivity.tsx` | ±1pt swing table with verdict-flip flags |
| `YearTable.tsx` | expandable year-by-year net-worth table |
| `ShareSheet.tsx` | copy-link / share-verdict buttons |
| `presets.ts` | the First-home / Upgrading / Downsizing preset scenarios |

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
