You are running the scheduled weekly SEO review for https://rentvsbuymath.com (repo: ~/Documents/projects/buyvsrent, a static Astro site on Cloudflare Workers). Work autonomously; nobody is watching. Your job is analysis and reporting — do NOT modify site code, do NOT deploy, do NOT git push, do NOT change DNS.

Steps:

1. Auth check: if the env var GOOGLE_APPLICATION_CREDENTIALS is unset or the file it points to does not exist, write the report (step 4) with a single section saying GSC auth is not configured yet and that the service-account setup steps are in the launch runbook, then stop.

2. Search Console data (the `gsc` CLI is installed; use `--site "sc-domain:rentvsbuymath.com"` and JSON output):
   - `gsc sitemaps list` — sitemap status, last read, discovered pages.
   - Search analytics for the last 7 full days vs the prior 7: totals for clicks, impressions, CTR, average position; top 10 queries and top 10 pages by impressions with their CTR and position.
   - If any command errors, record the error verbatim and continue.

3. Site health (plain curl): homepage returns 200 with the expected <title>; https://rentvsbuymath.com/sitemap-index.xml returns 200; https://www.rentvsbuymath.com/ returns a 301 to the apex.

3b. Behavior signals from Microsoft Clarity: read automation/logs/clarity-latest.json — the wrapper already fetched a rolling 3-day snapshot before invoking you. Do NOT call the Clarity API yourself (it is hard-capped at 10 calls/project/day). If the file is missing, empty, or every metric reads zero, note that traffic is still too low for behavioral signal and move on. Otherwise summarize the usability flags that matter: dead clicks, rage clicks, quickback clicks, excessive scroll, script errors, average scroll depth, total vs bot sessions — and call out anything pointing at a UX problem (e.g. rage clicks on a slider, shallow homepage scroll depth).

4. Write a markdown report to reports/seo-YYYY-MM-DD.md (create reports/ if missing, use today's date). Structure: a 3-line executive summary; week-over-week trend table; top queries/pages; a short Behavior (Clarity) section from step 3b; anomalies or errors; then EXACTLY three concrete, prioritized recommendations (a Clarity signal is fair game — e.g. "rage clicks on the rate slider → investigate") (examples of the right kind: rewrite a title/meta for a high-impression low-CTR page, a content gap revealed by query data, an internal-linking improvement, a page worth adding). Recommendations must cite the data that motivates them. Keep the whole report under 120 lines.

5. Print to stdout only a 2–3 line plain-text summary of the week (it feeds a desktop notification).

If there is simply no data yet (site too new), say so plainly in the report — do not pad. Never invent numbers.
