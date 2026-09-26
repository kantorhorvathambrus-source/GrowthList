#!/usr/bin/env node
/**
 * HOW MANY ENTRY VIDEOS SIT OUTSIDE THEIR CHANNEL'S NEWEST 50 UPLOADS, TODAY.
 *
 *   node scripts/audit-entry-window.mjs            report only
 *   node scripts/audit-entry-window.mjs --write    store data/entry-window-audit.json
 *
 * WHY THIS EXISTS. The colophon told visitors that entry videos are "picked
 * from the creator's recent uploads, so a good introduction published years
 * ago is one we will not have seen." Measured in batch 64 it was false: 109 of
 * 373 entry videos sat outside their channel's newest 50, and several were
 * chosen deliberately from a full catalogue read. The sentence described a
 * blind spot we had been working around.
 *
 * WHAT IT CAN AND CANNOT SAY. It measures the PRESENT: is this video among the
 * channel's 50 newest uploads right now. It cannot say how the video was found
 * — a busy channel pushes a pick out of its newest 50 over time, so "outside
 * today" and "outside when picked" differ. Copy built on this number states the
 * present measurement and nothing about method at the time.
 *
 * RULE 20 — WHAT WOULD BROKEN LOOK LIKE? If an uploads fetch came back empty
 * for a channel that has uploads, every one of its videos would read as
 * "outside" and the count would inflate silently. So an empty window on a
 * channel reporting videos is COULD-NOT-CHECK, never a finding. The same for a
 * thrown error (never mapped to a domain value) and for a handle that no longer
 * resolves. Any could-not-check record makes the run exit non-zero, and --write
 * then stores null counts rather than a partial number: a count over a subset
 * is not the count the colophon states.
 *
 * Cost: 2 units per creator (channels.list + one playlistItems page), no
 * search allowance. ~560 units at 259 creators. Imports read: youtube.mjs only.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getChannelByHandle, getUploads, quotaUsed } from './lib/youtube.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data/creators');
const OUT = join(ROOT, 'data/entry-window-audit.json');
const WINDOW = 50;
const WRITE = process.argv.includes('--write');

const rows = [];
const couldNotCheck = [];

const files = readdirSync(DIR).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort();
for (const f of files) {
  for (const c of JSON.parse(readFileSync(join(DIR, f), 'utf8'))) {
    const vids = (c.categories ?? []).filter((m) => m.entryVideo?.videoId).map((m) => m.entryVideo.videoId);
    if (!vids.length) continue;
    let ch;
    try {
      ch = await getChannelByHandle(c.handle);
    } catch (err) {
      couldNotCheck.push({ id: c.id, why: `channel lookup failed: ${err.message.slice(0, 80)}` });
      continue;
    }
    if (!ch) { couldNotCheck.push({ id: c.id, why: 'handle does not resolve' }); continue; }
    let ups;
    try {
      ups = await getUploads(ch.uploadsPlaylist, { max: WINDOW });
    } catch (err) {
      couldNotCheck.push({ id: c.id, why: `uploads fetch failed: ${err.message.slice(0, 80)}` });
      continue;
    }
    if (!ups.length && Number(ch.videoCount) > 0) {
      couldNotCheck.push({ id: c.id, why: `uploads came back empty for a channel reporting ${ch.videoCount} videos` });
      continue;
    }
    const inWindow = new Set(ups.map((u) => u.videoId));
    for (const v of vids) rows.push({ batch: f.slice(6, 8), id: c.id, videoId: v, inWindow: inWindow.has(v) });
  }
}

const outside = rows.filter((r) => !r.inWindow);
console.log(`entry videos measured: ${rows.length}`);
console.log(`outside their channel's newest ${WINDOW} uploads today: ${outside.length}`);
console.log(`could not check: ${couldNotCheck.length} creator(s)`);
for (const x of couldNotCheck) console.log(`  ${x.id} — ${x.why}`);
console.log(`quota ${JSON.stringify(quotaUsed())}`);

const complete = couldNotCheck.length === 0;
if (WRITE) {
  writeFileSync(OUT, JSON.stringify({
    at: new Date().toISOString(),
    window: WINDOW,
    // null, not a partial count, when anything could not be checked: the
    // colophon states one number about every entry video, and a count over a
    // subset is a different claim wearing the same words.
    entryVideosMeasured: complete ? rows.length : null,
    entryVideosOutsideWindow: complete ? outside.length : null,
    couldNotCheck,
    outside: outside.map(({ id, videoId }) => ({ id, videoId })),
  }, null, 2) + '\n');
  console.log(`\nwrote ${OUT}${complete ? '' : ' — counts stored as null because the run was incomplete'}`);
} else {
  console.log('\nreport only — pass --write to store the measurement.');
}
if (!complete) process.exit(1);
