# Testing Guide

Lune tests run game code outside Studio, in a few seconds. Use them for **pure logic**: formulas (costs, rewards, XP curves, drop rates), formatting, validation rules, config checks. Anything that needs the running game (players, remotes, physics, data saving, UI) is tested in Studio with `/playtest`.

```bash
lune run test               # every test
lune run test NumberUtil    # only test files whose path contains "NumberUtil"
lune run test --verbose     # also a PASS line per file
```

It prints each failing file with expected / got and the line, then one summary line (`Tests: 212 passed, 0 failed`), and exits 1 if anything failed. A passing run is one line, so checks stay cheap for builders; `--verbose` lists every passing file too.

## Writing a test

- One file per module, in `lune/` with the same path as in `src/`, ending in `.spec.luau`:
  `src/Core/Shared/SharedUtilities/NumberUtil.luau` → `lune/Core/Shared/SharedUtilities/NumberUtil.spec.luau`
- `lune/` is never synced to the game (Rojo only maps `src/`). It also holds the runner and tools, which are not tests: `test.luau`, `read-model.luau`, `economy-sim.luau`, the GDD build tools (`gdd-contracts.luau`, `check-tuning.luau`, `gameplan-check.luau`, `apply-tuning.luau`), `import-place.luau`, `lib/`.
- **Tests of the tools in `lune/`** (e.g. `lune/lib/ImportPlace/Codemod.spec.luau`, next to the tool) get a `Lune` global with the real Lune libraries, since their `require` only loads game modules: `Lune.fs`, `Lune.process`, `Lune.serde`, `Lune.roblox`, and `Lune.require("./lib/ImportPlace/Codemod")` (resolved from `lune/`). Files they write go in a folder of their own under `build/`, removed at the end.
- Require modules exactly like game code does, through `game`:

```lua
local SharedUtilities = require(game.ReplicatedStorage.SharedUtilities)

local NumberUtil = SharedUtilities.NumberUtil

describe("FormatWithCommas", function()
	it("adds a comma every 3 digits", function()
		expect(NumberUtil.FormatWithCommas(1234567)).toBe("1,234,567")
	end)
end)
```

- Test names say what should happen, in plain words ("refuses reserved keys").
- Test the rules and the edges: zero, negative, max level, can't afford, wrong type from a client.
- A test asserts what the code **should** do. If the code is wrong, report it; never write a test that locks in a bug.

## Globals in test files

| Global | What it does |
|---|---|
| `describe(name, fn)` | Groups tests (can nest) |
| `it(name, fn)` | One test. It may yield (`task.wait`) |
| `expect(value)` | `.toBe(x)`, `.toEqual(table)` (deep), `.toBeCloseTo(n, places?)`, `.toBeNil()`, `.toBeTruthy()`, `.toBeFalsy()`, `.toThrow(text?)` (value is a function); `.never.` flips any of them |
| `Mocks.SetStudio(bool)` | `RunService:IsStudio()` (default false) |
| `Mocks.SetContext("Server" \| "Client")` | `RunService:IsServer()` / `IsClient()` (default Server) |
| `game`, `workspace`, `Enum`, `task`, `Vector3`, `UDim2`, ... | As in Roblox |

## How it works

- Every test file gets a **fresh** fake `game`, built from a sourcemap Rojo makes for each run (in the gitignored `build/`, so parallel runs never clash), fresh modules and reset mocks. Changing a config table at the top of a test file (before requiring the module that reads it) only affects that file. Example: `InputUtil.spec.luau`.
- Files: `lune/test.luau` (runner), `lune/lib/Loader.luau` (fake game, `require`), `lune/lib/Expect.luau` (describe / it / expect), `lune/lib/Mocks.luau` (fake services).

## Limits

- **No running game:** Lune Instances have no behavior. Only the methods in `Mocks.luau` work (`RunService:IsStudio / IsServer / IsClient`, `Players:GetPlayers` → `{}`, `WaitForChild`). A module that needs more at require time needs a mock added there first.
- **No `DateTime`.** Code using it is tested in Studio.
- **String requires don't load** (`require("@self/x")`, used by some packages such as Ripple). Pure-logic modules shouldn't need packages.
- **Lune can't parse `const` yet.** Game and test files are rewritten to `local` when they load, so use `const` as usual there. The runner and tools (`lune/test.luau`, `lune/read-model.luau`, `lune/lib/`) must use `local`.
- `Enum.X:FromName` is missing in Lune; the loader rewrites it to a helper with the same behavior.
