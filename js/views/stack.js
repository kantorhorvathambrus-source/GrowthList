// Build your stack: pick up to five skills and get one recommended specialist
// per skill — not the intersection, because the best person for speaking is
// rarely the best person for marketing. A single generalist is surfaced at the
// end only if one genuinely covers several of the picks.

import { getCategoryIndex, getCreators } from '../data.js';
import { esc, stateBlock, statePage, setTitle, domainLabel, sortDomains, sizeLabel } from '../utils.js';
import { crosshair } from '../components/ornament.js';
import { encodeStack, decodeStack } from '../stack-encode.js';
import { creatorMini } from '../components/creator-card.js';
import { embedMarkup } from '../components/video-embed.js';
import { replaceQuery, parseHash } from '../router.js';

const MAX_PICKS = 5;

/**
 * Best specialist for a category. Prefers a primary mapping, then depth and
 * practicality, then the smaller channel — depth beats reach.
 */
function pickSpecialist(categoryId, creators) {
  const SIZE_ORDER = ['<100k', '100k-500k', '500k-1M', '1M-5M', '5M-20M', '>20M'];
  const candidates = creators
    .map((creator) => ({ creator, mapping: (creator.categories ?? []).find((m) => m.id === categoryId) }))
    .filter(({ creator, mapping }) => mapping && creator.role === 'specialist');

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const primary = (b.mapping.strength === 'primary') - (a.mapping.strength === 'primary');
    if (primary) return primary;
    const quality =
      (b.creator.profile?.depth ?? 0) + (b.creator.profile?.practical ?? 0) -
      ((a.creator.profile?.depth ?? 0) + (a.creator.profile?.practical ?? 0));
    if (quality) return quality;
    return SIZE_ORDER.indexOf(a.creator.sizeBucket) - SIZE_ORDER.indexOf(b.creator.sizeBucket);
  });

  return candidates[0];
}

/** A generalist covering two or more of the chosen categories, if one exists. */
function pickGeneralist(ids, creators) {
  let best = null;
  for (const creator of creators) {
    if (creator.role !== 'generalist') continue;
    const covered = (creator.categories ?? []).map((m) => m.id).filter((id) => ids.includes(id));
    if (covered.length < 2) continue;
    if (!best || covered.length > best.covered.length) best = { creator, covered };
  }
  return best;
}

