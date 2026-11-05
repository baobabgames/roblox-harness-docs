# Game Design Guide (Roblox)

How to design a Roblox game that people try, understand, enjoy and come back to. Read before any game-design work (`/new-gdd`, `/revise-gdd` design changes, the `design-critic` and `gdd-reviewer` agents). Everything here is a **recommendation**, not a rule: the numbers are starting targets, and a matching Game design reference (`references/INDEX.md`) or the user beats them.
This guide is the overview. Single systems (hit feedback, daily rewards, rebirth, eggs…) live in the **design patterns**: `.claude/design/PATTERNS.md` lists them, each with numbers, how to build it, pitfalls and "Works when" checks. Open the matching ones when a section below points to them.
Order: user in chat → a reference's My rules → `.claude/LESSONS.md` → approved patterns → a Game design reference → this guide → draft patterns and your judgment.

## The user's game comes first
The goal is to build the game the user imagines, not the game this guide would design.
- **What the user said wins.** Their idea, answers and GDD decide the mechanics, numbers, scope and feel. This guide fills only the gaps they left open; its numbers are what you recommend when you ask about those gaps.
- **Disagree once, then follow.** When something the user wants goes against this guide (a Polish system in the MVP, a very big content count, a mechanic the guide warns about), say so once in the question round: what the guide recommends, why, and the user's version as an option. Whatever they pick is built as picked and logged in Decisions; never ask again or quietly move it.
- **Never change their design to fit the guide.** No moving systems between stages, cutting counts, swapping mechanics or "fixing" their numbers unless they agreed. Checks, the `design-critic` and the `gdd-reviewer` turn findings into suggestions, not edits. There are no hard caps anywhere (section 11).
- **Never assume the game.** Don't add systems the user didn't ask for (rebirth, a shop, daily rewards). List the options and ask.
- **Reach for the guide when they leave it open** or say "use your judgment": then its numbers and patterns are the defaults, listed so the user can change them.

## Design bar for every task
Read this before building anything players see or feel, even outside game-design work. The goal is games players enjoy and come back to, not just working code.
- **Four questions:** what does the player see and hear on each input (on the client, the same frame)? What's their next goal, and is it on screen? Does it read in 1 second on a phone? What does a new player do with it alone? Gaps the request leaves open go in the question round.
- **Patterns:** check `.claude/design/PATTERNS.md` for the system. An **approved** pattern's numbers are the defaults, its "Build it with" says what to reuse, its "Works when" checks are the bar. A matching **draft** is a hint you mention, never follow silently. New ones: `/new-pattern`.
- Feel numbers (timings, shake, pop scale, cooldowns, speeds) are knobs in the config's `Tuning` table (`TuningUtil`). Use the feel kit before new code: `ClientUtilities` (`CameraShakeUtil`, `HitPauseUtil`, `FloatingTextUtil`, `RewardFlyUtil`, `GuideBeamUtil`), Gui `ToastService` / `ProgressBar`, `SoundsService` `PlaybackSpeed` / `PitchVariation`; defaults in `SharedConfigs.Feel`.
- A design problem you notice while coding (dead time, no feedback, unclear next goal, an unfair offer) gets one line at the end of the report with a fix; don't widen the task. A whole built game is judged in `/build-gdd`'s Polish & UX stage (the `gdd-reviewer` in polish mode).

## 1. What decides success on Roblox
Roblox shows games to more players when the players it already sends **stay and come back**. A design is judged on:

| Moment | What has to be true | Rough target |
|---|---|---|
| Thumbnail / title | The fantasy is clear in one glance and one sentence ("Raise dragons and race them") | A 6-year-old can say what you do |
| First 60 seconds | Core action within 5 s, a reward within 30 s | No text walls, no menus before playing |
| First session | A clear next goal always on screen; something new unlocks every few minutes | 15+ min average session |
| Day 1 / Day 7 | A reason to return: progress waiting, a streak, an unfinished goal, friends | D1 25%+, D7 8%+ is healthy |
| Weeks | Updates, events, collections, social status | Weekly or biweekly content |
| Off the servers | Rare, readable peaks players want to record and share (ClippableMoments) | A server-wide moment every few minutes; a muted 30 s clip makes sense to a stranger |

