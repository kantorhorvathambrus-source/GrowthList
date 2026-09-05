/**
 * WHERE A THIRD VOICE CHANGES WHAT A VISITOR GETS.
 *
 * The depth target is 2. Everything past that is headroom, and the owner's
 * instruction is that it be spent deliberately rather than on whichever
 * category research happens to be pointing at. Three claims on it, in order:
 *
 *   1. HIGH STAKES (rule 12). A category where being wrong is expensive is
 *      the one where a single missing perspective costs most.
 *   2. JURISDICTION SPLIT (rule 16). Two creators cannot cover four markets.
 *      A category flagged here is serving part of its audience and not the
 *      rest, and the third creator is how that gets fixed.
 *   3. THE TWO AGREE. The weakest kind of pair: same role, no critic, and
 *      largely the same signals. A visitor reads agreement as consensus
 *      when it may only be a sample of two. This is the one that has to be
 *      MEASURED rather than recalled, because it is invisible from a
 *      category page — both records look fine on their own.
 *
 * Deliberately NOT a validator failure. It is a spending order, and a
 * category with two good creators is finished as far as the target goes.
 */

/** Signals that describe a stance rather than a credential. Two creators
 *  sharing these is what "they agree" actually means; two creators both
 *  being `credentialed` is not agreement, it is a coincidence of training. */
const STANCE_SIGNALS = new Set([
  'sells-course',
  'sponsor-heavy',
  'commercial-conflict',
  'contested-claims',
  'strong-ideological-frame',
]);

export function agreementScore(list) {
  if (list.length !== 2) return null;
  const [a, b] = list;
  if (a.role === 'critic' || b.role === 'critic') return null;
  // TWO AXES. `role` alone said Pianote and a working piano teacher were the
  // same kind of voice, because 201 of 233 records carry `specialist`. An
  // institution and an individual are close to the widest disagreement a
  // category can offer, so a difference on the entity axis DISQUALIFIES the
  // agreement finding outright rather than merely reducing it. Where either
  // entity is unset the pair is left alone — an unknown is not a match, and
  // guessing here would corrupt the allocation this test exists to drive.
  if (!a.entity || !b.entity) return { sameRole: false, overlap: null, shared: [], sameLevel: false, unknownEntity: true };
  // A VENDOR AND A NON-VENDOR ARE NOT AGREEING, whatever their signals say: a
  // company whose channel sells its own product and a person teaching a craft
  // are different in kind. That disqualifies the finding.
  //
  // An institution and an individual are a WEAKER difference and the first
  // version of this rule got it wrong by disqualifying them too — which
  // suppressed the injury-rehab finding, the case that showed the test was
  // worth having, over E3 Rehab being a group practice and Squat University
  // one clinician. They are not the widest disagreement in that category; they
  // are two evidence-based rehab voices saying the same thing. So it reduces
  // the score instead of erasing the finding.
  const vendorSplit = (a.entity === 'vendor') !== (b.entity === 'vendor');
  if (vendorSplit) return { sameRole: false, overlap: null, shared: [], sameLevel: false, differentEntity: [a.entity, b.entity] };
  const sameRole = a.role === b.role;
  const entityPenalty = a.entity === b.entity ? 0 : 1;
  const sa = new Set((a.signals ?? []).filter((s) => STANCE_SIGNALS.has(s)));
  const sb = new Set((b.signals ?? []).filter((s) => STANCE_SIGNALS.has(s)));
  const union = new Set([...sa, ...sb]);
  const shared = [...sa].filter((s) => sb.has(s));
  // No stance signals on either side is not agreement, it is no information.
  const overlap = union.size === 0 ? null : shared.length / union.size;
  const sameLevel = JSON.stringify([...(a.level ?? [])].sort()) === JSON.stringify([...(b.level ?? [])].sort());
  return { sameRole, overlap, shared, sameLevel, entityPenalty, entities: [a.entity, b.entity] };
}

export function depth3Priority({ categories, creators, highStakes, jurisdiction }) {
  const byCat = new Map();
  for (const c of creators) for (const m of c.categories ?? []) {
    if (!byCat.has(m.id)) byCat.set(m.id, []);
    byCat.get(m.id).push(c);
  }
  const hs = new Set(Object.keys(highStakes?.categories ?? {}));
  const ju = new Set(Object.keys(jurisdiction?.categories ?? {}));

  const rows = [];
  for (const cat of categories) {
    const list = byCat.get(cat.id) ?? [];
    if (list.length !== 2) continue; // below target, or already past it
    const reasons = [];
    let rank = 0;
    if (hs.has(cat.id)) { reasons.push('high-stakes'); rank += 3; }
    if (ju.has(cat.id)) { reasons.push('jurisdiction-split'); rank += 2; }
    const ag = agreementScore(list);
    if (ag && ag.sameRole && ag.overlap !== null && ag.overlap >= 0.5) {
      const who = ag.entityPenalty ? `${ag.entities.join(' and ')}` : `both ${ag.entities[0]}`;
      reasons.push(`the two agree (${who}, same role, ${Math.round(ag.overlap * 100)}% stance overlap${ag.shared.length ? ': ' + ag.shared.join(', ') : ''})`);
      rank += 2 - ag.entityPenalty;
    } else if (ag && ag.sameRole && ag.overlap === null) {
      const who = ag.entityPenalty ? `${ag.entities.join(' and ')}` : `both ${ag.entities[0]}`;
      reasons.push(`the two agree (${who}, same role, neither carries a stance signal)`);
      rank += Math.max(0, 1 - ag.entityPenalty);
    }
    if (!reasons.length) continue;
    rows.push({ id: cat.id, domain: cat.domain, rank, reasons, who: list.map((c) => c.name) });
  }
  rows.sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
  return rows;
}
