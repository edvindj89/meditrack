# Development Environment

## Verified on this machine

- Node.js `v22.15.1`
- npm `10.9.2`
- pnpm `11.1.2`
- NeoVim `0.11.6`
- Google Chrome available for browser debugging

## Package manager choice

This project uses **npm** to keep setup simple and avoid extra project tooling decisions.

## Local workflow

- Start dev server: `npm run dev`
- Start dev server for phone testing on the same network: `npm run dev:host`
- Type-check: `npm run typecheck`
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`
- Preview build: `npm run preview`

## NeoVim notes

Your NeoVim config already appears suitable for this project:

- `tsserver` is configured in `~/.config/nvim/lua/plugins/lsp.lua`
- `html` and `cssls` are configured there as well
- Mason has `typescript-language-server` installed
- ESLint is installed on the system

### Quick checks inside NeoVim

Open the project and use:

- `:LspInfo` to confirm TypeScript/HTML/CSS LSP attachment
- `:checkhealth` if something seems off

### Formatting

This project uses **Prettier** locally through npm scripts.

If your NeoVim format-on-save does not pick it up automatically yet, you can still use:

- `npm run format`

That is enough for MVP development. We can add project-specific NeoVim formatter integration later if needed.

## Debugging workflow

Recommended default workflow for this project:

1. Run `npm run dev`
2. Open the app in Chrome
3. Use Chrome DevTools for:
   - console logs
   - network inspection
   - React/browser debugging
   - storage inspection later when persistence is added

### Optional terminal-based debugging

- Use `console.log` during early development
- watch Vite output in the terminal
- run `npm run typecheck` and `npm run lint` often

### Optional NeoVim debugging later

NeoVim DAP is **not required** for this project right now.

If you want it later, the recommended path is:

- add a JavaScript browser debug adapter such as `vscode-js-debug`
- wire it into `nvim-dap`
- debug the Vite app through Chrome

For the MVP, Chrome DevTools is the simplest and most reliable workflow.

## Phase 1 exit criteria status

- App starts locally: yes
- Code can be edited comfortably in NeoVim: likely yes, based on current config and installed tools
- Formatting and linting work: yes
- Basic debug workflow documented: yes
