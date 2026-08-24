// Entry point: theme, routes, delegated embed handling, footer snapshot.

import { route, setNotFound, start } from './router.js';
import { initTheme } from './theme.js';
import { bindEmbeds } from './components/video-embed.js';
import { renderHome } from './views/home.js';
import { renderCategory } from './views/category.js';
import { renderCreator } from './views/creator.js';
import { renderStack } from './views/stack.js';
import { getSnapshot } from './data.js';
import { initHowDidYouHear, recordCategoryView, maybeShowPrompt } from './components/how-did-you-hear.js';
import { stateBlock, statePage, setTitle, esc } from './utils.js';

const app = document.getElementById('app');

/** Move focus to the top of the new view so keyboard and screen readers follow. */
function focusMain() {
  const main = document.getElementById('main');
  if (!main) return;
  main.focus({ preventScroll: true });
  scrollTo(0, 0);
}

function wrap(render) {
  return async (ctx) => {
    try {
      await render(app, ctx);
    } catch (err) {
      app.setAttribute('aria-busy', 'false');
      app.innerHTML = statePage(
        'error',
        'Something went wrong',
        'This page could not be rendered.',
        `${esc(err.message)} — <a href="#/">go back to all skills</a>.`
      );
    }
    focusMain();
  };
}

route('/', wrap(renderHome));
route('/category/:id', wrap(async (app, ctx) => {
  await renderCategory(app, ctx);
  // The prompt is gated on actually having used the site: three distinct
  // categories viewed in this session.
  recordCategoryView(ctx.params.id);
  maybeShowPrompt();
}));
route('/creator/:id', wrap(renderCreator));
route('/stack', wrap(renderStack));

setNotFound(async ({ path }) => {
  setTitle('Page not found');
  app.setAttribute('aria-busy', 'false');
  app.innerHTML = statePage(
    'error',
    'Page not found',
    'That address does not match any view.',
    `Nothing lives at <code>${esc(path)}</code>. <a href="#/">Back to all skills</a>.`
  );
  focusMain();
});

initTheme();
bindEmbeds(document);
start();
initHowDidYouHear();

// The footer states when the channel data was captured. Read from the data
// itself rather than hardcoded, so it cannot drift from what is shown.
getSnapshot().then((snapshot) => {
  const el = document.getElementById('footer-snapshot');
  if (el) el.textContent = snapshot ?? 'no creator data published yet';
});
