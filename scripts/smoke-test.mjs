#!/usr/bin/env node
/**
 * Phase 2 smoke test — build one complete creator record end to end.
 *
 *   node scripts/smoke-test.mjs @handle [category-id] [prefer,terms]
 *
 * Prints the record in schema shape with every field visible, including the
 * nulls. The point is to show plainly which fields the API can establish and
 * which are editorial judgement that must be written by hand — an honest gap
 * looks like a null here, never like a plausible guess.
 *
 * Never prints the API key.
 */

import {
  getChannelByHandle, pickEntryVideo, getUploads, getVideos,
  statusFromLatestUpload, quotaUsed, redact,
} from './lib/youtube.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const handle = process.argv[2];
const categoryId = process.argv[3] ?? null;
const prefer = (process.argv[4] ?? '').split(',').map((s) => s.trim()).filter(Boolean);

if (!handle) {
  console.error('usage: node scripts/smoke-test.mjs @handle [category-id] [prefer,terms]');
  process.exit(1);
}

/** kebab-case id from the handle, per CLAUDE.md naming conventions. */
const idFromHandle = (h) =>
  h.replace(/^@/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
   .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const line = (s = '') => console.log(s);
const rule = (t) => { line(); line('─'.repeat(74)); line(t); line('─'.repeat(74)); };

try {
  // Validate the category id against the real taxonomy rather than trusting input.
  const categories = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));
  const category = categoryId ? categories.find((c) => c.id === categoryId) : null;
  if (categoryId && !category) {
    console.error(`No such category: ${categoryId}`);
    process.exit(1);
  }

  rule(`CHANNEL LOOKUP  ${handle}`);
  const channel = await getChannelByHandle(handle);

  if (!channel) {
    line(`NOT FOUND — the API has no channel for ${handle}.`);
    line('This is a real result, not an error: the handle was misremembered,');
    line('and the correct action is to drop this creator rather than guess.');
    line(`\nquota: ${JSON.stringify(quotaUsed())}`);
    process.exit(0);
  }

  line(`resolved            ${channel.title}`);
  line(`channelId           ${channel.channelId}`);
  line(`channelUrl          ${channel.channelUrl}`);
  line(`country (API)       ${channel.country ?? 'null  ← not published by the channel'}`);
  line(`subscriberCount     ${channel.hiddenSubscriberCount ? 'HIDDEN by channel' : channel.subscriberCount}`);
  line(`sizeBucket          ${channel.sizeBucket ?? 'null  ← count hidden, so no bucket'}`);
  line(`videoCount          ${channel.videoCount}`);
  line(`channel created     ${channel.publishedAt}`);

  rule('ENTRY VIDEO — through the attribution gate');
  const uploads = await getUploads(channel.uploadsPlaylist, { max: 50 });
  const latest = uploads[0]?.publishedAt ?? null;
  const status = statusFromLatestUpload(latest);
  line(`uploads inspected   ${uploads.length}`);
  line(`latest upload       ${latest ?? 'unknown'}`);
  line(`status              ${status ?? 'null'}`);

  const picked = await pickEntryVideo(channel, { prefer, poolSize: 50 });

  if (!picked) {
    line('\nNO QUALIFYING VIDEO. Every candidate failed the gate.');
    line('entryVideo would be omitted — never substituted with a guess.');
  } else {
    line(`\nPASSED THE GATE`);
    line(`  videoId           ${picked.video.videoId}`);
    line(`  title             ${picked.video.title}`);
    line(`  durationMin       ${picked.video.durationMin ?? 'null'}`);
    line(`  video.channelId   ${picked.video.channelId}`);
    line(`  creator.channelId ${channel.channelId}`);
    line(`  MATCH             ${picked.video.channelId === channel.channelId ? 'yes — attribution proven' : 'NO — bug'}`);
    line(`  embeddable        ${picked.video.embeddable}`);
    line(`  privacyStatus     ${picked.video.privacyStatus}`);
    line(`  audio language    ${picked.video.defaultAudioLanguage ?? 'null  ← not declared'}`);
    if (picked.rejected.length) {
      line(`\n  rejected before this one (${picked.rejected.length}):`);
      for (const r of picked.rejected.slice(0, 5)) line(`    ${r.videoId}  ${r.reason}`);
    }
  }

  rule('EVIDENCE AVAILABLE FOR EDITORIAL FIELDS');
  line('The API supplies these as raw material. Editorial text must be written');
  line('from them in our own words, never copied.\n');
  line(`channel description (${channel.description.length} chars):`);
  line(channel.description.slice(0, 400).split('\n').map((l) => '  ' + l).join('\n') || '  (empty)');
  line(`\nrecent upload titles (sample of ${Math.min(8, uploads.length)}):`);
  for (const u of uploads.slice(0, 8)) line(`  · ${u.title}`);

  rule('THE RECORD — nulls are honest gaps, not placeholders');
  const record = {
    id: idFromHandle(handle),
    name: channel.title,
    handle: channel.handle,
    channelUrl: channel.channelUrl,
    country: channel.country,
    language: 'en',
    sizeBucket: channel.sizeBucket,
    status,
    verified: true,
    dataAsOf: new Date().toISOString().slice(0, 7),

    shortDescription: null,
    longDescription: null,
    notFor: null,

    formatTags: null,
    level: null,
    profile: null,
    signals: null,

    categories: category
      ? [{
          id: category.id,
          strength: null,
          why: null,
          evidence: null,
          entryVideo: picked
            ? {
                title: picked.video.title,
                videoId: picked.video.videoId,
                whyThisOne: null,
                durationMin: picked.video.durationMin,
              }
            : null,
        }]
      : [],

    role: null,
  };
  line(JSON.stringify(record, null, 2));

  rule('FIELD PROVENANCE');
  const api = ['id', 'name', 'handle', 'channelUrl', 'country', 'sizeBucket', 'status', 'dataAsOf',
               'categories[].entryVideo.title', 'categories[].entryVideo.videoId',
               'categories[].entryVideo.durationMin'];
  const editorial = ['shortDescription', 'longDescription', 'notFor', 'formatTags', 'level',
                     'profile', 'signals', 'role', 'categories[].strength',
                     'categories[].why', 'categories[].evidence',
                     'categories[].entryVideo.whyThisOne'];
  line(`API-VERIFIED (${api.length}) — machine facts, cannot be wrong unless the API is:`);
  for (const f of api) line(`  ✓ ${f}`);
  line(`\nEDITORIAL (${editorial.length}) — my judgement, written from the evidence above:`);
  for (const f of editorial) line(`  ✎ ${f}`);
  line(`\nlanguage is set to "en" only after I read the titles and confirm the`);
  line(`channel's primary upload language. The API's defaultAudioLanguage is`);
  line(`frequently absent, so it corroborates but cannot decide.`);

  line(`\nquota this run: ${JSON.stringify(quotaUsed())}`);
} catch (err) {
  console.error('SMOKE TEST FAILED:', redact(err.message));
  process.exit(1);
}
