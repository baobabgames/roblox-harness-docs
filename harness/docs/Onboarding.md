# Onboarding

A step-by-step tutorial framework. The server owns progress (saved in `PlayerData.Onboarding`) and tells the client which step to show. Each step is a pair of `Step<N>` modules: a client one (UI and hints) and an optional server one (server logic, server-only finishes). The template ships turned off (`Enabled = false`, `MaxStep = 0`) with no steps.

## Files
- [`OnboardingSystem/init.luau`](../src/Features/Onboarding/Server/OnboardingSystem/init.luau): runs steps per player, validates finishes, advances progress (Server)
- [`OnboardingService.luau`](../src/Features/Onboarding/Server/OnboardingService.luau): on/off flag, read progress, finish a step from the server, skip or complete (Server)
- [`OnboardingController/init.luau`](../src/Features/Onboarding/Client/OnboardingController/init.luau): runs the client half of the current step, reports finishes (Client)
- [`SharedConfigs/Onboarding.luau`](../src/Core/Shared/SharedConfigs/Onboarding.luau): `Enabled`, `MaxStep` (Shared)
- [`ServerSignals/Onboarding.luau`](../src/Core/Server/ServerSignals/Onboarding.luau): `FinishStepRequested`, `StepCompleted`, `Completed` (Server)
- [`network.blink`](../network.blink): `OnboardingStep`, `EndOnboarding`, `OnboardingStepFinished`

## How it connects
- **Uses:** `ServerData.ProfileDatas` (read), `ServerData.Plums.ProfilesPlum` (write), `ServerSignals.Profile.Loaded`, `SharedConfigs.Onboarding.Enabled` / `MaxStep`, Blink events, `Janitor`, `Loader.LoadChildren` (loads the `Step<N>` children).
- **Used by:**
  - `AnalyticsSystem` listens to `Onboarding.StepCompleted` and logs a funnel step (`AnalysisService.LogOnboardingFunnelStepEvent(player, step, "Step<N>")`).
  - `DeveloperToolSystem` docs show a `SkipOnboarding` Cmdr command example that calls `OnboardingService.Skip`. It's only a comment, there's no real command file.
- **Starts (server `Init`):** listens to `OnboardingStepFinished`, `FinishStepRequested`, `Completed`, `Profile.Loaded` and `PlayerRemoving`, then starts steps for any profiles that loaded before `Init` ran. The listeners are connected even while the tutorial is off, but they do nothing (`GetStep` is nil).
- **Starts (client `Init`):** listens to `OnboardingStep` (start a step) and `EndOnboarding` (stop the current step).

## Flow
1. Profile loads → `GetStep` gives the saved step (nil if the tutorial is off or completed, so nothing happens). If `step > MaxStep`, the system calls `MarkCompleted`. If not, it starts that step.
2. Start step: the server makes a Janitor, fires `OnboardingStep(step)` to the client and spawns the server `Step<N>.Start` (if any).
3. Client gets `OnboardingStep`: it stops the previous step and spawns the client `Step<N>.Start(finish, janitor)`.
4. Finish: the client `finish()` fires `OnboardingStepFinished(step)` (only once per step). The server step's `finish()` or `OnboardingService.FinishStep` work too.
5. The server accepts the finish only if it's the player's current step: it stops the server step, fires `StepCompleted`, then either saves `Step + 1` and starts the next step, or calls `MarkCompleted` after `MaxStep`.
6. `MarkCompleted` saves `Step = MaxStep`, `Completed = true`, fires `EndOnboarding` to the client and fires `Completed`.

## Public API
### `OnboardingService.Enabled: boolean`
- `SharedConfigs.Onboarding.Enabled and MaxStep >= 1`, read once when the module is required.
- If `Enabled` is set but `MaxStep` is 0, it `warn`s and stays `false`.
- While `false`: `GetStep` returns nil, `MarkCompleted` and `Skip` do nothing, and `FinishStep` is ignored by the system. Onboarding data is never written.
```lua
if OnboardingService.Enabled then OnboardingService.FinishStep(player, 2) end
```

### `OnboardingService.MaxStep: number`
- Copy of `SharedConfigs.Onboarding.MaxStep`, read once when the module is required.

### `OnboardingService.IsCompleted(player: Player) -> boolean?`
- Returns `PlayerData.Onboarding.Completed`, or `nil` if the profile isn't loaded. Doesn't check `Enabled`.

### `OnboardingService.GetStep(player: Player) -> number?`
- Returns the current step, or `nil` if the tutorial is off, the profile isn't loaded or the tutorial is completed.

### `OnboardingService.FinishStep(player: Player, step: number)`
- Fires `ServerSignals.Onboarding.FinishStepRequested`. OnboardingSystem ignores it unless `step` is the current step (so always while off). Works for `ServerOnly` steps too. It doesn't return whether the finish was accepted.
```lua
OnboardingService.FinishStep(player, 2) -- e.g. after the player buys their first item
```

