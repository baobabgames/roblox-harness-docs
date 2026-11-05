---
sidebar_position: 2
title: Getting started
---

# Getting started

## Start a new game

1. On GitHub, click **Use this template** on the harness repo (or copy it).
2. Open the new repo in Claude Code.
3. Run **`/setup`**.

`/setup` checks everything first, asks all its questions in one round (each with a recommended answer), then does the rest:

| Part | What it does |
|---|---|
| **Toolchain** | Installs the tools, makes the sourcemap and network modules, and tells you when to run `wally install` (only you run Wally and Rojo) |
| **Identity** | Renames the project, adds the `template` remote so `/update-harness` works, and points `origin` at your game's own repo |
| **Defaults** | Developer UserIds |
| **Old content** | Clears the art style and build docs left from the template's earlier games |
| **Connections** | Checks Studio (Blender and Figma are only reported) |
| **Extras** | Pulls the template's shared lessons, makes the first commit, and hands off to `/new-gdd` or `/build-gdd` |

Run it again any time: it shows what's done and only asks about what's left.

Game choices (one or several places, references, the art style, the Studs look, the UI tool, Blender and Figma) aren't asked here. `/build-gdd` asks them when the build needs them.

## Set up by hand

From the repo root:

```bash
rokit install
wally install
rojo sourcemap -o sourcemap.json
wally-package-types --sourcemap sourcemap.json Packages/
blink network.blink
```

| Command | Why |
|---|---|
| `rokit install` | Installs Blink, Wally, StyLua, selene, luau-lsp and [Lune](https://lune-org.github.io/docs). Rojo comes from `aftman.toml` |
| `wally install` | Downloads the packages |
| `rojo sourcemap` | Lets the language server and type checker see the place's structure |
| `wally-package-types` | Lets the type checker see package types (`Signal.Signal`, `Janitor.Janitor`, ...) |
| `blink network.blink` | Generates the network modules in `src/Core/Shared/Network`. Never edit those by hand |

Then rename the project: `"name"` in `default.project.json`, `name` in `wally.toml` and `wally.lock`, and the README.

## Connect Studio

Open your place in Studio, start Rojo, and connect the Rojo plugin:

```bash
rojo serve
```

Restart `rojo serve` after changing `default.project.json`: a running server keeps the old mappings.

For Claude to build and test in Studio, connect the **Roblox Studio MCP**. Blender (models) and Figma (UI design) are optional; see [Studio, Blender and assets](reference/studio-blender-assets.md).

## Fill in what `/setup` leaves for later

- `src/Core/Shared/SharedConfigs/`: monetization ids, and onboarding (`Enabled` and `MaxStep` once the game has a tutorial).
- Sounds in SoundService (e.g. `RobuxBuy`), and music playlists in `SoundsService/PlayLists.luau`.

## Open these docs

In Claude Code, run **`/open-docs`**: it starts this site on your PC and opens it in your browser. `/open-docs <topic>` opens a topic's page, e.g. `/open-docs skills`.

Without Claude: install [Node.js](https://nodejs.org) (LTS), then in the `website` folder run `npm install` once and `npm start`, and open http://localhost:3000.

## Next

- Have an idea? Run `/game-ideas` for inspiration or `/new-gdd <idea>` to design it. See [Build a game](building/build-a-game.md).
- Want one feature at a time? `/new-feature` scaffolds a feature folder, and `/playtest` tests it in Studio.
