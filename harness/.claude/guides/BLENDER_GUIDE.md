# Blender Guide

Read this before any model build that might use Blender. Models can be built two ways: **in Studio by parts** (the `studio-builder`, `STUDIO_GUIDE.md`) or **in Blender** (the `blender-builder`, through the Blender MCP), then uploaded to Roblox and placed in Studio. The short rules are in `STUDIO_GUIDE.md` ("Working in Studio"); this is the detail.

## 1. Ask: Studio by parts or Blender (every build)

Whenever a build makes or changes models (props, buildings, nature, characters, map pieces; not UI, not lighting), ask **per model** how it's built, in the same question round as everything else (WORKFLOW_GUIDE.md, Ask for Details and Missing Assets), together with the **reference check** for new or redesigned models (`ASSETS_GUIDE.md`, "Reference check"; the matches include style packs). **Build it in Blender** is one of the Missing Assets options, next to **Build it in Studio**. In GDD builds (`/build-gdd`'s Looks stage, `/revise-gdd`) the **asset list** asks this instead: each model's row carries its suggested route by the rule below, and the user approves or revises the list (`.claude/skills/build-gdd/ASSETS.md`); the questions below are for builds outside those skills.
- **One or two models:** the model's Missing Assets question has both options. Recommend one with the rule below.
- **Several models:** one question with a recommended split in its text, like "Blender: Tree, Rock, Mushroom · Studio by parts: Stall, Fence, Sign". Options: **Use this split** (recommended) / **All Studio by parts** / **All Blender**; Other = the user types their changes. Library, Roblox AI and placeholder picks stay their own questions.
- **Style packs** (section 7): a model in an asset group that ART_STYLE "Model styles" maps to a pack is always offered as **Build it in Blender (<Style> style)**, recommended.
- **Which to recommend:** curved, organic or detailed shapes (trees, rocks, creatures, characters, vehicles, statues, rounded props) → **Blender**. Blocky or architectural ones (buildings, walls, fences, stalls, platforms, signs, anything code resizes or recolors by part) → **Studio by parts**. A library asset that fits still comes first.
- Never build in Blender without the user picking it.
- **No package question by default:** Claude keeps every copy of a Blender model in step itself (section 5, "Copies and updates"). Only in a multi-place game (`src/Places/` exists), for a model that goes into more than one place, ask whether it should be a package (section 5, "Packages").

## 2. Connect (only if something goes to Blender)

Check both in the same round as the question above, so nothing stops later. Put the setup steps in the question's text.

**Blender:** find the Blender tools with `ToolSearch` ("blender objects summary") and call `get_objects_summary`.
- **No Blender tools at all:** the Blender MCP server isn't added to Claude. Ask: "The Blender MCP isn't added to Claude Code." Text: *add the Blender MCP server (`claude mcp add ...` or Claude's Connectors settings), then start a new session (MCP servers load at start)*. Options: **Build these in Studio by parts this time** (recommended) / **I'll add it and start a new session**.
- **"Cannot connect to Blender at localhost:9876"** (or any connection error): ask "Blender isn't connected. Open it and start the MCP add-on?" Text, as steps:
  1. Open Blender and keep it open (you watch the build there).
  2. Edit › Preferences › Add-ons (or Get Extensions) → search "MCP" → tick the add-on to enable it.
  3. In the 3D Viewport press **N** → the add-on's **MCP** tab → start the server / Connect (port 9876).
  4. Pick "Opened, check again".

  Options: **Opened, check again** (recommended: call `get_objects_summary` again) / **Build these in Studio by parts this time**. Fails a second time: say what the error says and ask again; never fall back on your own.
- **Connected:** the scene may hold the user's own work. Never delete or change objects you didn't make; the `blender-builder` puts its models in its own collection.

