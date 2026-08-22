# GrowthList — Plan

Static site. A visitor picks a skill (of ~200), gets a curated, honest set of
YouTube creators for that skill: an entry-point video each, and a four-week
plan that turns watching into practice.

No framework, no build step, no bundler, no backend, no API keys. Plain
HTML/CSS/vanilla JS (ES modules), JSON data files, deploys as static files
to Netlify.

## Phases

- **Phase 0 — Plan & scaffold.** This file, `CLAUDE.md`, repo scaffold. ✅ stop for review.
- **Phase 1 — Taxonomy.** `data/categories.json`, exactly 200 categories, 12–16 domains. `plan` left empty (filled Phase 3). ✅ stop for review.
- **Phase 2 — Creator research.** 700 verified creators, 28 batches of 25 in `data/creators/batch-NN.json`. Validate + commit + progress summary after every batch. This is the largest phase by far and spans many sessions/turns — see "State of the project" in `CLAUDE.md` for exactly where to resume.
- **Phase 3 — Build, validate, plans.** `scripts/build-data.mjs`, `scripts/validate.mjs`, fill every category's four-week `plan`.
- **Phase 4 — Interface.** Home, category view, creator view, stack builder, click-to-load nocookie embeds.
- **Phase 5 — "How did you hear about us."** Netlify Forms, session-gated prompt, no other data collection.
- **Phase 6 — Polish & handoff.** README, Netlify notes, Lighthouse pass, final CLAUDE.md + UNVERIFIED.md.

