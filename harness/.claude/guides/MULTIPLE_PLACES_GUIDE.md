# Multiple Places Guide

Follow this when you **add a place**, **add a feature**, or **move code between places**. `CODE_GUIDE.md` and `PROJECT_GUIDE.md` still apply. **Today:** one `default.project.json` maps `src/Core/{Shared,Server,Client}` to ReplicatedStorage / ServerScriptService / StarterPlayerScripts and each feature into a `Features` folder per service. The Loaders (`src/Loaders/Loader.server.luau` / `Loader.client.luau`) use `LoadModules(parent, pattern)` to require ModuleScripts under `Features` named `System$` (client `Controller$`), then `Loader.SpawnAll(modules, "Init")`. One `network.blink` generates `src/Core/Shared/Network`.

## 1. Folder layout

```
src/
  Common/                         usable by every place
    Core/
      Client/   → StarterPlayerScripts        ClientData, ClientUtilities
      Server/   → ServerScriptService         ServerData, ServerSignals
      Shared/   → ReplicatedStorage           Services, SharedUtilities, SharedTypes, SharedConfigs, Network
    Features/Player/{Client,Server}, Monetization/{Client,Server}
  Places/
    Lobby/                        everything only Lobby has
      Core/Client/ → StarterPlayerScripts.Place
      Core/Server/ → ServerScriptService.Place   PlaceDataTemplate
      Core/Shared/ → ReplicatedStorage.Place     PlaceConfig, Network
      Features/Onboarding/{Client,Server}
      Loaders/Loader.server.luau, Loader.client.luau
    World2/  ...same shape...
Common.blink  Lobby.blink  World2.blink     network IDL, one per place + Common
Lobby.project.json  World2.project.json     one project file per place
```

- **Client / Server / Shared stay split everywhere.** Server folders only map into ServerScriptService, so server code never replicates.
- **Common Core owns the service roots**, so requires like `ServerScriptService.ServerData` keep working.
- **A place's Core sits under a child named `Place`** (`ReplicatedStorage.Place.PlaceConfig`), so names never collide with Common.

## 2. Project files

- **Naming:** `<PlaceName>.project.json` = `src/Places/<PlaceName>/`. Its `"name"` is the place name.
- **Nothing is shared automatically.** Every project file maps Common itself (Core roots, Common features, Packages). **Keep the Common lines identical across files.** Copy them, never retype them.
- **One `$path` per instance.** Common and place folders go side by side as separate children (`$path` = Common Core, `Place` = place Core). Never merge two folders into one instance.
- A place can add a child inside a Common feature (a "slot", section 3) if the Common folder has no child with that name.

### Template (copy, then replace `Lobby` and the IDs)
```json
{ "name": "Lobby", "servePort": 34872, "servePlaceIds": [1234567890],
  "tree": { "$className": "DataModel",
    "ReplicatedStorage": { "$path": "src/Common/Core/Shared",
      "Place": { "$path": "src/Places/Lobby/Core/Shared" },
      "Features": { "$className": "Folder" },
      "Packages": { "$path": "Packages" }, "CustomPackages": { "$path": "CustomPackages" } },
    "ServerScriptService": { "$path": "src/Common/Core/Server",
      "Place": { "$path": "src/Places/Lobby/Core/Server" },
      "Features": { "$className": "Folder",
        "Player": { "$path": "src/Common/Features/Player/Server" },
        "Onboarding": { "$path": "src/Places/Lobby/Features/Onboarding/Server" } },
      "Loader": { "$path": "src/Places/Lobby/Loaders/Loader.server.luau" } },
    "StarterPlayer": { "StarterPlayerScripts": { "$path": "src/Common/Core/Client" } } } }
```
`StarterPlayerScripts` mirrors the server side: `Place` → `Core/Client`, a `Features` folder with the `/Client` paths, `Loader` → `Loader.client.luau`.

- `servePort`: a different port per place, so two can be served at once. `servePlaceIds`: the Rojo plugin refuses to sync this file into any other place. Leave it out until the place exists.

