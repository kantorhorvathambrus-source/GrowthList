// Creator profile: full description, taste-profile bars, every category they
// are mapped to with its own reason and entry video, signals, caveats, and
// nearest neighbours within the same domain.

import { getCreator, getCreators, getCategoryIndex, getDomainByCategory } from '../data.js';
import { esc, stateBlock, statePage, setTitle, PROFILE_AXES, SIGNAL_LABELS, domainLabel } from '../utils.js';
import { embedMarkup, } from '../components/video-embed.js';
import { creatorMini } from '../components/creator-card.js';
import { similarCreators } from '../similarity.js';

function axesMarkup(profile) {
  if (!profile) return '';
  return `<ul class="axes" aria-label="Taste profile">
    ${PROFILE_AXES.map(([key, label]) => {
      const value = profile[key] ?? 0;
      const pct = (value / 4) * 100;
      return `<li class="axis">
        <span>${esc(label)}</span>
        <span class="axis__bar">
          <span class="axis__fill" style="width:${pct}%"></span>
        </span>
        <span class="axis__value">${value}/4</span>
      </li>`;
    }).join('')}
  </ul>`;
}

export async function renderCreator(app, { params }) {
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = stateBlock('loading', 'Loading creator…', '');

  let creator;
  let all;
  let index;
  let domainByCategory;
  try {
    [creator, all, index, domainByCategory] = await Promise.all([
      getCreator(params.id),
      getCreators(),
      getCategoryIndex(),
      getDomainByCategory(),
    ]);
  } catch (err) {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = statePage('error', 'Creator unavailable', 'This creator could not be loaded.', esc(err.message));
    return;
  }

  if (!creator) {
    app.setAttribute('aria-busy', 'false');
    setTitle('Creator not found');
    app.innerHTML = statePage(
      'error',
      'Creator not found',
      'No such creator.',
      `There is no creator with the id <code>${esc(params.id)}</code>.
       <a href="#/">Back to all skills</a>.`
    );
    return;
  }

  setTitle(creator.name);

  const nameById = new Map(index.map((c) => [c.id, c.name]));
  const neighbours = similarCreators(creator, all, domainByCategory, 4);

  const mappings = (creator.categories ?? [])
    .map((m) => {
      const catName = nameById.get(m.id) ?? m.id;
      const domain = domainByCategory.get(m.id);
      return `<article class="mapping">
        <div class="mapping__head">
          <h3><a href="#/category/${esc(m.id)}">${esc(catName)}</a></h3>
          <span class="pill">${esc(m.strength)}</span>
          ${domain ? `<span class="creator-card__handle">${esc(domainLabel(domain))}</span>` : ''}
        </div>
        <p>${esc(m.why)}</p>
        <p class="mapping__evidence"><strong>Why them:</strong> ${esc(m.evidence)}</p>
        ${m.entryVideo ? embedMarkup(m.entryVideo, { creatorName: creator.name }) : ''}
      </article>`;
    })
    .join('');

  const signals = (creator.signals ?? [])
    .map((s) => `<li class="tag tag--signal">${esc(SIGNAL_LABELS[s] ?? s)}</li>`)
    .join('');
  const formats = (creator.formatTags ?? []).map((t) => `<li class="tag">${esc(t)}</li>`).join('');

  app.innerHTML = `
    <p class="crumb"><a href="#/">All skills</a> › Creator</p>

    <div class="profile__head">
      <h1>${esc(creator.name)}</h1>
      <div class="profile__meta">
        <span class="creator-card__handle">${esc(creator.handle)}</span>
        <span class="pill pill--size">${esc(creator.sizeBucket)} subscribers</span>
        ${creator.role === 'critic' ? '<span class="pill pill--critic">critic</span>' : ''}
        ${creator.role === 'generalist' ? '<span class="pill">generalist</span>' : ''}
        ${creator.status === 'archive' ? '<span class="pill pill--archive">archive</span>' : ''}
        <span class="pill">${esc(creator.country)}</span>
      </div>

      <p class="profile__desc">${esc(creator.longDescription)}</p>

      <p class="creator-card__notfor"><strong>Not for:</strong> ${esc(creator.notFor)}</p>
      ${creator.caveats ? `<p class="creator-card__caveat">${esc(creator.caveats)}</p>` : ''}
      ${creator.scopeNote ? `<p class="creator-card__caveat"><strong>Scope:</strong> ${esc(creator.scopeNote)}</p>` : ''}
      ${creator.verified === false
        ? stateBlock('empty', 'Not fully verified.', esc(creator.note ?? 'Some details on this entry could not be confirmed.'))
        : ''}

      ${formats || signals ? `<ul class="tag-row">${formats}${signals}</ul>` : ''}

      <p>
        <a class="button" href="${esc(creator.channelUrl)}" target="_blank" rel="noopener noreferrer">
          Open channel on YouTube
        </a>
      </p>
    </div>

    <h2>Taste profile</h2>
    <p class="similar__note">
      Our read on the channel, not a rating. Higher self-promotion means more
      course and product pushing, which is a fact about the channel rather than
      a judgement of it.
    </p>
    ${axesMarkup(creator.profile)}

    <h2>Where they're worth watching</h2>
    ${mappings || stateBlock('empty', 'No category mappings.', 'This creator is not mapped to any skill yet.')}

    <section class="similar" aria-labelledby="similar-heading">
      <h2 id="similar-heading">Similar creators</h2>
      <p class="similar__note">
        Nearest by taste profile, within the same fields only — we never suggest
        a marketer because they happen to feel like your favourite climber.
      </p>
      ${neighbours.length
        ? `<ul class="creator-list">
            ${neighbours
              .map(({ creator: n, sharedDomains }) =>
                creatorMini(n, `Shared ground: ${esc(sharedDomains.map(domainLabel).join(', '))}`)
              )
              .join('')}
          </ul>`
        : stateBlock('empty', 'No close matches yet.', 'There are not enough creators in these fields to compare against.')}
    </section>
  `;
  app.setAttribute('aria-busy', 'false');
}
