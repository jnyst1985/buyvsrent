#!/bin/zsh
# Thursday behavior review: product-track analysis on same-day data (GA4
# events + Clarity), complementing the Monday SEO review which reads lagged
# Search Console data. Installed as LaunchAgent com.rentvsbuymath.behavior-review
# (Thursdays 09:23; runs on wake if missed).
#
# Same two rules as seo-weekly.sh, for the same 2026-07-27 reason:
#   1. Measurement is deterministic and on disk BEFORE any model is invoked.
#   2. A failed analysis reports itself AS a failure, never as a quiet success.
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="$HOME/Documents/projects/buyvsrent"
CREDS="$HOME/.config/gsc/service-account.json"
[ -f "$CREDS" ] && export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"

cd "$REPO" || exit 1
mkdir -p reports automation/logs automation/metrics

to() { perl -e 'alarm shift; exec @ARGV' "$@"; }

# --- 1. Measurement. Deterministic, no model. --------------------------------
# GA4 7-day pull for the review's summary window. The daily 09:15 job already
# keeps ga4-daily.jsonl current; this just guarantees today's row exists even
# if that run failed, then captures a 7-day rollup for the prompt to read.
GA4=$(to 90 node automation/ga4-pull.mjs 7 2>>automation/logs/behavior-review.err) || GA4='{"status":"error"}'
echo "$GA4" > automation/logs/ga4-7d-latest.json

# One Clarity call (cap is 10/day; Monday uses one too - budget is fine).
zsh automation/clarity-insights.sh 3 > automation/logs/clarity-latest.json 2>/dev/null || true

# --- 2. Analysis. Allowed to fail without taking the numbers down. -----------
SUMMARY=""
for attempt in 1 2; do
  SUMMARY=$(claude -p "$(cat automation/behavior-review-prompt.md)" \
    --model sonnet \
    --allowedTools "Bash" "Read" "Write" "Glob" "Grep" \
    2>>automation/logs/behavior-review.err)
  [ -n "$SUMMARY" ] && break
  echo "attempt $attempt produced no output, retrying" >> automation/logs/behavior-review.err
  sleep 20
done

GA4_LINE=$(echo "$GA4" | python3 -c "
import json,sys
try: r=json.load(sys.stdin)
except Exception: r={'status':'unreadable'}
if r.get('status')=='ok':
    ev=r.get('events') or {}
    print(f\"7d: {r.get('sessions')} sessions, {r.get('engaged_sessions')} engaged | \" + (', '.join(f'{k}={v}' for k,v in sorted(ev.items()) if k in ('calc_engaged','calc_input','verdict_flip','share_copy')) or 'no custom events yet'))
else:
    print(f\"GA4 pull: {r.get('status')} - {str(r.get('error',''))[:100]}\")
")

if [ -n "$SUMMARY" ]; then
  BODY="🎛 Behavior review (Thu) — rentvsbuymath.com

$GA4_LINE

$SUMMARY"
else
  BODY="⚠️ Behavior review (Thu) — rentvsbuymath.com
ANALYSIS FAILED (measurement is fine and is on disk).

$GA4_LINE

Last error: $(tail -3 automation/logs/behavior-review.err 2>/dev/null | tr '\n' ' ')"
fi

echo "$BODY" > automation/logs/behavior-review.last
zsh automation/telegram-send.sh "$BODY"
/usr/bin/osascript -e "display notification \"${GA4_LINE//\"/'}\" with title \"Behavior review: rentvsbuymath.com\"" 2>/dev/null || true
