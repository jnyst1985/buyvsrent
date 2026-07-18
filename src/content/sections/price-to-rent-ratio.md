---
title: "Price-to-rent ratio explained"
---

The price-to-rent ratio is a home's purchase price divided by a year of comparable rent. A $420,000 house that rents for $2,100 a month ($25,200 a year) scores 16.7. The classic bands — under 15 favors buying, over 20 favors renting — are a useful first screen, but they quietly assume a mortgage rate: with 30-year rates in the mid-6s, our model puts the buy-favorable line closer to 14.

## What does the price-to-rent ratio measure?

It divides what a home costs to buy by what it costs to rent for a year: **ratio = price ÷ (monthly rent × 12)**. One number, comparable across cities and decades. A high ratio means ownership is expensive relative to renting; a low ratio means the rent is doing the overpaying.

The comparison only works if the rental is genuinely comparable — same neighborhood, size, and condition, not "a $420,000 house versus a one-bedroom apartment." You can run it on a specific house you're considering, or on metro medians to size up a whole market. The calculator above handles both.

## Where did the "under 15 buy, over 20 rent" bands come from?

The bands trace to mid-2000s housing-bubble analysis. The long-run US average ratio had sat in the mid-teens, so 15 marked normal-to-cheap and 20 marked froth: the New York Times popularized a "rent ratio" metric with readings near 20 as a warning sign, and Trulia's early-2010s rent-vs-buy index hard-coded similar cutoffs. The national average spiked toward the mid-20s at the 2006 peak, fell back to roughly 15 by 2012, and has drifted up since (all figures approximate).

| Ratio | Classic reading | Monthly rent as % of price |
| --- | --- | --- |
| Under 15 | Favors buying | Above ~0.56% |
| 15–20 | Could go either way | ~0.42–0.56% |
| Over 20 | Favors renting | Below ~0.42% |

Note what the bands actually are: historical pattern-matching, not a cash-flow model. They summarize when US buyers tended to do well under the financing conditions of those decades — which matters, as we'll see below.

## What are typical US metro ratios in 2026?

Very roughly — treat these as approximations, not measurements: San Francisco and San Jose have run 30–45+ for most of the past two decades; Los Angeles, San Diego, and Seattle sit in the mid-20s to mid-30s; New York around 20–25; Austin, Denver, and Phoenix in the low 20s; the national average in the high teens; and much of the Midwest and inland South — Cleveland, Detroit, Pittsburgh, Memphis, Birmingham — around 10–15.

Our engine agrees with what the bands imply at the extremes. An expensive-metro scenario ($1.1M home, $3,800 rent — a ratio of about 24) has renting winning by roughly $560,000 over 15 years, even for a married couple itemizing deductions. An affordable-market scenario ($220,000 home, $1,600 rent — a ratio of about 11.5) flips decisively to buying over 10 years. Cheap markets where rent is high relative to price are where ownership pays.

## Is the 0.5% rule the same thing?

Yes — it's the same ratio turned upside down. Monthly rent as a percentage of price equals 1 ÷ (12 × ratio), so rent at 0.5% of the price per month is a ratio of 16.7, squarely inside the "could go either way" band. (Landlords' old "1% rule" is a ratio of 8.3; almost no major 2026 metro clears it.)

Our default scenario is exactly this case: $2,100 rent on a $420,000 home is 0.50% a month. At a 6.5% mortgage with 20% down, 3% home appreciation, 2.5% rent growth, 7% investment returns, and a 10-year stay, renting and investing the difference wins by about $67,000. The owner's true first-year cost is $3,067 a month ($2,124 principal and interest plus taxes, insurance, and maintenance) against roughly $2,115 all-in for the renter. At today's rates, 0.5% a month is not automatically buy territory.

## Mortgage rates move the buy-favorable threshold — a lot

The classic bands assume a financing environment. Our model's tipping-point rents — the rent at which buying starts to beat renting in the default $420,000 scenario over 10 years — convert directly into threshold ratios, and they slide hard with rates: buying wins below a ratio of roughly 18.5 at a 4% mortgage, but only below about 14 at 6.5%.

| 30-year rate | Tipping rent ($420k home) | As % of price per month | Buying favored below ratio ≈ |
| --- | --- | --- | --- |
| 4% | $1,890 | 0.45% | 18.5 |
| 5% | $2,067 | 0.49% | 17 |
| 6% | $2,340 | 0.56% | 15 |
| 6.5% | $2,468 | 0.59% | 14 |
| 7% | $2,590 | 0.62% | 13.5 |
| 8% | $2,830 | 0.67% | 12.4 |

*Our model's assumptions: 20% down, 3% appreciation, 2.5% rent growth, 7% investment return, 10-year stay, standard deduction. Buying wins when actual rent exceeds the tipping rent.*

Read the 6% row: the classic "under 15" line is roughly calibrated for a 6% world. At 4%, the identical default scenario flips outright — buying wins by about $38,000, breaking even in year 6 — which is why a 2021 buyer and a 2026 buyer can look at the same ratio and rationally do opposite things. The mechanics are unpacked in [when does buying beat renting](/guides/when-does-buying-beat-renting) and our [2026 rent-vs-buy outlook](/guides/rent-vs-buy-2026).

## What the ratio can't tell you

It's one number, so it ignores everything else that decides the outcome: how long you'll stay, your tax situation, what your down payment could earn elsewhere, and the spread between appreciation and rent growth. Treat it as a screen that tells you which markets deserve a full analysis — not as the analysis.

- **Holding period.** Even at 4% money, our default buyer doesn't break even until year 6; selling costs swamp short stays.
- **Taxes.** Standard-versus-itemized status changes the math; our engine models the 2026 $40,400 SALT cap and $750,000 mortgage-interest cap — details at [/methodology](/methodology). Outside the US, the calculator is currency-agnostic and every tax input can be zeroed.
- **Opportunity cost, on both sides.** Whichever side pays less each month should be investing the difference; most tools credit only the renter. For the shortcut version of this logic, see the [5% rule calculator](/calculators/5-percent-rule).
- **Your house isn't the median.** Metro-level ratios hide condition, HOA fees, and insurance differences that can move true costs by hundreds a month.
- **Fragility.** A ratio can't show how close the call is. In our default 6.5% scenario, no single ±1-point assumption change flips the verdict; at 4%, a ±1-point move in appreciation or the rate does.

## Run your own numbers

The ratio tells you whether your market smells cheap or expensive; the full model tells you what that means in dollars. The [rent-vs-buy calculator](/?price=420000&rent=2100&rate=6.5) is pre-loaded with the default scenario above — swap in your own price, rent, rate, and holding period, and it returns the verdict plus the tipping rent for your exact situation, taxes and selling costs included.