**Design for the worst case:** a young player on a phone, alone in a server, who doesn't read.

## 2. The three loops
Patterns: HitFeedback, RewardPopups, CollectFeel. Every design needs all three, one line each:
- **Moment loop (5–30 s):** the repeated action (click, swing, collect, jump, shoot, place). It must feel good on its own: sound, particle, number pop, screen kick. If this isn't fun, nothing else saves it.
- **Session loop (5–20 min):** earn → spend → get stronger → reach the next thing (area, enemy, tier, map). One clear goal at a time, always shown (a progress bar, the next price, a locked door with a cost).
- **Long loop (days):** rebirth / prestige, collections (pets, units, skins, an index), worlds, ranks, leaderboards, trading, events.

Write loops as verbs and numbers: "swing (0.5 s) → +1–5 coins → buy a sword (+50% damage, ~45 s) → bigger crystals → new zone at 10K coins (~6 min)."

## 3. The first 10 minutes (FTUE)
Patterns: FirstMinute, NextGoalGuide.
- Spawn facing the core action. The first click / step does something visible.
- First reward under 30 s, first purchase under 60 s, first "wow" (new zone, pet hatch, big upgrade) under 5 min.
- Teach by doing: arrows, glowing targets, one-line hints, never paragraphs. Hide systems until needed (the shop button appears when the player can afford something).
- No dead time: no waiting, long walks or grinding before the first upgrade. Show what is ahead: a locked area, a bigger player, a rare pet in the egg preview.

## 4. Genre playbooks
Pick the closest genre, then add **one twist** (section 9). Numbers are a starting point for the GDD. Long loops (rebirth, collections, worlds) are gameplay and get built in the MVP; retention, monetization and social hooks usually come in Polish & UX (sections 11 and 14), unless the concept *is* one of them.

| Genre | Moment loop | Session / long loop | Retention & social | Typical monetization | Common mistakes |
|---|---|---|---|---|---|
| **Simulator** | Click / swing / collect, fill a backpack, sell | Better tools → new zones → rebirth multipliers; pets multiply income | Pets, eggs, index, daily rewards, friend boost, leaderboards | 2x currency, auto-collect, pet slots, luck boosts, egg packs | Backpack too small, copy-pasted zones, numbers grow but nothing new happens |
| **Tycoon** | Collect cash, buy the next dropper / button | Build out the base → floors / upgrades → rebirth multiplier | Visible base, raids or visits, offline earnings | 2x cash, auto-collect, premium buttons, VIP area | Button walls with no choices, nothing to do while waiting, identical bases |
| **Obby / parkour** | Jump, land, checkpoint | Stages / worlds of rising difficulty, timers, collectibles | Stage counter flex, speedrun boards, trails and skins | Skip stage, trails, gravity / speed coil, revive | Difficulty spikes, unfair hitboxes, no checkpoints, nothing after the finish |
| **Tower defense** | Place / upgrade units, watch the wave | Maps and difficulties → unlock and level units → summon banner | Unit collection, co-op, events, trading | Summon currency, unit slots, 2x speed | Pay-to-win units, unreadable battlefields on mobile, waves too long |
| **Fighting** | Combos, dodge, ultimate | Characters / movesets, ranks | Kill streaks, emotes, ranks, friends | Cosmetics, character unlocks (never raw stats) | Selling power, bad netcode feel, no counterplay, hard for new players |
| **Survival / horror** | Explore, hide, escape, fix | Rounds or chapters, roles, unlocks | Friends, shared fear, lore | Revives, cosmetics, perks, private servers | Too dark to read, rounds end in seconds, no solo play |
| **Idle / incremental** | Buy generators, watch numbers grow | Generators → milestones → prestige layers | Offline earnings, prestige, achievements | 2x income, time skips, auto-buy | Numbers without new mechanics, long waits with no choices |
| **Roleplay, minigames** | Express yourself, build; or short varied rounds | Jobs, houses, vehicles; wins → currency → cosmetics | Friends, homes and cars to show off, round variety | Houses, vehicles, premium jobs, cosmetics, VIP servers | Nothing to do alone, long lobbies, rounds needing full servers |

