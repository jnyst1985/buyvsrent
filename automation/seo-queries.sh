#!/bin/zsh
# The optimize-or-create query loop, measurement half. NO LLM in this path.
#
# Adopted 2026-08-01 from the one piece of the r/Agentic_SEO scaled-blog AMA
# worth stealing: every query whose impressions are rising gets explicitly
# mapped to the page Google is showing for it, and the gap becomes the work
# queue - optimize the page if it serves the intent, queue a new page if
# nothing does. The INTENT judgment is the weekly Claude review's job
# (seo-review-prompt.md step 3c); this script only assembles the facts.
#
# Output: automation/metrics/queries-latest.json (full snapshot, overwritten
# per run - GSC retains history, so no append ledger needed) plus a compact
# table on stdout. Runs weekly from seo-weekly.sh; safe to run ad-hoc.
#
# Windows are 14 days, not 7: at current volume (tens of impressions) a 7-day
# window is mostly zeros and every comparison reads as noise.
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="${REPO:-$HOME/Documents/projects/buyvsrent}"
SITE="sc-domain:rentvsbuymath.com"
CREDS="$HOME/.config/gsc/service-account.json"
OUT="$REPO/automation/metrics"

[ -f "$CREDS" ] || { echo "FATAL: no GSC credentials at $CREDS" >&2; exit 1; }
export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"
mkdir -p "$OUT"

# GSC finalizes on a ~3-day lag (same constant as seo-metrics.sh).
LAG=3
END_CUR=$(date -v-${LAG}d +%Y-%m-%d)
START_CUR=$(date -v-$((LAG + 13))d +%Y-%m-%d)
END_PRI=$(date -v-$((LAG + 14))d +%Y-%m-%d)
START_PRI=$(date -v-$((LAG + 27))d +%Y-%m-%d)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Portable timeout via perl alarm (macOS has no timeout(1)); see seo-metrics.sh
# for the 2026-08-03 41-minute-hang incident this guards against.
to() { perl -e 'alarm shift; exec @ARGV' "$@"; }

q() { # q <start> <end> <dimension> <outfile>
  to 90 gsc analytics query --site "$SITE" --start "$1" --end "$2" \
    --dimension "$3" --limit 5000 > "$4" 2>/dev/null || echo '{}' > "$4"
}

q "$START_CUR" "$END_CUR" query        "$TMP/cur.json"
q "$START_PRI" "$END_PRI" query        "$TMP/pri.json"
q "$START_CUR" "$END_CUR" "query,page" "$TMP/qp.json"

# Page inventory from the live sitemap - the same source of truth the audit
# uses - so the analysis step can propose a BETTER-matching existing page than
# the one Google currently pairs with a query.
curl -s --max-time 20 "https://rentvsbuymath.com/sitemap-0.xml" > "$TMP/sitemap.xml" || true

TMP="$TMP" OUT="$OUT" START_CUR="$START_CUR" END_CUR="$END_CUR" \
START_PRI="$START_PRI" END_PRI="$END_PRI" python3 <<'PY'
import json, os, re, datetime

tmp, out = os.environ['TMP'], os.environ['OUT']

def rows(name):
    try:
        d = json.load(open(f'{tmp}/{name}.json'))
    except Exception:
        return []
    data = d.get('data') if isinstance(d, dict) else None
    if isinstance(data, dict):
        return data.get('rows') or []
    return data or (d.get('rows') if isinstance(d, dict) else None) or []

cur = {r['keys'][0]: r for r in rows('cur')}
pri = {r['keys'][0]: r for r in rows('pri')}

# query -> pages Google actually showed for it this window
pages_for = {}
for r in rows('qp'):
    qy, pg = r['keys'][0], r['keys'][1].replace('https://rentvsbuymath.com', '') or '/'
    pages_for.setdefault(qy, []).append(
        {'page': pg, 'impressions': r.get('impressions', 0),
         'position': round(r.get('position', 0), 1)})

sitemap = []
try:
    xml = open(f'{tmp}/sitemap.xml').read()
    sitemap = sorted(
        (re.sub(r'^https://rentvsbuymath\.com', '', u) or '/')
        for u in re.findall(r'<loc>([^<]+)</loc>', xml))
except Exception:
    pass

queries = []
for qy, r in cur.items():
    p = pri.get(qy, {})
    queries.append({
        'query': qy,
        'impressions': r.get('impressions', 0),
        'prior_impressions': p.get('impressions', 0),
        'clicks': r.get('clicks', 0),
        'position': round(r.get('position', 0), 1),
        'rising': r.get('impressions', 0) > p.get('impressions', 0),
        'new': qy not in pri,
        'pages': sorted(pages_for.get(qy, []),
                        key=lambda x: -x['impressions']),
    })
queries.sort(key=lambda x: (-x['rising'], -x['impressions']))

# Queries that vanished are signal too - a page that stopped surfacing.
lost = [{'query': qy, 'prior_impressions': p.get('impressions', 0)}
        for qy, p in pri.items() if qy not in cur]
lost.sort(key=lambda x: -x['prior_impressions'])

snap = {
    'generated': datetime.datetime.now().replace(microsecond=0).isoformat(),
    'window_current': [os.environ['START_CUR'], os.environ['END_CUR']],
    'window_prior': [os.environ['START_PRI'], os.environ['END_PRI']],
    'queries': queries,
    'lost_queries': lost,
    'sitemap_pages': sitemap,
}
with open(f'{out}/queries-latest.json', 'w') as f:
    json.dump(snap, f, indent=1)

rising = [x for x in queries if x['rising']]
print(f"windows {snap['window_current'][0]}..{snap['window_current'][1]} vs prior  |  "
      f"{len(queries)} queries ({len(rising)} rising, {len(lost)} lost)  |  "
      f"sitemap {len(sitemap)} pages")
for x in queries[:12]:
    tag = 'NEW ' if x['new'] else ('UP  ' if x['rising'] else '    ')
    pg = x['pages'][0]['page'] if x['pages'] else '?'
    print(f"  {tag}{x['impressions']:>3} (was {x['prior_impressions']:>3})  "
          f"pos {x['position']:>5}  {x['query']}  ->  {pg}")
PY
