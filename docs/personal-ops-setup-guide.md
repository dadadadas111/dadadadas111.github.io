# Personal Ops System v1 Setup Guide

## 1. Telegram

Create 3 bots:

- ScheduleBot
- ProgressBot
- FinanceBot

For each bot, save:

- bot token
- bot username
- target chat ID

### Important

- one bot = one webhook
- do not reuse the same bot for test and production simultaneously
- if supported in your setup, validate webhook secret/header and keep bot credentials isolated per workflow

## 2. OpenAI

Prepare:

- API key
- chosen model name
- per-bot prompts

Recommended model usage split:

- cheap structured parse for finance and schedule
- slightly stronger model for weekly/monthly summaries if needed

## 3. Redis

Prepare:

- host
- port
- password if any
- persistence enabled
- backup policy

Recommended checks:

- verify AOF/RDB is actually writing
- verify restore path at least once
- verify no dangerous eviction policy for important keys

## 4. Google Sheets

Create one spreadsheet and these tabs:

- `logs_schedule`
- `logs_progress`
- `logs_finance`
- `weekly_summary`
- `monthly_summary`
- `dashboard`
- `dim_lists`
- `error_log`

Share the spreadsheet with the Google credential/service account used by n8n.

## 5. n8n credentials

You need:

- 3 Telegram credentials
- 1 Redis credential
- 1 Google Sheets credential
- 1 OpenAI credential or HTTP auth setup

Recommended separation:

- one Telegram credential per bot
- one shared Redis credential
- one shared Google Sheets credential
- one shared OpenAI credential

## 6. n8n environment/config values

Recommended environment variables:

- `SCHEDULE_CHAT_ID`
- `PROGRESS_CHAT_ID`
- `FINANCE_CHAT_ID`
- `OPS_SPREADSHEET_ID`
- `OPS_TIMEZONE=Asia/Bangkok`
- `OPENAI_MODEL_PARSE`
- `OPENAI_MODEL_SUMMARY`

## 7. Workflow import order

1. import FinanceBot workflow
2. import ScheduleBot workflow
3. import ProgressBot workflow
4. attach credentials
5. test each workflow manually
6. activate one by one
7. activate the shared error workflow last

## 8. Redis seed order

1. seed shared/system keys if any
2. seed `sched:profile`
3. seed `sched:week:<YYYY-WW>`
4. seed `prog:objectives`
5. seed `fin:profile`
6. seed `fin:month:<YYYY-MM>`

## 9. Google Sheets seed order

1. create headers for raw logs
2. create headers for summary tabs
3. create `dim_lists`
4. create placeholder dashboard sections

Recommended chart rollout:

1. KPI cells first
2. weekly/monthly summary formulas second
3. charts last

## 10. Initial testing checklist

### ScheduleBot

- `/today`
- `/tomorrow`
- `/week`
- `/set_tutoring Tue 20-22, Thu 18-20:30`

### ProgressBot

- send daily check-in
- `/status`
- `/goals`

### FinanceBot

- `0`
- `ăn 60k, cafe 35k, grab 25k`
- `/month`
- `/budget`

## 11. Monitoring checklist

Watch for:

- duplicate messages
- duplicate Sheets rows
- parse failures
- missing Redis keys
- Telegram webhook failures
- monthly summary drift
- lag between Redis commit and Sheets append
- dead-letter volume
- workbook slowdown over time

## 12. Common setup mistakes

- spreadsheet not shared to correct credential
- wrong chat ID
- test and prod bot sharing webhook
- Redis persistence assumed but not actually enabled
- OpenAI output not validated before state write
- Sheets used as live read source inside workflow logic
- no unique event ID written to Sheets logs
- no manual replay path for failed events
- no archive plan for large log tabs
