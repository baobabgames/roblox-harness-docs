# Input Guide

Follow this whenever a feature needs player input (keys, gamepad, touch). `CODE_GUIDE.md` and `PROJECT_GUIDE.md` still apply.

**Stack:** Roblox's **Input Action System** (`InputContext` → `InputAction` → `InputBinding`), built in code from a config.

**Every input works on PC and mobile, always.** Each action gets, without being asked:
- **PC:** a keyboard / mouse binding.
- **Mobile:** a touch control (section 5): an on-screen button, or a tap / drag when the action is aimed at the screen.
- **Console:** only when the user asks (for the game or one feature). Then every action also gets a gamepad binding, and menus work with a gamepad (section 5b).

Leave mobile out **only** when the user says so ("PC only"), and note it in the action's config (`-- No touch: user asked`). A device-specific action (keyboard-only debug key, mouse `UnlockKey`) is the only other exception. Pick touch layouts (and gamepad buttons) yourself; don't ask unless the user wants a say.

---

## 1. How it works

```
SharedConfigs.Inputs  ──InputService.Init()──▶  PlayerScripts.InputContexts/<Context>/<Action>/<Binding>
                                Controllers ◀── InputService.OnPressed / OnReleased / OnChanged
```

- **Config:** `src/Core/Shared/SharedConfigs/Inputs.luau` defines every context, action and binding. The template ships with **none**.
- **Built once:** `InputController` (`src/Features/Inputs/Client/`) builds them into a Folder `InputContexts` under PlayerScripts. Other require paths redirect to the one InputService copy, so its state (keybinds, disable reasons) exists once.
- **Listening:** features never read keys. They listen to **actions** through `InputService`. Always require it the same way:
  ```lua
  local InputService = require(StarterPlayer.StarterPlayerScripts.Features.Inputs.InputService)
  ```

## 2. Add an action

Add it to `SharedConfigs.Inputs.Contexts`. Each binding is a table of `InputBinding` properties.

```lua
Contexts = {
	Gameplay = {
		Priority = 0,            -- higher wins when two contexts use the same key
		Sink = false,            -- true = lower-priority contexts don't get the key
		DisabledInMenus = true,  -- off while a Menu is open
		Actions = {
			Sprint = { Type = "Bool", Bindings = {      -- key plus gamepad button
				{ KeyCode = Enum.KeyCode.LeftShift }, { KeyCode = Enum.KeyCode.ButtonL3 } } },
			Move = { Type = "Direction2D", Bindings = { -- WASD plus thumbstick
				{ Up = Enum.KeyCode.W, Down = Enum.KeyCode.S, Left = Enum.KeyCode.A, Right = Enum.KeyCode.D },
				{ KeyCode = Enum.KeyCode.Thumbstick1 } } },
			QuickSave = { Type = "Bool", Bindings = {   -- modifier combo: Ctrl + S
				{ KeyCode = Enum.KeyCode.S, PrimaryModifier = Enum.KeyCode.LeftControl } } },
		},
	},
},
```

- `Type`: `"Bool"` (default), `"Direction1D"`, `"Direction2D"`, `"Direction3D"`, `"ViewportPosition"`.
- A typo in a binding property only warns; the rest still builds. A wrong context or action name in `OnPressed` warns once and does nothing.

## 3. Listen from a Controller

```lua
local janitor = Janitor.new()
function Shared.Init()
	janitor:Add(InputService.OnPressed("Gameplay", "Sprint", function() ClientNetwork.Sprint.Fire(true) end))
	janitor:Add(InputService.OnReleased("Gameplay", "Sprint", function() ClientNetwork.Sprint.Fire(false) end))
	janitor:Add(InputService.OnChanged("Gameplay", "Move", function(direction: Vector2) end))
end
```

- **Cleanup:** every `On...` returns a disconnect function; put it on a Janitor.
- **Reading a value:** `InputService.GetState("Gameplay", "Sprint")` reads it without listening.
- **Opening a menu from a key:** toggle `ClientData.Gui.OpenMenu`:
  ```lua
  InputService.OnReleased("UI", "Settings", function()
  	OpenMenu(if OpenMenu() == "SettingsMenu" then nil else "SettingsMenu")
  end)
  ```

## 4. Contexts

- Group actions by situation: `Gameplay`, `UI`, `Vehicle`, `Building`.
- **`DisabledInMenus = true`**: the context is off while any Menu is open (automatic).
- **Turning a context off yourself** (e.g. a cutscene) takes a reason:
  ```lua
  InputService.SetContextEnabled("Gameplay", false, "Cutscene")
  InputService.SetContextEnabled("Gameplay", true, "Cutscene")  -- later
  ```
  A context is enabled again only once **every** reason that disabled it has re-enabled it, so closing a menu can't switch gameplay back on mid-cutscene.
