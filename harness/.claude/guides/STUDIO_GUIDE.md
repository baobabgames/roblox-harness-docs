# Studio Guide

Read this before any work in Studio through the Studio MCP: building models, maps or lighting, placing assets. The short rules come first; the sections after them are the detail.

## Working in Studio (short rules)
- **World and model builds go to the `studio-builder` agent; UI goes to the `ui-builder` agent** (loop in `UI_GUIDE.md`, section 0). **UI tool** (`references/UI_STYLE.md`): UI Labs, Figma or Both, asked once and saved as the default; with Figma or Both the `figma-designer` agent designs the screens in Figma first and the user approves there (`.claude/ui/FIGMA.md`; Figma not connected → ask whether it's open and connected). Studio not connected → ask the user to connect it first. Brief the agent with the asset picks and every reference the user sent; fixes and the final apply go to the same agent (`SendMessage`).
- **Studio by parts or Blender, asked every build:** any build that makes models asks per model which way (one question with a recommended split for several; Claude keeps every copy of a Blender model updated itself, packages only in multi-place games; details and setup steps: `.claude/guides/BLENDER_GUIDE.md`). Blender picks: check the Blender MCP and the upload key in the same round (not connected → ask the user to open Blender and start the MCP add-on, with the steps), keep a checklist of each model's method, agent and status, and send them to the `blender-builder` agent. **The user approves each model in Blender before it's exported, uploaded and placed.** Never read, print or edit `.env` (the API key; only `scripts/upload-model.ps1` reads it).
- **Model styles:** a look to match from images becomes a style pack (`.claude/blender/styles/<Style>/`, made by the user's `/new-model-style <Name>`), mapped to asset groups in `references/ART_STYLE.md` "Model styles". Blender builds with a pack or reference images go builder → `model-reviewer` (read-only judge) → fixes, at most 2 rounds, before the user's review (`BLENDER_GUIDE.md`, section 7).
- Never put Studio-built things in folders Rojo maps from `src/` (it deletes them), and never build in `ServerStorage.Library`. Code finds Studio-built things through a config path (`-- STUDIO:` comment) with `FindFirstChild`.
- Studio-built things live in the place file, not git: tell the user to save the place after you build.

## The studio-builder agent

World and model builds (map areas, props, buildings, lighting, library copies, Roblox AI assets) go to the `studio-builder` agent. UI goes to the `ui-builder` agent (`.claude/guides/UI_GUIDE.md`, section 0). The agent builds part by part in Studio itself; Roblox AI is only for what the user picked it for, or when something can't be built well from parts.

1. **Studio first:** `list_roblox_studios`. Not connected: ask the user to open the place and connect the Studio MCP, and wait. Never fall back to code or placeholders on your own.
2. **Ask first** (ASSETS_GUIDE.md, Missing Assets), in one round with any other questions, including the **reference check** for a new or redesigned area or model (`ASSETS_GUIDE.md`, "Reference check") and **Studio by parts or Blender** for every model (`.claude/guides/BLENDER_GUIDE.md`, sections 1–3: the split, the Blender and upload-key checks, the checklist). Models picked for Blender go to the `blender-builder`, started in the same message. Then start the agent with a brief: what to build and where, every asset pick, the user's references (image paths, `REFERENCE.md` paths, what to take from each) and anything they said about the look. A reference the user sent always goes in the brief.
3. **Model:** `model: "sonnet"` for a simple or time-critical build (one model, a small area, fixes). Anything bigger (a full map, several areas, a detailed landmark): `model: "opus"`, `effort: "high"` (never higher).
4. **The loop:**
   1. The agent builds everything and puts it in place, then
   2. checks its own build for wrong designs and problems and fixes them, and reports.
   3. You show the user the result (the agent's screenshot views, or a `screen_capture` from its camera spots) and ask with the question tool whether it looks good and what they want changed (options: "Looks good, apply", "Change some things" plus the open issues the agent listed).
   4. Changes: `SendMessage` them to the **same agent** to fix, then back to 3.
   5. Approved: `SendMessage` "apply". The agent does the final audit and cleanup; you write its `-- STUDIO:` paths into the configs and tell the user to save the place.
5. **Fast:** brief it fully so it doesn't need to explore, start it in the background, and do other work (code, configs) while it builds. Several separate areas can be separate agents in one message.

## Building in Studio

When the user picks **Build it in Studio**, use the Studio MCP tools on the open place: `execute_luau` (create and arrange parts, models, UI art, lighting), `insert_asset` / `search_asset` (Toolbox), and `screen_capture` to check the result. When the user picked **Generate with Roblox AI**, follow "Generating with Roblox AI" in `ASSETS_GUIDE.md` (`generate_mesh`, `generate_material`, ..., always in the art style of `references/ART_STYLE.md`).
- **Where it goes:** see "Place Layout" below. Rojo deletes anything it doesn't know about in the services it maps from `src/` (`ReplicatedStorage`, `ServerScriptService`, `StarterPlayerScripts`), so Studio-built things only go in the places that table names.
- **Follow the references and the library:** read `references/INDEX.md` and the matching `REFERENCE.md` (Style and World), and look at same-kind items in `library/CATALOG.md` (see `ASSETS_GUIDE.md`). Use their colors, materials, shapes, sizes and layout. Anchor static parts, keep part counts low, and use the same tags and attributes the code looks for.
- **Toolbox assets:** insert them only when the user picked it, then delete every Script, LocalScript and ModuleScript inside (free models can hide malicious code) and say what you removed.
- **Code still finds it safely:** its path goes in the feature's config with a `-- STUDIO:` comment, and code looks it up with `FindFirstChild` (or `CollectionService` tags) and handles it missing, so a fresh place still runs.
- **It's saved in the place, not in git.** Tell the user to save the place in Studio (Ctrl+S or publish) after you build; you can't save it yourself. List everything you built at the end of the task, with its path.

### Build fast
Studio handles one request at a time, so fewer, bigger steps are much faster than many small ones:
- **One `execute_luau` per area** (or per large model): a single script that creates the area's folders, clones every library asset it uses, builds the parts, sets anchoring, collisions, tags and attributes, and returns a short summary (counts, bounding size). Write positions from a small layout table at the top of the script (name → CFrame, size), not one call per part.
- **Lighting in one script:** Lighting properties, `Atmosphere`, `Sky` and post effects together.
- **One `screen_capture` per area** to check it, then fix only what's wrong with a small targeted script. Don't screenshot after every change.
- **Reuse before building:** clone library assets (`ServerStorage.Library`) and copy existing pieces instead of rebuilding them part by part.
- **Build in parallel with code:** during `/build-gdd` or `/revise-gdd`, the `studio-builder` agent builds the world in Studio while the code builders write code.

### Studio gotchas
- **Material variants:** first read `Studs variants: **on|off**` in `references/ART_STYLE.md` (and the brief). Off: use no `MaterialService.Studs` variants at all, even though Rojo syncs them in. On: check `MaterialService` for variants (also inside folders) and use them per surface type (see "Surface texture" there). Keep text boards, Glass and Neon smooth. Variants take a few seconds to render: don't judge them from the first screenshot.
- **Streaming:** under StreamingEnabled, set `ModelStreamingMode = Persistent` on anything a client teleports to or attaches prompts to (stands, plots, stations).
- **Screenshot camera: move it, never lock it.** To aim a `screen_capture`, set only `workspace.CurrentCamera.CFrame` (and `Focus`) in Edit mode; the edit camera follows it without changing `CameraType`. Never set `CameraType = Scriptable` in Edit: it is saved with the place, freezes the user's Studio camera after the session, and the play camera won't take over a Scriptable camera either. If a script did change it, set it back in the same script (`CameraType = Enum.CameraType.Fixed`, `CameraSubject = nil`), and every task that moved the camera ends with that reset.
- **Blank screenshots are "Not seen":** `screen_capture` comes back black or blank when Studio's 3D view is hidden (minimized, behind another window, or a script tab in front). Retry once; it isn't a game bug. Still blank: whatever it was meant to show is **Not seen**, never passed or "looks fine", and the report says so (`Not seen: <what>, screenshot blank`). Nothing visible is called done on code checks alone. Inside a running build there's no stop for it: carry on and list it. The fix for the user: bring Studio's 3D view to the front (not a script tab, not minimized), then `/playtest` re-checks the Not seen items.

## Place Layout

Everything in the place stays organized and in the right spot: what you build in Studio, Toolbox inserts, library copies, and instances code creates (placeholders, runtime spawns).

| What | Where |
|---|---|
| Static world | `Workspace.Map.<Area>` (`Lobby`, `Zone1`), split inside by kind: `Buildings`, `Props`, `Nature`, `Barriers` |
| Instances a feature's code uses (spawn points, plot slots, boards, NPC spots) | `Workspace.<Feature>` (like the template's `Workspace.Leaderboards`), tagged with `CollectionService` when code looks for many |
| Things code spawns while playing (drops, enemies, projectiles, effect hosts) | `Workspace.Runtime.<Feature>`: code makes these folders, never build there by hand |
| Models code clones | `ReplicatedStorage.Assets.<Feature>` (clients need them) or `ServerStorage.Assets.<Feature>` (server only). Used by several features: `Assets.Shared` |
| The asset library | `ServerStorage.Library`, synced by Rojo from `library/`. Read-only: copy from it, never build or edit there |
| Sounds | `SoundService.<Feature>` or a category folder (`UI`, `Combat`); music in `SoundService.Music`. Sounds are found by name anywhere in `SoundService`, so every name is unique there |
| Lighting | `Atmosphere`, `Sky`, `Bloom`, `ColorCorrection` and other effects directly in `Lighting` (Roblox only uses them there), one of each |
| UI | Vide code in the `Gui` feature, tested as UI Labs stories in `DeveloperTools/Client/UILabs` (`UI_GUIDE.md`, section 7). Nothing is built in `StarterGui`. Image ids go in configs |

- **One object, one Model:** group each object's parts into a `Model` with its `PrimaryPart` set, never loose parts. Nothing sits loose at the root of `Workspace` or a service.
- **Names:** PascalCase and say what it is (`ShopStall`, `CoinPile`, `SpawnPoint`). No default names (`Part`, `Model`, `Union`, `Folder`) on anything code or a person needs to find, and sibling names code looks up are unique.
- **Tidy:** folders nest by area or feature, then kind, at most about 3 deep. No empty folders, duplicates, or leftover test pieces.
- **Cheap decor:** anchor static parts; turn off `CanCollide`, `CanTouch` and `CanQuery` on decor nothing touches or raycasts.
- **The place already has a layout:** look first (`search_game_tree`) and follow it. If things are loose or misplaced, list them and ask before moving them: user scripts may reference their paths.
- After building, check the folders you touched with `search_game_tree` and fix anything that breaks these rules.

## UI

UI isn't built in Studio as mockups anymore. It's Vide code reviewed and tested as UI Labs stories with interactive mock data, built by the `ui-builder` agent: see `.claude/guides/UI_GUIDE.md` (section 0 for the agent, section 7 for stories). A library UI kit is inserted only temporarily, read with `inspect_instance` / `execute_luau`, rebuilt as Views, and the copy deleted.
