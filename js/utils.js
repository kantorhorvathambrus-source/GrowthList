// Small shared helpers. No dependencies.

/** Escape text for safe interpolation into an HTML string. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build an element from an HTML string. */
export function html(strings, ...values) {
  const markup = strings.reduce((acc, s, i) => acc + s + (i < values.length ? values[i] : ''), '');
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content;
}

export function debounce(fn, wait = 160) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

/** Human label for a domain slug. */
const DOMAIN_LABELS = {
  mindset: 'Mindset & psychology',
  fitness: 'Physical fitness',
  health: 'Health & nutrition',
  communication: 'Communication & social skills',
  career: 'Career & professional skills',
  money: 'Money & investing',
  business: 'Entrepreneurship & business',
  marketing: 'Marketing & sales',
  tech: 'Technology & AI',
  programming: 'Programming & technical skills',
  creativity: 'Creativity & creative crafts',
  learning: 'Learning & study skills',
  productivity: 'Productivity & systems',
  relationships: 'Relationships',
  practical: 'Practical life skills',
  philosophy: 'Philosophy & meaning',
};

export const domainLabel = (slug) => DOMAIN_LABELS[slug] ?? slug;

/** Order domains for display; unknown slugs fall to the end alphabetically. */
export const DOMAIN_ORDER = Object.keys(DOMAIN_LABELS);

export function sortDomains(slugs) {
  return [...slugs].sort((a, b) => {
    const ia = DOMAIN_ORDER.indexOf(a);
    const ib = DOMAIN_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export const SIZE_BUCKETS = ['<100k', '100k-500k', '500k-1M', '1M-5M', '5M-20M', '>20M'];
export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const SIGNAL_LABELS = {
  credentialed: 'credentialed',
  'cites-research': 'cites research',
  practitioner: 'practitioner',
  'sells-course': 'sells a course',
  'sponsor-heavy': 'sponsor heavy',
  'contested-claims': 'contested claims',
  'strong-ideological-frame': 'strong ideological frame',
};

export const PROFILE_AXES = [
  ['evidenceBased', 'Evidence-based'],
  ['practical', 'Practical'],
  ['energy', 'Energy'],
  ['selfPromotion', 'Self-promotion'],
  ['depth', 'Depth'],
];

/** Render one of the shared page states. */
export function stateBlock(kind, title, body) {
  return `<div class="state state--${kind}">
    ${title ? `<p><strong>${esc(title)}</strong></p>` : ''}
    ${body ? `<p>${body}</p>` : ''}
  </div>`;
}

/**
 * A whole-page state. Unlike stateBlock this carries an <h1>, so a page that
 * is nothing but an error still has a heading for screen readers and for
 * anything that outlines the document.
 */
export function statePage(kind, heading, title, body) {
  return `<h1>${esc(heading)}</h1>${stateBlock(kind, title, body)}`;
}

export function setTitle(text) {
  document.title = text ? `${text} — GrowthList` : 'GrowthList — curated YouTube creators, by skill';
}

/** Pick a deterministic-ish random element. */
export function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}