**Upload key** (Blender models are uploaded with Roblox Open Cloud): run `powershell -File scripts/upload-model.ps1 -Check`. It makes `.env` if it's missing (gitignored) and prints `ok` or which values are missing; it never prints the key. Each missing value is **asked from the user** in this same round, never skipped or guessed:
- **Upload account** (`ROBLOX_CREATOR_ID` missing, or `-Check`'s creator isn't the place's owner): read the place's owner and the signed-in user in one `execute_luau` (`game.CreatorType`, `game.CreatorId`, `game:GetService("StudioService"):GetUserId()`). Recommend **the place's owner**: models and their textures must belong to the same owner as the game, or they may not load in live servers. Ask "Upload Blender models to which account?" Options: **<Group name or "Your account"> (<id>), owns this place** (recommended) / the other one. Write it with `powershell -File scripts/upload-model.ps1 -SetCreator <id>` (add `-Group` for a group). A group needs a key made on **the group's** API Keys page.
- **`ROBLOX_API_KEY` missing:** ask "No Roblox API key found. Add one to `.env`?" Text, as steps:
  1. create.roblox.com → Dashboard → **Open Cloud** → **API Keys** → **Create API Key** (for a group: the group's API Keys page).
  2. Access Permissions → add **Assets** → **Read** and **Write**.
  3. Security → Accepted IP Addresses: your IP, or `0.0.0.0/0`.
  4. Create, copy the key, and paste it after `ROBLOX_API_KEY=` in the `.env` file at the repo root. Save.
  5. **Don't type the key into this question's text box or the chat**: anything typed there lands in the transcript.

  Options: **Added, check again** (recommended: re-run `-Check`) / **Build these in Studio by parts this time**.
- **Never read, print, edit or ask for the key in chat.** The guard hook blocks every tool from `.env`; only `upload-model.ps1` reads it. If the user pastes a key into the chat or a question's text box anyway: don't repeat, use or save it; tell them it's leaked, to revoke it (Open Cloud → API Keys) and to paste a new one into `.env` themselves, and carry on with the parts that don't need it (the Blender build) while they do.
- **Rejected later** (`401` / `403`, wrong permission or IP): stop that upload and ask the API-key question again with the API's error.
- **Values that were set come back missing:** the file was overwritten (often an editor tab with an old copy of `.env` saved over it). Ask the API-key question again; set the creator again yourself.

**Studs look** (only when `Studs variants: **on**` in `references/ART_STYLE.md`; off → skip this check, and `place.luau` leaves the variants off by itself): `execute_luau` checks that `MaterialService.Studs` holds the variants (they come from Rojo, `ASSETS_GUIDE.md`). Missing: check Rojo (`curl -s localhost:34872/api/rojo`) and ask the user, in this same round, to start `rojo serve` and connect the plugin. Options: **Started and connected** (recommended: check again) / **Place them without the Studs look this time**.

## 3. The checklist

Before starting any builder, add the models to the task's checklist (WORKFLOW_GUIDE.md, Checklist) and show the user the same table in your reply:

| Model | Method | Agent | Status |
|---|---|---|---|
| Tree | Blender | blender-builder | Building |
| Stall | Studio by parts | studio-builder | Building |
| Coin | Library (`Library.Props.Coin`) | studio-builder | Building |

Status moves **Building → Review → Approved → Uploaded → Placed** (Studio-by-parts models: Building → Review → Placed). Tick a model only once it's placed and checked in Studio. Both agents go in the agent roster. In GDD builds this table is the run's rows of `docs/ASSETS.md` (by row number), and each status change is written there too.

## 4. The loop

1. **Start the builders in one message, in the background:** the `studio-builder` for Studio models (`STUDIO_GUIDE.md`) and the `blender-builder` for Blender models (`.claude/agents/blender-builder.md`; `model: "sonnet"`, many or detailed hero models `model: "opus"`, `effort: "high"`). The Blender brief: each model with its kind, target size in studs and where it goes in the place (Place Layout), the references and images the user sent, what the user said about the look, the `-- STUDIO:` config key each one fills, and the task name (`<Task>`, for its folders). Do code and configs meanwhile.
2. **Reviewer rounds** (every model with reference images or a style pack, section 7): start the `model-reviewer` (`model: "sonnet"`) with the compare sheet, the render, the pack's `STYLE.md`, the model's requirements and the last verdict. **FIX** → `SendMessage` the fix list to the same builder and review again; at most 2 rounds, then go on with what's left listed. **PASS** → the user review. Log each verdict in the checklist.
3. **Blender review:** the agent builds, checks and renders each model, then reports. Show the renders (`build/blender/<Task>/renders/<Model>.png`, view them and send them with `SendUserFile`) and ask with the question tool: **Looks good, export & upload** (say it uploads the model and its textures to <the upload account>; a model already uploaded is updated as a new version, its id stays) / **Change some things** (plus the open issues the agent listed). Several models: one question per model, or one with "All good" / "Change some" when they're similar. The user can also look in Blender itself.
4. **Changes:** `SendMessage` them to the **same agent**, then back to 2. With a style pack: feedback the user gives that would apply to every model in the style (or the same feedback twice) is offered once as a **Learned rule** for its `STYLE.md` (question: **Add as a rule** / **Just this model**); only the user's picks are added.
5. **Approved:** `SendMessage` "approved: <models>" (only the approved ones). The agent exports, uploads, inserts, cleans up and places each one in Studio and reports its asset ids and paths. **Never export or upload a model the user hasn't approved.**
6. **Packages** (multi-place games, models the user picked as one): ask the user to make it a package now (section 5, "Packages", step 1), then `SendMessage` the agent "packaged: <Model>, <copies and spots>" so it places the copies.
7. **Finish:** show the agent's in-Studio screenshot, write its `-- STUDIO:` paths into the configs, add each model to the "Blender assets" table of `references/ART_STYLE.md` (add the table after "Generated assets" if it's missing: Model, Asset id, Package, Source, Size / triangles, Where; Package is the package id or "-"), tick the checklist, and tell the user to save the place (and that the `.blend` files are in `blender/`).

## 5. Building in Blender (the builder's rules)

**Files**
- `blender/<Model>.blend`: the source, one file per model, saved by the agent after each build or fix pass (tracked in git, so a model can be changed later). Never save over a file the user didn't make.
- `build/blender/<Task>/`: exports (`<Model>.fbx`), baked textures (`<Model>_<Part>.png`) and renders (`renders/<Model>.png`). `build/` is gitignored.

**Scene**
- Metric units, **1 Blender unit = 1 stud** (a character is 5 units tall). Build each model in its own collection named like the model, centered on the origin, standing on Z = 0 (Blender is Z-up; the FBX export turns it Y-up for Roblox).
- Object names: the model is a parent Empty named `<Model>` (PascalCase); its meshes are named by **surface** (`Trunk`, `Leaves`, `Walls`, `Roof`, `Trim`), each becoming one MeshPart.
- Apply scale and rotation before export; no modifiers left unapplied, no n-gons that triangulate badly, normals facing out.

**Look** (from `references/ART_STYLE.md` and the brief, like every build)
- The palette, shape language ("Detail") and proportions; size from the Scale table; triangles under the Detail table's budget for the kind (and under 20,000 per mesh, Roblox's MeshPart limit).
- **One mesh per surface type**, so the Studs look works: Studio puts the `MaterialService.Studs` variant on each surface part by the "Surface texture" table, the same as part-built models. A surface with a variant gets a flat palette color in Blender (Studio replaces it with `Color` + the variant).
- **Baked textures** only on the surfaces the table skips (organic detail, faces and markings, anything whose color carries meaning): give the mesh a material that colors it (procedural nodes are fine), then `bake.py` (below) bakes it to a square image of at most 1024 px, `<Model>_<Part>.png`. The texture travels inside the FBX and Roblox makes it the part's `TextureID`, owned by the same account as the model.
- A mesh that covers part of another (moss, paint, trim) follows its shape as connected patches with soft edges, never scattered single triangles that look like holes.
- Avoid what ART_STYLE's "Avoid" lists; never copy another game's art, logos, names or text.

