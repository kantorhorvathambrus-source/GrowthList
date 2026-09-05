#!/usr/bin/env node
/**
 * WCAG CONTRAST, ACTUALLY VERIFIED.
 *
 *   node scripts/check-contrast.mjs
 *
 * CLAUDE.md has asserted since early on that "contrast is verified by script,
 * not by eye: 22 text/background pairings across both themes, all passing WCAG
 * AA". No such script has ever existed in this repository — git history has no
 * record of one being added or deleted. It was a claim about our own rigour,
 * stated with a specific measured result, produced by nothing. That is the
 * badge-claim failure in the design half of the project.
 *
 * This is that script. It reads the tokens from css/tokens.css rather than
 * taking a copy of them, resolves var() chains, and reports what the ratios
 * actually are. The numbers in the documentation now come from running it.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'css/tokens.css'), 'utf8');

/** Token values per theme. The dark block re-declares a subset; anything it
 *  does not re-declare inherits the light value, which is what the cascade
 *  does and therefore what the check must do. */
function tokensFor(theme) {
  const out = new Map();
  const blocks = [];
  const rootRe = /:root\s*\{([^}]*)\}/g;
  let m;
  while ((m = rootRe.exec(css))) blocks.push({ dark: false, body: m[1] });
  const darkRe = /(?:\[data-theme=["']dark["']\]|prefers-color-scheme:\s*dark)[^{]*\{\s*:?r?o?o?t?\s*\{?([^}]*)\}/g;
  while ((m = darkRe.exec(css))) blocks.push({ dark: true, body: m[1] });
  for (const b of blocks) {
    if (b.dark && theme !== 'dark') continue;
    for (const line of b.body.split(';')) {
      const d = line.match(/(--[\w-]+)\s*:\s*(.+)/);
      if (d) out.set(d[1].trim(), d[2].trim().replace(/\/\*.*?\*\//g, '').trim());
    }
  }
  return out;
}

function resolve(name, tokens, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const v = tokens.get(name);
  if (!v) return null;
  const ref = v.match(/var\((--[\w-]+)\)/);
  if (ref) return resolve(ref[1], tokens, seen);
  const hex = v.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
  return hex ? hex[0] : null;
}

function lum(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Every text-on-surface pairing the CSS ACTUALLY PRODUCES.
 *
 *  The first version of this list was written from the semantic aliases in
 *  tokens.css and reported two dark-theme failures. Both were phantoms: seven
 *  of those aliases (--bg-inverse, --text-on-dark, --text-muted-dark, --link,
 *  --link-hover, --badge-ink, --bg-accent) are declared and never referenced by
 *  a single rule, because the bands colour themselves from the raw scale steps
 *  instead. A checker built from the tokens rather than from their use invents
 *  its own findings — the third time in this session that a detector I wrote
 *  produced false positives before it produced a true one.
 *
 *  So these pairs are read off css/style.css. Anything added here must be
 *  traceable to a rule that sets both a colour and its surface.
 */
const PAIRS = [
  // body surfaces
  ['--text', '--bg'], ['--text', '--bg-alt'],
  ['--text-muted', '--bg'], ['--text-muted', '--bg-alt'],
  ['--text-body', '--bg'], ['--text-body', '--bg-alt'],
  ['--accent-ink', '--bg'], ['--accent-ink', '--bg-alt'],
  ['--chip-ink', '--bg'],
  ['--text', '--rule-faint'], ['--text-muted', '--rule-faint'],
  // .band--ink { background: var(--band-ink-bg); color: var(--paper) }
  ['--paper', '--band-ink-bg'],
  // .band--ink .lead, .band--ink .eyebrow { color: var(--wine-200) }
  ['--wine-200', '--band-ink-bg'],
  // .band--accent { background: var(--wine-600); color: var(--paper) }
  ['--paper', '--wine-600'],
  ['--wine-200', '--wine-600'],
];

/** Declared in tokens.css, referenced by nothing. Reported, not tested — a
 *  dead token is worth knowing about and is not a contrast defect. */
const DEAD = ['--bg-inverse', '--text-on-dark', '--text-muted-dark', '--link', '--link-hover', '--badge-ink', '--bg-accent'];

// Large text (>=24px, or >=18.66px bold) passes AA at 3.0; body text needs 4.5.
const LARGE = new Set(['--paper|--wine-600', '--wine-200|--wine-600']);
let fails = 0, checked = 0;
for (const theme of ['light', 'dark']) {
  const tk = tokensFor(theme);
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fg, bg] of PAIRS) {
    const a = resolve(fg, tk), b = resolve(bg, tk);
    if (!a || !b) { console.log(`  ?  ${fg} on ${bg} — unresolved`); continue; }
    const r = ratio(a, b);
    const need = LARGE.has(`${fg}|${bg}`) ? 3 : 4.5;
    const ok = r >= need;
    checked++;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2)}:1 (needs ${need})  ${fg} on ${bg}   ${a} / ${b}`);
  }
}
console.log(`\n${checked} pairings checked across both themes — ${fails} below WCAG AA.`);
console.log(`\n${DEAD.length} semantic tokens are declared in tokens.css and referenced by nothing:`);
console.log(`  ${DEAD.join(', ')}`);
console.log('  The bands colour themselves from raw scale steps instead. Not a defect,');
console.log('  but it is why a checker built from the token list tests pairings that');
console.log('  do not exist — which is how this script first reported two false failures.');
process.exit(fails ? 1 : 0);
