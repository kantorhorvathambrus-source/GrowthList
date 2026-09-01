#!/usr/bin/env node
/**
 * GrowthList data validator. Zero dependencies, plain node.
 *
 *   node scripts/validate.mjs [rootDir]
 *
 * Exits 0 if the dataset is valid, 1 if any FAIL-level rule is broken.
 * Warnings never change the exit code; they are for human review.
 *
 * Reads:  <root>/data/categories.json
 *         <root>/data/creators/batch-*.json
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');

// ---------------------------------------------------------------- vocabularies

const SIZE_BUCKETS = ['<100k', '100k-500k', '500k-1M', '1M-5M', '5M-20M', '>20M'];
const STATUSES = ['active', 'archive'];
const ROLES = ['specialist', 'generalist', 'critic'];
const STRENGTHS = ['primary', 'secondary'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const PROFILE_AXES = ['evidenceBased', 'practical', 'energy', 'selfPromotion', 'depth'];
const SIGNALS = [
  'credentialed',
  'cites-research',
  'practitioner',
  'sells-course',
  'sponsor-heavy',
  'contested-claims',
  'strong-ideological-frame',
];
// Not a closed vocabulary — unknown tags warn rather than fail.
const KNOWN_FORMAT_TAGS = [
  'long-form', 'interview', 'tutorial', 'video-essay', 'shorts',
  'lecture', 'documentary', 'q-and-a', 'vlog', 'livestream', 'course',
];
// Catches stub text, not ordinary English. A bare "example" is a word people
// legitimately write in a description ("the clearest example of the method"),
// so the guard looks for the shapes a placeholder actually takes.
// Uppercase-only, because "todo list" is a real alias and "TODO" is not.
const PLACEHOLDER_MARKER = /\b(TBD|TODO|FIXME|XXX|WIP)\b/;
const PLACEHOLDER_PHRASE =
  /\b(lorem|ipsum|placeholder)\b|example\.(com|org)|\bexample (creator|channel|video|title|name)\b|\byour (?:[\w'-]+ ){0,3}here\b/i;
const isPlaceholder = (text) => PLACEHOLDER_MARKER.test(text) || PLACEHOLDER_PHRASE.test(text);

const fails = [];
const warns = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

// ---------------------------------------------------------------- load

if (!existsSync(join(DATA, 'categories.json'))) {
  console.error('FATAL: data/categories.json not found');
  process.exit(1);
}

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(`FATAL: cannot parse ${p}\n  ${err.message}`);
    process.exit(1);
  }
};

const categories = readJson(join(DATA, 'categories.json'));

const creatorDir = join(DATA, 'creators');
const batchFiles = existsSync(creatorDir)
  ? readdirSync(creatorDir).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort()
  : [];

const creators = [];
for (const file of batchFiles) {
  const batch = readJson(join(creatorDir, file));
  if (!Array.isArray(batch)) {
    fail(file, 'batch file must contain a JSON array');
    continue;
  }
  for (const c of batch) creators.push({ ...c, _file: file });
}

// ---------------------------------------------------------------- categories

const categoryIds = new Set();
const categoryById = new Map();
const domains = new Set();

for (const cat of categories) {
  const where = `category ${cat.id ?? '(missing id)'}`;
  if (!cat.id) { fail(where, 'missing id'); continue; }
  if (categoryIds.has(cat.id)) fail(where, 'duplicate category id');
  categoryIds.add(cat.id);
  categoryById.set(cat.id, cat);
  domains.add(cat.domain);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cat.id)) fail(where, 'id must be lowercase kebab-case');
  for (const f of ['name', 'domain', 'blurb']) {
    if (typeof cat[f] !== 'string' || !cat[f].trim()) fail(where, `missing required field "${f}"`);
  }
  if (!Array.isArray(cat.aliases) || cat.aliases.length === 0) fail(where, 'aliases must be a non-empty array');
  if (!Array.isArray(cat.relatedCategories)) fail(where, 'relatedCategories must be an array');
  for (const lvl of LEVELS) {
    if (typeof cat.levels?.[lvl] !== 'string' || !cat.levels[lvl].trim()) {
      fail(where, `missing levels.${lvl} guidance`);
    }
  }
  if (isPlaceholder(JSON.stringify(cat))) fail(where, 'contains placeholder text');
}

if (categories.length !== 200) {
  warn('categories.json', `expected 200 categories, found ${categories.length}`);
}

// relatedCategories must resolve (checked after all ids known)
for (const cat of categories) {
  for (const rel of cat.relatedCategories ?? []) {
    if (!categoryIds.has(rel)) fail(`category ${cat.id}`, `relatedCategories -> unknown category "${rel}"`);
    if (rel === cat.id) fail(`category ${cat.id}`, 'relatedCategories contains itself');
  }
}

// ---------------------------------------------------------------- creators

const creatorIds = new Set();
const handles = new Set();
const creatorById = new Map();
/** categoryId -> creators mapped to it */
const byCategory = new Map();
for (const id of categoryIds) byCategory.set(id, []);

