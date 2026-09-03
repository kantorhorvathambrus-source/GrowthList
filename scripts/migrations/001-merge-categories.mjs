#!/usr/bin/env node
/**
 * Migration 001 — merge four over-split categories into their parents.
 *
 *   node scripts/migrations/001-merge-categories.mjs [--apply]
 *
 * The owner approved proposals 1-4 in REBALANCE.md and declined 5 and 6.
 * Approved:
 *   vocal-delivery      -> public-speaking
 *   time-blocking       -> deep-work-and-focus
 *   energy-management   -> deep-work-and-focus
 *   weekly-review       -> task-management-systems
 *   spaced-repetition   -> memory-techniques
 *
 * Declined and NOT touched: active-listening, giving-feedback. Both free one
 * slot but cost two mappings, so they would make coverage worse.
 *
 * Taxonomy goes 200 -> 196. The four freed slots are deliberately HELD until
 * the eleven unresearched domains have had a pass and supply is known —
 * inventing categories now would be speculation.
 *
 * Dry run by default: prints every change and writes nothing.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APPLY = process.argv.includes('--apply');
const p = (...x) => join(ROOT, ...x);
const read = (f) => JSON.parse(readFileSync(p(f), 'utf8'));

const MERGE = {
  'vocal-delivery': 'public-speaking',
  'time-blocking': 'deep-work-and-focus',
  'energy-management': 'deep-work-and-focus',
  'weekly-review': 'task-management-systems',
  'spaced-repetition': 'memory-techniques',
};

// Widened definitions for the survivors. A merge that leaves the parent's
// blurb untouched silently drops the absorbed scope from the taxonomy, so each
// survivor is rewritten to actually cover what it now owns.
const REWRITE = {
  'public-speaking': {
    blurb: 'Delivering a talk that holds attention and lands its point, including the voice that carries it.',
    addAliases: ['voice training', 'speaking voice', 'diction', 'articulation', 'vocal delivery'],
    levels: {
      beginner: 'Get reps in low-stakes settings and learn basic structure. Work on breath support and articulation, and listen back to your own recorded voice enough times to stop flinching at it.',
      advanced: 'Develop range across formats and room sizes, adapt live to an audience that is not responding as expected, and build the vocal stamina to hold a large room without a microphone.',
    },
  },
  'deep-work-and-focus': {
    blurb: 'Building the capacity for sustained concentration on demanding work, and putting it in the hours you can actually do it.',
    addAliases: ['calendar blocking', 'timeboxing', 'day planning', 'managing energy', 'recovery', 'chronotype'],
    levels: {
      beginner: 'Remove the obvious interrupters and practise short focused sessions. Block time for your hardest work before the day fills up, and notice when in the day you are actually sharp.',
      advanced: 'Sustain demanding cognitive work over long periods, design a calendar around energy and collaboration patterns rather than around meetings, and plan load and recovery across months rather than days.',
    },
  },
  'task-management-systems': {
    blurb: 'Running a trusted system for commitments, and reviewing it often enough to keep trusting it.',
    addAliases: ['weekly review', 'review ritual', 'planning session', 'retrospective'],
    levels: {
      beginner: 'Get everything out of your head into one list, define next actions physically, and book a short recurring slot to clear inboxes and choose what must happen next.',
      advanced: 'Run a system across work and personal domains at high volume, review at multiple horizons — weekly, quarterly, annual — and simplify ruthlessly when maintenance starts exceeding value.',
    },
  },
  'memory-techniques': {
    blurb: 'Making material stick — mnemonic structure for what you must recall, and scheduled retrieval for what you must retain.',
    addAliases: ['anki', 'flashcards', 'active recall', 'srs', 'retrieval practice', 'spaced repetition'],
    levels: {
      beginner: 'Learn the method of loci on something small, and understand why testing yourself beats rereading. Start a small deck with atomic cards rather than importing someone else\'s.',
      advanced: 'Build large reusable memory systems, tune scheduling and deck design for long-term collections, and recognise the material where neither mnemonics nor repetition substitutes for understanding.',
    },
  },
};

// Creator mappings that collapse. Where a creator already holds the survivor,
// the absorbed mapping is dropped and the survivor's `why` is widened by hand
// so the merged scope is still described. Nothing is auto-generated.
const WIDEN_WHY = {
  askvinh: {
    'public-speaking': 'Drills the mechanics of speaking while people are watching you — pace, pauses, the voice itself, and what to do with the nerves rather than how to suppress them.',
  },
  calnewport: {
    'deep-work-and-focus': 'This is the primary source for the concept everything else in the category is quoting, argued by the person who defined it — including how to put the work in the hours you can actually do it.',
  },
  carlpullein: {
    'task-management-systems': 'Organises commitments by when they must be done rather than by project or context, and treats the recurring review as the thing that keeps the system trustworthy.',
  },
};

const cats = read('data/categories.json');
const list = cats.categories ?? cats;
const removed = Object.keys(MERGE);

console.log(APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written');
console.log('='.repeat(66));

// 1. drop merged categories
const kept = list.filter((c) => !removed.includes(c.id));
console.log(`\ncategories: ${list.length} -> ${kept.length} (removed ${removed.join(', ')})`);

// 2. rewrite survivors
for (const [id, r] of Object.entries(REWRITE)) {
  const c = kept.find((x) => x.id === id);
  if (!c) throw new Error(`survivor ${id} not found`);
  c.blurb = r.blurb;
  for (const a of r.addAliases) if (!c.aliases.includes(a)) c.aliases.push(a);
  c.levels.beginner = r.levels.beginner;
  c.levels.advanced = r.levels.advanced;
  console.log(`  widened ${id}: ${c.aliases.length} aliases, blurb and beginner/advanced levels rewritten`);
}

// 3. repair relatedCategories — repoint at the survivor, drop self-references
let fixed = 0;
for (const c of kept) {
  const before = [...c.relatedCategories];
  const next = [];
  for (const r of c.relatedCategories) {
    const target = MERGE[r] ?? r;
    if (target !== c.id && !next.includes(target)) next.push(target);
  }
  if (JSON.stringify(before) !== JSON.stringify(next)) {
    c.relatedCategories = next;
    fixed++;
    console.log(`  relatedCategories ${c.id}: [${before.join(', ')}] -> [${next.join(', ')}]`);
  }
}
console.log(`  ${fixed} categories had relatedCategories repaired`);

// 4. remap creator mappings across every batch file
const batchDir = 'data/creators';
const { readdirSync } = await import('node:fs');
let remapped = 0, collapsed = 0, widened = 0;
const touched = [];
for (const f of readdirSync(p(batchDir)).filter((n) => /^batch-\d+\.json$/.test(n))) {
  const recs = read(join(batchDir, f));
  let dirty = false;
  for (const c of recs) {
    const out = [];
    for (const m of c.categories) {
      const target = MERGE[m.id];
      if (!target) { out.push(m); continue; }
      const existing = out.find((x) => x.id === target) || c.categories.find((x) => x.id === target);
      if (existing) {
        console.log(`  ${c.id}: dropped ${m.id}/${m.strength} — already holds ${target}`);
        collapsed++; dirty = true; continue;
      }
      console.log(`  ${c.id}: ${m.id}/${m.strength} -> ${target}/${m.strength}`);
      out.push({ ...m, id: target });
      remapped++; dirty = true;
    }
    c.categories = out;
    for (const [id, why] of Object.entries(WIDEN_WHY[c.id] ?? {})) {
      const m = c.categories.find((x) => x.id === id);
      if (m && m.why !== why) { m.why = why; widened++; dirty = true; console.log(`  ${c.id}: widened "why" on ${id}`); }
    }
  }
  if (dirty) { touched.push([f, recs]); }
}
console.log(`\n${remapped} mappings repointed, ${collapsed} collapsed as duplicates, ${widened} why-strings widened`);

if (!APPLY) {
  console.log('\nDry run complete. Re-run with --apply to write.');
  process.exit(0);
}

if (Array.isArray(cats)) writeFileSync(p('data/categories.json'), JSON.stringify(kept, null, 2) + '\n');
else { cats.categories = kept; writeFileSync(p('data/categories.json'), JSON.stringify(cats, null, 2) + '\n'); }
for (const [f, recs] of touched) writeFileSync(p(batchDir, f), JSON.stringify(recs, null, 2) + '\n');
console.log(`\nwritten: data/categories.json and ${touched.length} batch file(s)`);
