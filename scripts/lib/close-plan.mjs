/**
 * THE PHASE 2 CLOSE, COMPUTED.
 *
 * The owner's decision at batch 47: rather than 48 batches taking all 197
 * categories to depth 2 uniformly, spend ~34 creators (≈37 mappings, ≈12
 * batches at the measured 2.27/batch) on the thin categories with the most
 * appetite, then close. Three further batches write documented gaps for the
 * empty categories that have none.
 *
 * The ordering input is data/topic-demand.json — median view count of the
 * fifty most relevant YouTube videos for each category's own name and
 * aliases. READ ITS HEADER BEFORE USING THIS. It is not our traffic; this
 * site has no analytics and the home page lists all 197 categories equally.
 * It measures appetite for the SUBJECT among people already watching video
 * about it, which is a real number with a narrow meaning.
 *
 * Computed rather than written down because a plan in prose is a stored fact
 * that stops being queried — the defect this project has now logged seven
 * times. As creators land, the list shortens on its own.
 */

export const MAPPING_BUDGET = 37;

export function closePlan({ categories, creators, demand, gaps, budget = MAPPING_BUDGET }) {
  const active = new Map();
  const listed = new Map();
  for (const c of creators) {
    for (const m of c.categories ?? []) {
      listed.set(m.id, (listed.get(m.id) ?? 0) + 1);
      if (c.status === 'active') active.set(m.id, (active.get(m.id) ?? 0) + 1);
    }
  }
  const views = demand?.medianViews ?? {};
  const unmeasured = new Set(demand?.unmeasured ?? []);

  const below = categories
    .map((c) => ({
      id: c.id,
      domain: c.domain,
      active: active.get(c.id) ?? 0,
      listed: listed.get(c.id) ?? 0,
      need: Math.max(0, 2 - (active.get(c.id) ?? 0)),
      views: views[c.id],
      unmeasured: unmeasured.has(c.id),
    }))
    .filter((r) => r.need > 0);

  // An unmeasured category cannot be ranked and must not be silently sorted to
  // the bottom as if it scored zero — that would turn a gap into a low score.
  // THE TWO-ROUNDS RULE. A funded category searched across two rounds without
  // producing a listable second voice leaves the budget — appetite orders
  // value, not availability, and holding a slot open for a category the search
  // has already failed twice just stops the next one being funded. They are
  // reported separately rather than deleted, because the reason is written and
  // the page shows it.
  // A category with a full documented gap has also left the budget — it was
  // searched, written up, and its page carries the reason. Holding a funded
  // slot for it would be the same mistake as holding one for a twice-failed
  // search, and `body-language` and `hiring-and-recruiting` were still showing
  // as funded a batch after their gaps were written.
  const retired = new Set([
    ...Object.keys(gaps?.searchedNotFound ?? {}),
    ...Object.keys(gaps?.gaps ?? {}),
  ]);
  const searchedOut = below.filter((r) => retired.has(r.id));
  const live = below.filter((r) => !retired.has(r.id));

  const ranked = live.filter((r) => typeof r.views === 'number').sort((a, b) => b.views - a.views);
  const unranked = live.filter((r) => typeof r.views !== 'number');

  const funded = [];
  let spent = 0;
  for (const r of ranked) {
    if (spent + r.need > budget) continue;
    funded.push(r);
    spent += r.need;
  }
  const fundedIds = new Set(funded.map((r) => r.id));
  const deferred = ranked.filter((r) => !fundedIds.has(r.id));

  return { funded, deferred, unranked, searchedOut, spent, budget, belowTarget: below.length };
}
