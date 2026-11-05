---
sidebar_position: 4
title: Checks
---

# Checks

These run on every push (GitHub Actions) and can be run locally:

```bash
selene src lune
stylua --check src lune
bash scripts/typecheck.sh
lune run test
```

| Check | What it catches |
|---|---|
| `selene` | Lint: likely bugs and bad patterns in Luau |
| `stylua --check` | Formatting |
| `scripts/typecheck.sh` | Luau type errors (luau-lsp) |
| `lune run test` | Tests of pure logic (formulas, formatting, validation) outside Studio, in a few seconds |

Tests are `*.spec.luau` files in `lune/`, at the same path as the `src/` module they test. How to write one: [Testing guide](/ai-guides/TESTING_GUIDE).

## The edit hook (Windows)

Every `.luau` file Claude edits is formatted and linted automatically: syntax and lint errors go back to Claude and block, warnings come back as a note. Editing `network.blink` regenerates the network modules, and editing a project file refreshes the sourcemap.

## In Studio

Things Lune can't run (players, physics, remotes, UI) are tested in Studio with `/playtest`, and progression speed with `/pacing-test`.
