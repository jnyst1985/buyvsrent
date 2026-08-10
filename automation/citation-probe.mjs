// Citation probe: does an AI answer engine cite rentvsbuymath.com for the
// queries we care about? Deterministic measurement layer - no LLM judges the
// outcome; a citation either contains our domain or it does not.
//
// Adopted 2026-08-11 from the citeworthyio/seo-agent pattern: for AI engines
// the outcome metric is citations, not rank. Their caveat inherited verbatim:
// engine APIs are a proxy for the consumer apps (different retrieval stacks),
// so TRACK DELTAS ACROSS WEEKS, never read absolutes into a single run. An
// answer's citations also vary run to run - one week's flip is noise, a
// month's trend is signal. Expect cited=0 for weeks at first; that is the
// baseline, not a failure.
//
// Engine: Perplexity `sonar` (~10 calls/week, ~$1-2/month). API key resolution
// order, never printed, never copied elsewhere:
//   1. PERPLEXITY_API_KEY in the environment
//   2. ~/.config/perplexity/rentvsbuymath.env   (KEY=VALUE, chmod 600)
//   3. ~/.claude.json -> mcpServers.perplexity.env.PERPLEXITY_API_KEY
//
// Usage: node citation-probe.mjs [--force]
// Appends one row per run date to automation/metrics/citations.jsonl
// (idempotent per date unless --force). Prints a short summary to stdout.
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, 'metrics', 'citations.jsonl');
const QUERIES_FILE = join(HERE, 'citation-queries.txt');
const DOMAIN = 'rentvsbuymath.com';
const TODAY = new Date().toISOString().slice(0, 10);
const FORCE = process.argv.includes('--force');

// --- idempotency ------------------------------------------------------------
if (!FORCE && existsSync(LEDGER)) {
  const dates = readFileSync(LEDGER, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l).date;
      } catch {
        return null;
      }
    });
  if (dates.includes(TODAY)) {
    console.log(`citations: row for ${TODAY} already exists, skipping (--force to re-run)`);
    process.exit(0);
  }
}

// --- key resolution ---------------------------------------------------------
let key = process.env.PERPLEXITY_API_KEY || '';
if (!key) {
  const envFile = `${process.env.HOME}/.config/perplexity/rentvsbuymath.env`;
  if (existsSync(envFile)) key = (readFileSync(envFile, 'utf8').match(/PERPLEXITY_API_KEY=(.+)/) ?? [])[1]?.trim() ?? '';
}
if (!key) {
  try {
    key = JSON.parse(readFileSync(`${process.env.HOME}/.claude.json`, 'utf8')).mcpServers?.perplexity?.env?.PERPLEXITY_API_KEY ?? '';
  } catch {
    /* fall through */
  }
}
if (!key) {
  console.log('citations: no Perplexity API key found, skipping (not an error)');
  process.exit(0);
}

// --- probe ------------------------------------------------------------------
const queries = readFileSync(QUERIES_FILE, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const results = [];
for (const query of queries) {
  let row = { query, cited: false, rank: null, cited_url: null, n_citations: 0 };
  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: query }] }),
      signal: AbortSignal.timeout(60_000),
    });
    const data = await res.json();
    if (!res.ok) {
      row.error = `http ${res.status}: ${JSON.stringify(data).slice(0, 120)}`;
    } else {
      // Older responses carry `citations` (array of URL strings); newer ones
      // carry `search_results` ([{title,url,date}]). Read whichever exists.
      const urls = Array.isArray(data.citations) && data.citations.length
        ? data.citations
        : (data.search_results ?? []).map((r) => r.url);
      row.n_citations = urls.length;
      const hit = urls.findIndex((u) => typeof u === 'string' && u.includes(DOMAIN));
      if (hit >= 0) {
        row.cited = true;
        row.rank = hit + 1;
        row.cited_url = urls[hit];
      }
    }
  } catch (e) {
    row.error = String(e.message ?? e).slice(0, 120);
  }
  results.push(row);
}

const cited = results.filter((r) => r.cited);
const errored = results.filter((r) => r.error);
const record = {
  date: TODAY,
  engine: 'perplexity/sonar',
  domain: DOMAIN,
  cited_count: cited.length,
  query_count: results.length,
  error_count: errored.length,
  results,
};
appendFileSync(LEDGER, JSON.stringify(record) + '\n');

console.log(
  `citations [${TODAY}]: ${cited.length}/${results.length} queries cite ${DOMAIN}` +
    (cited.length ? ' - ' + cited.map((r) => `"${r.query}" (rank ${r.rank})`).join(', ') : '') +
    (errored.length ? ` | ${errored.length} errored` : '')
);
