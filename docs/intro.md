---
sidebar_position: 1
title: Introduction
slug: /intro
---

# Roblox Harness

The Roblox Harness is a Roblox game template built with [Rojo](https://rojo.space) and Luau, set up to be developed with [Claude Code](https://claude.com/claude-code). It gives every new game two things:

- **Working foundations.** Ready-made, tested systems with no game-specific content: player data, monetization, onboarding, cutscenes, leaderboards, input, UI, developer tools and analytics. See [Systems](/systems/FEATURES).
- **A way of working with Claude.** Skills (slash commands like `/new-gdd` and `/build-gdd`), specialist agents, rules and guides that take a game from an idea to a built, reviewed game, with you approving every step.

## How a game gets made

```text
idea ──► /new-gdd ──► GDD ──► /build-gdd ──► MVP ──► Looks ──► Polish & UX ──► Wrap-up ──► /revise-gdd
                                                    (each stage: questions → build → review → your approval)
```

1. **Design it.** Write a game design doc (GDD) yourself, or let `/new-gdd` turn your idea into one.
2. **Build it.** `/build-gdd` builds the GDD in four stages. Every stage asks its questions first, builds, reviews its own work, explains it, and only moves on when you approve.
3. **Change it.** Once the game is done, `/revise-gdd` makes every later change with the same loop.

Already have a game? You can [adopt or convert it](building/existing-games.md).

## What's in this site

| Section | What it is |
|---|---|
| **Guide** (this section) | Written for people: setting up, building a game, changing it, and every skill and agent |
| **[Systems](/systems/FEATURES)** | The template's built-in systems, function by function. This is the same Markdown Claude reads in `docs/`, shown as it is |
| **[AI guides](/ai-guides/WORKFLOW_GUIDE)** | The rules Claude follows, from `.claude/guides/`, shown as they are. They're written for Claude, so they're terse, but they're the real source of how the harness behaves |

:::tip[Your design wins]
The GDD and your answers always win. The harness's guides, patterns and defaults are suggestions that keep quality up when you haven't said otherwise.
:::
