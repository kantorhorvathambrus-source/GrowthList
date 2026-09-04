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
  for (const r of thinDocumented) console.log(`  ${r.n} creator${r.n === 1 ? ' ' : 's'}  ${pad(r.id, 30)} ${pad(r.domain, 14)} ${thinGaps[r.id]}`);
}

// High-stakes categories get called out by name: an empty one there is a
// deliberate outcome under rule 12, not an oversight to be tidied away later.
let highStakes = {};
const hsPath = join(ROOT, 'data/high-stakes.json');
if (existsSync(hsPath)) highStakes = read('data/high-stakes.json').categories ?? {};
const hsRows = under.filter((r) => highStakes[r.id]);
if (hsRows.length) {
  console.log(`\nHIGHER-STAKES categories below target (${hsRows.length}) — rule 12`);
  console.log('  An empty category here is preferred to an adjacent creator.');
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
