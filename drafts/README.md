# Drafts

Content written ahead of its ship date, kept **outside** `src/content/guides/` so it
cannot ship by accident — the content collection only globs that directory. The HTML
comment atop each draft sits *before* the frontmatter on purpose: a naive move into
the collection fails the build loudly instead of silently shipping the comment.

**Why these exist:** two ledger moves are inside their observation windows
(`automation/metrics/moves.jsonl` — a1 reviews 2026-08-19, b2 reviews 2026-08-27).
Shipping content now would confound both. Drafting is not a move; shipping is.

## Ship checklist (per guide, one at a time — one move per check)

1. Wait for the relevant review to land. If the prior move missed, reconsider the
   plan before shipping — a miss is information, not a delay.
2. Move the file to `src/content/guides/`, **delete the draft comment**, set
   `pubDate` to the ship date.
3. Add the guide to `public/llms.txt` under Guides.
4. Wire the figure guards (`src/lib/engine/published-figures.test.ts`):
   - `is-renting-throwing-money-away.md` → add to `PUBLISHERS` with
     `rents: ['6.5']`, `pcts: ['6.5']`.
   - `does-buying-a-house-build-wealth.md` → add to `PUBLISHERS` with
     `pcts: ['6.5']`; quotes the ratio-24 gap (already in `PUBLISHED_MATRIX`)
     **and the ratio-10 cell (Buy +$189k at 6.5%) which is NOT yet guarded — add
     `{ ratio: 10, rate: 6.5, gap: '$189,000', rentWins: false }` and the file to
     `MATRIX_QUOTERS`.**
5. `npm test` — the suite count will change (site-facts is self-referential):
   bump `TEST_COUNT` in `src/lib/site.ts` and the five publisher files.
6. `npm run build`, `npm run audit` (needs preview + PW_CORE/CHROME, see
   DEVELOPMENT.md), then `npx wrangler deploy`. Check `.env` exists first.
7. Log ONE move in `automation/metrics/moves.jsonl`: metric, baseline from the
   latest `checks.jsonl` row, target, `review_on` ~28 days out.
8. Ship the second guide only after the first move's review — or log them as one
   move if shipped together, and say so.

Both guides land in **Myths**, taking the category to 3 — which turns its pill on
in `/guides` by itself (`CATEGORY_PILL_THRESHOLD`).
