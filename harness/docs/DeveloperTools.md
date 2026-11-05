# DeveloperTools

A developer console built on the Cmdr package (F2 in game). It ships with **no commands and no custom types**, only the `Developer` hook. That hook blocks every command in the `"Developer"` group for anyone who isn't a developer.

It also holds **live tuning** (Studio only): config values marked as feel knobs can be changed while playing (see "Live tuning" below).

## Files
- [`DeveloperToolSystem/init.luau`](../src/Features/DeveloperTools/Server/DeveloperToolSystem/init.luau): requires Cmdr and registers everything in the `Cmdr` folder (Server)
- [`DeveloperToolSystem/Cmdr/Hooks/Developer.luau`](../src/Features/DeveloperTools/Server/DeveloperToolSystem/Cmdr/Hooks/Developer.luau): `BeforeRun` gate, deny by default: every command is developer only unless its group is in `PublicGroups` (empty). Cmdr runs it on Server and Client
- `DeveloperToolSystem/Cmdr/Types/`, `DeveloperToolSystem/Cmdr/Commands/`: empty, `.gitkeep` only (Server)
- [`DeveloperToolsController/init.luau`](../src/Features/DeveloperTools/Client/DeveloperToolsController/init.luau): turns on the console with F2 for developers and disables it for everyone else (Client)
- `Client/UILabs/` (Client, edit-mode only, never required at runtime): UI Labs test bench for the Gui screens (UI_GUIDE, section 7):
  - [`Gui.storybook.luau`](../src/Features/DeveloperTools/Client/UILabs/Gui.storybook.luau): the storybook (every `*.story` under `UILabs/`)
  - [`StoryUtil.luau`](../src/Features/DeveloperTools/Client/UILabs/StoryUtil.luau): `Controls(extra?)`, `DeviceFrame(controls, view, actions?)` (Phone / Tablet / PC screen below the top bar, thumb-zone overlay, story-only buttons), `With` / `Without`, `DeviceSize`, `Zones`
  - [`UIAudit.luau`](../src/Features/DeveloperTools/Client/UILabs/UIAudit.luau): the ready-made check. `Run({ Devices?, Story?, Theme?, Keep? }) -> string` mounts every story at each device in a temporary `StarterGui.UICheck` and reports taps < 44 px, text < 14 px, text not fitting, 0-size aspect boxes, buttons off screen / overlapping / on the top bar / mostly under the jump button (the thumbstick area and partial overlaps are only notes), render errors; `Clear()`. Loads fresh module copies each run (`loadstring`), since Studio caches `require`. Run by the `ui-checker` agent
  - `Stories/<Screen>.story.luau`: one story per screen, rendering its View with interactive mocks
  - `Mocks/<Feature>Mocks.luau`: placeholder fixtures (items, rewards)
- [`SharedConfigs/Developers.luau`](../src/Core/Shared/SharedConfigs/Developers.luau): list of developer UserIds, `{}` by default (Shared)
- [`SharedUtilities/DeveloperUtil.luau`](../src/Core/Shared/SharedUtilities/DeveloperUtil.luau): `IsDeveloper` check (Shared)
- [`TuningSystem.luau`](../src/Features/DeveloperTools/Server/TuningSystem.luau): live tuning on the server: makes `ReplicatedStorage.Tuning`, validates and applies knob changes, handles `TuneSet` (Server)
- [`TuningController.luau`](../src/Features/DeveloperTools/Client/TuningController.luau): copies knob Attributes into the client's configs and sends Client-view edits (Client)
- [`SharedUtilities/TuningUtil.luau`](../src/Core/Shared/SharedUtilities/TuningUtil.luau): `Specs`, `Validate`, `Literal` and `Changed`, the pure logic (Shared; tests in `lune/Core/Shared/SharedUtilities/TuningUtil.spec.luau`)
- [`SharedTypes/TuningType.luau`](../src/Core/Shared/SharedTypes/TuningType.luau): `TuningSpec` (Shared)

