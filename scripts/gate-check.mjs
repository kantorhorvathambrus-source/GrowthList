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

import { readFileSync } from 'node:fs';
import { getChannelByHandle, getVideos, attributeVideo, quotaUsed, redact } from './lib/youtube.mjs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/gate-check.mjs data/creators/batch-01.json');
  process.exit(1);
}

const creators = JSON.parse(readFileSync(file, 'utf8'));
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
  if (channel.country !== c.country) {
    fails.push(`${c.id}: country ${JSON.stringify(c.country)} but API says ${JSON.stringify(channel.country)}`);
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
    if (video.defaultAudioLanguage && !/^en/i.test(video.defaultAudioLanguage)) {
      warns.push(`${where}: declared audio language "${video.defaultAudioLanguage}" is not English`);
    }
  }
}

for (const w of warns) console.log(`  ! ${w}`);
for (const f of fails) console.log(`  x ${f}`);
console.log(`\n${checked} entry videos gated across ${creators.length} creators — ${fails.length} failures, ${warns.length} warnings`);
console.log(`quota ${JSON.stringify(quotaUsed())}`);
process.exit(fails.length ? 1 : 0);
