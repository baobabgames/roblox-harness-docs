# Player

Loads each player's saved data (DataService / ProfileStore), wraps it in a per-player profile, and replicates it to the owning client through a Plum. Every other feature reads and writes player data through what this feature puts in `ServerData` and `ClientData`.

## Files
- [`PlayerSystem.luau`](../src/Features/Player/Server/PlayerSystem.luau): starts DataService and Plums, creates/destroys profiles, fires the Profile signals (Server)
- [`ProfileClass.luau`](../src/Features/Player/Server/ProfileClass.luau): per-player object holding `Data` and the replicating `Plum` (Server)
- [`PlayerDataTemplate.luau`](../src/Features/Player/Server/PlayerDataTemplate.luau): saved data defaults, passed to DataService as the template (Server)
- [`ProfileDataTemplate.luau`](../src/Features/Player/Server/ProfileDataTemplate.luau): session-only defaults (not saved), currently empty `{}` (Server)
- [`PlayerController.luau`](../src/Features/Player/Client/PlayerController.luau): copies the received Plum data into `ClientData` atoms (Client)
- [`Profile.luau`](../src/Core/Server/ServerSignals/Profile.luau): `ServerSignals.Profile.Loaded` / `Removing` (Server, Core)

## How it connects
- **Uses:** `ReplicatedStorage.Packages.DataService` (`.server`), `ReplicatedStorage.CustomPackages.Plums`, `Packages.TableUtil`, `Packages.Signal`, `ServerScriptService.ServerData`, `ServerScriptService.ServerSignals`, `StarterPlayer.StarterPlayerScripts.ClientData`, `ReplicatedStorage.SharedConfigs` (`Inputs.AllowRebinding`, `Player.SaveInStudio`), `SharedTypes` (`ProfileData`, `PlayerData`)
- **Used by:** every server feature that touches data, via `ServerData.ProfileDatas` / `ServerData.Plums.ProfilesPlum` and `ServerSignals.Profile` (Monetization, Gift, Cutscenes, Onboarding, Leaderboards, Inputs). Client: `InputController` (`ClientData.PlayerData.Keybinds`), `MonetizationUtil` (`ClientData.PlayerData.GamepassPurchased`)
- **Starts:**
  - `PlayerSystem.Init`: `Plums:Init()`, sets `DataService.onPlayerInit`, adds a removing callback, `DataService:init({ template = PlayerDataTemplate, useMock = RunService:IsStudio() and not SharedConfigs.Player.SaveInStudio })` (Studio plays use ProfileStore's mock store by default, so they never touch saved data; live servers always save), then replaces `DataService.networker.fire` with a no-op so DataService never replicates on its own
  - `PlayerController.Init`: `Plums:Init()`, `Plums:AwaitInitialized()` (**yields**), then connects `Plums.PlumReceived("Player")`

## Data flow
Server, on load (`DataService.onPlayerInit`, i.e. after the profile loaded and reconciled):
1. `ProfileClass.new(player, data)`: deep copies `ProfileDataTemplate`, sets `Data.PlayerData = data` (the ProfileStore's saved table itself, not a copy) and `Data.SessionJoinTime = os.time()`
2. `profileClass:Init()`: `Plums.new("Player", Data):AddClients(player)` (Plum data **is** `Data`, same table; replicated only to that player)
3. Stores `ServerData.ProfileClasses[player]`, `ServerData.ProfileDatas[player]` (= `Data`), `ServerData.Plums.ProfilesPlum[player]` (= Plum)
4. Fires `ServerSignals.Profile.Loaded(player)`

Server write path:
```lua
local profilePlum = ServerData.Plums.ProfilesPlum[player]
profilePlum:SetValue({ "PlayerData", "Onboarding", "Step" }, 2) -- saved + replicated
```
- `{ "PlayerData", ... }` paths are saved; other top-level paths are session only
- Writing `ServerData.ProfileDatas[player]` directly changes the server (and saved) value but never reaches the client

Client (`PlayerController`):
- On `PlumReceived("Player")` and on every `plum.OnRaw` (each SetValue / ArrayInsert / ArrayRemove), re-syncs two groups:
  - top-level fields of the Plum data -> `ClientData.ProfileData.<Name>`
  - `PlayerData` fields -> `ClientData.PlayerData.<Name>`
- A field is only synced if `ClientData.<Group>.<Name>` exists and is a function (Charm atom or Vide source). Missing names and plain tables are skipped
- Writes the atom only when `atom() ~= nextValue` (reference compare)
- `DeepSyncFields` (currently `{ GamepassPurchased = true }`): these get `TableUtil.Copy(value, true)` each sync so the atom sees a new reference. Any field changed in place (`ArrayInsert`, `ArrayRemove`, nested `SetValue`) must be listed here or its atom never updates

```lua
local DeepSyncFields = {
	GamepassPurchased = true,
}
```

Leave (DataService removing callback, only for players whose profile loaded):
1. Fires `ServerSignals.Profile.Removing(player)` while data is still in `ServerData`
2. Clears the three `ServerData` entries, then `profileClass:Destroy()` (destroys the Plum)
3. DataService then calls `profile:EndSession()`, which saves

## Public API
### `PlayerSystem.Init() -> ()`
- Called by the server loader. Sets up Plums and DataService as above. Not meant to be called by features.

### `PlayerController.Init() -> ()`
- Called by the client loader. **Yields** in `Plums:AwaitInitialized()`.

### `ProfileClass.new(player: Player, playerData: PlayerData) -> ProfileClass`
- Builds the profile object. Fields: `Player`, `Character` (nil), `Humanoid` (nil), `Animations` ({}), `Data`, `Plum` (nil until `Init`).
- Only `PlayerSystem` calls it. Read existing ones from `ServerData.ProfileClasses[player]`.

### `ProfileClass:Init() -> ()`
- Creates the `"Player"` Plum over `Data` and adds the owning player as its only client.

### `ProfileClass:Destroy() -> ()`
- Destroys the Plum (if any) and sets `Plum = nil`. Does not touch `ServerData`.

### `ServerSignals.Profile.Loaded` `(player: Player)`
- Fired once the profile is in `ServerData`.

### `ServerSignals.Profile.Removing` `(player: Player)`
- Fired on leave, before the profile is cleared and saved: last chance to write data. Handlers must not yield.

```lua
ServerSignals.Profile.Loaded:Connect(Private.ProfileLoaded)
for player in ServerData.ProfileDatas do
	Private.ProfileLoaded(player)
end
```

## Data and network
- Saved (`PlayerData`, from `PlayerDataTemplate`): `Onboarding { Step = 1, Completed = false }`, `Keybinds` (`{}` only when `SharedConfigs.Inputs.AllowRebinding`, else nil), `CutscenesSeen {}`, `GamepassPurchased {}`, `PurchaseHistory {}`, `PendingGifts {}` (both server only, Monetization)
- Session (top level of `ProfileData`): `SessionJoinTime` (set in `ProfileClass.new`); `ProfileDataTemplate` adds nothing yet
- `ClientData.ProfileLoaded` turns true once the Player plum's data has been copied into the atoms.
- Synced to client atoms today: `ClientData.PlayerData.GamepassPurchased`, `ClientData.PlayerData.Keybinds`. `ClientData.ProfileData` is empty, so no session field reaches an atom; other saved fields (Onboarding, CutscenesSeen, PurchaseHistory) are on the client Plum but have no atom
- Remotes: none in Blink. Replication is Plums' own remotes (`PlumReceivedRE`, `PlumMethodCallRE`). DataService's networker fire is muted

## Gotchas
- `ServerData.ProfileDatas[player]` is nil until loaded. Systems start in random order: connect `Profile.Loaded`, then loop existing `ServerData.ProfileDatas`
- To add a saved field: add it to `PlayerDataTemplate.luau` and `SharedTypes/ProfileType.luau`; reconcile fills old saves. To see it on the client, add an atom with the same name in `ClientData.PlayerData` (and to `DeepSyncFields` if written in place)
- Session field: add to `ProfileDataTemplate.luau` (deep copied per player), type in `ProfileType.luau`, atom in `ClientData.ProfileData`
- Deep-sync fields are copied on every Plum change, even unrelated ones, so their atoms fire on every change. Keep the list short
- `Profile.Removing` handlers run inside DataService's removal loop in `pcall`; errors only `warn`. Yielding delays the save
- `PlayerController` uses `PlumReceived(...):Connect`, not `:Observe`, so it relies on being the code that runs `Plums:Init()` before the Plum arrives
- Require `ClientData` as `StarterPlayer.StarterPlayerScripts.ClientData`, or the copy never updates
- UI must not write synced atoms; they are overwritten on the next sync. Send a request through Network instead