**The scripts** (`.claude/blender/`). Every step below except building the shapes is a ready-made, tested script. Never rewrite one; if one fails, report its error. The Blender ones run inside Blender from one short `execute_blender_code` call (Blender reads the file itself), with their settings as `init_globals`:
```python
import runpy
R = r"<repo root>"
result = runpy.run_path(R + r"\.claude\blender\check.py", init_globals={"MODEL": "MossyRock", "BUDGET": 2000})["result"]
```

| Script | Settings | Does |
|---|---|---|
| `check.py` | `MODEL`, `BUDGET` | Size in studs, triangles per mesh, materials, UVs, and an **issues** list (root Empty, unapplied transforms, modifiers, base not on Z = 0, not centered, over budget or over 20,000 per mesh, names not PascalCase). Fix every issue before rendering. |
| `bake.py` | `MESH`, `OUT`, `SIZE` | Smart UV (if none), bakes Diffuse color with Cycles, saves the PNG and wires it into the material. |
| `render.py` | `MODEL`, `OUT`, `VIEWS` | The review PNG: 3/4 front and side view side by side (960×540 each), with a `RenderRig` collection (camera, sun, ground) that's never exported, Standard colors so the palette comes out true. `VIEWS` = other `(azimuth, elevation)` pairs (0 = front); a view from below (negative elevation) needs `TRANSPARENT = True` (no ground). |
| `compare.py` | `MODEL`, `REFS`, `OUT` | The reviewer's sheet: each reference image (up to 4, with its `view`) next to the model rendered from the same view and a silhouette overlay with a rough match score, then the back, top and side. |
| `checkpoint.py` | `MODEL`, `MODE`, `PATH` | `save`: the model as `build/blender/<Task>/checkpoints/<Model>_<n>.blend`, textures packed inside. `restore`: swaps only that model's collection back to the saved one (rollback after a pass that made it worse). |
| `kits/voxel.py` | `SPEC`, `OUT`, `BUDGET` | The voxel kit: builds a voxel-art model (one `Body` mesh plus a painted atlas PNG) from a table of shapes and pixel-art decals. The table format is in its header. |
| `save_model.py` | `MODEL`, `PATH` | Saves that one model as `blender/<Model>.blend`, leaving the open scene as it was. |
| `export_fbx.py` | `MODEL`, `PATH`, `EMBED` | The FBX with the tested settings: 1 unit = 1 stud comes through 1:1, the axis fix baked in so parts arrive upright. `EMBED = True` when the model has a baked texture (puts it inside the FBX). |
| `reimport_check.py` | `MODEL`, `PATH`, `EMBED` | Imports the FBX back, compares mesh names, triangles, size, upright axis, normals and the embedded texture with the model, removes what it imported. Its `issues` must be empty before the upload. |
| `place.luau` (Studio) | its `CONFIG` table | Read the file, replace `__CONFIG__` with the model's table (format at its top) and pass the text to `execute_luau`. Unwraps the package, squares the model up (`insert_asset` turns it), sets PrimaryPart and a base-center pivot, anchors, removes scripts, Studs variant + palette color per surface part (clearing textures there), keeps baked textures, `ScaleTo` if the height is off, places it on the ground at its spot. Returns a summary. |
| `swap.luau` (Studio) | its `CONFIG` table | Updates every marked copy of a model to its new version, keeping each copy's look, children, spot and size (section "Copies and updates" below). |