- `Priority` and `Sink` decide which context gets a shared key. E.g. `UI` at priority 10 with `Sink = true` blocks `Gameplay` from the same key.

## 5. Mobile (touch buttons)

Every action gets a touch control by default. Make the button in a Hud module, then bind it:

```lua
local removeBinding = InputService.AddTouchButton("Gameplay", "Sprint", sprintButton)
cleanup(removeBinding)  -- Vide: removed with the component
```

- The button fires the action's `Pressed`, `Released` and `StateChanged`, like a key.
- Only show touch buttons when `ClientData.Input.Device() == "Touch"`.
- **Layout:** action buttons in the bottom-right thumb area, above and around Roblox's jump button, never on the top-bar buttons. Overlapping Roblox's thumbstick or jump button is fine unless it makes a button unusable (mostly under it; `UI_GUIDE.md` 4c). Main action biggest; rare ones smaller or in a menu. Sizes in Scale with a `UIAspectRatioConstraint`, thumb-sized (about 10–14% of screen height for the main action), inside the safe area.
- **Icons, not key letters:** a touch button shows an icon (or a short word), never "Shift" or "E".
- **Hold actions** (sprint, charge, block) use the button's `Pressed` / `Released`, like the key. **Toggle** actions can use one tap.
- **Aimed at the screen** (place, shoot where you tap, select a unit): use a `ViewportPosition` action or a tap on the world, and make sure the tap doesn't also trigger the camera or Hud.
- **Too many actions:** group the rare ones behind one button or menu; don't drop them from mobile.

## 5b. Console (gamepad, only when asked)

Only when the user asks. Then every action gets a gamepad binding. Roblox already uses ButtonA (jump), the thumbsticks (move, camera) and ButtonStart / ButtonSelect (menus).

| Action kind | Button |
|---|---|
| Main action (attack, use, collect) | `ButtonR2` or `ButtonX` |
| Secondary / aim / block | `ButtonL2` |
| Interact / confirm | `ButtonX` (ProximityPrompts use it) |
| Sprint / dash | `ButtonL3` or `ButtonB` |
| Abilities | `ButtonR1`, `ButtonL1`, `ButtonY` |
| Open a menu (inventory, shop) | `DPadUp` / `DPadLeft` / `DPadRight` / `DPadDown` |
| Back / close menu | `ButtonB` |

- **Menus:** buttons are `Selectable`; a menu sets `GuiService.SelectedObject` to its first button on open (clears it on close); `ButtonB` closes it. The selection highlight follows the theme.
- Never bind a gamepad action to a key in `SharedConfigs.Inputs.ReservedKeys`.

## 6. Device-aware UI

`ClientData.Input.Device` is `"Keyboard"`, `"Touch"` or `"Gamepad"` and follows what the player last used.

```lua
local device = useAtom(ClientData.Input.Device)
create "TextLabel" {
	Text = function() return if device() == "Gamepad" then "Press L3 to sprint" else "Press Shift to sprint" end,
	Visible = function() return device() ~= "Touch" end,
}
```

## 7. Player rebinding

Players can change keys. Changes are saved in `PlayerData.Keybinds` and re-applied on join. (No Settings menu ships; these are the functions a menu would call.)

**Off by default.** Set `AllowRebinding = true` in `SharedConfigs.Inputs`, only if the game has a keybind menu.
- **While off:** no `Keybinds` field in player data, nothing synced or saved, the server ignores keybind saves, and the functions below return `"Disabled"` (or `false`).
- **Turned off later:** saves that already have `Keybinds` keep it, unused.

```lua
local ok, reason, conflict = InputService.SetBinding("Gameplay", "Sprint", Enum.KeyCode.C) -- device comes from the key
InputService.SetBinding("Gameplay", "Move", Enum.KeyCode.Up, "Up")                         -- directional slot
InputService.SetBinding("Gameplay", "QuickSave", Enum.KeyCode.RightControl, "PrimaryModifier")
InputService.GetBinding("Gameplay", "Sprint", "Keyboard")  --> Enum.KeyCode.C (to show the key)
InputService.ResetBinding("Gameplay", "Sprint")            -- one action (or pass "Gamepad" for one device)
InputService.ResetAllBindings()
InputService.CaptureKey(function(keyCode) ... end)         -- waits for next key; Escape cancels; UI clicks ignored
InputService.CancelCapture()  -- when the rebind menu closes (also automatic whenever the open menu changes)
InputService.FlushSave()      -- save now instead of 1s later
```

