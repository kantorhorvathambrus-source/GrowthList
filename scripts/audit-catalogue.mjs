#!/usr/bin/env node
/**
 * THE MEASUREMENT BEHIND THE PROSE, STORED SO IT CAN DRIFT VISIBLY.
 *
 *   node scripts/audit-catalogue.mjs             report drift against stored
 *   node scripts/audit-catalogue.mjs --write     store / refresh the baseline
 *
 * 231 of 233 records ship a countable claim about a channel's catalogue —
 * "thirty-four of the fifty most recent uploads are under two minutes",
 * "median fifteen minutes", "5,255 uploads". Every one of those is a claim
 * about a moving target, written once at research time, and NONE of them was
 * checkable, because the measurement existed only inside a sentence.
 *
 * This is the same defect as `status` and the handle list, in the place it is
 * hardest to see: the prose. The fix is the one that already works elsewhere
 * in this project — `domain-notes.json` stores its counts and the validator
 * fails when they drift, which caught five stale measurements in one pass that
 * review had missed across nine batches. So the catalogue measurement is now
 * stored next to the prose it justifies.
 *
 * It does NOT parse the prose. A regex over 233 hand-written sentences would
 * be a new source of false claims, not a check on the old one. What it gives
 * is the number the sentence was written from, dated, so that a later run can
 * say "this channel was 68% short-form when the record was written and is 20%
 * now" and a human can decide whether the sentence still holds.
 *
 * ~4 quota units per creator.
 */

import { getChannelByHandle, getUploads, getVideos, quotaUsed } from './lib/youtube.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data/creators');
const WRITE = process.argv.includes('--write');
const SCAN = 50;

/** Percentage-point change that means the prose may no longer be true. Chosen
 *  to be loose: this flags for reading, it does not assert an error. */
const DRIFT_PP = 15;

function measure(vids) {
  const mins = vids.map((v) => v.durationMin).filter((n) => typeof n === 'number').sort((a, b) => a - b);
  if (!mins.length) return null;
  const short = mins.filter((m) => m <= 2).length;
  const long = mins.filter((m) => m >= 20).length;
  return {
    scanned: mins.length,
    shortPct: Math.round((100 * short) / mins.length),
    longPct: Math.round((100 * long) / mins.length),
    medianMin: mins[Math.floor(mins.length / 2)],
  };
}

const files = readdirSync(DIR).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort();
const drift = [];
const unresolved = [];
const fresh = [];

for (const f of files) {
  const path = join(DIR, f);
  const list = JSON.parse(readFileSync(path, 'utf8'));
  let touched = false;

  for (const rec of list) {
    let ch;
    try { ch = await getChannelByHandle(rec.handle); } catch { ch = null; }
    // A CHANNEL THAT NO LONGER RESOLVES MUST NOT KEEP A MEASUREMENT THAT LOOKS
    // CURRENT. `continue` here left the old `catalogue` block in place, dated
    // to the last successful run, indistinguishable from one just taken — the
    // same shape as derive-entity's --write that never cleared. Mark it.
    if (!ch) {
      console.log(`  UNRESOLVED ${rec.handle} (${rec.name}) [${f}]`);
      unresolved.push(rec.handle);
      if (WRITE && rec.catalogue) { rec.catalogue.unresolvedAt = new Date().toISOString().slice(0, 7); touched = true; }
      continue;
    }
    const ups = await getUploads(ch.uploadsPlaylist, { max: SCAN });
    const vids = [...(await getVideos(ups.map((u) => u.videoId))).values()];
    const now = measure(vids);
    if (!now) continue;
    now.videoCount = ch.videoCount;
    // A successful re-measure clears any previous unresolved marker.
    if (rec.catalogue?.unresolvedAt) delete rec.catalogue.unresolvedAt;
    now.at = new Date().toISOString().slice(0, 7);

    const was = rec.catalogue;
    if (!was) {
      fresh.push(rec.handle);
    } else {
      const dShort = Math.abs(now.shortPct - was.shortPct);
      const dLong = Math.abs(now.longPct - was.longPct);
      if (dShort >= DRIFT_PP || dLong >= DRIFT_PP) {
        drift.push({
          file: f, handle: rec.handle, name: rec.name, was, now,
          note: `short ${was.shortPct}%->${now.shortPct}%, long ${was.longPct}%->${now.longPct}%, median ${was.medianMin}m->${now.medianMin}m, uploads ${was.videoCount}->${now.videoCount}`,
        });
      }
    }
    if (WRITE) { rec.catalogue = now; touched = true; }
  }
  if (WRITE && touched) writeFileSync(path, JSON.stringify(list, null, 2) + '\n');
}

if (fresh.length) console.log(`\nNO BASELINE STORED for ${fresh.length} creators — this run establishes it.`);
console.log(`\nCATALOGUE DRIFT past ${DRIFT_PP} percentage points: ${drift.length}`);
for (const d of drift) {
  console.log(`  ${d.name} (${d.handle}) [${d.file}]`);
  console.log(`    ${d.note}`);
  console.log(`    -> re-read this record's prose: it may describe a catalogue that no longer exists.`);
}
if (unresolved.length) console.log(`\n${unresolved.length} channel(s) did not resolve; their stored catalogue is marked unresolvedAt rather than left looking current.`);
if (WRITE) console.log('\nbaseline written into the batch files.');
else console.log('\nreport only — pass --write to store the baseline.');
console.log('quota', JSON.stringify(quotaUsed()));