## How it connects
- **Uses:** `ReplicatedStorage.Packages.Cmdr`, `SharedUtilities.DeveloperUtil`, `SharedConfigs.Developers`
- **Used by:** the Loaders (`Init`). Only the Developer hook and the Controller call `DeveloperUtil.IsDeveloper`.
- **Starts (server):** registers `Types`, then `Hooks`, then `Commands` from `script.Cmdr`. Folders that are missing are skipped.
- **Starts (client):** **yields** on `ReplicatedStorage:WaitForChild("CmdrClient")`. Then either calls `CmdrClient:SetEnabled(false)` (not a developer) or `CmdrClient:SetActivationKeys({ Enum.KeyCode.F2 })`.

## Public API
### `DeveloperToolSystem.Init()` / `DeveloperToolsController.Init()`
- Called by the Loaders. Don't call them yourself.

### `DeveloperUtil.IsDeveloper(userId: number) -> boolean`
- Returns `true` when any of these is true:
  - the game runs in Studio (`RunService:IsStudio()`), for every user
  - `userId` is in `SharedConfigs.Developers`
  - the game is user-owned and `game.CreatorId == userId`
- Safe on server and client. Doesn't yield. Group-owned games get no automatic owner access.

```lua
local IsDeveloper = SharedUtilities.DeveloperUtil.IsDeveloper
if IsDeveloper(player.UserId) then ... end
```

## Adding a command
Make two modules in `Cmdr/Commands/<Name>/`. Put the command in `Group = "Developer"` so the hook gates it.

```lua
-- Commands/SkipOnboarding/SkipOnboarding.luau (definition, replicated to clients)
return {
	Name = "SkipOnboarding",
	Aliases = { "SkipTutorial" },
	Description = "Marks a player's tutorial finished",
	Group = "Developer",
	Args = {
		{ Type = "player", Name = "Player", Description = "Who to skip it for" },
	},
}
```

```lua
-- Commands/SkipOnboarding/SkipOnboardingServer.luau (runs on the server)
local ServerScriptService = game:GetService("ServerScriptService")
local OnboardingService = require(ServerScriptService.Features.Onboarding.OnboardingService)

return function(context, player: Player)
	if not OnboardingService.Skip(player) then
		return `{player.Name} has already finished the tutorial`
	end
	return `Skipped the tutorial for {player.Name}`
end
```

## Adding a type
Add `Cmdr/Types/<Name>.luau`. It returns a function that registers the type, and commands then use it by name in `Args`.

```lua
-- Types/Cutscenes.luau
local cutscenes = { "Intro" }

return function(registry)
	registry:RegisterType("cutscene", registry.Cmdr.Util.MakeEnumType("cutscene", cutscenes))
end
-- in a command's Args: { Type = "cutscene", Name = "Cutscene", ... }
```

## Adding a hook
Add `Cmdr/Hooks/<Name>.luau`. It returns a function that calls `registry:RegisterHook("BeforeRun" | "AfterRun", fn)`. When `BeforeRun` returns a string, the command is blocked and that string is shown.

```lua
return function(registry)
	registry:RegisterHook("BeforeRun", function(context)
		return nil -- or "reason" to block
	end)
end
```

## Live tuning
Feel knobs (the numbers that decide how an action feels: draw time, speed, recoil, cooldown, shake...) can be changed **while playing in Studio**, without stopping. The next `/build-gdd` (or `/revise-gdd`) round reads what you settled on and writes it back into the config file.

**Mark a knob** in the feature's config with a `Tuning` table. Keys name top-level fields of the same config. A knob can be a number, boolean, string, Color3 or Vector3; `Min` / `Max` / `Step` (all optional) only apply to numbers.

```lua
-- SharedConfigs/Bow.luau
return {
	DrawTime = 0.5,
	ShowTrail = true,
	Tuning = {
		DrawTime = { Min = 0.2, Max = 1.2, Step = 0.05 },
		ShowTrail = {},
	},
}
```

**Read it at use time**, so a live change reaches the code:

```lua
local BowConfig = SharedConfigs.Bow

function Private.StartDraw()
	task.delay(BowConfig.DrawTime, ...) -- read here, every time
end
-- Never: const DrawTime = BowConfig.DrawTime at the top of the module.
```

