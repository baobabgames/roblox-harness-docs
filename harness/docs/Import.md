# Import

Carries an imported game's old saves into the harness profile, and keeps the old game's not-yet-converted scripts working on harness data while `/import-game` converts it. Ships idle: with no stores in `SharedConfigs.Import.LegacyStores` it does nothing, so a game that wasn't imported never notices it. How an import uses it: [DATA.md](../.claude/skills/import-game/DATA.md).

## Files
- [`ImportSystem.luau`](../src/Features/Import/Server/ImportSystem.luau): copies each player's old saves into `PlayerData` the first time they join (Server)
- [`ImportRules.luau`](../src/Features/Import/Server/ImportRules.luau): pure field rules: the old key, the profile table inside a saved value, and the writes to make (Server)
- [`LegacyReplicaStandIn.luau`](../src/Features/Import/Server/LegacyReplicaStandIn.luau): the old Replica write API (`Set`, `SetValues`, `TableInsert`, `TableRemove`) backed by the player's Plum, for server shims (Server)
- [`LegacyReplicaShim.luau`](../src/Features/Import/Client/LegacyReplicaShim.luau): the old client Replica API (`OnNew`, `Data`, `OnChange`, `OnSet`) answered from `ClientData.PlayerData` atoms, for client shims (Client)
- [`SharedConfigs/Import.luau`](../src/Core/Shared/SharedConfigs/Import.luau): `LegacyStores` (`Store`, `Id` (flag key, default `Store`), `Scope`, `Key`, `Root`, `Fields` with `From`, `To`, `Merge`), `Tries`, `RetrySeconds` (Shared)
- [`ServerSignals/Import.luau`](../src/Core/Server/ServerSignals/Import.luau): `Done` (Server)

## How it connects
- **Uses:** `ServerSignals.Profile.Loaded` / `Removing`, `ServerData.ProfileDatas` (read), `ServerData.Plums.ProfilesPlum` (write), `DataStoreService` (`GetAsync` only: never writes the old stores), `ClientData.PlayerData` and `ClientData.ProfileLoaded` (client shim), Charm `subscribe`.
- **Used by:** an imported game's shims in `src/Legacy` (they require the stand-in and the shim) and systems that wait for `ServerSignals.Import.Done`. Nothing in the template uses it.
- **Needs, per imported game:** the stores in `SharedConfigs/Import.luau`, and a saved `LegacyImported = {}` field in `PlayerDataTemplate.luau` (`LegacyImported: { [string]: boolean }` in `ProfileType`). Without the field `ImportSystem` warns once and imports nothing, so a half-set-up game never imports twice.

## Flow (ImportSystem)
1. `Init`: returns right away when `LegacyStores` is empty. Otherwise listens to `Profile.Loaded`, `Profile.Removing` and `PlayerRemoving`, then runs for profiles that loaded before `Init`.
2. Per store not yet in `PlayerData.LegacyImported`: `GetAsync(ImportRules.Key(store, userId))` in `pcall`, up to `Tries` times (waits 1, 2, 4 s); stops if the player left.
3. Found: `ImportRules.Plan` gives the writes, each made with `SetValue` on the Plum, then `LegacyImported[Id or Store] = true`. No key (a new player): only the flag. A missing `Root` table or a non-table value counts as a failure.
4. Every try failed: the flag stays unset, it warns once, and tries again every `RetrySeconds` while the player stays (cancelled on leave) and on the next join.
5. After the last store: `ServerSignals.Import.Done:Fire(player)`.

## Public API
### `ImportRules.Key(store, userId) -> string`
- `string.format(store.Key, userId)`.

### `ImportRules.Root(oldSave, store) -> { [any]: any }?`
- The table at `store.Root` (dotted, e.g. `"Data"` for ProfileStore) inside the saved value, or the value itself without a `Root`; nil when it isn't a table.

### `ImportRules.Plan(oldSave, playerData, store) -> { { Path: { string }, Value: any } }`
- One write per field whose old value exists: `Path = { "PlayerData", ...To }`.
- `Merge`: `Add` (numbers summed), `Max` (the higher number), `Union` (arrays: current items then old ones not already there; sets: key union keeping current values), `Replace` (a deep copy of the old value). A field still at its default gets the old value under every rule.
- Missing old fields, and pairs a rule can't combine (e.g. `Add` on a string), are skipped.

### `LegacyReplicaStandIn.new(player, plum?, playerData?) -> LegacyReplicaStandIn`
- `plum` and `playerData` default to `ServerData.Plums.ProfilesPlum[player]` / `ServerData.ProfileDatas[player].PlayerData`; errors when the profile isn't loaded and nothing was passed.
- `:Set(path, value)` → `SetValue({ "PlayerData", ...path }, value)`; `:SetValues(path, values)` → one `SetValue` per key (sorted); `:TableInsert(path, value, index?)` → `ArrayInsert`; `:TableRemove(path, index) -> any` → `ArrayRemove`, returns the removed value; `.Data` is the PlayerData table.

### `LegacyReplicaStandIn.Signals(oldLoaded, oldRemoving) -> () -> ()`
- Re-fires the old signals (anything with `:Fire`) with the player from `ServerSignals.Profile.Loaded` / `Removing`. Returns a disconnect.

### `LegacyReplicaShim.new(atoms?, loaded?) -> LegacyReplicaShim`
- `atoms`: field name → Charm atom (default `ClientData.PlayerData`); `loaded`: an atom true once the data arrived (default `ClientData.ProfileLoaded`, set by `PlayerController`).
- `.OnNew(className, fn)` (dot or colon): `fn(replica)` once the data has arrived (right away if it has). Returns a disconnect.
- `:OnChange(fn)`: `fn(action, path, ...)` once per changed leaf: `"Set"` with `(new, old)`; an array that grew or shrank by one gives `"TableInsert"` with `(index, value)` or `"TableRemove"` with `(index, oldValue)`. Returns a disconnect.
- `:OnSet(path, fn)`: `fn(new, old)` for `Set` changes at or under `path` (inserts and removals only reach `OnChange`). Returns a disconnect.
- `.Data`: a read-only view of the atoms' current values (writing errors; nested tables are the atoms' own, never change them). `:Destroy()` drops every listener.

## Gotchas
- Only add stores to `LegacyStores` together with the conversion that stops the old code saving to them (DATA.md): two systems writing one player's progress loses saves.
- Every field the old code changes in place must be in `PlayerController` `DeepSyncFields`, or its atom (and the shim) never sees the change.
- Specs: `lune/Features/Import/` (rules, stand-in, shim). `ImportSystem` itself needs DataStores: tested in a test place (DATA.md, "Test").
