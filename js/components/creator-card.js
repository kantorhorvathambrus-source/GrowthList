// The creator card — the core repeating component.
//
// Slot order is fixed and identical at every density, so a density switch is a
// class change and never a re-render of different markup (DESIGN.md,
// "Creator card"):
//
//   avatar → name → subscriber-size label → format tags → "why here" →
//   "not for" → signal badges → entry-point video
//
// Everything here uses the body or condensed stack. The display serif never
// appears inside a card that repeats 700 times.

import { esc, SIGNAL_LABELS, sizeLabel, sizeClass, monogram } from '../utils.js';
import { embedMarkup } from './video-embed.js';
import { badgeMark, SIGNAL_MARKS } from './ornament.js';

// The design shows 1–3 tags and 0–3 badges. The dataset allows up to 5 format
// tags and 7 signals, so the surplus collapses into a "+N" chip rather than
// wrapping into a fourth row. The full set is always listed on the profile.
const MAX_TAGS = 3;
const MAX_BADGES = 3;

/**
 * Monogram avatars alternate fill so adjacent ones don't stripe the list.
 * Parity is derived from the id, so a creator's avatar is stable across
 * renders and filter changes rather than depending on list position.
 */
function avatar(creator) {
  const initials = monogram(creator.name);
  const alt = [...String(creator.id)].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 2 === 1;

  if (creator.avatar) {
    return `<img class="avatar" src="${esc(creator.avatar)}" alt=""
                 width="96" height="96" loading="lazy" decoding="async">`;
  }
  return `<span class="avatar avatar--monogram${alt ? ' avatar--alt' : ''}"
                role="img" aria-label="${esc(creator.name)}">${esc(initials)}</span>`;
}

function meta(creator) {
  const parts = [sizeLabel(creator.sizeBucket), sizeClass(creator.sizeBucket)];
  if (creator.role === 'critic') parts.push('Critic');
  else if (creator.role === 'generalist') parts.push('Generalist');
  if (creator.status === 'archive') parts.push('Archive');

  return parts
    .filter(Boolean)
    .map((p) => `<span class="micro">${esc(p)}</span>`)
    .join('<span class="dot" aria-hidden="true"></span>');
}

function tags(creator) {
  const list = creator.formatTags ?? [];
  const shown = list.slice(0, MAX_TAGS);
  const extra = list.length - shown.length;
  if (!shown.length) return '';
  return `<ul class="tags">
    ${shown.map((t) => `<li>${esc(t)}</li>`).join('')}
    ${extra > 0 ? `<li class="tags__more" title="${esc(list.slice(MAX_TAGS).join(', '))}">+${extra}</li>` : ''}
  </ul>`;
}

function badges(creator) {
  const list = creator.signals ?? [];
  const shown = list.slice(0, MAX_BADGES);
  const extra = list.length - shown.length;
  if (!shown.length) return '';
  return `<ul class="badges">
    ${shown
      .map((s) => {
        const label = SIGNAL_LABELS[s] ?? s;
        return `<li class="badge">${badgeMark(SIGNAL_MARKS[s])}${esc(label)}</li>`;
      })
      .join('')}
    ${extra > 0 ? `<li class="badge" title="${esc(list.slice(MAX_BADGES).map((s) => SIGNAL_LABELS[s] ?? s).join(', '))}">+${extra}</li>` : ''}
  </ul>`;
}

function claim(kind, label, text) {
  if (!text) return '';
  return `<div class="claim${kind === 'caveat' ? ' claim--caveat' : ''}">
    <i aria-hidden="true"></i>
    <div>
      <p class="micro claim__label">${esc(label)}</p>
      <p>${esc(text)}</p>
    </div>
  </div>`;
}

/**
 * Full card, used in category lists.
 * @param {object} creator  full creator record
 * @param {object} mapping  that creator's mapping for the category in view
 */
export function creatorCard(creator, mapping, { showEmbed = true } = {}) {
  return `<li>
    <article class="cc cc--accent">
      <div class="cc-head">
        ${avatar(creator)}
        <div class="cc-head__body">
          <h3 class="cc-name"><a href="#/creator/${esc(creator.id)}">${esc(creator.name)}</a></h3>
          <p class="cc-meta">${meta(creator)}</p>
          ${tags(creator)}
        </div>
      </div>

      <div class="hair"></div>

      ${claim('fit', 'Why here', mapping?.why ?? creator.shortDescription)}
      ${claim('caveat', 'Not for', creator.notFor)}
      ${creator.caveats ? claim('caveat', 'Note', creator.caveats) : ''}

      ${badges(creator)}

      ${showEmbed && mapping?.entryVideo ? embedMarkup(mapping.entryVideo, { creatorName: creator.name }) : ''}
    </article>
  </li>`;
}

/**
 * Compact card — list density for the stack builder and similar-creators rows.
 * Same slot order, one sentence, no embed.
 */
export function creatorMini(creator, note = '') {
  return `<li>
    <article class="cc cc--compact">
      <div class="cc-head">
        ${avatar(creator)}
        <div class="cc-head__body">
          <h3 class="cc-name"><a href="#/creator/${esc(creator.id)}">${esc(creator.name)}</a></h3>
          <p class="cc-meta">${meta(creator)}</p>
        </div>
      </div>

      <div class="hair"></div>

      ${claim('fit', 'Why here', creator.shortDescription)}
      ${claim('caveat', 'Not for', creator.notFor)}
      ${note ? `<p class="embed__notice">${note}</p>` : ''}
    </article>
  </li>`;
}
