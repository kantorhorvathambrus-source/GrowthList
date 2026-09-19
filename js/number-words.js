// Spelled-out numbers, shared by the colophon (render time) and build-data
// (build time) so there is exactly one implementation.
//
// It lives in js/ rather than scripts/lib/ because the browser is the harder
// consumer: js/ is served as-is, and node can import an ES module from here
// without ceremony. The project's own note applies -- a solved problem that
// does not travel to the next place it is needed is a class of defect here,
// so this is imported in both places rather than copied into the second.
//
// House style spells numbers out in prose, so a count destined for a sentence
// goes through this and a count destined for a table does not.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 0-99 as words; 100 and over stay as digits, which is also house style. */
export function numberToWords(n) {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) {
    const u = n % 10;
    return u ? `${TENS[Math.floor(n / 10)]}-${ONES[u]}` : TENS[Math.floor(n / 10)];
  }
  return String(n);
}

/** "a, b and c" -- the joiner the badge table already uses for signal names. */
export function joinWords(list) {
  const v = [...list];
  if (v.length === 0) return '';
  if (v.length === 1) return v[0];
  return `${v.slice(0, -1).join(', ')} and ${v[v.length - 1]}`;
}
