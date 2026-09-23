#!/usr/bin/env node
/**
 * Migration 003 — retire `confidence-building`, and rewrite
 * `charisma-and-presence`'s blurb so it names a practice.
 *
 *   node scripts/migrations/003-retire-confidence-building.mjs [--apply]
 *
 * RETIRE: confidence-building (rule 22 — an outcome, not a practice).
 *
 * The rule-22 reading was never the deciding evidence, because it can be
 * argued either way for most mindset categories. What decided it is what the
 * category actually held. Two creators, both mapped `secondary`, and one of
 * them (Skillopedia) dormant — so the validator was already failing it with
 * "2 creators but only 1 active". The single live mapping belonged to
 * charismaoncommand, whose primary subject is charisma-and-presence, and
 * whose `why` here argued AGAINST the category's own premise: "separates
 * looking confident from being confident, and argues the performance is the
 * weaker of the two". Nothing in this category was anybody's main work.
 *
 * That is the rule-22 prediction confirmed from the data rather than asserted
 * from the name: an outcome has no profession behind it, so nobody teaches it
 * for a living, so the category fills with other people's side mappings.
 *
 * REWRITE: charisma-and-presence's blurb. The category is KEPT — it has an
 * active `primary` creator whose actual subject it is, which is exactly what
 * confidence-building lacked. But rule 22 tests the BLURB, not the name, and
 * the old blurb was an outcome sentence: "Being someone people attend to and
 * trust..." — you cannot go and do being-someone. The new one names what the
 * three creators teach: observable, adjustable behaviour.
 *
 * NOT A BACKFILL. The slot is not refilled to keep a count up (rule 22).
 * 194 -> 193 categories.
 *
 * Dry run by default.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APPLY = process.argv.includes('--apply');
const p = (...x) => join(ROOT, ...x);

const CUT = 'confidence-building';

const NEW_BLURB = 'Adjusting the observable behaviours people read as warmth and authority — where your attention goes, how you take up space, and what you do when a room turns to you.';

// A dropped reference leaves a category with a shorter related list, which is
// a quiet loss of navigation rather than a neutral edit. Each one names a
// replacement and why that one.
const RELATED_SWAP = {
  'self-awareness':              ['journaling',            'the reflective practice that produces the noticing self-awareness is about'],
  'perfectionism':               ['anxiety-management',    'the mechanism underneath most perfectionism, and a practice rather than a trait'],
  'charisma-and-presence':       ['conversation-skills',   'where two of its three creators also sit; the adjacent practice a visitor actually wants next'],
  'dating-skills':               ['charisma-and-presence', 'the social-behaviour practice confidence-building was standing in for here'],
  'personal-style-and-grooming': ['charisma-and-presence', 'presenting yourself, which is the practice this category borders on'],
};

const REDIRECT = {
  to: 'charisma-and-presence',
  retiredAt: '2026-09',
  reason:
    'An outcome, not a practice (rule 22) — and confirmed by what it held rather than asserted from the name: two secondary mappings, one of them dormant, and no creator whose main work it was.',
  'why-this-destination':
    'charismaoncommand held the only live mapping here and is still listed, as the primary creator of charisma-and-presence — so a visitor arriving on the old slug lands on the creator they would have found, rather than on a topic index.',
};

console.log(APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written');
console.log('='.repeat(70));

// ---------------------------------------------------------------- categories
const raw = JSON.parse(readFileSync(p('data/categories.json'), 'utf8'));
const list = raw.categories ?? raw;
if (!list.some((c) => c.id === CUT)) throw new Error(`${CUT} not found — already retired?`);

const charisma = list.find((c) => c.id === 'charisma-and-presence');
if (!charisma) throw new Error('charisma-and-presence not found');
console.log('\nblurb rewrite — charisma-and-presence');
console.log('  was: ' + charisma.blurb);
console.log('  now: ' + NEW_BLURB);
charisma.blurb = NEW_BLURB;

const kept = list.filter((c) => c.id !== CUT);
console.log(`\ncut: ${CUT}   (${list.length} -> ${kept.length} categories)`);

console.log('\nrelatedCategories — substituted, not dropped:');
for (const c of kept) {
  if (!(c.relatedCategories ?? []).includes(CUT)) continue;
  const [swap, why] = RELATED_SWAP[c.id] ?? [];
  if (!swap) throw new Error(`no replacement named for ${c.id} — refusing to silently shorten its list`);
  if (!kept.some((x) => x.id === swap)) throw new Error(`replacement ${swap} for ${c.id} is not a live category`);
  if (c.relatedCategories.includes(swap)) throw new Error(`${c.id} already lists ${swap} — would duplicate`);
  c.relatedCategories = c.relatedCategories.map((r) => (r === CUT ? swap : r));
  console.log(`  ${c.id.padEnd(30)} ${CUT} -> ${swap}`);
  console.log(`  ${''.padEnd(30)} (${why})`);
}
for (const c of kept) {
  if ((c.relatedCategories ?? []).includes(CUT)) throw new Error(`${c.id} still references ${CUT}`);
}

// ---------------------------------------------------------------- creators
console.log('\ncreator mappings removed:');
const files = readdirSync(p('data/creators')).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort();
const creatorEdits = [];
for (const f of files) {
  const arr = JSON.parse(readFileSync(p('data/creators', f), 'utf8'));
  let touched = false;
  for (const c of arr) {
    const before = c.categories.length;
    const hit = c.categories.find((m) => m.id === CUT);
    if (!hit) continue;
    c.categories = c.categories.filter((m) => m.id !== CUT);
    touched = true;
    console.log(`  ${f}  ${c.id}  (${before} -> ${c.categories.length} mappings)  was ${hit.strength}`);
    if (!c.categories.length) throw new Error(`${c.id} would be left with no mappings`);
  }
  if (touched) creatorEdits.push([f, arr]);
}
if (!creatorEdits.length) console.log('  (none found)');

// ---------------------------------------------------------------- redirect
const red = JSON.parse(readFileSync(p('data/retired-categories.json'), 'utf8'));
if (red.redirects[CUT]) throw new Error(`${CUT} already has a redirect`);
if (!kept.some((c) => c.id === REDIRECT.to)) throw new Error(`redirect target ${REDIRECT.to} is not a live category`);
red.redirects[CUT] = REDIRECT;
console.log(`\nredirect: ${CUT} -> ${REDIRECT.to}`);

if (!APPLY) { console.log('\nDry run complete. Re-run with --apply to write.'); process.exit(0); }

if (Array.isArray(raw)) writeFileSync(p('data/categories.json'), JSON.stringify(kept, null, 2) + '\n');
else { raw.categories = kept; writeFileSync(p('data/categories.json'), JSON.stringify(raw, null, 2) + '\n'); }
for (const [f, arr] of creatorEdits) writeFileSync(p('data/creators', f), JSON.stringify(arr, null, 2) + '\n');
writeFileSync(p('data/retired-categories.json'), JSON.stringify(red, null, 2) + '\n');
console.log('\nwritten: data/categories.json, data/retired-categories.json, ' + creatorEdits.map(([f]) => f).join(', '));
