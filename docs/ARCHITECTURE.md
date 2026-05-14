# Architecture

## Decisions made in Phases 2–7

- The app is a **React + TypeScript + Vite PWA**.
- Local persistence uses **browser localStorage** for the MVP.
- The app state is versioned so storage can be migrated later if needed.
- A medicine stores its cooldown and an internal list of dose records.
- The app starts from saved local data or an empty state.
- Core cooldown logic lives in a dedicated domain module.
- App state is normalized before being saved or loaded.
- Back-registration is expressed as hours/minutes ago and converted into a timestamp.

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

interface MedicineStatus {
  state: 'ready' | 'waiting'
  latestDose?: DoseRecord
  nextAllowedAt?: Date
  elapsedMs: number | null
  remainingMs: number
}

interface AppState {
  version: 1
  medicines: Medicine[]
}
```

## Source structure

- `src/components/` — UI building blocks
- `src/domain/` — medicine timing and validation logic
- `src/state/` — app state hooks
- `src/storage/` — persistence helpers
- `src/types/` — shared TypeScript model types
- `src/utils/` — formatting helpers

## Main screen structure

- Hero with current timestamp, add-medicine action, and reset-data action
- Summary cards for total, ready now, cooling down, and soonest ready
- A **Ready now** section
- A **Cooling down** section sorted by shortest remaining wait
- Add and edit medicine forms
- Inline **Take now** and **Back-register** dose actions per medicine
- Persistence notice banner when saved data was recovered or storage fails
- Empty state when no medicines exist

## What this phase covers

- app shell
- PWA manifest and service worker registration
- installability foundation
- offline caching foundation
- data model
- local storage layer
- persistence recovery and reset behavior
- cooldown calculations
- back-registration timestamp creation
- medicine normalization and validation
- domain tests
- storage tests

## What comes next

- Phase 8 will focus on installability and offline behavior polish.
- Later phases can add notifications, backups, and sync.
