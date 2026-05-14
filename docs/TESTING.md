# Testing and Polish

## Automated checks run on this machine

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅
- `npm run build` ✅

## Manual checklist

### Core flows

- Add a medicine
- Edit a medicine
- Delete a medicine
- Record **Take now**
- Record **Back-register**
- Reload and confirm data persists
- Reset all data

### PWA / installability

- Check manifest and service worker in browser dev tools
- Install on Android from Chrome
- Add to Home Screen on iPhone from Safari
- Confirm standalone launch from app icon
- Confirm app still opens after going offline once it has been cached

## Current result summary

- Desktop development/build/test workflow: verified on this machine
- Automated domain and storage tests: verified on this machine
- Local production build output: verified on this machine
- Android installation flow: pending device test
- iPhone Add to Home Screen flow: pending device test
- Real offline-on-device behavior: pending device test

## Polish changes in Phase 9

- clearer wording for very recent doses (`Just now`)
- clearer source labeling for recorded doses
- explicit test checklist and result tracking
