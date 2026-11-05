# Gui

Client-only UI root. Mounts exactly two Vide ScreenGuis (`Hud` and `Menu`) into PlayerGui and auto-loads every module under `Hud/` and `Menu/` into them. Menus are one-at-a-time, driven by `ClientData.Gui.OpenMenu`.

How to write UI (Vide, Charm, Ripple, style rules, checklist): see [UI_GUIDE](../.claude/guides/UI_GUIDE.md). This doc only covers how the feature is wired.

## Files
- [`GuiController.luau`](../src/Features/Gui/Client/GuiController.luau): `Init` mounts the Hud and Menu roots, removes the in-game copy of old Studio UI previews, and shows server `Notify` messages as toasts (Client)
- [`Hud/init.luau`](../src/Features/Gui/Client/Hud/init.luau): builds the `Hud` ScreenGui from its child modules (Client)
- [`Menu/init.luau`](../src/Features/Gui/Client/Menu/init.luau): builds the `Menu` ScreenGui, gives each menu `IsOpen` / `Close` (Client)
- [`Hooks/useSpring.luau`](../src/Features/Gui/Client/Hooks/useSpring.luau): Ripple spring bridged into a Vide source (Client)
- [`Components/HoverButton.luau`](../src/Features/Gui/Client/Components/HoverButton.luau): ImageButton that scales up on hover / selection, with hover and click sounds (Client)
- [`Components/Button.luau`](../src/Features/Gui/Client/Components/Button.luau): the standard 3-layer button (edge, face, shine; press moves the face), or the style's 9-slice face (Client)
- [`Components/Window.luau`](../src/Features/Gui/Client/Components/Window.luau): the standard menu window (shadow, textured header, title icon, X, Body), or the style's panel and header art (Client)
- [`Components/ItemViewport.luau`](../src/Features/Gui/Client/Components/ItemViewport.luau): a model from `ReplicatedStorage.Assets` as a 3D icon (Client)
- [`Components/CurrencyChip.luau`](../src/Features/Gui/Client/Components/CurrencyChip.luau): HUD / menu currency pill: icon, abbreviated amount, optional plus button (Client)
- [`Components/PriceButton.luau`](../src/Features/Gui/Client/Components/PriceButton.luau): buy button with price, can't-afford shake and Owned state (Client)
- [`Components/ItemCard.luau`](../src/Features/Gui/Client/Components/ItemCard.luau): grid item card with rarity pips, badge and Selected / Locked / Equipped states, or the style's card art (Client)
- [`Components/Tabs.luau`](../src/Features/Gui/Client/Components/Tabs.luau): horizontal / vertical tab strip with a hero selected tab and badge dots (Client)
- [`Components/SliceImage.luau`](../src/Features/Gui/Client/Components/SliceImage.luau): one 9-slice piece of the style's art, or a plain rounded fallback (Client)
- [`Components/Stage.luau`](../src/Features/Gui/Client/Components/Stage.luau): a Figma frame in design px, scaled to fit its parent (Client)
- [`Components/ProgressBar.luau`](../src/Features/Gui/Client/Components/ProgressBar.luau): a track and fill that eases to a 0 to 1 value, with an optional label (Client)
- [`Components/Toast.luau`](../src/Features/Gui/Client/Components/Toast.luau): one message in a panel with a kind strip (Client)
- [`Hud/Toasts.luau`](../src/Features/Gui/Client/Hud/Toasts.luau): the toast stack, top center of the Hud, drawn from `ClientData.Gui.Toasts` (Client)
- [`ToastService.luau`](../src/Features/Gui/Client/ToastService.luau): `Show(text, kind?)`: adds a toast and removes it after `Feel.ToastSeconds` (Client)
- Settings for these components: `SharedConfigs.Gui` ([`Gui.luau`](../src/Core/Shared/SharedConfigs/Gui.luau)). Colors, font, corners and stroke come from the theme.
- `Hud` has one child module, `Toasts`. `Menu` has none.

Rojo: `src/Features/Gui/Client` maps to `StarterPlayerScripts.Features.Gui`.

