#!/usr/bin/env node
/**
 * The critic-coverage report, plus the handle-rescue list.
 *
 *   node scripts/coverage-report.mjs
 *
 * Two questions the owner asks at every check-in: which populated categories
 * have a critic and which do not, and how often the cheap handle path would
 * have missed someone. Both are answered from the data rather than from
 * recollection, so the numbers cannot drift out of date in a summary.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const categories = read('data/categories.json');
const cats = categories.categories ?? categories;
const creators = read('data/creators.json');
const gaps = existsSync(join(ROOT, 'data/critic-gaps.json')) ? read('data/critic-gaps.json').gaps ?? {} : {};

const byCat = new Map(cats.map((c) => [c.id, []]));
for (const c of creators) for (const m of c.categories ?? []) byCat.get(m.id)?.push(c);

const populated = [...byCat.entries()].filter(([, list]) => list.length > 0);
const withCritic = populated.filter(([, l]) => l.some((c) => c.role === 'critic'));
const documented = populated.filter(([id, l]) => !l.some((c) => c.role === 'critic') && gaps[id]);
const undocumented = populated.filter(([id, l]) => !l.some((c) => c.role === 'critic') && !gaps[id]);

const pad = (s, n) => String(s).padEnd(n);
console.log('CRITIC COVERAGE');
console.log('='.repeat(72));
console.log(`${creators.length} creators | ${populated.length} of ${cats.length} categories populated`);
console.log(`  has a critic .................. ${withCritic.length}`);
console.log(`  documented gap (rule 11) ...... ${documented.length}`);
console.log(`  no critic, not yet documented .. ${undocumented.length}`);

console.log(`\nHas a critic (${withCritic.length})`);
for (const [id, list] of withCritic.sort()) {
  const who = list.filter((c) => c.role === 'critic').map((c) => c.name);
  console.log(`  ${pad(id, 26)} ${who.join(', ')}`);
}

if (documented.length) {
  console.log(`\nShipping without a critic, on purpose (${documented.length})`);
  for (const [id] of documented.sort()) console.log(`  ${pad(id, 26)} ${gaps[id]}`);
}

console.log(`\nStill open — no critic and no documented reason (${undocumented.length})`);
console.log('  These are unfinished, not decided. Rule 11 applies only once the');
console.log('  search is done and the gap is written down with a reason.');
for (const [id, list] of undocumented.sort()) {
  console.log(`  ${pad(id, 26)} ${list.length} creator${list.length === 1 ? '' : 's'}`);
}

// ------------------------------------------------ jurisdiction gaps
// A category can hit its creator target and still be empty for a whole
// country. Five US creators is not coverage for a UK visitor. The owner's
// requirement: name these rather than let them hide inside a passing count.
let jur = { markets: [], categories: {} };
const jurPath = join(ROOT, 'data/jurisdiction.json');
if (existsSync(jurPath)) jur = read('data/jurisdiction.json');
const MARKETS = jur.markets ?? [];
const jurCats = Object.keys(jur.categories ?? {});
if (jurCats.length) {
  console.log('\n\nJURISDICTION COVERAGE');
  console.log('='.repeat(72));
  console.log(`${jurCats.length} categories where tax, law or regulation makes advice non-transferable.`);
  console.log('A creator marked "general" counts for every market.\n');
  console.log(`  ${pad('category', 26)} ${MARKETS.map((m) => m.padEnd(4)).join('')} gen  missing`);
  const missingTally = new Map(MARKETS.map((m) => [m, 0]));
  for (const id of jurCats) {
    const list = byCat.get(id) ?? [];
    const gen = list.filter((c) => c.jurisdiction === 'general').length;
    const cells = MARKETS.map((m) => {
      const n = list.filter((c) => c.jurisdiction === m).length;
      return String(n + gen === 0 ? '-' : n || (gen ? 'g' : 0)).padEnd(4);
    });
    const missing = MARKETS.filter((m) => !list.some((c) => c.jurisdiction === m) && gen === 0);
    for (const m of missing) missingTally.set(m, missingTally.get(m) + 1);
    const flag = list.length === 0 ? 'category empty' : missing.length ? missing.join(', ') : 'none';
    console.log(`  ${pad(id, 26)} ${cells.join('')}${String(gen).padEnd(5)}${flag}`);
  }
  const targets = jur.targetMarkets ?? MARKETS;
  const gapOnly = jur.documentedGapMarkets ?? [];
  console.log('\n  Categories with no creator for that market (excluding "general"):');
  for (const [m, n] of missingTally) {
    const role = targets.includes(m) ? 'TARGET — staff these' : gapOnly.includes(m) ? 'documented gap — report, do not staff' : '';
    console.log(`    ${pad(m, 4)} ${String(n).padStart(2)} of ${jurCats.length}   ${role}`);
  }
  const targetWork = jurCats.filter((id) => {
    const list = byCat.get(id) ?? [];
    if (list.some((c) => c.jurisdiction === 'general')) return false;
    return targets.some((m) => !list.some((c) => c.jurisdiction === m));
  });
  console.log(`\n  Actual work outstanding: ${targetWork.length} categories missing a US or UK creator.`);
  if (targetWork.length) console.log(`    ${targetWork.join(', ')}`);
  console.log('\n  "-" means nobody at all; "g" means covered only by a general creator.');
  console.log('  This is a documented gap of a different kind — a passing creator count');
  console.log('  can still leave a whole market unserved.');
}

// ------------------------------------------- retroactive vs first-pass
// The owner's requirement: track these separately so that at batch 40 it is
// possible to tell whether the mappings-per-creator ratio improved because the
// data was genuinely under-mapped, or because the bar drifted.
const retro = [];
let firstPass = 0;
for (const c of creators) {
  for (const m of c.categories ?? []) {
    if (m.addedLater) retro.push({ creator: c.id, category: m.id, ...m.addedLater });
    else firstPass++;
  }
}
const totalMaps = retro.length + firstPass;
console.log('\n\nMAPPING PROVENANCE');
console.log('='.repeat(72));
console.log(`  first-pass ... ${String(firstPass).padStart(4)}  (written with the creator's own batch)`);
console.log(`  retroactive .. ${String(retro.length).padStart(4)}  (added to an existing record later)`);
console.log(`  retroactive share: ${(100 * retro.length / totalMaps).toFixed(1)}%`);
console.log(`  ratio ${(totalMaps / creators.length).toFixed(2)}/creator, of which ${(firstPass / creators.length).toFixed(2)} is first-pass`);
if (retro.length) {
  console.log('\n  Every retroactive mapping, with what triggered it:');
  const byBatch = new Map();
  for (const r of retro) {
    if (!byBatch.has(r.batch)) byBatch.set(r.batch, []);
    byBatch.get(r.batch).push(r);
  }
  for (const [b, rows] of [...byBatch].sort((a, x) => a[0] - x[0])) {
    console.log(`\n  added in batch ${String(b).padStart(2, '0')}:`);
    for (const r of rows) console.log(`    ${pad(r.creator + ' -> ' + r.category, 46)} ${r.trigger}`);
  }
}

// -------------------------------------------------- thin categories
// The owner's standing request: keep this list growing in the open rather
// than discovering it at batch 40.
//
// Three states, and the distinction matters. A category below 5 is UNFINISHED
// by default — one domain pass of a dozen creators is not an exhaustive
// search, and it would be dishonest to call it a decided gap. It becomes a
// DOCUMENTED GAP only when someone has actually finished looking and written
// down what exists, in data/thin-gaps.json. Nothing is inferred: a domain
// having had a first pass proves nothing about any single category in it.
let thinGaps = {};
const thinPath = join(ROOT, 'data/thin-gaps.json');
if (existsSync(thinPath)) thinGaps = read('data/thin-gaps.json').gaps ?? {};

const under = cats
  .map((c) => ({ id: c.id, domain: c.domain, n: (byCat.get(c.id) ?? []).length }))
  .filter((r) => r.n < 5)
  .sort((a, b) => a.n - b.n || a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));

const thinDocumented = under.filter((r) => thinGaps[r.id]);
const openWork = under.filter((r) => !thinGaps[r.id]);

console.log('\n\nBELOW THE 5-CREATOR TARGET  (running list)');
console.log('='.repeat(72));
console.log(`${under.length} of ${cats.length} categories are under 5 creators.`);
console.log(`  searched and documented ... ${thinDocumented.length}  (a reason is on file)`);
console.log(`  still open ................ ${openWork.length}  (unfinished research, no claim made)`);
console.log('\nThe 5-minimum is a target, not a validator failure — the owner accepted');
console.log('~74 gaps knowingly. But a gap only counts as decided once someone has');
console.log('finished looking and written why. Until then it is just work not done.');

if (thinDocumented.length) {
  console.log(`\nSearched and documented (${thinDocumented.length})`);
  for (const r of thinDocumented) {
    const g = thinGaps[r.id];
    const entry = typeof g === 'string' ? { reason: g } : g;
    console.log(`\n  ${r.id}  (${r.n} creator${r.n === 1 ? '' : 's'}, ${r.domain})`);
    // Whether a gap is ours or the world's is the thing worth surfacing: a
    // category thin because our own rules rejected candidates is a different
    // fact from one thin because nothing good exists.
    if (entry.gapCause) {
      const looser = entry.countUnderLooserStandard;
      const delta = looser != null && looser !== r.n ? `  (would be ${looser} under the standard used elsewhere)` : '';
      console.log(`    cause: ${entry.gapCause}${delta}`);
    }
    for (const [label, text] of [['reason', entry.reason], ['attribution', entry.attribution], ['challenged', entry.challenged]]) {
      if (!text) continue;
      console.log(`    ${label}:`);
      for (const line of String(text).match(/.{1,86}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
    }
  }
}

// High-stakes categories get called out by name: an empty one there is a
// deliberate outcome under rule 12, not an oversight to be tidied away later.
let highStakes = {};
const hsPath = join(ROOT, 'data/high-stakes.json');
if (existsSync(hsPath)) highStakes = read('data/high-stakes.json').categories ?? {};
const hsRows = under.filter((r) => highStakes[r.id]);
if (hsRows.length) {
  const hsStatus = (existsSync(hsPath) ? read('data/high-stakes.json').status : null) ?? 'in force';
  console.log(`\nHIGHER-STAKES categories below target (${hsRows.length}) — rule 12 [${hsStatus}]`);
  console.log('  An empty category here is preferred to an adjacent creator.');
  if (hsStatus !== 'in force') {
    console.log('  NOT YET IN FORCE: the owner approved this standard for addiction-recovery');
    console.log('  only. The other nine are proposed and must be confirmed or trimmed before');
    console.log('  they constrain any further batch.');
  }
  for (const r of hsRows) {
    const state = thinGaps[r.id] ? 'documented' : 'open';
    console.log(`  ${r.n} creator${r.n === 1 ? ' ' : 's'}  ${pad(r.id, 26)} ${pad(state, 11)} ${highStakes[r.id].slice(0, 70)}`);
  }
}

console.log(`\nStill open, by domain (${openWork.length})`);
const byDom = new Map();
for (const r of openWork) {
  if (!byDom.has(r.domain)) byDom.set(r.domain, []);
  byDom.get(r.domain).push(r);
}
for (const [d, rows] of [...byDom].sort((a, b) => b[1].length - a[1].length)) {
  const zero = rows.filter((r) => r.n === 0).length;
  console.log(`  ${pad(d, 15)} ${String(rows.length).padStart(2)} categories  (${zero} with nobody, ${rows.length - zero} partly filled)`);
  const partial = rows.filter((r) => r.n > 0);
  if (partial.length) console.log(`      ${partial.map((r) => `${r.id}:${r.n}`).join('  ')}`);
}

const have = creators.reduce((a, c) => a + (c.categories?.length ?? 0), 0);
const ratio = have / creators.length;
console.log(`\nmappings ${have} of ${cats.length * 5} needed for 5 everywhere  (ratio ${ratio.toFixed(2)}/creator)`);
console.log(`projection at 400 creators: ~${Math.round(400 * ratio)} mappings => ~${Math.round(400 * ratio / 5)} categories at full depth, ~${cats.length - Math.round(400 * ratio / 5)} carrying a gap`);

// ---------------------------------------------------------------- rescues
console.log('\n\nHANDLE RESCUES  (data/handle-rescues.json)');
console.log('='.repeat(72));
if (!existsSync(join(ROOT, 'data/handle-rescues.json'))) {
  console.log('  none recorded');
} else {
  const log = read('data/handle-rescues.json');
  console.log(`${log.rescues.length} case${log.rescues.length === 1 ? '' : 's'} where the obvious handle failed and the`);
  console.log('affiliation search found the real channel.\n');
  for (const r of log.rescues) {
    console.log(`  ${r.name}  ->  ${r.resolvedHandle}`);
    console.log(`    tried:   ${r.handlesTried.join(', ')}`);
    console.log(`    found by: "${r.winningQuery}"`);
    for (const e of r.gateEvidence ?? []) console.log(`    evidence: ${e}`);
    if (r.alreadyInDataset) console.log(`    NOTE: already in the dataset as ${r.alreadyInDataset.join(', ')}`);
    if (r.note) console.log(`    ${r.note}`);
    console.log('');
  }
}