for (const c of creators) {
  const where = `creator ${c.id ?? '(missing id)'} [${c._file}]`;

  if (!c.id) { fail(where, 'missing id'); continue; }
  if (creatorIds.has(c.id)) fail(where, 'duplicate creator id');
  creatorIds.add(c.id);
  creatorById.set(c.id, c);

  // required scalar fields — notFor is required, not optional
  for (const f of [
    'name', 'handle', 'channelUrl', 'language', 'sizeBucket',
    'status', 'dataAsOf', 'shortDescription', 'longDescription', 'notFor', 'role',
  ]) {
    if (typeof c[f] !== 'string' || !c[f].trim()) fail(where, `missing required field "${f}"`);
  }
  if (typeof c.verified !== 'boolean') fail(where, 'missing required boolean "verified"');

  if (c.handle) {
    if (!/^@[A-Za-z0-9._-]+$/.test(c.handle)) fail(where, `malformed handle "${c.handle}"`);
    const key = c.handle.toLowerCase();
    if (handles.has(key)) fail(where, `duplicate handle "${c.handle}"`);
    handles.add(key);
  }
  if (c.channelUrl) {
    if (!/^https:\/\/www\.youtube\.com\/@[A-Za-z0-9._-]+$/.test(c.channelUrl)) {
      fail(where, `malformed channelUrl "${c.channelUrl}"`);
    } else if (c.handle && c.channelUrl !== `https://www.youtube.com/${c.handle}`) {
      fail(where, `channelUrl does not match handle (${c.channelUrl} vs ${c.handle})`);
    }
  }
  if (c.language && c.language !== 'en') fail(where, `language must be "en", found "${c.language}"`);
  // country is OPTIONAL: the API genuinely returns none for some channels
  // (Toastmasters, ReasonIO). null is the honest value — never a guess.
  if (c.country != null && !/^[A-Z]{2}$/.test(c.country)) {
    fail(where, `country must be a 2-letter code or null, found "${c.country}"`);
  }
  if (c.dataAsOf && !/^\d{4}-\d{2}$/.test(c.dataAsOf)) fail(where, `dataAsOf must be YYYY-MM, found "${c.dataAsOf}"`);
  if (c.sizeBucket && !SIZE_BUCKETS.includes(c.sizeBucket)) fail(where, `invalid sizeBucket "${c.sizeBucket}"`);
  if (c.status && !STATUSES.includes(c.status)) fail(where, `invalid status "${c.status}"`);
  if (c.role && !ROLES.includes(c.role)) fail(where, `invalid role "${c.role}"`);
  if (typeof c.longDescription === 'string' && c.longDescription.length < 200) {
    fail(where, `longDescription is ${c.longDescription.length} chars, minimum 200`);
  }
  if (isPlaceholder(JSON.stringify(c))) fail(where, 'contains placeholder text');
  if (Object.prototype.hasOwnProperty.call(c, 'caveats') && !String(c.caveats ?? '').trim()) {
    fail(where, 'caveats present but empty — omit the field entirely instead');
  }

  // level
  if (!Array.isArray(c.level) || c.level.length === 0) {
    fail(where, 'level must be a non-empty array');
  } else {
    for (const l of c.level) if (!LEVELS.includes(l)) fail(where, `invalid level "${l}"`);
  }

  // formatTags
  if (!Array.isArray(c.formatTags) || c.formatTags.length === 0) {
    fail(where, 'formatTags must be a non-empty array');
  } else {
    for (const t of c.formatTags) {
      if (!KNOWN_FORMAT_TAGS.includes(t)) warn(where, `unrecognised formatTag "${t}"`);
    }
  }

  // profile
  if (typeof c.profile !== 'object' || c.profile === null) {
    fail(where, 'missing profile object');
  } else {
    for (const axis of PROFILE_AXES) {
      const v = c.profile[axis];
      if (!Number.isInteger(v) || v < 0 || v > 4) {
        fail(where, `profile.${axis} must be an integer 0-4, found ${JSON.stringify(v)}`);
      }
    }
    for (const k of Object.keys(c.profile)) {
      if (!PROFILE_AXES.includes(k)) fail(where, `unknown profile axis "${k}"`);
    }
  }

  // signals
  if (!Array.isArray(c.signals)) {
    fail(where, 'signals must be an array');
  } else {
    for (const s of c.signals) {
      if (!SIGNALS.includes(s)) fail(where, `signal "${s}" is outside the fixed vocabulary`);
    }
  }

  // categories
  if (!Array.isArray(c.categories) || c.categories.length === 0) {
    fail(where, 'categories must be a non-empty array');
    continue;
  }
  if (c.categories.length > 6) fail(where, `mapped to ${c.categories.length} categories, hard maximum is 6`);

  const whys = new Map();
  const seenCategoryIds = new Set();
  const creatorDomains = new Set();
  let primaryCount = 0;

  for (const m of c.categories) {
    const mWhere = `${where} -> ${m.id ?? '(missing category id)'}`;
    if (!m.id) { fail(mWhere, 'mapping missing category id'); continue; }
    if (!categoryIds.has(m.id)) {
      fail(mWhere, 'references a category that does not exist');
      continue;
    }
    if (seenCategoryIds.has(m.id)) fail(mWhere, 'category mapped twice on the same creator');
    seenCategoryIds.add(m.id);
    creatorDomains.add(categoryById.get(m.id).domain);
    byCategory.get(m.id).push(c);

    if (!STRENGTHS.includes(m.strength)) fail(mWhere, `invalid strength "${m.strength}"`);
    if (m.strength === 'primary') primaryCount++;

    if (typeof m.why !== 'string' || !m.why.trim()) {
      fail(mWhere, 'missing "why"');
    } else {
      if (m.why.trim().length < 20) fail(mWhere, `"why" is ${m.why.trim().length} chars, minimum 20`);
      const norm = m.why.trim().toLowerCase();
      if (whys.has(norm)) fail(mWhere, `duplicate "why" — identical to the one on ${whys.get(norm)}`);
      else whys.set(norm, m.id);
    }
    if (typeof m.evidence !== 'string' || !m.evidence.trim()) fail(mWhere, 'missing "evidence"');

    // entryVideo — required and must be verified
    const v = m.entryVideo;
    if (!v || typeof v !== 'object') {
      fail(mWhere, 'missing entryVideo');
    } else {
      if (typeof v.title !== 'string' || !v.title.trim()) fail(mWhere, 'entryVideo missing title');
      if (typeof v.whyThisOne !== 'string' || !v.whyThisOne.trim()) fail(mWhere, 'entryVideo missing whyThisOne');
      if (typeof v.videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(v.videoId)) {
        fail(mWhere, `entryVideo.videoId "${v.videoId}" is not a valid 11-character YouTube id`);
      }
      if (v.verified === false) fail(mWhere, 'entryVideo is explicitly unverified');
    }
  }

  if (c.verified === false && !String(c.note ?? '').trim()) {
    fail(where, 'verified:false requires a "note" explaining what could not be confirmed');
  }
  if (primaryCount > 4) warn(where, `primary in ${primaryCount} categories, expected at most 4`);
  if (creatorDomains.size > 2 && !String(c.scopeNote ?? '').trim()) {
    warn(where, `spans ${creatorDomains.size} domains (${[...creatorDomains].join(', ')}) without a scopeNote`);
  }
}

