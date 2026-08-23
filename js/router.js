// Hash router. Hash rather than the History API so the site works from any
// static server and from Netlify with no rewrite rules, while every view stays
// deep-linkable and the back button behaves.
//
//   #/                      home
//   #/category/:id          category view (?level=&size=&format=&promo=)
//   #/creator/:id           creator profile
//   #/stack                 stack builder (?ids=<base64>)

const routes = [];
let notFound = () => {};
let current = null;

export function route(pattern, handler) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern
        .replace(/\//g, '\\/')
        .replace(/:(\w+)/g, (_, key) => {
          keys.push(key);
          return '([^/]+)';
        }) +
      '$'
  );
  routes.push({ regex, keys, handler });
}

export function setNotFound(handler) {
  notFound = handler;
}

/** Parse "#/category/x?level=advanced" into { path, params, query }. */
export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, queryString = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));
  return { path: path || '/', query };
}

/** Build a hash URL from a path and query object, omitting empty values. */
export function buildHash(path, query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== '' && value != null) params.set(key, value);
  }
  const qs = params.toString();
  return `#${path}${qs ? `?${qs}` : ''}`;
}

/**
 * Update the query string of the current view without adding a history entry.
 * Used by filters and tabs, so the back button steps between views rather
 * than between every filter change.
 */
export function replaceQuery(query) {
  const { path } = parseHash();
  history.replaceState(null, '', buildHash(path, query));
}

export function navigate(hash) {
  if (location.hash === hash) return;
  location.hash = hash;
}

async function resolve() {
  const { path, query } = parseHash();
  current = path;

  for (const { regex, keys, handler } of routes) {
    const match = path.match(regex);
    if (!match) continue;
    const params = {};
    keys.forEach((key, i) => {
      params[key] = decodeURIComponent(match[i + 1]);
    });
    await handler({ params, query, path });
    return;
  }
  await notFound({ path, query });
}

export function start() {
  addEventListener('hashchange', () => {
    const { path } = parseHash();
    // Query-only changes (filters, tabs) are handled in place by the view.
    if (path === current) return;
    resolve();
  });
  resolve();
}
