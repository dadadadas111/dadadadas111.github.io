# Personal Ops System v1

## Purpose

This system is a personal operating system built around 3 isolated Telegram bots:

- **ScheduleBot**: daily/weekly scheduling and tutoring-night planning
- **ProgressBot**: check-ins, weekly review, objective/accountability tracking
- **FinanceBot**: daily expense logging and 50/30/20 budget tracking

Core stack:

- **Telegram** for user interaction
- **n8n** for orchestration
- **Redis** for active state and idempotency
- **OpenAI** for structured parsing and bounded summarization
- **Google Sheets** for append-only logs, summaries, and dashboard charts

## Non-goals

- Multi-user shared collaboration
- Full accounting system
- Full calendar sync with Google Calendar or Outlook
- Autonomous agents that negotiate with each other
- Sheets as the transactional source of truth

## Architecture

### High-level model

Each bot has:

- its own Telegram bot token
- its own n8n workflow
- its own Redis namespace
- its own Google Sheets log tab(s)

Shared infrastructure:

- one Redis instance
- one Google Spreadsheet for reporting
- one OpenAI account/API key
- one shared error workflow in n8n

### Core rules

1. **Redis is source of truth for active state**
2. **Google Sheets is reporting and audit only**
3. **Every Telegram update is treated as replayable**
4. **Every meaningful event gets a correlation ID and event ID**
5. **OpenAI never writes state directly**

## Bot responsibilities

### ScheduleBot

Responsibilities:

- morning digest
- evening prep message
- Sunday weekly planning prompt
- `/today`, `/tomorrow`, `/week`, `/set_tutoring`

Operational logic:

- Mon-Thu: work block fixed at 08:00-17:30
- Fri: commute/reset day
- Weekend: light schedule only
- Tutoring nights reduce or remove growth blocks

Redis reads/writes:

- `sched:profile`
- `sched:week:<YYYY-WW>`
- `sched:day:<YYYY-MM-DD>`
- `sched:pending_confirm:<chat_id>`
- `sys:idempotency:schedule:<telegram_message_id>`

Sheets logs:

- append a row on major schedule events:
  - digest sent
  - tutoring updated
  - weekly plan updated

### ProgressBot

Responsibilities:

- daily check-in prompt
- weekly review prompt
- monthly review prompt
- `/status`, `/goals`, `/checkin`, `/week_review`

Tracked pillars:

- work
- freelance
- skill
- English
- health
- life admin

Redis reads/writes:

- `prog:objectives`
- `prog:daily:<YYYY-MM-DD>`
- `prog:weekly:<YYYY-WW>`
- `prog:monthly:<YYYY-MM>`
- `prog:pending_confirm:<chat_id>`
- `sys:idempotency:progress:<telegram_message_id>`

Sheets logs:

- append one row per daily check-in
- append one row per weekly review
- append one row per monthly review

### FinanceBot

Responsibilities:

- daily expense prompt
- parse expense messages
- `/month`, `/budget`
- later: `/undo_last`, `/correct`

Budget model:

- **Needs**: 50%
- **Wants**: 30%
- **Savings**: 20%

Redis reads/writes:

- `fin:profile`
- `fin:txn:<YYYY-MM-DD>`
- `fin:month:<YYYY-MM>`
- `fin:pending_parse:<chat_id>`
- `sys:idempotency:finance:<telegram_message_id>`

Sheets logs:

- append one row per transaction item
- append monthly summary rows separately

## Workflow pattern

Every bot workflow should follow this order:

1. Receive event (Telegram or Cron)
2. Validate and normalize
3. Claim idempotency key in Redis
4. Load active state from Redis
5. Apply rule-based routing first
6. Call OpenAI only if needed
7. Validate output schema
8. Update Redis state
9. Append immutable row(s) to Google Sheets
10. Reply in Telegram
11. If any step fails, hand off to error workflow

### Important implementation detail

Retry only transient steps such as:

- OpenAI request
- Telegram send
- Google Sheets append

Do **not** blindly retry the whole business action after side effects have already happened.

## Redis design

### Persistence

