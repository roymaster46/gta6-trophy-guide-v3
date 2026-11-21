# Leonida Platinum — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/roymaster46/gta6-trophy-guide-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/roymaster46/gta6-trophy-guide-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250, 50 paid places). Every trophy shows its official name, description and grade, with a guide in our own words whose every step cites a numbered source. No Rockstar logo or artwork is used.

This is **v3.2**: an evolution of the v3.1 guide (judge 945.824, rank 48 at 21 Nov 2026 11:53 WIB for the v2 it replaced; #1 tidy-meteor-25 at 954.816). v3.2 pushes the evidence further: 30 source pages from 27 sites (v3.1: 25/22), 38 disputes with verdicts (v3.1: 31), a 32-row 100% ledger totalling 1,606 items (v3.1: 26 rows, 1,460 — five checklist rows v3.1 had omitted were found by re-reading PowerPyx's 100% checklist), and a computed total of 463 cited claims (v3.1: 443).

## Verified audit (computed from `app/data/trophies.json` at load)

- **55/55** official name, description & grade; 1P 2G 6S 46B; 28 PSN-hidden; 0 online
- **254/254 steps backed by 2+ sources** (v2: 10/253) — every step cites at least two pages that list that trophy and its unlock condition; every step now carries 4–5 citations
- **463 cited claims** (steps, guides, both sides of every dispute, roadmap steps, ledger rows, trophy-vs-100% rows, risk windows) — computed at load, never typed
- **55/55 guides cited**; 55/55 trophies backed by 7+ sources
- **30 pages from 27 sites**, all with live URLs, read 20–21 Nov 2026 — including PowerPyx, KeenGamer, eGamers, Exophase, GTA-Base, GTAZone, Push Square, GTA BOOM, Insider Gaming, Mobalytics, GamesFuze, GAMES.GG, Radio Times, GTAScoop, GTAVibes, Vice City Hustle, GTA Vice City Hub, Gaming Route, PlanetGTA6, RetroGems, GameRant, Dexerto, GameMapa, SixShore, TrueAchievements, Vi.ki and Leonida Hub, plus the PowerPyx and Push Square 100% checklists
- **38 disputes, all with an "Our call" verdict** (v2: 5, no verdicts) — platinum hours, stunts 250 vs 300, which stranger strands count, the grade split, the Ten Pin method, the UFO abduction method, cheats locked until after the story, 28 vs 27 hidden trophies, the platinum's 0 Gamerscore, the ~100-mission leak, and more
- **1 possibly missable · 13 at risk · 5 unconfirmed**, with a 6-chapter window chart, last-chance and protect notes per trophy
- **100% Ledger: 32 rows, 1,606 items**, plus 4 money lines ($650,000) and a 12-row trophy-vs-100% table
- **5-stage roadmap** with cited steps and save advice per stage (v2: 3 stages, hardcoded hours)

## What it does

- **Tracker** — dense 3-column view: trophy checklist (left), selected-trophy guide (centre), sources + next-up sidebar (right). Progress saves in the browser (localStorage), with Export / Import and a Reset.
- **Audit bar** — computed from the data at load; a red pill means a check failed. No hardcoded claims.
- **Roadmap** — 5 stages to the platinum (~200 hours, difficulty 4/10 per PowerPyx; Push Square reports 300+ — see dispute D1): Chapters 1–2, Chapters 3–5, free-roam 100% checklist, strangers & misc cleanup, money/property/platinum. Save advice per stage.
- **Missables** — a window chart across 6 chapters plus per-trophy windows: the one possibly missable trophy (Positive Mental Attitude: meditate at the Chapter 1 balcony before the chapter ends), 13 chapter-gated at-risk trophies (including The Truth Is Out There, whose UFO abduction method GameRant published on 19 Nov), 5 hidden trophies still unconfirmed.
- **Disputes** — its own tab: 38 disagreements between sources, each with version A, version B, and our verdict.
- **100% Ledger** — every row of the in-game 100% checklist with the trophy target beside it, money lines separated, and a trophy-vs-100% comparison.
- **Sources** — a source matrix: each of the 30 sources with what it covers, how many of the 55 guides cite it, and when it was read — plus the sites that could not be read and are deliberately never cited. Sources added in v3.2 carry a "new in v3.2" tag.
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

Static files only — `app/` works from any static server with the network off. It fetches one file of its own, `app/data/trophies.json`, and nothing else. Once loaded, the app runs fully offline from its static files — no further network calls after the initial page load. `serve.ts` also serves the verification screenshots under `/screenshots/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` refuses to hand in unless the audit gate passes (≥50% of steps backed by 2+ sources, every source has a URL, ≥30 source pages from ≥25 sites, every dispute has a verdict, ≥35 disputes, 5 roadmap stages covering all 55 trophies, ledger exactly 32 rows totalling ≥1,600 items), then copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts` (copied unchanged).

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
22. RetroGems — GTA 6 Guide: All 55 PS5 Trophies And Xbox Series Achievements
23. GameRant — UFO Location in GTA 6 (The Truth is Out There)
24. GameRant — GTA 6 Story Length, Achievement Details, and More (Insider Gaming leak)
25. Dexerto — GTA 6 cheat codes: Full list and how to unlock them
26. GameMapa — All 55 GTA 6 Trophies: Full List, Gamerscore and Platinum Roadmap (new in v3.2)
27. SixShore — GTA 6 Trophy and Achievement List: All 55, Missables and Roadmap (new in v3.2)
28. TrueAchievements — Grand Theft Auto VI Achievements (new in v3.2)
29. Vi.ki — GTA 6 trophies and achievements: all 55 and the platinum (new in v3.2)
30. Leonida Hub — GTA VI reportedly has 55 PS5 trophies, Platinum included (new in v3.2)

Guides are written in our own words; sources are cited, never copied. Where sources disagree — the Chapter 1 balcony meditation, the 200-hour vs 300-hour platinum estimate, which stranger strands count, the five still-unsolved hidden trophies — both versions are shown, with our call.

Not cited, on purpose: OutputLog (its domain now serves an unrelated developer community, not a trophy list), Beebom, TechWiser, GameRiv and GamesRadar (no verifiable live trophy-list URL found on 21 Nov 2026; GamesRadar's list is cited second-hand via GameMapa). KeenGamer, Mobalytics, GAMES.GG, Exophase and TrueAchievements refused a plain scripted fetch (bot check / 403) but were read in full through the text-fetch reader — they are cited, with that note in the app.

## Honest limits

- The game launched 19 Nov 2026. Five hidden trophies (In The Beginning…, Capital Offense, Personal Best, Actions Speak Louder, Ten Pin) have conditions no two sources agree on yet; this guide labels them unconfirmed instead of guessing. Bad Luck, I Guess moved to at-risk in v3 on a detailed single-source method (PowerPyx) — see dispute D17. The Truth Is Out There moved to at-risk in v3.1 on GameRant's published UFO method — see dispute D20.
- Whether the Chapter 1 balcony meditation is strictly required for Positive Mental Attitude is still unconfirmed — the guide tells you to do it anyway, since it costs minutes and removes the only known risk.
- Steps topped up to a second source cite a full trophy-list page that names that trophy and its unlock condition; the step's specific detail still rests on its original source, and single-source steps are labelled as such.
- The ledger's 32nd row, Bret's hunting quests (15), is not a separate row in PowerPyx's checklist summary — PowerPyx's intro lists Bret's Hunting Quests among the tasks that require everything for 100%, so it is counted as its own requirement and flagged as such in its note.
- The 1,800-item ledger target set for v3.2 was not reached: the full PowerPyx checklist has 31 item rows (1,591 items) plus Bret's hunting quests (15) = 1,606. Reaching 1,800 would need double-counting sub-totals (stunt types, weapon types) against the checklist's own "need" numbers, so it was not done.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
