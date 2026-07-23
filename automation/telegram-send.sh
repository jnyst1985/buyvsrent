#!/bin/zsh
# Send a message to Telegram if creds are configured; silent no-op otherwise.
# Creds file (chmod 600): ~/.config/telegram/rentvsbuymath.env
#   TELEGRAM_BOT_TOKEN=123456:ABC...
#   TELEGRAM_CHAT_ID=123456789
# Usage: telegram-send.sh "message"   (or pipe the message on stdin)
set -u
CONF="$HOME/.config/telegram/rentvsbuymath.env"
[ -f "$CONF" ] || exit 0
source "$CONF"
[ -n "${TELEGRAM_BOT_TOKEN:-}" ] || exit 0
[ -n "${TELEGRAM_CHAT_ID:-}" ] || exit 0

MSG="${1:-$(cat)}"
# Telegram hard-caps messages at 4096 chars.
MSG=$(printf '%s' "$MSG" | head -c 3900)

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${MSG}" \
  --data "disable_web_page_preview=true" \
  -o /dev/null
