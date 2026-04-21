# Google Sheets Schema and Dashboard Guide

## Goal

Use Google Sheets as the reporting and visualization layer for the bot system.

It should answer:

- what happened this day/week/month
- which pillar is drifting
- how much was spent and where
- whether the schedule realistically supported growth work

## Tabs

### 1. logs_schedule
Append-only schedule event log.

### 2. logs_progress
Append-only daily/weekly/monthly progress log.

### 3. logs_finance
Append-only transaction log, one item per row.

### 4. weekly_summary
Formula-driven or workflow-driven weekly rollups.

### 5. monthly_summary
Formula-driven or workflow-driven monthly rollups.

### 6. dashboard
Charts and KPI blocks only.

### 7. dim_lists
Enums and reference values:

- bot names
- finance categories
- buckets
- progress pillars
- statuses

### 8. error_log
Workflow and parsing failures.

## Logging guidance

- every row must have `event_id`
- every row should have `correlation_id`
- every row should have `event_ts`
- finance rows should be itemized, not bundled
- do not let humans manually edit raw log tabs unless necessary

## Summary guidance

Prefer deriving charts from `weekly_summary` and `monthly_summary` instead of directly from raw logs when the sheet grows.

Useful formulas:

- `QUERY()` for grouped summaries
- `SUMIFS()` and `COUNTIFS()` for KPIs
- `ARRAYFORMULA()` for derived helper columns
- `SPARKLINE()` for small trend indicators

## Suggested dashboard blocks

### Schedule

- tutoring nights this week
- growth slots this week
- weekend reset count

### Progress

- check-ins this week
- weekly score trend
- active goals by status

### Finance

- current month spend
- needs/wants/savings percentages
- top categories by spend

## Archive policy

When logs become large or sluggish:

- move closed months into archive tabs or a separate workbook
- keep the active workbook focused on recent history and summaries