### Commands (repo root; Rojo is a project-managed tool)
```bash
rojo serve Lobby.project.json
rojo build Lobby.project.json -o build/Lobby.rbxl
rojo sourcemap Lobby.project.json -o sourcemap.json
```

- Changed a project file? **Restart `rojo serve`** (or reconnect the plugin). It doesn't pick up new mappings live.

### Place IDs
| Project file | Place | Place ID |
|---|---|---|
| `Lobby.project.json` | Lobby (start place) | `SharedConfigs.Places.Lobby` |
| `World2.project.json` | World2 | `SharedConfigs.Places.World2` |

- Keep this table, `servePlaceIds` and `SharedConfigs.Places` in sync.
- **To publish:** open that place in Studio (Creator Hub), `rojo serve <Place>.project.json`, sync, then File → Publish.

### default.project.json: remove it
- With several places "default" is ambiguous (a bare `rojo serve` would silently pick it) and it drifts as a second copy of one place's mappings.
- **Instead:** pass the file explicitly every time. For luau-lsp, generate `sourcemap.json` from the place you work on.
- Update anything that still names `default.project.json`: `.claude/skills/*`, `.claude/agents/*`, and this guide's examples.

## 3. Common features and loading

- A **Common feature** is a full feature (`Client/`, `Server/`, optional `Shared/`) in `src/Common/Features/<Name>/`.
- **It only loads where it's mapped.** The Loaders only scan `ServerScriptService.Features` and `PlayerScripts.Features`, so each place maps it into those same `Features` folders. No mapping in a project file = that place doesn't have it.
**Decision rule**
- Used by **2+ places with the same code** → Common.
- **Different values or behavior** → place-only, or Common plus place config. Unsure? Start place-only, move to Common when a second place needs it.
**Dependency direction: Place → Common only.**
- Common code **never** requires a place's features.
- The one exception is the **place contract**: data-only modules every place provides at fixed names. Common may read these and nothing else from a place:

| Contract module | Holds |
|---|---|
| `ReplicatedStorage.Place.PlaceConfig` | `{ Name = "Lobby", ... }`, values Common features read |
| `ServerScriptService.Place.PlaceDataTemplate` | This place's own PlayerData fields (section 5) |
**Customizing without forking**
- **Data:** Common holds a base template; each place adds its own fields (section 5).
- **Values:** Common reads the place's config, e.g. `local maxStep = PlaceConfig.Onboarding and PlaceConfig.Onboarding.MaxStep or 0` (`PlaceConfig = require(ReplicatedStorage.Place.PlaceConfig)`).
- **Content slots:** the Common feature loads a child folder by name, and each place fills it from its project file. The feature must work when the slot is missing (`FindFirstChild`, not `WaitForChild`).
  ```json
  "Cutscenes": { "$path": "src/Common/Features/Cutscenes/Client",
    "Cutscenes": { "$path": "src/Places/Lobby/Features/Cutscenes/Client/Cutscenes" } }
  ```
  Slot candidates today: `Cutscenes/Client/Cutscenes`, `Leaderboards/Server/Boards`, `Monetization/Server/Monetizations`, `Onboarding` step modules.

## 4. Splitting the current single project

1. **List the places** and pick the start place (likely `Lobby`). The main place keeps everything at first.
2. **Create the folders:** `src/Common/{Core,Features}` and `src/Places/<Main>/{Core/{Client,Server,Shared},Features,Loaders}`.
3. **Move Core** with `git mv` so history follows.
   - To `src/Common/Core`: ServerData, ServerSignals, ClientData, ClientUtilities, SharedUtilities, SharedTypes, Services, experience-wide configs (Monetization).
   - To `src/Places/<Main>/Core`: place-only values (e.g. the Onboarding config → `PlaceConfig`).
4. **Move features** by the decision rule. Starting point for this repo:
   - **Common:** Player, Monetization, Inputs, DeveloperTools, Analytics.
   - **Common with slots:** Cutscenes, Leaderboards.
   - **Place-only:** Onboarding, Gui.
