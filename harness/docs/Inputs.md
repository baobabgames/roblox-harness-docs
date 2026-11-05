# Inputs

Builds the game's input contexts, actions and bindings from `SharedConfigs.Inputs` using Roblox's Input Action System. It also tracks the player's device, applies cursor settings, and (opt-in) lets players rebind keys, saved in `PlayerData.Keybinds`.

For a step-by-step guide (adding actions, rebind menus, touch buttons), see [INPUT_GUIDE.md](../.claude/guides/INPUT_GUIDE.md). This page is the reference.

## Files
- [`InputService.luau`](../src/Features/Inputs/Client/InputService.luau): public client API. Builds the contexts and handles listeners, context toggles, cursor icon, touch buttons and rebinding (Client)
- [`InputController/init.luau`](../src/Features/Inputs/Client/InputController/init.luau): entry point. Builds the inputs, starts its helpers, turns off `DisabledInMenus` contexts while a menu is open, and applies saved keybinds (Client)
- [`InputController/Device.luau`](../src/Features/Inputs/Client/InputController/Device.luau): keeps `ClientData.Input.Device` up to date (Client)
- [`InputController/Mouse.luau`](../src/Features/Inputs/Client/InputController/Mouse.luau): applies the cursor icon. Also has optional cursor hiding and an unlock key (Client)
- [`InputSystem.luau`](../src/Features/Inputs/Server/InputSystem.luau): checks and saves keybind changes sent by the client (Server)
- [`SharedConfigs/Inputs.luau`](../src/Core/Shared/SharedConfigs/Inputs.luau): contexts, `AllowRebinding`, `ReservedKeys` and `Mouse` options (Shared)
- [`SharedUtilities/InputUtil.luau`](../src/Core/Shared/SharedUtilities/InputUtil.luau): keybind key format and the `CanBind` check, used by both sides (Shared)

## How it connects
- **Uses:** `SharedConfigs.Inputs`, `SharedUtilities.InputUtil`, `ClientData.Input.*`, `ClientData.Gui.OpenMenu`, `ClientData.PlayerData.Keybinds`, `ServerData.Plums.ProfilesPlum`, `ServerSignals.Profile.Removing`, the Blink event `SaveKeybinds`, and Charm `subscribe`.
- **Used by:** any Controller or Gui that listens for actions. No feature in the template calls `InputService` yet, because `Contexts` is empty by default.
- **Starts:**
  - `InputController.Init`: calls `InputService.Init()`, then `Init` on Device and Mouse. Subscribes to `OpenMenu` (cancels any key capture and toggles `DisabledInMenus` contexts with reason `"Menu"`). If `AllowRebinding` is on, it subscribes `InputService.ApplyKeybinds` to `ClientData.PlayerData.Keybinds`.
  - `InputSystem.Init`: listens to `SaveKeybinds.On`, `ServerSignals.Profile.Removing` and `Players.PlayerRemoving`.

## Public API

### InputService (Client)
Require it as `StarterPlayer.StarterPlayerScripts.Features.Inputs.InputService`. Requiring it from any other path returns that same copy.

```lua
local InputService = require(StarterPlayer.StarterPlayerScripts.Features.Inputs.InputService)
```

#### `InputService.Init() -> ()`
- Builds the `InputContexts` folder under `PlayerScripts` from the config, unless it already exists. Safe to call more than once. Every other function builds the folder on first use too, so call order between Controllers doesn't matter.

#### `InputService.GetContext(contextName: string) -> InputContext?`
- Returns the built `InputContext`, or nil and warns once per name if it's missing.

#### `InputService.GetAction(contextName: string, actionName: string) -> InputAction?`
- Returns the built `InputAction`, or nil. Warns once if the context or the action is missing.

#### `InputService.GetState(contextName: string, actionName: string) -> any`
- Returns `action:GetState()`: a boolean for `Bool`, or a number / Vector2 / Vector3 for direction types. Returns nil if the action is missing.

#### `InputService.OnPressed(contextName: string, actionName: string, callback: () -> ()) -> () -> ()`
#### `InputService.OnReleased(contextName: string, actionName: string, callback: () -> ()) -> () -> ()`
#### `InputService.OnChanged(contextName: string, actionName: string, callback: (state: any) -> ()) -> () -> ()`
- Connects to the action's `Pressed`, `Released` or `StateChanged` signal.
- Returns a function that disconnects it. If the action is missing, it returns a no-op function (and warns once).

```lua
local disconnect = InputService.OnPressed("Gameplay", "Sprint", function()
	ClientNetwork.Sprint.Fire(true)
end)
```

#### `InputService.SetContextEnabled(contextName: string, enabled: boolean, reason: string?) -> ()`
- Adds or removes a disable reason (default `"Manual"`). The context is only enabled when no reasons are left.
- Does nothing if the context is missing.

