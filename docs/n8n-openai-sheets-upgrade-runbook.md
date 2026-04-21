# n8n Upgrade Runbook: OpenAI + Google Sheets Logging

This document explains how to upgrade the current `*.workflow.json` files from Redis/Telegram-only v1 into OpenAI-aware, Google-Sheets-logging workflows.

## Principles

- keep Redis as active state
- append to Sheets after Redis commit
- use OpenAI only for structured parse/summarize
- validate OpenAI output before writing state

## 1. Shared credentials you must create in n8n

- Telegram credential for each bot
- Redis credential
- Google Sheets credential
- OpenAI credential or HTTP Request auth for OpenAI API

## 2. Shared nodes to add conceptually to each workflow

### A. Event identity
Before any side effect:

- create `event_id`
- create `correlation_id`
- create bot-specific idempotency key

Suggested `Code` node output fields:

```js
const now = new Date().toISOString();
const messageId = String($json.message_id || $json.update_id || now);
const bot = 'schedule'; // change per workflow
return [{
  json: {
    ...$json,
    event_id: `${bot}:${messageId}`,
    correlation_id: `${bot}:${messageId}`,
    event_ts: now,
  }
}];
```

### B. OpenAI parse node

Use either:
- OpenAI node, if your n8n version supports the response mode you want
- or `HTTP Request` to OpenAI for full control

Recommended for reliability: **HTTP Request**.

#### HTTP Request config
- Method: `POST`
- URL: `https://api.openai.com/v1/chat/completions`
- Auth: Header bearer token
- Headers:
  - `Authorization: Bearer {{$env.OPENAI_API_KEY}}`
  - `Content-Type: application/json`

#### Body template
```json
{
  "model": "={{$env.OPENAI_MODEL_PARSE}}",
  "temperature": 0.1,
  "messages": [
    {
      "role": "system",
      "content": "PASTE BOT-SPECIFIC SYSTEM PROMPT HERE"
    },
    {
      "role": "user",
      "content": "={{$json.text}}"
    }
  ]
}
```

### C. OpenAI validation node

Immediately after OpenAI response, add a `Code` node that:
- parses JSON
- validates required fields
- throws if invalid

Example skeleton:

```js
const raw = $json.choices?.[0]?.message?.content || '{}';
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  throw new Error('OpenAI JSON parse failed');
}

if (!parsed.intent) {
  throw new Error('OpenAI output missing intent');
}

return [{ json: { ...$json, ai: parsed } }];
```

### D. Google Sheets append node

After Redis commit, append a row into the raw log tab.

Recommended node:
- Google Sheets → Append row

Append only to:
- `logs_schedule`
- `logs_progress`
- `logs_finance`

Never write operational state into Sheets first.

## 3. ScheduleBot upgrade steps

### Add OpenAI only where needed
Current v1 already handles:
- `/today`
- `/tomorrow`
- `/week`
- `/set_tutoring ...`

So for v2:
- keep rule-based parsing for commands
- add OpenAI only for free-form schedule questions or messy tutoring input

### Add Sheets append after these actions
- morning digest sent
- evening prep sent
- Sunday weekly prompt sent
- tutoring week updated

### Row shape for `logs_schedule`
Map fields:
- `event_id`
- `correlation_id`
- `event_ts`
- `date`
- `day_type`
- `source_bot='schedule'`
- `action`
- `work_enabled`
- `tutoring_enabled`
- `tutoring_start`
- `tutoring_end`
- `growth_slot`
- `english_slot`
- `reset_slot`
- `notes`
- `telegram_message_id`

## 4. ProgressBot upgrade steps

### Where OpenAI helps most
- parsing free-form check-ins
- summarizing weekly review
- monthly review condensation

### Recommended flow
Telegram inbound -> dedupe -> get objectives -> OpenAI parse -> validate -> Redis write -> Sheets append -> reply

### Add Sheets append after
- daily check-in saved
- weekly review saved
- monthly review saved

### Row shape for `logs_progress`
- `event_id`
- `correlation_id`
- `event_ts`
- `date`
- `source_bot='progress'`
- `entry_type`
- `done`
- `blocked`
- `tomorrow`
- `energy`
- `weekly_score`
- `wins`
- `misses`
- `next_top3`
- `objective_ids`
- `status_summary`
- `telegram_message_id`

## 5. FinanceBot upgrade steps

### Where OpenAI helps most
- parsing messy expense text
- low-confidence category resolution

### Recommended hybrid pattern
- simple messages (`0`, `ăn 60k, cafe 35k`) stay rule-based first
- if parser confidence low, call OpenAI
- require structured JSON output

### Add Sheets append after
- every parsed transaction item
- optional monthly summary checkpoints

### Row shape for `logs_finance`
One item per row.

## 6. Retry policy in n8n

Safe to retry:
- OpenAI request
- Telegram send
- Google Sheets append

Not safe to blindly retry:
- post-commit business logic without dedupe

## 7. Error workflow

Create one error workflow that:
- appends to `error_log`
- includes `workflow_name`, `node_name`, `event_id`, `correlation_id`
- optionally pings your admin chat

## 8. Practical migration order

1. keep existing v1 workflows importable
2. duplicate them in n8n UI as v2 drafts
3. add event identity nodes
4. add Sheets append nodes
5. add OpenAI nodes
6. test one bot at a time
7. only then export your working v2 from n8n

This is safer than hand-authoring huge workflow JSON upgrades from scratch.
