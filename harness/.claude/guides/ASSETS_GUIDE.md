# Assets Guide

Read this before design, UI, world, effects or game-design work, and before using or asking about assets. The short rules come first; the sections after them are the detail.

## References and Library (short rules)
- **References** (`references/INDEX.md`): read the index before that kind of work and use a matching reference when unsure. Order: user in chat → a reference's My rules → `.claude/LESSONS.md` → approved design patterns → the reference → your judgment. Inspiration, not copies (unless the user says to match exactly); from other games take patterns and numbers, never art, logos, names or text.
- **Reference check:** before new or redesigned UI, world areas, models, effects or game design, ask whether there's anything to point to or send (matching references, library assets and builds as options), in the task's question round. `**Reference check:**` in `references/INDEX.md` can change that default (not set yet → also ask which default to save). Details: "Reference check" below.
- **Library** (`library/CATALOG.md`, synced read-only into `ServerStorage.Library`): search it before building a model, map piece, UI, effect or sound. Always use a **copy** with scripts removed.
- Unprocessed files in `references/` or `library/`: tell the user and suggest `/new-reference <Name>` / `/new-library-models`. Never run them yourself.
- **Studs look, a per-game choice (off by default):** `/build-gdd`'s Looks stage asks. On (`Studs variants: **on**` in `references/ART_STYLE.md`): world and prop builds use the `MaterialService.Studs` variants (code: `MaterialUtil.Apply`). Off: nothing gets a variant, even though Rojo still syncs them into `MaterialService`; the look comes from the game's own references.

