#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEED_DIR="$ROOT_DIR/seeds/redis"

if ! command -v redis-cli >/dev/null 2>&1; then
  echo "redis-cli not found. Install Redis CLI first."
  exit 1
fi

REDIS_URL="${REDIS_URL:-redis://localhost:6379/0}"

today_iso="$(date +%F)"
year="$(date +%G)"
week="$(date +%V)"
month="$(date +%Y-%m)"
week_key="${year}-W${week}"

set_key() {
  local key="$1"
  local file="$2"
  local value
  value="$(cat "$file")"
  redis-cli -u "$REDIS_URL" SET "$key" "$value" >/dev/null
  echo "seeded: $key"
}

echo "Seeding Redis to $REDIS_URL"
set_key "sched:profile" "$SEED_DIR/sched.profile.json"

tmp_week="$(mktemp)"
sed "s/YYYY-WW/${week_key}/g" "$SEED_DIR/sched.week.template.json" > "$tmp_week"
set_key "sched:week:${week_key}" "$tmp_week"
rm -f "$tmp_week"

set_key "prog:objectives" "$SEED_DIR/prog.objectives.json"
set_key "fin:profile" "$SEED_DIR/fin.profile.json"

tmp_month="$(mktemp)"
sed "s/YYYY-MM/${month}/g" "$SEED_DIR/fin.month.template.json" > "$tmp_month"
set_key "fin:month:${month}" "$tmp_month"
rm -f "$tmp_month"

echo "Done."
echo "Current keys to inspect:"
echo "  sched:profile"
echo "  sched:week:${week_key}"
echo "  prog:objectives"
echo "  fin:profile"
echo "  fin:month:${month}"
echo "  date reference: ${today_iso}"
