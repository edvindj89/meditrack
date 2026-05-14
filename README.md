# Meditrack

Meditrack is a mobile-first medicine tracker for on-demand medicines with cooldowns between doses.

## Current status

Phase 9 is complete:

- React + TypeScript + Vite scaffolded
- PWA support enabled
- app data model defined
- local storage layer added
- main screen grouped into ready and cooling-down sections
- visual overview summary added
- medicine add, edit, and delete flows added
- take-now and back-register dose flows added
- persistence recovery and reset flows added
- install prompt and offline/update notices added
- PNG app icons and standalone metadata added
- storage tests added
- time-format polish and clearer dose-source labels added
- test checklist/results documented
- core medicine timing logic hardened
- back-registration helpers added
- domain tests added
- NeoVim development workflow documented

## Stack

- React
- TypeScript
- Vite
- vite-plugin-pwa
- npm

## Prerequisites

- Node.js 22+
- npm 10+

This machine was verified with:

- Node.js `v22.15.1`
- npm `10.9.2`
- NeoVim `0.11.6`

## Commands

- `npm install` — install dependencies
- `npm run dev` — start local dev server
- `npm run dev:host` — expose dev server on local network
- `npm run typecheck` — run TypeScript checks
- `npm run lint` — run ESLint
- `npm run test` — run domain tests
- `npm run format` — format the project with Prettier
- `npm run build` — production build
- `npm run preview` — preview the built app locally

## Install locally

- **Android:** open the deployed app in Chrome and use **Install app** or **Add to Home screen**.
- **iPhone:** open the app in Safari and use **Share → Add to Home Screen**.

For accurate install/offline testing during development, use:

- `npm run build`
- `npm run preview`

## Docs

- `docs/DEVELOPMENT.md` — local setup, NeoVim, debugging, and PWA testing
- `docs/ARCHITECTURE.md` — structure, data model, and domain logic
- `docs/TESTING.md` — testing checklist and current results
- `REQUIREMENTS.md` — MVP requirements
- `IMPLEMENTATION_PLAN.md` — phase-by-phase plan
