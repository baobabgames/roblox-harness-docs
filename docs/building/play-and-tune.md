---
sidebar_position: 2
title: Play and tune
---

# Play and tune

## Tune it live in Studio

Every system's **feel knobs** (draw time, speed, recoil, reward size...) can be changed while you play:

1. Play the game in Studio.
2. In the Explorer, select `ReplicatedStorage.Tuning.<Config>`.
3. Change the knob Attributes in Properties.

Changes apply at once, in the Client or Server view, and each one prints a `[Tuning]` line in the Output. This only happens in Studio; live servers never create it.

To make a new value tunable, give its config a `Tuning = { Key = { Min, Max, Step } }` table and read the value at use time (`TuningUtil`). `SharedConfigs.Feel` is the example.

## Say what feels off

At a stage's approval step, describe it as a change: "the bow feels slow". The next round:

- reads the values you tuned live,
- finds the cause: a number, missing feedback, the controls, the code, or the design itself,
- asks what's unclear, fixes it, and logs the round in `docs/ITERATIONS.md`.

It can change gameplay code too, not just numbers. If that changes what other systems call or what's sent over the network, it updates every caller in the same round. If the design itself is the problem, it offers 2–3 concrete alternatives.

## Lessons

When a fix worked, approval suggests general lessons ("aimed shots give feedback on the client the moment you release") and asks which to save to `.claude/LESSONS.md`. Every future design and build reads that file. `/share-lessons` sends the ones you pick to the template so other games get them too.

## The feel kit

Ready-made effects so a hit, a pickup or a reward feels good from the first build. Their numbers live in `SharedConfigs/Feel.luau`, all tunable live.

| Effect | Use |
|---|---|
| Camera shake | `CameraShakeUtil.Shake(intensity)` |
| Hit pause | `HitPauseUtil.Pause(target, seconds)` |
| Floating numbers | `FloatingTextUtil.Show(value, at, options?)` |
| Rewards flying into a counter | `RewardFlyUtil.Fly("Coins", from, amount)` |
| Toasts | `ToastService.Show(text, kind?)`, or `Notify` from the server |
| Progress bar | `ProgressBar` (Gui component) |
| Guide beam to the next goal | `GuideBeamUtil.Show(target)` |
| Pitch that climbs on pickup chains | `FeelUtil.ChainStep`, `FeelUtil.PitchForStep` |

Full list in [Systems → Features index](/systems/FEATURES).

## Measure the pacing

`/pacing-test` has a bot play the built game in Studio for a few minutes, logs when each progression milestone happens (first reward, levels, unlocks, purchases), and compares it with the GDD's pacing and the economy simulator. `/build-gdd` offers it when it finishes a game with progression.
