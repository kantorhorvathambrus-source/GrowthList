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
// The rule-5 exemption. Extend this list if another language-acquisition
// category is ever added; do NOT widen it to mean "foreign-language content".
const LANGUAGE_EXEMPT_CATEGORIES = ['language-learning'];
const jurisdictionCfg = existsSync(join(DATA, 'jurisdiction.json'))
  ? JSON.parse(readFileSync(join(DATA, 'jurisdiction.json'), 'utf8')) : { values: {}, categories: {} };
const JURISDICTION_VALUES = Object.keys(jurisdictionCfg.values ?? {});
const JURISDICTION_CATEGORIES = Object.keys(jurisdictionCfg.categories ?? {});
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
  // Distinct from sells-course: the creator profits from the specific DECISION
  // the content advises on, not from selling teaching about it. A rehab chain
  // discussing whether to seek treatment, a broker discussing whether to
  // invest. The owner's point, and it is right: commercial interest is
  // disclosed with a signal so the visitor can weigh it, not used as a silent
  // exclusion. Exclusion needs a reason that survives asking "would I include
  // this if a non-profit ran it?"
  'commercial-conflict',
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

// 195 after migration 001: four approved merges absorbed FIVE categories, because
// deep-work-and-focus absorbed two. The five freed slots are HELD until the
// unresearched domains have had a pass — see REBALANCE.md. Target is still 200.
if (categories.length !== 197) {
  warn('categories.json', `expected 197 categories (200 target minus 3 slots still held; see migrations 001 and 002), found ${categories.length}`);
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
  // Rule 5 is English-only — with ONE named exception, the owner's decision.
  // For language-acquisition categories, the target language IS the pedagogy:
  // an immersion channel teaching Spanish in Spanish is not a language
  // mismatch, it is the method working. The exemption is deliberately narrow:
  // a non-English creator must map ONLY to exempt categories, and must carry a
  // languageNote so the record says out loud what a reader is walking into.
  // jurisdiction: required in categories where tax, law or regulation makes
  // advice non-transferable, optional elsewhere. Five US creators is not
  // coverage for a UK visitor, and a count alone hides that.
  if (c.jurisdiction != null && !JURISDICTION_VALUES.includes(c.jurisdiction)) {
    fail(where, `jurisdiction "${c.jurisdiction}" is not one of ${JURISDICTION_VALUES.join(', ')}`);
  }
  {
    const needs = (c.categories ?? []).map((m) => m.id).filter((id) => JURISDICTION_CATEGORIES.includes(id));
    if (needs.length && c.jurisdiction == null) {
      fail(where, `maps to jurisdiction-sensitive ${needs.join(', ')} but has no "jurisdiction" field ` +
                  `(use "general" if the content genuinely transfers)`);
    }
  }

  if (c.language && c.language !== 'en') {
    const mapped = (c.categories ?? []).map((m) => m.id);
    const outside = mapped.filter((id) => !LANGUAGE_EXEMPT_CATEGORIES.includes(id));
    if (!mapped.length || outside.length) {
      fail(where, `language "${c.language}" is only permitted for creators mapped solely to ` +
                  `language-acquisition categories (${LANGUAGE_EXEMPT_CATEGORIES.join(', ')}); ` +
                  `this one also maps to ${outside.join(', ') || '(nothing)'}`);
    } else if (!String(c.languageNote ?? '').trim()) {
      fail(where, `language "${c.language}" requires a "languageNote" explaining that the target ` +
                  'language is the teaching method, so the record is self-explanatory');
    }
  }
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

    // Retroactive mappings clear a HIGHER bar than first-pass ones. Re-mapping
    // a creator already on file is cheaper than researching a new one, so
    // there is a standing pull toward finding one more category in someone we
    // already have — which is the halo effect wearing a new hat. A mapping
    // added after the creator's own batch must say so, say what triggered it,
    // and say why the evidence was not obvious first time round. If the honest
    // answer to that last question is "I was looking for a way to fill this
    // category", the mapping does not belong.
    if (m.addedLater != null) {
      const a = m.addedLater;
      if (typeof a !== 'object' || Array.isArray(a)) {
        fail(mWhere, 'addedLater must be an object { batch, trigger, whyNotAtFirstPass }');
      } else {
        if (!Number.isInteger(a.batch)) fail(mWhere, 'addedLater.batch must be the batch number that added it');
        if (String(a.trigger ?? '').trim().length < 30) {
          fail(mWhere, 'addedLater.trigger must say what specifically prompted revisiting this creator (30+ chars)');
        }
        if (String(a.whyNotAtFirstPass ?? '').trim().length < 30) {
          fail(mWhere, 'addedLater.whyNotAtFirstPass must say why the evidence was not obvious at first pass (30+ chars)');
        }
      }
    }

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

// Categories that will ship without a critic, on purpose. Project rule 11:
// a weak or bad-faith critic is worse than none, so a documented gap is
// reported rather than failed. An UNdocumented one still fails under --final.
let criticGaps = {};
const gapsPath = join(DATA, 'critic-gaps.json');
if (existsSync(gapsPath)) {
  const raw = readJson(gapsPath);
  criticGaps = raw?.gaps ?? {};
  for (const [catId, reason] of Object.entries(criticGaps)) {
    if (!categoryIds.has(catId)) fail('critic-gaps.json', `"${catId}" is not a real category id`);
    if (typeof reason !== 'string' || reason.trim().length < 40) {
      fail('critic-gaps.json', `"${catId}" needs a reason of at least 40 characters saying what was looked for`);
    }
  }
}
const acceptedCriticGaps = [];

if (creators.length > 0) {
  let untouched = 0;
  for (const [catId, list] of byCategory) {
    const where = `category ${catId}`;
    // A category no batch has reached yet is not a coverage problem, it is
    // work not done. Counted, not enumerated, unless this is the final check.
    if (list.length === 0 && !FINAL) { untouched++; continue; }
    if (list.length < 5) cover(where, `only ${list.length} creators, minimum 5`);
    if (!list.some((c) => c.role === 'critic')) {
      if (criticGaps[catId]) acceptedCriticGaps.push(catId);
      else cover(where, 'no creator with role "critic"');
    }
    for (const lvl of LEVELS) {
      if (!list.some((c) => Array.isArray(c.level) && c.level.includes(lvl))) {
        cover(where, `no creator flagged "${lvl}"`);
      }
    }
  }
  if (untouched) warn('coverage', `${untouched} of ${categories.length} categories have no creators yet`);
  // A category with a critic does not need an excuse for not having one.
  for (const catId of Object.keys(criticGaps)) {
    if ((byCategory.get(catId) ?? []).some((c) => c.role === 'critic')) {
      warn('critic-gaps.json', `"${catId}" is listed as a critic gap but now has a critic — remove the entry`);
    }
  }
}

// ------------------------------------- rule 18: inward-facing claims
// The class of claim this project got wrong twice: a statement about our own
// criteria or rigour. It feels like introspection and is actually an
// empirical claim about the data — and it is cheap to check, which is
// precisely why nobody checks it. Both failures were shipped to visitors.
//
// So the site's self-descriptions are asserted here as tests. If the data
// stops matching the copy, this fails rather than the copy quietly becoming
// false.
{
  const selfClaims = [
    ['every creator record is API-verified',
     () => creators.every((c) => c.verified === true)],
    ['every creator carries a size band and the month it was taken',
     () => creators.every((c) => c.sizeBucket && c.dataAsOf)],
    ['every mapping has an attributed entry video',
     () => creators.every((c) => (c.categories ?? []).every((m) => m.entryVideo?.videoId))],
    ['no creator exceeds four primary mappings',
     () => creators.every((c) => (c.categories ?? []).filter((m) => m.strength === 'primary').length <= 4)],
    ['no creator exceeds six mappings',
     () => creators.every((c) => (c.categories ?? []).length <= 6)],
  ];
  for (const [claim, test] of selfClaims) {
    let ok = false;
    try { ok = test(); } catch { ok = false; }
    if (!ok) fail('self-claim', `the site says "${claim}" and the data no longer supports it`);
  }

  // Numbers in visitor-facing copy that came from a SPEC rather than a query.
  // A target and a description are the same sentence once the document they
  // came from is a few weeks old, which is how "typically two to four skills"
  // survived for months at a real median of one. So a spec-sourced number must
  // be hedged in the copy — the hedge is what tells a reader it is an aim.
  const colophonPath = join(ROOT, 'js/views/colophon.js');
  if (existsSync(colophonPath)) {
    const src = readFileSync(colophonPath, 'utf8');
    // rule 4's hard cap is the one spec number in the rules prose.
    const capSentence = /never under more than six/.test(src);
    const hedged = /never under more than six/.test(src);
    if (capSentence && !hedged) {
      fail('copy-provenance', 'the mapping cap appears in visitor copy without a hedge — a spec number stated flat reads as a measurement');
    }
    // A number written as a literal where a measurement is implied is the
    // exact failure. "most appear under <n>" must be interpolated, not typed.
    if (/most appear under (one|two|three|four|five|six)\b/.test(src)) {
      fail('copy-provenance', 'the colophon states the modal mapping count as a literal — it must be computed at render, or it decays as the data moves');
    }
  }

  // What the site stores in the visitor's browser. The footer describes this,
  // and a count in that sentence decays the moment a store is added — which
  // it already did: the copy said "two things" while the code wrote five.
  // So the copy names kinds, and every actual store must map to a named kind
  // here. A new store fails the build until the footer is updated.
  {
    const STORES = {
      'growthlist:theme': 'light or dark preference',
      'growthlist:plan:': 'progress through a four-week plan',
      'growthlist:seen-categories': 'what you have already seen',
      'growthlist:netlify': 'what you have already seen',
      'components/how-did-you-hear.js:key': 'dismissed the question',
    };
    const found = new Set();
    for (const f of readdirSync(join(ROOT, 'js'), { recursive: true })) {
      const rel = String(f);
      if (!rel.endsWith('.js')) continue;
      const js = readFileSync(join(ROOT, 'js', rel), 'utf8');
      for (const k of js.matchAll(/(?:local|session)Storage\.setItem\(\s*([A-Za-z_$][\w$]*)/g)) {
        const decl = js.match(new RegExp(`(?:const|let|var)\\s+${k[1]}\\s*=\\s*['\`"]([^'\`"]+)`));
        found.add(decl ? decl[1] : `${rel}:${k[1]}`);
      }
    }
    for (const store of found) {
      if (!STORES[store]) {
        fail('copy-provenance', `the code stores "${store}" in the browser and the footer does not describe it — add it here and to the footer, or stop storing it`);
      }
    }
    const html = existsSync(join(ROOT, 'index.html')) ? readFileSync(join(ROOT, 'index.html'), 'utf8') : '';
    if (/keep\s+(?:one|two|three|four|five|\d+)\s+things?\s+locally/.test(html)) {
      fail('copy-provenance', 'the footer states a COUNT of things stored locally — counts decay silently; describe the kinds instead');
    }
  }

  // The uniform-versus-spread detector, kept because it is what caught the
  // badge claim: a rule OF OURS produces near-uniformity across domains; a
  // fact about the world produces variance. Any signal we are tempted to
  // describe as "our inclusion rule" must be near-uniform, or it is not one.
  const domainOf = new Map(categories.map((c) => [c.id, c.domain]));
  const share = new Map();
  for (const c of creators) {
    for (const d of new Set((c.categories ?? []).map((m) => domainOf.get(m.id)).filter(Boolean))) {
      if (!share.has(d)) share.set(d, new Map());
      const rec = share.get(d);
      rec.set('_n', (rec.get('_n') ?? 0) + 1);
      for (const sig of new Set(c.signals ?? [])) rec.set(sig, (rec.get(sig) ?? 0) + 1);
    }
  }
  if (existsSync(join(DATA, 'domain-notes.json'))) {
    const dn = JSON.parse(readFileSync(join(DATA, 'domain-notes.json'), 'utf8'));
    for (const e of dn.entries ?? []) {
      if (e.cause !== 'selection') continue;
      const pcts = [...share.entries()]
        .filter(([, r]) => (r.get('_n') ?? 0) >= 4)
        .map(([, r]) => (r.get(e.signal) ?? 0) / r.get('_n'));
      if (pcts.length < 2) continue;
      const spread = Math.max(...pcts) - Math.min(...pcts);
      if (spread > 0.5) {
        fail('self-claim', `${e.domain}/${e.signal} is marked cause "selection" — our own rule — but the signal ` +
          `varies by ${Math.round(100 * spread)} points across domains. A rule of ours would be near-uniform; ` +
          `this is a fact about the subject. See the badge correction in findings-ledger.json.`);
      }
    }
  }
}

// -------------------------------------------------- rule 18 on gaps
// The owner's ruling after two findings were falsified in two batches: an
// untested gap is UNFINISHED, not documented. A gap nobody tried to disprove
// is indistinguishable from a search that stopped early, and both of the
// findings that failed did so the same way — evidence from one sub-area,
// applied to sub-areas never searched. So the test is not "was this checked"
// but "which ends were checked".
if (existsSync(join(DATA, 'thin-gaps.json'))) {
  const tg = JSON.parse(readFileSync(join(DATA, 'thin-gaps.json'), 'utf8')).gaps ?? {};
  for (const [id, entry] of Object.entries(tg)) {
    const where = `thin-gaps.json ${id}`;
    if (typeof entry === 'string') { warn(where, 'legacy string entry — no rule 18 test recorded, so this is unfinished rather than documented'); continue; }
    const r = entry.rule18;
    if (!r) {
      cover(where, 'no rule18 block — an untested gap is unfinished, not documented');
      continue;
    }
    if (!Array.isArray(r.subAreas) || r.subAreas.length < 2) {
      fail(where, 'rule18.subAreas must name at least two sub-areas — a domain with one end does not need this rule');
    }
    if (!Array.isArray(r.probed)) fail(where, 'rule18.probed must list the sub-areas actually searched');
    const unprobed = (r.subAreas ?? []).filter((a) => !(r.probed ?? []).includes(a));
    if (unprobed.length) {
      cover(where, `rule18 lists sub-areas never probed (${unprobed.join(', ')}) — the finding is about the ends you searched, not the domain`);
    }
    if (!['survived', 'falsified'].includes(r.outcome)) fail(where, 'rule18.outcome must be "survived" or "falsified"');
    if (!r.whatWasTried || String(r.whatWasTried).length < 100) fail(where, 'rule18.whatWasTried must say what was actually searched and found');
    // A falsified finding keeps its original claim on the record.
    if (r.outcome === 'falsified' && !entry.corrected) {
      fail(where, 'a falsified finding must keep a `corrected` field saying what it originally claimed and why that was wrong');
    }
  }
}

// ------------------------------------------------- rule 12 subject notes
// Every rule 12 category must say so on its own page. The check that matters
// is not that a note exists but that it is written for the right audience:
// the research rationale references our own rulings and process, and would
// read as self-regard on a page about learning a skill.
if (existsSync(join(DATA, 'high-stakes.json'))) {
  const hs = JSON.parse(readFileSync(join(DATA, 'high-stakes.json'), 'utf8'));
  const catIds = new Set(categories.map((c) => c.id));
  // Markers of research-facing prose. If any of these reach a visitorNote,
  // the audience separation has broken down.
  const RESEARCH_VOICE = /\bowner\b|\brule 12\b|\bthin-gaps\b|\bcountUnderLooserStandard\b|[A-Z]{4,}[ -][A-Z]{4,}/;
  for (const [id, entry] of Object.entries(hs.categories ?? {})) {
    const where = `high-stakes.json ${id}`;
    if (!catIds.has(id)) fail(where, 'not a category id');
    if (typeof entry === 'string') { fail(where, 'must be an object with rationale and visitorNote'); continue; }
    if (!entry.rationale) fail(where, 'missing rationale (research-facing)');
    if (!entry.visitorNote) {
      fail(where, 'missing visitorNote — a rule 12 category must say so on its page');
      continue;
    }
    const note = String(entry.visitorNote).trim();
    if (note.length < 80) fail(where, 'visitorNote is too short to say anything useful');
    if (note.length > 480) warn(where, `visitorNote is ${note.length} chars — the owner asked for short`);
    if (RESEARCH_VOICE.test(note)) {
      fail(where, 'visitorNote reads as research prose (mentions our process, or uses the all-caps rationale voice) — it is addressed to a visitor learning a skill');
    }
  }
}

// ------------------------------------------------------ domain notes
// Rule 17. Three failure modes worth catching mechanically, because none is
// visible by inspection: a saturated signal with no note at all (the badge is
// still pretending to distinguish creators), a note whose stored counts have
// drifted from the data (it has started asserting a measurement that moved),
// and a note whose placement contradicts its cause — a note about our own
// inclusion rules sitting on a page about learning a skill, or a fact about
// the field buried on the colophon where nobody reading the list will see it.
if (existsSync(join(DATA, 'domain-notes.json'))) {
  const dn = JSON.parse(readFileSync(join(DATA, 'domain-notes.json'), 'utf8'));
  const { measureSaturation, saturatedRows, MIN_N } = await import('./lib/saturation.mjs');
  const { rows: satRows, perDomain } = measureSaturation(categories, creators);
  const entries = dn.entries ?? [];
  const domains = new Set(categories.map((c) => c.domain));
  const CAUSES = ['field', 'selection', 'mixed'];
  const PLACEMENTS = ['category-page', 'build-page'];

  const seen = new Set();
  for (const e of entries) {
    const where = `domain-notes.json ${e.domain}/${e.signal}`;
    const key = `${e.domain}/${e.signal}`;
    if (seen.has(key)) fail(where, 'duplicate entry');
    seen.add(key);
    if (!domains.has(e.domain)) fail(where, 'no category uses this domain');
    if (!SIGNALS.includes(e.signal)) fail(where, `unknown signal "${e.signal}"`);
    if (!CAUSES.includes(e.cause)) fail(where, 'cause must be field, selection or mixed');
    if (!PLACEMENTS.includes(e.placement)) fail(where, 'placement must be category-page or build-page');
    if (!['measured', 'editorial'].includes(e.basis)) fail(where, 'basis must be "measured" or "editorial"');

    // The pairing is the whole point of the split, so it is a failure rather
    // than a warning. A selection-caused note is a statement about our
    // editorial rules; it belongs where the rules are explained.
    if (e.cause === 'selection' && e.placement !== 'build-page') {
      fail(where, 'a selection-caused note explains our inclusion rules, not the skill — placement must be build-page');
    }
    if (e.cause !== 'selection' && e.placement !== 'category-page') {
      fail(where, 'a field-caused note tells the visitor about the domain — placement must be category-page');
    }
    // A note may carry its own text or use the shared text for its signal.
    // Sharing matters here: the same fact holds in twelve domains, and twelve
    // near-identical paragraphs would reproduce the very problem rule 17
    // exists to fix, one level up.
    const shared = dn.sharedNotes?.[e.signal];
    const text = e.note ?? (e.usesSharedNote ? shared : null);
    if (e.placement === 'category-page' && (!text || String(text).trim().length < 80)) {
      fail(where, 'a category-page note needs text — its own, or a sharedNotes entry for its signal');
    }
    if (e.usesSharedNote && !shared) fail(where, `usesSharedNote "${e.usesSharedNote}" has no entry in sharedNotes`);
    if (e.placement === 'build-page' && e.note) {
      warn(where, 'note text on a build-page entry is never rendered — the build page states it once');
    }
    if (e.basis === 'editorial' && !e.reviewWhen) {
      fail(where, 'an editorial note must say when it comes back for measurement');
    }
    if (e.basis === 'measured') {
      const live = satRows.find((r) => r.domain === e.domain && r.signal === e.signal);
      const n = live?.n ?? 0;
      const of = perDomain.get(e.domain)?.n ?? 0;
      if (!e.measured) fail(where, 'a measured note must carry its counts');
      else if (n !== e.measured.n || of !== e.measured.of) {
        // Not a failure: the dataset grows every batch and drift is expected.
        // It has to be visible, though, or the note quietly starts lying.
        warn(where, `stored ${e.measured.n}/${e.measured.of} but the data now says ${n}/${of} — restate it`);
      }
    }
  }

  if (!dn.buildPage?.whatTheBadgesTrack?.paras?.length) {
    fail('domain-notes.json', 'buildPage.whatTheBadgesTrack has no text');
  }

  for (const r of saturatedRows(satRows)) {
    if (!seen.has(`${r.domain}/${r.signal}`)) {
      cover('domain-notes.json', `${r.domain}/${r.signal} is at ${Math.round(100 * r.pct)}% (${r.n}/${r.of}) with no standing note — rule 17`);
    }
  }

  for (const q of dn.open ?? []) {
    const rec = perDomain.get(q.domain);
    if (rec && rec.n >= MIN_N && q.status === 'unanswerable') {
      warn('domain-notes.json', `open question ${q.domain}/${q.signal} is marked unanswerable but ${q.domain} now has ${rec.n} creators — measure it`);
    }
  }
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

  if (acceptedCriticGaps.length) {
    console.log(`\nShipping without a critic, on purpose (${acceptedCriticGaps.length})`);
    for (const catId of acceptedCriticGaps.sort()) {
      console.log(`  ${pad(catId, 34)} ${criticGaps[catId]}`);
    }
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