Commit after every batch and every phase. Stop and show the result at the
end of each phase before continuing (per the brief) — Phase 2's 28 batches
are the exception to "stop every phase": progress is shown every batch, but
the phase as a whole is one long push, checked in on periodically rather
than gated turn-by-turn, since gating 28 times would be impractical. I will
still pause and surface a summary at natural checkpoints (e.g. every 5–6
batches, or a full domain's worth of coverage) and always at the end.

## File structure

```
/                          — repo root (no separate app subfolder; this repo is GrowthList only)
  index.html                — single app shell: header, main, footer. All views render into #app.
  css/
    style.css               — one stylesheet, mobile-first, light+dark via prefers-color-scheme + manual override
  js/
    main.js                 — entry point, router wiring, boot
    router.js                — hash-based router: #/  #/category/:id  #/creator/:id  #/stack
    data.js                  — fetch + in-memory cache for categories.json / creators.json / index.json
    search.js                — debounced search over categories (name+aliases), keyboard nav
    views/
      home.js
      category.js
      creator.js
      stack.js
    components/
      creator-card.js
      video-embed.js         — click-to-load youtube-nocookie embed
      theme-toggle.js
      how-did-you-hear.js
    stack-encode.js           — base64 url encode/decode for Build Your Stack
    similarity.js             — client-side profile-distance nearest neighbours
    theme.js                  — light/dark persistence
    utils.js
  data/
    categories.json           — 200 categories (Phase 1)
    creators/
      batch-01.json … batch-28.json   — 25 creators each, raw research output (Phase 2)
    creators.json              — built: full merged creator dataset (Phase 3 output, lazy-loaded)
    index.json                  — built: lightweight creator index (id, name, sizeBucket, role, categories, shortDescription)
    search-index.json            — built: searchable fields for categories + creators
  scripts/
    build-data.mjs             — merges data/creators/batch-*.json -> creators.json, index.json, search-index.json
    validate.mjs                — schema + coverage + anti-hallucination-shape checks, zero deps, plain node
  assets/
    placeholder-thumb.svg       — local fallback thumbnail if nocookie thumbnail fetch fails
  netlify.toml                  — build/publish config (publish = ".", no build command) + form notes
  PLAN.md
  CLAUDE.md
  README.md
  UNVERIFIED.md                  — every creator/mapping flagged verified:false, for manual check
  .gitignore
```

No `/public` or `/dist` — the repo root is the publish directory (`netlify.toml` sets `publish = "."`), since there's no build step to output into a separate folder.

## Data model

Two record types, both plain JSON, both defined in full in `CLAUDE.md`
(the canonical schema reference so a fresh session can validate against it
without re-reading this file):

- **Category** (`data/categories.json`, array of 200) — id, name, domain,
  blurb, aliases, relatedCategories, levels (beginner/intermediate/advanced
  guidance text), plan (4-week, filled in Phase 3).
- **Creator** (`data/creators/batch-*.json` → merged `data/creators.json`,
  700 total) — identity/verification fields, descriptions incl. required
  `notFor`, formatTags, level, profile (5 integer axes 0–4), signals (fixed
  vocabulary), categories[] (each with strength/why/evidence/entryVideo),
  role, optional caveats/scopeNote.

## Key decisions not fully specified in the brief

1. **Single app shell, hash routing.** One `index.html` with a router
   swapping content into `<main id="app">`, using `#/category/x` style
   hashes rather than multiple physical HTML files or History-API routing.
   Reason: Netlify serves static files with no server-side rewrite needed
   for hash routes (unlike `pushState` routing, which needs a catch-all
   redirect rule), keeping the "runs from `python3 -m http.server`" and
   "deploys to Netlify as-is" constraints trivially true, while still
   giving every view a deep-linkable, back-button-safe URL. Also keeps one
   shared header/theme-toggle/footer instead of duplicating markup across
   pages.
2. **Lazy loading strategy.** Home loads only `categories.json` (small) —
   creator counts per category come from a precomputed `count` added to
   each category by the build script, not from loading creator data. The
   full `creators.json` (and `index.json` for lighter list views) are
   fetched on first navigation into a category, creator, or stack view.
   This keeps first load well under 500 KB.
3. **`data/creators/batch-*.json` is the source of truth for research**;
   `data/creators.json` / `index.json` / `search-index.json` are build
   artifacts regenerated by `scripts/build-data.mjs` and committed (since
   there's no build step at deploy time — Netlify just serves files as-is,
   so the "compiled" JSON must already be in the repo).
4. **IDs.** Category id = kebab-case of the English name, stable once
   assigned. Creator id = kebab-case of the handle without `@` (e.g.
   `@aliabdaal` → `ali-abdaal`); on collision, append the domain's
   two-letter suffix.
5. **Similarity / "Build your stack" math** run entirely client-side in
   `js/similarity.js` (simple weighted Euclidean distance over `profile`
   axes), no server, no precomputed matrix — 700 records is small enough to
   diff in-browser on demand.
6. **Stack URL encoding**: `#/stack?ids=<base64url(categoryId list joined by ",")>`.
7. **Netlify Forms detection**: the "how did you hear about us" form is
   hidden via JS unless a same-origin `POST /` to Netlify's form endpoint
   is plausible — concretely, feature-detect by checking
   `document.querySelector('html').dataset.netlify` style marker isn't
   reliable, so instead: render the form as a normal progressively-enhanced
   `<form>` (works without JS / on non-Netlify hosts as a plain POST that
   just won't be collected), and only wire the JS thank-you/localStorage
   behaviour if `location.hostname` isn't `localhost`/`127.0.0.1` and a
   lightweight runtime check succeeds. Documented in full in `CLAUDE.md`
   once implemented in Phase 5.
8. **No inline `<script>`/build tooling for JSON→JS** — views `fetch()`
   JSON at runtime; every JS file is a native ES module loaded via
   `<script type="module">`.
9. **Testing without a headless browser tool**: verified manually via
   `python3 -m http.server` + description of interactions per phase, since
   no browser automation is set up in this environment by default. If a
   browser tool becomes available it'll be used for Phase 4 polish.

## Definition of done

See the brief's own checklist — reproduced and tracked in `CLAUDE.md`'s
state section so progress against it is visible at a glance.
