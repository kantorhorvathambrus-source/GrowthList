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
 * Scans 200 uploads per creator (the agreed standard: 50 is not enough on
 * shorts-heavy channels). ~5 quota units per creator.
 */

import { getChannelByHandle, getUploads, getVideos, statusFromLatestUpload, quotaUsed, redact } from './lib/youtube.mjs';

const handles = process.argv.slice(2);
if (!handles.length) {
  console.error('usage: node scripts/evidence.mjs @one @two');
  process.exit(1);
}

for (const handle of handles) {
  try {
    const c = await getChannelByHandle(handle);
    if (!c) { console.log(`\n### ${handle}\nMISSING — drop it.\n`); continue; }

    const ups = await getUploads(c.uploadsPlaylist, { max: 200 });
    const det = await getVideos(ups.map((u) => u.videoId));
    const vids = [...det.values()];
    const durs = vids.map((v) => v.durationMin).filter((d) => d != null);
    const shorts = durs.filter((d) => d <= 2).length;
    const mid = durs.filter((d) => d > 2 && d < 20).length;
    const long = durs.filter((d) => d >= 20).length;
    const langs = [...new Set(vids.map((v) => v.defaultAudioLanguage).filter(Boolean))];

    console.log(`\n### ${handle}  —  ${c.title}`);
    console.log(`size ${c.hiddenSubscriberCount ? 'HIDDEN' : c.sizeBucket} | country ${c.country ?? '--'} | ${c.videoCount} vids | status ${statusFromLatestUpload(ups[0]?.publishedAt) ?? '?'} | latest ${(ups[0]?.publishedAt ?? '?').slice(0, 10)}`);
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
