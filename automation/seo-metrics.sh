#!/bin/zsh
# Deterministic SEO measurement. NO LLM in this path, by design.
#
# Why this exists as its own script. seo-weekly.sh used to do measurement and
# analysis in one `claude -p` call. On 2026-07-27 that call died with
# "error: An internal error occurred (EINTR)" and the week's numbers were lost
# outright - reports/ was empty, seo-weekly.last was 1 byte, and Telegram still
# got a "success" message. A measurement step that can be destroyed by a model
# invocation is not a measurement step.
#
# So: this script collects the numbers mechanically and appends them to a
# durable ledger. It runs BEFORE and INDEPENDENTLY of any analysis. If the
# analysis later fails, the numbers are already on disk.
#
#   metrics/daily.jsonl   one row per calendar date - the trend line
#   metrics/checks.jsonl  one row per run - indexation + windowed aggregates
#
# Both are append-only and idempotent per key, so re-running is always safe.
#
# Usage:
#   seo-metrics.sh              collect one check (daily series + indexation)
#   seo-metrics.sh --backfill   pull all available GSC history into daily.jsonl
#   seo-metrics.sh --no-index   skip URL inspection (saves 17 quota units)
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="${REPO:-$HOME/Documents/projects/buyvsrent}"
SITE="sc-domain:rentvsbuymath.com"
CREDS="$HOME/.config/gsc/service-account.json"
OUT="$REPO/automation/metrics"

[ -f "$CREDS" ] || { echo "FATAL: no GSC credentials at $CREDS" >&2; exit 1; }
export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"
mkdir -p "$OUT"

BACKFILL=0
DO_INDEX=1
for a in "$@"; do
  [ "$a" = "--backfill" ] && BACKFILL=1
  [ "$a" = "--no-index" ] && DO_INDEX=0
done

# GSC finalizes search analytics on roughly a 3-day lag. Anything newer is
# provisional and will move under you, so the ledger never treats it as final.
LAG=3
END=$(date -v-${LAG}d +%Y-%m-%d)
START_28=$(date -v-$((LAG + 27))d +%Y-%m-%d)
START_7=$(date -v-$((LAG + 6))d +%Y-%m-%d)
START_ALL=$(date -v-180d +%Y-%m-%d)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

q() { # q <start> <end> <dimension> <outfile>
  gsc analytics query --site "$SITE" --start "$1" --end "$2" \
    --dimension "$3" --limit 5000 > "$4" 2>"$TMP/err" || echo '{}' > "$4"
}

if [ "$BACKFILL" = "1" ]; then
  q "$START_ALL" "$END" date "$TMP/daily.json"
else
  q "$START_28" "$END" date "$TMP/daily.json"
fi
q "$START_28" "$END" query "$TMP/q28.json"
q "$START_28" "$END" page  "$TMP/p28.json"
q "$START_7"  "$END" date  "$TMP/d7.json"

# Freddie Mac PMMS 30-year fixed, via FRED's no-auth CSV (series MORTGAGE30US;
# verified identical to Freddie's own PMMS_history.csv). Weekly prints, so the
# daily run mostly re-reads the same value - cheap, and it means the ledger
# notices a new print within a day. Failure leaves the file empty and the
# fields null; it must never take the GSC measurement down with it.
curl -s --max-time 20 "https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US" \
  | tail -8 > "$TMP/pmms.csv" || true

# The drift band is the model default +/- 0.5, read from the engine so a future
# default bump moves the band automatically instead of leaving a stale 6.5 here.
MODEL_RATE=$(grep -oE 'mortgageRatePct: [0-9.]+' "$REPO/src/lib/engine/defaults.ts" | grep -oE '[0-9.]+' || echo "")

if [ "$DO_INDEX" = "1" ]; then
  # `gsc inspect --sitemap` exits 2 whenever ANY URL is not indexed - which is
  # the normal state we are here to measure, not an error. Discarding stdout on
  # a non-zero exit threw the whole indexation reading away. Judge the payload,
  # not the exit code; the python side already tolerates a malformed file.
  gsc inspect --site "$SITE" --sitemap --concurrency 3 > "$TMP/index.json" 2>/dev/null
  head -c 1 "$TMP/index.json" | grep -q '{' || echo '{}' > "$TMP/index.json"
else
  echo '{}' > "$TMP/index.json"
fi

TMP="$TMP" OUT="$OUT" END="$END" BACKFILL="$BACKFILL" MODEL_RATE="$MODEL_RATE" python3 <<'PY'
import json, os, datetime

tmp, out = os.environ['TMP'], os.environ['OUT']
end, backfill = os.environ['END'], os.environ['BACKFILL'] == '1'

def rows(name):
    try:
        d = json.load(open(f'{tmp}/{name}.json'))
    except Exception:
        return []
    if not isinstance(d, dict):
        return []
    data = d.get('data')
    if isinstance(data, dict):
        return data.get('rows') or data.get('results') or []
    return data or d.get('rows') or []

def agg(rs):
    c = sum(r.get('clicks', 0) for r in rs)
    i = sum(r.get('impressions', 0) for r in rs)
    # Position must be impression-weighted; averaging the per-row averages is
    # the classic way to report a number that is quietly wrong.
    pos = round(sum(r.get('position', 0) * r.get('impressions', 0) for r in rs) / i, 2) if i else None
    return c, i, round(c / i, 4) if i else 0.0, pos