// ---------------------------------------------------------------- coverage

// Coverage is a property of the FINISHED dataset, not of a half-built one.
// While batches are landing, a category with three creators is a category
// still being filled, so these report as warnings. Run with --final (the
// definition-of-done check) to make them failures again.
const FINAL = process.argv.includes('--final');
const cover = FINAL ? fail : warn;

if (creators.length > 0) {
  let untouched = 0;
  for (const [catId, list] of byCategory) {
    const where = `category ${catId}`;
    // A category no batch has reached yet is not a coverage problem, it is
    // work not done. Counted, not enumerated, unless this is the final check.
    if (list.length === 0 && !FINAL) { untouched++; continue; }
    if (list.length < 5) cover(where, `only ${list.length} creators, minimum 5`);
    if (!list.some((c) => c.role === 'critic')) cover(where, 'no creator with role "critic"');
    for (const lvl of LEVELS) {
      if (!list.some((c) => Array.isArray(c.level) && c.level.includes(lvl))) {
        cover(where, `no creator flagged "${lvl}"`);
      }
    }
  }
  if (untouched) warn('coverage', `${untouched} of ${categories.length} categories have no creators yet`);
}

// ---------------------------------------------------------------- plans

let plansFilled = 0;
let plansEmpty = 0;

for (const cat of categories) {
  const where = `category ${cat.id} plan`;
  const plan = cat.plan;
  if (!plan || typeof plan !== 'object') { fail(where, 'missing plan object'); continue; }

  const weeks = ['week1', 'week2', 'week3', 'week4'];
  const filled = [];
  for (const wk of weeks) {
    const w = plan[wk];
    if (!w || typeof w !== 'object') { fail(where, `missing ${wk}`); continue; }
    if (!Array.isArray(w.watch)) fail(where, `${wk}.watch must be an array`);
    if (typeof w.do !== 'string') fail(where, `${wk}.do must be a string`);
    if ((w.watch?.length ?? 0) > 0 || String(w.do ?? '').trim()) filled.push(wk);
  }

  if (filled.length === 0) { plansEmpty++; continue; }
  plansFilled++;

  if (filled.length !== weeks.length) {
    fail(where, `partially filled (${filled.join(', ')}) — fill all four weeks or none`);
  }

  for (const wk of weeks) {
    const w = plan[wk];
    if (!w) continue;
    const watch = Array.isArray(w.watch) ? w.watch : [];
    if (watch.length < 1 || watch.length > 2) {
      fail(where, `${wk}.watch should list 1-2 creators, found ${watch.length}`);
    }
    if (!String(w.do ?? '').trim()) fail(where, `${wk}.do is empty`);
    for (const cid of watch) {
      const creator = creatorById.get(cid);
      if (!creator) {
        fail(where, `${wk}.watch references unknown creator "${cid}"`);
        continue;
      }
      const mapped = (creator.categories ?? []).some((m) => m.id === cat.id);
      if (!mapped) fail(where, `${wk}.watch creator "${cid}" is not mapped to this category`);
    }
  }

  // Week 1 must use a beginner-level creator.
  const week1 = Array.isArray(plan.week1?.watch) ? plan.week1.watch : [];
  const hasBeginner = week1.some((cid) => creatorById.get(cid)?.level?.includes('beginner'));
  if (week1.length && !hasBeginner) fail(where, 'week1 must include a creator flagged "beginner"');
}

