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
