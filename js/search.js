// Debounced category search with keyboard navigation.
//
// Matches category names and aliases, because the visitor rarely types the
// exact label we chose — someone looking for "stage fright" should land on
// public speaking. Implemented as a combobox so screen readers announce the
// result count and the active option.

import { esc, debounce } from './utils.js';
import { navigate } from './router.js';

const MAX_RESULTS = 8;

function score(entry, query) {
  const name = entry.name.toLowerCase();
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  for (const alias of entry.aliases ?? []) {
    const a = alias.toLowerCase();
    if (a === query) return 3;
    if (a.startsWith(query)) return 4;
    if (a.includes(query)) return 5;
  }
  return Infinity;
}

/** Which alias caused the match, so we can show "matched: stage fright". */
function matchedAlias(entry, query) {
  if (entry.name.toLowerCase().includes(query)) return null;
  return (entry.aliases ?? []).find((a) => a.toLowerCase().includes(query)) ?? null;
}

function highlight(text, query) {
  const index = text.toLowerCase().indexOf(query);
  if (index === -1) return esc(text);
  return (
    esc(text.slice(0, index)) +
    `<mark>${esc(text.slice(index, index + query.length))}</mark>` +
    esc(text.slice(index + query.length))
  );
}

export function search(entries, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 2) return [];
  return entries
    .map((entry) => ({ entry, rank: score(entry, query) }))
    .filter(({ rank }) => rank !== Infinity)
    .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => ({ entry, alias: matchedAlias(entry, query) }));
}

/**
 * Wire up a search box. `entries` is the category half of the search index.
 */
export function mountSearch(root, entries) {
  const input = root.querySelector('#search-input');
  const list = root.querySelector('#search-results');
  const status = root.querySelector('#search-status');
  if (!input || !list) return;

  let results = [];
  let active = -1;

  const close = () => {
    results = [];
    active = -1;
    list.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };

  const render = (query) => {
    if (!results.length) {
      list.replaceChildren();
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      if (status) {
        status.textContent = query.trim().length >= 2 ? `No skills match “${query.trim()}”.` : '';
      }
      return;
    }
    const q = query.trim().toLowerCase();
    list.innerHTML = results
      .map(({ entry, alias }, i) => {
        const meta = alias ? `matched “${esc(alias)}”` : '';
        return `<li id="search-result-${i}" class="search__result" role="option"
                    aria-selected="${i === active}" data-id="${esc(entry.id)}">
          <span class="search__result-name">${highlight(entry.name, q)}</span>
          <span class="search__result-meta">${meta}</span>
        </li>`;
      })
      .join('');
    input.setAttribute('aria-expanded', 'true');
    if (status) {
      status.textContent = `${results.length} skill${results.length === 1 ? '' : 's'} found. Use arrow keys to review.`;
    }
  };

  const setActive = (index) => {
    active = index;
    [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === index)));
    if (index >= 0) {
      input.setAttribute('aria-activedescendant', `search-result-${index}`);
      list.children[index]?.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const go = (id) => {
    close();
    input.value = '';
    navigate(`#/category/${id}`);
  };

  const run = debounce((value) => {
    results = search(entries, value);
    active = -1;
    render(value);
  }, 140);

  input.addEventListener('input', () => run(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      run.cancel();
      close();
      input.value = '';
      if (status) status.textContent = '';
      return;
    }
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((active + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((active - 1 + results.length) % results.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(results.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const chosen = results[active >= 0 ? active : 0];
      if (chosen) go(chosen.entry.id);
    }
  });

  list.addEventListener('mousedown', (event) => {
    // mousedown rather than click, so the blur handler does not close the list
    // out from under the pointer.
    const item = event.target.closest('.search__result');
    if (item) {
      event.preventDefault();
      go(item.dataset.id);
    }
  });

  input.addEventListener('blur', () => setTimeout(close, 120));
}
