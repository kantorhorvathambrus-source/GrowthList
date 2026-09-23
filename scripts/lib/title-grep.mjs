/**
 * KEYWORD SCANNING OVER A WHOLE UPLOAD WINDOW, WITH ITS DENOMINATOR.
 *
 * Three decisions in this project turned on a keyword scan of a creator's
 * catalogue — Hans-Georg Moeller (86 uploads, zero long-form hits for Daoism),
 * Jeff Su (300 uploads, one hit across nine career terms), Sean Allen (300
 * uploads, 107 hits all the same weekly news show). Each was decisive, each is
 * quoted in CLAUDE.md, and there was NO SCRIPT FOR ANY OF THEM. They were done
 * by hand, which is the rules-that-need-manual-repetition class: a procedure
 * requiring N manual repetitions gets executed zero times by anyone who did not
 * personally write it down.
 *
 * Worse, the tool people would reach for instead — evidence.mjs — fetched 200
 * uploads and printed twelve. Scanning its output and calling the result a
 * catalogue scan produced exactly one inverted triage before this was written:
 * Learn Linux TV read as a poor category fit on twelve titles and as the best
 * candidate on two hundred.
 *
 * SO THE CONTRACT HERE IS THE DENOMINATOR. Every result carries how many
 * uploads were actually examined, because "no hits" is a claim about a search
 * and is worthless without the size of what was searched (rule 18), and because
 * a number that reaches a record must be able to name what it is out of.
 *
 * A BAD PATTERN MUST NOT LOOK LIKE AN EMPTY CATALOGUE. compilePattern throws on
 * a malformed regex rather than returning something that matches nothing —
 * otherwise a typo and a genuine absence of evidence print identically, which
 * is rule 20 exactly.
 */

/**
 * Compile a user-supplied pattern, case-insensitive.
 * Throws on a malformed pattern: a typo must not read as "no matches".
 */
export function compilePattern(src) {
  if (typeof src !== 'string' || !src.trim()) {
    throw new Error('empty grep pattern — refusing to report a match count against nothing');
  }
  try {
    return new RegExp(src, 'i');
  } catch (err) {
    throw new Error(`bad grep pattern /${src}/ — ${err.message}. Refusing to continue: an invalid pattern matches nothing, which is indistinguishable from a catalogue with no hits.`);
  }
}

/**
 * Scan every video in the window. `longMin` is the long-form floor (default 8,
 * matching evidence.mjs's own threshold).
 *
 * Returns counts against BOTH denominators — the whole window and its
 * long-form subset — because a hit on a two-minute short is not evidence that
 * a channel teaches something.
 */
export function grepTitles(vids, pattern, { longMin = 8 } = {}) {
  const re = typeof pattern === 'string' ? compilePattern(pattern) : pattern;
  const all = vids ?? [];
  const long = all.filter((v) => (v.durationMin ?? 0) >= longMin);
  const matched = all.filter((v) => re.test(v.title ?? ''));
  const matchedLong = long.filter((v) => re.test(v.title ?? ''));
  return {
    pattern: re.source,
    scanned: all.length,
    longForm: long.length,
    matched: matched.length,
    matchedLongForm: matchedLong.length,
    hits: matchedLong,
    hitsAll: matched,
  };
}
