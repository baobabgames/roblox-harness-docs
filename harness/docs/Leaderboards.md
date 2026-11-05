# Leaderboards

Global, all-time leaderboards drawn on models in `Workspace.Leaderboards`. Each board ranks one value from player data: the top list lives in an OrderedDataStore, and players in the server are merged in at their live value. Everything runs on the server. Values only come from player data, never from the client.

The template ships with **no boards**. See [Adding a board](#adding-a-board).

## Files
- [`LeaderboardSystem.luau`](../src/Features/Leaderboards/Server/LeaderboardSystem.luau): entry point. Builds the boards, follows players' live values, and stores final values on leave and shutdown (Server)
- [`Leaderboard.luau`](../src/Features/Leaderboards/Server/Leaderboard.luau): class for one board. Resolves its definition, reads and writes the store, ranks, and renders (Server)
- [`LeaderboardEntry.luau`](../src/Features/Leaderboards/Server/LeaderboardEntry.luau): class for one row, cloned from the board's `Template` (Server)
- [`UserInfo.luau`](../src/Features/Leaderboards/Server/UserInfo.luau): names and avatar thumbnails, cached by UserId (Server)
- [`LeaderboardConfig.luau`](../src/Features/Leaderboards/Server/LeaderboardConfig.luau): timing and size settings (Server)
- [`Boards/init.luau`](../src/Features/Leaderboards/Server/Boards/init.luau): returns every board definition module in `Boards/`, keyed by module name (`Loader.LoadChildren`). Empty by default (Server)

## How it connects
- **Uses:** `ServerData.ProfileDatas` (live values), `ServerData.Plums.ProfilesPlum[player].ValueChanged` (change tracking for `Stat` boards), `ServerSignals.Profile.Loaded`, `DataService:addPlayerRemovingCallback` (Packages.DataService), `Players.PlayerRemoving`, `game:BindToClose`, `DataStoreService:GetOrderedDataStore`, `SharedUtilities.NumberUtil.FormatWithSuffix` (default format), `Players:GetNameFromUserIdAsync` / `GetUserThumbnailAsync`.
- **Used by:** the server Loader, which calls `LeaderboardSystem.Init`. Nothing in `src/` calls `LeaderboardSystem.RemovePlayerAsync` yet.
- **Starts (`Init`):**
  1. Builds a `Leaderboard` for each definition in `Boards/`. Invalid ones are skipped with a warning.
  2. If no board was built, it returns here. Nothing is connected and no DataStore is touched.
  3. Connects `Profile.Loaded`, `PlayerRemoving`, the DataService removal callback, and `BindToClose`.
  4. Runs the loaded handler for profiles that already exist (the loader starts Systems in random order).
  5. Calls `leaderboard:Start()` on every board.

## Adding a board
1. Add a module in `src/Features/Leaderboards/Server/Boards/`. For a number field in `PlayerData`, `Stat` is all it needs:
   ```lua
   -- Boards/Coins.luau
   return {
   	Stat = "Coins", -- ranks PlayerData.Coins
   }
   ```
2. In Studio, add a model to `Workspace.Leaderboards` named like the module (or set `Model`). Somewhere inside it, put a `ScrollingFrame` (any depth) with a `Frame` named `Template` holding:
   - `Rank` (TextLabel, optional)
   - `AvatarIcon` (ImageLabel)
   - `PlayerName` (TextLabel)
   - `ValueLabel` (TextLabel)

   Rows are sorted by `LayoutOrder` (= rank), so the ScrollingFrame needs a layout (e.g. `UIGridLayout`) with `SortOrder = LayoutOrder`.
3. If the field is new, add it to `PlayerDataTemplate.luau` and `SharedTypes/ProfileType.luau`, and write it through the Plum (`SetValue`) so `Track` fires.

### Definition fields (`Leaderboard.Definition`)
| Field | Default | Meaning |
|---|---|---|
| `Stat: string?` | none | The `PlayerData` field to rank. Fills in `GetLiveValue`, `GetSavedValue` and `Track`. A value that isn't a number reads as `0` |
| `Model: string?` | module name | Model name in `Workspace.Leaderboards` |
| `DataStore: string?` | `"Leaderboard_<name>"` | OrderedDataStore name. Changing it starts the board empty |
| `Format: ((number) -> string)?` | `FormatWithSuffix` (1.2K style) | Text for `ValueLabel` |
| `MinSavedValue: number?` | `1` | Values below this are not stored |
| `RefreshInterval: number?` | none | Also redraw every N seconds, for values that grow on their own |
| `GetLiveValue: ((Player) -> number?)?` | from `Stat` | A player's current value. Return nil to leave them out |
| `GetSavedValue: ((PlayerData) -> number)?` | from `Stat` | The value stored when they leave |
| `Track: ((Player, onChanged) -> (() -> ())?)?` | from `Stat` | Call `onChanged` when the value changes. Return a cleanup function |

Custom value (no `Stat`): give both `GetLiveValue` and `GetSavedValue`, or the board is skipped with a warning.
```lua
-- Boards/Wins.luau (illustrative: assumes your game adds a saved PlayerData.Wins field)
return {
	GetLiveValue = function(player)
		local profileData = ServerData.ProfileDatas[player]
		return profileData and profileData.PlayerData.Wins
	end,
	GetSavedValue = function(playerData)
		return playerData.Wins
	end,
	RefreshInterval = 30,
}
```

## Public API

### `LeaderboardSystem.Init() -> ()`
- Called by the Loader. See **Starts** above.

### `LeaderboardSystem.RemovePlayerAsync(player: Player) -> ()`
- Removes the player from every board for good (use it on a data reset). **Yields** until each board's `RemoveAsync` finishes (one after another).
- Marks the player as saved, so their leave or shutdown save does **not** store their old value again.
- Players still in the server stay on the board at their live value until they leave, because `Render` merges live values in.
```lua
LeaderboardSystem.RemovePlayerAsync(player)
```

### `Leaderboard.Resolve(name: string, definition: Definition) -> ResolvedDefinition?`
- Fills in the defaults (see the table). Returns nil and warns if neither `Stat` nor both `GetLiveValue` and `GetSavedValue` are set.
- The default `Track` returns nil (no tracking) if the player's Plum doesn't exist yet.

### `Leaderboard.new(name: string, definition: Definition) -> Leaderboard?`
- Resolves the definition, finds its model, ScrollingFrame and `Template`, hides the template, and opens the OrderedDataStore.
- Returns nil and warns if the definition is invalid, the model is missing, or there's no ScrollingFrame with a `Frame` named `Template`.
- Fields: `Name: string`, `Definition: ResolvedDefinition`.

### `leaderboard:Start() -> ()`
- Spawns a loop that runs `FetchGlobalAsync` now and then every `GlobalRefresh` seconds. If `RefreshInterval` is set, also spawns a loop that calls `MarkDirty` every `RefreshInterval` seconds. Neither loop ever stops.

### `leaderboard:MarkDirty() -> ()`
- Queues a `Render` after `RenderDelay` seconds. Calls made while one is queued are merged into it.

### `leaderboard:FetchGlobalAsync() -> ()`
- **Yields.** Reads the top `TopCount` values (`GetSortedAsync`, descending, first page only), replaces the cached global list, then calls `MarkDirty`. On failure it warns and keeps the old list.

### `leaderboard:CommitValueAsync(userId: number, value: number) -> ()`
- Floors the value and caps it at `2^53`. Does nothing if the result is below `MinSavedValue`.
- Otherwise puts it in the cached list right away, calls `MarkDirty`, then calls `SetAsync` (**yields**). Warns on failure. In Studio the store write is skipped unless `SharedConfigs.Player.SaveInStudio` is on (also for `RemoveValueAsync`), so test values never reach the live boards.
- Uses `SetAsync`, so it overwrites the stored value (it doesn't keep the max).

### `leaderboard:RemoveValueAsync(userId: number) -> ()`
- Drops the user from the cached list, calls `MarkDirty`, then calls `RemoveAsync` (**yields**). Warns on failure.

### `leaderboard:Render() -> ()`
- Merges the cached global list with `GetLiveValue` for every player in the server (the live value wins), then sorts by value descending, with lower UserId first on ties.
- Keeps the top `TopCount`. Reuses existing rows, creates missing ones, and destroys rows that fell off.

### `LeaderboardEntry.new(template: Frame, parent: Instance, userId: number) -> LeaderboardEntry`
- Clones the template (named after the UserId, visible) into `parent`. Spawns a lookup that sets `PlayerName` to `@name` and then `AvatarIcon`, skipped if the row was already destroyed.
- Field: `Frame: Frame`.

### `entry:Update(rank: number, valueText: string) -> ()`
- Sets `LayoutOrder` and the `Rank` text (`1st`, `2nd`…, gold/silver/copper for the top 3, white otherwise), and `ValueLabel.Text`. Each is only written when it changed.

### `entry:Destroy() -> ()`
- Destroys the row's frame.

### `UserInfo.GetNameAsync(userId: number) -> string?`
- Cached. Uses the in-server player's name if they're here. Otherwise calls `GetNameFromUserIdAsync` (**yields**). Returns nil on failure (not cached).

### `UserInfo.GetThumbnailAsync(userId: number) -> string?`
- Cached. AvatarBust 150x150 via `GetUserThumbnailAsync` (**yields**). Returns nil on failure (not cached).

## Data and network
- Reads `PlayerData.<Stat>` (saved). Writes nothing to player data.
- Writes one OrderedDataStore per board: key `tostring(UserId)`, whole-number value.
- No remotes. The rows are built on the server inside the board model's ScrollingFrame (in Workspace), so they replicate to every client like any other instance.

### `LeaderboardConfig`
| Key | Default | Meaning |
|---|---|---|
| `TopCount` | 50 | Rows per board, and how many entries are read from the store |
| `GlobalRefresh` | 60 | Seconds between store reads |
| `RenderDelay` | 1 | Debounce before a redraw |
| `ShutdownSaveTimeout` | 25 | Max seconds `BindToClose` waits for saves |

## Gotchas
- Board models are looked up once in `Init` with `FindFirstChild` (no waiting). They must be in `Workspace.Leaderboards` when the server starts.
- The final value is stored from the DataService removal callback, using the data that gets saved. Shutdown uses `ServerData.ProfileDatas[player].PlayerData`. Each player is saved at most once per session, in a weak `saved` table.
- Values are only stored when a player leaves or the server shuts down. Progress made during a session is lost from the board if the server crashes.
- Players in the server always show at their live value, even below `MinSavedValue` (a `Stat` that's missing or 0 shows as `0`). They drop off once they leave, unless their value was stored.
- Live values aren't floored. `Format` can get decimals for players in the server.
- A custom definition without `Track` only redraws on joins, leaves, store reads and `RefreshInterval`.
- The default `Track` only fires for writes through the Plum (`ProfilesPlum[player]:SetValue`, path `{ "PlayerData", Stat }`). Direct table writes don't redraw until the next refresh.
- Every board costs one `GetSortedAsync` every `GlobalRefresh` seconds, plus one `SetAsync` per player leave. Keep DataStore limits in mind with many boards.
