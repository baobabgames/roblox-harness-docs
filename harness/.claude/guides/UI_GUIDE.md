# UI Guide

Follow this whenever you create a new UI. The code rules in `CODE_GUIDE.md` and `PROJECT_GUIDE.md` still apply.

## 0. The ui-builder agent

New or changed UI and restyles go to the `ui-builder` agent (`.claude/agents/ui-builder.md`). It builds mobile-first, in one of two modes:
- **Plain (the default, always unless the user asks for a styled UI):** the Plain theme (`Themes.DefaultTheme`, 4b) and the shared Components. No style design, no style pick, no look scores: the loop skips step 4.0 and the checker runs in Plain mode (fit audit plus the Plain code check). The builder runs on `sonnet`. GDD builds (`/build-gdd`'s MVP and Polish rounds, `/revise-gdd`) don't use the builder for screens: each system's builder makes its own (`build-gdd/BUILD.md`, "UI").
- **Signature (only when the user asks: the UI focus of `/build-gdd`'s Looks stage, a `/revise-gdd` look change, or "make the UI styled / pretty / in the style of …"):** the game's own style (`references/UI_STYLE.md`), never the "AI UI" look, with the style pick and look scores below. Once a style is active (`Themes.Active`), later UI follows it.

0. **UI tool:** read `**UI tool:**` in `references/UI_STYLE.md` (**UI Labs** / **Figma** / **Both**). Not set (or line missing): ask in step 2's round which tool, and whether to save it as the default. Set: use it without asking, unless the user named another tool. **Figma** or **Both:** connect to Figma and pick the file first (`.claude/ui/FIGMA.md`, sections 2–3; not connected → ask whether Figma is open and connected). The `figma-designer` agent designs the screens and the user approves them there before the `ui-builder` builds (FIGMA.md section 4). GDD builds ask in their approval round instead (FIGMA.md section 6).
1. **Studio first:** `list_roblox_studios`. Not connected: ask the user to connect it, and wait. The user also needs the UI Labs plugin (Roblox Marketplace).
2. **Ask first** (WORKFLOW_GUIDE.md, Ask for Details and Missing Assets), in one round with the **reference check** for new or redesigned screens (`ASSETS_GUIDE.md`, "Reference check"). Then brief the agent: the screens (data shown, actions), the references and any image the user sent, the icon and asset picks, and what the user said about the look.
3. **Models:** the builder runs on `model: "sonnet"`; only to design a new signature style (style tiles, then the screens right after) use `model: "opus"`, `effort: "high"` (never higher). The `ui-checker` runs on Sonnet (its frontmatter).
4. **The loop: pick the style, build everything, then check.** With **Figma** or **Both**, the style pick (4.0) and first look review happen in Figma (FIGMA.md section 4); the builder's brief gets the approved spec (`build/figma/<Task>/SPEC.md`) and the checker its Figma match check. **Figma** skips the UI Labs review (4.4) and applies once the checker passes; **Both** keeps it.
   0. **Style pick (Signature only, when `UI_STYLE.md` is "not set yet" or for a restyle):** the builder's first turn makes **3 style directions** as one `StyleTiles` story (the same small board of real Components per direction) and stops. Run the `ui-checker` on `StyleTiles`, show the user the story (UI Labs → Gui → StyleTiles, switch `Direction`) with the scores, and ask with the question tool: A / B / C / "mix: …". Send the pick to the **same builder**; it writes `UI_STYLE.md` and builds the screens.
   1. **Build:** the `ui-builder` builds **every requested screen in one pass**: components, Views, mocks and a UI Labs story per screen (section 7). Lint only, no self-checking.
   2. **Check:** start the `ui-checker` with the studio id, the story names (HUD or menu) and the screens' files. It runs `UIAudit` on all stories at Phone and PC in one call. In Signature mode it also **screenshots every screen at phone size and scores its look** on `.claude/ui/RUBRIC.md` (Design quality, Originality, Craft, Functionality; pass = all ≥ 7) and skims the Views for "AI UI" giveaways. It returns one fix list.
   3. **Fix (at most 2 rounds):** issues or a failed score → `SendMessage` the list to the **same builder**, which changes only flagged elements. Re-run the checker on those stories **plus every story using a Component the fix changed**. Still failing after round 2: list what's left (with scores) for the user instead of looping.
   4. **Review:** tell the user how to open the stories (UI Labs → Gui → `<Screen>`, which controls and actions to try) and ask with the question tool: "Looks good, apply", "Change some things", plus anything still open. Changes → same builder, then the checker on the changed stories, then ask again.
   5. **Apply:** `SendMessage` "apply". The builder wires the Connected wrappers to real data and the network, makes the style active, updates the docs and checks the console in play mode. Add any shared files it lists under **Needs** (events, data fields). A big apply (4+ screen groups) can split the wiring across parallel `sonnet` builders.
5. **Fast:** brief it fully (the `UI_STYLE.md` summary and the Components with props), start it in the background and keep working. Independent screen groups can be separate builders in one message once the style exists.
6. **Imported screens** (`/import-game`, look "Same as now"; `import-game/CONVERT.md`, "UI"): screens already exist as harness files generated from the old game's properties (`lune run import-place ui-to-vide` → `build/import/<Name>/ui/`). Builders run in parallel by screen group; each starts from that output (never a blank file, never retypes the look), reviews split and names, swaps in a flagged existing Component (Window, Tabs, PriceButton...) only when `ui-diff` still passes, resolves every `UICONVERT:` marker by wiring to the system's `ClientData` atoms and Blink events (once its conversion wave is done), and moves files into `src/Features/Gui/Client/` (stories and mocks into `src/Features/DeveloperTools/Client/UILabs/`). The check is the `ui-diff` property diff instead of style tiles and look scores; the `ui-checker` checks function only.

**Stack (installed versions):** Vide 0.3.1 (UI) · Charm 0.10.0 (state) · VideCharm 0.3.0 (bridge) · Ripple 0.10.2 (motion, only when needed). All from `ReplicatedStorage.Packages.<Name>`.

> Charm's online README is for a newer version (`signal`, `untracked`). This project uses **0.10**: `atom`, `computed`, `subscribe`, `effect`, `peek`, `batch`.

## 1. File and folder structure

All UI lives in the `Gui` feature, client side (`src/Features/Gui/Client/` → `StarterPlayerScripts.Features.Gui`, mapped in `default.project.json`):

```
GuiController.luau        Init: mounts the Hud and Menu roots into PlayerGui
Hud/init.luau             the "Hud" ScreenGui; loads every child module
Menu/init.luau            the "Menu" ScreenGui; loads every child module
Menu/ShopMenu/  (example) a screen is a folder: init.luau (Connected), View.luau (pure), child pieces
Components/HoverButton.luau   hover-scaling ImageButton with sounds (docs/Gui.md)
Hooks/useSpring.luau          reusable reactive helpers
```

`(example)` files don't exist; they show where new UI goes. UI Labs stories live in `src/Features/DeveloperTools/Client/UILabs/` (section 7).

- **View / Connected split:** every screen is a pure `View.luau` (data as values or sources in props, actions as callbacks like `OnBuy`, `OnClose`; never `ClientData`, Network, `LocalPlayer` or `UserInputService`) and a Connected `init.luau` that reads `ClientData`, sends requests and returns `View(props)`. Stories render the View with mocks; the game renders the Connected one.
- **Exactly two ScreenGuis: `Hud` and `Menu`.** Never create a ScreenGui in a module: return a GuiObject and the root parents it. **`IgnoreGuiInset = true` on every ScreenGui** (the roots, temporary layers like `RewardFly`, test GUIs), so the UI covers the whole screen and Scale positions match what the player sees. Leave it off only when the user asks or a screen must lay out below Roblox's top bar, with a short comment why. The top bar still sits on top: keep pieces pinned to the top edge below it (~58 px at phone size) and out of the corners where its buttons are.
- **Hud** = always on screen: `function(): GuiObject`. **Menu** = fills the screen, one open at a time: `function(props: MenuProps): GuiObject`. `Menu/init` passes `props.IsOpen()` and `props.Close()`; bind `Visible` (or an animation) to `IsOpen`. A Menu can't require `Menu/init` (circular), so declare `type MenuProps = { IsOpen: () -> boolean, Close: () -> () }` at its top.
- Open a menu with `ClientData.Gui.OpenMenu("ShopMenu")` (module name); close with `props.Close()` or `OpenMenu(nil)`.
- **Adding UI = adding a module** under `Hud/` or `Menu/`; the roots load children automatically (`Loader.LoadChildren`), nothing to register. Order with `ZIndex` / `LayoutOrder`.
- Every Gui module **returns a function** and creates no instances when required. Only `GuiController` calls `mount`. A screen is always a folder (`init.luau`, `View.luau`, one module per bigger piece). Components are PascalCase; hooks keep the `use` prefix.
- **Reuse a Component before writing one:** check the Components list in `docs/Gui.md` first (`HoverButton` for any hover-reactive button). Add a new one there.

## 2. Vide source vs Charm atom

Default to a Vide `source` for state owned by one component; a Charm `atom` only for shared state living outside the UI (in `ClientData`), never created inside a component. Read through `useAtom` (inside a component), never write synced atoms; no yielding in components, `derive` or `effect`, and an `effect` never reads a source it writes (`untrack`).
Full detail: `.claude/ui/VIDE_AND_DATA.md` (read it when you write reactive code).

## 3. Client and ClientData

`ClientData` is a plain table of Charm atoms synced by name from the server (a server field with no matching atom isn't synced); require it as `StarterPlayer.StarterPlayerScripts.ClientData`. UI never writes `PlayerData` / `ProfileData` atoms: send a request through `ClientNetwork`. Only the Connected `init.luau` reads `ClientData` with `useAtom`; View props take plain values or sources.
Full detail and a Connected + View example: `.claude/ui/VIDE_AND_DATA.md` (read it when you add synced data or wire a Connected screen).

## 4. Ripple (motion)

Use Ripple only when a value must animate smoothly between changing goals (hover, pop-in, sliding panels); `createSpring` is the default, bridged into a Vide source with `Hooks/useSpring.luau`, every spring cleaned up with `cleanup`.
Full detail: `.claude/ui/RIPPLE.md` (read it when you animate).

## 4b. Theme (the look)

Colors, fonts, text sizes, corners, spacing, depth, strokes, motion, rarity colors, 9-slice art and UI sounds come from the theme, never hard-coded:

```lua
local ThemeUtil = require(ReplicatedStorage.SharedUtilities).ThemeUtil
local theme = ThemeUtil.Get()       -- the active style; ThemeUtil.Get("Cartoon") for a specific one
-- BackgroundColor3 = theme.Colors.Surface, CornerRadius = theme.Radius.Large, FontFace = theme.DisplayFont
local color, rank = ThemeUtil.GetRarity(theme, "Epic") -- color AND rank (pips), never color alone
if not ThemeUtil.ReducedMotion() then --[[ pop-in, stagger, squash ]] end
```

**Token groups** (`SharedConfigs/Themes.luau`): `Plain` (true in the Plain look: components draw no decoration), `Colors`, `Font` / `BoldFont` / `DisplayFont`, `TextSizes` (Display / Title / Body / Caption, px at phone size), `Radius` (Small / Medium / Large / Pill), `Spacing` (XS–XL), `Depth` (lip, lip darken, top light, shadow), `Motion` (Open / Press springs, list Stagger), `RarityOrder` + `RarityColors`, `Slices` (optional 9-slice art for Panel / Button / Card; used when set, else corners + stroke + lip + gradient). `DefaultTheme` is the Plain look; a style sits on `StyledBase` (real corners, depth, motion, `Plain = false`) over it.

- Styles come from Style references (`references/<Name>/`) through `/new-reference`, which writes `REFERENCE.md` and `SharedConfigs/Themes.luau`. Which style goes where: `references/INDEX.md`.
- Read the style's `REFERENCE.md` before designing (not the images), plus any UI/UX reference that matches the screen.
- A value the theme lacks (e.g. a new color role): add it to the `Theme` type and `DefaultTheme` in `Themes.luau`, then use it.
- **Components carry the look.** Screens only arrange components and pass data; they set no colors or strokes, so a restyle only touches components. A full restyle follows `.claude/skills/build-gdd/LOOKS.md` (the UI focus).
- **The game's own style:** `references/UI_STYLE.md` holds the signature style (DNA, two signature motifs, palette roles, fonts, construction, mobile rules), mirrored as a style in `Themes.luau`. Every screen follows it and shows both motifs. "Not set yet" means Plain; the `ui-builder` designs a style only when the user asks (Looks stage's UI focus, LOOKS.md): 3 directions as style tiles, the user picks (section 0). With no user references it picks the 1–2 entries in `references/` that best fit, or does a few time-boxed (~10 min) web searches, listing picks in its report. Its **Used before** list keeps games from converging on the same fonts and motifs.

### Layout and anchors (every UI)
- **AnchorPoint is center, `Vector2.new(0.5, 0.5)`, by default**, with `Position` as the element's center. Another anchor only when pinned to an edge or corner (HUD button bottom-right `(1, 1)`; top bar `(0.5, 0)`) or a layout needs it, with a short comment why. Elements inside a `UIListLayout` / `UIGridLayout` keep the layout's placement.

### Close buttons (every UI)
- **The close icon is an "X" text label** in the theme's bold font (with the style's text stroke in a styled look), never a cross built from rotated frames. `Window` already does this; reuse it.

### The Plain look (the default)
Every UI is Plain unless the user asked for a styled UI. In a GDD build everything is a placeholder, and Plain keeps the layout, flow, numbers and states readable.
- **Shapes:** simple flat shapes from the shared Components, `Radius` 0, a 1 px `Stroke` outline on panels that need one. No gradients, lips, shines, shadows, 9-slice art or motifs.
- **Transparency is fine:** anything that doesn't need a panel (HUD counters, labels, hints, floating text, buttons over the world) can have no or a see-through background (`BackgroundTransparency`), with text kept readable (a text stroke or light backing). The game stays visible and the layout reads better.
- **Color:** greys from the Plain theme. Color only where it means something: `Positive` (buy, claim, can afford), `Negative` (can't afford, close, error), `RarityColors`, `Accent` (selected outline).
- **Text instead of icons:** labels say what a thing is ("Coins 1.2K", "Buy 300", "Locked", "Equipped", the rarity name). No images, `ItemViewport` icons, emoji or letter icons.
- **Hierarchy by size and place only:** the main thing is the biggest text or button and sits where the thumb is (4c); `TextSizes` keep a clear jump (Title vs Body).
- **Motion:** none, except the press shrink every tap needs (theme `PressScale`). No pop-ins, staggers, shakes or flashes.
- **States readable without effects:** can't afford = `Negative` face plus "Need N more"; locked, owned, equipped and selected each say so in text or outline.
- Views set no colors of their own; Components draw the Plain look from `theme.Plain`.

### The Signature look, area by area (only when the user asked for a styled UI)
The only copy of these rules (`ui-builder` and `ui-checker` point here). The checker scores the result on `.claude/ui/RUBRIC.md`.
- **Composition:** one hero per screen, everything else visibly smaller. Asymmetry or a broken grid where it fits (a wide featured card, a detail panel beside the grid, tabs outside the window edge). Menus fill most of the phone screen.
- **Typography:** a display font with character for titles, prices and big numbers (`DisplayFont`), a plain readable body font. Big jumps: Display ≈ 3× Body, not 1.5×. Outline text on art or color (a dark same-hue stroke beats black).
- **Color:** one dominant color, one sharp accent for the main action, a highlight for selected / new / rewards. Commit; five evenly spread colors read as timid. Contrast on every label.
- **Shape and depth:** mix corner sizes (`Radius`): big panels round more than chips. Every surface has depth (darker lip, stroke, top-lit gradient); 9-slice art when the style has it. Both signature motifs on every screen.
- **Spacing:** tight inside a group, wide between groups (`Spacing`). Even padding everywhere is a giveaway.
- **Motion:** one orchestrated open (panel pops with `Motion.Open`, cards follow with `Motion.Stagger`) beats scattered effects. Press squash on every tap. Everything skips to its end state when `ThemeUtil.ReducedMotion()` is true.
- **Icons:** the user's own icons and image ids (chat or library) come first. Only when missing (ASSETS_GUIDE.md, Missing Assets) use `ItemViewport` on a model from `ReplicatedStorage.Assets`, or its colored-shape fallback. Never letters or emoji (stroked or tinted emoji render as white ghosts).
- **Rarity and state:** never by color alone (colorblind players): add pips, a label or a rank. Locked, owned, equipped and can't-afford each look unmistakable.
- **Banned (the "AI UI" look):** the same 8px corners everywhere, flat borderless fills, default font only, blue→purple gradients, glassmorphism, a centered generic card with a plain title bar, everything the same size, even padding, emoji or letter icons, grey boxes, soft drop shadows on everything, symmetric layouts with no focal point.
- These matter most for placeholders: a UI built without the user's art must still look intentional and finished, never like a grey stand-in.

**Rules that keep UI from breaking:**
- `UIAspectRatioConstraint` only shrinks a box: never give a constrained element a 0 Scale and 0 Offset dimension (`fromScale(0, 1.12)` collapses). Give it a box to shrink into.
- Toast and banner text stays readable on a ~1280×840 viewport: set `UITextSizeConstraint.MinTextSize` and let text wrap instead of shrinking.
- `UITextSizeConstraint` Min / Max are **absolute screen px and ignore `UIScale`**: a Max cap makes text look smaller where the screen-size `UIScale` is above 1 (PC, tablet). Cap at the size you want on the biggest screen, or leave Max off and size text through its box.
- `AbsoluteSize` already includes every ancestor `UIScale` (the story's device frame has one). A View that fits itself with its own `UIScale` first divides by the ancestors' product (`ThemeUtil.AncestorScale`), or it scales twice. For a px layout copied from Figma use the `Stage` Component.
- Text that follows the player's Text Size setting (`GuiService.PreferredTextSize`) uses `AutomaticSize` + `TextWrapped`, not `TextScaled` (which opts out); use it for long body text.

## 4c. Mobile-first UX

PC and mobile are always supported, and every screen is **designed for a phone in landscape (~844×390) first**, then scaled up to PC. Builds on `.claude/guides/INPUT_GUIDE.md` §5.
- **Thumb zones:** actions bottom-right, main action biggest. Close buttons big and inside the safe area. Never cover Roblox's top bar.
- **Roblox's touch controls** (thumbstick, jump button): overlapping them is fine, unless the user asks to keep them clear or something becomes unusable (a button mostly under the jump button). Open menus cover them on purpose.
- **Targets:** every tappable element at least ~44 px at phone size, spaced so one thumb can't hit two.
- **No hover-only information:** details open on tap (tap-to-inspect, selected state); every tap gets instant press feedback (scale down plus a sound).
- **Text:** `UITextSizeConstraint.MinTextSize` ≥ 14 at phone size, short labels, abbreviated numbers (1.2K), a stroke on text over art.
- **Layout:** menus fill most of the phone screen (no small centered card), one scrollable grid of big cards, tabs bottom or side within thumb reach, progressive disclosure. The HUD stays small in the corners.
- **Scale:** Scale sizes, `UIAspectRatioConstraint` (never on a 0-size box), a `UIScale` driven by screen size, `IgnoreGuiInset` on (section 1) with top-pinned pieces kept below the top bar.
- Test in the screen's story with `Device = "Phone"` and `ShowThumbZones` on (section 7).

## 5. Checklist before finishing a UI

- [ ] **Reactivity:** changing values are function/source props; server data via `useAtom`; atom tables replaced, never mutated; no yielding in components, `derive` or `effect`; no `effect` reads a source it writes (`untrack`); local state = `source`, atom only if shared; derived values via `derive` / selector; Ripple only where it adds something.
- [ ] **Cleanup:** only `GuiController` mounts; components return GuiObjects, never a ScreenGui; every connection, spring or subscription has `cleanup(...)`; no atoms created inside components.
- [ ] **Structure:** PascalCase module returning a function in Hud / Menu / Components; big UI is a folder; `Shared` / `Private` tables, `const`, cached hot functions (`local create = Vide.create`); Menus bind `Visible` to `props.IsOpen` and open via `ClientData.Gui.OpenMenu`; pure `View.luau` plus Connected `init.luau`; a UI Labs story with interactive mocks exists or was updated.
- [ ] **Look:** Plain (default): shared Components and Plain theme only, text instead of icons, no decoration or motion beyond the press shrink. Signature (user asked): follows `references/UI_STYLE.md`, both motifs, one hero, nothing banned, depth on every panel, 7+ on every `RUBRIC.md` criterion (or gaps listed).
- [ ] **Theme and reuse:** colors, fonts, corners, strokes, motion, sounds from `ThemeUtil.Get` (no hard-coded `Color3` / fonts); existing Components reused; screens set no colors or strokes; follows the `REFERENCE.md` Do / Don't; motion skips under `ReducedMotion()`; rarity and states never by color alone.
- [ ] **Details:** AnchorPoint center unless pinned; no letter or emoji icons; close buttons are an "X" text label; no 0-size aspect-constrained frames; toast text readable at ~1280×840.
- [ ] **Devices** (4c; touch input: `INPUT_GUIDE.md` §5): phone first, checked in the story at Phone and PC; targets ≥ ~44 px, text ≥ 14 px, inside the safe area, nothing on the top bar, nothing unusable under the thumbstick or jump button, no hover-only information; every action works by tap. Gamepad (only if asked): buttons `Selectable`, a Menu selects its first button on open (`GuiService.SelectedObject`) and closes with `ButtonB`. Key prompts follow `ClientData.Input.Device`.

## 6. Full example: VIP badge (Hud)

A complete Hud module (`Hud/VipBadge.luau`): `useAtom` selector over shared data, a local `source`, springs via `useSpring`, no writes to synced data.
Full detail: `.claude/ui/EXAMPLE_VIP_BADGE.md` (read it when you want a complete example).

## 7. UI Labs stories (test bench)

Stories replace the old `StarterGui.UIPreviews` mockups (none are made anymore; `GuiController` still removes an old `UIPreviews` copy).
Every screen gets a UI Labs story: the real View rendered with **interactive placeholder data**, so the user can open it in Studio (edit mode, UI Labs plugin) and click through it before it's wired to the game. Package: `ReplicatedStorage.Packages.UILabs` (`pepeeltoro41/ui-labs`, in `wally.toml`).

**Where** (`src/Features/DeveloperTools/Client/UILabs/` → `StarterPlayerScripts.Features.DeveloperTools.UILabs`):
```
Gui.storybook.luau          the storybook: every *.story under this folder (exists)
StoryUtil.luau, UIAudit.luau  helpers and the ready-made check (exist, never rewrite)
Stories/<Screen>.story.luau one story per screen
Mocks/<Feature>Mocks.luau   placeholder fixtures (items, rewards, players)
```
Never required at runtime (the client Loader only loads `Controller$` modules).

**StoryUtil:**
- `StoryUtil.Controls(extra?)`: standard controls (`Device` = Phone / Tablet / PC, `ShowThumbZones`) plus the screen's own (`Empty`, `Locked`, `UILabs.Slider(...)`, `UILabs.Choose(...)`).
- `StoryUtil.DeviceFrame(props.controls, viewInstance, actions?)`: renders the View in an 844×390 / 1024×768 / 1920×1080 device screen scaled to fit, below a 58 px top bar, with the thumb-zone overlay when on. `actions` (`{ ["Add item"] = fn }`) adds story-only buttons.
- `StoryUtil.With(list, item)` / `StoryUtil.Without(list, id)`: new lists for mock state (never mutate in place).
- `StoryUtil.DeviceSize(name)` / `StoryUtil.Zones(size)`: sizes and touch zones (used by UIAudit). What StoryUtil draws carries the `AuditIgnore` attribute, so UIAudit only measures the View.

**Views size themselves from their parent** (Scale, or the parent's `AbsoluteSize`), never from `workspace.CurrentCamera`, so the device switch and the audit see real sizes.

**Mocks:** plain modules with `MakeItem()` / `MakeItems(n)` returning placeholder data in the real data shape (name, rarity, price, `ItemViewport` id; the colored-shape fallback works without models). Never real asset ids the user didn't give.

**Interactive:** the story holds mock state in Vide sources and passes callbacks that change it: Sell removes the item, Equip toggles it, Buy subtracts mock coins (or shows "can't afford"), Close hides the View (with an "Open" action to bring it back). Every action does something visible.

```lua
-- Stories/InventoryMenu.story.luau (key lines; full example in .claude/ui/VIDE_AND_DATA.md)
return UILabs.CreateVideStory({ vide = Vide, controls = StoryUtil.Controls({ Empty = false }) }, function(props)
	local items = source(InventoryMocks.MakeItems(8))
	local view = View({ Items = items, OnSell = function(id) items(StoryUtil.Without(items(), id)) end })
	return StoryUtil.DeviceFrame(props.controls, view, { ["Add item"] = function() items(StoryUtil.With(items(), InventoryMocks.MakeItem())) end })
end)
```

**Edit-mode rules:** stories run in Studio edit mode in UI Labs' sandboxed `require` (fresh modules each mount). No remotes, `LocalPlayer`, `PlayerGui` or `ClientData` in a View or story. Use `UILabs.Environment.UserInput` instead of `UserInputService`, and `Vide.cleanup` for anything connected.

**The ready-made check (UIAudit)**, run by the `ui-checker`: one `execute_luau` (Edit mode) checks every story at every device, loading fresh module copies each run (Studio caches `require`):
```lua
local m = game.StarterPlayer.StarterPlayerScripts.Features.DeveloperTools.UILabs.UIAudit
local f = loadstring(m.Source); setfenv(f, setmetatable({ script = m }, { __index = getfenv() }))
return f().Run({ Devices = { "Phone", "PC" } })
```
- **Options:** `Story = "<Name>"` (one story), `Theme = "<Style>"` (compare colors), `Keep = true` (leave the last mount up for one `screen_capture`; `f().Clear()` removes it).
- **Issues (device pixels):** tap targets under 44 px, text under 14 px, text that doesn't fit, 0-size aspect boxes, buttons off screen / overlapping / on the top bar / mostly (half or more) under the jump button, render or load errors.
- **Notes:** buttons partly over the thumbstick or jump button (fine, 4c), colors not in the theme, default names.

**Keep stories current:** a change to a View updates its story and mocks in the same task.

**Designed in Figma:** stories are still made the same way (the audit's test bench); the View follows the approved Figma frame and the story's controls cover the frame's states (`.claude/ui/FIGMA.md`).
