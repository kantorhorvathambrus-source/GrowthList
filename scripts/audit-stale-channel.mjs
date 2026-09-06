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
 * TWO CHECKS, AND THE CHEAP ONE IS BETTER.
 *
 * 1. THE CHANNEL'S OWN DESCRIPTION. Sadler's said "new channel". We had
 *    fetched that text on every audit run and nobody read it. Across 13
 *    non-active records this check produced exactly one hit and no false
 *    positives — the case it was written for, detectable from data already
 *    in hand.
 * 2. A NAME SEARCH through resolveCreator, as a backstop. Weaker: across the
 *    same 13 it produced four hits, of which three were false — a Chinese
 *    RSS-digest channel named after Andrej Karpathy, a shorts channel using
 *    the mCoding name, and a creator's own inactive side channel. Using a
 *    person's name as its own affiliation term is the failure CLAUDE.md
 *    already warns about: it passes channels merely NAMED after someone.
 *
 * Neither output is a correction. It is a read-and-decide list, never a
 * rewrite.
 */

import { getChannelByHandle, resolveCreator, quotaUsed } from './lib/youtube.mjs';
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

// Check 1: does the channel say so itself?
const SELF_POINTER = /(second channel|main channel|new channel|moved to|now (?:posting|publishing) (?:at|on)|find me (?:at|on))/gi;
const selfPointing = [];
for (const { c } of records) {
  const ch = await getChannelByHandle(c.handle);
  const hits = [...new Set((ch?.description ?? '').match(SELF_POINTER) ?? [])];
  if (hits.length) {
    selfPointing.push({ name: c.name, handle: c.handle, hits });
    console.log(`  ** SAYS SO ITSELF **   ${c.name} (${c.handle}) — "${hits.join('", "')}"`);
  }
}
console.log(`\n${selfPointing.length} record(s) whose own channel description points somewhere else.\n`);

// Check 2: the name-search backstop.
const found = [];
for (const { file, c } of records) {
  // Strip our own parenthetical annotations; search the name as published.
  const name = c.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  let res;
  try {
    res = await resolveCreator({ name, handles: [], affiliations: [name] });
  } catch (err) {
    console.log(`  ERROR ${c.name}: ${String(err.message).slice(0, 70)}`);
    continue;
  }
  const hit = res?.channel;
  if (!hit) { console.log(`  no other channel found  ${c.name}`); continue; }
  const ours = await getChannelByHandle(c.handle);
  if (hit.channelId === ours?.channelId) { console.log(`  same channel            ${c.name}`); continue; }
  found.push({ file, name: c.name, ourHandle: c.handle, ourStatus: c.status, other: hit });
  console.log(`  ** OTHER CHANNEL **     ${c.name}`);
  console.log(`       we list ${c.handle} (${c.status})`);
  console.log(`       also found @${hit.customUrl ?? hit.channelId} — ${hit.title}, ${hit.videoCount} uploads`);
}

console.log(`\n${found.length} record(s) name someone with another channel. Read each before changing anything.`);
console.log('quota', JSON.stringify(quotaUsed()));