if (plansEmpty > 0) {
  warn('plans', `${plansEmpty} of ${categories.length} categories have an empty plan (filled in Phase 3)`);
}

// ---------------------------------------------------------------- report

const pad = (s, n) => String(s).padEnd(n);
const tally = (items, keyFn) => {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log('GrowthList data validation');
console.log('='.repeat(60));
console.log(`categories : ${categories.length} across ${domains.size} domains`);
console.log(`creators   : ${creators.length} from ${batchFiles.length} batch file(s)`);
console.log(`plans      : ${plansFilled} filled, ${plansEmpty} empty`);

if (creators.length > 0) {
  console.log('\nCreators per domain');
  const perDomain = new Map();
  for (const [catId, list] of byCategory) {
    const d = categoryById.get(catId).domain;
    if (!perDomain.has(d)) perDomain.set(d, new Set());
    for (const c of list) perDomain.get(d).add(c.id);
  }
  for (const [d, set] of [...perDomain.entries()].sort((a, b) => b[1].size - a[1].size)) {
    console.log(`  ${pad(d, 16)} ${set.size}`);
  }

  const thinnest = [...byCategory.entries()].sort((a, b) => a[1].length - b[1].length).slice(0, 20);
  console.log('\nThinnest 20 categories');
  for (const [catId, list] of thinnest) {
    console.log(`  ${pad(catId, 34)} ${list.length}`);
  }

  console.log('\nRole distribution');
  for (const [role, n] of tally(creators, (c) => c.role)) {
    console.log(`  ${pad(role, 16)} ${n}  (${Math.round((n / creators.length) * 100)}%)`);
  }

  console.log('\nSize bucket distribution');
  const under1m = creators.filter((c) => ['<100k', '100k-500k', '500k-1M'].includes(c.sizeBucket)).length;
  for (const bucket of SIZE_BUCKETS) {
    const n = creators.filter((c) => c.sizeBucket === bucket).length;
    if (n) console.log(`  ${pad(bucket, 16)} ${n}  (${Math.round((n / creators.length) * 100)}%)`);
  }
  console.log(`  ${pad('under 1M total', 16)} ${under1m}  (${Math.round((under1m / creators.length) * 100)}%, target ~40%)`);
}

if (warns.length) {
  console.log(`\nWARNINGS (${warns.length})`);
  for (const w of warns) console.log(`  ! ${w}`);
}

if (fails.length) {
  console.log(`\nFAILURES (${fails.length})`);
  for (const f of fails) console.log(`  x ${f}`);
  console.log('\nFAILED');
  process.exit(1);
}

console.log('\nOK');
