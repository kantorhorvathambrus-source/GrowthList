#!/usr/bin/env node
/**
 * HOW MUCH IS THIS TOPIC ACTUALLY WATCHED?
 *
 *   node scripts/topic-demand.mjs <category-id> [<category-id> ...]
 *
 * WHAT THIS IS NOT. It is not traffic, and it cannot be. This site has no
 * analytics, the home page lists all 197 categories equally with no featured
 * subset, and nothing in the repository knows or could know which category a
 * visitor arrives at. Any ranking of "most likely to be visited" would be
 * judgement wearing a number's clothes — the failure this project has now
 * logged twice as `never-even-wrong`.
 *
 * WHAT IT IS. For a category's own name and aliases, the median and total view
 * count of the fifty most relevant videos on YouTube. That is real consumption
 * data about the SUBJECT, measured, with one clear meaning: how much appetite
 * exists for this topic among people already watching video about it. A
 * subject with a median of two million views is not niche. One with twelve
 * thousand is.
 *
 * The gap between that and "our visitors" is real and unmeasured: our visitors
 * are self-selected people who came to a curated directory, and they may want
 * precisely the subjects the mass audience ignores. Treat this as one input to
 * a judgement, never as the judgement.
 *
 * 101 quota units per category.
 */

import { api, quotaUsed } from './lib/youtube.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cats = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));
const CL = Array.isArray(cats) ? cats : cats.categories;

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: topic-demand.mjs <category-id> [...]'); process.exit(2); }

const rows = [];
for (const id of ids) {
  const cat = CL.find((c) => c.id === id);
  if (!cat) { console.error(`  unknown category ${id}`); continue; }
  // The category's own name plus its two most distinctive aliases — the words
  // a person would actually type, taken from our own record rather than made up.
  const q = [cat.name, ...(cat.aliases ?? []).slice(0, 2)].join(' ');
  let search;
  try { search = await api('search', { part: 'snippet', q, type: 'video', maxResults: '50', relevanceLanguage: 'en' }); }
  catch (err) { console.error(`  ${id}: search failed — ${String(err.message).slice(0, 80)}`); continue; }
  const vids = (search.items ?? []).map((i) => i.id?.videoId).filter(Boolean);
  if (!vids.length) { rows.push({ id, q, n: 0, median: 0, total: 0 }); continue; }
  const det = await api('videos', { part: 'statistics', id: vids.slice(0, 50).join(',') });
  const views = (det.items ?? []).map((v) => Number(v.statistics?.viewCount ?? 0)).sort((a, b) => a - b);
  const median = views.length ? views[Math.floor(views.length / 2)] : 0;
  const total = views.reduce((a, b) => a + b, 0);
  rows.push({ id, q, n: views.length, median, total });
}

rows.sort((a, b) => b.median - a.median);
const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n);
console.log(`\n${'category'.padEnd(30)} ${'median views'.padStart(12)} ${'total (50)'.padStart(11)}   query`);
for (const r of rows) {
  console.log(`${r.id.padEnd(30)} ${fmt(r.median).padStart(12)} ${fmt(r.total).padStart(11)}   ${r.q}`);
}
console.log('\nMedian view count of the 50 most relevant videos. This measures appetite');
console.log('for the SUBJECT on YouTube. It is not our traffic and cannot be — see the');
console.log('header of this file before using it as if it were.');
console.log('quota', JSON.stringify(quotaUsed()));