## 5. Progression and economy
### Pacing targets (for an active player)
| Play time | Next purchase within | Something new (zone, tier, mechanic, pet) every |
|---|---|---|
| 0–10 min | 15–60 s | 2–4 min |
| 10–30 min | 1–3 min | 5–8 min |
| 30–60 min | 2–5 min | 10–15 min |
| After 1 h | 3–10 min, or a rebirth | Each rebirth / world |

Run every economy through the simulator (`lune run economy-sim <spec>`, section 12), don't guess.

### Formulas that work
Patterns: UpgradeCurrentNext, ZoneGates, Rebirth.
- **Upgrade cost:** `base * growth ^ level`, growth `1.07–1.15` (lower for many small upgrades, higher for few big ones). Linear (`base * level`) only for short capped lists (≤ 10 levels).
- **Upgrade effect:** additive per level (`+1 per click`), multiplicative at milestones (`x2 at level 25, 50, 100`). Exponential costs need effects that keep up, or a wall forms.
- **Zones / tiers:** each new zone multiplies income `x3–x10` and costs `x5–x20` the previous unlock. The step must *feel* big.
- **Rebirth / prestige** (when the game has it): first one at 15–40 min of active play. It resets currency and upgrades, gives a permanent multiplier (`+50–100%` each, or `x2`) or a currency to spend, and costs `x2–x5` more each time. After a rebirth the player regains their old place in **a fraction** of the time (aim for 30–50%).
- **Rewards scale with the curve:** quest and daily rewards are "N minutes of current income", not fixed amounts.
- **Caps and sinks:** cap anything that compounds (multipliers stacking from several sources). Every number has a max or a reason not to need one. Whatever players earn needs a meaningful place to spend it at every stage.
- **Big numbers:** abbreviate (1.2K, 3.4M); show income per second and the next goal's price.

### Randomness (eggs, drops, summons)
Patterns: EggHatch, CollectionIndex.
- Show the odds. Rarities step `x3–x10` rarer per tier (e.g. Common 60%, Uncommon 25%, Rare 10%, Epic 4%, Legendary 1%). Very rare (`< 0.1%`) only for chase items with no gameplay need.
- Pity / bad-luck protection for anything needed to progress.. Duplicates are always useful (fuse, level up, sell).

## 6. Retention hooks (pick what fits; don't add all)
Patterns: DailyRewards, PlaytimeGifts, OfflineEarnings, Quests.

| Hook | Default numbers | Fits |
|---|---|---|
| Daily login reward | 7-day calendar, rising rewards, day 7 a big prize; a missed day restarts or pauses | Everything |
| Playtime gifts | Gifts at 5, 10, 15, 25, 40, 60 min in one session | Session length |
| Offline earnings | 10–50% of income, capped at 2–8 h | Tycoon, idle, simulator |
| Quests | 3 daily + 1 weekly, each ~10–20 min of play, reward = minutes of income | Simulator, TD, RPG |
| Collection / index | A % complete with a reward per milestone | Pets, units, items |
| Streaks / timers | Shown on screen, cheap to keep | Daily return |
| Events / limited items | A 1–2 week event with its own currency and shop | After launch |
| Codes, group / like rewards | Free boosts or a small one-time reward (no external links) | Marketing |

Avoid energy systems that stop play and punishing streak losses: players leave instead.

