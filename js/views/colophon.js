// The colophon: how the list was built. Everything here is a statement about
// our editorial rules rather than about any skill, which is exactly why it is
// on its own page — rule 17's split. The category pages carry facts about the
// domain a visitor is entering; the rules that produced the list live here.
//
// The counts on this page are computed from the shipped data at render time,
// never written into the copy, so the page cannot claim a coverage figure the
// dataset has moved past.

import { getDomainNotes, getCategoryIndex, getCreators } from '../data.js';
import { esc, setTitle, statePage, domainLabel, SIGNAL_LABELS } from '../utils.js';

const RULES = [
  ['Verified, or not listed',
   `Every channel is confirmed through the YouTube Data API before it is
    written down. No entry is built from a remembered handle or a guessed URL,
    and the entry-point video on each card is checked to belong to that
    channel rather than merely to mention it.`],
  ['Mapped only where the work supports it',
   `A creator appears under a skill only when their own body of work covers
    it — typically two to four skills, never more than six. Being excellent at
    one thing is not evidence about the next thing, and the temptation to let
    it count is the single easiest way for a list like this to go soft.`],
  ['Ranges, not numbers',
   `Subscriber figures are shown as broad bands with the month they were taken,
    because an exact count is out of date the day it is published.`],
  ['Commercial interest is disclosed, not hidden',
   `Someone who sells a course, takes sponsorships, or profits from the
    decision they are discussing can still be worth watching. Those facts are
    put on the card so you can weigh them, rather than used as a quiet reason
    to leave a good creator out.`],
  ['Gaps are left as gaps',
   `Where nothing credible was found for a skill, it stays empty. Filling it
    with the nearest adjacent channel would cost you more than the empty space
    does, and it would make every other entry harder to trust.`],
];

function rulesMarkup() {
  return `<ol class="colophon-rules">
    ${RULES.map(([title, body]) => `<li>
      <h3>${esc(title)}</h3>
      <p>${esc(body.replace(/\s+/g, ' ').trim())}</p>
    </li>`).join('')}
  </ol>`;
}

// The measured evidence for the section above it. Rendered as a table because
// the claim is a set of counts, and prose would only obscure them.
function floorTable(entries, dataAsOf) {
  // The spread is the point, so show every measured entry rather than only
  // the ones that happen to sit on this page. An earlier version filtered to
  // build-page rows; after the badges were reclassified there were none, and
  // the table silently emptied — which is exactly how a page starts lying.
  const rows = entries
    .filter((e) => e.measured)
    .sort((a, b) => b.measured.n / b.measured.of - a.measured.n / a.measured.of);
  if (!rows.length) return '';
  const names = [...new Set(rows.map((e) => e.signal))].map((s) => SIGNAL_LABELS[s] ?? s);
  // Reads as a sentence whether one badge saturates or five do.
  const signals = names.length > 1
    ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} badges`
    : `${names[0]} badge`;
  return `<div class="table-scroll">
    <table class="colophon-table">
      <caption>Share of creators carrying the ${esc(signals)}, by domain${dataAsOf ? `, as of ${esc(dataAsOf)}` : ''}.</caption>
      <thead><tr><th scope="col">Domain</th><th scope="col">Badge</th><th scope="col">Share</th></tr></thead>
      <tbody>
        ${rows.map((e) => `<tr>
          <th scope="row">${esc(domainLabel(e.domain))}</th>
          <td>${esc(SIGNAL_LABELS[e.signal] ?? e.signal)}</td>
          <td>${e.measured.n} of ${e.measured.of} <span class="colophon-pct">(${Math.round(100 * e.measured.n / e.measured.of)}%)</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function floorMarkup(notes) {
  const sec = notes?.buildPage?.whatTheBadgesTrack;
  if (!sec) return '';
  return `<div class="sec-head"><span class="num">03</span><h2 id="floor-heading">${esc(sec.title)}</h2></div>
    ${(sec.paras ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}
    ${floorTable(notes.entries ?? [], notes.dataAsOf)}`;
}

// Coverage, stated plainly. A directory that shows only its filled shelves is
// telling you something untrue by omission.
function coverageMarkup(categories, creators) {
  const filled = new Set(creators.flatMap((c) => (c.categories ?? []).map((m) => m.id)));
  const empty = categories.filter((c) => !filled.has(c.id)).length;
  const thin = categories.filter((c) => {
    const n = creators.filter((x) => (x.categories ?? []).some((m) => m.id === c.id)).length;
    return n > 0 && n < 5;
  }).length;
  return `<p>
    Right now the list holds ${creators.length} creators across
    ${categories.length} skills. ${empty} of those skills have nobody in them
    yet and ${thin} have fewer than five, which is the number we aim for. Those
    pages will say so rather than pad themselves out.
  </p>`;
}

export async function renderColophon(app) {
  app.setAttribute('aria-busy', 'true');
  setTitle('How this list was built');

  let notes;
  let categories;
  let creators;
  try {
    [notes, categories, creators] = await Promise.all([
      getDomainNotes(), getCategoryIndex(), getCreators(),
    ]);
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage(
      'error', 'Page unavailable', 'This page could not be loaded.', esc(err.message))}</div>`;
    return;
  }

  app.innerHTML = `
    <section class="band band--ink hero__band">
      <div class="rail rail--ink"><span>Colophon</span></div>
      <div class="band-body">
        <p class="crumb"><a href="#/">All skills</a> › How this list was built</p>
        <h1>How this list was built</h1>
        <p class="lead">
          What gets a creator onto this site, what keeps one off it, and where
          the list is currently thin.
        </p>
      </div>
    </section>

    <section class="band band--paper" aria-labelledby="rules-heading">
      <div class="rail"><span>The rules</span></div>
      <div class="band-body">
        <div class="sec-head"><span class="num">01</span><h2 id="rules-heading">What it takes to be listed</h2></div>
        ${rulesMarkup()}
      </div>
    </section>

    <section class="band band--alt" aria-labelledby="coverage-heading">
      <div class="rail"><span>Coverage</span></div>
      <div class="band-body">
        <div class="sec-head"><span class="num">02</span><h2 id="coverage-heading">Where the list is thin</h2></div>
        ${coverageMarkup(categories, creators)}
      </div>
    </section>

    <section class="band band--paper" aria-labelledby="floor-heading">
      <div class="rail"><span>Badges</span></div>
      <div class="band-body">
        ${floorMarkup(notes)}
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');
}
