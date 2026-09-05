// Creator profile: ink header band with the avatar and description, the
// five-axis taste profile as horizontal metric bars, every category mapping
// with its own reason and entry video, and nearest neighbours within the same
// domains.

import { getCreator, getCreators, getCategoryIndex, getDomainByCategory } from '../data.js';
import {
  esc, stateBlock, statePage, setTitle, PROFILE_AXES, SIGNAL_LABELS,
  domainLabel, sizeLabel, sizeClass, monogram,
} from '../utils.js';
import { embedMarkup } from '../components/video-embed.js';
import { creatorMini } from '../components/creator-card.js';
import { badgeMark, SIGNAL_MARKS, ornamentFor } from '../components/ornament.js';
import { similarCreators } from '../similarity.js';

function axesMarkup(profile) {
  if (!profile) return '';
  return `<ul class="axes">
    ${PROFILE_AXES.map(([key, label]) => {
      const value = profile[key] ?? 0;
      const pct = (value / 4) * 100;
      return `<li class="axis">
        <span class="axis__label">${esc(label)}</span>
        <span class="axis__bar"><span class="axis__fill" style="width:${pct}%"></span></span>
        <span class="axis__value">${value}/4</span>
      </li>`;
    }).join('')}
  </ul>`;
}

function avatarLarge(creator) {
  if (creator.avatar) {
    return `<img class="avatar" src="${esc(creator.avatar)}" alt="" width="96" height="96"
                 style="width:var(--avatar-lg);height:var(--avatar-lg)">`;
  }
  return `<span class="avatar avatar--monogram" role="img" aria-label="${esc(creator.name)}"
                style="width:var(--avatar-lg);height:var(--avatar-lg)">${esc(monogram(creator.name))}</span>`;
}