## 7. Social design
Patterns: FriendBoost, VisibleStatus.
- **Friend boost:** `+10%` per friend in the server (cap `+50%`), and a reward for inviting.
- **Visible status:** what you earn shows on your avatar or base (titles, auras, pets, trails, overhead rank). Players chase what others see.
- **Works alone too:** a full and an empty server are both fun; the core loop never needs other players. Shared hubs, co-op bosses, races, leaderboards and opt-in PvP zones add competition without frustration.

## 8. Monetization players accept
Patterns: InContextOffers, StarterPack.
- **Gamepasses (one-time):** 2x currency, VIP (chat tag, area, small boost), auto-collect / auto-sell, more slots, faster movement, extra equip. 49–999 Robux; have one cheap pass (49–149).
- **Developer products (repeatable):** currency packs, luck / XP boosts (15–30 min), skips, revives, egg bundles. Bigger packs give more per Robux. Roblox pays for Premium playtime, so long sessions earn without purchases.
- **Never:** sell direct power in PvP, paywall the core loop, make free players wait for timers, or hide the odds. Offer a free path to everything that affects progression (only cosmetics and convenience can be paid-only).
- Show offers in context: a "2x coins" button next to the coin counter, a revive prompt after dying, the first offer only after a few minutes of play.

Monetization numbers are excluded from the balance-checker and the economy simulator: design the free game first.

## 9. Standing out: the one twist
Most Roblox games are clones. The design needs **one memorable twist** that changes how a known genre plays or looks, said in one sentence:
- **Theme:** a known loop in an unexpected world ("tycoon, but you run a haunted hotel").
- **Mechanic:** one new verb on a known loop ("simulator where your pets fight for you").
- **Social:** other players change your game ("obby where players above drop obstacles on you").
- **Constraint:** a limit that creates choices ("tower defense where towers move").

Test: is the twist visible in the thumbnail, the first minute and the name? If not, it's a feature, not a twist.

## 10. Mobile, devices and audience
- Most players are on phones: every action works with a thumb. Big buttons in the bottom corners, no keyboard-only mechanics, no tiny text, nothing important made unusable by the joystick or jump button (overlapping them is fine). Console (gamepad) is optional: add it when asked (every button reachable, a selection highlight).
- Many players are young: simple words, icons over text, bright readable visuals, short instructions. Older-teen games (horror, competitive) can be darker and harder, but stay readable.
- Short sessions are normal: save instantly, and reward a 5-minute session. Fast games must feel fair on 200 ms ping (client-side feedback first, server confirms).

## 11. Scope: the user's call
The game is played whole before it gets its looks. The MVP stage builds every gameplay system at once with simple placeholders, so the user plays the real game end to end while it's cheap to change (section 14). How much goes in is the user's choice: there are no caps and no "never in the MVP" rules. The numbers below are what the `gdd-reviewer` and `design-critic` may raise **as a suggestion**, once, with the user's version kept as an option (see "The user's game comes first").
- **The MVP holds every gameplay system the concept needs:** the core action and its feedback, plus whichever of these the game has (a loop and economy, saving, content, progression systems), the HUD and screens they need, and the World. The template already has much of it (`docs/FEATURES.md`).
- **Polish & UX usually holds** what is tuned best on a game that already plays: onboarding and the first-minute guide, monetization, social and party features, retention hooks (daily, playtime and offline rewards, quests, streaks), events and launch effects. When the concept *is* one of them (a co-op-only puzzle, a trading game), it belongs in the MVP.
- **Suggestions the reviewers may raise** (`lune run gdd-scope` prints them as `!` notes; the user decides):
  - More than ~5 systems in the MVP makes a long first build. Fine when the game needs them all to play end to end; otherwise suggest which could move to Polish.
  - More than ~30 pieces of one kind (stages, zones, items, enemies, recipes) is best written as rules or a generator ("60 stages, each +12% length, a gate every 10"), or started smaller with the rest added in Polish.
  - One currency until the loop needs a second.
  - A Polish-kind system in the MVP: ask whether the concept needs it there.
