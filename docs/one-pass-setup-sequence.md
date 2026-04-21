# One-Pass Setup Sequence

Follow this exact order.

## 1. Prepare environment values

Copy the example env file and fill it:

```bash
cp .env.personal-ops.example .env.personal-ops.local
```

Fill at minimum:

- `SCHEDULE_CHAT_ID`
- `PROGRESS_CHAT_ID`
- `FINANCE_CHAT_ID`
- `OPENAI_API_KEY`
- `REDIS_URL`
- `OPS_SPREADSHEET_ID`

## 2. Create the reporting spreadsheet

Create one Google Spreadsheet manually.

Then open **Extensions -> Apps Script**, paste `scripts/google_sheets_setup.gs`, save, and run:

- `setupPersonalOpsSheet()`

This will:

- create required tabs
- create header rows
- seed `dim_lists`
- create dashboard placeholders

## 3. Seed Redis

Run:

```bash
chmod +x scripts/redis_seed.sh
REDIS_URL='xxx' ./scripts/redis_seed.sh
```

Inspect seeded keys if needed:

```bash
chmod +x scripts/redis_ops.sh
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh list 'sched:*'
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh list 'prog:*'
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh list 'fin:*'
```

## 4. Import n8n workflows

Import in this order:

1. `finance-bot.workflow.json`
2. `schedule-bot.workflow.json`
3. `progress-bot.workflow.json`

Attach credentials:

- FinanceBot: Telegram + Redis
- ScheduleBot: Telegram + Redis
- ProgressBot: Telegram + Redis

## 5. Smoke test v1 before upgrading

### FinanceBot
- send `0`
- send `ăn 60k, cafe 35k, grab 25k`
- send `/month`

### ScheduleBot
- send `/today`
- send `/tomorrow`
- send `/week`
- send `/set_tutoring Tue 20-22, Thu 18-20:30`

### ProgressBot
- send
  ```
  done: test
  blocked: none
  tomorrow: continue
  ```
- send `/status`

## 6. Upgrade workflows to OpenAI + Sheets

Read and follow:

- `docs/openai-prompt-contracts.md`
- `docs/n8n-openai-sheets-upgrade-runbook.md`

Add in this order per workflow:

1. event identity node
2. OpenAI parse node (where needed)
3. validation code node
4. Google Sheets append node
5. error path / error workflow integration

## 7. Validate logging

After each successful bot interaction, confirm:

- Redis state changed correctly
- one new row appended to the correct log tab
- no duplicate rows on retry

## 8. Turn on reminders last

Only activate cron nodes after:

- manual inbound flows work
- logs append correctly
- no duplicate write issue exists

## 9. Learn the emergency operations

### Inspect a key

```bash
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh get 'fin:month:2026-04'
```

### Clear stuck pending state

```bash
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh clear-pending sched 123456789
```

### Delete a broken key manually

```bash
REDIS_URL='redis://localhost:6379/0' ./scripts/redis_ops.sh del 'sys:idempotency:finance:123456'
```

## 10. Production readiness check

You are ready for daily use when:

- all three bots answer correctly
- Redis seed is in place
- Sheets headers and dashboard exist
- raw logs append cleanly
- duplicate Telegram deliveries do not duplicate state
- you know how to inspect and clear stuck keys
