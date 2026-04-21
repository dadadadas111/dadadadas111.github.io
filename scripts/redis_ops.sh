#!/usr/bin/env bash
set -euo pipefail

if ! command -v redis-cli >/dev/null 2>&1; then
  echo "redis-cli not found. Install Redis CLI first."
  exit 1
fi

REDIS_URL="${REDIS_URL:-redis://localhost:6379/0}"
cmd="${1:-help}"

usage() {
  cat <<'EOF'
Usage:
  REDIS_URL=redis://... ./scripts/redis_ops.sh list <pattern>
  REDIS_URL=redis://... ./scripts/redis_ops.sh get <key>
  REDIS_URL=redis://... ./scripts/redis_ops.sh del <key>
  REDIS_URL=redis://... ./scripts/redis_ops.sh clear-pending <bot> <chat_id>

Examples:
  ./scripts/redis_ops.sh list 'sched:*'
  ./scripts/redis_ops.sh get 'fin:month:2026-04'
  ./scripts/redis_ops.sh clear-pending sched 123456789
EOF
}

case "$cmd" in
  list)
    pattern="${2:-*}"
    redis-cli -u "$REDIS_URL" KEYS "$pattern"
    ;;
  get)
    key="${2:-}"
    [ -n "$key" ] || { usage; exit 1; }
    redis-cli -u "$REDIS_URL" GET "$key"
    ;;
  del)
    key="${2:-}"
    [ -n "$key" ] || { usage; exit 1; }
    redis-cli -u "$REDIS_URL" DEL "$key"
    ;;
  clear-pending)
    bot="${2:-}"
    chat_id="${3:-}"
    [ -n "$bot" ] && [ -n "$chat_id" ] || { usage; exit 1; }
    redis-cli -u "$REDIS_URL" DEL "${bot}:pending_confirm:${chat_id}"
    redis-cli -u "$REDIS_URL" DEL "${bot}:pending_parse:${chat_id}"
    echo "Cleared pending keys for bot=${bot} chat_id=${chat_id}"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
