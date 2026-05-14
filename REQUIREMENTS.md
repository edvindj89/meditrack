# Meditrack MVP Requirements

## MVP features

- Add multiple medicines
- For each medicine, set:
  - name
  - minimum time between doses
- Main screen lists all medicines
- Each medicine shows:
  - name
  - last taken
  - time since last dose
  - next allowed dose
  - current status: **ready** or **wait X time**
- Record dose with **Take now**
- Back-register dose by entering how long ago it was taken
- Edit medicine
- Delete medicine
- Save all data locally on device

## Product requirements

- Must run on **Android and iPhone**
- Must be installable locally without app stores
- Must work as an installable **PWA**
- Must work well on mobile screens
- Must keep working offline after first load/install
- Must not require login or account
- Must store data only on the device
- Must be quick to use with very few taps

## Development requirements

- Must be fully developable locally on this computer
- Must work with **NeoVim** as the main editor
- Must document any required NeoVim setup:
  - LSP/autocomplete
  - formatting
  - linting
  - running the dev server
- Must document debugging workflow:
  - browser dev tools
  - terminal logs
  - any recommended NeoVim-compatible debugging setup
- Must not require a heavyweight IDE as the primary workflow

## UI requirements

- One simple main screen
- Medicines shown as clear cards or list rows
- Most important info visible at a glance
- **Take now** must be easy to tap
- Back-registering must be simple and fast
- No clutter or unnecessary settings

## Not in MVP

- Reminders
- Notifications
- Cloud sync
- Sharing between devices
- Notes
- Dose history view
- Export/import

## Open decisions

- Should back-registering be:
  - only “X hours and minutes ago”, or
  - also exact clock time?
- Should deleting a medicine require confirmation?
- Should we keep a hidden dose history internally, even if not shown yet?
