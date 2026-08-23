// "If you like X you'll like Y", computed client-side.
//
// Simple weighted Euclidean distance over the five profile axes. Candidates
// are restricted to creators sharing at least one top-level domain with the
// subject — a similar taste profile in a different field is not a useful
// recommendation, so we never cross domains here.

const AXES = ['evidenceBased', 'practical', 'energy', 'selfPromotion', 'depth'];

// Depth and evidence say more about whether you'll enjoy someone than energy
// does, and self-promotion is a smaller signal still.
const WEIGHTS = {
  evidenceBased: 1.2,
  practical: 1,
  energy: 0.8,
  selfPromotion: 0.6,
  depth: 1.2,
};

export function distance(a, b) {
  let total = 0;
  for (const axis of AXES) {
    const diff = (a?.[axis] ?? 0) - (b?.[axis] ?? 0);
    total += WEIGHTS[axis] * diff * diff;
  }
  return Math.sqrt(total);
}

/** The set of domains a creator covers, via the categories they're mapped to. */
export function domainsOf(creator, domainByCategory) {
  const out = new Set();
  for (const m of creator.categories ?? []) {
    const domain = domainByCategory.get(m.id);
    if (domain) out.add(domain);
  }
  return out;
}

/**
 * Nearest neighbours by profile distance, within shared domains only.
 * Returns [{ creator, distance, sharedDomains }], closest first.
 */
export function similarCreators(subject, allCreators, domainByCategory, limit = 4) {
  const subjectDomains = domainsOf(subject, domainByCategory);
  if (subjectDomains.size === 0) return [];

  const scored = [];
  for (const candidate of allCreators) {
    if (candidate.id === subject.id) continue;
    const candidateDomains = domainsOf(candidate, domainByCategory);
    const shared = [...candidateDomains].filter((d) => subjectDomains.has(d));
    if (shared.length === 0) continue;
    scored.push({
      creator: candidate,
      distance: distance(subject.profile, candidate.profile),
      sharedDomains: shared,
    });
  }

  scored.sort((a, b) => a.distance - b.distance || a.creator.name.localeCompare(b.creator.name));
  return scored.slice(0, limit);
}
