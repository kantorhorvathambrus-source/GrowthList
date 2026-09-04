// Data access. Every fetch is memoised, so a view can ask for what it needs
// without worrying about duplicate requests. Nothing here talks to a network
// service — these are static JSON files served from the same origin.

const BASE = new URL('../data/', import.meta.url);

const cache = new Map();

function load(file) {
  if (!cache.has(file)) {
    const promise = fetch(new URL(file, BASE), { credentials: 'omit' })
      .then((res) => {
        if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        // Let the next attempt retry rather than caching the failure forever.
        cache.delete(file);
        throw err;
      });
    cache.set(file, promise);
  }
  return cache.get(file);
}

/** Slim list for the home page: id, name, domain, blurb, aliases, count. */
export const getCategoryIndex = () => load('categories-index.json');

/** Full category records, including levels and the four-week plan. */
export const getCategories = () => load('categories.json');

/** Full creator records. Lazy — only fetched once a view actually needs it. */
export const getCreators = () => load('creators.json');

/**
 * Standing notes for signals that are near-universal within a domain.
 * Optional file — an empty object is the correct answer before any signal
 * has saturated, so a missing file is not an error.
 */
export const getDomainNotes = () =>
  load('domain-notes.json').catch(() => ({ notes: {} }));

/**
 * Rule 12 subject notes: categories where we held a higher bar, and the short
 * factual reason. Generated from the research file, so only the visitor-facing
 * half ships. Optional — a missing file means no category has one.
 */
export const getSubjectNotes = () =>
  load('subject-notes.json').catch(() => ({ notes: {} }));

/** Search index: categories (name + aliases) and creators (name + handle). */
export const getSearchIndex = () => load('search-index.json');

/** Full category by id, or undefined. */
export async function getCategory(id) {
  const cats = await getCategories();
  return cats.find((c) => c.id === id);
}

/** Full creator by id, or undefined. */
export async function getCreator(id) {
  const creators = await getCreators();
  return creators.find((c) => c.id === id);
}

/** Every creator mapped to a category, each paired with that mapping. */
export async function getCreatorsForCategory(categoryId) {
  const creators = await getCreators();
  const out = [];
  for (const creator of creators) {
    const mapping = (creator.categories ?? []).find((m) => m.id === categoryId);
    if (mapping) out.push({ creator, mapping });
  }
  return out;
}

/** Map of categoryId -> domain, for the "never across domains" similarity rule. */
export async function getDomainByCategory() {
  const cats = await getCategoryIndex();
  return new Map(cats.map((c) => [c.id, c.domain]));
}

/** The dataset's snapshot month, taken from the creators actually present. */
export async function getSnapshot() {
  try {
    const creators = await getCreators();
    const stamps = creators.map((c) => c.dataAsOf).filter(Boolean).sort();
    return stamps.length ? stamps[stamps.length - 1] : null;
  } catch {
    return null;
  }
}
