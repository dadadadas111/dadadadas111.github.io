# OpenAI Prompt Contracts

These prompt contracts are for bounded usage inside n8n.

## Shared rules

- Always prefer rule-based parsing first.
- Only call OpenAI when input is ambiguous or free-form enough to justify it.
- For machine-handled steps, require JSON only.
- Reject outputs that do not match the expected schema.

## ScheduleBot parser

### Use case

- parse tutoring schedule from free-form text
- answer bounded schedule Q&A when rule match is insufficient

### System prompt

```text
You are ScheduleBot parser.
You only work on personal scheduling for one user.
Return valid JSON only.
Never invent events.
If the user input is ambiguous, set "needs_clarification": true.
```

### Output schema

```json
{
  "intent": "set_tutoring|ask_today|ask_tomorrow|ask_week|unknown",
  "entries": [
    {
      "day": "mon|tue|wed|thu|fri|sat|sun",
      "start": "HH:MM",
      "end": "HH:MM"
    }
  ],
  "needs_clarification": false,
  "reply_text": "short human-readable reply"
}
```

## ProgressBot parser

### Use case

- parse check-in text
- summarize weekly/monthly review

### System prompt

```text
You are ProgressBot parser.
You only work on daily/weekly progress tracking.
Return valid JSON only.
Do not change goals.
Do not add imaginary work.
If input is too vague, ask for clarification.
```

### Output schema

```json
{
  "intent": "daily_checkin|weekly_review|monthly_review|status_query|unknown",
  "done": ["..."],
  "blocked": ["..."],
  "tomorrow": ["..."],
  "energy": "low|normal|good",
  "weekly_score": 0,
  "wins": ["..."],
  "misses": ["..."],
  "next_top3": ["..."],
  "needs_clarification": false,
  "reply_text": "short human-readable reply"
}
```

## FinanceBot parser

### Use case

- parse natural language expense logging
- classify items into category and bucket

### System prompt

```text
You are FinanceBot parser.
You only parse personal expense and budget inputs.
Return valid JSON only.
Never fabricate transactions.
If confidence is low, set needs_confirmation true.
```

### Output schema

```json
{
  "intent": "log_expense|query_month|query_budget|unknown",
  "items": [
    {
      "label": "string",
      "amount": 0,
      "category": "food_basic|transport|cafe|entertainment|shopping_nonessential|rent|utilities|savings|investment|essential_personal|other",
      "bucket": "needs|wants|savings"
    }
  ],
  "total": 0,
  "confidence": 0.0,
  "needs_confirmation": false,
  "reply_text": "short human-readable reply"
}
```

## Validation rule

Your workflow should reject model output if:

- JSON parse fails
- required keys are missing
- amount is negative or malformed
- category/bucket values are outside the allowed enum

If rejected:

1. retry once with stricter prompt
2. if still invalid, ask user to re-enter clearly
