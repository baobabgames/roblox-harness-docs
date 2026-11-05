# GDD Guide

How games are designed and built from a game design doc (GDD): the stages, the loop, the skills for each step and the docs that carry the work between sessions. Read it before any GDD skill, and before changing a system of a game that has `docs/GAMEPLAN.md`. How to design well is in `DESIGN_GUIDE.md`.

## Stages and the loop
- **The user's game comes first.** Game-design work uses `DESIGN_GUIDE.md` as recommendations, never as rules over the user's idea (its section "The user's game comes first"). The GDD and the user's answers decide.
- `/build-gdd` builds a game in four stages, in order (DESIGN_GUIDE section 14):
  1. **MVP:** every gameplay system in the GDD, with simple placeholders (Plain UI, simple Studio-part builds).
  2. **Looks:** world and builds, models, the UI style, on the same structure.
  3. **Polish & UX:** onboarding, clarity, feedback, sounds, progression tuning, monetization, social.
  4. **Wrap-up:** docs or a how-it-works summary.
- **Every stage is a loop:** questions → build → review & explain → approval (`.claude/skills/build-gdd/LOOP.md`). "I have changes" starts a new round; only the user's approval moves on.
- **The `gdd-reviewer` agent** asks the questions that pin down what the user means, and checks each build against the GDD, the answers, the references and the patterns.
- **Content counts and scope** are the user's. DESIGN_GUIDE 11's sizes are advice the reviewer may raise as a question.
- **Feel numbers are feel knobs** in the config's `Tuning` table (`TuningUtil`), live-tunable in Studio. The next round writes the tuned values back.

## Skills
- `/game-ideas`: brainstorm game ideas, or for a built game twists and content; the idea bank is in `docs/ideas/`.
- `/new-gdd`: design a game.
- `/build-gdd`: build it, stage by stage, loop by loop. It resumes where it left off, and refuses a repo whose game is already built: a new game starts from a fresh copy of the template.
- `/revise-gdd`: any change to a finished game (`Stage: Done`), or to an adopted or imported game, through the same loop.
- `/new-pattern`: add, review, approve or queue-review design patterns; `genre` / `guide` research a whole genre or a broad principle.
- `/adopt-game`: a game made without the template. Puts the harness on top of it as it is, no code moved.
- `/import-game`: a game made without the template. Reads all its code and converts it into harness form in one run, docs only if picked.
- `/pacing-test`: a bot plays the built game in Studio and times every progression step (levels, stages, unlocks, purchases) against the GDD and, when there is one, the economy simulator. Offered when `/build-gdd` finishes a game with progression (or after a `/revise-gdd` that changed progression numbers); runs only on the user's yes or when they type it. Log in `docs/PACING.md`.
- `/harness-report`: compares harness iterations on real usage (tokens, cost estimate, time, agents per `CHANGELOG.txt` iteration and skill, from this machine's session transcripts, numbers only). `--session latest` feeds `/build-gdd`'s run log.
- **Only the user starts** `/game-ideas`, `/build-gdd`, `/revise-gdd`, `/adopt-game`, `/import-game` and `/harness-report`. GDDs live in `docs/gdd/`, change docs in `docs/revise/`.
- **A fresh session per stage:** `/build-gdd` suggests a new session at each stage, and `/revise-gdd` one per change. One long conversation re-reads its whole history on every reply; the docs below carry everything across.

## Docs that carry the work
- **Read before changing a system or its assets:**
  - `docs/GAMEPLAN.md`: the stage and step, what's built per system, and the Decisions.
  - `docs/ITERATIONS.md`: every loop round, with what the user asked and what changed.
  - `docs/ASSETS.md`: every asset, its route and status.
- A small fix outside the skills that changes a system's files, saved data or events still updates its `GAMEPLAN.md` block.
- **`docs/gdd/<Name>.buildlog.md`** (opt-in, asked at the first `/build-gdd`): time, token usage and issues per round, for whoever improves the harness.
- **Feedback in plain chat:**
  - While `/build-gdd` is in progress, feel or design feedback is a change for its loop: answer it at the approval step, or run `/build-gdd` to resume.
  - After the game is finished, it's `/revise-gdd`.
- **`.claude/LESSONS.md`:** rules the user confirmed in earlier games. Read it before design, UI, world or feel work. Only `/build-gdd` and `/revise-gdd` add to it, at an approval, and only lessons the user picks.
