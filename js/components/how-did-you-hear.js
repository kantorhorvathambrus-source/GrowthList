// "How did you hear about us" — a Netlify Form.
//
// Two placements, one form:
//   1. A permanent, unobtrusive copy in the footer. This one is written
//      statically into index.html, because Netlify's build bot scans static
//      HTML at deploy time to register a form — a form injected by JavaScript
//      is never detected. It is also the copy that works with JS disabled,
//      as a plain form POST.
//   2. A dismissible prompt rendered inline (never fixed, never an overlay)
//      after the visitor has viewed three categories in a session.
//
// Both post to the same Netlify form name, so they land in one submission
// list. The field names must stay identical — see FIELDS below and the
// matching markup in index.html.
//
// We collect the answer and the optional note. Nothing else: no email, no
// identifier, no analytics, no fingerprinting, and no logging of our own.

const FORM_NAME = 'how-did-you-hear';
const STORE_KEY = 'growthlist:hdyh';        // 'dismissed' | 'submitted'
const SEEN_KEY = 'growthlist:seen-categories';
const NETLIFY_KEY = 'growthlist:netlify';
const PROMPT_AFTER = 3;
const NOTE_MAX = 200;

export const OPTIONS = [
  'A search engine',
  'Reddit',
  'X / Twitter',
  'A YouTube comment',
  'A newsletter or blog',
  'A friend',
  'Somewhere else',
];

// ---------------------------------------------------------------- storage

const readLocal = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode or blocked storage
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not persisting is acceptable — the visitor simply may be asked again.
  }
};

/** Already answered or dismissed? Then never ask again. */
export const isSettled = () => Boolean(readLocal(STORE_KEY));

/**
 * Count distinct categories viewed this session. Session-scoped on purpose:
 * it is a "have they actually used the site yet" signal, not a profile.
 */
export function recordCategoryView(categoryId) {
  if (!categoryId) return 0;
  let seen = [];
  try {
    seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]');
    if (!Array.isArray(seen)) seen = [];
  } catch {
    seen = [];
  }
  if (!seen.includes(categoryId)) {
    seen.push(categoryId);
    try {
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {
      // Counting simply won't persist; the prompt just won't appear.
    }
  }
  return seen.length;
}

function seenCount() {
  try {
    const seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]');
    return Array.isArray(seen) ? seen.length : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------- netlify

/**
 * Is this actually a Netlify deploy? A same-origin HEAD request is enough:
 * Netlify stamps every response with x-nf-request-id. Anywhere else — a plain
 * static server, GitHub Pages, a file:// open — the header is absent and the
 * form is hidden rather than left to POST into a 404.
 *
 * Deliberately NOT gated on hostname: Netlify Dev serves from localhost, so a
 * hostname check would both hide the form during local development and, worse,
 * skip caching the answer that the prompt gate depends on. The header is the
 * only thing that actually distinguishes a Netlify deploy.
 *
 * No third-party request is involved, and the result is cached per session.
 */
async function isNetlify() {
  if (location.protocol === 'file:') return false;

  const cached = (() => {
    try {
      return sessionStorage.getItem(NETLIFY_KEY);
    } catch {
      return null;
    }
  })();
  if (cached === 'yes') return true;
  if (cached === 'no') return false;

  let result = false;
  try {
    const res = await fetch(location.pathname, { method: 'HEAD', credentials: 'omit' });
    result = res.headers.has('x-nf-request-id');
  } catch {
    result = false;
  }
  try {
    sessionStorage.setItem(NETLIFY_KEY, result ? 'yes' : 'no');
  } catch {
    // Cache miss next time is harmless.
  }
  return result;
}

/** One check per page load, shared by the footer form and the prompt. */
let netlifyPromise = null;
function netlifyCheck() {
  netlifyPromise ??= isNetlify();
  return netlifyPromise;
}

// ---------------------------------------------------------------- markup

/**
 * The prompt's copy of the form. `prefix` keeps ids unique against the static
 * footer copy — duplicate ids would break every label association on the page.
 *
 * Keep the name attributes in step with index.html: form-name, bot-field,
 * source, note.
 */
export function formMarkup(prefix) {
  const options = OPTIONS.map((label, i) => {
    const id = `${prefix}-source-${i}`;
    return `<label class="hdyh__opt" for="${id}">
      <input type="radio" id="${id}" name="source" value="${label}" required>
      <span>${label}</span>
    </label>`;
  }).join('');

  return `<form name="${FORM_NAME}" method="POST" data-netlify="true"
                netlify-honeypot="bot-field" class="hdyh__form" novalidate>
    <input type="hidden" name="form-name" value="${FORM_NAME}">
    <p class="hdyh__hp" aria-hidden="true">
      <label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label>
    </p>

    <fieldset class="hdyh__fieldset">
      <legend class="hdyh__legend">How did you hear about GrowthList?</legend>
      <div class="hdyh__options">${options}</div>
    </fieldset>

    <div class="hdyh__note">
      <label for="${prefix}-note">Anything else? (optional)</label>
      <input type="text" id="${prefix}-note" name="note" maxlength="${NOTE_MAX}"
             autocomplete="off" placeholder="Up to ${NOTE_MAX} characters">
    </div>

    <div class="hdyh__actions">
      <button type="submit" class="button">Send</button>
      <span class="hdyh__status" role="status" aria-live="polite"></span>
    </div>

    <p class="hdyh__privacy">
      That is everything we collect — no email, no identifier, no analytics,
      and no logging of our own.
    </p>
  </form>`;
}

// ---------------------------------------------------------------- submit

function thankYou(container) {
  container.innerHTML = `<p class="hdyh__thanks">Thank you — that genuinely helps.</p>`;
}

/**
 * Intercept the submit so the visitor gets an inline thank-you rather than
 * Netlify's own success page. Without JavaScript the same form does a plain
 * POST and Netlify handles it — that path is unaffected by anything here.
 */
function wireForm(form, onSettled) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = form.querySelector('.hdyh__status');
    const chosen = form.querySelector('input[name="source"]:checked');
    if (!chosen) {
      if (status) status.textContent = 'Pick one option first.';
      form.querySelector('input[name="source"]')?.focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending…';

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'omit',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      writeLocal(STORE_KEY, 'submitted');
      thankYou(form.parentElement ?? form);
      onSettled?.();
    } catch {
      // Most likely this is not a Netlify deploy after all. Say so plainly
      // rather than pretending the answer was recorded.
      if (button) button.disabled = false;
      if (status) {
        status.textContent = 'That did not send — this site may not be set up to receive it.';
      }
      try {
        sessionStorage.setItem(NETLIFY_KEY, 'no');
      } catch {
        // Ignore.
      }
    }
  });
}

