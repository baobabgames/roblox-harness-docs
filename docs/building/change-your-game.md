---
sidebar_position: 3
title: Change your game
---

# Change your game

**`/revise-gdd`** makes every later change to a finished game (`Stage: Done`), or to an adopted or imported game. It runs the same loop as `/build-gdd`: questions, build, review and explain, your approval, and "I have changes" for another round. It keeps `docs/GAMEPLAN.md` up to date.

While a `/build-gdd` is still in progress, give changes at its approval step instead.

| You want to... | Run |
|---|---|
| Change something | `/revise-gdd make upgrades cost 15 × level` |
| Add something | `/revise-gdd add a rebirth system`, or a change doc in `docs/revise/`: `/revise-gdd rebirth-update` |
| Remove something | `/revise-gdd remove the shop` |
| Finish a stub | `/revise-gdd finish the Upgrade stub` |
| Change how it feels or looks | `/revise-gdd the bow feels slow`, `/revise-gdd restyle the shop screen` |
| Apply your GDD edits | Edit the GDD, then `/revise-gdd` with nothing: it plans just the differences |

- It re-checks the systems that depend on what changed, and updates every caller of a changed contract.
- It never renames or removes saved player data without a migration you approve.
- Small fixes that don't change the design (a number, a typo, a bug) don't need `/revise-gdd`: just ask.

## The files that keep track

| File | What it is |
|---|---|
| GDD (`docs/gdd/`) | What the game *should* be: your design |
| `docs/GAMEPLAN.md` | What's *built* right now, system by system, and which stage and step it's at. `/build-gdd` resumes from it and `/revise-gdd` reads it |
| `docs/ITERATIONS.md` | Every loop round: what you said, what changed, whether it worked |
| `docs/gdd/<Name>.buildlog.md` | The optional run log of a build (time, tokens, issues) |
| `docs/PACING.md` | The `/pacing-test` recipe and every run's milestone times |
| `docs/GAME_SUMMARY.md` | The how-it-works summary, if you picked it in Wrap-up |
| `docs/FEATURES.md` | Which functions exist to reuse |
| `.claude/LESSONS.md` | Lessons you confirmed, read by every future design and build |
| `.claude/design/PATTERNS.md` | Proven design solutions with numbers (daily rewards, hit feedback, rebirth...) |
| `docs/ideas/` | The idea bank from `/game-ideas` |

## Keep the harness up to date

`/update-harness` brings the template's latest harness into your game: `.claude` (rules, guides, skills, agents, hooks, settings), `scripts`, Lune tools and CI. It merges with your game's own changes and only asks about real conflicts. It never touches game code, lessons, references, the library, `docs/` or tests.
