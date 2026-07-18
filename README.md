# BuyVsRent.xyz

A free, transparent rent-vs-buy calculator. Simulates buying a home versus renting and investing the difference, month by month, and tells you which path leaves you wealthier — with every formula documented.

🌐 **Live**: [buyvsrent.xyz](https://buyvsrent.xyz)
📖 **Methodology**: [buyvsrent.xyz/methodology](https://buyvsrent.xyz/methodology)

## Why another rent-vs-buy calculator?

Most are built by parties with a stake in your answer, and most skip the hard parts. This one:

- **Symmetric opportunity cost** — the renter invests the down payment and monthly savings; when owning becomes cheaper, the *buyer's* surplus is invested too. Most tools only credit one side.
- **Real tax rules (2026)** — standard-vs-itemized delta, $750k mortgage-interest cap (IRS average-balance method), $40,400 SALT cap, Section 121 exclusion, capital-gains tax with exact basis tracking.
- **Full costs** — closing and selling costs, property tax growth, maintenance, insurance, HOA, PMI with automatic termination per the Homeowners Protection Act schedule.
- **Honest uncertainty** — every verdict ships with a sensitivity table; ±1pt swings that flip the answer are flagged.
- **Live answer** — no Calculate button; verdict, tipping-point rent, and chart update on every input.

## Stack

- [Astro 5](https://astro.build) static output — content pages ship zero JavaScript
- One [Preact](https://preactjs.com) island for the calculator (~15 kB gz), hand-rolled SVG chart
- Tailwind CSS 4, deployed on Vercel

## Engine

`src/lib/engine/` is a framework-agnostic TypeScript simulation covered by **91 tests**, including 10 verification vectors independently derived with closed-form math (amortization tables, annuity formulas, hand-enumerable zero-rate scenarios). Run them:

```bash
npm install
npm test
```

Key files:

| File | Purpose |
| --- | --- |
| `src/lib/engine/engine.ts` | Monthly simulation: both scenarios, taxes, liquidation, sensitivity, tipping-point solver |
| `src/lib/engine/defaults.ts` | Researched 2026 defaults (documented on /methodology) |
| `src/lib/engine/urlParams.ts` | Share-link codec — backward-compatible with legacy short params |
| `src/lib/engine/vectors.test.ts` | The independent audit vectors |

## Development

```bash
npm run dev       # dev server
npm run build     # static build to dist/
npm test          # engine + codec tests
```

Deploys automatically to Vercel on push to `main` (`vercel.json` pins the Astro build).

## Corrections

Found an error in the math? [Open an issue](https://github.com/jnyst1985/buyvsrent/issues) with a share-link reproducing it. Verified corrections are credited on the methodology page.

## License

MIT — see [LICENSE](LICENSE). Content (guides, methodology text) © BuyVsRent, quotable with attribution + link.
