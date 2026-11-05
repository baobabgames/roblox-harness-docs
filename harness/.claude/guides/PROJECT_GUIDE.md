# Project Guide

Where everything lives in the repo and in the game, and the rules for packages and Rojo. Read it before adding a file, a feature, a config, a type, a signal or a remote. An adopted game has its own layout: `ADOPTED_GAMES_GUIDE.md`.

## Structure
Three folders under `src/`: `Core`, `Features`, `Loaders` (plus `Legacy` only while `/import-game` converts a game). Rojo (`default.project.json`) maps them into the game.

| On disk | In game | Holds |
|---|---|---|
| `src/Core/Shared` | `ReplicatedStorage` | `Services/`, `SharedUtilities/`, `SharedConfigs/`, `SharedTypes/`, `Network/` |
| `src/Core/Server` | `ServerScriptService` | `ServerData.luau`, `ServerSignals/` |
| `src/Core/Client` | `StarterPlayer.StarterPlayerScripts` | `ClientData.luau`, `ClientUtilities/` |

- No `.Core.` in require paths. Only these exist; a missing one (e.g. `ServerUtilities`) gets the same naming and an `init.luau`. `ReplicatedFirst` and the rest of `ServerStorage` aren't mapped (add a `default.project.json` entry first). `ReplicatedStorage.Assets` / `ServerStorage.Assets` are for Studio-built models.
- **Features:** one folder per feature (`src/Features/<Name>/Server/`, `/Client/`, only the sides it needs), each side mapped in `default.project.json` to `ServerScriptService.Features.<Name>` / `StarterPlayer.StarterPlayerScripts.Features.<Name>` (**no** `.Server` / `.Client` in require paths). Scaffold with `/new-feature`. UI lives in the `Gui` feature.
- **System / Controller / Service:** server modules ending `System` and client modules ending `Controller` are auto-required by the Loaders and their `Init` runs in its own thread, **in random order**: never name a helper that way, and never require one from other code. `...Service` modules hold logic others call (names unique per environment).

| Thing | Place |
|---|---|
| Tunable values, asset ids | `SharedConfigs/<Feature>.luau`, registered in `SharedConfigs/init.luau` |
| UI looks | `SharedConfigs/Themes.luau` (written by `/new-reference`), read with `ThemeUtil.Get` |
| Server events other features hear | `ServerSignals/<Feature>.luau` (Signal), registered in `ServerSignals/init.luau` |
| Types used across files | `SharedTypes/<Name>Type.luau` (ends with `return {}`), re-exported from `SharedTypes/init.luau` |
| Saved player fields | `Features/Player/Server/PlayerDataTemplate.luau` + `SharedTypes/ProfileType.luau` |
| Client copies of data / UI state | `ClientData.luau` |
| Code both sides use | `SharedUtilities/<Feature>Util.luau` or `Services/` |
| Remote events | `network.blink` (generates `Network/`; never edit those by hand) |

## Packages and Rojo
- `Packages/` and `CustomPackages/`: never create, install or edit them. `Packages` missing → stop and ask the user to run `wally install`; `CustomPackages` missing → restore it from git.
- **Only the user runs Rojo:** never start, restart or stop `rojo serve`, never connect the plugin. When it isn't running or synced, or needs a restart (e.g. after a `default.project.json` change), ask the user and wait for their answer before relying on synced code. Checking it (`curl -s localhost:34872/api/rojo`, looking in Studio) is fine.
- Rojo 7.7 can crash when a synced folder is deleted (`Canonicalize ... NotFound`). Delete the files inside first, then the empty folder (that kept it running). Still crashed: ask the user to restart `rojo serve` and reconnect, then check Studio for leftover copies.
- After testing, delete every temporary test file and undo test-only config changes.
- **Scripts that run git or delete files** start with `set -e` and first check they're in the intended folder (`cd <dir> || exit 1`), so a failed step never runs the rest in this repo.
