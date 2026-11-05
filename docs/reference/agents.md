---
sidebar_position: 2
title: Agents
---

# Agents

Agents are specialists Claude hands work to. Each one lives in `.claude/agents/<name>.md` with its own tools and instructions. Most run inside the skills; you can also ask for one by name ("run the balance-checker on the shop").

**Read-only** agents never change files: they review and report.

## Builders

| Agent | What it does |
|---|---|
| `system-builder` | Builds or changes one game system in code (Services, Systems, Controllers, configs, tests, Plain UI) from a build brief, then self-checks. The builder in every `/build-gdd` and `/revise-gdd` round |
| `ui-builder` | Builds the game's UI in Vide, mobile-first: Plain by default, or the game's own style when you ask for one. Views plus UI Labs stories |
| `studio-builder` | Builds the world and models in the open Studio place (map areas, props, lighting, library copies), then checks its own build |
| `blender-builder` | Builds models in Blender, renders them for review, and only after you approve exports, uploads and places them in Studio |
| `figma-designer` | Designs UI screens in Figma (phone-size frames, states, art), then on approval exports the art and writes the build spec for the `ui-builder` |

## Reviewers (read-only)

| Agent | What it does |
|---|---|
| `gdd-reviewer` | Before a build, turns the GDD or a change into questions with a recommended answer each. After, checks the build against the GDD and your answers. In Polish, ranks up to 10 improvement ideas |
| `feature-reviewer` | Reviews a finished feature for bugs, exploits, performance, readability and structure |
| `edge-case-tester` | Hunts for real-play breakages: leaving mid-action, respawn, late join, lag, spam, destroyed instances, data not loaded |
| `design-critic` | Attacks a GDD or change doc: where players quit, walls, weak retention, unfair monetization, missing numbers. Only when you ask (it uses Opus) |
| `balance-checker` | Reviews game-balance numbers (stats, economy, costs, upgrades, XP curves, drop rates). Only when you ask |
| `ui-checker` | Checks UI just built at phone and PC size, and returns one fix list |
| `model-reviewer` | Judges a Blender model pass against the reference images and style pack: PASS or FIX |

## Fixers and writers

| Agent | What it does |
|---|---|
| `type-fixer` | Fixes Luau type errors without changing behavior |
| `migration-helper` | Replaces deprecated Roblox and Luau APIs (`wait`, `spawn`, `delay`, `tick`, body movers...) without changing behavior |
| `doc-writer` | Writes or updates a finished system's doc in `docs/` and its `docs/FEATURES.md` lines. Never edits code |

## Import only

| Agent | What it does |
|---|---|
| `import-reader` | Reads part of an old game's code during `/import-game` and writes one notes file per system |
| `import-builder` | Converts one old-game system into harness form during `/import-game` |
