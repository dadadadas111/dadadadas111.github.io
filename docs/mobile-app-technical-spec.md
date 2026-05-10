# Personal Ops Mobile App Technical Spec

## Product goal

Build a single-user offline-first mobile app for personal operations management.

Core modules:

- Schedule
- Progress
- Finance
- Journal
- Dashboard
- Settings / Backup

## Phase 1 principles

- React Native with TypeScript
- local-first data model
- SQLite is the source of truth
- no required backend
- manual snapshot backup/restore first
- Google Drive integration later
- one active device is the authoritative device in MVP

## App structure

Recommended workspace layout:

- `apps/personal-ops-mobile/`

Recommended internal structure:

- `src/app` navigation and screens
- `src/features/schedule`
- `src/features/progress`
- `src/features/finance`
- `src/features/journal`
- `src/features/dashboard`
- `src/features/settings`
- `src/db`
- `src/lib`
- `src/state`
- `src/ui`

## Local data architecture

SQLite tables:

- `app_meta`
- `schedule_days`
- `schedule_blocks`
- `weekly_plans`
- `objectives`
- `daily_checkins`
- `weekly_reviews`
- `habit_logs`
- `finance_transactions`
- `monthly_budgets`
- `journal_entries`
- `audit_events`

## Journal module

The journal module is a first-class feature, not a note field.

### Purpose

- guide the user to reflect on the day
- make events searchable later
- connect emotional/subjective reflection with schedule and progress data

### Daily journal flow

At configured times, the app should open a journaling entry path with prefilled context:

- date
- known schedule blocks of the day
- tutoring or workday context
- today check-in if already available
- quick finance summary if available

### Journal entry sections

- what happened today
- key events
- what went well
- what was difficult
- what I felt / energy level
- what I learned
- what I want to do tomorrow

### Journal table

- `id`
- `date`
- `entry_window` (`morning`, `midday`, `evening`, `freeform`)
- `prompt_context_json`
- `events_text`
- `wins_text`
- `difficulties_text`
- `feelings_text`
- `lessons_text`
- `tomorrow_text`
- `created_at`
- `updated_at`

## UX principles

- fast capture first
- no mandatory long forms for core logging
- clean dashboard second
- guided journaling but not overwhelming
- low-friction recovery after reinstall

## Schedule module MVP

- day overview
- week overview
- quick-add block
- tutoring night setup
- reusable templates for workday and weekend

## Progress module MVP

- objective list/detail
- daily check-in
- weekly review
- basic status colors

## Finance module MVP

- add/edit/delete transactions
- categorize by needs/wants/savings
- month summary
- 50/30/20 chart

## Dashboard MVP

- tutoring nights this week
- growth blocks this week
- check-in streak
- weekly review score trend
- finance month summary
- category spend chart
- journal consistency count

## Backup and restore MVP

- export local database snapshot
- export metadata manifest
- restore snapshot from file picker
- version check before restore
- create safety backup before import

## Explicit MVP exclusions

- automatic multi-device sync
- conflict resolution
- collaboration or account sharing
- Google Calendar sync
- bank integrations
- attachment/media management
- server-backed AI workflows

## Release direction

- use pnpm
- Expo app in repo subfolder
- Android APK build via GitHub Actions on release tag
- stable Android package name to ensure updates replace existing install cleanly

## Suggested Android package name

- `io.github.dadadadas111.personalops`

## Implementation order

1. app shell and navigation
2. SQLite schema and repository layer
3. schedule module
4. finance module
5. progress module
6. journal module
7. dashboard
8. backup/export/import
9. release pipeline
