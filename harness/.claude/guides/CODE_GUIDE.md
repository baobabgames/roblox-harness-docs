# Code Guide

The rules every piece of game code follows: priorities, Roblox best practices, what runs on the client, and reusing what exists. Read it before writing or reviewing any code. Code style, the player data flow and code gotchas are in `.claude/rules/luau-code.md` (loads by itself with Luau files); where things go is in `PROJECT_GUIDE.md`.

## Priorities
- Optimization first, readability second: avoid per-frame allocations, repeated `FindFirstChild` / `require` in hot paths, and loops over all players when an event works.
- Keep code flexible so it is easy to expand (values in configs, not hard-coded).

## Roblox Best Practices
- **Current APIs only:** `task.wait / spawn / defer / delay`, `game:GetService`, `:Connect`, `workspace:Raycast`, `Humanoid.Animator:LoadAnimation`, constraint movers (`LinearVelocity`, `AlignPosition`). Never `wait`, `spawn`, `delay`, `tick` or other deprecated APIs (`migration-helper` updates old code). Unsure → check create.roblox.com/docs.
- **Server authority:** the server owns game state, rewards and data. Server-only code and assets live in `ServerScriptService` / `ServerStorage`, never `ReplicatedStorage`. Validate every remote.
- **Events, not polling:** events and `GetPropertyChangedSignal`, not `while true do task.wait()`. Per-frame work goes through `LoopService` (or `RunService` events) and stays light.
- **Clean up:** `Destroy` what you create, disconnect connections (Janitor), clear per-player state when the player leaves.
- **Yielding calls:** wrap `*Async` web calls in `pcall` and handle failure. Saved data only goes through the `Player` feature, never `DataStoreService` directly.
- **Instances:** Attributes and `CollectionService` tags, not name parsing or value objects. Anchor static parts; set network ownership for server-driven moving parts.
- **Client and streaming:** client code never assumes a `Workspace` part exists: `FindFirstChild`, `WaitForChild` with a timeout, or `CollectionService` signals.
- **Inputs on PC and mobile:** every input works on PC and mobile (on-screen touch button, or a tap when aimed at the screen) without being asked; console only when asked. Never raw `UserInputService` key checks. Details: `INPUT_GUIDE.md`.
- **Text from players:** filter it with `TextService` / `TextChatService` before other players see it.

## Visuals on the Client
- Visuals run on the client unless the user says otherwise (particles, cosmetic tweens, sounds, UI, camera, highlights, number pop-ups, screen shake). The server decides **what** happened; the client decides **how it looks**. Only gameplay-relevant things (hitboxes, collisions, physics, rules) stay on the server.
- **When everyone must see it:** one small Blink event per feature to all (or nearby) players with just an effect name plus a position or instance (e.g. `PlayEffect { Name, Position }`), or for lasting state a replicated Attribute / CollectionService tag clients watch. Example: `MonetizationService.Celebrate` fires `ConfettiNotification`, `MonetizationController` rains confetti.
- Effect settings live in the feature's config; clients play them with `ParticleUtil.EmitParticles`, `TweenUtil`, `SoundsService.PlaySound`.

## Reuse Before Writing
- `docs/FEATURES.md` indexes every feature, Service, Util, Component and public function. Before writing a new one, grep it for the area (don't read it whole) and reuse or extend what exists.
- Each feature has `docs/<Feature>.md` (Core: `docs/Core.md`). Read the relevant section before changing that feature.
- After adding, removing or changing a public function, update its line in `docs/FEATURES.md` and its feature doc. A new feature gets a doc (`doc-writer` agent) and an index row.
