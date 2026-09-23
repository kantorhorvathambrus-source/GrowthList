#!/usr/bin/env node
/**
 * IS THE PERSON STILL POSTING SOMEWHERE ELSE?
 *
 *   node scripts/audit-stale-channel.mjs
 *
 * THE SADLER CASE. The dataset held `@reasoniocritthinking` — a finished
 * 33-video lecture series, correctly described, honestly marked archive since
 * 2015 — while the same author ran `@gregorybsadler` with 4,071 uploads and
 * posted daily. Every field in that record was accurate. No validator could
 * catch it, because nothing in it was false; the defect was an omission, and
 * it sat there for fifty-nine batches.
 *
 * THE CHECK: THE CHANNEL'S OWN DESCRIPTION. Sadler's said "new channel". We
 * had fetched that text on every audit run and nobody read it. Across 13
 * non-active records it produced exactly one hit and no false positives — the
 * case it was written for, detectable from data already in hand. One unit per
 * record, no search allowance, safe to run before every release.
 *
 * THERE WAS A SECOND CHECK AND IT HAS BEEN DELETED, NOT GATED.
 *
 * It searched each creator's own name through `resolveCreator` and reported
 * other channels bearing it. It was removed on 2026-09-23, and the reason is
 * NOT that it was expensive — though it was, at ~100 units per record and
 * ~2,600 per run against the search allowance, which is the scarcest budget
 * this project has and the one that outlives the daily quota reset.
 *
 * IT WAS REMOVED BECAUSE ITS OUTPUT IS NOT REPRODUCIBLE. Two identical
 * `search.list` queries for "Alan Becker", four minutes apart, returned
 * different channel sets — seven channels present in the first were absent
 * from the second and seven vice versa. Run one surfaced five single-upload
 * channels; run two surfaced one, and a different one.
 *
 * That is fatal in a way cost is not. A check whose hit list changes between
 * runs cannot be evaluated: its false-positive rate cannot be measured, a hit
 * cannot be confirmed by re-running, and a clean run is not evidence of
 * anything. The figure this file used to carry — "four hits, three false",
 * later "five of six false" — was never a rate. It was one draw from a
 * distribution nobody had characterised, quoted as a measurement.
 *
 * A PLANNED FIX WAS ABANDONED FOR THE SAME REASON. Suppressing a hit whose
 * other channel is already `listed` in `probed.json` would have silenced the
 * one recurring false positive we could name (Sadler, whose two records both
 * exist and are both correct). It would have done nothing about the noise,
 * because the noise is a different set of strangers on every run.
 *
 * Do not reinstate this as an opt-in flag. An unreproducible check behind a
 * flag is an unreproducible check.
 *
 * The output below is not a correction. It is a read-and-decide list, never a
 * rewrite.
 */

import { getChannelByHandle, quotaUsed } from './lib/youtube.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data/creators');

const records = [];
for (const f of readdirSync(DIR).filter((x) => /^batch-\d{2}\.json$/.test(x)).sort()) {
  for (const c of JSON.parse(readFileSync(join(DIR, f), 'utf8'))) {
    if (c.status === 'archive' || c.status === 'dormant') records.push({ file: f, c });
  }
}
console.log(`${records.length} archive or dormant records to check\n`);

// Does the channel say so itself?
const SELF_POINTER = /(second channel|main channel|new channel|moved to|now (?:posting|publishing) (?:at|on)|find me (?:at|on))/gi;
const selfPointing = [];
const unreachable = [];
for (const { c } of records) {
  // A thrown error is not a missing channel. getChannelByHandle returns null
  // for a handle that does not exist and throws when the call fails; only the
  // first is a finding, and neither may be silently read as "nothing to see".
  let ch;
  try {
    ch = await getChannelByHandle(c.handle);
  } catch (err) {
    unreachable.push(c.handle);
    console.log(`  COULD NOT CHECK        ${c.name} (${c.handle}) — ${String(err.message).slice(0, 70)}`);
    continue;
  }
  if (!ch) {
    unreachable.push(c.handle);
    console.log(`  HANDLE DOES NOT RESOLVE ${c.name} (${c.handle})`);
    continue;
  }
  const hits = [...new Set((ch.description ?? '').match(SELF_POINTER) ?? [])];
  if (hits.length) {
    selfPointing.push({ name: c.name, handle: c.handle, hits });
    console.log(`  ** SAYS SO ITSELF **   ${c.name} (${c.handle}) — "${hits.join('", "')}"`);
  }
}

console.log(`\n${selfPointing.length} record(s) whose own channel description points somewhere else.`);
console.log(`${records.length - unreachable.length} of ${records.length} checked; ${unreachable.length} could not be checked.`);
console.log('quota', JSON.stringify(quotaUsed()));
if (unreachable.length) process.exit(1);
