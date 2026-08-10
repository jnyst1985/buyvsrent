# Show HN — corrected repost, ready to go

Status: first attempt 2026-08-04 (item 49168957) was auto-killed by the
new-account filter - not a human judgment, account comments unaffected.
Mod email sent same day; WAITING on hn@ycombinator.com reply. If they
restore/re-up the original, this file is moot. If they say "feel free to
repost", use exactly what is below.

Timing: weekday morning US-East (~9-11am ET). Be available for the first
2-3 hours - fast author replies are half of what keeps a Show HN alive.

## Title (76 chars - HN limit is 80; the original was 86)

Show HN: Free NYT-style rent-vs-buy calculator, methodology fully documented

## URL

https://rentvsbuymath.com

## Text

The NYT's rent-vs-buy calculator is the gold standard, but it's paywalled — and most free alternatives are lender lead-gen that compares a mortgage payment to rent and quietly hands buying the win.

I rebuilt the honest version: both paths simulated monthly, opportunity cost modeled symmetrically (whichever side is cheaper that month invests the difference — including the buyer's surplus after payoff), 2026 US tax rules (standard-vs-itemized delta, $750k interest cap, SALT cap, Section 121), PMI with automatic termination, full transaction costs.

Every formula is documented at /methodology, the suite passes 112 automated tests including 10 scenario vectors derived by hand independently of the code, and every scenario is a shareable URL.

Assumptions I'd most like challenged: 7% nominal total return, 3% home appreciation, and the PMI termination convention. What am I still getting wrong?

## Changes vs the killed original (and why)

1. "37 tests" -> "107 automated tests". The site publishes TEST_COUNT=112 (as of 2026-08-11)
   in five places, all guarded by site-facts.test.ts; the HN post is a
   publisher that guard cannot reach, and a reader comparing the post to
   /methodology must not find two different numbers in the exact spot we
   claim rigor. (37 was the engine-core subset: engine 17 + vectors 10 +
   mega-fit 10 - accurate but inconsistent with the published figure.)
2. Title cut 86 -> 76 chars to fit HN's 80 limit without clipping.
3. One paragraph split into four - HN preserves blank lines; the closing
   ask stands alone so it reads as the invitation it is.
4. Em dashes are Jonathan's own voice in the original text - kept.

## When it goes live

- Log it in automation/metrics/moves.jsonl as an informational traffic
  event (d1 precedent) so the a1/b2 windows can attribute the spike.
- Watch the GA4 funnel: HN sessions -> calc_engaged -> verdict_flip ->
  share_copy. First real volume through the m1 events.
- Expect Clarity webkit.messageHandlers noise if mobile in-app browsers
  arrive via social reshares - known noise, already in the review prompt.
