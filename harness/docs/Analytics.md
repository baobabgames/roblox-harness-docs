# Analytics

Sends gameplay events to Roblox's Analytics dashboard (Creator Hub > Analytics). It ships with **zero analytics**. Gameplay code fires `ServerSignals`, and `AnalyticsSystem` listens to them and logs through `AnalysisService`, so every funnel name and step number lives in one place.

## Files
- [`AnalyticsSystem.luau`](../src/Features/Analytics/Server/AnalyticsSystem.luau): where signals get connected to analytics calls. It only clears player state today (Server)
- [`AnalysisService.luau`](../src/Features/Analytics/Server/AnalysisService.luau): safe `pcall` wrappers around Roblox `AnalyticsService` (Server)

## How it connects
- **Uses:** Roblox `AnalyticsService`, `RunService`, `Players`
- **Used by:** only `AnalyticsSystem`. No other module in `src/` calls `AnalysisService`.
- **Starts:** `Players.PlayerRemoving:Connect(AnalysisService.ClearPlayer)`

## Public API
Require path: `ServerScriptService.Features.Analytics.AnalysisService`. No function yields or returns a value. A failed call (bad args, rate limit) only `warn`s.

### `AnalysisService.LogOnboardingFunnelStepEvent(player: Player, step: number, stepName: string)`
- Logs one onboarding funnel step. Steps start at 1 and go in order.

### `AnalysisService.LogFunnelStepEvent(player: Player, funnelName: string, step: number, stepName: string)`
- Logs a step of a one-time progression funnel. The funnel session id is always `nil`.

### `AnalysisService.LogFunnelStepOnce(player: Player, funnelName: string, step: number, stepName: string)`
- Same as `LogFunnelStepEvent`, but each `(funnelName, step)` is logged at most once per player per session. Repeats do nothing.

### `AnalysisService.LogEconomyEvent(player, flowType: Enum.AnalyticsEconomyFlowType, currencyType: string, amount: number, endingBalance: number, transactionType: string, itemSku: string?)`
- Logs currency coming in (`Source`) or going out (`Sink`).
- `endingBalance`: the balance after the change.
- `transactionType`: an `Enum.AnalyticsEconomyTransactionType` name (`"Gameplay"`, `"Shop"`, `"IAP"`…).

### `AnalysisService.LogCustomEvent(player: Player, eventName: string, value: number?)`
- Logs a custom event. `value` defaults to `1`.

### `AnalysisService.ClearPlayer(player: Player)`
- Forgets the player's `LogFunnelStepOnce` history. Already connected to `PlayerRemoving`.

## Adding analytics
1. Find or add a signal in that feature's `ServerSignals` group, and fire it from the feature.
2. In `AnalyticsSystem`, add `local Private = {}`, connect the signal in `Shared.Init`, and log from a `Private` handler.

```lua
-- in Shared.Init
ServerSignals.Onboarding.StepCompleted:Connect(Private.OnboardingStepCompleted)

function Private.OnboardingStepCompleted(player: Player, step: number)
	AnalysisService.LogOnboardingFunnelStepEvent(player, step, `Step{step}`)
end
```

More examples:
```lua
AnalysisService.LogFunnelStepOnce(player, "Stages", stage, `Stage {stage}`)
AnalysisService.LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, "Coins", amount, endingBalance, "Gameplay", "QuestReward")
AnalysisService.LogCustomEvent(player, "BossDefeated")
```

## Data and network
- No saved data and no remotes. The only state is a session table, `loggedSteps[player][funnelName][step]`, cleared on `PlayerRemoving`.

## Gotchas
- Server only. Never log something only the client reports. `Onboarding.StepCompleted` passes a third `fromClient: boolean` argument.
- Gameplay code should fire signals and not call `AnalysisService` directly. That keeps all analytics in `AnalyticsSystem`.
- In Studio, Roblox only prints "<method> event fired.". To also print the arguments, set `const PrintInStudio = true` in `AnalysisService`.
- `LogFunnelStepOnce` history is per session. It resets when the player rejoins.