### `OnboardingService.MarkCompleted(player: Player)`
- Does nothing if the tutorial is off, the profile plum is missing or `IsCompleted` isn't `false`. Otherwise it saves `Step = MaxStep` and `Completed = true`, fires `EndOnboarding` to the player and fires `Completed` (which stops the active server step).
- Doesn't fire `StepCompleted` for the remaining steps.

### `OnboardingService.Skip(player: Player) -> boolean`
- Calls `MarkCompleted`. Returns `false` (and does nothing) if the tutorial is off, the profile isn't loaded or the tutorial is already completed. Otherwise returns `true`.
```lua
if not OnboardingService.Skip(player) then return `{player.Name} has already finished the tutorial` end
```

### `OnboardingSystem.Init()` / `OnboardingController.Init()`
- Called by the loaders only. They have no other public functions.

### Signals (`ServerSignals.Onboarding`)
- `FinishStepRequested: Signal<Player, number>`: a server request to finish a step. Fire it through `OnboardingService.FinishStep`.
- `StepCompleted: Signal<Player, number, boolean>`: `(player, step, fromClient)`. Fires after a finish is accepted, in step order. Never fires for skipped steps.
- `Completed: Signal<Player>`: the tutorial ended, either finished or skipped.
```lua
ServerSignals.Onboarding.StepCompleted:Connect(function(player, step, fromClient) end)
```

## Step modules
Server step: `OnboardingSystem/Step<N>.luau` (optional)
```lua
return {
	ServerOnly = true, -- optional: ignore client finishes for this step
	Start = function(player: Player, finish: () -> (), janitor) end, -- spawned; also runs on rejoin mid-step
	Stop = function(player: Player) end, -- runs after the janitor is destroyed (finish, skip, leave)
}
```
Client step: `OnboardingController/Step<N>.luau` (needed for every step)
```lua
return {
	Start = function(finish: () -> (), janitor) end, -- spawned; show UI, call finish() when done
	Stop = function() end, -- runs after the janitor is destroyed
}
```
- Put every connection, instance and UI on `janitor`. After any yield, check `Janitor.Is(janitor)`: if it's false, the step already ended.

## How to add a step
1. In `SharedConfigs/Onboarding.luau`, set `Enabled = true` and set `MaxStep` to the new step count (steps are numbered 1..N with no gaps, at least 1).
2. Add `src/Features/Onboarding/Client/OnboardingController/Step<N>.luau` with `Start` (and `Stop` if needed).
3. Optional: add `src/Features/Onboarding/Server/OnboardingSystem/Step<N>.luau` for server logic. Set `ServerOnly = true` if the step must only be finished by the server (anything that grants a reward).
4. Converting `OnboardingSystem` / `OnboardingController` to folders isn't needed (they already are `init.luau` folders). Just drop the files next to `init.luau`.

## Data and network
- `PlayerData.Onboarding = { Step: number, Completed: boolean }`: saved. Default is `{ Step = 1, Completed = false }` (`PlayerDataTemplate`, `ProfileType.OnboardingData`). Written only through `ProfilesPlum:SetValue` at nested paths, and never while the tutorial is off.
- Not mirrored into `ClientData`: there's no `ClientData.PlayerData.Onboarding` atom, and `Onboarding` isn't in `DeepSyncFields`. The client learns the step from the remotes only.
- Remotes (Blink, Reliable):
  - `OnboardingStep`: Server → Client, `u8` step to show
  - `EndOnboarding`: Server → Client, no payload. Drop the current step.
  - `OnboardingStepFinished`: Client → Server, `u8` step the client finished

## Gotchas
- While the tutorial is off, player data stays at the default, so every player (new or existing) starts at step 1 once `Enabled` is turned on.
- `Enabled = true` with `MaxStep = 0` only warns and leaves the tutorial off.
- If `MaxStep` shrinks below a player's saved step, they get marked completed on their next load. Completion is permanent, so growing `MaxStep` later won't rerun the tutorial for them.
- Never grant rewards from `StepCompleted` when `fromClient` is true. An exploiter can report any non-`ServerOnly` step that is their current step. Make reward steps `ServerOnly`.
- The client sends a finish only once per step and keeps the step up until the server answers. A rejected finish (e.g. for a `ServerOnly` step) is silently ignored, so the step stays on screen until the server finishes it.
- A missing client `Step<N>` module only gives a `warn`. The player can't finish that step from the client, so it stalls unless the server finishes it.
- Steps go over the network as `u8`, so the limit is 255 steps.
- No rate limit on `OnboardingStepFinished`. Spam is dropped by the current-step check.
- On the last step, `StepCompleted` fires before `Completed`.