- **Simple placeholders, not final art.** The MVP is judged on how it plays:
  - **UI:** Plain (`UI_GUIDE.md`): shared Components, flat grey, text instead of icons, mobile-first.
  - **World:** a top-down layout plan first (spawn, paths, play spaces sized to the content, sightlines, boundaries), then plain parts and a few flat colors that tell areas apart.
  - **Models, effects, sounds:** simple part builds at the real size and silhouette, built-in particles, placeholder sounds.
  - **Built to be swapped in place:** one Model per asset, named like its asset row, at its final path, with the tags and attributes the code uses. Looks replaces the look and keeps that structure. Code and feel are finished; art is placeholder. Final world builds, models and the UI style come in Looks.
- One zone done well beats three rough ones; plan what is beyond the user's game as "Later". If time runs short, suggest cuts in this order: extra zones → secondary currencies → trading → events → extra modes. Never suggest cutting core-action feedback, the next-goal display, mobile controls or saving.

## 12. The economy spec (for the simulator)
Write the GDD's economy as `docs/gdd/<Name>.economy.luau` and run `lune run economy-sim docs/gdd/<Name>.economy.luau` (format at the top of `lune/economy-sim.luau`). Model:
- `Profiles`: at least an **Active** player and a **Casual** one (fewer actions per second, slower reactions).
- `Income` and `Upgrades`: everything that changes earning (upgrades, zones as one-level upgrades with a big multiplier, rebirth multiplier, pets as an average multiplier) and every free purchase that affects income.
- `Rebirth`, `Goals` (zone unlocks, milestones), `Targets` (section 5 pacing).

Tune until the flags are gone or explained, then copy the final numbers into the GDD. Systems with no currency (obby, horror, fighting) skip the simulator: the MVP is the full run or round with its content, and a pacing table stands in (stage length, difficulty curve, round length).

## 13. Design checklist
A design is ready when every answer is yes (the `design-critic` checks these):

