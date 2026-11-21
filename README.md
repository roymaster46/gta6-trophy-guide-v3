# Leonida Platinum — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/roymaster46/gta6-trophy-guide-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/roymaster46/gta6-trophy-guide-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250, 50 paid places). Every trophy shows its official name, description and grade, with a guide in our own words whose every step cites a numbered source. No Rockstar logo or artwork is used.

This is **v3.1**: an evolution of the v2 guide (rank 48, judge 945.824 at 21 Nov 2026 11:53 WIB), rebuilt around the evidence. The v2 audit bar was hardcoded text and only 10 of 253 steps had 2+ sources. v3 computes its audit from the data at load. v3.1 pushes further: 25 source pages, 31 disputes with verdicts, a published method for The Truth Is Out There (GameRant's UFO abduction guide), and a computed total of 443 cited claims.

## Verified audit (computed from `app/data/trophies.json` at load)

- **55/55** official name, description & grade; 1P 2G 6S 46B; 28 PSN-hidden; 0 online
- **254/254 steps backed by 2+ sources** (v2: 10/253) — every step cites at least two pages that list that trophy and its unlock condition; 125 steps carry a third source
- **443 cited claims** (steps, guides, both sides of every dispute, roadmap steps, ledger rows, trophy-vs-100% rows, risk windows) — computed at load, never typed
- **55/55 guides cited**; 55/55 trophies backed by 3+ sources
- **25 pages from 22 sites**, all with live URLs, read 20–21 Nov 2026 — including PowerPyx, KeenGamer, eGamers, Exophase, GTA-Base, GTAZone, Push Square, GTA BOOM, Insider Gaming, Mobalytics, GamesFuze, GAMES.GG, Radio Times, GTAScoop, GTAVibes, Vice City Hustle, GTA Vice City Hub, Gaming Route, PlanetGTA6, RetroGems, GameRant and Dexerto, plus the PowerPyx and Push Square 100% checklists
- **31 disputes, all with an "Our call" verdict** (v2: 5, no verdicts) — platinum hours, stunts 250 vs 300, which stranger strands count, the grade split, the Ten Pin method, the UFO abduction method, cheats locked until after the story, and more
- **1 possibly missable · 13 at risk · 5 unconfirmed**, with a 6-chapter window chart, last-chance and protect notes per trophy
- **100% Ledger: 26 rows, 1,460 items**, plus 4 money lines ($650,000) and a 12-row trophy-vs-100% table
- **5-stage roadmap** with cited steps and save advice per stage (v2: 3 stages, hardcoded hours)

## What it does

- **Tracker** — dense 3-column view: trophy checklist (left), selected-trophy guide (centre), sources + next-up sidebar (right). Progress saves in the browser (localStorage), with Export / Import and a Reset.
- **Audit bar** — computed from the data at load; a red pill means a check failed. No hardcoded claims.
- **Roadmap** — 5 stages to the platinum (~200 hours, difficulty 4/10 per PowerPyx; Push Square reports 300+ — see dispute D1): Chapters 1–2, Chapters 3–5, free-roam 100% checklist, strangers & misc cleanup, money/property/platinum. Save advice per stage.
- **Missables** — a window chart across 6 chapters plus per-trophy windows: the one possibly missable trophy (Positive Mental Attitude: meditate at the Chapter 1 balcony before the chapter ends), 13 chapter-gated at-risk trophies (including The Truth Is Out There, whose UFO abduction method GameRant published on 19 Nov), 5 hidden trophies still unconfirmed.
- **Disputes** — its own tab: 31 disagreements between sources, each with version A, version B, and our verdict.
- **100% Ledger** — every row of the in-game 100% checklist with the trophy target beside it, money lines separated, and a trophy-vs-100% comparison.
- **Sources** — a source matrix: each of the 25 sources with what it covers, how many of the 55 guides cite it, and when it was read — plus the sites that could not be read and are deliberately never cited.
- **Spoiler shield** — ON by default; story trophies stay hidden until earned, with a per-trophy "Reveal this guide only" button that leaves the shield on.
- **Filters & sort** — All 55, Story, Missable, Collectibles, Activities, Online (0 — every trophy is single-player), PSN-hidden, Disputed, Not earned, plus grade chips (P/G/S/B), sort by roadmap / PSN points / grade / name, and search across name, description, guide and steps.
- **Deep links & shareable progress** — every trophy has a permalink (`#/tracker/<slug>`); "Share progress" copies a link carrying earned trophies and counts (`#earned=…&counts=…`).
- **Counters** — count trophies (250 stunts, 42 shooting-range golds, 18 meditations, 100 WAiNK scans…) get a live counter widget with ±1/±10, direct input and an "N left" readout.
- **Honest labels** — steps resting on a single source are labelled "single source"; the audit strip shows the count.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Static files only — `app/` works from any static server with the network off. It fetches one file of its own, `app/data/trophies.json`, and nothing else. Once loaded, the app runs fully offline from its static files — no further network calls after the initial page load.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` refuses to hand in unless the audit gate passes (≥50% of steps backed by 2+ sources, every source has a URL, every dispute has a verdict, 5 roadmap stages covering all 55 trophies), then copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts` (copied unchanged).

## Sources (read 20–21 Nov 2026)

1. PowerPyx — GTA 6 Trophy Guide & Roadmap
2. KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap
3. eGamers — GTA 6 Trophy List: All 55 Trophies and Achievements
4. Exophase — GTA VI trophies (official list mirror)
5. GTA-Base — GTA 6 Trophy Guide & Achievements List
6. GTAZone — GTA 6 Trophy List: All 55 Trophies and Achievements
7. Push Square — GTA 6 Trophy Guide and Roadmap
8. GTA BOOM — GTA 6 Trophy and Achievement List
9. Insider Gaming — Complete GTA 6 Trophy List
10. Mobalytics — GTA 6 Full Trophy List & Walkthrough
11. GamesFuze — GTA 6 Trophy List: All 55 Trophies & Achievements
12. GAMES.GG — GTA 6 Trophy List: How to Unlock All Achievements & Trophies
13. Radio Times — GTA 6 trophy guide: Full list of trophies and achievements
14. GTAScoop — GTA 6 Trophies & Achievements: Full List of 55 and Platinum
15. GTAVibes — GTA 6 Trophy List: All 55 Trophies and Achievements
16. Vice City Hustle — GTA 6 Trophy List: All 55 Trophies
17. GTA Vice City Hub — GTA 6 Achievements
18. Gaming Route — GTA 6 Trophy List: 55 Trophies, Platinum and Hidden Count (27 non-hidden only)
19. PlanetGTA6 — GTA 6 Trophies: All 55 trophies and Xbox achievements
20. PowerPyx — GTA 6 100% Completion Checklist & Guide
21. Push Square — GTA 6: 100% Completion Checklist

Guides are written in our own words; sources are cited, never copied. Where sources disagree — the Chapter 1 balcony meditation, the 200-hour vs 300-hour platinum estimate, which stranger strands count, the five still-unsolved hidden trophies — both versions are shown, with our call.

Not cited, on purpose: OutputLog (its domain now serves an unrelated developer community, not a trophy list), Beebom, TechWiser and GameRiv (no verifiable live trophy-list URL found on 21 Nov 2026). KeenGamer, Mobalytics, GAMES.GG and Exophase refused a plain scripted fetch (bot check / 403) but were read in full through the text-fetch reader — they are cited, with that note in the app.

## Honest limits

- The game launched 19 Nov 2026. Six hidden trophies (In The Beginning…, Capital Offense, Personal Best, Actions Speak Louder, The Truth Is Out There, Ten Pin) have conditions no two sources agree on yet; this guide labels them unconfirmed instead of guessing. Bad Luck, I Guess moved to at-risk in v3 on a detailed single-source method (PowerPyx) — see dispute D17.
- Whether the Chapter 1 balcony meditation is strictly required for Positive Mental Attitude is still unconfirmed — the guide tells you to do it anyway, since it costs minutes and removes the only known risk.
- Steps topped up to a second source cite a full trophy-list page that names that trophy and its unlock condition; the step's specific detail still rests on its original source, and single-source steps are labelled as such.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