5. **Move the Loaders** to `src/Places/<Main>/Loaders/` unchanged.
6. **Split the network:** move `network.blink` → `Common.blink` (only events Common features use). Create `<Main>.blink` with `option RemoteScope = "PLACE"` for the rest. Regenerate both (section 7).
7. **Fix requires.** Place-Core and place-network paths gain `.Place` (`ReplicatedStorage.Place.Network.ServerNetwork`). Common paths don't change. Find leftovers:
   ```bash
   git grep -n "ReplicatedStorage.Network\|SharedConfigs\.\|script.Parent.Parent" -- src/Places
   ```
8. **Make Common features tolerate missing slots and config** (FindFirstChild, defaults).
9. **Write `<Main>.project.json`** from the template and delete `default.project.json`.
10. **Add the second place:** copy the Common lines exactly, map only the features it uses.
11. **Find duplication** once two places exist. Identical feature folders belong in Common (no output = identical; move it, checklist c):
    ```bash
    diff -rq src/Places/Lobby/Features/Shop src/Places/World2/Features/Shop
    ```
12. **Build every place** (`rojo build <Place>.project.json -o build/<Place>.rbxl`) and play-test each in Studio.

## 5. Player data across places

- **One profile and one DataStore for all places** (same experience). The Common Player feature owns the template.
- **Common has the base:** `Features/Player/Server/PlayerDataTemplate.luau` plus `SharedTypes/ProfileType.luau`.
- **Each place adds only its own fields, namespaced under its name,** so two places never write the same field:
  ```lua
  -- src/Places/World2/Core/Server/PlaceDataTemplate.luau
  return { BossesBeaten = 0, Checkpoint = 1 } -- saved as PlayerData.Places.World2
  -- Common PlayerSystem, before DataService:init
  local template = TableUtil.Copy(PlayerDataTemplate, true)
  template.Places = { [PlaceConfig.Name] = PlaceDataTemplate }
  ```
  Reconcile only **adds** missing keys, so other places' `Places.<Name>` tables load and save back untouched.
- **Types:** the base `PlayerData` type has `Places: { [string]: any }`. Each place types its own sub-table in its Core types.
- **No double writes:** ProfileStore session-locks a profile to one server. The real risk is *old code*:
  - There is no versioning yet. Before the first rename or retype, add `DataVersion = 1` to the base template and a Common `Player/Server/Migrations.luau` that runs each migration in order on load.
  - **Adding** a field needs no migration. **Renaming, retyping or moving** one needs a migration and a `DataVersion` bump.
  - A server whose code knows an older `DataVersion` than the profile **must not save it**. Kick with "Updating, please rejoin".
  - **Never delete** a field any published place still reads.
  - Changing the base schema → **publish every place**.

## 6. Teleporting between places

