---
sidebar_position: 3
title: Studio, Blender and assets
---

# Studio, Blender and assets

## In Studio

With the **Roblox Studio MCP** connected, Claude:

- builds models, maps and lighting when you pick "build it in Studio" (it always asks first),
- keeps the place organized (see the Place Layout section of the [Studio guide](/ai-guides/STUDIO_GUIDE)),
- mirrors every Vide UI as an editable mockup in `StarterGui.UIPreviews`. Edit it in Studio, then say "sync the `<Name>` preview" to copy your edits into the code,
- plays the game to smoke-test builds and runs `/playtest` and `/pacing-test`.

:::warning[Save the place]
Things built in Studio aren't in git. Save the place after a build.
:::

## In Blender

With the Blender MCP add-on running, every build asks per model whether it's built in Studio from parts or in Blender. Curved and organic models fit Blender best.

- Blender models are shown to you as renders first.
- Only once you approve are they exported, uploaded to your Roblox account and placed (with the Studs look when the game has it on).
- The upload uses an Open Cloud key in a gitignored `.env` that Claude never reads.
- Sources are saved in `blender/`.

`/new-model-style` turns reference images into a style pack so later models match a look. Details: [Blender guide](/ai-guides/BLENDER_GUIDE).

## References

Put anything Claude should learn from in `references/<Name>/`: screenshots, models, places, meshes, code or notes, of any kind (style, UI/UX, game design, world, effects and audio, code). They can be yours or from other games. Then run:

```text
/new-reference <Name>
```

It writes `references/<Name>/REFERENCE.md` with exact values and patterns and a row in `references/INDEX.md`. Style references also get a UI theme. References are inspiration: builds stay consistent with them without copying them 1:1.

## The asset library

Put assets Claude should reuse in `library/` (models, map pieces, UI kits, VFX, meshes, images, code), and list Roblox asset ids and Studio paths in `library/SOURCES.md`. Then run:

```text
/new-library-models
```

It catalogs everything into `library/CATALOG.md`. Claude offers a fitting asset before building something new.

## Design patterns

`.claude/design/patterns/` holds proven solutions with their numbers, what to build them with, the usual mistakes and "Works when" checks (daily rewards, hit feedback, rebirth...). `/new-gdd`, `/new-feature`, the builders and reviewers all use them.

They start as **drafts** (hints only). Once you've reviewed one, `/new-pattern approve <Name>` makes it a rule. When two of your games agree on a tuned value, `/new-pattern review` suggests it as the new start value.
