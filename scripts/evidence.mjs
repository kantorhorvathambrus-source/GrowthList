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
 *
 * --grep <pattern>  KEYWORD-SCAN THE WHOLE SCANNED WINDOW.
 *
 * The title list below is capped at twelve for readability, and for a long
 * time that cap was invisible: this script fetched two hundred uploads,
 * printed twelve, and anyone reading the output had no way to tell which
 * number they were looking at. A triage was inverted by it -- a channel read
 * as a poor category fit on twelve titles and as the best candidate in the
 * round on two hundred.
 *
 * --grep reports against the FULL window and prints the denominator with every
 * count, because "no hits" is a claim about a search and means nothing without
 * the size of what was searched (rule 18). It implies --deep unless --quick is
 * given explicitly, since the point of the flag is to stop drawing conclusions
 * from a sample nobody sized.
 */

import { getChannelByHandle, getUploads, getVideos, statusFromLatestUpload, quotaUsed, redact } from './lib/youtube.mjs';
import { compilePattern, grepTitles } from './lib/title-grep.mjs';

const argv = process.argv.slice(2);
const QUICK = argv.includes('--quick');

// --grep <pattern>. Compiled up front so a malformed pattern fails before a
// single unit is spent, and never as a silent zero.
let GREP = null;
const gAt = argv.indexOf('--grep');
if (gAt !== -1) {
  GREP = compilePattern(argv[gAt + 1] ?? '');
  argv.splice(gAt, 2);
}
// A grep over an unsized window is the defect this flag exists to remove.
const DEEP = argv.includes('--deep') || (GREP !== null && !QUICK);
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
    const allLong = vids.filter((v) => (v.durationMin ?? 0) >= 8);
    console.log(`long-form candidates (>=8m), newest first — showing ${Math.min(12, allLong.length)} of ${allLong.length}:`);
    for (const v of allLong.slice(0, 12)) {
      console.log(`  ${v.videoId}  ${String(v.durationMin + 'm').padStart(5)}  ${v.title.slice(0, 76)}`);
    }
    if (allLong.length > 12) console.log(`  ... ${allLong.length - 12} more not shown — use --grep to search all ${scanned} scanned uploads`);

    if (GREP) {
      const g = grepTitles(vids, GREP);
      console.log(`\ngrep /${g.pattern}/i over ${g.scanned} scanned uploads (channel has ${c.videoCount} total):`);
      console.log(`  ${g.matched} of ${g.scanned} uploads match`);
      console.log(`  ${g.matchedLongForm} of ${g.longForm} long-form (>=8m) uploads match`);
      if (!g.matchedLongForm) {
        console.log('  NO LONG-FORM MATCHES. That is a fact about this pattern and this window,');
        console.log('  not about the channel — say which, and say the denominator (rule 18).');
      }
      const SHOW = 40;
      for (const v of g.hits.slice(0, SHOW)) {
        console.log(`  ${v.videoId}  ${String(v.durationMin + 'm').padStart(5)}  ${(v.publishedAt ?? '').slice(0, 7)}  ${v.title}`);
      }
      if (g.hits.length > SHOW) console.log(`  ... ${g.hits.length - SHOW} more matches not printed — narrow the pattern`);
    }
  } catch (err) {
    console.log(`\n### ${handle}\nERROR ${redact(err.message).slice(0, 120)}\n`);
  }
}
console.log(`\nquota ${JSON.stringify(quotaUsed())}`);
