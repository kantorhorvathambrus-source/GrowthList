/**
 * NUMBERS IN CREATOR PROSE, INTERPOLATED RATHER THAN TYPED.
 *
 * The colophon already works this way: visitor copy stopped carrying literal
 * numbers and started interpolating measured ones, and the validator fails a
 * literal. Creator prose is the same shape and did not get the same treatment —
 * 305 sentences across 233 records state a countable fact about a channel's
 * catalogue, and every one was typed by hand from an evidence dump.
 *
 * A record may now write placeholders instead:
 *
 *   "{{longCountWords|cap}} of the {{scannedWords}} most recent uploads run
 *    over twenty minutes, and the median is {{medianMin}}."
 *
 * They are filled at BUILD time from the record's own `catalogue` block, so
 * data/creators.json ships plain sentences and the client does no work — and
 * because the build runs from the batch files every time, the number is
 * re-derived rather than remembered.
 *
 * Word forms exist because the house style spells numbers out. `|cap`
 * capitalises for sentence-initial use.
 */

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function toWords(n) {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (n < 20) return WORDS[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const u = n % 10;
    return u ? `${t}-${WORDS[u]}` : t;
  }
  if (n < 1000) {
    const h = `${WORDS[Math.floor(n / 100)]} hundred`;
    const r = n % 100;
    return r ? `${h} and ${toWords(r)}` : h;
  }
  return String(n); // above a thousand the house style uses digits anyway
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** The values a placeholder may name. Derived, never stored twice. */
export function catalogueValues(cat) {
  if (!cat) return null;
  const scanned = cat.scanned ?? 0;
  const longCount = Math.round((cat.longPct / 100) * scanned);
  const shortCount = Math.round((cat.shortPct / 100) * scanned);
  const v = {
    scanned, longCount, shortCount,
    medianMin: cat.medianMin,
    videoCount: cat.videoCount,
    longPct: cat.longPct,
    shortPct: cat.shortPct,
  };
  for (const [k, n] of Object.entries(v)) {
    if (typeof n === 'number') v[`${k}Words`] = toWords(n);
  }
  return v;
}

const RE = /\{\{\s*([A-Za-z]+)\s*(?:\|\s*(cap)\s*)?\}\}/g;

/** Returns { text, missing[] }. A placeholder that cannot resolve is left in
 *  place and reported — never silently blanked, because a sentence with a hole
 *  in it is easier to notice than one quietly missing a fact. */
export function fillCatalogue(text, cat) {
  if (typeof text !== 'string' || !text.includes('{{')) return { text, missing: [] };
  const v = catalogueValues(cat);
  const missing = [];
  const out = text.replace(RE, (whole, key, mod) => {
    if (!v || v[key] === undefined) { missing.push(key); return whole; }
    const s = String(v[key]);
    return mod === 'cap' ? cap(s) : s;
  });
  return { text: out, missing };
}

/** Fields whose prose may carry placeholders. */
export const PROSE_FIELDS = ['shortDescription', 'longDescription', 'notFor', 'caveats'];
