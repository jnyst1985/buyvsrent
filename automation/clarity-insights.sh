#!/bin/zsh
# Fetch Microsoft Clarity live insights (rolling 1-3 day snapshot).
# API is hard-capped at 10 calls/project/day, so this makes exactly ONE call.
# Creds (chmod 600): ~/.config/clarity/rentvsbuymath.env  ->  CLARITY_API_TOKEN=...
# Usage: clarity-insights.sh [numOfDays 1-3]  (prints JSON to stdout; empty on failure)
set -u
CONF="$HOME/.config/clarity/rentvsbuymath.env"
[ -f "$CONF" ] || { echo ""; exit 0; }
source "$CONF"
[ -n "${CLARITY_API_TOKEN:-}" ] || { echo ""; exit 0; }

DAYS="${1:-3}"
curl -s --max-time 30 \
  "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${DAYS}" \
  -H "Authorization: Bearer ${CLARITY_API_TOKEN}"