export async function renderCreator(app, { params }) {
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${stateBlock('loading', 'Loading creator…', '')}</div>`;

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
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage('error', 'Creator unavailable', 'This creator could not be loaded.', esc(err.message))}</div>`;
    return;
  }

  if (!creator) {
    app.setAttribute('aria-busy', 'false');
    setTitle('Creator not found');
    app.innerHTML = `<div class="wrap" style="padding-block: var(--sp-12)">${statePage(
      'error',
      'Creator not found',
      'No such creator.',
      `There is no creator with the id <code>${esc(params.id)}</code>.
       <a href="#/">Back to all skills</a>.`
    )}</div>`;
    return;
  }

  setTitle(creator.name);

  const nameById = new Map(index.map((c) => [c.id, c.name]));
  const neighbours = similarCreators(creator, all, domainByCategory, 4);

  const mappings = (creator.categories ?? [])
    .map((m, i) => {
      const catName = nameById.get(m.id) ?? m.id;
      const domain = domainByCategory.get(m.id);
      return `<article class="mapping">
        <div class="mapping__head">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <h3><a href="#/category/${esc(m.id)}">${esc(catName)}</a></h3>
          <span class="micro" style="color:var(--wine-600)">${esc(m.strength)}</span>
          ${domain ? `<span class="micro" style="color:var(--warm-500)">${esc(domainLabel(domain))}</span>` : ''}
        </div>
        <p>${esc(m.why)}</p>
        <p class="mapping__evidence"><strong>Why them:</strong> ${esc(m.evidence)}</p>
        ${m.entryVideo ? embedMarkup(m.entryVideo, { creatorName: creator.name }) : ''}
      </article>`;
    })
    .join('');

  const badges = (creator.signals ?? [])
    .map((s) => `<li class="badge">${badgeMark(SIGNAL_MARKS[s])}${esc(SIGNAL_LABELS[s] ?? s)}</li>`)
    .join('');
  const formats = (creator.formatTags ?? []).map((t) => `<li>${esc(t)}</li>`).join('');

  const metaParts = [sizeLabel(creator.sizeBucket), sizeClass(creator.sizeBucket), creator.country];
  if (creator.role === 'critic') metaParts.push('Critic');
  if (creator.role === 'generalist') metaParts.push('Generalist');
  // Both non-active states are shown. `dormant` exists because a channel
  // silent for over a year is a fact the reader wants before being sent to
  // learn from someone, and a two-state field could not carry it.
  if (creator.status === 'archive') metaParts.push('Archive');
  if (creator.status === 'dormant') metaParts.push('Quiet for over a year');

  app.innerHTML = `
    <section class="band band--ink hero__band">
      <div class="rail rail--ink"><span>Creator</span></div>
      <div class="band-body">
        <p class="crumb"><a href="#/">All skills</a> › Creator</p>
        <div class="profile__head-row">
          ${avatarLarge(creator)}
          <div style="flex:1;min-width:0">
            <h1>${esc(creator.name)}</h1>
            <p class="cc-meta" style="color:var(--wine-200)">
              <span class="micro">${esc(creator.handle)}</span>
              ${metaParts.filter(Boolean).map((p) => `<span class="dot" aria-hidden="true"></span><span class="micro">${esc(p)}</span>`).join('')}
            </p>
          </div>
        </div>

        <p class="profile__desc" style="margin-top: var(--sp-6)">${esc(creator.longDescription)}</p>

        <p style="margin-top: var(--sp-6)">
          <a class="button" href="${esc(creator.channelUrl)}" target="_blank" rel="noopener noreferrer">
            Open channel on YouTube
          </a>
        </p>
        <div class="hero__orn" aria-hidden="true">${ornamentFor(creator.id, { size: 180 })}</div>
      </div>
    </section>

    <section class="band band--paper">
      <div class="rail"><span>Profile</span></div>
      <div class="band-body">
        <div class="claim claim--caveat" style="margin-bottom: var(--sp-6)">
          <i aria-hidden="true"></i>
          <div>
            <p class="micro claim__label">Not for</p>
            <p>${esc(creator.notFor)}</p>
          </div>
        </div>
        ${creator.languageNote ? `<div class="claim claim--caveat" style="margin-bottom: var(--sp-6)">
          <i aria-hidden="true"></i>
          <div><p class="micro claim__label">Language</p><p>${esc(creator.languageNote)}</p></div>
        </div>` : ''}
        ${creator.caveats ? `<div class="claim claim--caveat" style="margin-bottom: var(--sp-6)">
          <i aria-hidden="true"></i>
          <div><p class="micro claim__label">Note</p><p>${esc(creator.caveats)}</p></div>
        </div>` : ''}
        ${creator.scopeNote ? `<div class="claim" style="margin-bottom: var(--sp-6)">
          <i aria-hidden="true"></i>
          <div><p class="micro claim__label">Scope</p><p>${esc(creator.scopeNote)}</p></div>
        </div>` : ''}
        ${creator.verified === false
          ? `<div style="margin-bottom: var(--sp-6)">${stateBlock('empty', 'Not fully verified.', esc(creator.note ?? 'Some details on this entry could not be confirmed.'))}</div>`
          : ''}

        ${formats ? `<ul class="tags" style="margin-bottom: var(--sp-4)">${formats}</ul>` : ''}
        ${badges ? `<ul class="badges" style="margin-top:0">${badges}</ul>` : ''}

        <div class="sec-head" style="margin-top: var(--sp-12)">
          <span class="num">01</span>
          <h2>Taste profile</h2>
        </div>
        <p class="similar__note">
          Our read on the channel, not a rating. Higher self-promotion means more
          course and product pushing, which is a fact about the channel rather than
          a judgement of it.
        </p>
        ${axesMarkup(creator.profile)}

        <div class="sec-head" style="margin-top: var(--sp-12)">
          <span class="num">02</span>
          <h2>Where they're worth watching</h2>
        </div>
        ${mappings || stateBlock('empty', 'No category mappings.', 'This creator is not mapped to any skill yet.')}
      </div>
    </section>

    <section class="band band--alt similar" aria-labelledby="similar-heading">
      <div class="rail"><span>Similar</span></div>
      <div class="band-body">
        <div class="sec-head">
          <span class="num">03</span>
          <h2 id="similar-heading">Similar creators</h2>
        </div>
        <p class="similar__note">
          Nearest by taste profile, within the same fields only — we never suggest
          a marketer because they happen to feel like your favourite climber.
        </p>
        ${neighbours.length
          ? `<ul class="creator-list creator-list--grid">
              ${neighbours
                .map(({ creator: n, sharedDomains }) =>
                  creatorMini(n, `Shared ground: ${esc(sharedDomains.map(domainLabel).join(', '))}`)
                )
                .join('')}
            </ul>`
          : stateBlock('empty', 'No close matches yet.', 'There are not enough creators in these fields to compare against.')}
      </div>
    </section>
  `;
  app.setAttribute('aria-busy', 'false');
}
