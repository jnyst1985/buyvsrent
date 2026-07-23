#!/bin/zsh
# Daily HN comment-opportunity digest: headless Claude (Sonnet) scouts live HN
# threads in the operator's lanes, writes a dated file, and pushes it to Telegram.
# Installed as LaunchAgent com.rentvsbuymath.hn-digest (daily ~18:37 local).
set -u
export PATH="/opt/homebrew/bin:/Users/jonathannyst/.local/bin:/usr/local/bin:/usr/bin:/bin"

REPO="$HOME/Documents/projects/buyvsrent"
cd "$REPO" || exit 1
mkdir -p automation/hn-digests automation/logs

DIGEST=$(claude -p "$(cat automation/hn-digest-prompt.md)" \
  --model sonnet \
  --allowedTools "Bash" "Read" "Write" \
  2>automation/logs/hn-digest.err)

printf '%s\n' "$DIGEST" > automation/logs/hn-digest.last
zsh automation/telegram-send.sh "$DIGEST"
/usr/bin/osascript -e "display notification \"HN digest ready\" with title \"rentvsbuymath: daily HN\"" 2>/dev/null || true
