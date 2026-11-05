---
sidebar_position: 1
title: Skills
---

# Skills

Skills are slash commands you type in Claude Code. Each one lives in `.claude/skills/<name>/SKILL.md`.

## Design and build

| Skill | What it does |
|---|---|
| `/game-ideas [theme] [--research]` | Brainstorms 8–10 scored game ideas (or twists and content for a built game), with a shortlist; keeps every idea in `docs/ideas/`. Only runs when you type it |
| `/new-gdd <idea>` | Turns an idea into a build-ready GDD in `docs/gdd/`: concepts to pick from, research on comparable games and how each mechanic can be built on Roblox, MVP / Looks / Polish stages, an economy checked by the simulator, and a `design-critic` pass. `check <path>` does the same for a GDD you bring |
| `/build-gdd <GDD>` | Builds a game from a GDD in four stages (MVP, Looks, Polish & UX, Wrap-up), each a loop of questions → build → review → approval. Resumes where it left off. See [Build a game](../building/build-a-game.md) |
| `/revise-gdd <change>` | Changes a finished, adopted or imported game with the same loop. See [Change your game](../building/change-your-game.md) |
| `/new-feature` | Scaffolds a feature folder (`src/Features/<Name>`) with System / Controller / Service files, Rojo mappings, Blink events and signals so it loads on the first try. Player-facing ones start from the matching design patterns |
| `/new-pattern <Name>` | Adds a design pattern (AI-researched, written by you, or both). `review <Name>` has the AI check one, `approve <Name>` makes it a rule, `queue` walks through the drafts |

## Test and check

| Skill | What it does |
|---|---|
| `/playtest` | Play-tests a feature or change in Studio with temporary test scripts, then cleans up and reports pass / fail |
| `/pacing-test [--minutes N] [--profile active\|casual]` | A bot plays the built game and times every progression step against the GDD and the economy simulator |
| `/checkfeature` | Audits a feature folder for logic and math errors, bugs and security issues |
| `/explainfeature` | Explains in plain language how a feature folder works: files, flows, data, events, how to extend it |

## References, assets and style

| Skill | What it does |
|---|---|
| `/new-reference <Name>` | Turns a folder in `references/<Name>/` (screenshots, models, places, meshes, code, notes; any kind) into `REFERENCE.md` with exact values, plus a UI theme for style references |
| `/new-library-models` | Catalogs your ready-made assets in `library/` into `library/CATALOG.md`, so Claude offers to reuse them before building something new |
| `/new-model-style` | Turns reference images into a Blender style pack (`.claude/blender/styles/<Style>/`) and calibrates it with one reviewed model |

## Existing games

| Skill | What it does |
|---|---|
| `/adopt-game` | Puts the harness on top of a game made without the template, without moving or rewriting its code. `status` shows what's open |
| `/import-game` | Converts a game into harness form in one run. `continue`, `docs` and `status` |

See [Bring in an existing game](../building/existing-games.md).

## Project and harness

| Skill | What it does |
|---|---|
| `/setup` | Sets up a new game made from the template. Rerun any time to see what's left |
| `/open-docs [topic]` | Opens this docs site in your browser on your PC: checks Node.js, installs the site's packages the first time, starts it and opens the page. `/open-docs skills` opens a topic's page |
| `/better-commit` | Commits with a typed title (feat / added / update / removed / fixed / mixed) and a plain-language description |
| `/changelog` | Adds a dated, plain-language entry to the changelog from the commits since the last entry |
| `/share-lessons` | Sends this game's picked lessons, patterns and design to the template as a branch for a pull request. `pull` brings the template's in |
| `/update-harness` | Brings the template's latest harness into this game, merged with the game's own changes |
| `/harness-report [--since <date>]` | Compares harness versions on real usage (tokens, cost estimate, active time, agents) from this machine's session transcripts, as an HTML report |
