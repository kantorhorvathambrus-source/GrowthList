#!/usr/bin/env node
/**
 * Evidence dump for editorial writing.
 *
 *   node scripts/evidence.mjs @one @two @three
 *
 * For each handle: identity, size, duration mix, and a sample of real upload
 * titles. This is the raw material the editorial fields are written FROM —
 * descriptions, notFor, level and profile judgements must trace back to
 * something here, never to recollection.
 *
 * ADAPTIVE SCANNING. Scans 50 uploads first, and escalates to 200 only when
 * the first 50 do not contain enough long-form to judge the channel by. The
 * 200-upload standard was adopted because 50 is not enough on shorts-heavy
 * channels — but most channels reveal their duration mix immediately, and
 * scanning 200 every time spends quota and, more expensively, produces output
 * that has to be read. 2 units for a shallow scan, ~5 when it escalates.
 *
 * Pass --deep to force the full 200, or --quick to refuse to escalate (for
 * triaging a candidate you may not write up at all).
 */

import { getChannelByHandle, getUploads, getVideos, statusFromLatestUpload, quotaUsed, redact } from './lib/youtube.mjs';

const argv = process.argv.slice(2);
const DEEP = argv.includes('--deep');
const QUICK = argv.includes('--quick');
// Below this many videos of 8 minutes or more in the sampled window, a shallow
// scan cannot fairly judge whether the channel has a teachable back catalogue.
const LONG_FORM_ENOUGH = 10;
const handles = argv.filter((a) => !a.startsWith('--'));
if (!handles.length) {
  console.error('usage: node scripts/evidence.mjs @one @two');
  process.exit(1);
}

for (const handle of handles) {
  try {
    const c = await getChannelByHandle(handle);
    if (!c) { console.log(`\n### ${handle}\nMISSING — drop it.\n`); continue; }

    // Shallow pass first. Escalate only if this window cannot settle the
    // question — a channel with plenty of long-form in its last 50 needs no
    // second look, and one with none needs the deeper scan to be judged fairly.
    let ups = await getUploads(c.uploadsPlaylist, { max: DEEP ? 200 : 50 });
    let det = await getVideos(ups.map((u) => u.videoId));
    let vids = [...det.values()];
    let scanned = ups.length;
    let escalated = false;

    const longFormCount = (list) => list.filter((v) => (v.durationMin ?? 0) >= 8).length;

    if (!DEEP && !QUICK && longFormCount(vids) < LONG_FORM_ENOUGH && c.videoCount > scanned) {
      escalated = true;
      ups = await getUploads(c.uploadsPlaylist, { max: 200 });
      det = await getVideos(ups.map((u) => u.videoId));
      vids = [...det.values()];
      scanned = ups.length;
    }
    const durs = vids.map((v) => v.durationMin).filter((d) => d != null);
    const shorts = durs.filter((d) => d <= 2).length;
    const mid = durs.filter((d) => d > 2 && d < 20).length;
    const long = durs.filter((d) => d >= 20).length;
    const langs = [...new Set(vids.map((v) => v.defaultAudioLanguage).filter(Boolean))];

    console.log(`\n### ${handle}  —  ${c.title}`);
    console.log(`size ${c.hiddenSubscriberCount ? 'HIDDEN' : c.sizeBucket} | country ${c.country ?? '--'} | ${c.videoCount} vids | status ${statusFromLatestUpload(ups[0]?.publishedAt) ?? '?'} | latest ${(ups[0]?.publishedAt ?? '?').slice(0, 10)}`);
    console.log(`scan: ${scanned} uploads${escalated ? ' (escalated from 50 — long-form was scarce)' : QUICK ? ' (quick, no escalation)' : ''}`);
    console.log(`duration mix of ${durs.length}: <=2m ${shorts} | 3-19m ${mid} | >=20m ${long} | median ${durs.sort((a,b)=>a-b)[Math.floor(durs.length/2)] ?? '?'}m`);
    console.log(`declared audio langs: ${langs.join(', ') || 'none declared'}`);
    console.log(`desc: ${c.description.replace(/\s+/g, ' ').slice(0, 320)}`);
    console.log('long-form candidates (>=8m), newest first:');
    for (const v of vids.filter((v) => (v.durationMin ?? 0) >= 8).slice(0, 12)) {
      console.log(`  ${v.videoId}  ${String(v.durationMin + 'm').padStart(5)}  ${v.title.slice(0, 76)}`);
    }
  } catch (err) {
    console.log(`\n### ${handle}\nERROR ${redact(err.message).slice(0, 120)}\n`);
  }
}
console.log(`\nquota ${JSON.stringify(quotaUsed())}`);
