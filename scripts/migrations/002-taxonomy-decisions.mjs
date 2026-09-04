#!/usr/bin/env node
/**
 * Migration 002 — the owner's taxonomy decisions after the batch-14 review.
 *
 *   node scripts/migrations/002-taxonomy-decisions.mjs [--apply]
 *
 * ADD three categories into the slots freed by migration 001. All three were
 * gaps I proposed and the owner approved with the reasoning intact:
 *   decision-making              — deciding under uncertainty. cognitive-biases
 *                                  and critical-thinking are adjacent; neither
 *                                  is "how to actually make the call".
 *   journaling                   — a staple reflective practice, absent entirely.
 *   personal-style-and-grooming  — large demand and supply; the taxonomy had
 *                                  skincare but nothing on presenting yourself.
 *
 * CUT one:
 *   options-trading — the owner's call and my strongest recommendation.
 *                     Speculative trading is not self-improvement, and the
 *                     supply is dominated by signal-sellers.
 *
 * HELD, not added: `dance` (does the supply teach or only perform?) and
 * `self-defence` (would need rule 12 if it goes in at all).
 *
 * KEPT against my recommendation, and the owner's reasoning is better than
 * mine was: `debate-and-argumentation` (I read it as competitive debating; the
 * demand is "argue a position and hold it under pressure") and
 * `travel-planning` (cost, packing, routing — a skill people do improve at).
 *
 * Net: 195 - 1 + 3 = 197. Three slots stay held against the 200 target.
 * Nothing in money, business or marketing is touched — those wait until
 * they have been researched and the supply is known.
 *
 * Dry run by default.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APPLY = process.argv.includes('--apply');
const p = (...x) => join(ROOT, ...x);

const CUT = ['options-trading'];

const ADD = [
  {
    id: 'decision-making',
    name: 'Decision making',
    domain: 'mindset',
    blurb: 'Making choices under uncertainty deliberately — weighing options, deciding when to decide, and judging the decision separately from the outcome.',
    aliases: ['making decisions', 'decision quality', 'judgement', 'choosing', 'weighing options'],
    relatedCategories: ['cognitive-biases', 'critical-thinking', 'prioritization'],
    levels: {
      beginner: 'Learn to separate a decision from its outcome — a good call can lose and a bad one can win. Start writing down what you expected before you find out.',
      intermediate: 'Work with explicit alternatives and stated assumptions, notice which decisions are reversible and can be made fast, and calibrate how confident you actually are.',
      advanced: 'Handle decisions with genuinely conflicting values or long feedback loops, decide well as a group without averaging everyone into mush, and review past calls honestly enough to learn from them.',
    },
  },
  {
    id: 'journaling',
    name: 'Journaling',
    domain: 'mindset',
    blurb: 'Writing regularly about your own life in a way that produces something — clarity, a record, a decision — rather than just filling pages.',
    aliases: ['journal', 'diary', 'morning pages', 'reflective writing', 'writing practice'],
    relatedCategories: ['self-awareness', 'emotional-regulation', 'habit-formation'],
    levels: {
      beginner: 'Start small and unstructured enough that you actually do it. The habit matters more than the method, and most people quit because they set the bar at an essay.',
      intermediate: 'Use prompts or formats that suit what you want out of it — processing an emotion, thinking a problem through, and keeping a record are different jobs needing different approaches.',
      advanced: 'Reread deliberately rather than only writing, use the archive to notice patterns you would otherwise forget, and recognise when journaling has become rumination rather than reflection.',
    },
  },
  {
    id: 'personal-style-and-grooming',
    name: 'Personal style and grooming',
    domain: 'practical',
    blurb: 'Dressing and presenting yourself deliberately — fit, proportion, and a wardrobe that suits your actual life rather than trends.',
    aliases: ['style', 'fashion', 'dressing well', 'wardrobe', 'grooming', 'how to dress'],
    relatedCategories: ['skincare', 'confidence-building', 'decluttering-and-organizing'],
    levels: {
      beginner: 'Learn fit before anything else — it matters more than brand, price or trend. Work out what you actually wear in a normal week before buying anything.',
      intermediate: 'Build a coherent wardrobe around your real life and climate, understand proportion and colour on your own body, and learn basic alteration and care.',
      advanced: 'Develop a personal register that reads consistently across contexts, judge quality and construction directly, and stop needing external rules for it.',
    },
  },
];

const raw = JSON.parse(readFileSync(p('data/categories.json'), 'utf8'));
const list = raw.categories ?? raw;
console.log(APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written');
console.log('='.repeat(66));

for (const id of CUT) {
  if (!list.some((c) => c.id === id)) throw new Error(`cut target ${id} not found`);
}
for (const c of ADD) {
  if (list.some((x) => x.id === c.id)) throw new Error(`${c.id} already exists`);
  for (const r of c.relatedCategories) {
    if (!list.some((x) => x.id === r) && !ADD.some((x) => x.id === r)) throw new Error(`${c.id} references unknown category ${r}`);
  }
}

let kept = list.filter((c) => !CUT.includes(c.id));
console.log(`\ncut: ${CUT.join(', ')}  (${list.length} -> ${kept.length})`);

let repaired = 0;
for (const c of kept) {
  const next = c.relatedCategories.filter((r) => !CUT.includes(r));
  if (next.length !== c.relatedCategories.length) {
    console.log(`  relatedCategories ${c.id}: dropped ${c.relatedCategories.filter((r) => CUT.includes(r)).join(', ')}`);
    c.relatedCategories = next;
    repaired++;
  }
}
console.log(`  ${repaired} categories had a reference to a cut category repaired`);

const emptyPlan = { week1: { watch: [], do: '' }, week2: { watch: [], do: '' }, week3: { watch: [], do: '' }, week4: { watch: [], do: '' } };
for (const c of ADD) {
  kept.push({ ...c, plan: structuredClone(emptyPlan) });
  console.log(`  added ${c.id}  [${c.domain}]  ${c.aliases.length} aliases`);
}

// Keep the file grouped by domain in its existing domain order, so the diff
// stays readable and the new entries sit with their neighbours.
const order = [...new Set(list.map((c) => c.domain))];
kept.sort((a, b) => order.indexOf(a.domain) - order.indexOf(b.domain));

console.log(`\ntotal: ${kept.length} categories (target 200, so ${200 - kept.length} slots still held)`);

if (!APPLY) { console.log('\nDry run complete. Re-run with --apply to write.'); process.exit(0); }
if (Array.isArray(raw)) writeFileSync(p('data/categories.json'), JSON.stringify(kept, null, 2) + '\n');
else { raw.categories = kept; writeFileSync(p('data/categories.json'), JSON.stringify(raw, null, 2) + '\n'); }
console.log('\nwritten: data/categories.json');
