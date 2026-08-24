// Home: an ink hero band, search, the 200 categories grouped by domain as
// filled tiles, and an honest explainer band below the fold.
//
// The category grid is the densest thing in the product — 200 tiles in one
// paint — so the tiles carry no shadow and no transition beyond colour.

import { getCategoryIndex } from '../data.js';
import { esc, domainLabel, sortDomains, stateBlock, statePage, setTitle, sample } from '../utils.js';
import { mountSearch } from '../search.js';
import { navigate } from '../router.js';
import { rings } from '../components/ornament.js';

function categoryCard(cat) {
  const zero = cat.count === 0;
  const countText = zero ? 'None listed yet' : `${cat.count} creator${cat.count === 1 ? '' : 's'}`;
  return `<li>
    <a class="cat-card" href="#/category/${esc(cat.id)}">
      <span class="cat-card__name">${esc(cat.name)}</span>
      <span class="cat-card__blurb">${esc(cat.blurb)}</span>
      <span class="cat-card__count${zero ? ' cat-card__count--zero' : ''}">${countText}</span>
    </a>
  </li>`;
}

export async function renderHome(app) {
  setTitle('');
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${stateBlock('loading', 'Loading skills…', '')}</div>`;

  let categories;
  try {
    categories = await getCategoryIndex();
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage(
      'error',
      'GrowthList',
      'The skill list could not be loaded.',
      `Something went wrong reading <code>data/categories-index.json</code>
       (${esc(err.message)}). Reload the page to try again — nothing is stored
       on your device, so a refresh is safe.`
    )}</div>`;
    return;
  }

  const byDomain = new Map();
  for (const cat of categories) {
    if (!byDomain.has(cat.domain)) byDomain.set(cat.domain, []);
    byDomain.get(cat.domain).push(cat);
  }

  const domains = sortDomains([...byDomain.keys()]);
  const domainSections = domains
    .map((domain, i) => {
      const list = byDomain.get(domain).sort((a, b) => a.name.localeCompare(b.name));
      return `<section class="domain" aria-labelledby="domain-${esc(domain)}">
        <div class="domain__head">
          <span class="domain__title">
            <span class="num">${String(i + 1).padStart(2, '0')}</span>
            <h2 id="domain-${esc(domain)}">${esc(domainLabel(domain))}</h2>
          </span>
          <span class="domain__count">${list.length} skills</span>
        </div>
        <ul class="cat-grid">${list.map(categoryCard).join('')}</ul>
      </section>`;
    })
    .join('');

  const total = categories.length;
  const withCreators = categories.filter((c) => c.count > 0).length;
  const creatorTotal = categories.reduce((n, c) => n + c.count, 0);

  app.innerHTML = `
    <section class="band band--ink hero__band">
      <div class="rail rail--ink"><span>GrowthList</span></div>
      <div class="band-body">
        <div class="hero__inner">
          <div>
            <p class="eyebrow">${total} skills · ${domains.length} domains</p>
            <h1>Pick a skill. Get a short, honest list.</h1>
          </div>
          <p class="lead">
            The YouTube creators actually worth your time for one specific skill —
            what they're good for, who they're <em>not</em> for, one video to start
            with, and a four-week plan so watching turns into practice.
          </p>

          <div class="search" role="search">
            <label class="visually-hidden" for="search-input">Search skills</label>
            <div class="search__field">
              <span class="search__icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" focusable="false">
                  <circle cx="7" cy="7" r="5"/><path d="M10.8 10.8 14.5 14.5"/>
                </svg>
              </span>
              <input
                id="search-input"
                type="search"
                role="combobox"
                autocomplete="off"
                aria-expanded="false"
                aria-controls="search-results"
                aria-autocomplete="list"
                placeholder="Try “stage fright”, “cold email”, “sleep”…">
            </div>
            <ul id="search-results" class="search__results" role="listbox" aria-label="Matching skills"></ul>
          </div>
          <p class="search__hint">Search matches other words too — type what you'd call it.</p>
          <p class="visually-hidden" id="search-status" role="status" aria-live="polite"></p>

          <div class="hero__actions">
            <button type="button" class="surprise" id="surprise">Surprise me →</button>
          </div>
        </div>
        <div class="hero__orn" aria-hidden="true">${rings({ size: 200 })}</div>
      </div>
    </section>

    <section class="band band--paper">
      <div class="rail"><span>Catalogue</span></div>
      <div class="band-body">
        ${withCreators === 0
          ? `<div style="margin-bottom: var(--sp-8)">${stateBlock(
              'empty',
              'No creators are published yet.',
              `The ${total} skills below are final, but the creator research is still in
               progress. Every skill page will tell you honestly that it is empty rather
               than showing you a filler list.`
            )}</div>`
          : `<p class="lead" style="margin-bottom: var(--sp-8)">
              ${creatorTotal} creator listings across ${withCreators} skills.
             </p>`}
        ${domainSections}
      </div>
    </section>

    <section class="band band--ink">
      <div class="rail rail--ink"><span>How to use it</span></div>
      <div class="band-body">
        <div class="sec-head">
          <span class="num">00</span>
          <h2>How to actually use this</h2>
        </div>
        <div class="explainer__grid">
          <div class="explainer__item">
            <span class="eyebrow">01 — The honest part</span>
            <h3>Watching is not practising</h3>
            <p>
              An hour of video feels like progress and usually isn't. The four-week
              plan on each skill exists because the exercise is the part that
              changes anything — the video only tells you what to do.
            </p>
          </div>
          <div class="explainer__item">
            <span class="eyebrow">02 — Fewer, deeper</span>
            <h3>Two or three channels, not twenty</h3>
            <p>
              Subscribing to everyone in a field produces a feed you skim and a
              skill you never build. Pick one creator at your level, work through
              them properly, and come back when you plateau.
            </p>
          </div>
          <div class="explainer__item">
            <span class="eyebrow">03 — The downside</span>
            <h3>We say who each channel is wrong for</h3>
            <p>
              Every entry has a “not for” line, and every skill includes someone
              who criticises the field itself. A list with no downsides is a list
              that's selling something.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');

  mountSearch(app, categories.map((c) => ({ id: c.id, name: c.name, aliases: c.aliases })));

  app.querySelector('#surprise')?.addEventListener('click', () => {
    const pool = categories.filter((c) => c.count > 0);
    const pick = sample(pool.length ? pool : categories);
    if (pick) navigate(`#/category/${pick.id}`);
  });
}
