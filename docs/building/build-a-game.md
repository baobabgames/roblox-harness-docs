---
sidebar_position: 1
title: Build a game
---

# Build a game from a GDD

A **GDD** (game design doc) is a Markdown file in `docs/gdd/` describing the game's systems. `/build-gdd` builds it in four **stages**, in order.

## 1. Design it

Write your GDD, e.g. `docs/gdd/MyGame.md`, or let Claude design it:

```text
/new-gdd a tycoon where you run a bench factory
```

`/new-gdd` asks what you want, offers to research comparable games and how each core mechanic can be built on Roblox, and you pick and approve. It writes the core feel, full content counts, an economy checked by the simulator, and offers a `design-critic` pass.

Writing your own? Follow `.claude/skills/new-gdd/GDD_TEMPLATE.md`:

- a **Stages** section (what's MVP, Looks and Polish),
- one section per system (what it does, its numbers and rules),
- an **Out of scope** list so the plan has a clear edge.

Then `/new-gdd check docs/gdd/MyGame.md` runs the same research and fills in what's missing, with your OK.

:::tip[No idea yet?]
`/game-ideas` brainstorms 8–10 short ideas across genres, scored, with a shortlist. The pick goes to `/new-gdd`, and every idea is kept in `docs/ideas/`.
:::

## 2. Build it in stages

```text
/build-gdd MyGame
```

Only you can start it; Claude never runs it on its own. With no name it resumes the game in progress, or lists the GDDs and asks which.

| Stage | What it builds | Time |
|---|---|---|
| **1. MVP** | Every gameplay system in the GDD, playable end to end, in simple placeholders: Plain UI and simple Studio-part builds. You're told they're placeholders | 1.5–3 h for round 1, 10–30 min per change round |
| **2. Looks** | The real look on the same structure: world and builds, models, UI style. One focus, or all three at once (their agents work in parallel) | 1–2 h per focus |
| **3. Polish & UX** | Onboarding, clarity, feedback, sounds, progression tuning, monetization, social. The reviewer's ideas plus your own | 1–2 h |
| **4. Wrap-up** | Full docs, a how-it-works summary, both or neither | ~15 min |

:::note[A fresh session per stage]
Everything carries over through the docs, so start a new Claude session for each stage. It costs far fewer tokens.
:::

## 3. Every stage is a loop

```text
questions ──► build ──► review & explain ──► your approval ──► next stage
    ▲                                              │
    └──────────── "I have changes" ◄───────────────┘
```

Only your approval moves the build on. "I have changes" starts another round.

### What one round does

1. **Review.** Reads the GDD, `docs/GAMEPLAN.md`, `docs/ITERATIONS.md`, `docs/FEATURES.md` (so it reuses player data, Gui, monetization...), the guides that apply, your matching references and the library catalog. A change round also reads the feel knobs you tuned live.
2. **Questions.** The read-only `gdd-reviewer` agent turns the GDD (or your change) into questions, each with options and a recommended one. Claude asks them all, then shows a short **build summary** (what's built, what stays placeholder, the agents, the time). You pick **Build it** or **Change something**. Nothing is built before that.
3. **Build.** The plan splits the round into systems, each with:
   - **Does / Depends on:** what it's for, and what it reuses
   - **Includes / Quality / Left out:** the features, what makes each feel finished, and what waits
   - **Feel knobs:** the numbers that decide how it feels, which you can change live while playing
   - **Contract:** the functions, events and data other systems may use. Because every contract is agreed up front, systems can be built **at the same time**
   - **Touches / Assets / Size:** the files it adds, the assets it needs, Simple or Complex

   Then it builds in **waves**: Wave 0 lays the foundation (shared files, contract stubs, UI style); Wave 1 builds every other system in parallel while Claude builds the world in Studio; Wave 2 only if a system needs another's finished behavior. A `system-builder` agent per system writes it and checks its own work. After each wave: lint, tests, a Rojo build, and a check that no stub is left.
4. **Review & explain.** With Studio connected it plays the game once, then `feature-reviewer` (code) and `gdd-reviewer` (does it match the GDD and your answers?) check it. Problems go back to the same builder. Then the report: what was built and how to play it, the knobs to tune, issues and ideas, the defaults it picked, the time, and a status table:

   | Status | Means |
   |---|---|
   | **Works** | Built and passed review |
   | **Stubbed** | Exists but doesn't do the real thing yet; the report lists what it needs |
   | **Failed** | Still failing after the fix rounds; the report lists the open problems |

5. **Approval.** Approve the stage, give changes, or play it first. On approval it asks which lessons to keep in `.claude/LESSONS.md` (only the ones you pick). If the project file changed, restart `rojo serve`; if it built in Studio, save the place.

Commit whenever you like with `/better-commit`. The build skills never commit.

## Build log

On the first run, `/build-gdd` asks whether to record time, token usage and issues in `docs/gdd/<Name>.buildlog.md`, to help improve the harness. Say no and nothing is recorded.

## Running `/build-gdd` again

- **Game in progress:** it resumes at its stage and step.
- **Game already built** (`Stage: Done`, or an adopted or imported game): it refuses. Use [`/revise-gdd`](change-your-game.md) to change it, or start a new GDD from a fresh copy of the template.