Redis should not be treated as disposable cache only.

Recommended:

- enable AOF or snapshotting
- define eviction policy explicitly
- test backup/restore at least once

### Shared key patterns

- `sys:idempotency:<bot>:<message_id>`
- `sys:correlation:<event_id>`
- `sys:dead_letter:<bot>:<timestamp>`

### Data rules

Store values as JSON strings.

Every meaningful object should include:

- `event_id`
- `correlation_id`
- `created_at`
- `updated_at`
- `source`

## Google Sheets design

### Workbook structure

Single workbook recommended, with separate tabs:

- `logs_schedule`
- `logs_progress`
- `logs_finance`
- `weekly_summary`
- `monthly_summary`
- `dashboard`
- `dim_lists`
- `error_log`

### Logging rules

- append-only rows only
- no historical mutation except explicit review columns if really needed
- include `event_id`, `correlation_id`, `source_bot`, `event_ts`
- use narrow logs and build summary tabs with formulas/pivots
- keep dedupe visible with a unique `event_id` column on every raw log row
- archive closed periods when the workbook starts getting sluggish

### Why Sheets is not source of truth

Sheets append is suitable for logging and dashboards, but not safe enough for workflow-critical reads because:

- retries can duplicate rows if idempotency is not handled before append
- reads can be stale or formula-dependent
- operational race conditions become much harder to debug

### Append pattern

Use Google Sheets as a write-only event sink from workflows:

- one append per finalized event
- no read-before-write logic for operational behavior
- summary tabs and charts must derive from raw logs, not replace them

## Dashboard design

### KPIs

- tutoring nights this week
- growth slots this week
- check-ins this week
- current month spending
- current month 50/30/20 ratios
- weekly score trend

### Charts

- tutoring nights by week
- growth slots by week
- weekly score line chart
- goal status stacked chart
- spending by category bar chart
- 50/30/20 pie chart

### Formula layer

Recommended functions:

- `QUERY()`
- `SUMIFS()`
- `COUNTIFS()`
- `ARRAYFORMULA()`
- `SPARKLINE()`

Avoid heavyweight full-column formulas on growing raw tabs.

## OpenAI integration

### Use cases

- parse natural language into structured JSON
- summarize weekly/monthly reviews
- classify finance lines when simple rule matching is insufficient

### Constraints

- must return schema-validated JSON for machine steps
- should be used **after** cheap rule-based parsing, not before
- must not perform side effects directly
- must not be trusted without validation

## Reliability and error handling

### Idempotency

Telegram can retry deliveries and n8n can retry nodes. Every inbound event must be deduped before side effects.

Pattern:

- generate key from bot + Telegram message/update ID
- use Redis `SET ... NX EX`
- only first claimant proceeds

### Error workflow

The shared n8n error workflow should:

- capture workflow name
- capture node name
- capture correlation ID
- append to `error_log`
- optionally notify your admin chat

### Reconciliation

The system should eventually support a reconciliation flow that can:

- detect if Redis state is missing but Sheets logs exist
- rebuild minimal monthly or weekly summary state from append-only logs
- avoid double-writing already processed events by respecting `event_id`

### Dead letter policy

If the bot cannot safely continue after retries:

- store event in `sys:dead_letter:*`
- append an error record to `error_log`
- avoid partial double-commit

### Recovery

Because Redis is active state and Sheets is append-only history, you should define a future rebuild flow that can reconstruct minimal state from logs if Redis is lost.

## Rollout plan

### Phase 1

- FinanceBot first
- verify logging + monthly ratios + dashboard feed

### Phase 2

- ScheduleBot
- verify morning/evening + tutoring updates

### Phase 3

- ProgressBot
- verify check-ins + reviews + summaries

### Phase 4

- dashboard polish
- dead letter handling
- better correction flows

## Acceptance criteria

The system is acceptable when:

- each bot works independently
- Redis holds active state safely enough for day-to-day use
- every important action writes an immutable Sheets log row
- duplicate Telegram deliveries do not cause duplicate side effects
- dashboards can summarize reality from logs without reading Redis