## How it connects
- **Uses:** `Packages.Vide`, `Packages.Loader` (`LoadChildren`), `Packages.VideCharm` (`useAtom`), `Packages.Ripple`, `ClientData.Gui.OpenMenu`, `SoundsService.PlaySound`, `SharedUtilities.ThemeUtil` (component looks, 9-slice art, sounds, Stage fit), `SharedConfigs.Gui` (component settings) and `ReplicatedStorage.Assets` (ItemViewport models), `ClientUtilities.RewardFlyUtil` (CurrencyChip's `FlyTarget`), `ClientNetwork.Notify` (GuiController), `SharedConfigs.Feel` (toast time and count), `ClientData.Gui.Toasts`
- **Used by:**
  - `MonetizationController`: rains confetti into the `Hud` ScreenGui on `ConfettiNotification`
  - `InputController`: disables input contexts while `OpenMenu` is non-nil
  - Server code (`ServerNetwork.Notify.Fire(player, kind, text)`, e.g. GiftService): `GuiController` shows it through `ToastService`
  - `RewardFlyUtil.Fly`: flies into the `CurrencyChip` registered under its `FlyTarget` name
  - `InputController/Mouse`: shows the cursor while a menu is open; parents a hidden `MouseUnlockModal` TextButton into `Hud` (waits for it with a timeout)
- **Starts:** `GuiController.Init` connects the `Notify` listener (`ClientNetwork.Notify.On` → `ToastService.Show`), then calls `Vide.mount(function() return { Hud(), Menu() } end, PlayerGui)`

## Public API
### `GuiController.Init() -> ()`
- Mounts both roots into `LocalPlayer.PlayerGui`. **Yields** on `WaitForChild("PlayerGui")`.
- Destroys `PlayerGui.UIPreviews` (the copy Roblox makes of a `StarterGui.UIPreviews` ScreenGui, the old Studio-only mockups; UI is now tested as UI Labs stories), now and after every respawn (`PlayerGui.ChildAdded`).
- Called by the client loader. The only place UI is mounted.

### `Hud() -> ScreenGui` (Hud/init)
- Creates ScreenGui `Hud`: `ResetOnSpawn = false`, `DisplayOrder = 0`, `ZIndexBehavior = Sibling`.
- Calls every child module (no args) and parents the returned GuiObjects into it.

### `Menu() -> ScreenGui` (Menu/init)
- Creates ScreenGui `Menu`: `ResetOnSpawn = false`, `DisplayOrder = 10`, `ZIndexBehavior = Sibling`.
- Calls every child module with `MenuProps` and parents the results into it:
  ```lua
  type MenuProps = {
  	IsOpen: () -> boolean, -- derived: OpenMenu == this module's name
  	Close: () -> (),       -- sets OpenMenu(nil) only if this menu is still the open one
  }
  ```

### `useSpring<T>(initial: T, options: Ripple.SpringOptions<T>?) -> (() -> T, Ripple.Spring<T>)`
- Creates a Vide `source(initial)` and a Ripple spring, wires `spring:onChange` into the source, and starts the spring.
- `options`: optional Ripple spring options (e.g. `Ripple.config.stiff`).
- Returns the source (bind it to properties) and the spring (call `:setGoal`).
- Registers a Vide `cleanup` that disconnects and destroys the spring, so it must be called inside a Vide scope (a component).

```lua
local useSpring = require(script.Parent.Parent.Hooks.useSpring)
local scale, scaleSpring = useSpring(1, Ripple.config.stiff)
scaleSpring:setGoal(1.1)
```

### `HoverButton(props, hoverProps: HoverProps?) -> ImageButton` (Components/HoverButton)
- Creates `ImageButton(props)` with a `UIScale` child that springs to `hoverProps.UIScale` (default: the theme's `HoverScale`) on hover and back to `1` on leave, using the theme's `Spring`. It scales from the button's own `Size`, so no enlarged sizes are needed.
- `hoverProps.Theme`: a style name from `SharedConfigs.Themes.Styles`; nil uses the active theme (`ThemeUtil.Get`).
- Hover starts on `MouseEnter` or `SelectionGained` (gamepad), and ends on `MouseLeave`, `SelectionLost`, or a touch ending (`InputEnded`, since `MouseLeave` doesn't always fire on touch).
- The caller's own handlers in `props` for those events, and `hoverProps.MouseEnter` / `MouseLeave`, still run alongside the animation.
- Sounds: `hoverProps.HoverEnterSound` / `ClickSound` (a name or a list of names picked at random), defaulting to the theme's `Sounds.Hover` / `Sounds.Click`. Defaults that aren't in `SoundService` are skipped silently; a sound the caller passes still warns if missing. Sounds play without yielding, so the animation and click handler never wait for a sound to load.
- The click sound rides on the first click event wired in `props` (`Activated`, then `MouseButton1Click`, then `MouseButton1Up`), so it plays once. With none wired, it plays on `MouseButton1Up`.
- `hoverProps.HoverType` picks the animation from `HoverTypes` in the module (`"Default"`: grow and shrink back). Add entries there for new hover feels.
- Must be called inside a Vide scope (a component), because the spring uses `useSpring`.

```lua
local HoverButton = require(script.Parent.Parent.Components.HoverButton)

HoverButton({
	Size = UDim2.fromScale(0.1, 0.1),
	Image = "rbxassetid://...",
	Activated = function()
		ClientData.Gui.OpenMenu("ShopMenu")
	end,
}, { UIScale = 1.15 })
```

### Components carry the look
`Window`, `Button` and `ItemViewport` hold the game's look (from the theme and `SharedConfigs.Gui`). Screens only arrange them and pass data; they never set their own colors or strokes, so a restyle (the Looks stage's UI focus) only touches the components. All must be called inside a Vide scope (a component). Style art comes through `Themes.Slices` slots: `Window` (`PanelSlice`, `HeaderSlice`), `Button` (`Slice`) and `ItemCard` (`Slice`) use their default slots (Panel, Header, Button, Card) when the style has art there; any other slot is drawn with `SliceImage`.

### `Window(props: WindowProps) -> Frame` (Components/Window)
```lua
type WindowProps = {
	Title: string | () -> string,
	TitleIcon: GuiObject?,     -- an ItemViewport or ImageLabel, overlapping the header's top-left corner
	Close: (() -> ())?,        -- shows the X (overlapping the top-right corner); menus pass props.Close
	Size: UDim2?,              -- default 0.6 × 0.7 of the screen
	Position: UDim2?,          -- default centered
	AnchorPoint: Vector2?,     -- default 0.5, 0.5
	Visible: (boolean | () -> boolean)?,
	Name: string?,
	Theme: string?,
	PanelSlice: string?,       -- Slices slot drawn as the panel (default "Panel")
	HeaderSlice: string?,      -- Slices slot drawn as the header (default "Header")
	[number]: Instance,        -- children, parented into Body
}
```
- A `Shadow` frame (theme `Dark`) sits `ShadowDepth` below a `Panel` (`Panel`, stroke). The `Header` (`HeaderHeight` of the window) has a `HeaderBand` → `Header` gradient, a `HeaderStroke` outline and the `Title` (theme `BoldFont`, `HeaderStroke` text stroke).
- The X is a `Button` in the theme's `Negative` color with an "X" text label (in every look; no cross drawn from frames).
- Children go in `Body` (theme `Body`, padding), below the header.
- With art in the `PanelSlice` / `HeaderSlice` slots, a 9-slice image replaces the drawn panel (with its shadow, body fill and outline) and the header (with its gradient and outline), tinted `Panel` / `Header` when the art is Tint. Empty slots keep the drawn look.

```lua
return function(props: MenuProps)
	return Window({
		Title = "Shop",
		TitleIcon = ItemViewport({ Kind = "Icon", Id = "Shop" }),
		Close = props.Close,
		Visible = props.IsOpen,
		ItemGrid(),
	})
end
```

### `Button(props: ButtonProps) -> ImageButton` (Components/Button)
```lua
type ButtonProps = {
	Text: (string | () -> string)?,
	Icon: GuiObject?,                     -- left of the text, or alone; never letters or emoji
	Color: (Color3 | () -> Color3)?,      -- a theme color; default theme Primary
	Disabled: (boolean | () -> boolean)?, -- theme Disabled color, clicks ignored
	Activated: (() -> ())?,
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?,
	Theme: string?,
	Slice: string?,                       -- Slices slot drawn as the face (default "Button")
}
```
- Layers: `Edge` (the face color darkened toward `Dark` by `EdgeDarken`, stroke), `Face` (`1 - EdgeDepth` tall, a gradient `FaceLighten` toward white at the top), `Shine` (a soft white strip), `Content` (icon and label, theme `BoldFont`, stroked text).
- Pressing (mouse or touch) springs the face down onto the edge (drawn look); hover scale and sounds come from `HoverButton`.
- With art in the `Slice` slot, the face is that 9-slice image (its lip is in the art), tinted with the face color when Tint. No Edge, gradient or Shine layers, and the face doesn't move on press. `Content` sits on top.

### `ItemViewport(props: ItemViewportProps) -> GuiObject` (Components/ItemViewport)
```lua
type ItemViewportProps = {
	Kind: string,          -- an entry of SharedConfigs.Gui.ItemViewport.Folders
	Id: string,            -- the model's name in that folder
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Yaw: number?,          -- extra turn in degrees
	FallbackColor: Color3?, -- the shape's color when the model is missing; default theme Accent
	Theme: string?,
}
```
- Finds `ReplicatedStorage.Assets.<Folders[Kind]...>.<Id>` (a Model or BasePart), clones it with its scripts removed and its pivot at the origin, and renders it in a `ViewportFrame` (FOV `FieldOfView`, camera at the bounding box's largest extent × `DistanceScale`, from `ViewDirection` in the model's pivot space: a 3/4 front view). The framing is cached per model.
- Missing model (or an unknown Kind, which warns): a colored circle, never letters.
- Props are read once. To show another item, make a new one (e.g. inside `switch` / `show`).
- Add kinds in config: `Folders.Pets = { "Pets" }` reads `ReplicatedStorage.Assets.Pets.<Id>`. Generated icon models go in `Assets.UI.Icons` (Kind `Icon`).

### Plain look (`theme.Plain`)
UI is Plain by default (`DefaultTheme`); named styles set `Plain = false` and keep the looks above. In Plain every component draws flat boxes with a thin `Stroke` outline, text instead of icons (unused `Icon` / `TitleIcon` / `BadgeIcon` instances are destroyed), and no gradients, lips, shines, shadows, pop-ins, staggers, shakes or flashes. Color means something: Positive (buy), Negative (can't afford, close), rarity colors. Style art is off in Plain (`ThemeUtil.GetSlice` gives nil, so `Slice` / `PanelSlice` / `HeaderSlice` do nothing); `SliceImage` still draws its plain fallback Frame.
- `HoverButton`: unchanged; the theme's `HoverScale` 1 / `PressScale` give the press shrink and sound.
- `Button`: one flat face (`Color` or Primary), outlined, label text only; an icon is drawn only when there is no text.
- `Window`: no shadow, flat `Header`, title in BoldFont at `TextSizes.Title`, no title icon, a flat Negative close button inside the header's right end.
- `ItemCard`: flat Surface with a rarity-colored outline, rarity name as text, the name in a darker box (no icon or pips), Badge / "Equipped" / "Locked" as text; Selected is a 3 px Accent outline with no scale; `Index` is ignored.
- `CurrencyChip`: flat box with `<Label> <amount>` (just the amount without `Label`), no pop; `OnAdd` is a flat Positive square with a "+".
- `Tabs`: all tabs the same size, selected = Primary face with a 2 px Accent outline, others Secondary; badge is a flat Negative box; no icons.
- `ProgressBar`: flat outlined track and fill, square corners, label as text. The fill still eases to its value.
- `Toast`: flat outlined panel with the kind strip, text in `Font`, no pop-in.
- `PriceButton`: "Buy 300" text (`PriceButton.PlainBuyText`), no icon, can't afford = Negative face plus "Need N more", no shake or flash; Owned = Disabled "Owned".

### `CurrencyChip(props: CurrencyChipProps) -> Frame` (Components/CurrencyChip)
```lua
type CurrencyChipProps = {
	FlyTarget: string?,               -- rewards with this name fly into this chip (RewardFlyUtil)
	Icon: GuiObject?,                 -- ItemViewport or ImageLabel, never letters or emoji (Plain: not shown)
	Label: string?,                   -- Plain mode: the currency name before the amount ("Coins 1.2K")
	Amount: number | () -> number,    -- shown abbreviated (1.2K) in the theme's DisplayFont
	OnAdd: (() -> ())?,               -- shows a drawn plus button on the right
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
}
```
- A pill (`Radius.Pill`) with a darker bottom lip (`Depth`), the icon overlapping its left edge, a stroked amount, and an optional plus. Default size `0.24 x 0.14` scale (about 46 px tall at phone size); the pill keeps a 3.4:1 shape inside it.
- Pops (`CurrencyChip.PopScale`, `Motion.Press` spring) when the amount changes; no pop under `ThemeUtil.ReducedMotion()`.
- `FlyTarget`: on mount the chip's root is registered with `RewardFlyUtil.SetTarget`, and cleared on destroy (only if it's still this chip). Works in Plain too. A chip mounted later with the same name takes over the target.

### `PriceButton(props: PriceButtonProps) -> Frame` (Components/PriceButton)
```lua
type PriceButtonProps = {
	Price: number | () -> number,
	Balance: number | () -> number,   -- a number, a source or a useAtom of the player's currency
	OnBuy: (() -> ())?,               -- tap while Balance >= Price
	OnCantAfford: (() -> ())?,        -- tap while Balance < Price (open the shop, show a hint)
	Icon: GuiObject?,                 -- the currency icon beside the price
	Owned: (boolean | () -> boolean)?,
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
}
```
- States: affordable = Positive `Button` with the abbreviated price; can't afford = Negative face, a quick lighter flash and a shake (no shake under Reduce Motion), `OnCantAfford` instead of `OnBuy`; `Owned` = Disabled "Owned" (`PriceButton.OwnedText`), taps ignored.
- The wrapper `Frame` takes the layout props; the `Button` inside shakes.

### `ItemCard(props: ItemCardProps) -> ImageButton` (Components/ItemCard)
```lua
type ItemCardProps = {
	Title: string | () -> string,
	Rarity: (string | () -> string)?,       -- a name in theme.RarityOrder
	Icon: GuiObject,
	Badge: (number | string | () -> number | string)?, BadgeIcon: GuiObject?,   -- corner price / amount
	Selected: (boolean | () -> boolean)?, Locked: ..., Equipped: ...,
	OnSelect: (() -> ())?,
	Index: number?,                          -- grid position: pops in after Index * Motion.Stagger
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
	Slice: string?,  -- Slices slot drawn as the card (default "Card")
}
```
- Rarity shows as the frame color (stroke and lip) and as pips (filled up to the rank from `ThemeUtil.GetRarity`), so it never relies on color alone.
- `Selected`: a thick Accent ring and a slight scale (`ItemCard.SelectedScale`). `Locked`: a Dark overlay with a lock drawn from frames; a locked card can still be selected. `Equipped`: a Positive circle with a drawn check.
- With art in the `Slice` slot (default `Card`), a 9-slice image replaces the drawn card, tinted with the rarity color when Tint (rarity then shows by pips and tint only; no lip, stroke or gradient). Otherwise `Radius.Medium` + stroke + lip + top-lit gradient. Always square (`UIAspectRatioConstraint`); put it in a grid cell at least 44 px wide at phone size. Everything is visible without hover; a tap selects.

### `Tabs(props: TabsProps) -> Frame` (Components/Tabs)
```lua
type TabsProps = {
	Tabs: { { Id: string, Text: string, Icon: GuiObject?, Badge: (number | () -> number)? } },  -- read once
	Selected: () -> string,
	OnSelect: (id: string) -> (),
	Direction: ("Horizontal" | "Vertical")?,
	Size: UDim2?, Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
}
```
- Each tab is a `Button`: the selected one is Primary and springs to full size across the strip, the others are Secondary and `Tabs.RecessedSize` as big (horizontal tabs sit on the strip's bottom edge, vertical ones on its left edge). Give the strip at least about 53 px across at phone size so recessed tabs stay 44 px.
- `Badge` shows a Negative count dot on the corner (hidden at 0, "99+" above `Tabs.MaxBadge`).

### `SliceImage(props: SliceImageProps) -> GuiObject` (Components/SliceImage)
```lua
type SliceImageProps = {
	Slice: string | Slice,                 -- a Themes Slices slot name, or a Slice table
	Color: (Color3 | () -> Color3)?,       -- tint for Tint art and the fallback's fill; default white
	Size: UDim2?,                          -- default fills the parent
	Position: UDim2?, AnchorPoint: Vector2?, Rotation: number?, ZIndex: number?, LayoutOrder: number?,
	Visible: (boolean | () -> boolean)?, Name: string?, Theme: string?,
	[number]: Instance,                    -- children, drawn on top of the art
}
```
- One 9-slice `ImageLabel` from `ThemeUtil.GetSlice` (corners stay fixed, edges and middle stretch). Tint art takes `Color`; other art shows as drawn. `Name` defaults to the slot name.
- Empty slot or Plain: a plain `Frame` in `Color` with the theme's `CornerRadius`, so the piece still shows.

```lua
local SliceImage = require(script.Parent.Parent.Components.SliceImage)

SliceImage({ Slice = "NotchFill", Size = UDim2.fromScale(1, 0.2) })
```

### `Stage(props: StageProps) -> Frame` (Components/Stage)
```lua
type StageProps = {
	DesignSize: Vector2,                   -- the Figma frame in px: Vector2.new(844, 332) for a phone frame below the 58 px top bar
	Visible: (boolean | () -> boolean)?,
	ZIndex: number?,
	Name: string?,                         -- default "Stage"
	[number]: Instance,                    -- children, placed in design px
}
```
- The root `Frame` fills its parent (transparent). A `Design` frame of `DesignSize` is centered in it and scaled by one `UIScale` to fit, keeping its ratio (`ThemeUtil.FitScale`). Scale is 1 until the parent has a size.
- Divides out every ancestor `UIScale` (`ThemeUtil.AncestorScale`), so it fits the same in a story's device frame and in a real ScreenGui. Refits when its size changes or it is parented.
- Children are placed in design px, so Offset sizes and positions are copied from the spec. Nothing is clipped: keep children inside `DesignSize`.

```lua
local Stage = require(script.Parent.Parent.Components.Stage)

Stage({ DesignSize = Vector2.new(844, 332), ShopGrid() })
```

### `ProgressBar(props: ProgressBarProps) -> Frame` (Components/ProgressBar)
```lua
type ProgressBarProps = {
	Value: number | () -> number,        -- 0 to 1, clamped
	Label: (string | () -> string)?,     -- centered on the bar, e.g. "350 / 500"
	Color: Color3?,                      -- fill; default theme Positive (Plain) or Accent
	Size: UDim2?,                        -- default 0.3 x 0.07 of the parent
	Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
}
```
- The fill eases to each new `Value` with the theme's `Spring`, and jumps under Reduce Motion. A value above 0 always shows at least `ProgressBar.MinFill` of the track.
- Styled: a pill track with an inset, top-lit fill. Plain: flat track and fill (see Plain look).
- Must be called inside a Vide scope (it uses `useSpring`). At phone size, make it at least ~24 px tall when it has a label.

### `Toast(props: ToastProps) -> Frame` (Components/Toast)
```lua
type ToastProps = {
	Text: string | () -> string,
	Kind: ("Success" | "Warn" | "Info")?,   -- strip: Positive, Negative, Accent (default)
	Size: UDim2?,                           -- default 0.4 x 0.1
	Position: UDim2?, AnchorPoint: Vector2?, LayoutOrder: number?, ZIndex: number?,
	Name: string?, Theme: string?,
}
```
- One line of text (it wraps, and shrinks between `TextSizes.Caption` and `Body`) in a panel with a colored strip on the left. No buttons.
- Styled: rounded, pops in from `Toast.PopStartScale` on the `Motion.Open` spring (not under Reduce Motion). Plain: flat, no motion.
- Don't build these directly: `ToastService.Show` adds the message, and `Hud/Toasts` draws it.

### `ToastService.Show(text: string, kind: ("Success" | "Warn" | "Info")?) -> ()` (ToastService)
- Adds a toast to `ClientData.Gui.Toasts`. It leaves on its own after `Feel.ToastSeconds`. At most `Feel.ToastMax` show at once; the oldest is removed at once, with no fade. `kind` defaults to `"Info"`. **Doesn't yield.**
- Reads both Feel values on each call, so a Studio tuning change applies to the next toast.

```lua
local ToastService = require(StarterPlayer.StarterPlayerScripts.Features.Gui.ToastService)
ToastService.Show("Saved!", "Success")
```

### `Toasts() -> Frame` (Hud/Toasts)
- The toast stack. Reads `ClientData.Gui.Toasts` with `useAtom`; newest at the bottom, top center of the Hud. Sized by `Toast.StackWidth`, `StackHeight`, `StackTop`, `ToastHeight` and `Gap`. Never takes input.

### Server messages: `Notify`
- Server: `ServerNetwork.Notify.Fire(player, kind, text)`, kind `"Success" | "Warn" | "Info"`. `FireAll(kind, text)`, `FireList(list, kind, text)` and `FireExcept(except, kind, text)` also exist.
- Client: `GuiController` is the only `ClientNetwork.Notify.On` listener. It calls `ToastService.Show(text, kind)`.

## Adding a hud or menu module
New screens are built by the `ui-builder` agent (UI_GUIDE, section 0).
- **Hud:** add `Hud/<Name>/` with `init.luau` returning `function(): GuiObject`. It is picked up automatically.
- **Menu:** add `Menu/<Name>Menu/` with `init.luau` returning `function(props: MenuProps): GuiObject`. The **module name is the menu name**. Declare `MenuProps` locally (requiring `Menu/init` from a child is circular). Bind `Visible` (or an animation) to `props.IsOpen`.
- **View / Connected:** the folder's `init.luau` is the Connected wrapper (reads `ClientData` with `useAtom`, sends Network requests) and returns `View(props)` from `View.luau`, which is pure (data and callbacks in props). Stories render the View.
- **Story:** each screen has a UI Labs story with interactive mocks in `DeveloperTools/Client/UILabs/Stories/` ([DeveloperTools.md](DeveloperTools.md), UI_GUIDE section 7).
- Return a Frame/GuiObject, never a ScreenGui.

## ClientData.Gui.OpenMenu
- Charm atom, `string?`, client-only, never synced or saved. Holds the open Menu module name, or nil.
```lua
local OpenMenu = ClientData.Gui.OpenMenu
OpenMenu("ShopMenu") -- open (closes any other)
OpenMenu(nil)        -- close all
```

## ClientData.Gui.Toasts
- Charm atom, `{ Id: number, Text: string, Kind: ("Success" | "Warn" | "Info") }[]`, client-only, never synced or saved. Oldest first.
- `ToastService` writes it (through `Show` and the timed removal). `Hud/Toasts` reads it. Don't write it from anywhere else.

## Confetti
- Not part of the Gui code. `MonetizationController` listens to Blink `ConfettiNotification` (server -> client, no payload, fired by `MonetizationService` and `GiftService`) and calls `Confetti.rain(hud, { Shape = "Rectangle", Size = NumberRange.new(40, 50) })`.
- It finds `PlayerGui.Hud` with `FindFirstChild` when it plays. If the Hud isn't mounted (or isn't a ScreenGui), it skips silently.

## Gotchas
- Hud/Menu child modules are `require`d when `GuiController` is required (via `Loader.LoadChildren`, direct ModuleScript children only, not nested). Components run once at mount.
- Ordering: `LoadChildren` returns a dictionary, so iteration order is undefined. Order with `ZIndex` / `LayoutOrder`, not file names.
- The client loader loads every descendant of `Features` whose name ends in `Controller`. Don't name a Gui module `...Controller` or it gets loaded and `Init`ed as one.
- Other features find the ScreenGuis by name (`Hud`). Don't rename them.
- HoverButton's default sounds (`UIHover`, `UIClick`) are placeholders: add Sounds with those names to `SoundService`, or change the names in `SharedConfigs.Themes` (`DefaultTheme.Sounds`, or a style's `Sounds`).
- Require `ClientData` as `StarterPlayer.StarterPlayerScripts.ClientData`, or you get a copy that never updates.
- `Notify` has one listener, `GuiController`. Another `ClientNetwork.Notify.On` silently replaces it (Blink keeps one listener per event).
- A toast over `ToastMax` leaves at once with no fade. Keep toast text to one line; long text shrinks to the Caption size.
- The old placeholder `Notify` handler in `MonetizationController` is gone, so server messages reach the player only through `GuiController`.
