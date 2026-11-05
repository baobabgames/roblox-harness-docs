# Features Index

Every feature, Service, Util and public function in the template. **Check here before writing a new function**: reuse or extend what exists instead of writing a near-duplicate. Each feature links to its detailed doc.

- Only public functions (`Shared.X`) are listed. `Init` is only listed for modules other code calls.
- Require paths follow the Rojo mapping: a feature's side folder *is* the feature folder (`ServerScriptService.Features.Monetization.GiftService`, never `.Monetization.Server.`).
- Keep this file up to date: when a public function is added, removed or changed, update its line here and in the feature doc.

## Features

| Feature | Sides | What it does | Doc |
|---|---|---|---|
| Player | Server, Client | Profile loading and saving (DataService), syncing to ClientData atoms (Plums) | [Player.md](Player.md) |
| Monetization | Server, Client | Gamepasses, developer products, gifting, receipt safety | [Monetization.md](Monetization.md) |
| Onboarding | Server, Client | Step-by-step tutorial (`Step<N>` modules) | [Onboarding.md](Onboarding.md) |
| Cutscenes | Server, Client | Sequence cutscenes, play-once tracking, camera tools | [Cutscenes.md](Cutscenes.md) |
| Leaderboards | Server | Global boards, one module per board | [Leaderboards.md](Leaderboards.md) |
| Inputs | Server, Client | Input Action System from config, device detection, cursor, optional rebinding | [Inputs.md](Inputs.md) |
| Gui | Client | `Hud` and `Menu` ScreenGuis (Vide), `useSpring` hook, `Window`, `Button`, `ItemViewport`, `HoverButton`, `SliceImage`, `Stage`, `ProgressBar`, `Toast` components, toast stack (`ToastService`) | [Gui.md](Gui.md) |
| DeveloperTools | Server, Client | Cmdr console (F2) with a developer-only hook; live tuning of config feel knobs in Studio play | [DeveloperTools.md](DeveloperTools.md) |
| Analytics | Server | Safe wrappers over Roblox AnalyticsService | [Analytics.md](Analytics.md) |
| Import | Server, Client | Copies an imported game's old saves into the profile on first join; Plums- and atom-backed stand-ins for its old Replica API (idle unless `SharedConfigs.Import` lists stores) | [Import.md](Import.md) |
| Core | All | Shared Services, Utils, Configs, Types, Data, Signals, Loaders, feel kit (camera shake, hit pause, floating numbers, flying rewards, guide beam, sound pitch) | [Core.md](Core.md) |

## I need to...

