// Category view: an ink header band, level tabs, filters, the creator list,
// the critic in a visually distinct ink band, and the four-week plan as a
// numbered sequence with a connecting line.

import { getCategory, getCreatorsForCategory, getCategoryIndex } from '../data.js';
import { esc, stateBlock, statePage, setTitle, LEVELS, SIZE_BUCKETS, domainLabel } from '../utils.js';
import { creatorCard } from '../components/creator-card.js';
import { replaceQuery, parseHash } from '../router.js';
import { ornamentFor } from '../components/ornament.js';

const PLAN_STORAGE = 'growthlist:plan:';

function readFilters(query) {
  const level = LEVELS.includes(query.level) ? query.level : 'beginner';
  const size = SIZE_BUCKETS.includes(query.size) ? query.size : '';
  const format = query.format ? String(query.format) : '';
  const promo = /^[0-4]$/.test(query.promo ?? '') ? Number(query.promo) : 4;
  return { level, size, format, promo };
}

function applyFilters(entries, filters) {
  return entries.filter(({ creator }) => {
    if (!creator.level?.includes(filters.level)) return false;
    if (filters.size && creator.sizeBucket !== filters.size) return false;
    if (filters.format && !creator.formatTags?.includes(filters.format)) return false;
    if ((creator.profile?.selfPromotion ?? 0) > filters.promo) return false;
    return true;
  });
}

// Counts come from the non-critic entries, because critics render in their own
// band — counting them here would promise more than the tab reveals.
function tabsMarkup(entries, active) {
  return `<div class="tabs" role="tablist" aria-label="Experience level">
    ${LEVELS.map((level) => {
      const count = entries.filter(({ creator }) => creator.level?.includes(level)).length;
      const selected = level === active;
      return `<button type="button" class="tab" role="tab"
                id="tab-${level}" aria-controls="panel-levels"
                aria-selected="${selected}" tabindex="${selected ? '0' : '-1'}"
                data-level="${level}">
        ${level[0].toUpperCase() + level.slice(1)}
        <span class="tab__count">(${count})</span>
      </button>`;
    }).join('')}
  </div>`;
}

function filtersMarkup(entries, filters) {
  const formats = [...new Set(entries.flatMap(({ creator }) => creator.formatTags ?? []))].sort();
  const sizes = SIZE_BUCKETS.filter((b) => entries.some(({ creator }) => creator.sizeBucket === b));

  return `<form class="filters" id="filters" aria-label="Filter creators">
    <div class="filters__row">
      <div class="filters__group">
        <label for="filter-size">Channel size</label>
        <select id="filter-size" name="size">
          <option value="">Any size</option>
          ${sizes.map((b) => `<option value="${esc(b)}" ${b === filters.size ? 'selected' : ''}>${esc(b)}</option>`).join('')}
        </select>
      </div>
      <div class="filters__group">
        <label for="filter-format">Format</label>
        <select id="filter-format" name="format">
          <option value="">Any format</option>
          ${formats.map((f) => `<option value="${esc(f)}" ${f === filters.format ? 'selected' : ''}>${esc(f)}</option>`).join('')}
        </select>
      </div>
      <div class="filters__group">
        <label for="filter-promo">Max self-promotion: <strong id="promo-value">${filters.promo}</strong>/4</label>
        <input id="filter-promo" name="promo" type="range" min="0" max="4" step="1" value="${filters.promo}">
      </div>
      <button type="button" class="filters__reset" id="filters-reset">Reset filters</button>
    </div>
    <p class="filters__summary" id="filters-summary" role="status" aria-live="polite"></p>
  </form>`;
}

