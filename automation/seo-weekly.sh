#!/bin/zsh
# Weekly SEO review: headless Claude session, report into reports/, desktop notification.
# Installed as LaunchAgent com.rentvsbuymath.seo-weekly (Mondays 09:23; runs on wake if missed).
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="$HOME/Documents/projects/buyvsrent"
CREDS="$HOME/.config/gsc/service-account.json"
[ -f "$CREDS" ] && export GOOGLE_APPLICATION_CREDENTIALS="$CREDS"

cd "$REPO" || exit 1
mkdir -p reports automation/logs

# One Clarity call/week (cap is 10/day) — a rolling 3-day behavior snapshot
# for the review to fold in. File is absent/empty if creds or API are down.
zsh automation/clarity-insights.sh 3 > automation/logs/clarity-latest.json 2>/dev/null || true

SUMMARY=$(claude -p "$(cat automation/seo-review-prompt.md)" \
  --model sonnet \
  --allowedTools "Bash" "Read" "Write" "Glob" "Grep" \
  2>automation/logs/seo-weekly.err)

echo "$SUMMARY" > automation/logs/seo-weekly.last
zsh automation/telegram-send.sh "📊 SEO weekly — rentvsbuymath.com

$SUMMARY"
/usr/bin/osascript -e "display notification \"${SUMMARY//\"/'}\" with title \"SEO weekly: rentvsbuymath.com\"" 2>/dev/null || true