| Need | Use |
|---|---|
| Read player data (server) | `ServerData.ProfileDatas[player]` |
| Write player data (replicates) | `ServerData.Plums.ProfilesPlum[player]:SetValue({ "PlayerData", "X" }, value)`, also `IncValue / DecValue / ArrayInsert / ArrayRemove` (path array; `*ServerOnly` variants don't replicate) |
| Run code when a profile loads / leaves | `ServerSignals.Profile.Loaded` / `.Removing` |
| Read synced data in UI | `useAtom(ClientData.PlayerData.X)` |
| Play a sound or music | `SoundsService.PlaySound`, `SoundsService.PlayListsPlay` |
| Run something every frame / every N seconds | `LoopService.AddLoop` |
| Debounce or cooldown | `TimeUtil.OneDelay`, `TimeUtil.InCooldown` |
| Format numbers or time | `NumberUtil.FormatWithSuffix / FormatWithCommas`, `TimeUtil.FormatTimeMS / FormatDuration / ...` |
| Play tweens in order | `TweenUtil.StepTweening` |
| UI colors, fonts, text sizes, corners, spacing, depth, motion, rarity colors, 9-slice art, sounds | `ThemeUtil.Get(styleName?)` (styles from `/new-reference`) |
| Studded surface on a part built in code | `MaterialUtil.Apply(part, surface)` (variants from `SharedConfigs.World`) |
| Particles burst | `ParticleUtil.EmitParticles` |
| Check gamepass ownership | `MonetizationService.OwnsGamepass` (server, includes gifts), `MonetizationUtil.IsGamepassPurchased` |
| Prompt a purchase | `MonetizationUtil.Prompt` |
| Celebrate a purchase (confetti + sound) | `MonetizationService.Celebrate` |
| Listen to a key / button | `InputService.OnPressed / OnReleased / OnChanged` (add the action in `SharedConfigs.Inputs`) |
| Block input during something | `InputService.SetContextEnabled(context, false, reason)` |
| Show the right key prompt | `ClientData.Input.Device`, `InputService.GetBinding` |
| Open / close a menu | `ClientData.Gui.OpenMenu(name or nil)` |
| Animate UI | `useSpring` (Gui hook) |
| A themed menu window (header, title icon, X) | `Window` (Gui component) |
| A themed 3D-looking button (edge, face, shine, press) | `Button` (Gui component) |
| A 3D icon of a model (item, pet, HUD button) | `ItemViewport` (Gui component; folders in `SharedConfigs.Gui`) |
| Image button that grows on hover, with sounds | `HoverButton` (Gui component) |
| Draw a piece of the style's 9-slice art | `SliceImage` (Gui component; slot names in `SharedConfigs.Themes` `Slices`) |
| Lay out a Figma frame pixel-exact, scaled to fit | `Stage` (Gui component; `DesignSize` in px) |
| Play a cutscene | `CutsceneService.Play` (server) |
| Move or lock the camera | `CutsceneUtil.CameraCutscenes.MoveCamera / AttachToPart / ResetCamera` |
| Hide all UI temporarily | `CutsceneUtil.DisableAllGui` (returns a restore function) |
| Check if someone is a developer | `DeveloperUtil.IsDeveloper` |
| Make a config value tunable live in Studio (feel knob) | A `Tuning = { Key = { Min, Max, Step } }` table in the config, value read at use time (`TuningUtil`) |
| Log analytics | `AnalysisService.LogFunnelStepOnce / LogCustomEvent / LogEconomyEvent` |
| Shake the camera | `CameraShakeUtil.Shake(intensity)` (client, 0 to 1; `Stop()` ends it) |
| Freeze attacker and target for a moment on a hit | `HitPauseUtil.Pause(target, seconds)` (client) |
| Show a floating number (damage, coins, "Crit!") | `FloatingTextUtil.Show(value, at, options?)` (client) |
| Fly reward icons into a HUD counter | `CurrencyChip` with `FlyTarget = "Coins"`, then `RewardFlyUtil.Fly("Coins", from, amount, onArrive?)` (client) |
| Show a toast from client code | `ToastService.Show(text, kind?)` (kind `Success`, `Warn` or `Info`) |
| Show a toast from the server | `ServerNetwork.Notify.Fire(player, kind, text)` (shown by `GuiController`) |
| Show a progress bar (XP, health, quest) | `ProgressBar` (Gui component) |
| Point the player at the next goal | `GuideBeamUtil.Show(target)` (returns the hide function) |
| Play a sound at a pitch, or a pitch that climbs | `SoundsService.PlaySound(name, { PlaybackSpeed = n })` or `{ PitchVariation = 0.08 }`; chains: `FeelUtil.ChainStep` then `FeelUtil.PitchForStep` |
| Add a feel number you can tune live | A `Tuning` table in a config, read at use time; example: `SharedConfigs.Feel` |

---

## Core: Shared Services ([Core.md](Core.md))

`LoopService` (Shared, `ReplicatedStorage.Services.LoopService`): per-frame callbacks (RenderStepped on client, Heartbeat on server)
- `AddLoop(callback: (dt) -> (), config: { Index: string?, RunPerSecond: number?, RemoveOnElapsedTime: number? }?) -> () -> ()`: add a loop (every frame, or every RunPerSecond seconds), returns a remover
- `RemoveLoop(index: string) -> boolean`: remove the first loop with that Index

`SoundsService` (Shared, `ReplicatedStorage.Services.SoundsService`): sound effects, playlists, SFX/music settings
- `PlaySound(sound: Sound | string | { string }, config: PlayConfig?) -> Sound?`: play (clone / position / fade / pitch: `PlaybackSpeed`, `PitchVariation`); yields until loaded; `IgnoreMissing` skips a missing name without warning
- `StopSound(sound: Sound | string) -> ()`
- `FindSoundByName(name: string, quiet: boolean?) -> Sound?`: searches SoundService (skips Extra); warns if missing unless `quiet`
- `EnablePlaySound(enable: boolean) -> ()`: SFX on/off
- `SetMusicEnabled(enabled: boolean) -> ()`: music on/off
- `PlayListsPlay(playListName: string?, random: boolean?, index: number?) -> ()`: start a looping playlist (default "Main"), stopping the track already playing
- `NextOnCurrentPlayList()`, `StopCurrentPlayList()`, `MuteCurrentPlayList()`, `UnmuteCurrentPlayList()`, `PauseCurrentPlayList()`, `UnpauseCurrentPlayList()`
- `DistortCurrentPlaylist(enabled: boolean, callback: (() -> ())?) -> ()`: slow-down effect on / off

## Core: SharedUtilities ([Core.md](Core.md))

Require the main util: `local SharedUtilities = require(ReplicatedStorage.SharedUtilities)`, then `SharedUtilities.NumberUtil`, etc.

`CharacterUtil`: character helpers
- `GetHumRootFromPlayer(player) -> BasePart?`, `GetHumanoidFromPlayer(player) -> Humanoid?`: nil when the player has no character
- `ApplyHumanoidDescription(userId: number, model: Model) -> boolean`: dress a model as the user's avatar; yields
- `CharacterVisibility(player, visible: boolean, excluded?) -> ()`: set part/decal transparency

`NumberUtil`: number formatting
- `FormatWithSuffix(value) -> string` ("1.23K"), `FormatDecimal(value) -> string`, `FormatWithCommas(value) -> string` ("1,234,567")
- `GetNumberFromString(str, inNumber: boolean) -> (string | number)?`: first run of digits
- `GetUniqueNumberID(list) -> number`: lowest unused positive integer key
- `PlayerExpRequiredCalculation(level) -> number`: floor(100 * level^1.5)

`ParticleUtil`
- `EmitParticles(source: BasePart | ParticleEmitter, options?: { Clone?, EmitAt?, Parent?, Size?, DestroyAfter?, EmitCount? }) -> ()`: a burst with Emit (never changes Enabled); EmitAt / Parent / Size use a copy, so the original never moves

`TimeUtil`: timers and time formatting
- `OneDelay(index: string, duration: number, callback) -> ()`: debounced `task.delay` per index
- `InCooldown(cooldownTime, timeStamp, timeType: ("Clock" | "Tick")?) -> boolean`
- `GetUniversalTime(date) -> DateTime`, `GetLocalTime(date) -> DateTime`
- `FormatTimeMS` ("MM:SS"), `FormatTimeMinSec` ("2m 05s"), `FormatDuration` ("5m 5s"), `FormatDurationWords` ("15 Minutes"), `FormatTimeDHMS` ("DD:HH:MM:SS"): all `(seconds) -> string`

`TweenUtil`
- `StepTweening(tweens: { Tween }, callback?) -> ()`: plays tweens one after another (doesn't yield)

`ThemeUtil`: UI looks from `SharedConfigs.Themes` (styles written by `/new-reference`)
- `Get(styleName: string?) -> Theme`: the style's theme (default: `Themes.Active`), with every field it leaves out filled from `DefaultTheme`; unknown style warns once and gives the default. Cached, read-only
- `ReducedMotion() -> boolean`: the player's Reduce Motion setting (false on the server); components skip pop-ins, staggers and squash when true
- `GetRarity(theme: Theme, rarity: string) -> (Color3, number)`: the rarity's color and rank in `theme.RarityOrder` (1 = lowest) so UI shows rarity by pips or label too; unknown gives TextMuted, 1
- `GetStyleNames() -> { string }`: every style name, sorted
- `GetSlice(theme: Theme, slot: string?) -> Slice?`: the style's 9-slice art in a `Slices` slot; nil when the slot is empty or the theme is Plain
- `AncestorScale(object: Instance) -> number`: product of the UIScales on the object and its ancestors (divide it out before fitting a layout)
- `FitScale(available: Vector2, design: Vector2) -> number`: the smaller axis ratio, to fit a design box and keep its shape; 1 while a size is 0

`MaterialUtil`: the Studs surface look on parts built in code (`SharedConfigs.World`)
- `Apply(part: BasePart, surface: string) -> boolean`: sets SmoothPlastic and the variant for `surface` (`Ground`, `Floor`, `Soil`, `Wood`, `Foliage`, `Cap`, `Rock`, `Gloss`); skips Glass, Neon, ForceField, invisible parts, unknown surfaces, or everything while `UseMaterialVariants` is off
- `CanApply(part: BasePart) -> boolean`: whether a part would get a variant

`FeelUtil`: math for the feel kit (no Instances; Lune spec in `lune/Core/Shared/SharedUtilities/FeelUtil.spec.luau`)
- `AddTrauma(trauma: number, amount: number) -> number`: adds, kept between 0 and 1
- `DecayTrauma(trauma: number, dt: number, rate: number) -> number`: minus `rate * dt`, never below 0
- `ShakeAmount(trauma: number) -> number`: the trauma squared (0 to 1)
- `ChainStep(lastTime: number?, now: number, resetAfter: number, step: number) -> number`: `step + 1` if the last one was at most `resetAfter` s ago, else 0
- `PitchForStep(step: number, maxSteps: number) -> number`: a `PlaybackSpeed`, one semitone per step, stopped at `maxSteps`
- `ShouldMerge(lastTime: number?, now: number, window: number) -> boolean`: a new number adds into the last one when true
- `FlyIconCount(amount: number, maxIcons: number) -> number`: one icon per unit of a reward, 1 to `maxIcons`, 0 for none

`InputUtil`, `MonetizationUtil`, `DeveloperUtil`, `TuningUtil`: listed under their features below.

## Core: data, signals, configs ([Core.md](Core.md))

- `ServerData` (`ServerScriptService.ServerData`): `ProfileClasses[player]`, `ProfileDatas[player]`, `Plums.ProfilesPlum[player]`
- `ClientData` (`StarterPlayer.StarterPlayerScripts.ClientData`, exact path): `ProfileLoaded` (true once the profile arrived), `ProfileData {}`, `PlayerData { GamepassPurchased, Keybinds }`, `Gui { OpenMenu, Toasts }`, `Input { Device, MouseUnlocked, MouseIcon }`
- `ServerSignals` (`ServerScriptService.ServerSignals`): `Profile { Loaded, Removing }`, `Onboarding { FinishStepRequested, StepCompleted, Completed }`, `Cutscenes { Started, Finished }`, `Import { Done }`
- `SharedConfigs` (`ReplicatedStorage.SharedConfigs`): `Developers`, `Feel` (feel knobs, live-tunable; see the feel kit below), `Features` (`Disabled`: template features the Loaders skip), `Gui`, `Import` (`LegacyStores`: old saves to copy), `Inputs`, `Monetization`, `Onboarding`, `Player` (`SaveInStudio`: Studio plays use the mock store unless on), `Themes` (incl. the optional `Imported` tokens), `World`
- `SharedTypes` (`ReplicatedStorage.SharedTypes`): `PlayerData`, `ProfileData`, `OnboardingData`, `TuningSpec`, Plum types
- `ClientUtilities` (`StarterPlayer.StarterPlayerScripts.ClientUtilities`): `CutsceneUtil`, `CameraShakeUtil`, `HitPauseUtil`, `FloatingTextUtil`, `RewardFlyUtil`, `GuideBeamUtil` (feel kit below)

---

## Core: feel kit ([Core.md](Core.md))

`CameraShakeUtil` (Client, `ClientUtilities.CameraShakeUtil`)
- `Shake(intensity: number) -> ()`: adds trauma (0 to 1); ignored under Reduce Motion
- `Stop() -> ()`: ends the shake at once

`HitPauseUtil` (Client, `ClientUtilities.HitPauseUtil`)
- `Pause(target: Instance?, seconds: number) -> ()`: freezes the animations under `target` for `seconds`; a second call extends it

`FloatingTextUtil` (Client, `ClientUtilities.FloatingTextUtil`)
- `Show(value: number | string, at: Vector3 | BasePart, options: FloatOptions?) -> ()`: a number or word that rises and fades; `FloatOptions`: `Color`, `Crit`, `MergeKey`, `Prefix`, `Theme`

`RewardFlyUtil` (Client, `ClientUtilities.RewardFlyUtil`)
- `SetTarget(name: string, target: GuiObject) -> ()`, `ClearTarget(name: string, target: GuiObject?) -> ()`: the counter that rewards named `name` fly into
- `Fly(name: string, from: Vector3 | Vector2, amount: number, onArrive: (() -> ())?, options: FlyOptions?) -> ()`: icons fly from `from` into the target; `FlyOptions`: `Image`, `Color`

`GuideBeamUtil` (Client, `ClientUtilities.GuideBeamUtil`)
- `Show(target: BasePart | Attachment | Vector3) -> () -> ()`: a beam from the character to the goal (one at a time); returns its hide function
- `Hide() -> ()`: removes the current guide, if any

---

## Player ([Player.md](Player.md))

- `PlayerSystem` (Server): starts DataService (mock store in Studio unless `SharedConfigs.Player.SaveInStudio`) and Plums, builds profiles, fires `ServerSignals.Profile.Loaded / Removing`
- `ProfileClass` (Server, internal to Player): `new(player, playerData)`, `:Init()`, `:Destroy()`
- `PlayerDataTemplate` (Server): saved defaults. **Add new saved fields here** (and in `SharedTypes/ProfileType`)
- `ProfileDataTemplate` (Server): session-only defaults
- `PlayerController` (Client): copies Plum data into `ClientData` atoms (`DeepSyncFields` for fields written in place)

## Monetization ([Monetization.md](Monetization.md))

`MonetizationService` (Server, `ServerScriptService.Features.Monetization.MonetizationService`)
- `OwnsGamepass(player, gamepassId) -> boolean`: from saved data (includes gifts)
- `GiveGamepass(player, gamepassId) -> ()`: saves once, runs the handler's Processing
- `WasPurchaseGranted(player, purchaseId: string) -> boolean`
- `RecordPurchase(player, purchaseId: string) -> ()`: keeps the last 100
- `WaitForSaveAsync(player, purchaseId: string) -> boolean`: yields until a save includes the receipt id; receipts are only acknowledged after it
- `Celebrate(player) -> ()`: confetti and the RobuxBuy sound

`GiftService` (Server, `ServerScriptService.Features.Monetization.GiftService`)
- `Request(purchaser, recipientUserId, key) -> ()`: checks and prompts payment (RequestGift handler), 2 s cooldown per purchaser
- `Init() -> ()`, `FindPending(purchaser, productId) -> PendingGift?`, `Complete(purchaser, pending) -> ()`, `Send(purchaser, pending) -> boolean` (recipient's saved mailbox), `Receive(recipient, message) -> boolean` (mailbox callback), `OnPromptFinished(purchaser, productId, wasPurchased) -> ()`, `RemovePlayer(purchaser) -> ()` (PlayerRemoving)

`MonetizationUtil` (Shared, `SharedUtilities.MonetizationUtil`)
- `GetConfigByName(name, monetizationType) -> MonetizationConfig?`
- `GetConfigById(id, monetizationType) -> (MonetizationConfig?, string?)`
- `GetGift(key) -> Gift?`, `GetPaymentProduct(key) -> MonetizationConfig?`, `IsGamepassGiftPayment(productId) -> boolean`
- `GetRobuxPriceById(idOrName, monetizationType) -> number?`: yields once per id, cached
- `IsGamepassPurchased(idOrName, player?, checkData?) -> boolean`: pass `checkData = true` to count gifts
- `Prompt(idOrName, monetizationType, player?) -> boolean`: opens the purchase prompt

Handlers: ModuleScripts under `Monetizations/Gamepass` and `Monetizations/Products` with `Id` / `IdList`.

## Onboarding ([Onboarding.md](Onboarding.md))

`OnboardingService` (Server, `ServerScriptService.Features.Onboarding.OnboardingService`)
- `Enabled: boolean`: false until `SharedConfigs.Onboarding.Enabled` is on (and MaxStep >= 1); while off nothing touches onboarding data
- `MaxStep: number`
- `IsCompleted(player) -> boolean?`, `GetStep(player) -> number?`: nil if not loaded (GetStep is also nil while the tutorial is off)
- `FinishStep(player, step) -> ()`: only the current step is accepted
- `MarkCompleted(player) -> ()`, `Skip(player) -> boolean`: do nothing while the tutorial is off

Steps: `Step<N>` modules in `OnboardingSystem` (server) and `OnboardingController` (client). Config: `SharedConfigs.Onboarding` (`Enabled`, off by default, and `MaxStep`).

## Cutscenes ([Cutscenes.md](Cutscenes.md))

`CutsceneService` (Server, `ServerScriptService.Features.Cutscenes.CutsceneService`): decides who watches, play-once, saves seen
- `Play(players: Player | { Player }, name, force?) -> ()`: replaces a cutscene already playing (it ends with Finished skipped = true)
- `Skip(player) -> ()`, `GetPlaying(player) -> string?`, `HasSeen(player, name) -> boolean?`, `MarkSeen(player, name) -> ()`
- `ReportFinished(player, name, completed: boolean) -> ()`: the client's end report (CutsceneSystem, CutsceneFinished remote); only counts for the cutscene that player is watching, marks it seen if `completed`, fires `Cutscenes.Finished`
- `Clear(player) -> ()`: forgets what the player is watching (PlayerRemoving)

`CutsceneService` (Client, `StarterPlayer.StarterPlayerScripts.Features.Cutscenes.CutsceneService`): runs cutscene modules. Usually driven by the server
- `Play(name) -> ()` (this client only), `Stop() -> ()`, `IsPlaying() -> boolean`
- `PlayFromServer(name)`, `StopFromServer()`: used by CutsceneController for the remotes; they report the end back to the server

`CutsceneUtil` (Client, `ClientUtilities.CutsceneUtil`)
- `DisableAllGui(excluded?, index?) -> () -> ()`, `RestoreGui(index?) -> ()`
- `CameraCutscenes.Play(cameraFolder) -> () -> ()`, `.MoveCamera(options) -> () -> ()`, `.AttachToPart(part, config?) -> () -> ()`, `.ResetCamera() -> ()`

Play-once list: `PlayOnceCutscenes` (Server).

## Leaderboards ([Leaderboards.md](Leaderboards.md))

- Add a board: one module in `Leaderboards/Server/Boards/` (`{ Stat = "Coins" }`).
- `LeaderboardSystem.RemovePlayerAsync(player) -> ()`: removes a player from every board store; yields
- Internal classes: `Leaderboard`, `LeaderboardEntry`, `UserInfo` (`GetNameAsync`, `GetThumbnailAsync`: cached by UserId; reuse for any name/avatar lookup on the server). Settings: `LeaderboardConfig`.

## Inputs ([Inputs.md](Inputs.md), how-to: [INPUT_GUIDE.md](../.claude/guides/INPUT_GUIDE.md))

`InputService` (Client, `StarterPlayer.StarterPlayerScripts.Features.Inputs.InputService`)
- `Init() -> ()`: builds every context, action and binding from `SharedConfigs.Inputs` (called by InputController; safe to call again)
- `OnPressed / OnReleased / OnChanged(context, action, callback) -> () -> ()`: returns a disconnect
- `GetState(context, action) -> any`, `GetContext(context) -> InputContext?`, `GetAction(context, action) -> InputAction?`
- `SetContextEnabled(context, enabled, reason?) -> ()`
- `AddTouchButton(context, action, button) -> () -> ()`
- `SetMouseIcon(icon?) -> ()`, `GetMouseIcon() -> string?`
- Rebinding (only with `AllowRebinding`): `SetBinding(context, action, keyCode, property?) -> (boolean, reason?, conflict?)`, `GetBinding(context, action, device, property?) -> Enum.KeyCode?`, `ResetBinding(context, action, device?) -> boolean`, `ResetAllBindings() -> boolean`, `GetKeybinds()`, `IsLoaded()`, `FlushSave()`, `CaptureKey(callback) -> () -> ()`, `CancelCapture()`, `IsCapturing()`
- `ApplyKeybinds(saved: { [string]: string }?) -> ()`: applies the saved keybinds (InputController calls it on join and when `ClientData.PlayerData.Keybinds` changes); skipped while a local change waits to save

`InputUtil` (Shared, `SharedUtilities.InputUtil`): keybind rules shared by client and server
- `GetDevice(keyCode) -> "Keyboard" | "Gamepad"`, `GetBindingDevice(binding) -> Device?`
- `MakeKey`, `ParseKey`, `GetRebindableAction`, `GetFirstBinding`, `GetDefault`, `IsValidName`
- `CanBind(key, keyCodeName) -> (boolean, reason?)`
- Values: `RebindProperties: { [string]: true }` (InputBinding properties a player may change), `MaxKeybinds = 200` (most overrides one player can save)

## Gui ([Gui.md](Gui.md), how-to: [UI_GUIDE.md](../.claude/guides/UI_GUIDE.md))

- `Hud` / `Menu` (Client): add a child module to `Gui/Client/Hud` or `Gui/Client/Menu`. Menus get `{ IsOpen, Close }` props.
- `useSpring<T>(initial: T, options?) -> (() -> T, Spring<T>)` (Client, `Gui.Hooks.useSpring`): Ripple spring as a Vide source; call inside a component
- `HoverButton(props, hoverProps?) -> ImageButton` (Client, `Gui.Components.HoverButton`): ImageButton that scales up on hover / gamepad selection, with hover and click sounds; scale, spring and sounds come from the theme (`hoverProps.Theme` or the active one, see `ThemeUtil`); call inside a component
- `Window(props: WindowProps) -> Frame` (Client, `Gui.Components.Window`): menu window with a shadow edge, textured header and title, optional 3D `TitleIcon`, an X overlapping the corner when `Close` is given; children go in its textured `Body`; `PanelSlice` / `HeaderSlice` swap in the style's panel and header art
- `Button(props: ButtonProps) -> ImageButton` (Client, `Gui.Components.Button`): 3-layer button (darker edge, gradient face, shine strip; press moves the face down), `Text`, `Icon`, `Color`, `Disabled`, `Activated`, `Slice` (style face art); hover and sounds from `HoverButton`
- `ItemViewport(props: ItemViewportProps) -> GuiObject` (Client, `Gui.Components.ItemViewport`): renders model `Id` of `Kind` from `ReplicatedStorage.Assets` (folders in `SharedConfigs.Gui.ItemViewport.Folders`) as a 3/4-view ViewportFrame icon, framing cached per model; a colored shape when missing
- `CurrencyChip(props: CurrencyChipProps) -> Frame` (Client, `Gui.Components.CurrencyChip`): pill with a currency `Icon`, optional `FlyTarget` (the reward name that flies into it), the abbreviated `Amount` (number or function) in the theme's DisplayFont, optional drawn-plus `OnAdd` button, `Label` (currency name used in Plain mode instead of the icon); pops when the amount changes (not under Reduce Motion)
- `PriceButton(props: PriceButtonProps) -> Frame` (Client, `Gui.Components.PriceButton`): `Button` with `Icon` + abbreviated `Price`; `Balance` decides: affordable calls `OnBuy`, otherwise Negative face, flash, shake and `OnCantAfford`; `Owned` shows a Disabled "Owned"
- `ItemCard(props: ItemCardProps) -> ImageButton` (Client, `Gui.Components.ItemCard`): square grid card with `Icon`, `Title`, rarity frame color plus rank pips (`ThemeUtil.GetRarity`), optional `Badge` / `BadgeIcon`, `Selected` / `Locked` / `Equipped` states, `OnSelect`, staggered pop-in by `Index`; `Slice` (default `Card`) draws the style's 9-slice card art
- `Tabs(props: TabsProps) -> Frame` (Client, `Gui.Components.Tabs`): horizontal or vertical strip of `Tabs` (`Id`, `Text`, `Icon?`, `Badge?`), `Selected` / `OnSelect(id)`; the selected tab is the larger Primary hero, the rest recessed Secondary
- `SliceImage(props: SliceImageProps) -> GuiObject` (Client, `Gui.Components.SliceImage`): one 9-slice piece of the style's art from a `Slices` slot name (or a `Slice` table), tinted with `Color` for Tint art; an empty slot or Plain draws a plain rounded Frame in `Color`; children drawn on top
- `Stage(props: StageProps) -> Frame` (Client, `Gui.Components.Stage`): a Figma frame drawn 1:1 in `DesignSize` px, centered and scaled to fit its parent by one `UIScale`, dividing out ancestor UIScales (`ThemeUtil.AncestorScale`); children are placed in design px

- `ProgressBar(props: ProgressBarProps) -> Frame` (Client, `Gui.Components.ProgressBar`): track and fill that eases to `Value` (0 to 1), optional `Label` and `Color`; flat in Plain, pill in styled looks
- `Toast(props: ToastProps) -> Frame` (Client, `Gui.Components.Toast`): one message in a panel with a kind strip (`Success` / `Warn` / `Info`); the toast stack creates these, use `ToastService` instead
- `ToastService.Show(text: string, kind: ("Success" | "Warn" | "Info")?) -> ()` (Client, `Gui.ToastService`): adds a toast that leaves after `Feel.ToastSeconds`; at most `Feel.ToastMax` at once

## DeveloperTools ([DeveloperTools.md](DeveloperTools.md))

- Add Cmdr types, hooks and commands in `DeveloperToolSystem/Cmdr/{Types,Hooks,Commands}` (Group `"Developer"` is gated).
- UI Labs stories for every Gui screen in `Client/UILabs/` (`Gui.storybook`, `Stories/`, `Mocks/`; UI_GUIDE section 7). Edit-mode only.
- `StoryUtil.Controls(extra?)`, `StoryUtil.DeviceFrame(controls, view, actions?) -> Frame`, `StoryUtil.With(list, item)`, `StoryUtil.Without(list, id)`, `StoryUtil.DeviceSize(name)`, `StoryUtil.Zones(size)` (Client, `DeveloperTools.UILabs.StoryUtil`): story helpers
- `UIAudit.Run(options?) -> string`, `UIAudit.Clear()` (Client, `DeveloperTools.UILabs.UIAudit`): the ready-made UI check over every story at Phone / PC (run via `loadstring` from `execute_luau`)
- `DeveloperUtil.IsDeveloper(userId) -> boolean` (Shared, `SharedUtilities.DeveloperUtil`): Studio, `SharedConfigs.Developers`, or the game owner
- Live tuning (Studio only): `TuningSystem` (Server) puts every knob of every config with a `Tuning` table on `ReplicatedStorage.Tuning.<Config>` as Attributes, validates edits, writes them into the config and prints `[Tuning]` lines plus a `[TuningSnapshot]` line of every tuned knob (also its `Snapshot` Attribute; `lune run apply-tuning` writes it into the configs); `TuningController` (Client) mirrors them into the client's config and sends Client-view edits (`TuneSet`)
- `TuningUtil.Specs(configs) -> ({ [Config]: { [Key]: TuningSpec } }, skipped: { string })` (Shared, `SharedUtilities.TuningUtil`): every tunable knob, plus the "Config.Key" entries that can't be tuned
- `TuningUtil.Validate(spec, current, value) -> (boolean, any)` (Shared, `SharedUtilities.TuningUtil`): same type as `current`, finite, snapped to `Step` and clamped to `Min` / `Max`; false keeps `current`
- `TuningUtil.Literal(value) -> string` (Shared, `SharedUtilities.TuningUtil`): a knob value as Luau source (`0.35`, `"Arc"`, `Color3.fromRGB(...)`, `Vector3.new(...)`)
- `TuningUtil.Changed(configs, startValues) -> { [Config]: { [Key]: string } }` (Shared, `SharedUtilities.TuningUtil`): the knobs that differ from their start values, as Literals

## Analytics ([Analytics.md](Analytics.md))

`AnalysisService` (Server, `ServerScriptService.Features.Analytics.AnalysisService`): never errors, only warns
- `LogFunnelStepOnce(player, funnelName, step, stepName) -> ()`: once per player per session
- `LogFunnelStepEvent(player, funnelName, step, stepName) -> ()`, `LogOnboardingFunnelStepEvent(player, step, stepName) -> ()`
- `LogEconomyEvent(player, flowType, currencyType, amount, endingBalance, transactionType, itemSku?) -> ()`
- `LogCustomEvent(player, eventName, value?) -> ()`
- `ClearPlayer(player) -> ()`

Hook signals up in `AnalyticsSystem`.

## Import ([Import.md](Import.md), how-to: [DATA.md](../.claude/skills/import-game/DATA.md))

- `ImportSystem` (Server): copies old saves from `SharedConfigs.Import.LegacyStores` into `PlayerData` on first join, sets `LegacyImported[Id or Store]`, fires `ServerSignals.Import.Done`; idle with no stores
- `ImportRules` (Server, pure): `Key(store, userId) -> string`, `Root(oldSave, store) -> table?`, `Plan(oldSave, playerData, store) -> { { Path, Value } }` (Merge `Add` / `Max` / `Union` / `Replace`)
- `LegacyReplicaStandIn` (Server): `new(player, plum?, playerData?)`, `:Set`, `:SetValues`, `:TableInsert`, `:TableRemove`, `.Data`; `Signals(oldLoaded, oldRemoving) -> disconnect`
- `LegacyReplicaShim` (Client): `new(atoms?, loaded?)`, `.OnNew(className, fn)`, `:OnChange(fn)` (`Set` / `TableInsert` / `TableRemove` per leaf), `:OnSet(path, fn)`, `.Data` (read-only), `:Destroy()`
