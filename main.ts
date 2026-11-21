// Leonida Platinum v3 — GTA 6 trophy guide entry (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// data/trophies.json with all 55 official trophies, their cited guides, 24 disputes
// with verdicts, a 26-row 100% ledger and a 5-stage roadmap). It runs offline in
// desktop Chrome from a static server; it fetches nothing over the network.
// This program hands the entry in: it copies app/ and screenshots/ from beside this
// file into the output directory and writes output/dossier.json with the kit's
// vendored make.fun library. vendor/makefun-frontend.ts is the kit's copy, unchanged:
// the scorer rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Guard the gate before anything is copied: the trophy file must name all 55 official
// trophies, each with a non-blank guide. A build that silently handed in a short list
// would be invalid, so fail loudly here instead of writing a bad dossier.
const trophyFile = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const trophyList = Array.isArray(trophyFile) ? trophyFile : trophyFile.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== 55) {
  throw new Error(`trophies.json must hold 55 trophies, found ${Array.isArray(trophyList) ? trophyList.length : 'none'}`);
}
const unguided = trophyList.filter((t) => !t || typeof t.guide !== 'string' || !t.guide.trim());
if (unguided.length > 0) {
  throw new Error(`${unguided.length} trophies have no guide: ${unguided.map((t) => t?.name ?? '?').join(', ')}`);
}

// v3 audit gate: the numbers the app itself computes at load must clear the bar the
// guide advertises, or the hand-in is refused here instead of at the scorer.
// (a) at least half of all guide steps backed by 2+ sources;
// (b) every cited source has a live URL (no URL-null citations);
// (c) every dispute carries a verdict; (d) the 5 roadmap stages cover all 55 trophies.
const sources = Array.isArray(trophyFile.sources) ? trophyFile.sources : [];
const disputes = Array.isArray(trophyFile.disputes) ? trophyFile.disputes : [];
const roadmapStages = Array.isArray(trophyFile.roadmap) ? trophyFile.roadmap : [];
let totalSteps = 0;
let backedSteps = 0;
for (const t of trophyList) {
  for (const s of t.steps ?? []) {
    totalSteps++;
    if (Array.isArray(s.s) && s.s.length >= 2) backedSteps++;
  }
}
if (totalSteps === 0 || backedSteps / totalSteps < 0.5) {
  throw new Error(`audit gate: only ${backedSteps}/${totalSteps} steps backed by 2+ sources (need >= 50%)`);
}
const urlLess = sources.filter((s) => !s || typeof s.url !== 'string' || !s.url.trim());
if (urlLess.length > 0) {
  throw new Error(`audit gate: ${urlLess.length} sources without a URL: ${urlLess.map((s) => s?.name ?? '?').join(', ')}`);
}
const verdictLess = disputes.filter((d) => !d || typeof d.verdict !== 'string' || !d.verdict.trim());
if (verdictLess.length > 0) {
  throw new Error(`audit gate: ${verdictLess.length} disputes without a verdict`);
}
const staged = new Set(roadmapStages.flatMap((st) => st.trophies ?? []));
if (roadmapStages.length !== 5 || staged.size !== 55) {
  throw new Error(`audit gate: roadmap must have 5 stages covering all 55 trophies (found ${roadmapStages.length} stages, ${staged.size} trophies)`);
}
const ledgerTotal = (trophyFile.ledger ?? []).reduce((a, r) => a + (r.need ?? 0), 0);

// Cross-reference gate: every step citation, dispute trophy link and ledger trophy
// link must point at something real — a dangling [n] or trophy id would ship a
// broken citation into the guide.
const sourceNumbers = new Set(sources.map((s) => s.n));
const trophyIds = new Set(trophyList.map((t) => t.id));
const dangling = [];
for (const t of trophyList) {
  for (const s of t.steps ?? []) {
    for (const n of s.s ?? []) if (!sourceNumbers.has(n)) dangling.push(`trophy ${t.id} step cites missing source [${n}]`);
  }
  for (const n of t.sources ?? []) if (!sourceNumbers.has(n)) dangling.push(`trophy ${t.id} cites missing source [${n}]`);
}
for (const d of disputes) {
  if (d.trophy != null && !trophyIds.has(d.trophy)) dangling.push(`dispute ${d.id} links missing trophy ${d.trophy}`);
  for (const n of [...(d.aSources ?? []), ...(d.bSources ?? []), ...(d.verdictSources ?? [])]) {
    if (!sourceNumbers.has(n)) dangling.push(`dispute ${d.id} cites missing source [${n}]`);
  }
}
for (const r of trophyFile.ledger ?? []) {
  if (r.trophy != null && !trophyIds.has(r.trophy)) dangling.push(`ledger row "${r.item}" links missing trophy ${r.trophy}`);
}
for (const st of roadmapStages) {
  for (const id of st.trophies ?? []) if (!trophyIds.has(id)) dangling.push(`roadmap stage ${st.n} links missing trophy ${id}`);
}
if (dangling.length > 0) {
  throw new Error(`audit gate: ${dangling.length} dangling references:\n- ${dangling.slice(0, 10).join('\n- ')}`);
}
if ((trophyFile.ledger ?? []).length !== 26) {
  throw new Error(`audit gate: ledger must have 26 rows (found ${(trophyFile.ledger ?? []).length})`);
}
if (disputes.length < 20) {
  throw new Error(`audit gate: need at least 20 disputes with verdicts (found ${disputes.length})`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

const shots = existsSync(join(out, 'screenshots')) ? readdirSync(join(out, 'screenshots')).length : 0;
console.log(`Leonida Platinum v3 handed in: app/ copied, ${shots} screenshot(s), dossier.json written to ${out}`);
console.log(`Audit: ${backedSteps}/${totalSteps} steps backed by 2+ sources · ${sources.length} sources · ${disputes.length} disputes with verdicts · ledger ${(trophyFile.ledger ?? []).length} rows / ${ledgerTotal.toLocaleString()} items · ${roadmapStages.length} roadmap stages · 0 dangling references`);
