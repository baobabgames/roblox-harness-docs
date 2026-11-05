# Cutscenes

The server decides who sees which cutscene, and the client plays it. Each cutscene is a list of sequences (shots). Cutscenes marked play-once are saved per player in `PlayerData.CutscenesSeen`, so the player doesn't see them again.

## Files
- [`Server/CutsceneSystem.luau`](../src/Features/Cutscenes/Server/CutsceneSystem.luau): connects the `CutsceneFinished` remote (type-checks the payload) and `PlayerRemoving` (Server)
- [`Server/CutsceneService.luau`](../src/Features/Cutscenes/Server/CutsceneService.luau): **server** CutsceneService. Sends cutscenes to players, tracks what each player is watching, saves seen cutscenes (Server)
- [`Server/PlayOnceCutscenes.luau`](../src/Features/Cutscenes/Server/PlayOnceCutscenes.luau): config table `{ [cutsceneName]: true }` listing the play-once cutscenes. Ships empty (Server)
- [`Client/CutsceneController.luau`](../src/Features/Cutscenes/Client/CutsceneController.luau): connects the `PlayCutscene` / `SkipCutscene` remotes to the client service (Client)
- [`Client/CutsceneService.luau`](../src/Features/Cutscenes/Client/CutsceneService.luau): **client** CutsceneService. Loads cutscene modules, runs their sequences and reports the end of server-sent cutscenes (Client)
- `Client/Cutscenes/`: one ModuleScript per cutscene. Ships with only a `.gitkeep` (Client)
- [`CutsceneUtil/init.luau`](../src/Core/Client/ClientUtilities/CutsceneUtil/init.luau): hides and restores PlayerGui guis, and exposes `CameraCutscenes` (Client)
- [`CutsceneUtil/CameraCutscenes.luau`](../src/Core/Client/ClientUtilities/CutsceneUtil/CameraCutscenes.luau): camera helpers for baked frame animations, tweened or snapped moves, and following a part (Client)
- [`ServerSignals/Cutscenes.luau`](../src/Core/Server/ServerSignals/Cutscenes.luau): the `Started` and `Finished` signals (Server)

## Two CutsceneServices
| | Server | Client |
|---|---|---|
| Require | `ServerScriptService.Features.Cutscenes.CutsceneService` | `StarterPlayer.StarterPlayerScripts.Features.Cutscenes.CutsceneService` |
| Job | Decides who plays what, enforces play-once, saves seen | Runs the cutscene module locally |
| `Play` | `Play(players, name, force?)` fires the remote | `Play(name)` runs it locally only |

Gameplay code should call the **server** `Play`. The client `Play` doesn't tell the server and never reports its end, so play-once and the `Cutscenes` signals only work through the server.

## How it connects
- **Uses (server):** `ServerNetwork` (`PlayCutscene`, `SkipCutscene`, `CutsceneFinished`), `ServerData.ProfileDatas`, `ServerData.Plums.ProfilesPlum`, `ServerSignals.Cutscenes`, `PlayOnceCutscenes`
- **Uses (client):** `ClientNetwork`, `Packages.Loader` (`LoadChildren` on the `Cutscenes` folder), `Packages.Janitor` (CameraCutscenes)
- **Used by:** nothing in `src/` calls either `CutsceneService.Play` yet. `CutsceneUtil` is exposed through `ClientUtilities.CutsceneUtil` and is meant to be used inside cutscene modules. A DeveloperTools doc comment shows a sample `cutscene` Cmdr type (`{ "Intro" }`) as an example only
- **Starts:**
  - `CutsceneSystem.Init`: `CutsceneFinished.On(...)` (checks `Name` is a string and `Completed` a boolean, then calls `CutsceneService.ReportFinished(player, name, completed)`) and `PlayerRemoving -> CutsceneService.Clear`
  - `CutsceneController.Init`: `PlayCutscene.On(CutsceneService.PlayFromServer)` and `SkipCutscene.On(CutsceneService.StopFromServer)`

