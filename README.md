# Meditrack

Meditrack is a mobile-first medicine tracker for on-demand medicines with cooldowns between doses.

## Current status

Phase 2 is complete:

- React + TypeScript + Vite scaffolded
- PWA support enabled
- app data model defined
- local storage layer added
- initial mobile-first overview screen added
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
- `npm run format` — format the project with Prettier
- `npm run build` — production build
- `npm run preview` — preview the built app locally

## Docs

- `docs/DEVELOPMENT.md` — local setup, NeoVim, debugging
- `docs/ARCHITECTURE.md` — Phase 2 structure and data model
- `REQUIREMENTS.md` — MVP requirements
- `IMPLEMENTATION_PLAN.md` — phase-by-phase plan
