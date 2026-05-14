# Meditrack Implementation Plan

This plan covers the project from environment setup through an installable MVP.

## Phase 1 — Development environment setup

Goal: make sure the project can be developed comfortably on this computer with NeoVim.

### Tasks

- Verify installed tools:
  - Node.js
  - npm
- Choose package manager for the project
- Scaffold the app as a mobile-first PWA
- Confirm the app runs locally in a browser
- Set up NeoVim workflow for the project:
  - Dart/Flutter is no longer needed
  - TypeScript support
  - HTML/CSS/JSON support
  - LSP/autocomplete
  - formatting
  - linting
- Define debugging workflow:
  - browser dev tools
  - terminal logs
  - optional NeoVim-integrated debugging if useful
- Document setup and commands in `README.md`

### Deliverables

- Running local dev server
- Confirmed NeoVim-friendly workflow
- Documented setup steps

### Exit criteria

- App starts locally
- Code can be edited comfortably in NeoVim
- Formatting and linting work
- Basic debug workflow is documented

## Phase 2 — Project scaffold and architecture

Goal: create the initial project structure and technical foundation.

### Tasks

- Scaffold the PWA project
- Set up source structure for:
  - components
  - state/model
  - storage
  - utilities
- Add app metadata:
  - app name
  - icons
  - manifest
- Enable offline-capable PWA setup
- Define data model for medicines and dose timestamps
- Decide on local persistence approach:
  - localStorage for simplest MVP, or
  - IndexedDB if needed

### Deliverables

- Clean project structure
- Working PWA foundation
- Initial data model

### Exit criteria

- App builds and runs
- PWA metadata exists
- Data model is defined and committed

## Phase 3 — Core domain logic

Goal: implement the logic behind medicine timing and cooldowns.

### Tasks

- Define medicine fields:
  - id
  - name
  - minimum interval between doses
  - last taken timestamp
- Implement time calculations:
  - time since last dose
  - next allowed dose
  - remaining cooldown
  - ready/not ready status
- Implement back-registration logic:
  - convert “X hours/minutes ago” into timestamp
- Handle edge cases:
  - no previous dose
  - invalid back-registration values
  - very recent or very old timestamps

### Deliverables

- Reusable time/calculation utilities
- Stable internal data handling

### Exit criteria

- Cooldown calculations are correct
- Back-registration behaves correctly
- Logic is testable in isolation

## Phase 4 — Main screen UI

Goal: build the primary view where all medicines are visible at a glance.

### Tasks

- Create a simple mobile-first layout
- Build medicine list/cards
- Show per medicine:
  - name
  - last taken
  - time since last dose
  - next allowed dose
  - ready/wait status
- Make status visually easy to scan
- Keep layout minimal and touch-friendly

### Deliverables

- Main screen showing medicines clearly

### Exit criteria

- User can understand current medicine status at a glance
- UI works well on phone-sized screens

## Phase 5 — Medicine management

Goal: allow the user to create, edit, and delete medicines.

### Tasks

- Build add medicine flow
- Build edit medicine flow
- Build delete medicine flow
- Add confirmation for destructive actions if chosen
- Validate required fields

### Deliverables

- Functional medicine CRUD

### Exit criteria

- User can add, edit, and delete medicines without confusion
- Validation prevents broken entries

## Phase 6 — Dose recording

Goal: make dose recording fast and reliable.

### Tasks

- Add **Take now** action
- Add back-register action
- Design a minimal input flow for back-registration
- Update UI immediately after dose entry
- Prevent accidental bad input where appropriate

### Deliverables

- Fast dose recording flow

### Exit criteria

- Recording a dose takes very few taps
- Back-registration is easy and understandable
- Main screen updates correctly after dose entry

## Phase 7 — Local persistence

Goal: keep all data saved on the device between app launches.

### Tasks

- Persist medicines and timestamps locally
- Load persisted data on startup
- Handle missing or corrupted stored data gracefully
- Keep persistence logic isolated from UI code

### Deliverables

- Reliable local data storage

### Exit criteria

- Data remains after reload/reopen
- App can recover from invalid stored state

## Phase 8 — PWA installability and offline behavior

Goal: make the app installable and usable like an app on mobile devices.

### Tasks

- Verify web app manifest
- Verify icons and install name
- Verify standalone app mode
- Add service worker/offline caching as needed
- Test installation flow on Android
- Test Add to Home Screen flow on iPhone

### Deliverables

- Installable PWA
- Offline-capable MVP

### Exit criteria

- App can be installed locally
- App launches from its own icon
- Core functionality works offline after first load

## Phase 9 — Testing and polish

Goal: make the MVP stable and pleasant to use.

### Tasks

- Manual test all user flows
- Test on desktop browser and mobile-sized viewport
- Test on Android device if available
- Test on iPhone if available
- Refine spacing, button sizes, and text clarity
- Review edge cases around time calculations

### Deliverables

- Polished MVP
- Test checklist/results

### Exit criteria

- Core flows are stable
- UI is clear and fast to use
- No major issues remain for MVP use

## Phase 10 — Documentation and handoff

Goal: leave the project easy to run and maintain.

### Tasks

- Write `README.md`
- Document:
  - setup
  - local development
  - build commands
  - install steps for Android and iPhone
  - NeoVim workflow
  - debugging workflow
- Summarize MVP scope and future ideas

### Deliverables

- Clear developer and user documentation

### Exit criteria

- Project can be picked up later without guesswork
- Install and development steps are documented clearly

## Suggested order of execution

1. Phase 1 — Development environment setup
2. Phase 2 — Project scaffold and architecture
3. Phase 3 — Core domain logic
4. Phase 4 — Main screen UI
5. Phase 5 — Medicine management
6. Phase 6 — Dose recording
7. Phase 7 — Local persistence
8. Phase 8 — PWA installability and offline behavior
9. Phase 9 — Testing and polish
10. Phase 10 — Documentation and handoff

## Notes

- Keep the first version intentionally small.
- Prefer simple local storage unless there is a clear reason to add more complexity.
- Optimize for quick daily use on a phone.
- Defer reminders, notifications, history views, and sync until after the MVP works well.
