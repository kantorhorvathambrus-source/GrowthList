// Click-to-load video affordance.
//
// Privacy: nothing is requested from any third party until the visitor clicks.
// That includes thumbnails — YouTube serves those from i.ytimg.com, not from
// the nocookie domain, so fetching one before the click would leak the visit
// exactly as an autoloaded iframe would.
//
// Design: the wine block IS the affordance, not a grey placeholder standing in
// for a missing image (DESIGN.md, "Video pre-click state"). It is a filled
// --wine-600 bar with a ring-and-triangle mark, an eyebrow, and the title.

import { esc } from '../utils.js';
import { play } from './ornament.js';

const NOCOOKIE = 'https://www.youtube-nocookie.com/embed/';
const WATCH = 'https://www.youtube.com/watch?v=';

/**
 * Markup for an unloaded player. No iframe and no remote request yet.
 *
 * `entryVideo.durationMin` is optional — when present the eyebrow reads
 * "START HERE · 18 MIN" as designed; when absent it reads "START HERE" alone
 * rather than inventing a runtime.
 */
export function embedMarkup(video, { creatorName = '', showWhy = true } = {}) {
  if (!video?.videoId) return '';

  const title = esc(video.title ?? 'Entry-point video');
  const label = creatorName
    ? `Play “${title}” from ${esc(creatorName)}`
    : `Play “${title}”`;
  const eyebrow = video.durationMin
    ? `Start here · ${esc(video.durationMin)} min`
    : 'Start here';

  return `<div class="embed">
    <div class="embed__frame" data-video="${esc(video.videoId)}" data-title="${title}">
      <button type="button" class="embed__button" aria-label="${label}">
        <span class="embed__ring" aria-hidden="true">${play()}</span>
        <span class="embed__text">
          <span class="embed__eyebrow">${eyebrow}</span>
          <span class="embed__title">${title}</span>
        </span>
      </button>
    </div>
    ${showWhy && video.whyThisOne ? `<p class="embed__why">${esc(video.whyThisOne)}</p>` : ''}
    <p class="embed__notice">Playing loads the video from YouTube, and YouTube may set cookies.</p>
  </div>`;
}

/** Replace the placeholder with a real iframe. */
function playVideo(frame) {
  const videoId = frame.dataset.video;
  const title = frame.dataset.title || 'Video';
  if (!videoId) return;

  const iframe = document.createElement('iframe');
  iframe.src = `${NOCOOKIE}${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  iframe.title = title;
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;

  // Embed-disabled, private, and removed videos all load a frame that shows
  // nothing useful. Cross-origin errors are unreadable, so offer a way out
  // rather than leaving a dead rectangle.
  const fallback = document.createElement('p');
  fallback.className = 'embed__fallback';
  fallback.innerHTML =
    `Not playing? Some videos block embedding. ` +
    `<a href="${WATCH}${encodeURIComponent(videoId)}" target="_blank" rel="noopener noreferrer">` +
    `Open it on YouTube</a>.`;

  frame.classList.add('embed__frame--playing');
  frame.replaceChildren(iframe);
  frame.after(fallback);
}

/**
 * One delegated listener for the whole app, so re-rendered views never rebind.
 * Safe to call more than once.
 */
let bound = false;
export function bindEmbeds(root = document) {
  if (bound) return;
  bound = true;
  root.addEventListener('click', (event) => {
    const button = event.target.closest('.embed__button');
    if (!button) return;
    const frame = button.closest('.embed__frame');
    if (frame) playVideo(frame);
  });
}
