/**
 * Signal saturation, measured per domain.
 *
 * A signal badge is only useful if it separates creators from each other.
 * When nearly everyone in a domain carries the same one, the badge stops
 * being information about the creator and becomes a fact about the field —
 * and a fact about the field belongs on the category page once, not on
 * every card.
 *
 * The owner's rule, from the marketing pass: handle a near-universal signal
 * at the category level with a standing note, and leave the per-creator
 * badge to do the work it can still do.
 *
 * Two thresholds, both deliberately conservative:
 *   SATURATED  — 70% of a domain's creators carry it. Above this the badge
 *                tells a visitor almost nothing they would not assume.
 *   MIN_N      — 4 creators. Below this the percentage is arithmetic, not
 *                evidence: 2 of 2 is 100% and means nothing at all.
 *
 * A creator counts toward a domain if any of its mappings sit in that
 * domain, so a creator mapped across two domains is measured in both. That
 * is the right unit: the question is what a visitor to a category page in
 * that domain will see.
 */

export const SATURATED = 0.7;
export const NEAR = 0.5;
export const MIN_N = 4;

/**
 * @param {Array} categories full category records (needs id + domain)
 * @param {Array} creators   full creator records (needs categories[] + signals[])
 * @returns {{ perDomain: Map<string, {n:number, signals:Map<string,number>}>,
 *             rows: Array<{domain:string, signal:string, n:number, of:number, pct:number, measurable:boolean}> }}
 */
export function measureSaturation(categories, creators) {
  const domainOf = new Map(categories.map((c) => [c.id, c.domain]));
  const perDomain = new Map();
  for (const c of categories) {
    if (!perDomain.has(c.domain)) perDomain.set(c.domain, { n: 0, signals: new Map() });
  }

  for (const creator of creators) {
    const domains = new Set(
      (creator.categories ?? []).map((m) => domainOf.get(m.id)).filter(Boolean)
    );
    for (const d of domains) {
      const rec = perDomain.get(d);
      if (!rec) continue;
      rec.n++;
      // Deduplicated: a creator carries a signal once, however many of its
      // mappings sit in this domain.
      for (const s of new Set(creator.signals ?? [])) {
        rec.signals.set(s, (rec.signals.get(s) ?? 0) + 1);
      }
    }
  }

  const rows = [];
  for (const [domain, rec] of perDomain) {
    for (const [signal, n] of rec.signals) {
      rows.push({ domain, signal, n, of: rec.n, pct: n / rec.n, measurable: rec.n >= MIN_N });
    }
  }
  rows.sort((a, b) => b.pct - a.pct || b.of - a.of || a.domain.localeCompare(b.domain));
  return { perDomain, rows };
}

/** Rows that clear both thresholds — the ones a standing note is owed for. */
export const saturatedRows = (rows) => rows.filter((r) => r.measurable && r.pct >= SATURATED);

/** Rows on the way up: worth watching, not yet worth a note. */
export const nearRows = (rows) => rows.filter((r) => r.measurable && r.pct >= NEAR && r.pct < SATURATED);
