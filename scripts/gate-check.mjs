#!/usr/bin/env node
/**
 * THE ATTRIBUTION GATE, run over a finished batch file.
 *
 *   node scripts/gate-check.mjs data/creators/batch-01.json
 *
 * The rule this phase turns on: a video stays in the dataset only if the API
 * says `snippet.channelId` equals the creator's own channel id. Nothing else
 * counts as proof — a title that names the creator does not, a search result
 * does not, and a recollection certainly does not.
 *
 * It also re-checks the three fields that are easy to get subtly wrong by
 * hand: the title, the duration, and public/embeddable status. A play button
 * that does nothing is worse than a creator with no entry video.
 *
 * Exits non-zero on any failure. ~1 unit per creator plus 1 per 50 videos.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { getChannelByHandle, getVideos, attributeVideo, quotaUsed, redact } from './lib/youtube.mjs';

// MANY FILES, NOT ONE. The standing policy is "run gate-check over EVERY batch
// file before any release, not only when a batch is first written" — and the
// tool took a single path, so that policy could only ever have been carried out
// by hand, forty-five times, which means it never was. A rule the tooling makes
// impractical is a rule that is not in force.
//   node scripts/gate-check.mjs data/creators/batch-07.json
//   node scripts/gate-check.mjs --all
const argv = process.argv.slice(2);
let files = argv.filter((a) => a !== '--all');
if (argv.includes('--all') || !files.length) {
  const dir = 'data/creators';
  files = readdirSync(dir).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort().map((f) => `${dir}/${f}`);
  if (!argv.includes('--all')) {
    console.error('usage: node scripts/gate-check.mjs <batch file...> | --all');
    process.exit(1);
  }
}

const creators = files.flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
const fails = [];
const warns = [];

// Every entry video in the file, in one videos.list sweep.
const ids = new Set();
for (const c of creators) for (const m of c.categories ?? []) if (m.entryVideo?.videoId) ids.add(m.entryVideo.videoId);
const details = await getVideos([...ids]);

let checked = 0;

for (const c of creators) {
  let channel;
  try {
    channel = await getChannelByHandle(c.handle);
  } catch (err) {
    fails.push(`${c.id}: channel lookup failed — ${redact(err.message).slice(0, 120)}`);
    continue;
  }
  if (!channel) {
    fails.push(`${c.id}: handle ${c.handle} does not resolve`);
    continue;
  }

  // The record's own claims about the channel, re-checked against the API.
  if (channel.channelUrl.toLowerCase() !== c.channelUrl.toLowerCase()) {
    fails.push(`${c.id}: channelUrl ${c.channelUrl} but API says ${channel.channelUrl}`);
  }
  const bucket = channel.hiddenSubscriberCount ? null : channel.sizeBucket;
  if (bucket && bucket !== c.sizeBucket) {
    warns.push(`${c.id}: sizeBucket "${c.sizeBucket}" but API now says "${bucket}"`);
  }
  // `country` is optional in the schema and the API returns null for a channel
  // that does not declare one, so an absent field and a null API value are the
  // same fact. Comparing them raw made every legitimately country-less creator
  // fail the gate.
  if ((channel.country ?? null) !== (c.country ?? null)) {
    fails.push(`${c.id}: country ${JSON.stringify(c.country ?? null)} but API says ${JSON.stringify(channel.country ?? null)}`);
  }

  for (const m of c.categories ?? []) {
    const where = `${c.id} -> ${m.id}`;
    const claim = m.entryVideo;
    if (!claim?.videoId) { fails.push(`${where}: no entryVideo`); continue; }

    const video = details.get(claim.videoId);
    const gate = attributeVideo(video, channel.channelId, { requireEmbeddable: true });
    checked++;

    if (!gate.ok) { fails.push(`${where}: ${claim.videoId} REJECTED — ${gate.reason}`); continue; }

    if (video.title !== claim.title) {
      fails.push(`${where}: title mismatch\n      file: ${claim.title}\n      API : ${video.title}`);
    }
    if (claim.durationMin != null && video.durationMin !== claim.durationMin) {
      fails.push(`${where}: durationMin ${claim.durationMin} but API says ${video.durationMin}`);
    }
    // A non-English entry video is only a problem when the RECORD claims
    // English. A creator carrying the rule-5 exemption has already declared
    // its language, and warning about it every run would train us to ignore
    // the warning that matters.
    const claimsEnglish = !c.language || c.language === 'en';
    if (claimsEnglish && video.defaultAudioLanguage && !/^en/i.test(video.defaultAudioLanguage)) {
      warns.push(`${where}: declared audio language "${video.defaultAudioLanguage}" is not English`);
    }
    if (!claimsEnglish && video.defaultAudioLanguage && !video.defaultAudioLanguage.toLowerCase().startsWith(c.language.toLowerCase())) {
      warns.push(`${where}: record says language "${c.language}" but this video declares "${video.defaultAudioLanguage}"`);
    }
  }
}

for (const w of warns) console.log(`  ! ${w}`);
for (const f of fails) console.log(`  x ${f}`);
console.log(`\n${checked} entry videos gated across ${creators.length} creators — ${fails.length} failures, ${warns.length} warnings`);
console.log(`quota ${JSON.stringify(quotaUsed())}`);
process.exit(fails.length ? 1 : 0);
