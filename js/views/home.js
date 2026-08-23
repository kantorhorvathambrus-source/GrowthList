// Home: search, the 200 categories grouped by domain with creator counts, a
// "surprise me" affordance, and an honest explainer below the fold.

import { getCategoryIndex } from '../data.js';
import { esc, domainLabel, sortDomains, stateBlock, statePage, setTitle, sample } from '../utils.js';
import { mountSearch } from '../search.js';
import { navigate } from '../router.js';

function categoryCard(cat) {
  const countClass = cat.count === 0 ? 'cat-card__count cat-card__count--zero' : 'cat-card__count';
  const countText =
    cat.count === 0
      ? 'no creators listed yet'
      : `${cat.count} creator${cat.count === 1 ? '' : 's'}`;
  return `<li>
    <a class="cat-card" href="#/category/${esc(cat.id)}">
      <span class="cat-card__name">${esc(cat.name)}</span>
      <p class="cat-card__blurb">${esc(cat.blurb)}</p>
      <span class="${countClass}">${countText}</span>
    </a>
  </li>`;
}

export async function renderHome(app) {
  setTitle('');
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = stateBlock('loading', 'Loading skills…', '');

  let categories;
  try {
    categories = await getCategoryIndex();
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = statePage(
      'error',
      'GrowthList',
      'The skill list could not be loaded.',
      `Something went wrong reading <code>data/categories-index.json</code>
       (${esc(err.message)}). Reload the page to try again — nothing is stored
       on your device, so a refresh is safe.`
    );
    return;
  }

  const byDomain = new Map();
  for (const cat of categories) {
    if (!byDomain.has(cat.domain)) byDomain.set(cat.domain, []);
    byDomain.get(cat.domain).push(cat);
  }

  const domainSections = sortDomains([...byDomain.keys()])
    .map((domain) => {
      const list = byDomain.get(domain).sort((a, b) => a.name.localeCompare(b.name));
      return `<section class="domain" aria-labelledby="domain-${esc(domain)}">
        <div class="domain__head">
          <h2 id="domain-${esc(domain)}">${esc(domainLabel(domain))}</h2>
          <span class="domain__count">${list.length} skills</span>
        </div>
        <ul class="cat-grid">${list.map(categoryCard).join('')}</ul>
      </section>`;
    })
    .join('');

  const total = categories.length;
  const withCreators = categories.filter((c) => c.count > 0).length;

  app.innerHTML = `
    <div class="hero">
      <h1>Pick a skill. Get a short, honest list.</h1>
      <p class="hero__lead">
        ${total} specific skills, each with the YouTube creators actually worth
        your time — what they're good for, who they're <em>not</em> for, one
        video to start with, and a four-week plan so watching turns into practice.
      </p>

      <div class="search" role="search">
        <label class="visually-hidden" for="search-input">Search skills</label>
        <div class="search__field">
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
      <p class="search__hint" id="search-hint">
        Search matches other words too — type what you'd call it.
      </p>
      <p class="visually-hidden" id="search-status" role="status" aria-live="polite"></p>

      <p><button type="button" class="surprise" id="surprise">Surprise me →</button></p>
    </div>

    ${withCreators === 0 ? stateBlock(
      'empty',
      'No creators are published yet.',
      `The ${total} skills below are final, but the creator research is still in
       progress. Every skill page will tell you honestly that it is empty rather
       than showing you a filler list.`
    ) : ''}

    ${domainSections}

    <section class="explainer" aria-labelledby="explainer-heading">
      <h2 id="explainer-heading">How to actually use this</h2>
      <div class="explainer__grid">
        <div>
          <h3>Watching is not practising</h3>
          <p>
            An hour of video feels like progress and usually isn't. The four-week
            plan on each skill exists because the exercise is the part that
            changes anything — the video only tells you what to do.
          </p>
        </div>
        <div>
          <h3>Two or three channels, not twenty</h3>
          <p>
            Subscribing to everyone in a field produces a feed you skim and a
            skill you never build. Pick one creator at your level, work through
            them properly, and come back when you plateau.
          </p>
        </div>
        <div>
          <h3>We tell you who each channel is wrong for</h3>
          <p>
            Every entry has a “not for” line, and every skill includes someone
            who criticises the field itself. A list with no downsides is a list
            that's selling something.
          </p>
        </div>
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');

  const searchIndexEntries = categories.map((c) => ({
    id: c.id,
    name: c.name,
    aliases: c.aliases,
  }));
  mountSearch(app, searchIndexEntries);

  app.querySelector('#surprise')?.addEventListener('click', () => {
    const pool = categories.filter((c) => c.count > 0);
    const pick = sample(pool.length ? pool : categories);
    if (pick) navigate(`#/category/${pick.id}`);
  });
}
