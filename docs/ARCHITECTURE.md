# Architecture

## Decisions made in Phase 2

- The app is a **React + TypeScript + Vite PWA**.
- Local persistence uses **browser localStorage** for the MVP.
- The app state is versioned so storage can be migrated later if needed.
- A medicine stores its cooldown and an internal list of dose records.
- The UI currently renders preview data when no saved app state exists yet.

## Data model

```ts
interface DoseRecord {
  id: string
  takenAt: string
  recordedAt: string
  source: 'now' | 'backfill'
}

interface Medicine {
  id: string
  name: string
  cooldownMinutes: number
  doses: DoseRecord[]
}

interface AppState {
  version: 1
  medicines: Medicine[]
}
```

## Source structure

- `src/components/` — UI building blocks
- `src/data/` — preview/demo data for the current shell
- `src/state/` — app state hooks
- `src/storage/` — persistence helpers
- `src/types/` — shared TypeScript model types
- `src/utils/` — time and formatting helpers

## What this phase covers

- app shell
- PWA manifest and service worker registration
- installability foundation
- offline caching foundation
- data model
- local storage layer

## What comes next

- Phase 3 will harden the medicine timing logic and edge cases.
- Later phases will add CRUD flows and real dose recording UI.