#### `InputService.SetMouseIcon(icon: string?) -> ()`
- Sets `ClientData.Input.MouseIcon`. Passing `""` counts as nil (Roblox's default cursor). Mouse.luau applies it to `UserInputService.MouseIcon`.

#### `InputService.GetMouseIcon() -> string?`
- Returns the current custom icon, or nil when Roblox's default cursor is showing.

#### `InputService.AddTouchButton(contextName: string, actionName: string, button: GuiButton) -> () -> ()`
- Adds an `InputBinding` named `Touch_<button.Name>` with `UIButton = button` to the action.
- Returns a function that removes it. The binding is also destroyed when the button is. Returns a no-op function if the action is missing.

#### Rebinding
All of these need `SharedConfigs.Inputs.AllowRebinding = true`.

#### `InputService.SetBinding(contextName: string, actionName: string, keyCode: Enum.KeyCode, property: string?) -> (boolean, string?, string?)`
- Binds `keyCode` to the action's **first** binding for the key's device (from `InputUtil.GetDevice`). Applies right away and is saved 1 s after the last change.
- `property`: `"KeyCode"` (default), `"Up"` / `"Down"` / `"Left"` / `"Right"` / `"Forward"` / `"Backward"`, or `"PrimaryModifier"` / `"SecondaryModifier"`.
- Setting the config's own key removes the override. That is always allowed, even for a reserved key, as long as the action is rebindable.
- Returns `true`, or `false, reason, conflictActionName?`. The reasons are:
  - `"Disabled"`: `AllowRebinding` is off
  - `"NotLoaded"`: the saved keybinds haven't arrived yet
  - `"Invalid"`: bad key or property
  - `"NotRebindable"`: the action is missing or has `Rebindable = false`
  - `"NoBinding"`: the action has no config binding for that device
  - `"Reserved"`: the key is reserved or isn't a valid KeyCode name
  - `"WrongDevice"`: the key's device doesn't match
  - `"Conflict"`: another action in the same context already uses the key. Its name is the third return value. Modifier properties are never checked for conflicts.

```lua
local ok, reason, other = InputService.SetBinding("Gameplay", "Sprint", Enum.KeyCode.LeftControl)
```

#### `InputService.GetBinding(contextName: string, actionName: string, device: "Keyboard" | "Gamepad", property: string?) -> Enum.KeyCode?`
- Returns the key currently on the action's first binding for that device (default property `"KeyCode"`), including player changes.
- Returns nil when the key is `None`, the binding is missing, or the action has `Rebindable = false`.

#### `InputService.ResetBinding(contextName: string, actionName: string, device: ("Keyboard" | "Gamepad")?) -> boolean`
- Removes the action's overrides for one device, or for all devices when `device` is nil. Then it re-applies the bindings and queues a save.
- Returns false if rebinding is off or keybinds haven't loaded. Otherwise returns true, even if nothing was removed.

#### `InputService.ResetAllBindings() -> boolean`
- Clears every override, re-applies and queues a save. Returns false if rebinding is off or keybinds haven't loaded.

#### `InputService.GetKeybinds() -> { [string]: string }`
- Returns a copy of the current overrides (`"Context/Action/Device/Property" = "KeyCodeName"`).

#### `InputService.IsLoaded() -> boolean`
- Returns whether the saved keybinds have arrived. It stays false when rebinding is off.

#### `InputService.FlushSave() -> ()`
- If a save is waiting, sends it now. Otherwise does nothing. Call it when a rebind menu closes.

#### `InputService.ApplyKeybinds(saved: { [string]: string }?) -> ()`
- Called by InputController when the saved copy arrives or changes. Usually you don't call it yourself.
- Ignored when `saved` is nil or rebinding is off. After the first load, it is also ignored while a local save is waiting, or while a different copy arrives within 10 s of the last save (to wait for its echo).
- Drops entries that fail `CanBind` or now conflict with another action. If it dropped anything, it saves the cleaned set.

#### `InputService.CaptureKey(callback: (keyCode: Enum.KeyCode?) -> ()) -> () -> ()`
- Waits for the next key, mouse button or gamepad button, then calls `callback(keyCode)`. Escape calls `callback(nil)`. Mouse clicks on UI (`gameProcessed`) are ignored.
- Cancels any capture already running. Disables all contexts (reason `Rebinding<n>`) while waiting, and turns them back on only after the captured key is released.
- Returns a cancel function, which stops without calling back.

#### `InputService.CancelCapture() -> ()`
- Cancels the current capture without calling back. Does nothing if no capture is running.

#### `InputService.IsCapturing() -> boolean`
- Returns whether a capture is running.

### InputUtil (Shared)
Get it from `require(ReplicatedStorage.SharedUtilities).InputUtil`. Fields: `InputUtil.RebindProperties` (set of property names players may change) and `InputUtil.MaxKeybinds = 200`.

#### `InputUtil.GetDevice(keyCode: Enum.KeyCode) -> "Keyboard" | "Gamepad"`
- Returns `"Gamepad"` for names starting with `Button`, `DPad` or `Thumbstick`. Everything else, including mouse buttons, is `"Keyboard"`.

#### `InputUtil.GetBindingDevice(binding: { [string]: any }) -> ("Keyboard" | "Gamepad")?`
- Returns the device of the first KeyCode found in `KeyCode` / `Up` / `Down` / `Left` / `Right` / `Forward` / `Backward`, or nil (e.g. touch bindings).

#### `InputUtil.MakeKey(contextName: string, actionName: string, device: Device, property: string) -> string`
- Returns `"Context/Action/Device/Property"`.

#### `InputUtil.ParseKey(key: string) -> (string?, string?, string?, string?)`
- Splits a key into its four parts. Returns all nil unless there are exactly four non-empty parts.

#### `InputUtil.GetRebindableAction(contextName: string, actionName: string) -> any?`
- Returns the action's config table, or nil if it's missing or has `Rebindable = false`.

#### `InputUtil.GetFirstBinding(action: any, device: string) -> ({ [string]: any }?, number?)`
- Returns the first config binding for that device and its index, or nil, nil.

#### `InputUtil.CanBind(key: string, keyCodeName: string) -> (boolean, string?)`
- Checks whether an override may be saved. The server uses it to filter every entry.
- Failure reasons, checked in this order:
  - `"Disabled"`: `AllowRebinding` is off
  - `"Invalid"`: a value isn't a string, the key is over 120 characters, or the key is badly formed
  - `"NotRebindable"`: the action is missing or has `Rebindable = false`
  - `"Invalid"`: the property isn't in `RebindProperties`
  - `"NoBinding"`: the action has no config binding for that device
  - `"Reserved"`: not a KeyCode name, or a reserved key
  - `"WrongDevice"`: the key's device doesn't match
- Reserved keys are `Escape`, `Unknown`, `None`, `Mouse.UnlockKey` and everything in `ReservedKeys`.

#### `InputUtil.GetDefault(contextName: string, actionName: string, device: string, property: string) -> Enum.KeyCode?`
- Returns the config's value for that slot (what a reset goes back to), or nil.

#### `InputUtil.IsValidName(name: string) -> boolean`
- Returns false if the name contains `/`. Such contexts and actions can't be rebound, and Build warns about them.

### InputController / InputSystem / Device / Mouse
- Each one only has `Init`, which the loaders or InputController call. There is no other public API.

## Data and network
- `PlayerData.Keybinds` (saved, `{ [string]: string }`): only exists in the template when `AllowRebinding` is on. The server replaces the whole table with `SetValue({"PlayerData","Keybinds"}, clean)`, so it doesn't need to be in `DeepSyncFields`.
- `ClientData.PlayerData.Keybinds`: synced copy, nil until data loads.
- `ClientData.Input.Device` (`"Keyboard" | "Touch" | "Gamepad"`), `MouseUnlocked`, `MouseIcon`: client-only atoms, not synced.
- `SaveKeybinds`: Client to Server, reliable, payload `map { [string]: string }` (the full override set). The server ignores it when `AllowRebinding` is off or the payload isn't a table. It saves at most once per second per player (the latest payload wins), keeps up to 200 valid entries (and checks at most 400), and saves a waiting change on `Profile.Removing`.

## Gotchas
- `Contexts` is empty by default. Until you add contexts, every lookup warns once and returns nil or a no-op function.
- Overrides only apply to an action's **first** binding per device. Other bindings keep their config keys.
- Rebinding calls return `"NotLoaded"` / false until `PlayerData.Keybinds` arrives. Check `IsLoaded()` before showing a rebind menu.
- Contexts with `DisabledInMenus` are off whenever `ClientData.Gui.OpenMenu` is set. Opening or closing a menu also cancels any running `CaptureKey`.
- `CaptureKey` only skips UI clicks for mouse buttons. Keyboard keys are captured even when `gameProcessed` is true.
- `Mouse.UnlockKey` needs the Gui feature's `Hud` ScreenGui. It waits up to 5 s, then warns and resets `MouseUnlocked` to false. Switching to a non-keyboard device also resets `MouseUnlocked`.
- `Mouse.HideCursorInGameplay` sets `MouseIconEnabled = OpenMenu() ~= nil or MouseUnlocked()`, and applies it again after respawn.
- Binding properties that fail to set during Build only warn. An unknown action `Type` skips the action.
