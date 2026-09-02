#!/usr/bin/env node
/**
 * GrowthList data build. Zero dependencies, plain node.
 *
 *   node scripts/build-data.mjs [rootDir]
 *
 * Merges the research batches into the files the site actually fetches.
 * There is no build step at deploy time — Netlify serves these as-is — so
 * the generated files are committed to the repo.
 *
 * Reads:
 *   <root>/data/categories.json
 *   <root>/data/creators/batch-*.json
 *
 * Writes:
 *   <root>/data/creators.json          full creator records (lazy-loaded)
 *   <root>/data/index.json             light creator index for list views
 *   <root>/data/categories-index.json  slim home-page index with counts
 *   <root>/data/search-index.json      searchable fields, categories + creators
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (name, value) => {
  const path = join(DATA, name);
  writeFileSync(path, JSON.stringify(value) + '\n');
  const kb = (statSync(path).size / 1024).toFixed(1);
  console.log(`  ${name.padEnd(24)} ${String(Array.isArray(value) ? value.length : '-').padStart(5)} records  ${kb.padStart(8)} KB`);
  return Number(kb);
};

// ---------------------------------------------------------------- load

const categories = readJson(join(DATA, 'categories.json'));

const creatorDir = join(DATA, 'creators');
const batchFiles = existsSync(creatorDir)
  ? readdirSync(creatorDir).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort()
  : [];

const creators = [];
const seen = new Set();
for (const file of batchFiles) {
  for (const c of readJson(join(creatorDir, file))) {
    if (seen.has(c.id)) {
      console.error(`FATAL: duplicate creator id "${c.id}" (${file}) — run validate.mjs`);
      process.exit(1);
    }
    seen.add(c.id);
    creators.push(c);
  }
}

console.log(`Read ${categories.length} categories and ${creators.length} creators from ${batchFiles.length} batch file(s).\n`);

// ---------------------------------------------------------------- derive

/** categoryId -> creator count, used for the home page counts */
const counts = new Map(categories.map((c) => [c.id, 0]));
for (const c of creators) {
  for (const m of c.categories ?? []) {
    if (counts.has(m.id)) counts.set(m.id, counts.get(m.id) + 1);
  }
}

// Full creator records, sorted by id for a stable diff.
const creatorsOut = [...creators].sort((a, b) => a.id.localeCompare(b.id));

// Light index: enough to render a creator card without the full record.
const indexOut = creatorsOut.map((c) => ({
  id: c.id,
  name: c.name,
  sizeBucket: c.sizeBucket,
  role: c.role,
  level: c.level,
  categories: (c.categories ?? []).map((m) => ({ id: m.id, strength: m.strength })),
  shortDescription: c.shortDescription,
  // Only for the rule-5 exemption: a creator whose uploads are not in English
  // must say so on the card, not only on the detail page.
  ...(c.languageNote ? { languageNote: c.languageNote } : {}),
}));

// Slim home index: the 200 categories without levels or plans.
const categoriesIndexOut = categories.map((c) => ({
  id: c.id,
  name: c.name,
  domain: c.domain,
  blurb: c.blurb,
  aliases: c.aliases,
  count: counts.get(c.id) ?? 0,
}));

// Search index: what the search box matches against.
const searchOut = {
  categories: categories.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    aliases: c.aliases,
  })),
  creators: creatorsOut.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    categories: (c.categories ?? []).map((m) => m.id),
  })),
};

// ---------------------------------------------------------------- write

console.log('Writing:');
const kbFull = writeJson('creators.json', creatorsOut);
const kbIndex = writeJson('index.json', indexOut);
const kbCats = writeJson('categories-index.json', categoriesIndexOut);
const kbSearch = writeJson('search-index.json', searchOut);

// ---------------------------------------------------------------- report

const firstLoad = kbCats + kbSearch;
console.log(`\nFirst load (categories-index + search-index): ${firstLoad.toFixed(1)} KB`);
console.log(`Lazy-loaded on demand (creators + index):     ${(kbFull + kbIndex).toFixed(1)} KB`);
if (firstLoad > 400) {
  console.log('WARNING: first-load data is approaching the ~500 KB budget.');
}

const empty = [...counts.entries()].filter(([, n]) => n === 0);
if (empty.length) {
  console.log(`\n${empty.length} categories have no creators yet.`);
}

console.log('\nDone.');