**Stages:** blockout (the big masses at the right proportions) → parts (limbs, ears, props) → details (faces, decals, finish), with a `checkpoint.py` save after each. Placed primitives are a blockout, never a finished model.

**Check before reporting:** `check.py` (fix its issues), then `render.py` into `build/blender/<Task>/renders/<Model>.png` and look at it, plus `compare.py` into `renders/<Model>_compare.png` when there are reference images. Judge against the brief from every view (back and top too): size, proportions, palette, floating or clipping pieces, holes, shading artifacts. Fix and re-render; at most 2 fix passes, then report what's left. Then `save_model.py`. (`render_viewport_to_path` ignores its output path: don't use it.)

**Fix passes** (the reviewer's or the user's): one change per fix item, nothing the verdict lists under Keep; **REGRESSED** → `checkpoint.py` restore to the last good one, then a different fix.

**Export and upload (after approval only)**
1. `export_fbx.py` to `build/blender/<Task>/<Model>.fbx` (`EMBED = True` if it has a baked texture), then `reimport_check.py` on it: its issues must be empty before the upload.
2. Upload: `powershell -File scripts/upload-model.ps1 build/blender/<Task>/<Model>.fbx -Name <Model>` prints `assetId=<id>` (it waits for Roblox to process it). **A model already in ART_STYLE "Blender assets"** (a fix after it was placed): `... <Model>.fbx -Update <its asset id>` uploads a new version and keeps the id. An error: report it as is; `401` / `403` goes back to the main agent (the key question, section 2).
3. Textures need no upload step: they're in the FBX. (A texture made outside the model can go up the same way: `upload-model.ps1 <file>.png -Name <Name>`, same owner as the model. Never `upload_image` for model textures: it uploads to the signed-in user, not the place's owner.)

