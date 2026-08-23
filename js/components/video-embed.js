// Click-to-load video embed.
//
// Nothing is requested from any third party until the visitor clicks. That
// includes thumbnails: YouTube serves thumbnails from i.ytimg.com, not from
// the nocookie domain, so fetching one before the click would leak the visit
// exactly as an autoloaded iframe would. We therefore render a local
// placeholder and only create the iframe — pointed at youtube-nocookie.com —
// on the click itself.

import { esc } from '../utils.js';

const NOCOOKIE = 'https://www.youtube-nocookie.com/embed/';
const WATCH = 'https://www.youtube.com/watch?v=';

/** Markup for an unloaded player. The iframe does not exist yet. */
export function embedMarkup(video, { creatorName = '' } = {}) {
  if (!video?.videoId) return '';
  const title = esc(video.title ?? 'Entry-point video');
  const label = creatorName
    ? `Play “${title}” from ${esc(creatorName)}`
    : `Play “${title}”`;

  return `<div class="embed">
    <div class="embed__frame" data-video="${esc(video.videoId)}" data-title="${title}">
      <button type="button" class="embed__button" aria-label="${label}">
        <span class="embed__play" aria-hidden="true"></span>
        <span class="embed__title">${title}</span>
      </button>
    </div>
    ${video.whyThisOne ? `<p class="embed__why">${esc(video.whyThisOne)}</p>` : ''}
    <p class="embed__notice">Playing loads the video from YouTube, and YouTube may set cookies.</p>
  </div>`;
}

/** Replace the placeholder with a real iframe. */
function play(frame) {
  const videoId = frame.dataset.video;
  const title = frame.dataset.title || 'Video';
  if (!videoId) return;

  const iframe = document.createElement('iframe');
  iframe.src = `${NOCOOKIE}${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  iframe.title = title;
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;

  // If the video is embed-disabled, private, or removed, the frame will load
  // but show nothing useful. We cannot read cross-origin errors, so we offer a
  // way out rather than leaving a dead rectangle.
  const fallback = document.createElement('p');
  fallback.className = 'embed__fallback';
  fallback.innerHTML =
    `Not playing? Some videos block embedding. ` +
    `<a href="${WATCH}${encodeURIComponent(videoId)}" target="_blank" rel="noopener noreferrer">` +
    `Open it on YouTube</a>.`;

  frame.replaceChildren(iframe);
  frame.after(fallback);
}

/**
 * One delegated listener for the whole app, so re-rendered views never need to
 * rebind. Safe to call more than once.
 */
let bound = false;
export function bindEmbeds(root = document) {
  if (bound) return;
  bound = true;
  root.addEventListener('click', (event) => {
    const button = event.target.closest('.embed__button');
    if (!button) return;
    const frame = button.closest('.embed__frame');
    if (frame) play(frame);
  });
}