// ---------------------------------------------------------------- init

/**
 * Wire the static footer form, and arm the inline prompt.
 * Safe to call once at boot.
 */
export async function initHowDidYouHear() {
  const footer = document.getElementById('hdyh-footer');

  // Settled visitors never see either placement again.
  if (isSettled()) {
    footer?.remove();
    return;
  }

  // Fail closed off Netlify: hide the form rather than let it POST into a 404.
  if (!(await netlifyCheck())) {
    footer?.remove();
    return;
  }

  if (footer) {
    const form = footer.querySelector('form');
    if (form) wireForm(form, () => document.getElementById('hdyh-prompt')?.remove());
  }

  maybeShowPrompt();
}

/**
 * Show the inline prompt once three categories have been viewed. Rendered in
 * the normal document flow at the end of the main content — it never overlays,
 * never fixes to the viewport, and never blocks reading.
 *
 * Async because it must not render before the Netlify check resolves; the
 * router calls it without awaiting, which is fine — the cheap synchronous
 * guards run first and the check is shared and cached.
 */
export async function maybeShowPrompt() {
  if (isSettled()) return;
  if (document.getElementById('hdyh-prompt')) return;
  if (seenCount() < PROMPT_AFTER) return;
  if (!(await netlifyCheck())) return;
  // The view may have changed while the check was in flight.
  if (document.getElementById('hdyh-prompt') || isSettled()) return;

  // Mounted OUTSIDE #app, because every view render replaces that element's
  // contents — a prompt inside it would vanish on the next navigation and pop
  // back on the one after. Sitting above the footer, it stays put until the
  // visitor answers or dismisses it.
  const anchor = document.getElementById('hdyh-footer') ?? document.querySelector('.site-footer');
  if (!anchor) return;

  const section = document.createElement('section');
  section.id = 'hdyh-prompt';
  section.className = 'band band--alt hdyh hdyh--prompt';
  section.setAttribute('aria-labelledby', 'hdyh-prompt-heading');
  section.innerHTML = `
    <div class="rail"><span>One question</span></div>
    <div class="band-body">
      <div class="hdyh__head">
        <div>
          <p class="eyebrow">Optional</p>
          <h2 id="hdyh-prompt-heading" class="hdyh__heading">How did you find GrowthList?</h2>
        </div>
        <button type="button" class="hdyh__dismiss" id="hdyh-dismiss">
          No thanks
        </button>
      </div>
      ${formMarkup('hdyh-prompt')}
    </div>`;

  anchor.before(section);

  // The footer copy asks the identical question, so showing both stacks two
  // identical forms on top of each other. While the prompt is up it IS the
  // ask; the footer copy stands down.
  document.getElementById('hdyh-footer')?.remove();

  const form = section.querySelector('form');
  if (form) wireForm(form);

  section.querySelector('#hdyh-dismiss')?.addEventListener('click', () => {
    writeLocal(STORE_KEY, 'dismissed');
    section.remove();
    // "Settled" means settled: the footer copy goes too, so the behaviour
    // matches what a reload would do rather than leaving a form behind that
    // disappears next visit.
    document.getElementById('hdyh-footer')?.remove();
  });
}