**Use it:** play in Studio, select `ReplicatedStorage.Tuning.<Config>` in the Explorer (Client or Server view), and change its Attributes in Properties. Each change is checked (same type, finite, snapped and clamped), written into the config on both sides, and printed as `[Tuning] Bow.DrawTime 0.5 -> 0.4`. Values reset when play stops; the printed lines keep them.

**Keep it:** every change also prints `[TuningSnapshot] {"Bow":{"DrawTime":"0.4"}}`: every knob that now differs from its value when play started, as Luau literals (also in the `Snapshot` Attribute of `ReplicatedStorage.Tuning` while playing). The newest line holds all tuned values. `lune run apply-tuning '<that line>'` shows old → new for each config, and `--write` writes them into `SharedConfigs/<Config>.luau` (each `/build-gdd` and `/revise-gdd` change round does this). `lune run check-tuning` checks every `Tuning` table and flags knobs copied into a local when a module loads.

### `TuningSystem.Init()` / `TuningController.Init()`
- Called by the Loaders. Both return at once outside Studio.
- **Server:** `TuningUtil.Specs(SharedConfigs)`, warns about each knob that can't be tuned, then makes `ReplicatedStorage.Tuning` with one `Configuration` per config (only if any knobs exist), keeps each knob's start value, and listens to `TuneSet`. Each accepted change refreshes the snapshot (`TuningUtil.Changed`): the folder's `Snapshot` Attribute and a `[TuningSnapshot]` line.
- **Client:** waits up to 10 s for `ReplicatedStorage.Tuning` (no knobs: it never appears, and the client stops waiting), copies every Attribute into its config, and sends each change through `TuneSet`.

### `TuningUtil.Specs(configs) -> ({ [string]: { [string]: TuningSpec } }, { string })`
- Every knob of every config with a `Tuning` table. The second result lists `"Config.Key"` entries whose field is missing or isn't a supported type (sorted).

### `TuningUtil.Validate(spec: TuningSpec, current: any, value: any) -> (boolean, any)`
- `false, current` when `value` isn't the same type as `current`, or is NaN or infinite. Otherwise `true` and the value, numbers snapped to `Step` and clamped to `Min` / `Max`.

### `TuningUtil.Literal(value: any) -> string`
- A knob value as Luau source: `0.35` (no float noise), `true`, `"Arc"`, `Color3.fromRGB(255, 120, 0)`, `Vector3.new(0, 2, 8)`.

### `TuningUtil.Changed(configs, startValues) -> { [string]: { [string]: string } }`
- The knobs whose value in `configs` differs from `startValues` (`{ [Config]: { [Key]: value } }`), as `{ [Config]: { [Key]: Literal } }`. Configs with no change are left out.

## Data and network
- No player data. Developers are listed in `SharedConfigs.Developers`.
- Cmdr uses its own remotes and creates `ReplicatedStorage.CmdrClient` when the server requires it.
- `TuneSet` (Blink), client → server, `{ Config: string, Key: string, Value: unknown }`: a knob edited in the Client view. The server ignores it outside Studio, from non-developers, for unknown knobs, and for values that fail `Validate`. Each client also sends server-side changes back once; those equal the current value and change nothing.

## Gotchas
- Hooks run on **both** server and client, because Cmdr moves them into ReplicatedStorage. A hook may only require ReplicatedStorage code.
- Only the `"Developer"` group is gated. A command in any other group can be run by **anyone**. Disabling the client console isn't a security measure.
- In Studio, every player counts as a developer, including Team Test.
- Types register before Commands, so a command can use a custom type.
- `Types/` and `Commands/` hold only `.gitkeep`, so Rojo doesn't sync them. `Init` uses `FindFirstChild` and skips them. No Cmdr default commands are registered (`RegisterDefaultCommands` is never called).
- The client `Init` waits forever on `CmdrClient` if the server-side `DeveloperToolSystem` never runs.
- Live tuning changes the shared config tables in place. Code that copied a knob into a local when it loaded never sees the change.
- A knob added to a config mid-play doesn't appear until the next play session (the folder is built once, at start).