function planMarkup(category, creatorsById) {
  const plan = category.plan ?? {};
  const weeks = ['week1', 'week2', 'week3', 'week4'];
  const filled = weeks.filter((w) => (plan[w]?.watch?.length ?? 0) > 0 || plan[w]?.do);

  if (filled.length === 0) {
    return `<div class="sec-head">
        <span class="num">04</span>
        <h2 id="plan-heading">The four-week plan</h2>
      </div>
      ${stateBlock(
        'empty',
        'The plan for this skill is not written yet.',
        `Plans are built from the creators mapped to a skill, so this one is
         waiting on the creator research. It will be four weeks, each with one
         or two videos and a single exercise you can do in under thirty minutes.`
      )}`;
  }

  const items = weeks
    .map((week, i) => {
      const w = plan[week] ?? {};
      const watch = (w.watch ?? [])
        .map((id) => {
          const creator = creatorsById.get(id);
          return creator
            ? `<li><a href="#/creator/${esc(id)}">${esc(creator.name)}</a></li>`
            : `<li>${esc(id)}</li>`;
        })
        .join('');
      const key = `${category.id}:${week}`;
      return `<li class="plan__week">
        <span class="plan__marker"><span>${String(i + 1).padStart(2, '0')}</span></span>
        <div class="plan__body">
          ${watch ? `<ul class="plan__watch"><span class="micro" style="color:var(--warm-500)">Watch</span> ${watch}</ul>` : ''}
          <label class="plan__check">
            <input type="checkbox" data-plan-key="${esc(key)}">
            <span>${esc(w.do ?? '')}</span>
          </label>
        </div>
      </li>`;
    })
    .join('');

  return `<div class="sec-head">
      <span class="num">04</span>
      <h2 id="plan-heading">The four-week plan</h2>
    </div>
    <p class="plan__intro">
      One exercise a week, each doable in under thirty minutes. Ticking these
      off is saved in your browser only — nothing is sent anywhere.
    </p>
    <ul class="plan__weeks">${items}</ul>`;
}

function restorePlanState(app, categoryId) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(PLAN_STORAGE + categoryId) ?? '{}');
  } catch {
    saved = {};
  }
  for (const box of app.querySelectorAll('[data-plan-key]')) {
    box.checked = Boolean(saved[box.dataset.planKey]);
    box.addEventListener('change', () => {
      saved[box.dataset.planKey] = box.checked;
      try {
        localStorage.setItem(PLAN_STORAGE + categoryId, JSON.stringify(saved));
      } catch {
        // Storage blocked — the tick still works for this visit.
      }
    });
  }
}