# ---- daily series (idempotent per date) ----
daily_path = f'{out}/daily.jsonl'
existing = {}
if os.path.exists(daily_path):
    for line in open(daily_path):
        line = line.strip()
        if line:
            try:
                r = json.loads(line)
                existing[r['date']] = r
            except Exception:
                pass

added = 0
for r in rows('daily'):
    d = r['keys'][0]
    rec = {'date': d, 'clicks': r.get('clicks', 0), 'impressions': r.get('impressions', 0),
           'ctr': round(r.get('ctr', 0), 4), 'position': round(r.get('position', 0), 2)}
    if existing.get(d) != rec:
        added += 1
    existing[d] = rec

with open(daily_path, 'w') as f:
    for d in sorted(existing):
        f.write(json.dumps(existing[d]) + '\n')

# ---- indexation ----
idx = {}
try:
    data = json.load(open(f'{tmp}/index.json')).get('data', {})
    summ, res = data.get('summary', {}), data.get('results', [])
    idx = {
        'indexed': summ.get('indexed'),
        'total': summ.get('total'),
        'not_indexed': sorted(
            r['url'].replace('https://rentvsbuymath.com', '') or '/'
            for r in res if not r.get('indexed')
        ),
    }
except Exception:
    idx = {'indexed': None, 'total': None, 'not_indexed': []}

c7, i7, ctr7, pos7 = agg(rows('d7'))

# 28d aggregates come from the date series restricted to the 28d window - the
# raw `daily` rows can span 180 days in --backfill mode, so it must be sliced.
w28_start = (datetime.date.fromisoformat(end) - datetime.timedelta(days=27)).isoformat()
c28, i28, ctr28, pos28 = agg([r for r in rows('daily') if r['keys'][0] >= w28_start])

# ---- PMMS 30-year fixed vs the model default ----
# Status ladder: 'ok' inside the band; 'watch' when the LATEST print is outside
# model default +/- 0.5; 'drift' when the last FOUR weekly prints are all
# outside - the sustained condition that makes a default bump worth its cost
# (URL version bump + every guarded figure re-typed; see DEVELOPMENT.md).
pmms = []
try:
    for line in open(f'{tmp}/pmms.csv'):
        parts = line.strip().split(',')
        if len(parts) == 2 and parts[1] not in ('.', '', 'MORTGAGE30US'):
            try:
                pmms.append((parts[0], float(parts[1])))
            except ValueError:
                pass
except Exception:
    pass

model_rate = float(os.environ['MODEL_RATE']) if os.environ.get('MODEL_RATE') else None
pmms_date, pmms_rate, pmms_status = None, None, 'unavailable'
if pmms and model_rate is not None:
    pmms_date, pmms_rate = pmms[-1]
    lo, hi = model_rate - 0.5, model_rate + 0.5
    outside = [r for _, r in pmms[-4:] if not (lo <= r <= hi)]
    if len(pmms) >= 4 and len(outside) == 4:
        pmms_status = 'drift'
    elif not (lo <= pmms_rate <= hi):
        pmms_status = 'watch'
    else:
        pmms_status = 'ok'

check = {
    'ts': datetime.datetime.now().replace(microsecond=0).isoformat(),
    'window_end': end,
    'pmms_30y': pmms_rate, 'pmms_date': pmms_date, 'pmms_status': pmms_status,
    'model_rate': model_rate,
    'indexed_pages': idx['indexed'],
    'total_pages': idx['total'],
    'not_indexed': idx['not_indexed'],
    'clicks_28d': c28, 'impressions_28d': i28, 'ctr_28d': ctr28, 'position_28d': pos28,
    'clicks_7d': c7, 'impressions_7d': i7, 'ctr_7d': ctr7, 'position_7d': pos7,
    'distinct_queries_28d': len(rows('q28')),
    'pages_with_impressions_28d': len(rows('p28')),
}
with open(f'{out}/checks.jsonl', 'a') as f:
    f.write(json.dumps(check) + '\n')

ix = f"{idx['indexed']}/{idx['total']}" if idx['indexed'] is not None else 'skipped'
pm = f"PMMS {pmms_rate}% ({pmms_date}, model {model_rate}%)" if pmms_rate else 'PMMS unavailable'
print(f"measured through {end}  |  indexed {ix}  |  "
      f"28d: {c28} clicks, {i28} impr, pos {pos28}  |  "
      f"7d: {c7} clicks, {i7} impr  |  {pm}  |  daily rows {'backfilled' if backfill else 'updated'}: {len(existing)}")
if idx['not_indexed']:
    print('not indexed: ' + ', '.join(idx['not_indexed']))
if pmms_status == 'watch':
    print(f"PMMS WATCH: latest print {pmms_rate}% is outside the model band {model_rate}+/-0.5 - not yet sustained, no action.")
elif pmms_status == 'drift':
    print(f"PMMS DRIFT: last 4 weekly prints all outside {model_rate}+/-0.5. A default-rate bump is now worth considering - it is a versioned operation (URL version + guarded figures), see DEVELOPMENT.md.")
PY