## Missing Assets
- When something new needs an asset the user didn't give (model, part, map location, sound, animation, image / icon id, UI art, gamepass / product id, or an instance expected in Studio), **ask before building**, once for everything missing. In `/build-gdd` and `/revise-gdd` that's the **asset list** (`skills/build-gdd/ASSETS.md`): automatic Placeholder rows in the MVP, then one numbered list with a suggested route per asset in the Looks stage's questions, revised until approved, kept in `docs/ASSETS.md`. First check Studio (`list_roblox_studios`) and `library/CATALOG.md`. Per asset, offer:
  - **Use <Asset> from the library** (only when a catalog asset fits; recommend first; up to 2 options)
  - **Build it in Studio** (Studio connected; visible things, built by parts). Recommended over AI when no library asset fits; blocky and architectural models.
  - **Build it in Blender** (models only; recommended for curved, organic or detailed ones; approved in Blender, then uploaded to the user's account; `.claude/guides/BLENDER_GUIDE.md`)
  - **Generate with Roblox AI** (Studio connected; only what parts can't do well: organic shapes, detailed meshes; in the `references/ART_STYLE.md` style)
  - **Placeholder in code**
  - **Wait for mine** (in `/build-gdd` and `/revise-gdd`: **mine later**, built with a placeholder now)
- Sounds, animations, uploaded images and gamepass / product ids only get the last two. Never use a library asset, build in Studio or Blender, insert Toolbox assets or generate with AI without the user picking it. Never invent asset ids or assume an instance exists.
- Plain UI (the default, `UI_GUIDE.md` 4b) needs no icons or UI art: it uses text labels, so don't ask for them unless the user asked for a styled UI.
- Art drawn in an approved Figma design (`.claude/ui/FIGMA.md`) is the user's asset: it's uploaded with `upload_image` and only the ids it returns are used.
- Placeholders: in the feature's config with `-- PLACEHOLDER: <what's needed>`, stand-ins named `Placeholder<Name>`, real asset found with `FindFirstChild` and the placeholder as fallback. List every placeholder at the end (and under "Stub needs" in `GAMEPLAN.md`). Details: "Placeholders" below.

## References (`references/`)

- `references/` holds the user's references of any kind: **Style** (the look), **UI/UX** (screens, flow, feedback), **Game design** (loop, progression, economy, onboarding), **World** (builds, maps, lighting), **Effects & Audio**, **Code** (structure, frameworks, patterns). They can be the user's own or from other games.
- `references/INDEX.md` lists every reference with its kinds and what it's for. Each `references/<Name>/REFERENCE.md` holds it as text: exact values, patterns and numbers (Style ones are mirrored as a theme in `SharedConfigs/Themes.luau`).
- **When to use them:** before any design, UI, world, effects, game-design or structure work, read `INDEX.md` (it's short). Open a `REFERENCE.md` when its kinds or "Use for" match the task, and whenever you're unsure how something should look, play or be built, or the request leaves it open: a matching reference beats your own guess. Read only the text, never the reference files again. When asking questions, offer "like <Reference> (<what it is>)" as an option when one fits, e.g. "like PetSim99 (shop grid and buy flow)": a folder name is often just where it came from, never read it as a look or style.
- **Which wins:** the user in chat → a reference's **My rules** → the reference → your own judgment. A Code reference never overrides the harness guides' project rules unless its My rules or the user say so; point out where they differ.
- **Inspiration, not a copy:** a reference guides the work, it isn't a blueprint to rebuild 1:1. Design your own version that stays consistent with it (same feel, style, values and patterns where they fit), unless the user or its My rules say to match it exactly, or say consistency doesn't matter.
- **Other games' references:** take patterns, structure, flow and numbers, then make them in this game's own style. Never copy their art, logos, icons, names or text.
- **Style:** UI takes colors, fonts, corner radius, strokes, motion and sounds from `SharedUtilities.ThemeUtil.Get(styleName?)` (the style is the theme name in the **Theme** column of `INDEX.md`, not the folder name), never hard-coded. Unclear which style a task uses: ask, with the themes as options.
- If a reference folder has files that aren't in its `REFERENCE.md` **Files** table (or a changed one, or no `REFERENCE.md`), tell the user and suggest `/new-reference <Name>`. Never run it yourself.

## Reference check

Before designing or building something new with a look or layout, ask the user whether there's anything to point to or send.
- **When:** a new or redesigned UI screen, world area, model, VFX, game design (`/new-gdd`, a design change in `/revise-gdd`) or restyle. **Not** for a small look tweak the user already described ("make the button red", "move the sign left"), when the request already points to something, or inside an approved GDD run (its asset list round asked it: `skills/build-gdd/ASSETS.md`, section 4).
- **The saved line:** `**Reference check:**` in `references/INDEX.md` (missing = "not set yet"):
  - **Not set yet / Ask every time:** ask (below).
  - **Use matching references:** don't ask; pick the matches yourself and name them in the plan or reply.
  - **Don't ask:** don't ask; your judgment, still reading `INDEX.md` as above.
  - Whatever the line says, something the user names in the request wins. "Change the reference check to …" rewrites the line.
- **The question** goes in the task's normal question round (WORKFLOW_GUIDE.md, Ask for Details), not its own stop (except `/new-gdd`, which asks it before the concepts). "Anything to point to for <thing>?", `multiSelect`:
  - up to 3 matches, each saying what you'd take: `INDEX.md` rows by Kinds and "Use for" ("CatchAnimals: window skeleton, tabs, cards"), `library/CATALOG.md` rows, style packs (`references/ART_STYLE.md` "Model styles"), and built rows of `docs/ASSETS.md` or things already in the place ("the Shop stall in `Workspace.Map.Hub`");
  - **Nothing, use your judgment**;
  - the question's text says Other takes reference names, file paths, Studio paths or "I'll send images", and that images go in as files: put them in `references/<Game>/images/` (or give their paths), not pasted in chat (see "Reference images" below).
  - No matches: **Nothing, use your judgment** / **I'll send something** (wait for it; images as files, as above).
- **Default question:** only while the line is "not set yet", in the same round: **Ask every time** (recommended) / **Use matching references without asking** / **Don't ask, use your judgment**. Write the answer into the line.
- **The answers go into the brief** (builder, designer, or your own plan): each pick with its file path (`REFERENCE.md`, image, `.rbxm`, catalog `Where`, Studio path) and what to take from it. References stay inspiration (above), library picks are copies (below).
- **Reference images:** agents can't see images pasted in chat, and Claude can't save a pasted image as a file, so a sentence describing it is all a builder would get. Images go in as files instead:
  - Whenever the user wants to send images, ask them to put the files in `references/<Game>/images/` (`<Game>` is the game's name in PascalCase; make the folder for them) or give the files' paths, and to say when they're in. Wait for it.
  - Pasted anyway: ask once, in one line, for the same files there. Declined: describe what to take from them in the brief, as a last resort.
  - Every brief lists each image's **path** and what to take from it. The agent `Read`s the image before building and takes the palette, proportions and shapes from it; for that asset the image beats the generic palette in `references/ART_STYLE.md`.
  - The report suggests `/new-reference <Game>` to file the images as a full reference for later. Never run it yourself.

## Library (`library/`)

- `library/` holds ready-made assets of the user's (map pieces, buildings, props, characters, UI kits, icons, meshes, VFX, sounds, code): files in any subfolders, plus asset ids and Studio paths listed in `library/SOURCES.md`. `library/CATALOG.md` lists every one, one row each: kind, tags, size, look, **Where** and **Use as** (Asset / Reference / Both).
- `.rbxm` / `.rbxmx` files sync with Rojo into `ServerStorage.Library` (same folders as on disk; notes, meshes, images and code don't sync). Never edit or build in `ServerStorage.Library`: Rojo replaces it from the files.
- **Before building** a model, map piece, UI, effect or sound, search `CATALOG.md` (grep the kind and tags). A fitting Asset becomes the first Missing Assets choice.
- **The library is also a reference.** When nothing fits as is, or you build something new (in Studio, in code, or as UI), use library items of the same kind as examples for size, proportions, colors, materials, detail level, part count, UI layout and effect settings, so new work matches the user's assets. Any item can be an example, whatever its **Use as**; Reference items can only be examples. The catalog row is a summary: when you need the details, open that one asset (`lune run read-model <file>`, `render-mesh.ps1`, the image, or `inspect_instance` for ids and Studio paths), not the whole library. The user's `references/` win when they disagree.
- **Using an asset: always a copy**, never move or edit the original:
  - `Library.<path>`: clone `ServerStorage.Library.<path>` with `execute_luau`. `rbxassetid://<id>`: `insert_asset`. `studio:<path>`: clone it from the open place.
  - Put the copy where Place Layout says (`STUDIO_GUIDE.md`): `Workspace.Map.<Area>`, `Workspace.<Feature>`, or `ReplicatedStorage.Assets.<Feature>` / `ServerStorage.Assets.<Feature>` for models code clones. Code references the copy, never `ServerStorage.Library`.
  - Delete every Script, LocalScript and ModuleScript in the copy unless the user says to keep them, and say what you removed.
  - Recolor or resize only the copy, to fit the style.
  - **UI kits:** insert a copy temporarily, read it (`inspect_instance` / `execute_luau`: names, sizes, colors, fonts), rebuild it as Vide Views with UI Labs stories (`UI_GUIDE.md`, section 7), then delete the copy; its colors and fonts map to theme tokens and `references/UI_STYLE.md` (a new look: suggest `/new-reference`). **VFX:** copy the emitter template into `ReplicatedStorage.Assets.<Feature>.Effects`; the client plays it with `ParticleUtil.EmitParticles(template, { Clone = true, EmitAt = position })`. **Images, sounds, animations:** put their ids in the feature's config.
  - Mesh files, images without an id and code are Reference only: build from them, or ask the user to import / upload them (see `library/README.md`).
- If `library/` has files (or `SOURCES.md` rows) that aren't in `CATALOG.md`, or changed ones, tell the user and suggest `/new-library-models`. Never run it yourself.

## Asset list (GDD builds)

`/build-gdd` and `/revise-gdd` don't ask about assets one by one. The MVP writes every asset as a Placeholder row on its own; the Looks stage (and a `/revise-gdd` change that needs assets) shows **one numbered list** of every asset the round needs in its Questions step, each with a suggested route (a library asset found in the catalog, Studio by parts, Blender, Roblox AI, placeholder, mine later) and why, and revise it until the user approves (`.claude/skills/build-gdd/ASSETS.md`). The approved list is kept in `docs/ASSETS.md`: route, source or id, where it goes, config key and status of every asset, across stages. Before changing or replacing an asset in a built game, read its row there; a swap updates the row.

## Studs surface look (a per-game choice, off by default)

`library/Studs.rbxm` is a folder of SmoothPlastic `MaterialVariant`s (Stud, Small Stud, Big Stud, Diamond Stud, Inlet, Universal, Weld, Glue): the classic Roblox studded look.
- **How it gets in:** MaterialVariants only work under `MaterialService`, so `default.project.json` maps the file straight to `MaterialService.Studs` (it also syncs to `ServerStorage.Library` like every library file; that copy does nothing). No copy step. Removing or moving the file means updating that mapping, or `rojo build` fails.
- **When it applies:** only when the game has it on (`Studs variants: **on**` in `references/ART_STYLE.md`, set by `/build-gdd`'s Looks stage; the template ships it off so a game's look comes from its own references). Then on every Studio build (`/build-gdd` World, `/revise-gdd`, any world or prop build) and on parts code builds (`MaterialUtil.Apply(part, surface)`).
- **Blender models too:** they're split into one MeshPart per surface type, and Studio puts the variant on each surface part the same way; only the parts the table skips keep a baked texture (the `TextureID` that comes inside the FBX). See `.claude/guides/BLENDER_GUIDE.md`, section 5.
- **When it doesn't:** `Studs variants: **off**` in `references/ART_STYLE.md` (the default), the active style says so (a World / Style reference's **My rules**), or the user asks for no studs or smooth surfaces.
- **Changing it:** the user asks for studs (or for none) in chat, a GDD or a question round. When it sounds general, ask whether to save it as the game's default (WORKFLOW_GUIDE.md, "Setup choices can be saved"); saved → `Studs variants: **on|off**` in ART_STYLE and `SharedConfigs.World.UseMaterialVariants = true|false`, always both. Clearly one thing → that build's brief or ART_STYLE "Exceptions", no question. Off means no Studs variant on anything, even though Rojo keeps syncing them into `MaterialService.Studs`. Never ask about it in the question round unless a reference contradicts it.
- **Which variant:** by surface type, from the "Surface texture" table in `references/ART_STYLE.md` (code: `SharedConfigs.World.MaterialVariants`; keep the two in step).
- **Skip:** text and sign boards, Glass, Neon, ForceField, transparent or invisible parts, and anything whose color carries meaning (items, fruit, rarity, mutations). Applying sets `Material = SmoothPlastic` first (the variants are SmoothPlastic-based).
- **Check:** variants take a few seconds to load; take the verification screenshot after that, not right away.

## Building in Blender

When the user picks **Build it in Blender** for a model, follow `.claude/guides/BLENDER_GUIDE.md`: the `blender-builder` builds it in the ART_STYLE style, the user approves the render, then it's uploaded with its baked textures to the place owner's account through Open Cloud (`scripts/upload-model.ps1`), inserted, given the Studs look and placed like any Studio build. Each one is logged in ART_STYLE "Blender assets" and reused, never uploaded twice.

## Generating with Roblox AI

When the user picks **Generate with Roblox AI** (Studio connected), use Roblox Studio's generators through the Studio MCP:

| Need | Tool |
|---|---|
| A prop, item, creature, vehicle, building piece (a textured mesh) | `generate_mesh` (`textPrompt`, `size`, `maxTriangles`, `segmentation`) |
| A blocky object built from parts, with editable attributes | `generate_procedural_model` (contains a generator script: use it for world pieces, not for models code clones) |
| A surface look (ground, walls, a custom wood) | `generate_material` (returns a `MaterialVariant`; set both `Material` and `MaterialVariant` on the parts) |
| A new look for an existing mesh (a generated one that drifted, or a recolor) | `generate_texture` |
| Splitting a mesh into named parts (a door that opens, a wheel that spins) | `segment_mesh` |

**Consistent style, always** (unless the user asks for a different look for that asset):
1. **Art style first.** Read `references/ART_STYLE.md`. If its Status is "not set yet", fill it before the first generation: from the active Style and World references, then same-kind library items, then one question to the user with 2–4 style options (recommended first). Set Status to "set".
2. **Same short prompt shape every time:** `a cartoon <thing> with <one detail>, <the Style prompt, word for word>`. Keep the whole prompt short: long style prompts make every job fail. Name palette colors in words ("warm orange"), never other games or artists.
3. **Same scale and detail:** `size` from the Scale table (a character is 5 studs), `maxTriangles` from the Detail table. Similar things get similar sizes.
4. **Check it:** one `screen_capture` with the new asset next to an existing generated or library asset of the same kind. Off-style: recolor to the palette or set a palette material first (cheap), then `generate_texture` with the style prompt, then regenerate with a sharper prompt. At most 2 regenerations per asset; still off, show the user and ask.
5. **Log it** in `ART_STYLE.md` "Generated assets" (and in "Exceptions" if the user asked for a different look).

**Before generating:** generation only works in Edit mode, so check `get_studio_state` first (stop play mode if needed).

**When a job fails:** "Auto-segmentation failed" → retry with `segmentation = "none"`. Other failures: shorten the prompt and retry once.

**After generating,** results land in `Workspace` tagged `Assistant-<id>`. Normalize each one: a `Model` with its largest part as `PrimaryPart`, renamed, anchored, collisions off, every script removed, pivot at the origin. Sizes come out arbitrary, so code scales clones with `Model:ScaleTo`, never by assuming a size. Then treat it like a Studio build and move it where Place Layout says (`STUDIO_GUIDE.md`): `Workspace.Map.<Area>`, `Workspace.<Feature>`, or `ReplicatedStorage.Assets.<Feature>` / `ServerStorage.Assets.<Feature>` for models code clones. Its path goes in the feature's config with a `-- STUDIO:` comment, found with `FindFirstChild` and a placeholder fallback. Tell the user to save the place.

**Fast:** generations are slow. Start them with `async = true`, at most ~4 jobs at once, do other work meanwhile, then `wait_job_finished` for each before placing it. Reuse a logged asset (clone it) instead of generating the same thing twice.

**Icons from meshes:** a generated model doubles as a UI icon through `ItemViewport` (a ViewportFrame). Only for icons the user didn't give and picked **Generate with Roblox AI** for (Missing Assets): generate them in the same batch as the world assets, into `ReplicatedStorage.Assets.UI.Icons`. The user's own icons and image ids always come first.

Sounds, animations and uploaded UI images aren't generated this way: they keep the other options (placeholder or the user's).

## Placeholders

When the user picks **Placeholder in code** (or "mine later"):
- Asset ids and instance names or paths go in the feature's config (`src/Core/Shared/SharedConfigs/<Feature>.luau`) with a `-- PLACEHOLDER: <what's needed>` comment, so swapping is one line.
- Stand-in instances made in code are named `Placeholder<Name>` (e.g. `PlaceholderCoinModel`: a plain Part, Frame or empty Sound) and go where the real one would (Place Layout). In `/build-gdd` and `/revise-gdd` they're simple part builds that still read: one Model at the real thing's size and silhouette, a plain material and a flat color, never a loose grey block (the MVP's placeholders, which the Looks stage swaps in place).
- Look up real assets with `FindFirstChild` and fall back to the placeholder, so the game runs before the real asset exists.
- List every placeholder at the end of the task (and under "Stub needs" in `docs/GAMEPLAN.md`, if it exists). `grep -rn "PLACEHOLDER" src` finds them all later.
