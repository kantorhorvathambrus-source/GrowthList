#!/usr/bin/env node
/**
 * CANDIDATE GENERATION BY QUERY, NOT BY RECALL.
 *
 *   node scripts/discover.mjs --for gut-health "gastroenterologist IBS explained"
 *   node scripts/discover.mjs "posture desk ergonomics fix"   (no category)
 *
 * Searches for LONG videos on a topic, then reports the channels behind them,
 * ranked by how many of the results they account for. Cross-references
 * data/probed.json so anything already in the dataset, already rejected or a
 * known collision is labelled before a single evidence call is spent.
 *
 * WHY THIS EXISTS. Candidate handles were generated from my own recall for
 * forty-three batches. Recall produced dead channels, shorts-only channels,
 * wrong-audience channels and handle collisions at a rate that made the
 * reading — not the writing, and never the quota — the bottleneck. Batch 43
 * spent ~38 recalled handle probes and seven evidence dumps to accept three
 * creators. The policy that kept search as a last resort was written for
 * NAME RESOLUTION, where search is genuinely bad and costs 100 units per
 * answer, and I generalised it to CANDIDATE DISCOVERY, where 100 units buys
 * forty candidates at once. That generalisation is the fifth instance of a
 * rule validated in one context and applied to one never tested.
 *
 * WHAT IT DOES NOT DO. `videoDuration=long` means over 20 minutes, so a small
 * dense catalogue ranks poorly or not at all — Dr. Will Bulsiewicz (45
 * uploads, median 15m) does not appear for gut-health while the channel with
 * 2,171 uploads does. This SUPPLEMENTS recall, it does not replace it, and a
 * category probed only this way has been probed at one end (rule 18).
 *
 * Cost: 100 units for the search + 1 per 50 channels. A batch's whole budget
 * has been 150-250 units against a 10,000/day allowance.
 */

import { api, subsToBucket } from './lib/youtube.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ledgerPath = join(ROOT, 'data/probed.json');
const LEDGER = existsSync(ledgerPath)
  ? JSON.parse(readFileSync(ledgerPath, 'utf8')).probed ?? {}
  : {};
const BY_LOWER = new Map(Object.entries(LEDGER).map(([k, v]) => [k.toLowerCase(), v]));

// Below this, a channel cannot be judged and usually is not the real one.
// Same threshold the resolver uses, and for the same reason: handle squatters
// and abandoned accounts are indistinguishable from the real thing by name.
const MIN_CREDIBLE_UPLOADS = 10;

const argv = process.argv.slice(2);
let forCategory = null;
const at = argv.indexOf('--for');
if (at !== -1) { forCategory = argv[at + 1] ?? null; argv.splice(at, 2); }
const q = argv.join(' ').trim();
if (!q) {
  console.error('usage: discover.mjs [--for <category-id>] "<topic query>"');
  process.exit(2);
}

const search = await api('search', {
  part: 'snippet', q, type: 'video', videoDuration: 'long',
  maxResults: '50', relevanceLanguage: 'en',
});

const hits = new Map();
for (const it of search.items ?? []) {
  const id = it.snippet?.channelId;
  if (!id) continue;
  hits.set(id, (hits.get(id) ?? 0) + 1);
}
if (!hits.size) {
  console.log(`query: ${q}\n  no channels — the search returned nothing usable.`);
  process.exit(0);
}

const det = await api('channels', {
  part: 'snippet,statistics', id: [...hits.keys()].slice(0, 50).join(','),
});

const rows = [];
for (const c of det.items ?? []) {
  const custom = c.snippet?.customUrl ?? '';
  const handle = custom ? '@' + custom.replace(/^@/, '') : null;
  const seen = handle ? BY_LOWER.get(handle.toLowerCase()) : null;
  rows.push({
    hits: hits.get(c.id) ?? 0,
    handle: handle ?? '(no handle)',
    title: c.snippet?.title ?? '',
    vids: Number(c.statistics?.videoCount ?? 0),
    size: subsToBucket(c.statistics?.subscriberCount) ?? '?',
    seen,
  });
}
rows.sort((a, b) => b.hits - a.hits || b.vids - a.vids);

const pad = (s, n) => String(s).slice(0, n).padEnd(n);
console.log(`query: ${q}${forCategory ? `   (for ${forCategory})` : ''}`);
console.log(`${rows.length} distinct channels behind 50 long videos\n`);

let fresh = 0;
for (const r of rows) {
  const thin = r.vids < MIN_CREDIBLE_UPLOADS;
  let note = '';
  if (r.seen) note = `${r.seen.status.toUpperCase()} (${r.seen.at})`;
  else if (thin) note = `only ${r.vids} uploads — below the credible floor`;
  else fresh++;
  console.log(`${String(r.hits).padStart(2)}  ${pad(r.handle, 28)} ${pad(r.title, 26)} ${String(r.vids).padStart(5)} vids  ${pad(r.size, 9)} ${note}`);
}
console.log(`\n  ${fresh} unseen channels above the ${MIN_CREDIBLE_UPLOADS}-upload floor.`);
console.log('  A high hit count means the channel dominates long-form on this topic.');
console.log('  It does NOT mean the channel is any good — that still takes evidence.mjs.');
