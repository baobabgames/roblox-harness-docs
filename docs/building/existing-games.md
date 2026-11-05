---
sidebar_position: 4
title: Bring in an existing game
---

# Bring in a game you already made

Two ways, for a game made without this template:

| | **Adopt** (`/adopt-game`) | **Convert** (`/import-game`) |
|---|---|---|
| Where | In the game's own repo | In a new copy of the template |
| Your code | Kept as it is: nothing moved or rewritten | Every system rewritten into the template's structure |
| Use it when | You keep working on the game the way it is | You want it to become a standard harness game |
| Time | About 30 minutes | Aims for 1–2 hours |

## Adopt

Commit the game first, then run **`/adopt-game`** in its repo. It:

1. **Reads** how the game is laid out (project files, Rojo port, Blink files, code folders, UI approach, saved data, its own `CLAUDE.md`) and drafts `harness-layout.json`, a short map of where the game keeps things.
2. **Asks once:** is the map right, format the code now or as it's edited, which extras (GitHub checks, references, the asset library, shared lessons), any missing harness helpers, and which docs to write.
3. **Installs** the harness files and merges the tool configs (`rokit.toml`, `selene.toml`, `.gitignore`) without replacing the game's own.
4. **Records a baseline** of today's lint and type issues (`harness-baseline.json`), so checks only flag new ones. It never fixes the game's code; anything that looks like a bug goes in the report.
5. **Writes the docs** you picked, so `/revise-gdd`, `/playtest`, `/checkfeature` and the agents work on the game, and records everything in `docs/ADOPT.md`.

The game's own `CLAUDE.md` keeps winning over the harness's defaults. `/adopt-game status` shows the layout, the baseline and what's open.

## Convert

Make a new copy of the template, run `/setup`, open the old place in Studio, then run **`/import-game`**.

1. **What's open.** It asks whether Studio has a place file, a copy of your game or your main game open (for the main game it asks before converting there). Then it asks whether to read straight from Studio, or from a file you save to `build/import/` (faster for big games, and a backup).
2. **Read.** Pulls every script out, reads all the code, plays the game in Studio, then shows the systems, the conversion order, the exploits it will fix and the bugs it will leave, and asks one short round of questions.
3. **Convert, in one run.** Rewrites every system in waves: same rules and numbers, Blink instead of remotes, UI in Vide (by default the same screens, pixel-exact), exploits fixed, and players' old saves copied into their new profile the first time they join (the old data stores are never touched). A long game can stop at a playable point after about 2 hours and finish later with `/import-game continue`.
4. **Docs, only if you want them.** At the end it asks which to write: the game plan, the GDD as built, the asset list, feature docs, the art style. `/import-game docs` writes them later; `/import-game status` shows progress.