**Into Studio:** `get_studio_state` (Edit mode), `insert_asset` the id, then `place.luau` with the model's config: `Surfaces` lists every part (`Variant` + `Color` for surface parts, `Texture = true` for baked ones, `Decor = true` for parts nothing touches). Its `noSurfaceConfig` list must come back empty. Wait a few seconds for the variants, then one `screen_capture` of it in place.

**Copies and updates** (every Blender model). Every Open Cloud model upload is a package on Roblox's side (can't be turned off); `place.luau` always removes that link, so copies in the place are plain models. Claude keeps them in step itself, with no clicks from the user:
- **Marks:** `place.luau` tags each copy `BlenderModel` and sets the attributes `BlenderModel = <Model>` and `BlenderAsset = <source asset id>`. Clones and the user's own Ctrl+D copies keep them.
- **More copies:** clone a placed copy (`:Clone()`, `PivotTo` each spot), never insert the asset again.
- **A change later:** the builder `-Update`s the source asset, `insert_asset`s it once and runs **`swap.luau`** (`Model = <Model>`). It updates **every** marked copy in the place (`Workspace`, `ReplicatedStorage.Assets`, `ServerStorage.Assets`; never `ServerStorage.Library`): each new part takes the old same-named part's look and children (prompts, attachments, lights), and each copy keeps its spot, turn, size, name, attributes and tags, so code paths to it still work. Parts in `newPartsWithoutLook` get their surface with `place.luau`'s Surfaces rules; `partsRemoved` goes in the report. Then the user saves the place.
- **Other places of the same game:** the place only changes where it's open, so a model used in several places is updated in each place in turn (the user opens it, `swap.luau` again), or made a package (below).

