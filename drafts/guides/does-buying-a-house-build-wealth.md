<!-- DRAFT — do not ship before the open ledger reviews (a1: 2026-08-19, b2: 2026-08-27).
     To ship: move to src/content/guides/, set pubDate to the ship date, add the file to
     llms.txt, run npm test + npm run audit, deploy, and log ONE move in
     automation/metrics/moves.jsonl with a falsifiable prediction.
     Figures: all appear in published, guarded copy EXCEPT the ratio-10 matrix cell
     (Buy +$189k at 6.5%) — if kept, add {ratio: 10, rate: 6.5} to PUBLISHED_MATRIX in
     published-figures.test.ts when shipping. -->
---
title: "Does Buying a House Actually Build Wealth? Slower Than the Payment Suggests"
seoTitle: "Does Buying a House Build Wealth?"
description: "Leverage, forced savings and appreciation against a 2.7% yearly carry and 9% round-trip trading costs: what wealth a house actually builds, and when it doesn't."
pubDate: 2026-08-27
category: "Myths"
---

Sometimes — but through a narrower channel than the payment suggests, and in our default 2026 scenario, not fast enough: the buyer's leveraged house still trails the renter's portfolio by about $67,000 over ten years. A house builds wealth through exactly three mechanisms — principal, appreciation, and the rent you stop paying — and every one of them arrives with a cost attached that the "homeowners are wealthy, renters are not" statistic never shows.

## What part of the payment builds wealth?

The thin slice. On our default $336,000 loan at 6.5%, the payment is $2,124 a month and the first month retires $304 of principal — the other $1,820 is interest, which builds nothing. Principal doesn't overtake interest inside the payment until around year 19. Add property tax, insurance, and maintenance, and the owner spends $3,067 a month of which $2,763 is as unrecoverable as rent.

So the "forced savings" story is real but small at first: the forced part of the saving starts near $300 a month and grows slowly, while the burn runs over $2,700. A renter who invests the difference deliberately is running the same program with a bigger deposit and no compulsion — which is the honest version of the comparison, and the one our model runs. Whether compulsion itself is worth paying for is a question about you, not about houses.

## Doesn't leverage change everything?

It changes a lot — it's the strongest genuine argument for buying. Put 20% down and you hold 100% of the gain: our default home appreciating at 3% is worth about $564,000 in year ten, and all of that growth accrues to someone who put in $84,000. As a percentage return on cash invested, the early years look spectacular.

But leverage is bought, not given. Carrying it costs 6.5% interest on the borrowed 80% — and the house itself costs about 2.7% of its value a year to hold (tax, insurance, maintenance) and roughly 9% round trip to trade (3% buying, 6% selling — about $46,000 on the default scenario). Meanwhile the $84,000 that became a down payment stopped compounding elsewhere: at our model's 7%, it alone would have grown to about $165,000 in ten years. Net out everything, including capital-gains tax on the renter's portfolio, and the leveraged house still finishes about $67,000 behind.

As a pure asset, the comparison isn't close: US house prices have appreciated roughly 4% a year nominal over recent decades against about 10% for the S&P 500 with dividends. Our model conservatively assumes 3% and 7%. The house's real job is to be leveraged shelter with an implicit dividend — the rent you stop paying — and that dividend is the whole game.

## When does buying genuinely build wealth?

When the implicit dividend is large — that is, when rent is expensive relative to the price. This is a ratio question, and the answer flips hard across markets:

- **Cheap markets.** At a price-to-rent ratio of 10 — a $420,000 home renting for $3,500 — buying wins by about $189,000 over ten years at a 6.5% mortgage. The avoided rent is enormous relative to the carrying cost, and the mortgage is a bargain against it.
- **Expensive markets.** At a ratio of 24 — the same home renting for $1,458 — renting wins by about $185,000 at the same rate. The dividend is tiny, the carry is not, and [no realistic rate cut closes the gap](/guides/should-you-buy-in-an-expensive-city).
- **Cheap money.** At a 4% mortgage the default scenario itself flips: buying wins by about $38,000, breaking even in year six. Leverage builds wealth when the leverage is cheap.

The full grid — seven ratios by four rates, every cell a real simulation — is on the [price-to-rent ratio page](/calculators/price-to-rent-ratio#chart).

## Why do homeowners look so much wealthier in the statistics?

Selection runs both directions. People with stable incomes, savings, and access to credit are the ones who can buy, and they would skew wealthier as renters too. Homeownership also embeds a discipline machine — the forced $304 growing over decades, plus a strong bias against selling — that many households would not replicate voluntarily. The wealth statistic measures who buys and how compulsion behaves, not what the asset returns. Our model isolates the asset question by giving both sides the same discipline: whoever pays less in a month invests the difference, as documented in the [methodology](/methodology).

## How do you answer it for your own situation?

Compute the dividend. Take your realistic purchase and your realistic comparable rental, and check the rent as a share of the price — above roughly 0.59% a month at 6.5% rates, buying's wealth machine genuinely runs; below it, the machine runs backward and the renter who invests builds more. [The calculator](/?pp=420000&rent=2100&mr=6.5&th=10) prices your exact case in about a minute, taxes and selling costs included, and shows the year-by-year path rather than a slogan in either direction.
