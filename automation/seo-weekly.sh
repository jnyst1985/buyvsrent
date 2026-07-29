#!/bin/zsh
# Weekly SEO review: measure mechanically, THEN analyse. Report into reports/,
# Telegram + desktop notification.
# Installed as LaunchAgent com.rentvsbuymath.seo-weekly (Mondays 09:23; runs on wake if missed).
#
# 2026-07-29 restructure. The previous version put `claude -p` in the critical
# path of measurement: it fetched, analysed and reported in one call. On
# 2026-07-27 that call died with "An internal error occurred (EINTR)", so the
# week produced no report, no numbers, and a 1-byte seo-weekly.last - while
# Telegram still received a message that read like a success. Two rules now:
#
#   1. Numbers are collected by seo-metrics.sh, which uses no model at all, and
#      are on disk before Claude is invoked. A model failure can no longer
#      destroy a measurement.
#   2. A failed analysis reports itself AS a failure. It never silently degrades
#      into a cheerful-looking empty message.
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="$HOME/Documents/projects/buyvsrent"
CREDS="$HOME/.config/gsc/service-account.json"
[ -f "$CREDS" ] && export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"

cd "$REPO" || exit 1
mkdir -p reports automation/logs automation/metrics

# --- 1. Measurement. Deterministic, no model. Must succeed on its own. -------
METRICS=$(zsh automation/seo-metrics.sh 2>automation/logs/seo-metrics.err)
METRICS_RC=$?
[ -n "$METRICS" ] || METRICS="(measurement failed - see automation/logs/seo-metrics.err)"

# One Clarity call/week (cap is 10/day) - a rolling 3-day behavior snapshot
# for the review to fold in. File is absent/empty if creds or API are down.
zsh automation/clarity-insights.sh 3 > automation/logs/clarity-latest.json 2>/dev/null || true

# --- 2. Analysis. Allowed to fail without taking the numbers down with it. ---
SUMMARY=""
for attempt in 1 2; do
  SUMMARY=$(claude -p "$(cat automation/seo-review-prompt.md)" \
    --model sonnet \
    --allowedTools "Bash" "Read" "Write" "Glob" "Grep" \
    2>>automation/logs/seo-weekly.err)
  [ -n "$SUMMARY" ] && break
  echo "attempt $attempt produced no output, retrying" >> automation/logs/seo-weekly.err
  sleep 20
done

if [ -n "$SUMMARY" ]; then
  BODY="📊 SEO weekly — rentvsbuymath.com

$METRICS

$SUMMARY"
else
  BODY="⚠️ SEO weekly — rentvsbuymath.com
ANALYSIS FAILED (measurement is fine and is on disk).

$METRICS

Last error: $(tail -3 automation/logs/seo-weekly.err 2>/dev/null | tr '\n' ' ')"
fi

echo "$BODY" > automation/logs/seo-weekly.last
zsh automation/telegram-send.sh "$BODY"
/usr/bin/osascript -e "display notification \"${METRICS//\"/'}\" with title \"SEO weekly: rentvsbuymath.com\"" 2>/dev/null || true