1. The fantasy and the twist fit in one sentence each.
2. The core action is fun on its own, with feedback for every input.
3. The first reward is under 30 s and the first purchase under 60 s; the first 10 minutes are written out step by step.
4. A next goal is always visible, and pacing matches section 5 (simulator flags fixed or explained).
5. There's a reason to come back tomorrow and in a week.
6. It works alone and gets better with friends.
7. It works on a phone with a thumb (and on a gamepad, if console was asked for).
8. Monetization is fair: no paid power in PvP, a free path to all progression.
9. Every number is in the GDD (costs, rewards, timings, limits, odds), with edge cases (can't afford, max level, leaving mid-action, full inventory).
10. The Stages table has an MVP, Looks and Polish row, each with what it holds and when it's approved, and every system has a Stage (section 14; `lune run gdd-scope` checks the structure). The MVP plays end to end with every gameplay system the concept needs; the Polish row holds onboarding, monetization and social. Scope notes are suggestions the user decides on (section 11).
11. The Content section has a count for every kind of content in the full game; big counts are written as rules.
12. The Core feel section lists the feel knobs (start value and range) and 3–6 testable "Feels right when…" checks, measured in the MVP review.
13. Every system that matches an approved pattern uses its numbers and meets its "Works when" checks, or says why it doesn't.
14. It has at least one clippable moment (ClippableMoments): rare, seen by the server, readable with the sound off.
15. Every core mechanic has a chosen implementation that works on Roblox (section 15), with why it beat the alternatives.

## 14. Stages: play it, then make it look right, then polish
The cheapest way to find out if a game is fun is to play the whole thing before anything gets its final look: a bow that feels bad to shoot can't be saved by a nice model, and art is wasted if the verb or loop has to change. So `/build-gdd` builds every GDD in four stages, in order:

| Stage | Builds | Approved when (the user plays and says yes) |
|---|---|---|
| **MVP** | Every gameplay system in the GDD, playable end to end: the core action with its controls (PC and mobile), feedback and feel knobs; every other gameplay system the GDD has (only those); the HUD and screens they need; the World. Simple placeholders (section 11). | The game plays from a fresh join through its loop, the Core feel checks pass, and it plays the way the user meant |
| **Looks** | The final look on the MVP's structure: world builds, models, the UI style. Names, paths, hierarchy, rigs and tags stay as the MVP built them. | It looks the way the user wants, and it still plays the same |
| **Polish & UX** | Onboarding (the first minute), UX clarity (next goal always visible, readable feedback), juice, sounds, progression tuning, monetization, social, launch effects | Ready to publish |
| **Wrap-up** | Full docs, a how-it-works summary, both or neither | The user's pick is written |

- **Every stage is a loop:** questions → build → review & explain → the user's approval. Before a build, the `gdd-reviewer` turns the GDD into questions that pin down what the user has in mind; after it, it checks what was built against the GDD and the answers. Features are built core-first, in groups the user approves. "I have changes" goes back to questions with those changes; only the user's approval moves on. Every round is logged in `docs/ITERATIONS.md`.
- **The user can move anything between stages** in a questions step. Their answer wins and is logged in Decisions. **The GDD's `## Stages` table** says what each stage holds and when it's approved; each system block says its Stage (MVP or Polish). Looks has no systems of its own: its row names the world areas, models and screens that get their final look.
- **Each stage plays fully without the next.** The MVP may leave room for Polish (a reward hook that does nothing yet, a multiplier that's 1 for now), never scaffolding for systems that aren't built.
- **Feel knobs:** every number that decides how the core action feels (draw time, projectile speed, recoil, hit pause, cooldown, camera shake, move speed) is a config value in the `Tuning` table, changeable live in Studio (`SharedUtilities.TuningUtil`); `lune run apply-tuning` writes tuned values back. The GDD's **Core feel** lists each with a start value and a range. **"Feels right when…":** 3–6 testable checks in Core feel, with numbers where possible ("the arrow leaves within 100 ms of release", "a hit is readable at 60 studs on a phone", "something to buy every 15–60 s in the first 5 min"). The MVP review measures them.
- **Wrong direction:** if the core verb still doesn't feel right after a few rounds, change the verb or how it works (aiming, timing, camera), not the numbers around it. If the loop doesn't pull, change what's earned or what it buys before adding systems.
- **After the build:** a finished game is changed with `/revise-gdd`, the same loop. `.claude/LESSONS.md` is written only at a `/build-gdd` or `/revise-gdd` approval, with the lessons the user picks.

## 15. Researching mechanics
How a mechanic is built changes how it plays, what it costs and how far it grows: a dig game on a voxel part grid, on Terrain or on shrinking meshes are three different games. So before a GDD is built, every core mechanic gets 2–4 researched implementation options and the user picks one (`/new-gdd` steps 3 and 3b; `/new-gdd check` for a GDD the user brings).
- **Grounded in Roblox:** each option says how it's built (parts, Terrain API, EditableMesh, constraints, CollectionService), what it costs (instance counts, physics, streaming, replication and network ownership, mobile memory and frame time), where server authority sits, and what the template already has for it (`docs/FEATURES.md`).
- **Comparable games:** how successful Roblox games build it, plus one or two outside ideas; patterns and numbers only, never names, art or text.
- **The cache:** every researched mechanic is kept in `.claude/design/mechanics/<Mechanic>.md` (`MECHANIC_TEMPLATE.md`) so the next game reads it instead of researching again; entries older than ~90 days get a refresh. **Written into the GDD:** the **Mechanics** section holds the pick, why, the options turned down and the Roblox constraints, and each system's `Implementation:` line names it, so builders never choose their own.
