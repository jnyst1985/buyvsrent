---
title: "5% rule explained"
---

The 5% rule is a 10-second screen for the rent-vs-buy question: if your monthly rent is below 5% of a comparable home's price divided by 12, renting is financially reasonable. The catch is calibration — the rule was built when mortgages cost 3–4%, and at the 6.5% rate in our default scenario the honest threshold is closer to 7% of home value per year. Below: the original logic, the updated math, and when to stop trusting the shortcut.

## What is the 5% rule for rent vs buy?

The 5% rule, popularized by Ben Felix of PWL Capital in 2019, estimates a homeowner's unrecoverable costs at about 5% of the home's value per year: roughly 1% property tax, 1% maintenance, and 3% cost of capital. Multiply the price by 5%, divide by 12, and compare to rent. If rent is lower, renting is a reasonable financial choice.

"Unrecoverable" is the load-bearing word. Rent is money you never see again — but owners bleed money too: property tax, upkeep, mortgage interest, and the investment returns a down payment stops earning. Mortgage principal doesn't count; it becomes home equity rather than disappearing (our [glossary](/glossary) defines each term). The rule compares only the money that leaves each side for good.

Worked example: on a $420,000 house, 5% is $21,000 a year, or $1,750 a month. If an equivalent rental costs $1,600, renting is defensible; at $2,000, the rule leans buy.

## Where does the 5% number actually come from?

Three parts. Property tax at roughly 1% of home value, close to the US effective average. Maintenance at 1%, the standard long-run planning figure. Cost of capital at 3%: borrowed money costs the mortgage rate, and your down payment costs the expected stock return minus expected home appreciation.

When Felix published, mortgage rates were near 3% and his stocks-minus-real-estate spread was also about 3% — the debt/equity mix didn't matter; every dollar of house cost roughly 3% to finance. 1 + 1 + 3 = 5. That coincidence is the whole rule, and it's the part that breaks when rates move.

## Is the 5% rule still accurate at 6.5% mortgages? No — use about 7%.

No. The 3% cost of capital assumed 3–4% mortgages. At 6.5% with 20% down, redoing Felix's static math gives about 8%, while our full 10-year model — which also credits appreciation on the whole house, grows rents, and charges selling costs — puts the tipping point at about 7.1% of home value per year.

The updated static math, on our default assumptions (6.5% mortgage, 7% expected investment return, 3% home appreciation):

- Cost of debt: 6.5% on the 80% you borrowed = 5.2% of home value
- Cost of equity: (7% − 3%) on the 20% you put down = 0.8%
- Cost of capital: 6.0%. Add 1% tax and 1% maintenance and year one lands near 8%, drifting lower as amortization converts 6.5% debt into 4% equity.

Our full model comes in below that static 8% because rents grow (2.5%/year in the default), the debt share shrinks every year, and a 10-year stay spreads the one-time transaction costs. Its tipping rent — the rent above which buying wins — is $2,468/month on the $420,000 default home: 0.59% of the price per month, about 7.1% per year. A straight 7% shorthand gives $2,450, within $20 of the full model.

The gap between 5% and 7% is not academic. At the scenario's actual $2,100 rent, the classic threshold ($1,750) says buy. Our model says renting and investing the difference leaves you about $67,000 ahead after 10 years: the owner's first-year outlay is $3,067/month ($2,124 principal and interest, plus tax, insurance, and maintenance) against the renter's $2,115 — the mortgage payment alone exceeds the renter's entire cost.

## What's the right multiplier at other mortgage rates?

Between 4% and 8% mortgages, the annual threshold in our model runs from about 5.4% to 8.1% of home value — it climbs roughly 0.7 percentage points for every 1-point rate increase. The classic 5% is approximately right only near 4% mortgages, and pandemic-era financing (Freddie Mac's 30-year survey bottomed at 2.65% in January 2021) pushed the honest figure down toward 4%.

Derived from our tipping-rent table — the default $420,000 scenario with 20% down and a 10-year stay, only the mortgage rate varied:

| 30-year rate | Tipping rent (default $420k home) | As % of price per month | Annual rule of thumb |
|---|---|---|---|
| 4% | $1,890 | 0.45% | ~5.4% |
| 5% | $2,067 | 0.49% | ~5.9% |
| 6% | $2,340 | 0.56% | ~6.7% |
| 6.5% | $2,468 | 0.59% | ~7.1% |
| 7% | $2,590 | 0.62% | ~7.4% |
| 8% | $2,830 | 0.67% | ~8.1% |

Rates don't just slide the threshold; they flip verdicts. Rerun the identical default scenario at a 4% mortgage and buying wins by about $38,000, breaking even in year 6. If you prefer thinking in ratios, the classic rule is equivalent to "rent when the [price-to-rent ratio](/calculators/price-to-rent-ratio) is above 20"; at 6.5% mortgages the updated cutoff is closer to 14.

## What does the 5% rule leave out?

Four things a full model prices and no threshold can: stay length, taxes, transaction costs, and how close you sit to the edge. The same default scenario has renting ahead by about $49,000 over 5 years and $389,000 over 30 — an 8× spread the rule is blind to.

- **Stay length and transaction costs.** Short stays are dominated by closing and selling costs the rule ignores; long stays hinge on amortization and an eventually paid-off house — our engine models both (see the [methodology](/methodology)).
- **Taxes.** The rule has none. Our model prices the standard-vs-itemized deduction delta, the $40,400 SALT cap (2026), the $750k mortgage-interest cap, and the Section 121 exclusion at sale. In an expensive metro ($1.1M home, $3,800 rent — 0.35% of price per month — 15-year stay, married and itemizing), renting wins by roughly $560,000 — the rule gets the direction right and misses half a million dollars of magnitude.
- **Cheap markets cut the other way.** A $220,000 home renting for $1,600 is 0.73% of price per month, about 8.7% per year — above every threshold in the table, and our model agrees: buying wins.
- **Edge detection.** In the 6.5% default scenario, no single ±1-point assumption change flips the verdict; at 4% rates, ±1 point of appreciation or mortgage rate does. A one-line rule can't tell you which regime you're in.

One structural note: our model applies opportunity cost symmetrically — whichever side pays less each month invests the difference — while most calculators only credit the renter, quietly biasing results toward renting.

## When is the shortcut good enough?

Use the rule as a screen, with the right multiplier from the table. If rent sits 20% or more below the threshold, rent without guilt; 20% or more above, buying very likely wins. Inside that band — or if your stay is short, you itemize, or your market's appreciation is unusual — the shortcut has run out of resolution — territory [when does buying beat renting](/guides/when-does-buying-beat-renting) and our [2026 rent-vs-buy outlook](/guides/rent-vs-buy-2026) cover in full.

**Run your own numbers.** The 5% rule takes 10 seconds; the [full calculator](/?price=420000&rent=2100&rate=6.5) takes about two minutes and prices everything the shortcut can't — stay length, taxes (zero them if you're outside the US; the tool is currency-agnostic), PMI with automatic cancellation, selling costs, and your year-by-year breakeven. Swap in your own price, rent, and rate, and see which side of the tipping point you're actually on.