- **What changes:** the action's **first** binding for that device (config order).
- **Failure reasons:**
  - `"NotLoaded"`: saved keybinds haven't arrived yet (a change can't overwrite them). `IsLoaded()` tells a menu when to enable its buttons.
  - `"NotRebindable"`: `Rebindable = false`, or the action doesn't exist.
  - `"NoBinding"`: no binding for that device.
  - `"Reserved"`: Escape, the mouse `UnlockKey`, or a key in `SharedConfigs.Inputs.ReservedKeys` (Roblox's own keys: ButtonStart, Slash, Tab, F9, ...; plus default character controls: WASD, Space, ButtonA, sticks, right mouse). Remove the controls from the list if your game replaces them.
  - `"WrongDevice"`: e.g. a gamepad button in a keyboard slot.
  - `"Conflict"` plus the action already using the key in the same context. Rebind or reset that one first.
- **Setting a key back to its config default is always allowed,** even if reserved (e.g. WASD for Move).
- **Locking an action:** `Rebindable = false` in its config (menu or system keys).
- **Saving:** a change applies instantly, then the whole set is sent after 1 second without changes. The server (`Inputs/Server/InputSystem`) checks every entry with `SharedUtilities.InputUtil.CanBind` and drops invalid ones, so a modified client can only save valid binds. A pending change is saved with the player's data on leave. On high ping the client ignores late copies of older saves.
- **Stored format:** `PlayerData.Keybinds["Gameplay/Sprint/Keyboard/KeyCode"] = "C"`; only changes from the config are stored. Client copy: `ClientData.PlayerData.Keybinds` (nil until data loads).
- **Changing the config later:**
  - Saved entries the config no longer allows (renamed actions or contexts, newly reserved keys) are dropped on join, as are saved keys that now clash with another action's new default (the action returns to its config keys and the cleanup is saved).
  - **Add new bindings at the end of an action's list, never before existing ones.** Saved changes apply to the first binding per device.
  - Context and action names must not contain `/` (keybind separator). InputService warns if they do.

## 8. Cursor image

`InputService.SetMouseIcon("rbxassetid://1234567890")` sets a custom cursor; `SetMouseIcon(nil)` restores Roblox's default.

- Stored in `ClientData.Input.MouseIcon` and applied by the Inputs feature. UI can `useAtom` it; setting the atom directly works too.
- `GetMouseIcon()` returns the custom icon, or nil.
- It only shows while the cursor is visible (see section 9).

## 9. Mouse helpers (off by default)

Configured in `SharedConfigs.Inputs.Mouse`. Turn on for first-person or locked-camera games.

| Setting | Default | Does |
|---|---|---|
| `HideCursorInGameplay` | `false` | Hides the cursor, except while a Menu is open or the cursor is unlocked. Re-applied on respawn. |
| `UnlockKey` | `nil` | That key (e.g. `Enum.KeyCode.LeftAlt`) frees or locks the cursor so the player can click the Hud in first person. Keyboard only. Uses an invisible Modal button inside the `Hud` ScreenGui. |

`ClientData.Input.MouseUnlocked` tells UI whether the cursor is free (e.g. to show "Alt to unlock").

## 10. Rules and checklist

- [ ] Every input is an **action in `SharedConfigs.Inputs`**. No raw `UserInputService` key checks.
- [ ] Each action has a keyboard / mouse binding **and** a touch control (button or tap), unless the user excluded mobile (commented in the config).
- [ ] Touch buttons sit in the thumb area, inside the safe area, show icons, and only show on `"Touch"`.
- [ ] Console asked for: every action also has a gamepad binding, and menus work with a gamepad (`Selectable`, `GuiService.SelectedObject`, `ButtonB` closes).
- [ ] Gameplay actions sent to the server go through **that feature's remote**, and the server validates them (cooldowns, ownership, state). Input never decides anything on its own.
- [ ] Every `On...` listener and `AddTouchButton` is cleaned up (Janitor or Vide `cleanup`).
- [ ] Contexts that must not run in menus have `DisabledInMenus = true`. Cutscenes and other blockers use `SetContextEnabled(..., reason)`.
- [ ] UI prompts follow `ClientData.Input.Device` and show the current key with `GetBinding` (players may have rebound it).
- [ ] Actions players must not change (menu or system keys) have `Rebindable = false`.