export async function renderStack(app, { query }) {
  setTitle('Build your stack');
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${stateBlock('loading', 'Loading…', '')}</div>`;

  let categories;
  let creators;
  try {
    [categories, creators] = await Promise.all([getCategoryIndex(), getCreators()]);
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage('error', 'Build your stack', 'The stack builder could not load.', esc(err.message))}</div>`;
    return;
  }

  const validIds = new Set(categories.map((c) => c.id));
  const byId = new Map(categories.map((c) => [c.id, c]));
  let picks = decodeStack(query.ids).filter((id) => validIds.has(id)).slice(0, MAX_PICKS);

  const byDomain = new Map();
  for (const cat of categories) {
    if (!byDomain.has(cat.domain)) byDomain.set(cat.domain, []);
    byDomain.get(cat.domain).push(cat);
  }

  const options = sortDomains([...byDomain.keys()])
    .map((domain) => {
      const list = byDomain.get(domain).sort((a, b) => a.name.localeCompare(b.name));
      return `<optgroup label="${esc(domainLabel(domain))}">
        ${list.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
      </optgroup>`;
    })
    .join('');

  app.innerHTML = `
    <section class="band band--ink hero__band">
      <div class="rail rail--ink"><span>Stack</span></div>
      <div class="band-body">
        <p class="crumb"><a href="#/">All skills</a> › Build your stack</p>
        <h1>Build your stack</h1>
        <p class="lead">
          Pick up to ${MAX_PICKS} skills. You get one recommended specialist for each
          — not one person who claims to cover them all — plus a link you can share.
        </p>
        <div class="hero__orn" aria-hidden="true">${crosshair({ size: 180 })}</div>
      </div>
    </section>

    <section class="band band--paper">
      <div class="rail"><span>Your picks</span></div>
      <div class="band-body">
        <form class="stack__picker" id="stack-form">
          <div class="filters__group">
            <label for="stack-add">Add a skill</label>
            <select id="stack-add">
              <option value="">Choose a skill…</option>
              ${options}
            </select>
          </div>
          <p class="filters__summary" id="stack-count" role="status" aria-live="polite"></p>
          <ul class="stack__chosen" id="stack-chosen"></ul>
        </form>

        <div id="stack-result"></div>
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');

  const select = app.querySelector('#stack-add');
  const chosenEl = app.querySelector('#stack-chosen');
  const countEl = app.querySelector('#stack-count');
  const resultEl = app.querySelector('#stack-result');

  function shareUrl() {
    const encoded = encodeStack(picks);
    return `${location.origin}${location.pathname}#/stack${encoded ? `?ids=${encoded}` : ''}`;
  }

  function paintPicks() {
    chosenEl.innerHTML = picks
      .map(
        (id) => `<li class="chip">
          ${esc(byId.get(id)?.name ?? id)}
          <button type="button" data-remove="${esc(id)}" aria-label="Remove ${esc(byId.get(id)?.name ?? id)}">×</button>
        </li>`
      )
      .join('');
    countEl.textContent = picks.length
      ? `${picks.length} of ${MAX_PICKS} chosen.`
      : 'Nothing chosen yet.';
    select.disabled = picks.length >= MAX_PICKS;
    for (const option of select.options) {
      option.disabled = option.value !== '' && picks.includes(option.value);
    }
  }

  function paintResult() {
    if (!picks.length) {
      resultEl.innerHTML = stateBlock(
        'empty',
        'Pick a skill to start.',
        'Your stack appears here, and the URL updates so you can bookmark or share it.'
      );
      return;
    }

    const rows = picks.map((id) => ({ id, category: byId.get(id), best: pickSpecialist(id, creators) }));
    const generalist = pickGeneralist(picks, creators);
    const missing = rows.filter((r) => !r.best);

    resultEl.innerHTML = `
      <div class="stack__share">
        <label class="visually-hidden" for="stack-url">Shareable link</label>
        <input id="stack-url" type="text" readonly value="${esc(shareUrl())}">
        <button type="button" class="button button--quiet" id="copy-url">Copy link</button>
        <span class="filters__summary" id="copy-status" role="status" aria-live="polite"></span>
      </div>

      <div class="sec-head"><span class="num">01</span><h2>Your stack</h2></div>
      ${missing.length === rows.length
        ? stateBlock(
            'empty',
            'No specialists are listed for these skills yet.',
            'The creator research for these skills is still in progress, so there is nothing honest to recommend here.'
          )
        : ''}

      <ul class="creator-list creator-list--grid stack__result">
        ${rows
          .map(({ id, category, best }, i) => {
            if (!best) {
              return `<li><article class="cc">
                <div class="stack__row-head">
                  <span class="num">${String(i + 1).padStart(2, '0')}</span>
                  <h3 class="cc-name"><a href="#/category/${esc(id)}">${esc(category.name)}</a></h3>
                </div>
                <p class="claim"><i aria-hidden="true"></i></p>
                <p style="font-size:var(--fs-small);color:var(--warm-500)">No specialist is listed for this skill yet.</p>
              </article></li>`;
            }
            const { creator, mapping } = best;
            return `<li><article class="cc cc--accent">
              <div class="stack__row-head">
                <span class="num">${String(i + 1).padStart(2, '0')}</span>
                <h3 class="cc-name"><a href="#/category/${esc(id)}">${esc(category.name)}</a></h3>
              </div>
              <p class="cc-meta">
                <span class="micro"><a href="#/creator/${esc(creator.id)}">${esc(creator.name)}</a></span>
                <span class="dot" aria-hidden="true"></span>
                <span class="micro">${esc(sizeLabel(creator.sizeBucket))}</span>
              </p>
              <div class="hair"></div>
              <div class="claim"><i aria-hidden="true"></i><div>
                <p class="micro claim__label">Why here</p><p>${esc(mapping.why)}</p></div></div>
              <div class="claim claim--caveat"><i aria-hidden="true"></i><div>
                <p class="micro claim__label">Not for</p><p>${esc(creator.notFor)}</p></div></div>
              ${mapping.entryVideo ? embedMarkup(mapping.entryVideo, { creatorName: creator.name }) : ''}
            </article></li>`;
          })
          .join('')}
      </ul>

      ${generalist
        ? `<section class="similar" style="margin-top: var(--sp-12)">
            <div class="sec-head"><span class="num">02</span><h2>One generalist, if you'd rather have fewer voices</h2></div>
            <p class="similar__note">
              Covers ${generalist.covered.length} of your picks. A generalist is
              a reasonable single starting point, but expect less depth than the
              specialists above.
            </p>
            <ul class="creator-list">
              ${creatorMini(
                generalist.creator,
                `Covers: ${esc(generalist.covered.map((id) => byId.get(id)?.name ?? id).join(', '))}`
              )}
            </ul>
          </section>`
        : ''}
    `;

    resultEl.querySelector('#copy-url')?.addEventListener('click', async () => {
      const status = resultEl.querySelector('#copy-status');
      const input = resultEl.querySelector('#stack-url');
      try {
        await navigator.clipboard.writeText(input.value);
        status.textContent = 'Link copied.';
      } catch {
        input.select();
        status.textContent = 'Press Ctrl+C to copy.';
      }
    });
  }

  function sync() {
    const next = { ...parseHash().query };
    const encoded = encodeStack(picks);
    if (encoded) next.ids = encoded;
    else delete next.ids;
    replaceQuery(next);
    paintPicks();
    paintResult();
  }

  select.addEventListener('change', () => {
    const id = select.value;
    select.value = '';
    if (!id || picks.includes(id) || picks.length >= MAX_PICKS) return;
    picks = [...picks, id];
    sync();
  });

  chosenEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    picks = picks.filter((id) => id !== button.dataset.remove);
    sync();
  });

  paintPicks();
  paintResult();
}
