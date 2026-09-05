#!/usr/bin/env node
/**
 * RE-QUERY EVERY CREATOR'S `status`.
 *
 *   node scripts/audit-status.mjs            report only
 *   node scripts/audit-status.mjs --write    apply corrections to batch files
 *
 * `status` is written once, at research time, and then never checked again.
 * A creator researched in batch 03 has carried that word for forty batches
 * while their channel did whatever it did. This is the same defect as the
 * handle list typed from memory: a stored fact that stopped being queried.
 *
 * It also fixes a real gap in the threshold. `statusFromLatestUpload` was a
 * binary at 730 days, so a channel silent for twenty-one months read as
 * `active` — indistinguishable from one that posted this morning. For a site
 * that tells somebody to go and learn from a person, that is a difference
 * worth carrying, so `dormant` sits between them at 365 days.
 *
 * Cost: ~2 units per creator (channels.list batched, then one playlistItems
 * page each).
 */

import { getChannelByHandle, getUploads, statusFromLatestUpload, quotaUsed } from './lib/youtube.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const DIR = join(ROOT, 'data/creators');

const files = readdirSync(DIR).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort();
const rows = [];
for (const f of files) {
  const list = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  for (const c of list) rows.push({ file: f, rec: c });
}
console.log(`re-querying ${rows.length} creators across ${files.length} batch files\n`);

const changes = [];
const gone = [];
for (const { file, rec } of rows) {
  let ch;
  try {
    ch = await getChannelByHandle(rec.handle);
  } catch (err) {
    console.log(`  ERROR ${rec.handle}: ${err.message}`);
    continue;
  }
  // `status` has a CLOSED vocabulary with no way to say "we could not check".
  // Leaving the old value is the derive-entity defect — a stale confident value
  // surviving a failed re-derivation — and here it cannot be expressed as a gap
  // instead. So it escalates: the run exits non-zero and names the record.
  if (!ch) { gone.push({ file, rec }); continue; }
  const ups = await getUploads(ch.uploadsPlaylist, { max: 1 });
  const latest = ups[0]?.publishedAt ?? null;
  const actual = statusFromLatestUpload(latest);
  if (actual && actual !== rec.status) {
    changes.push({ file, handle: rec.handle, name: rec.name, was: rec.status, now: actual, latest: (latest ?? '?').slice(0, 10) });
  }
}

if (gone.length) {
  console.log(`CHANNELS THAT NO LONGER RESOLVE (${gone.length}) — these need a human decision:`);
  for (const g of gone) console.log(`  ${g.rec.handle}  ${g.rec.name}  [${g.file}]`);
  console.log('');
}

console.log(`STATUS DRIFT: ${changes.length} of ${rows.length} records disagree with the API.`);
for (const c of changes) {
  console.log(`  ${c.was} -> ${c.now}   ${c.handle}  ${c.name}   last upload ${c.latest}  [${c.file}]`);
}

if (WRITE && changes.length) {
  const byFile = new Map();
  for (const c of changes) {
    if (!byFile.has(c.file)) byFile.set(c.file, []);
    byFile.get(c.file).push(c);
  }
  for (const [f, list] of byFile) {
    const p = join(DIR, f);
    const data = JSON.parse(readFileSync(p, 'utf8'));
    for (const c of list) {
      const rec = data.find((r) => r.handle === c.handle);
      if (rec) rec.status = c.now;
    }
    writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  }
  console.log(`\nwrote corrections to ${byFile.size} batch file${byFile.size === 1 ? '' : 's'}.`);
} else if (changes.length) {
  console.log('\nreport only — pass --write to apply.');
}
console.log('quota', JSON.stringify(quotaUsed()));
if (gone.length) {
  console.error(`\n${gone.length} record(s) name a channel that no longer resolves, and their stored status is now unverifiable. Exiting non-zero: a status nobody can check must not pass silently.`);
  process.exit(1);
}
