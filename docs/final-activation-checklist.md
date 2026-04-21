# Final Activation Checklist

## Before import

- [ ] 3 Telegram bots created
- [ ] chat IDs collected
- [ ] OpenAI API key ready
- [ ] Redis reachable
- [ ] Redis persistence enabled
- [ ] Google Spreadsheet created
- [ ] Spreadsheet shared to n8n credential account

## Before seeding Redis

- [ ] set `REDIS_URL`
- [ ] verify `redis-cli` works
- [ ] confirm current month/week are correct for your timezone

## Before activating workflows

- [ ] import `finance-bot.workflow.json`
- [ ] import `schedule-bot.workflow.json`
- [ ] import `progress-bot.workflow.json`
- [ ] attach credentials on all nodes
- [ ] set env vars from `.env.personal-ops.example`

## Before adding OpenAI + Sheets nodes

- [ ] read `docs/openai-prompt-contracts.md`
- [ ] read `docs/n8n-openai-sheets-upgrade-runbook.md`
- [ ] create raw log tabs in spreadsheet
- [ ] create `error_log` tab

## Test sequence

### FinanceBot
- [ ] `0`
- [ ] `ăn 60k, cafe 35k, grab 25k`
- [ ] `/month`
- [ ] `/budget`

### ScheduleBot
- [ ] `/today`
- [ ] `/tomorrow`
- [ ] `/week`
- [ ] `/set_tutoring Tue 20-22, Thu 18-20:30`

### ProgressBot
- [ ] send a structured check-in
- [ ] `/status`
- [ ] `/goals`

## Production hardening

- [ ] error workflow active
- [ ] duplicate delivery observed and handled
- [ ] Sheets append verified
- [ ] one failed event manually replayed
- [ ] backup/restore Redis tested
- [ ] dashboard formulas working

## Operational readiness

- [ ] you know where raw logs live
- [ ] you know where summaries live
- [ ] you know how to clear a stuck pending state in Redis
- [ ] you know how to deactivate one bot without affecting the others