## Flow
1. Server `CutsceneService.Play(player, "Intro")` skips the player if the cutscene is play-once and the player has seen it (or their profile isn't loaded yet). If another cutscene is playing, it fires `Finished(player, old, true)` for it. Then it sets `playing[player]`, fires `PlayCutscene`, then fires `Started`.
2. Client `PlayFromServer("Intro")` stops any current cutscene first (without reporting it, even if "Intro" then can't play), then runs `Init` and each sequence.
3. Every end of a server-sent cutscene is reported with `CutsceneFinished({ Name, Completed })`:
   - `Completed = true`: every sequence played through.
   - `Completed = false`: missing module, `CanRun` returned false, `Init` or a sequence errored, or it was stopped locally (`Stop`, or a local `Play` replacing it).
4. The server checks `Name` matches `playing[player]`, clears it, calls `MarkSeen` only if completed, and fires `Finished(player, name, not completed)`.
5. Or the server `Skip(player)` fires `SkipCutscene`. The client stops without reporting, and the server calls `MarkSeen` and fires `Finished(player, name, true)`.

## Public API: server `CutsceneService`
### `CutsceneService.Play(players: Player | { Player }, name: string, force: boolean?) -> ()`
- For each player: unless `force` is set, does nothing when `HasSeen(player, name) ~= false` (a seen play-once cutscene, or a play-once cutscene with no profile loaded yet).
- If the player is already watching one, it's ended with `Finished(player, old, true)` and isn't marked seen. Then it records the new one as playing, fires `PlayCutscene` and fires `Started`.
- `force`: plays even if seen or the profile isn't loaded (e.g. dev commands). Default `false`.
- Doesn't check that the client has a module with that name (the client reports `Completed = false` if it doesn't).
```lua
CutsceneService.Play(player, "Intro")
CutsceneService.Play(Players:GetPlayers(), "BossIntro", true)
```

### `CutsceneService.Skip(player: Player) -> ()`
- If the player is watching a cutscene: clears it, fires `SkipCutscene`, calls `MarkSeen`, then fires `Finished(player, name, true)`. Does nothing otherwise.

### `CutsceneService.GetPlaying(player: Player) -> string?`
- Name of the cutscene the server last sent and hasn't seen end yet, or `nil`.

### `CutsceneService.HasSeen(player: Player, name: string) -> boolean?`
- `false` if `name` isn't in `PlayOnceCutscenes`. `nil` if the profile isn't loaded. Otherwise `PlayerData.CutscenesSeen[name] == true`.

### `CutsceneService.MarkSeen(player: Player, name: string) -> ()`
- Sets `PlayerData.CutscenesSeen[name] = true` through the ProfilesPlum, so it replicates and saves. Does nothing for cutscenes that aren't play-once, for players with no Plum, or if the cutscene is already seen.

### `CutsceneService.ReportFinished(player: Player, name: string, completed: boolean) -> ()`
- Called by `CutsceneSystem` for the `CutsceneFinished` remote. Ignored unless `name == playing[player]`.
- Clears `playing[player]`, calls `MarkSeen` only if `completed`, then fires `Finished(player, name, not completed)`.

### `CutsceneService.Clear(player: Player) -> ()`
- Removes `playing[player]`. Called on `PlayerRemoving`. Doesn't fire signals or tell the client.

## Public API: client `CutsceneService`
### `CutsceneService.Play(name: string) -> ()`
- Plays a cutscene on this client only. The server isn't told and its end is never reported.
- Warns and returns if the module `Cutscenes/<name>` is missing or has no `Sequences`. Returns quietly if `CanRun()` returns false. In both cases the current cutscene keeps playing.
- Otherwise it stops the current cutscene (reporting it as not completed if the server sent it), calls `cutscene.Init()` in a `pcall` **synchronously** (so it yields if `Init` yields), then runs the sequences in a `task.spawn` thread. If `Init` errors, it warns and ends the cutscene (cleanup runs).

### `CutsceneService.Stop() -> ()`
- Ends the current cutscene: cancels its thread if it's suspended, runs the current sequence's `Cleanup`, then the cutscene's `Cleanup`. Skips `Finished`. A server-sent cutscene is reported as `Completed = false`. Does nothing if no cutscene is playing.

### `CutsceneService.IsPlaying() -> boolean`

### `CutsceneService.PlayFromServer(name: string) -> ()`
- Used by `CutsceneController` for `PlayCutscene`. Same as `Play`, but the cutscene is marked server-sent so its end is reported. If it can't play (missing module, `CanRun` false) it reports `Completed = false` straight away. The cutscene already playing is always stopped first, **without** reporting (the server already replaced it), even when the new one then can't play.

### `CutsceneService.StopFromServer() -> ()`
- Used by `CutsceneController` for `SkipCutscene`. Same as `Stop`, but never reports (the server already knows).

### Types
```lua
export type Sequence = { Start: () -> (), Cleanup: (() -> ())? }
export type Cutscene = {
	Sequences: { Sequence }, CanRun: (() -> boolean)?,
	Init: (() -> ())?, Finished: (() -> ())?, Cleanup: (() -> ())?,
}
```
- Run order: `Init` → for each sequence: `Start` (it may yield) then `Cleanup` → at the end: `Finished`, report `CutsceneFinished` (server-sent only), then `Cleanup`.
- If a `Start` errors, it's caught with `pcall`. It warns and ends the cutscene as not completed (no `Finished`, reported `Completed = false` if server-sent). The sequence and cutscene `Cleanup` still run.

## Public API: `CutsceneUtil` (client)
Require it with `require(StarterPlayer.StarterPlayerScripts.ClientUtilities).CutsceneUtil`.

### `CutsceneUtil.DisableAllGui(excluded: string | { string }?, index: (string | number)?) -> () -> ()`
- Disables every enabled `LayerCollector` in PlayerGui except the excluded names, and records them under `index` (or a private default batch). Calling it twice on the same index adds to the batch.
- Returns a cleanup that does the same as `RestoreGui(index)`.

### `CutsceneUtil.RestoreGui(index: (string | number)?) -> ()`
- Re-enables only the guis that batch disabled, skipping any that were destroyed. Calling it again is safe.

### `CutsceneUtil.CameraCutscenes`
Every function takes over the camera from whatever held it before (only one driver at a time). They all return a cleanup that releases the camera. That cleanup does nothing once something else has taken over. Releasing sets `CameraType = Custom`, points `CameraSubject` at the current humanoid, and restores the camera CFrame from before the **first** takeover (only if it's still the same character).

- `CameraCutscenes.Play(cameraFolder: Folder) -> () -> ()`: plays the `CFrameValue`s named `"1"`, `"2"`, ... in `cameraFolder.Frames`, at 60 per second, on `RenderStepped`. Sets `Humanoid.AutoRotate = false` while it plays. Releases on its own when it runs out of frames. If there's no `Frames` folder, it warns and releases.
- `CameraCutscenes.MoveCamera(options: MoveCameraOptions) -> () -> ()`: tweens to `options.CFrame` if `TweenInfo` is set. Otherwise it snaps there and waits `Duration` seconds. Then it waits `DelayFinish`, calls `FinishCallback`, and releases if `ResetOnFinish` is set. If neither `TweenInfo` nor `Duration` is set, it warns and returns a no-op. `CameraType` defaults to `Scriptable`.
- `CameraCutscenes.AttachToPart(part: BasePart, config: { Duration: number? }?) -> () -> ()`: sets the camera CFrame to `part.CFrame` every frame. Releases after `Duration` if it's set, or when the part is removed.
- `CameraCutscenes.ResetCamera() -> ()`: releases whoever holds the camera. If nobody does, it cleans up and sets `CameraType = Custom`.

## Signals (`ServerSignals.Cutscenes`)
- `Started: Signal<Player, string>`: fired after `PlayCutscene` is sent.
- `Finished: Signal<Player, string, boolean>`: `(player, name, skipped)`.
  - `skipped = false`: played through (client report). **Never grant rewards from it**, an exploiter can report it early.
  - `skipped = true`: skipped by the server, replaced by another server `Play`, or it couldn't play / errored / was stopped on the client.

## Data and network
- `PlayerData.CutscenesSeen: { [string]: boolean }`: saved. It's in `PlayerDataTemplate` and `ProfileType`, and is only written by `MarkSeen` (nested `SetValue`).
- Remotes (Blink, all Reliable, SingleAsync):
  - `PlayCutscene`: Server → Client, `string` (cutscene name)
  - `SkipCutscene`: Server → Client, no payload
  - `CutsceneFinished`: Client → Server, `struct { Name: string, Completed: boolean }`

## How to add a cutscene
1. Create `src/Features/Cutscenes/Client/Cutscenes/<Name>.luau`. The module name is the cutscene name.
```lua
local CutsceneUtil = require(StarterPlayer.StarterPlayerScripts.ClientUtilities).CutsceneUtil
local restoreGui, releaseCamera
return {
	Init = function() restoreGui = CutsceneUtil.DisableAllGui(nil, "Intro") end,
	Sequences = {
		{ Start = function() releaseCamera = CutsceneUtil.CameraCutscenes.MoveCamera({ CFrame = shotCFrame, TweenInfo = TweenInfo.new(3) }); task.wait(3) end },
	},
	Cleanup = function() restoreGui(); if releaseCamera then releaseCamera() end end,
}
```
2. Optional: to make it play-once, add `Intro = true` to `PlayOnceCutscenes.luau`.
3. Play it from server code: `CutsceneService.Play(player, "Intro")`. For a play-once cutscene on join, call it from `ServerSignals.Profile.Loaded` (plus a loop over the existing `ServerData.ProfileDatas`), because it is skipped while the profile isn't loaded.
4. Optional: add the name to a Cmdr `cutscene` type in DeveloperTools so you can play it with `force`.

## Gotchas
- `Client/Cutscenes/` holds only a `.gitkeep`, so Rojo doesn't sync it. The client service handles it missing (no cutscenes load). Cutscene modules are loaded once, when the module is first required.
- A cutscene that isn't completed isn't marked seen, so a play-once cutscene that errored, was stopped locally or couldn't run will play again on the next server `Play`.
- Play-once cutscenes are silently skipped while the profile isn't loaded (`HasSeen` returns nil). Use `force` to play them anyway.
- `CutscenesSeen` is written with a nested `SetValue`, and it isn't in `DeepSyncFields` in `PlayerController`. So `ClientData.PlayerData.CutscenesSeen` may not update live. Nothing on the client reads it today.
- `Init` runs synchronously inside client `Play` / `PlayFromServer` (pcall'd, but it still yields if it yields), and `Start` may yield. A cutscene `Cleanup` must handle being called mid-sequence or after a failed `Init`, because `Stop` can run at any point.
- `CameraCutscenes` keeps one camera slot for the whole client. Two cutscenes or systems using it at the same time override each other.