export async function renderCategory(app, { params, query }) {
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${stateBlock('loading', 'Loading skill…', '')}</div>`;

  let category;
  let entries;
  let index;
  try {
    [category, entries, index] = await Promise.all([
      getCategory(params.id),
      getCreatorsForCategory(params.id),
      getCategoryIndex(),
    ]);
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage('error', 'Skill unavailable', 'This skill could not be loaded.', esc(err.message))}</div>`;
    return;
  }

  if (!category) {
    app.setAttribute('aria-busy', 'false');
    setTitle('Skill not found');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage(
      'error',
      'Skill not found',
      'No such skill.',
      `There is no skill with the id <code>${esc(params.id)}</code>.
       <a href="#/">Back to all skills</a>.`
    )}</div>`;
    return;
  }

  setTitle(category.name);

  const nameById = new Map(index.map((c) => [c.id, c.name]));
  const creatorsById = new Map(entries.map(({ creator }) => [creator.id, creator]));
  const critics = entries.filter(({ creator }) => creator.role === 'critic');
  const nonCritics = entries.filter(({ creator }) => creator.role !== 'critic');
  const filters = readFilters(query);

  const related = (category.relatedCategories ?? [])
    .filter((id) => nameById.has(id))
    .map((id) => `<a href="#/category/${esc(id)}">${esc(nameById.get(id))}</a>`)
    .join('');

  app.innerHTML = `
    <section class="band band--ink hero__band">
      <div class="rail rail--ink"><span>${esc(domainLabel(category.domain))}</span></div>
      <div class="band-body">
        <p class="crumb"><a href="#/">All skills</a> › ${esc(domainLabel(category.domain))}</p>
        <h1>${esc(category.name)}</h1>
        <p class="lead">${esc(category.blurb)}</p>
        ${related ? `<p class="cat-head__related">Related: ${related}</p>` : ''}
        <div class="hero__orn" aria-hidden="true">${ornamentFor(category.id, { size: 180 })}</div>
      </div>
    </section>

    <section class="band band--paper">
      <div class="rail"><span>Creators</span></div>
      <div class="band-body">
        ${entries.length === 0
          ? `<div style="margin-bottom: var(--sp-8)">${stateBlock(
              'empty',
              'No creators are listed for this skill yet.',
              `The guidance below still applies, but we would rather show you nothing
               than a list we have not verified. <a href="#/">Browse other skills</a>.`
            )}</div>`
          : ''}

        ${tabsMarkup(nonCritics, filters.level)}
        <div id="panel-levels" role="tabpanel" aria-labelledby="tab-${filters.level}" tabindex="0">
          <div id="level-guidance"></div>
          ${nonCritics.length ? filtersMarkup(nonCritics, filters) : ''}
          <ul class="creator-list creator-list--grid" id="creator-list"></ul>
        </div>
      </div>
    </section>

    ${critics.length
      ? `<section class="band band--ink other-side" aria-labelledby="other-side-heading">
          <div class="rail rail--ink"><span>The other side</span></div>
          <div class="band-body">
            <div class="sec-head">
              <span class="num" style="color:var(--wine-200)">03</span>
              <h2 id="other-side-heading">The other side</h2>
            </div>
            <p class="other-side__note">
              Someone who criticises this field rather than selling it. Worth
              watching before you commit time or money to anything above.
            </p>
            <ul class="creator-list">
              ${critics.map(({ creator, mapping }) => creatorCard(creator, mapping)).join('')}
            </ul>
          </div>
        </section>`
      : ''}

    <section class="band band--alt plan" aria-labelledby="plan-heading">
      <div class="rail"><span>Practice</span></div>
      <div class="band-body">
        ${planMarkup(category, creatorsById)}
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');

  // ---- dynamic parts -----------------------------------------------------

  const guidanceEl = app.querySelector('#level-guidance');
  const listEl = app.querySelector('#creator-list');
  const summaryEl = app.querySelector('#filters-summary');

  function paint() {
    const current = readFilters(parseHash().query);

    guidanceEl.innerHTML = `<div class="level-guidance">
      <p class="micro claim__label">${esc(current.level)}</p>
      <p>${esc(category.levels?.[current.level] ?? '')}</p>
    </div>`;

    for (const tab of app.querySelectorAll('.tab')) {
      const selected = tab.dataset.level === current.level;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    app.querySelector('#panel-levels')?.setAttribute('aria-labelledby', `tab-${current.level}`);

    const visible = applyFilters(nonCritics, current);

    if (!entries.length) {
      listEl.innerHTML = '';
    } else if (!visible.length) {
      listEl.innerHTML = `<li>${stateBlock(
        'empty',
        'No creators match these filters.',
        'Try widening the channel size or format, or raising the self-promotion limit.'
      )}</li>`;
    } else {
      listEl.innerHTML = visible.map(({ creator, mapping }) => creatorCard(creator, mapping)).join('');
    }

    if (summaryEl) {
      summaryEl.textContent = visible.length
        ? `Showing ${visible.length} of ${nonCritics.length} creators.`
        : `No creators match. ${nonCritics.length} available at other settings.`;
    }
  }

  function update(patch) {
    const next = { ...parseHash().query, ...patch };
    for (const key of Object.keys(next)) if (next[key] === '' || next[key] == null) delete next[key];
    replaceQuery(next);
    paint();
  }

  const tabs = [...app.querySelectorAll('.tab')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => update({ level: tab.dataset.level }));
    tab.addEventListener('keydown', (event) => {
      const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!delta) return;
      event.preventDefault();
      const next = tabs[(i + delta + tabs.length) % tabs.length];
      next.focus();
      update({ level: next.dataset.level });
    });
  });

  const form = app.querySelector('#filters');
  if (form) {
    form.addEventListener('submit', (e) => e.preventDefault());
    form.querySelector('#filter-size')?.addEventListener('change', (e) => update({ size: e.target.value }));
    form.querySelector('#filter-format')?.addEventListener('change', (e) => update({ format: e.target.value }));
    const promo = form.querySelector('#filter-promo');
    promo?.addEventListener('input', (e) => {
      form.querySelector('#promo-value').textContent = e.target.value;
      update({ promo: e.target.value === '4' ? '' : e.target.value });
    });
    form.querySelector('#filters-reset')?.addEventListener('click', () => {
      form.reset();
      form.querySelector('#promo-value').textContent = '4';
      update({ size: '', format: '', promo: '' });
    });
  }

  restorePlanState(app, category.id);
  paint();
}
