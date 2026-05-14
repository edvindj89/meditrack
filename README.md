# Meditrack

Meditrack is a mobile-first medicine tracker for on-demand medicines with cooldowns between doses.

## Current status

Phase 1 is complete:

- React + TypeScript + Vite scaffolded
- local npm workflow verified
- linting, formatting, and type-checking scripts added
- NeoVim development workflow documented

## Stack

- React
- TypeScript
- Vite
- npm

PWA-specific installability and offline work will be added in later phases.

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

## NeoVim and debugging

See `docs/DEVELOPMENT.md` for:

- NeoVim notes
- formatting/linting workflow
- browser debugging workflow
- optional next steps for deeper debugging
