# Adopted and Imported Games Guide

How to work in a game made without the template. Read it whenever `harness-layout.json` (an adopted game) or `docs/IMPORT.md` (an imported game) exists at the repo root.

## Adopted Games (`harness-layout.json`)
A game the harness was put on top of (`/adopt-game`) keeps its own folders, code and conventions. `harness-layout.json` at the repo root is its map; `lune run layout show` prints it. When it exists:
- **Every template path in the harness's docs, skills and agents means the game's path:** `lune run layout map <path>...` gives it (`src/Core/Shared/SharedConfigs` is the game's configs folder, `default.project.json` its main project, `network.blink` its Blink file). The Rojo port is its `ServePort`, not 34872. Something the template has and the game doesn't (no `ThemeUtil`, no `Player` feature, no `UILabs`): use the game's own equivalent named in its rules or `Ui`, or say it's missing and offer to add it; never build a parallel one.
- **The game's own rules win** (`Rules` in the layout, usually its root `CLAUDE.md`): its look, UI approach, world building, naming and workflow beat the harness's defaults (Plain UI, Studs look, UI Previews, the Structure tables in `PROJECT_GUIDE.md`). The harness's safety rules (server authority, validated remotes, never `.env`, never Rojo or Wally) always apply.
- **Its code is never moved or renamed to fit the template.** New code follows the game's existing patterns in the folder it goes in. `Skip` folders are kept as they are (not formatted, linted or type-checked); `Protected` ones are never edited.
- The hooks, `scripts/typecheck.sh`, `scripts/wave-check.sh`, `lune run test` and the GDD tools read the layout themselves.
- `docs/ADOPT.md` records what was installed, today's check baseline and what's still open; `/adopt-game status` reads it.

## Imported Games (`docs/IMPORT.md`)
While a conversion is in progress, `src/Legacy` holds the old scripts not converted yet (not linted or type-checked, synced to their old paths by nested project files). Never require it from new code or edit it beyond what `/import-game` allows; a change to a **Legacy** system waits for `/import-game continue` to convert it.
