You are running the scheduled weekly SEO review for https://rentvsbuymath.com (repo: ~/Documents/projects/buyvsrent, a static Astro site on Cloudflare Workers). Work autonomously; nobody is watching. Your job is analysis and reporting — do NOT modify site code, do NOT deploy, do NOT git push, do NOT change DNS.

Track split (since 2026-08-04): this Monday review owns the SEARCH track — queries, indexation, titles/meta, content, internal links. A separate Thursday review (automation/behavior-review-prompt.md) owns the PRODUCT track — UX, interaction, GA4 product events, Clarity signals. Do not spend a recommendation slot on product/UX changes here; if the data points at one, note it in a single line as "queue for Thursday review" and keep your three recommendations search-facing.

Steps:

1. Auth check: if the env var GOOGLE_APPLICATION_CREDENTIALS is unset or the file it points to does not exist, write the report (step 4) with a single section saying GSC auth is not configured yet and that the service-account setup steps are in the launch runbook, then stop.

2. Search Console data (the `gsc` CLI is installed; use `--site "sc-domain:rentvsbuymath.com"` and JSON output):
   - `gsc sitemaps list` — sitemap status, last read, discovered pages.
   - Search analytics for the last 7 full days vs the prior 7: totals for clicks, impressions, CTR, average position; top 10 queries and top 10 pages by impressions with their CTR and position.
   - If any command errors, record the error verbatim and continue.

3. Site health (plain curl): homepage returns 200 with the expected <title>; https://rentvsbuymath.com/sitemap-index.xml returns 200; https://www.rentvsbuymath.com/ returns a 301 to the apex.

3a. Mortgage-rate context: read the last line of automation/metrics/checks.jsonl (fields pmms_30y, pmms_date, pmms_status, model_rate — written mechanically before you were invoked; do NOT fetch rate data yourself). If pmms_status is "ok", one clause in the summary suffices. If "watch" or "drift", say so explicitly in the report: "watch" = latest Freddie Mac print outside the model default ±0.5, no action; "drift" = 4+ consecutive weekly prints outside the band, which is the trigger to consider bumping the calculator's default rate (a versioned operation — flag it as a decision for Jon, never do it). Rate context also informs recommendations: rising rates make the site's renting-favorable content MORE current, not stale.

3b-known-noise: Clarity script errors mentioning `window.webkit.messageHandlers` are NOT site defects — verified 2026-08-04: our shipped JS contains zero references to that API (it is the iOS WKWebView native bridge), and the errors come from scripts that in-app browsers (Threads/Instagram/Facebook) inject into the page; Clarity attributes them to the session anyway. Expect them whenever social referral traffic spikes. Do not spend a recommendation slot on them. Script errors with ANY OTHER signature remain reportable — say what the signature is if the data shows one.

3b. Behavior signals from Microsoft Clarity: read automation/logs/clarity-latest.json — the wrapper already fetched a rolling 3-day snapshot before invoking you. Do NOT call the Clarity API yourself (it is hard-capped at 10 calls/project/day). If the file is missing, empty, or every metric reads zero, note that traffic is still too low for behavioral signal and move on. Otherwise summarize the usability flags that matter: dead clicks, rage clicks, quickback clicks, excessive scroll, script errors, average scroll depth, total vs bot sessions — and call out anything pointing at a UX problem (e.g. rage clicks on a slider, shallow homepage scroll depth).

3c. The optimize-or-create loop: read automation/metrics/queries-latest.json (written mechanically before you were invoked — do NOT re-query GSC for this). For each query marked "rising": judge whether the page Google pairs it with actually serves the query's intent. Three verdicts, and name one per rising query in the report:
   - SERVED — the paired page is the right answer for the query. No action.
   - OPTIMIZE — a page in sitemap_pages serves the intent better than the paired page, or the paired page serves it but weakly (e.g. the homepage catching a query a dedicated page should own). Name the better page. If the better page is one of the not-indexed ones, say the blocker is indexation, not content.
   - CREATE — nothing in sitemap_pages serves the intent. Say which strategy cluster it belongs to (or "new cluster" if none fits).
   Note "lost_queries" briefly if any prior-window query vanished. CONSTRAINT: your output here is analysis only — content and site changes are moves that get logged in automation/metrics/moves.jsonl with predictions, and observation windows may be open; check moves.jsonl before recommending immediate action, and prefer "queue for after review of <move id>" phrasing when a window is open.

3d. AI citations: read the last 2 rows of automation/metrics/citations.jsonl (written mechanically before you were invoked - do NOT call the Perplexity API yourself). Each row is one weekly probe: per query, did Perplexity cite rentvsbuymath.com, at what rank. Report cited_count and any per-query CHANGES vs the prior row (gained/lost citations). Rules of reading: deltas across weeks are signal, single-run flips and absolute counts are noise (engine APIs are a proxy for the consumer apps, and answers vary run to run); a long streak of 0/10 while the site is young is the expected baseline, not a finding. If the file is missing or has one row, say the baseline is still forming and move on.

4. Write a markdown report to reports/seo-YYYY-MM-DD.md (create reports/ if missing, use today's date). Structure: a 3-line executive summary; week-over-week trend table; top queries/pages; a short Behavior (Clarity) section from step 3b; anomalies or errors; then EXACTLY three concrete, prioritized recommendations (a Clarity signal is fair game — e.g. "rage clicks on the rate slider → investigate") (examples of the right kind: rewrite a title/meta for a high-impression low-CTR page, a content gap revealed by query data, an internal-linking improvement, a page worth adding). Recommendations must cite the data that motivates them. Keep the whole report under 120 lines.

5. Print to stdout only a 2–3 line plain-text summary of the week (it feeds a desktop notification).

If there is simply no data yet (site too new), say so plainly in the report — do not pad. Never invent numbers.
