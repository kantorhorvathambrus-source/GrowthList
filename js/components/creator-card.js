// A creator as shown inside a category: the category-specific reason, what the
// channel is not good for, signal badges, and the entry-point video.

import { esc, SIGNAL_LABELS } from '../utils.js';
import { embedMarkup } from './video-embed.js';

function pills(creator) {
  const out = [`<span class="pill pill--size">${esc(creator.sizeBucket)}</span>`];
  if (creator.role === 'critic') out.push('<span class="pill pill--critic">critic</span>');
  if (creator.role === 'generalist') out.push('<span class="pill">generalist</span>');
  if (creator.status === 'archive') {
    out.push('<span class="pill pill--archive" title="No recent uploads; listed for the back catalogue">archive</span>');
  }
  return out.join(' ');
}

function tags(creator) {
  const format = (creator.formatTags ?? []).map((t) => `<li class="tag">${esc(t)}</li>`);
  const signals = (creator.signals ?? []).map(
    (s) => `<li class="tag tag--signal">${esc(SIGNAL_LABELS[s] ?? s)}</li>`
  );
  if (!format.length && !signals.length) return '';
  return `<ul class="tag-row">${format.join('')}${signals.join('')}</ul>`;
}

/**
 * @param {object} creator  full creator record
 * @param {object} mapping  that creator's mapping for the category in view
 */
export function creatorCard(creator, mapping, { showEmbed = true } = {}) {
  return `<li>
    <article class="creator-card">
      <div class="creator-card__head">
        <h3 class="creator-card__name">
          <a href="#/creator/${esc(creator.id)}">${esc(creator.name)}</a>
        </h3>
        <span class="creator-card__handle">${esc(creator.handle)}</span>
        ${pills(creator)}
      </div>

      ${tags(creator)}

      <p class="creator-card__why">${esc(mapping?.why ?? creator.shortDescription)}</p>

      <p class="creator-card__notfor">
        <strong>Not for:</strong> ${esc(creator.notFor)}
      </p>

      ${creator.caveats ? `<p class="creator-card__caveat">${esc(creator.caveats)}</p>` : ''}

      ${showEmbed && mapping?.entryVideo ? embedMarkup(mapping.entryVideo, { creatorName: creator.name }) : ''}
    </article>
  </li>`;
}

/** A compact card used in the stack builder and similar-creators lists. */
export function creatorMini(creator, note = '') {
  return `<li>
    <article class="creator-card">
      <div class="creator-card__head">
        <h3 class="creator-card__name">
          <a href="#/creator/${esc(creator.id)}">${esc(creator.name)}</a>
        </h3>
        <span class="creator-card__handle">${esc(creator.handle)}</span>
        ${pills(creator)}
      </div>
      <p class="creator-card__why">${esc(creator.shortDescription)}</p>
      <p class="creator-card__notfor"><strong>Not for:</strong> ${esc(creator.notFor)}</p>
      ${note ? `<p class="creator-card__caveat">${note}</p>` : ''}
    </article>
  </li>`;
}
