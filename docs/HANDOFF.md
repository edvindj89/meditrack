# Handoff

## Project status

The MVP is implemented through **Phase 10** of the plan.

Core capabilities included now:

- add multiple medicines
- edit medicines
- delete medicines
- set cooldown per medicine
- record **Take now**
- back-register a dose by hours/minutes ago
- see ready vs cooling-down medicines
- local persistence on device
- installable PWA behavior

## Main code areas

- `src/App.tsx` — top-level app composition
- `src/components/` — UI pieces
- `src/domain/medicine.ts` — cooldown and dose logic
- `src/state/useAppState.ts` — app state and persistence coordination
- `src/storage/appStorage.ts` — local storage handling and recovery
- `src/state/usePwaStatus.ts` — install/offline/update state

## Developer workflow

- setup and editor workflow: `docs/DEVELOPMENT.md`
- install steps: `docs/INSTALL.md`
- testing checklist: `docs/TESTING.md`
- architecture overview: `docs/ARCHITECTURE.md`

## Deployment

- GitHub Pages workflow: `.github/workflows/deploy-pages.yml`
- production URL: `https://edvindj89.github.io/meditrack/`
- build base path is configured for the `/meditrack/` project site in `vite.config.ts`

## Known limitations

- no notifications/reminders
- no cloud sync
- no import/export backups
- no dedicated dose history screen yet
- no app-store packaging

## Good next improvements

1. notifications/reminders
2. import/export backup
3. dose history view
4. per-medicine notes/instructions
5. sync between devices
