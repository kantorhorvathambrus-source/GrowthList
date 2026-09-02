#!/usr/bin/env node
/**
 * Resolve a named person to their real channel, with the fallback search path.
 *
 *   node scripts/resolve-creator.mjs "Chris Voss" \
 *     --handle @chrisvoss --handle @ChrisVossOfficial \
 *     --affiliation "Black Swan Group" \
 *     --affiliation "Never Split the Difference" \
 *     --affiliation "hostage negotiator"
 *
 * Path 1 tries the handles (1 unit each). Only if they all fail or fail the
 * identity gate does path 2 run: a search for the name paired with each
 * affiliation (100 units per query). That ordering matters — the fallback is
 * expensive, so it must stay a fallback.
 *
 * The gate is the same on both paths. A channel merely NAMED after the person
 * does not pass; something in its own description or its recurring upload
 * titles has to tie it to them.
 *
 * When path 2 is the one that finds the channel, the case is appended to
 * data/handle-rescues.json with --record, so it is possible to see afterwards
 * how often the first attempt alone would have missed someone.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCreator, quotaUsed } from './lib/youtube.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(ROOT, 'data', 'handle-rescues.json');

const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith('--')) ?? '';
const take = (flag) => argv.map((a, i) => (a === flag ? argv[i + 1] : null)).filter(Boolean);
const handles = take('--handle');
const affiliations = take('--affiliation');
const record = argv.includes('--record');
const note = take('--note')[0] ?? '';

if (!name || !affiliations.length) {
  console.error('usage: resolve-creator.mjs "Full Name" --handle @a --affiliation "Their Firm" [--record]');
  console.error('       at least one --affiliation is required: the gate cannot confirm identity from a name.');
  process.exit(1);
}

const result = await resolveCreator({ name, handles, affiliations });

console.log(`\n${name}`);
console.log('='.repeat(60));
console.log('Attempts, in order:');
for (const a of result.attempts) {
  console.log(`  ${a.ok ? 'PASS' : 'fail'}  ${a.how}`);
  if (a.title) console.log(`        -> ${a.title} (${a.videoCount ?? '?'} vids, ${a.channelId})`);
  console.log(`        ${a.reason}`);
  for (const n of a.notes ?? []) console.log(`        note: ${n}`);
}

if (!result.channel) {
  console.log('\nNOT RESOLVED. The exclusion stands — log it in UNVERIFIED.md with these attempts.');
  console.log(`quota ${JSON.stringify(quotaUsed())}`);
  process.exit(2);
}

const c = result.channel;

// Is this channel already in the dataset under another name? Worth knowing
// before writing a record — and before logging anyone as excluded. The
// batch-02 note on Chris Voss claimed no channel existed for him while his
// channel was already sitting in batch 01 under @NegotiationMastery.
const already = [];
const batchDir = join(ROOT, 'data', 'creators');
if (existsSync(batchDir)) {
  for (const f of readdirSync(batchDir).filter((n) => n.endsWith('.json'))) {
    for (const rec of JSON.parse(readFileSync(join(batchDir, f), 'utf8'))) {
      if (String(rec.handle).toLowerCase() === String(c.handle).toLowerCase()) already.push(`${rec.id} (${f})`);
    }
  }
}

if (result.candidates?.length > 1) {
  console.log(`\n${result.candidates.length} channels passed the gate — ranked:`);
  for (const cand of result.candidates) {
    console.log(`  score ${String(cand.score).padStart(2)}  ${String(cand.handle ?? cand.channelId).padEnd(30)} ${String(cand.title).slice(0, 32).padEnd(33)} ${cand.videoCount} vids`);
    for (const e of cand.evidence) console.log(`            ${e}`);
  }
}
if (result.outscaled?.length) {
  console.log('\n  SCALE MISMATCH: a lower-ranked candidate is far larger than the winner —');
  for (const o of result.outscaled) console.log(`    ${o}`);
  console.log('  A short or generic brand name matches anything. Check the larger one by hand.');
}
if (result.ambiguous) {
  console.log('\n  AMBIGUOUS: the top two are within one point, so the evidence does not');
  console.log('  actually distinguish them. Do NOT write a record from this alone —');
  console.log('  add a more distinctive --affiliation and re-run, or verify by hand.');
}

console.log(`\nRESOLVED via ${result.path}${result.rescued ? '  ** RESCUED BY THE FALLBACK PATH **' : ''}`);
if (already.length) {
  console.log(`  ALREADY IN THE DATASET as ${already.join(', ')} — do not add a duplicate,`);
  console.log('  and do not log this person as excluded.');
}
if (result.query !== c.handle) console.log(`  query: ${result.query}`);
console.log(`  ${c.title}  ${c.handle ?? c.channelUrl}`);
console.log(`  ${c.channelId} | ${c.hiddenSubscriberCount ? 'hidden' : c.sizeBucket} | ${c.country ?? '--'} | ${c.videoCount} vids`);
console.log(`  gate: ${result.gate.reason}`);
for (const f of result.gate.found) console.log(`        ${f}`);

if (result.rescued && record && !result.ambiguous && !result.outscaled?.length) {
  const log = existsSync(LOG)
    ? JSON.parse(readFileSync(LOG, 'utf8'))
    : { _comment: 'Cases where the obvious handle failed and the affiliation-search fallback found the real channel. Each one is a creator the first attempt alone would have dropped.', rescues: [] };
  log.rescues.push({
    name,
    resolvedHandle: c.handle,
    channelId: c.channelId,
    handlesTried: handles,
    winningQuery: result.query,
    gateEvidence: result.gate.found,
    failedBecause: result.attempts.filter((a) => !a.ok).map((a) => `${a.how}: ${a.reason}`),
    note: note || undefined,
    alreadyInDataset: already.length ? already : undefined,
    otherCandidatesConsidered: (result.candidates ?? []).length > 1
      ? result.candidates.slice(1).map((c) => `${c.handle} (${c.title}, score ${c.score})`)
      : undefined,
    recordedAt: new Date().toISOString().slice(0, 10),
  });
  writeFileSync(LOG, JSON.stringify(log, null, 2) + '\n');
  console.log(`\nrecorded in data/handle-rescues.json (${log.rescues.length} total)`);
}

console.log(`\nquota ${JSON.stringify(quotaUsed())}`);
