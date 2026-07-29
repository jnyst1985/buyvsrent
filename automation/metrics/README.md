# The SEO metrics ledger

Three append-only files. Everything here is written by `automation/seo-metrics.sh`,
which uses **no model** — except `moves.jsonl`, which is written by whoever makes
the move.

| File | One row per | Written by |
| --- | --- | --- |
| `daily.jsonl` | calendar date | `seo-metrics.sh` (idempotent per date) |
| `checks.jsonl` | measurement run | `seo-metrics.sh` (append) |
| `moves.jsonl` | change made to the site | by hand, at the time of the change |

## Why measurement is separate from analysis

`seo-weekly.sh` used to do both in one `claude -p` call. On 2026-07-27 that call
died with `EINTR`; the week produced no report and **no numbers at all**, and
Telegram still got a message that read like success. The numbers are now
collected before any model runs, so an analysis failure costs you an analysis,
not a week of data.

The same principle applies to the loop generally: **the thing being measured is
never reported by the thing being judged.** `seo-metrics.sh` reads Search
Console directly; an agent reviewing performance reads this ledger.

## The loop

1. **Measure.** `zsh automation/seo-metrics.sh` — appends to `checks.jsonl`,
   updates `daily.jsonl`.
2. **Score open moves.** Any row in `moves.jsonl` whose `review_on` has passed
   gets judged against its `predicted_effect`, and `status` / `outcome` filled
   in. A move that missed is as useful as one that hit — it is what redirects
   the next phase.
3. **Make at most ONE new move**, and log it with a falsifiable
   `predicted_effect`, a `metric`, a `baseline`, a `target`, and a
   `review_on` date.
4. **Honest no-ops are correct.** If every open move is still inside its
   observation window, the right action is to record the measurement and stop.
   Do not stack a second change on top of one you cannot yet judge — you lose
   the ability to attribute either.

## The metric ladder

Clicks were **0** and GA4 had **no history** when this ledger was created, so
neither could be the goal metric — you cannot run a percentage loop on a
baseline of zero. Climb it instead, promoting the goal metric only once the next
rung is non-zero and reproducible:

| Rung | Baseline at 2026-07-29 | Source |
| --- | --- | --- |
| Indexed pages | 12 / 17 | `gsc inspect --sitemap` |
| Impressions (28d) | 57 | `gsc analytics query` |
| Clicks (28d) | 0 | — not yet a usable goal |
| Engaged sessions | no history (GA4 live 2026-07-29) | earliest honest baseline ~2026-08-26 |

## Reading the ledger

```sh
# the trend
python3 -c "import json;[print(json.loads(l)['date'], json.loads(l)['impressions']) for l in open('automation/metrics/daily.jsonl')]"

# what is still unindexed, most recent check
tail -1 automation/metrics/checks.jsonl | python3 -m json.tool

# moves due for review
python3 -c "
import json,datetime
today=datetime.date.today().isoformat()
for l in open('automation/metrics/moves.jsonl'):
    m=json.loads(l)
    if m['status']=='open' and m['review_on']<=today: print(m['id'], m['metric'], m['baseline'],'->',m['target'])"
```