**Packages** (multi-place games only: `src/Places/` exists and the model goes into more than one place; ask then, in section 1's round: "Make <Model> a package, so updating it once updates every place?" **Package** / **Update each place myself**). Claude can't publish packages or set their AutoUpdate (the Studio MCP gets "not available yet" / "lacking capability RobloxScript"), so each version needs one click from the user. Tested end to end:
- **Two assets:** the source (the Open Cloud upload, `-Update`d on every Blender change) is never placed linked; the package is made by the user from the finished copy, Studs look included. Never link copies to the source: an `-Update` would push the raw upload, without the Studs look, into every auto-updating copy (tested: copies lost their variants).
1. Place one copy with `place.luau`, then ask the user (steps in the question): *right-click `<path>` → Convert to Package → name `<Model>`, owner `<the upload account>` → Submit; click the new PackageLink inside it → Properties → tick **AutoUpdate***. Read `PackageLink.PackageId` for the ART_STYLE row.
2. More copies: clone that copy; clones stay linked and keep AutoUpdate (tested).
3. A change later: `-Update` the source, `insert_asset`, `swap.luau` (it updates only the first package copy it finds), then ask the user: *right-click `<that copy>` → Publish to Package*. Every copy with AutoUpdate, in every place, follows with its Studs look (tested).

## 6. GDD builds

`/build-gdd` (Looks stage) and `/revise-gdd` pick the per-model method in their **asset list** (`.claude/skills/build-gdd/ASSETS.md`, part of the Questions step) and run section 2 (Blender and the upload key) in that same step, so nothing stops mid-build. The `blender-builder` starts in the same message as the Wave 1 builders and the `studio-builder`; code finds its models with `FindFirstChild` and a placeholder fallback until they're placed. Its renders go with the round report next to the World review (FINISH.md, "Look reviews"); on the user's approval (LOOKS.md, step 5), section 4 steps 4–5 run, and each model's asset id goes in its `docs/ASSETS.md` row (Source / id) and the World block of `docs/GAMEPLAN.md`.

## 7. Model styles (learning a look from images)

A look the user wants matched (their own art, or a pattern from another game) becomes a **style pack**: `.claude/blender/styles/<Style>/` with `STYLE.md` (measured rules) and `recipes/` (approved shape scripts), built with a shared kit from `.claude/blender/kits/` (format: `styles/README.md`). Nothing is trained: the builder reads the pack before every build, a separate `model-reviewer` judges every pass against it and the images, and every approved model and every rule the user picks makes the next build closer.
- **Make one:** the user runs `/new-model-style <Name>` on `references/<Name>/` (it measures the images, writes `STYLE.md`, builds and approves one calibration model). Suggest it when the user asks for models "in the style of" images or a game and no pack matches.
- **Use one:** `references/ART_STYLE.md` "Model styles" maps asset groups to packs. A model in such a group is built in Blender with that pack (its brief names the pack and the reference images for `compare.py`), and the pack's Studs and texture lines replace the Surface texture table for it. In the asset question, the route is **Build it in Blender (<Style> style)**.
- **The loop:** section 4, step 2: builder → `model-reviewer` → fixes to the same builder, at most 2 rounds, then the user. Rounds and verdicts go in the checklist.
- **Kits:** `voxel` (chunky voxel art with pixel-art faces). A look with no kit: build by hand and say "Kit: none" in `STYLE.md`; a new kit is a new tested script in `kits/`, only when the user asks for one.
- **Other games' art:** patterns only (proportions, shape language, finish). Reference images stay in `references/`, never in the game or an upload; creatures, names and texts are the game's own.

## Gotchas
- **Several models in one scene:** object names are global, so a second model's `Body` is `Body.001`. Leave it: `check.py` accepts it, and `save_model.py` / `export_fbx.py` save and export it as `Body` (`names.py`). Never rename other models' objects by hand.
- **`running scripts is disabled on this system`** (PowerShell's execution policy) for `upload-model.ps1`: run it as `powershell -ExecutionPolicy Bypass -File scripts/upload-model.ps1 ...` (only that process; never change the machine's policy).
- **Images downloaded from wikis may be WebP with a `.png` name** (`file` says `Web/P`): Blender reads them; convert to real PNG in Blender (load, `file_format = "PNG"`, save) so every tool can open them.
- **Mode and selection:** set Object mode and the active object and selection before each operator; operators change both. Edit mesh geometry through `bmesh` and write it back.
- **Read the API docs, don't guess:** `search_api_docs` / `get_python_api_docs` for an operator's exact arguments (Blender 5.x: check, operator arguments change between versions).
- **`execute_blender_code` needs a dict result:** end every script with `result = {...}`; a string result is refused.
- **Uploaded assets stay on the account:** deleting the model from the place doesn't delete the asset. An unchanged model is reused (its asset id is in ART_STYLE "Blender assets"), never uploaded twice; a changed one goes up with `-Update <id>` (a new version of the same asset), not as a new asset.
- **Who owns what:** the model, its embedded texture and the place should share one owner. Studio's `upload_image` always uploads to the signed-in user, so it's never used for model textures.
- **Moderation:** an asset can come back `moderation=Reviewing`; it still inserts for its owner. `Rejected`: report it.