- **Place IDs in one Common config:** `src/Common/Core/Shared/SharedConfigs/Places.luau` returns `{ Lobby = 1234567890, World2 = 2345678901 } :: { [string]: number }`.
- **One shared type:** `src/Common/Core/Shared/SharedTypes/TeleportType.luau`: `export type TeleportData = { From: string, Spawn: string? }`.
- **One Common service does all teleports** (e.g. `PlaceTeleportService`; don't name it `TeleportService`). Use `TeleportService:TeleportAsync(placeId, players, options)` from the server, in a `pcall`, and retry on `TeleportInitFailed`.
- **Read on arrival** (server): `player:GetJoinData().TeleportData`. It passes through the client, so **never trust it** for currency, rewards or progress. Use it only for hints like the spawn point. Real state lives in the profile.
- **Reserved servers:** `TeleportService:ReserveServer(placeId)` returns an access code. Pass it as `TeleportOptions.ReservedServerAccessCode`. The code is server-only: store it (MemoryStore) if more players join later. A reserved server has `game.PrivateServerId ~= ""` and `game.PrivateServerOwnerId == 0`. Teleports don't work in Studio: test them in a published experience.

## 7. Shared setup

- **Packages:** `wally install` once at the repo root (restores `Packages/`). `CustomPackages/` is committed to git, not installed by Wally. Every project file maps `ReplicatedStorage.Packages` and `.CustomPackages` with identical lines. Never copy packages per place.
- **Network (Blink):**
  - `Common.blink`: Common features' events. Outputs `src/Common/Core/Shared/Network` (→ `ReplicatedStorage.Network`), default remote scope.
  - `<Place>.blink`: that place's events. Outputs `src/Places/<Place>/Core/Shared/Network` (→ `ReplicatedStorage.Place.Network`) with `option RemoteScope = "PLACE"`, so its remotes (`PLACE_BLINK_*`) never collide with Common's.
  - Regenerate after any `.blink` change, from the repo root (never edit the output): `blink Common.blink`, `blink Lobby.blink`.
- **Loaders:** each place has its own pair in `Loaders/`. They scan the `Features` folders (Common and place features together) for names ending in `System` / `Controller`. Start every place from a copy of the current Loaders (`LoadModules` + `Loader.SpawnAll`). Change them only for place-specific start-up, such as a loading screen.

## 8. Checklists
**(a) Add a new place**
1. Create the place in the experience (Creator Hub), note its place ID.
2. Create `src/Places/<Name>/{Core/{Client,Server,Shared},Features,Loaders}` with `PlaceConfig` and `PlaceDataTemplate`; copy the Loaders.
3. Copy a project file to `<Name>.project.json`: set `name`, `servePort`, `servePlaceIds`; point `Place` and `Loader` at the new folder; keep the Common lines identical.
4. Add the ID to `SharedConfigs.Places` and the table in section 2.
5. Create `<Name>.blink` (`RemoteScope = "PLACE"`), run `blink <Name>.blink`. Build, serve, play-test.
**(b) Add a feature**
1. Decide place-only or Common (section 3). Create it in `src/Places/<Place>/Features/<Name>/` or `src/Common/Features/<Name>/`, split `Client/Server/Shared`.
2. Add its events to `<Place>.blink` or `Common.blink`, regenerate.
3. Map it into `Features` in **every** project file that should have it. Restart `rojo serve`, build every place that maps it.
**(c) Move a feature from a place to Common**
1. `git mv` it to `src/Common/Features/<Name>/`. Remove place-only requires: values → `PlaceConfig` reads, content → slots.
2. Move its events from `<Place>.blink` to `Common.blink`, regenerate both, fix the `Network` require path.
3. Update **every** project file: old place path → Common path, plus each other place that should get it.
4. Delete duplicate copies in other places. Build all places.
**(d) Before publishing any place**
1. `blink` was run for Common and every changed place; generated files are committed.
2. `rojo build` succeeds for **every** place; the Common lines are identical in all project files (diff them).
3. Schema changed? `DataVersion` bumped, migration written, all places published together.
4. Play-tested in Studio; teleports tested in the published experience.
5. Publishing to the right place ID (the plugin's `servePlaceIds` check passed).

## 9. Common mistakes

- **Name collisions in one container:** a Common and a place feature both called `Shop` in `Features`, two `ShopService` modules in one environment, or a slot name that exists in the Common folder. Rojo makes same-named siblings and `require` picks one at random. Rename one.
- **Stale duplicates:** an old copy left in a place after moving a feature to Common keeps loading (if mapped) or drifts. Delete it in the same commit.
- **A place requiring another place's code:** `src/Places/Lobby` must never reference `src/Places/World2`. That code isn't in the other build. Shared code belongs in Common.
- **Common requiring place code** beyond the contract modules breaks every place without it.
- **Common mapped in one project file but not another:** the feature silently doesn't load there (no error). Diff the project files after every mapping change.  Also restart `rojo serve` after every project-file edit, or you test old mappings.
- **Two Blink outputs with the same remote scope:** Blink errors at runtime ("already running with the remote scope"). Places use `PLACE`, Common uses the default.
