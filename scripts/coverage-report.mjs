#!/usr/bin/env node
/**
 * The critic-coverage report, plus the handle-rescue list.
 *
 *   node scripts/coverage-report.mjs
 *
 * Two questions the owner asks at every check-in: which populated categories
 * have a critic and which do not, and how often the cheap handle path would
 * have missed someone. Both are answered from the data rather than from
 * recollection, so the numbers cannot drift out of date in a summary.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const categories = read('data/categories.json');
const cats = categories.categories ?? categories;
const creators = read('data/creators.json');
const gaps = existsSync(join(ROOT, 'data/critic-gaps.json')) ? read('data/critic-gaps.json').gaps ?? {} : {};

const byCat = new Map(cats.map((c) => [c.id, []]));
for (const c of creators) for (const m of c.categories ?? []) byCat.get(m.id)?.push(c);

const populated = [...byCat.entries()].filter(([, list]) => list.length > 0);
const withCritic = populated.filter(([, l]) => l.some((c) => c.role === 'critic'));
const documented = populated.filter(([id, l]) => !l.some((c) => c.role === 'critic') && gaps[id]);
const undocumented = populated.filter(([id, l]) => !l.some((c) => c.role === 'critic') && !gaps[id]);

const pad = (s, n) => String(s).padEnd(n);

// ---------------------------------------------------------- rule 18 ledger
// Printed FIRST, on the owner's instruction: this says more about whether the
// dataset can be trusted than any coverage number does. A directory that has
// never falsified one of its own findings has either been lucky or has not
// looked.
if (existsSync(join(ROOT, 'data/findings-ledger.json'))) {
  const ledger = read('data/findings-ledger.json');
  const claims = ledger.claims ?? [];
  const bad = claims.filter((c) => c.status === 'falsified');
  console.log('RULE 18 LEDGER — structural claims, tested');
  console.log('='.repeat(72));
  const shipped = bad.filter((c) => c.reachedVisitors);
  console.log(`${claims.length} claims tested: ${bad.length} falsified, ${claims.length - bad.length} survived.`);
  console.log(`Of the ${bad.length} wrong: ${shipped.length} had REACHED VISITORS before being caught, ${bad.length - shipped.length} were caught internally.`);
  console.log('');
  console.log('Read that as a description of the process, not an indictment of the data.');
  console.log('The alternative to six wrong claims found was not six correct claims —');
  console.log('it was six wrong ones nobody checked. The number that separates a process');
  console.log('finding its own errors from a dataset shipping them is the second one.\n');
  for (const c of claims) {
    const missing = (c.subAreas ?? []).filter((a) => !(c.probedWhenMade ?? []).includes(a));
    console.log(`  [${c.status.toUpperCase()}] ${c.id}   made ${c.madeAt}, tested ${c.testedAt}`);
    console.log(`    claim: ${c.claim}`);
    console.log(`    sub-areas ${c.probedWhenMade?.length ?? 0}/${c.subAreas?.length ?? 0} probed when the claim was made` +
      (missing.length ? ` — unprobed: ${missing.join(', ')}` : ''));
    for (const [label, text] of [['found', c.found], ['what survives', c.survives], ['note', c.note]]) {
      if (!text) continue;
      console.log(`    ${label}:`);
      for (const line of String(text).match(/.{1,82}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
    }
    console.log('');
  }
  // The pattern is the finding. Every falsification so far has the same shape.
  const scoped = bad.filter((c) => (c.probedWhenMade ?? []).length < (c.subAreas ?? []).length);
  if (shipped.length) {
    console.log('  Reached visitors before being caught:');
    for (const c of shipped) console.log(`    ${c.id} — ${c.reachedVisitorsNote}`);
    console.log('');
  }
  console.log(`  ${scoped.length} of ${bad.length} falsified claims were made without probing every sub-area.`);
  console.log('  That is not bad luck. It is the default failure of a search that stops');
  console.log('  when it finds a pattern, and it is what rule 18 exists to interrupt.\n\n');
}

console.log('CRITIC COVERAGE — a target, not a requirement');
console.log('='.repeat(72));
console.log(`${creators.length} creators | ${populated.length} of ${cats.length} categories populated`);
console.log(`\n  CATEGORIES WITH A DISSENTING VOICE: ${withCritic.length} of ${populated.length}`);
const criticCreators = creators.filter((c) => c.role === 'critic').length;
console.log(`  carried by ${criticCreators} critic creators out of ${creators.length}.`);
console.log('');
console.log('  This stopped being a validator rule at 200 creators. It was violated by');
console.log('  84% of populated categories, and a rule broken that often is noise that');
console.log('  trains a reader to skim the warnings that matter. The structural reason:');
console.log('  a genuine critic of a field is far rarer than a good teacher of it.');
console.log(`  ${documented.length} categories have a written reason for having none (rule 11).`);

console.log(`\nHas a critic (${withCritic.length})`);
for (const [id, list] of withCritic.sort()) {
  const who = list.filter((c) => c.role === 'critic').map((c) => c.name);
  console.log(`  ${pad(id, 26)} ${who.join(', ')}`);
}

if (documented.length) {
  console.log(`\nShipping without a critic, on purpose (${documented.length})`);
  for (const [id] of documented.sort()) console.log(`  ${pad(id, 26)} ${gaps[id]}`);
}

console.log(`\nWithout one (${undocumented.length}) — not a failure, and not enumerated.`);
console.log('  Listing 151 categories as problems was the noise this change removes.');

// ------------------------------------------------ jurisdiction gaps
// A category can hit its creator target and still be empty for a whole
// country. Five US creators is not coverage for a UK visitor. The owner's
// requirement: name these rather than let them hide inside a passing count.
let jur = { markets: [], categories: {} };
const jurPath = join(ROOT, 'data/jurisdiction.json');
if (existsSync(jurPath)) jur = read('data/jurisdiction.json');
const MARKETS = jur.markets ?? [];
const jurCats = Object.keys(jur.categories ?? {});
if (jurCats.length) {
  console.log('\n\nJURISDICTION COVERAGE');
  console.log('='.repeat(72));
  console.log(`${jurCats.length} categories where tax, law or regulation makes advice non-transferable.`);
  console.log('A creator marked "general" counts for every market.\n');
  console.log(`  ${pad('category', 26)} ${MARKETS.map((m) => m.padEnd(4)).join('')} gen  missing`);
  const missingTally = new Map(MARKETS.map((m) => [m, 0]));
  for (const id of jurCats) {
    const list = byCat.get(id) ?? [];
    const gen = list.filter((c) => c.jurisdiction === 'general').length;
    const cells = MARKETS.map((m) => {
      const n = list.filter((c) => c.jurisdiction === m).length;
      return String(n + gen === 0 ? '-' : n || (gen ? 'g' : 0)).padEnd(4);
    });
    const missing = MARKETS.filter((m) => !list.some((c) => c.jurisdiction === m) && gen === 0);
    for (const m of missing) missingTally.set(m, missingTally.get(m) + 1);
    const flag = list.length === 0 ? 'category empty' : missing.length ? missing.join(', ') : 'none';
    console.log(`  ${pad(id, 26)} ${cells.join('')}${String(gen).padEnd(5)}${flag}`);
  }
  const targets = jur.targetMarkets ?? MARKETS;
  const gapOnly = jur.documentedGapMarkets ?? [];
  console.log('\n  Categories with no creator for that market (excluding "general"):');
  for (const [m, n] of missingTally) {
    const role = targets.includes(m) ? 'TARGET — staff these' : gapOnly.includes(m) ? 'documented gap — report, do not staff' : '';
    console.log(`    ${pad(m, 4)} ${String(n).padStart(2)} of ${jurCats.length}   ${role}`);
  }
  const targetWork = jurCats.filter((id) => {
    const list = byCat.get(id) ?? [];
    if (list.some((c) => c.jurisdiction === 'general')) return false;
    return targets.some((m) => !list.some((c) => c.jurisdiction === m));
  });
  console.log(`\n  Actual work outstanding: ${targetWork.length} categories missing a US or UK creator.`);
  if (targetWork.length) console.log(`    ${targetWork.join(', ')}`);
  console.log('\n  "-" means nobody at all; "g" means covered only by a general creator.');
  console.log('  This is a documented gap of a different kind — a passing creator count');
  console.log('  can still leave a whole market unserved.');
}

// ------------------------------------------- retroactive vs first-pass
// The owner's requirement: track these separately so that at batch 40 it is
// possible to tell whether the mappings-per-creator ratio improved because the
// data was genuinely under-mapped, or because the bar drifted.
const retro = [];
let firstPass = 0;
for (const c of creators) {
  for (const m of c.categories ?? []) {
    if (m.addedLater) retro.push({ creator: c.id, category: m.id, ...m.addedLater });
    else firstPass++;
  }
}
const totalMaps = retro.length + firstPass;
// Per-batch: the marginal ratio, and the share of mappings that were the
// SECOND-OR-LATER for their creator. The owner's instruction as the depth pass
// starts, and the reasoning is rule 15's: the binding constraint has shifted
// from "is there an empty category" to the scope rule itself, and a creator who
// could plausibly land in four under-filled categories is a far bigger
// temptation than one who fills a single empty one.
//
// READ THEM TOGETHER. A rising ratio means creators are being mapped more
// widely, which is either the data having been under-mapped or the bar
// drifting. If the second-or-later share rises FASTER than the ratio, it is
// the bar.
{
  const dir = join(ROOT, 'data/creators');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort() : [];
  console.log('\n\nSCOPE PRESSURE — marginal ratio and extra-mapping share, by batch');
  console.log('='.repeat(72));
  console.log('  batch  creators  mappings  marginal  2nd-or-later share');
  const recent = files.slice(-8);
  for (const f of recent) {
    const b = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const c = b.length;
    const m = b.reduce((a, x) => a + (x.categories?.length ?? 0), 0);
    const extra = b.reduce((a, x) => a + Math.max(0, (x.categories?.length ?? 0) - 1), 0);
    console.log(`   ${f.slice(6, 8)}       ${String(c).padStart(2)}       ${String(m).padStart(3)}      ${(m / c).toFixed(2)}      ${m ? Math.round(100 * extra / m) : 0}%`);
  }
  const all = files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
  const tot = all.flat();
  const totM = tot.reduce((a, x) => a + (x.categories?.length ?? 0), 0);
  const totE = tot.reduce((a, x) => a + Math.max(0, (x.categories?.length ?? 0) - 1), 0);
  console.log(`\n  whole dataset: ${(totM / tot.length).toFixed(2)} ratio, ${Math.round(100 * totE / totM)}% of mappings are second-or-later.`);
  console.log('  If the ratio climbs and this share climbs faster, the bar is drifting.');
}

console.log('\n\nMAPPING PROVENANCE');
console.log('='.repeat(72));
console.log(`  first-pass ... ${String(firstPass).padStart(4)}  (written with the creator's own batch)`);
console.log(`  retroactive .. ${String(retro.length).padStart(4)}  (added to an existing record later)`);
console.log(`  retroactive share: ${(100 * retro.length / totalMaps).toFixed(1)}%`);
console.log(`  ratio ${(totalMaps / creators.length).toFixed(2)}/creator, of which ${(firstPass / creators.length).toFixed(2)} is first-pass`);
if (retro.length) {
  console.log('\n  Every retroactive mapping, with what triggered it:');
  const byBatch = new Map();
  for (const r of retro) {
    if (!byBatch.has(r.batch)) byBatch.set(r.batch, []);
    byBatch.get(r.batch).push(r);
  }
  for (const [b, rows] of [...byBatch].sort((a, x) => a[0] - x[0])) {
    console.log(`\n  added in batch ${String(b).padStart(2, '0')}:`);
    for (const r of rows) console.log(`    ${pad(r.creator + ' -> ' + r.category, 46)} ${r.trigger}`);
  }
}

// -------------------------------------------------- thin categories
// The owner's standing request: keep this list growing in the open rather
// than discovering it at batch 40.
//
// Three states, and the distinction matters. A category below 5 is UNFINISHED
// by default — one domain pass of a dozen creators is not an exhaustive
// search, and it would be dishonest to call it a decided gap. It becomes a
// DOCUMENTED GAP only when someone has actually finished looking and written
// down what exists, in data/thin-gaps.json. Nothing is inferred: a domain
// having had a first pass proves nothing about any single category in it.
let thinGaps = {};
const thinPath = join(ROOT, 'data/thin-gaps.json');
if (existsSync(thinPath)) thinGaps = read('data/thin-gaps.json').gaps ?? {};

const under = cats
  .map((c) => ({ id: c.id, domain: c.domain, n: (byCat.get(c.id) ?? []).length }))
  .filter((r) => r.n < 3)
  .sort((a, b) => a.n - b.n || a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));

const thinDocumented = under.filter((r) => thinGaps[r.id]);
const openWork = under.filter((r) => !thinGaps[r.id]);

console.log('\n\nBELOW THE 3-CREATOR TARGET  (running list)');
console.log('='.repeat(72));
console.log(`${under.length} of ${cats.length} categories are under 3 creators.`);
console.log(`  searched and documented ... ${thinDocumented.length}  (a reason is on file)`);
console.log(`  still open ................ ${openWork.length}  (unfinished research, no claim made)`);
console.log('\nThe depth goal is 3, restated from 5 at 200 creators. At the mapping ratio');
console.log('the scope rule actually produces, 400 creators lands at 3.0 per category;');
console.log('5 everywhere would need ~675. The scope rule is the last thing to trade,');
console.log('so the number moved instead. 5 stays an aspiration for categories that');
console.log('earn it. A gap counts as decided only once someone finished looking.');

if (thinDocumented.length) {
  console.log(`\nSearched and documented (${thinDocumented.length})`);
  for (const r of thinDocumented) {
    const g = thinGaps[r.id];
    const entry = typeof g === 'string' ? { reason: g } : g;
    console.log(`\n  ${r.id}  (${r.n} creator${r.n === 1 ? '' : 's'}, ${r.domain})`);
    // Whether a gap is ours or the world's is the thing worth surfacing: a
    // category thin because our own rules rejected candidates is a different
    // fact from one thin because nothing good exists.
    // Rule 18: a gap without a disconfirmation test is unfinished research
    // wearing a documented gap's clothes, so it is labelled as such here
    // rather than counted alongside the tested ones.
    const r18 = entry.rule18;
    if (!r18) {
      console.log(`    RULE 18: NOT TESTED — this is unfinished, not a documented gap`);
    } else {
      const unprobed = (r18.subAreas ?? []).filter((a) => !(r18.probed ?? []).includes(a));
      console.log(`    rule 18 [${r18.outcome}] ${r18.probed?.length ?? 0}/${r18.subAreas?.length ?? 0} sub-areas probed${unprobed.length ? ` — MISSING: ${unprobed.join(', ')}` : ''}`);
    }
    if (entry.corrected) {
      console.log(`    CORRECTED — this entry was wrong and says so:`);
      for (const line of String(entry.corrected).match(/.{1,84}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
    }
    if (entry.gapCause) {
      const looser = entry.countUnderLooserStandard;
      const delta = looser != null && looser !== r.n ? `  (would be ${looser} under the standard used elsewhere)` : '';
      console.log(`    cause: ${entry.gapCause}${delta}`);
    }
    for (const [label, text] of [['reason', entry.reason], ['attribution', entry.attribution], ['challenged', entry.challenged]]) {
      if (!text) continue;
      console.log(`    ${label}:`);
      for (const line of String(text).match(/.{1,86}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
    }
  }
}

// High-stakes categories get called out by name: an empty one there is a
// deliberate outcome under rule 12, not an oversight to be tidied away later.
let highStakes = {};
const hsPath = join(ROOT, 'data/high-stakes.json');
if (existsSync(hsPath)) highStakes = read('data/high-stakes.json').categories ?? {};
const hsRows = under.filter((r) => highStakes[r.id]);
if (hsRows.length) {
  const hsStatus = (existsSync(hsPath) ? read('data/high-stakes.json').status : null) ?? 'in force';
  console.log(`\nHIGHER-STAKES categories below target (${hsRows.length}) — rule 12 [${hsStatus}]`);
  console.log('  An empty category here is preferred to an adjacent creator.');
  if (hsStatus !== 'in force') {
    console.log('  NOT YET IN FORCE: the owner approved this standard for addiction-recovery');
    console.log('  only. The other nine are proposed and must be confirmed or trimmed before');
    console.log('  they constrain any further batch.');
  }
  for (const r of hsRows) {
    const state = thinGaps[r.id] ? 'documented' : 'open';
    const hs = highStakes[r.id];
    // Entries carry a research rationale and a visitor-facing note; only the
    // first belongs in a report written for the owner.
    const why = typeof hs === 'string' ? hs : hs.rationale ?? '';
    console.log(`  ${r.n} creator${r.n === 1 ? ' ' : 's'}  ${pad(r.id, 26)} ${pad(state, 11)} ${why.slice(0, 70)}`);
    if (typeof hs === 'object' && !hs.visitorNote) console.log(`      NO VISITOR NOTE — rule 12 categories must say so on the page`);
  }
}

console.log(`\nStill open, by domain (${openWork.length})`);
const byDom = new Map();
for (const r of openWork) {
  if (!byDom.has(r.domain)) byDom.set(r.domain, []);
  byDom.get(r.domain).push(r);
}
for (const [d, rows] of [...byDom].sort((a, b) => b[1].length - a[1].length)) {
  const zero = rows.filter((r) => r.n === 0).length;
  console.log(`  ${pad(d, 15)} ${String(rows.length).padStart(2)} categories  (${zero} with nobody, ${rows.length - zero} partly filled)`);
  const partial = rows.filter((r) => r.n > 0);
  if (partial.length) console.log(`      ${partial.map((r) => `${r.id}:${r.n}`).join('  ')}`);
}

const have = creators.reduce((a, c) => a + (c.categories?.length ?? 0), 0);
const ratio = have / creators.length;
console.log(`\nmappings ${have} of ${cats.length * 3} needed for 3 everywhere  (ratio ${ratio.toFixed(2)}/creator)`);
console.log(`projection at 400 creators: ~${Math.round(400 * ratio)} mappings => ${(400 * ratio / cats.length).toFixed(1)} per category average (target 3); 5 everywhere would need ~${Math.round(cats.length * 5 / ratio)} creators`);

// ------------------------------------------------ signal saturation
// A badge everybody has is noise. Rule 17: once a signal is near-universal
// within a domain, say it once and let the per-creator badge keep doing the
// narrower job it can still do. Where the saturation is the field's doing the
// note goes on the category page; where it is our own inclusion rule showing
// up in the data, it goes on the colophon with the rest of the editorial
// rules. This section is the evidence for both, and the check that a note has
// not gone stale, gone missing, or drifted to the wrong page.
const { measureSaturation, saturatedRows, nearRows, SATURATED, MIN_N } =
  await import('./lib/saturation.mjs');
const { rows: satRows, perDomain } = measureSaturation(cats, creators);
let domainNotes = { entries: [], open: [] };
const dnPath = join(ROOT, 'data/domain-notes.json');
if (existsSync(dnPath)) domainNotes = read('data/domain-notes.json');
const dnEntries = domainNotes.entries ?? [];
const entryFor = (r) => dnEntries.find((e) => e.domain === r.domain && e.signal === r.signal);

console.log('\n\nSIGNAL SATURATION BY DOMAIN');
console.log('='.repeat(72));
console.log(`A signal at ${Math.round(SATURATED * 100)}% or more of a domain's creators has stopped`);
console.log('describing the creator and started describing the field — or describing us.');
console.log(`Domains under ${MIN_N} creators are not measured: the percentage would be arithmetic.\n`);

const sat = saturatedRows(satRows);
console.log(`  ${pad('domain', 14)} ${pad('signal', 20)} share    cause      where it is said`);
for (const r of sat) {
  const e = entryFor(r);
  const state = e ? e.placement : 'MISSING — rule 17';
  console.log(`  ${pad(r.domain, 14)} ${pad(r.signal, 20)} ${String(r.n).padStart(2)}/${String(r.of).padEnd(3)} ${String(Math.round(100 * r.pct)).padStart(3)}%  ${pad(e?.cause ?? '-', 10)} ${state}`);
}
const uncovered = sat.filter((r) => !entryFor(r));
const onCat = sat.filter((r) => entryFor(r)?.placement === 'category-page').length;
const onBuild = sat.filter((r) => entryFor(r)?.placement === 'build-page').length;
console.log(`\n  ${sat.length} saturated signal${sat.length === 1 ? '' : 's'}: ${onCat} on category pages, ${onBuild} on the colophon, ${uncovered.length} unhandled.`);
console.log('  A selection-caused note is about our own inclusion rules, so it lives with');
console.log('  the rules. Only a field-caused one earns space on a page about a skill.');

const near = nearRows(satRows);
if (near.length) {
  console.log('\n  On the way up (50-69%) — watch, do not write a note yet:');
  for (const r of near) console.log(`    ${pad(r.domain, 14)} ${pad(r.signal, 20)} ${r.n}/${r.of}  ${Math.round(100 * r.pct)}%`);
}

const unmeasured = [...perDomain].filter(([, rec]) => rec.n < MIN_N);
if (unmeasured.length) {
  console.log(`\n  Not measurable yet (under ${MIN_N} creators):`);
  for (const [d, rec] of unmeasured.sort()) console.log(`    ${pad(d, 14)} ${rec.n} creator${rec.n === 1 ? '' : 's'}`);
}

// A note written from judgement rather than from a count is legitimate, but it
// has to say so, and it has to come back for measurement.
const editorial = dnEntries.filter((e) => e.basis !== 'measured');
if (editorial.length) {
  console.log('\n  Standing notes not backed by a measurement:');
  for (const e of editorial) console.log(`    ${pad(e.domain + '/' + e.signal, 34)} ${e.basis}; re-check when ${e.reviewWhen}`);
}
// Questions that could not be measured when they were asked. Kept here
// rather than answered from judgement, and kept after they are answered so
// the answer is visible as an answer to something that was once open.
// A note that stopped being true. Kept rather than deleted: a standing note
// that was written, confirmed and then falsified is a more useful record than
// one that quietly disappeared, and it is the only way to tell a measurement
// that moved from a claim that was always wrong.
for (const r of domainNotes.retired ?? []) {
  console.log(`\n  RETIRED — ${r.domain}/${r.signal}  (now ${r.finalMeasurement.n}/${r.finalMeasurement.of}, ${r.finalMeasurement.pct}%)`);
  for (const [label, text] of [['history', r.history], ['why', r.why], ['what still stands', r.standing]]) {
    if (!text) continue;
    console.log(`    ${label}:`);
    for (const line of String(text).match(/.{1,84}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
  }
}

for (const q of domainNotes.open ?? []) {
  console.log(`\n  ${q.status === 'answered' ? 'ANSWERED' : 'OPEN QUESTION'} — ${q.domain}/${q.signal}`);
  console.log(`    ${q.question}`);
  for (const [label, text] of [['answer', q.answer], ['caveat', q.caveat], ['blocked by', q.blockedBy], ['history', q.history]]) {
    if (!text) continue;
    console.log(`    ${label}:`);
    for (const line of String(text).match(/.{1,84}(\s|$)/g) ?? []) console.log(`      ${line.trim()}`);
  }
}

// ------------------------------------------------- reputation drift
// Not a coverage metric. A finding about YouTube that fell out of the research
// rather than being looked for, kept because it is the strongest evidence this
// directory offers something a search engine cannot: someone searching "learn
// iOS" finds Sean Allen and has no way to discover the teaching moved behind a
// paywall and the channel is now a news show.
if (existsSync(join(ROOT, 'data/reputation-drift.json'))) {
  const rd = read('data/reputation-drift.json');
  const rejected = (rd.drift ?? []).filter((d) => d.outcome === 'rejected');
  console.log('\n\nREPUTATION DRIFT  (data/reputation-drift.json)');
  console.log('='.repeat(72));
  console.log(`${(rd.drift ?? []).length} creators whose current catalogue no longer matches what they are`);
  console.log(`known for — ${rejected.length} rejected outright, ${(rd.drift ?? []).length - rejected.length} listed with the drift named on the card.`);
  console.log('Not yet surfaced to visitors; the decision comes at the end of Phase 2.\n');
  for (const d of rd.drift ?? []) {
    console.log(`  ${d.name}  [${d.outcome}]`);
    console.log(`    known for: ${d.knownFor}`);
    console.log(`    now:       ${d.catalogueNow}`);
    console.log(`    scan:      ${d.scan}`);
    console.log('');
  }
  const kinds = {};
  for (const c of rd.collisions ?? []) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
  console.log(`  HANDLE COLLISIONS: ${(rd.collisions ?? []).length} recorded — ` +
    Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ') + '.');
  console.log('  A person-name collision is catchable by identityMatch. A category-term');
  console.log('  collision is not, because category words are generic enough for any');
  console.log('  channel to carry them innocently — hence genericNameCollision().');
}

// ---------------------------------------------------------------- rescues
console.log('\n\nHANDLE RESCUES  (data/handle-rescues.json)');
console.log('='.repeat(72));
if (!existsSync(join(ROOT, 'data/handle-rescues.json'))) {
  console.log('  none recorded');
} else {
  const log = read('data/handle-rescues.json');
  console.log(`${log.rescues.length} case${log.rescues.length === 1 ? '' : 's'} where the obvious handle failed and the`);
  console.log('affiliation search found the real channel.\n');
  for (const r of log.rescues) {
    console.log(`  ${r.name}  ->  ${r.resolvedHandle}`);
    console.log(`    tried:   ${r.handlesTried.join(', ')}`);
    console.log(`    found by: "${r.winningQuery}"`);
    for (const e of r.gateEvidence ?? []) console.log(`    evidence: ${e}`);
    if (r.alreadyInDataset) console.log(`    NOTE: already in the dataset as ${r.alreadyInDataset.join(', ')}`);
    if (r.note) console.log(`    ${r.note}`);
    console.log('');
  }
}
