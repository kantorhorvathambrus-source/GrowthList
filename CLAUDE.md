# CLAUDE.md — GrowthList

Canonical reference for this project. Read this before touching data or
code in a fresh session. `PLAN.md` has the phase breakdown and reasoning;
this file has the rules, schema, and current state.

## Project rules (non-negotiable)

1. **No framework, no build step, no bundler, no backend, no API keys.**
   Plain HTML + CSS + vanilla JS ES modules. `scripts/*.mjs` run on plain
   `node`, zero npm dependencies.
2. **All content lives in `/data` JSON.** No runtime calls to YouTube or
   any other API. If data is missing, the UI shows an honest empty state —
   never a fabricated fallback.
3. **Never invent data.** No constructed channel URLs, no invented video
   IDs/titles, no invented subscriber counts. Every creator and every
   `entryVideo` must be verified via WebSearch/WebFetch before it's
   written to a batch file. Uncertain → `"verified": false` + `note` +
   entry in `UNVERIFIED.md`, never silently dropped from that file.
4. **No halo effect.** A creator is mapped only to categories their actual
   body of work supports, each with a real `evidence` string. Default 2–4
   categories per creator, hard max 6. Max 4 categories where
   `strength: "primary"`. Spanning >2 top-level domains requires
   `scopeNote`.
5. **English-language only**, everywhere: creators, UI copy, data.
   `language` is always `"en"`. Country/accent do not matter and must not
   be used as an exclusion signal — only primary upload language does.
6. **Video embeds**: click-to-load only, `youtube-nocookie.com/embed/`
   only, never on page load, never proxied/downloaded/re-hosted.
7. **Tone**: factual, neutral, descriptive, no superlative marketing
   language, no copied text from YouTube/Wikipedia/articles — own words.
8. **Commit after every batch and every phase.** Clear messages. Stop and
   show the result at defined checkpoints (see `PLAN.md`).
9. **If context is running low: update this file's "State of the
   project" section first**, then say so, so a fresh session can resume
   without re-deriving anything.

## Naming conventions

- **Category id**: kebab-case of the English name (`public-speaking`,
  `cold-email-outreach`). Stable once assigned — creators reference it by
  string, so it is never renamed after creators start pointing at it.
- **Creator id**: kebab-case of the handle, `@` stripped
  (`@aliabdaal` → `ali-abdaal`). Must be unique; on a real collision
  append a short disambiguator, never silently overwrite.
- **Files**: `data/creators/batch-01.json` … `batch-28.json`, always
  2-digit zero-padded, always exactly 25 creators (last batch may be
  smaller only if 700 is reached early — it shouldn't be, 28×25=700
  exactly).
- **JS files**: one default export per view/component module, lowercase
  kebab-case filenames, `.js` (ES modules, `type="module"`).
- **CSS**: one stylesheet (`css/style.css`), custom properties for theme
  tokens (`--color-*`, `--space-*`), BEM-ish class names
  (`.creator-card`, `.creator-card__title`) — no CSS framework, no
  preprocessor.

## Data schema

### Category (`data/categories.json`, array, exactly 200)

```json
{
  "id": "public-speaking",
  "name": "Public speaking",
  "domain": "communication",
  "blurb": "One sentence on what improving here actually means.",
  "aliases": ["presenting", "speech", "stage fright"],
  "relatedCategories": ["storytelling", "vocal-delivery"],
  "levels": {
    "beginner": "What a total beginner should focus on first.",
    "intermediate": "The next plateau and how to get past it.",
    "advanced": "What separates good from genuinely excellent."
  },
  "plan": {
    "week1": { "watch": ["creator-id"], "do": "One concrete exercise, doable in under 30 min." },
    "week2": { "watch": ["creator-id"], "do": "..." },
    "week3": { "watch": ["creator-id"], "do": "..." },
    "week4": { "watch": ["creator-id"], "do": "..." }
  }
}
```

`plan` values are empty (`{"week1": {"watch": [], "do": ""}, ...}`) until
Phase 3, once creators are mapped. `domain` is one of the 12–16 top-level
domain slugs defined in `data/categories.json`'s own domain list (see
Phase 1 output) — kept in this file's state section once finalized.

### Creator (`data/creators/batch-*.json`, arrays, 25 per file, 700 total)

```json
{
  "id": "channel-handle-slug",
  "name": "Display name",
  "handle": "@handle",
  "channelUrl": "https://www.youtube.com/@handle",
  "country": "US",
  "language": "en",
  "sizeBucket": "1M-5M",
  "status": "active",
  "verified": true,
  "dataAsOf": "2026-08",

  "shortDescription": "1–2 sentences: who they are and what the channel is.",
  "longDescription": "3–5 sentences (200+ chars): background/credentials, what the content covers, production style, who it fits.",
  "notFor": "One sentence: what this channel is NOT good for, or who will be disappointed.",

  "formatTags": ["long-form", "interview", "tutorial", "video-essay", "shorts"],
  "level": ["beginner", "intermediate"],

  "profile": {
    "evidenceBased": 3,
    "practical": 4,
    "energy": 2,
    "selfPromotion": 1,
    "depth": 4
  },

  "signals": ["credentialed", "cites-research"],

  "categories": [
    {
      "id": "public-speaking",
      "strength": "primary",
      "why": "One sentence specific to THIS category (20+ chars, unique per category on this creator).",
      "evidence": "What actually qualifies them here.",
      "entryVideo": {
        "title": "Verified video title",
        "videoId": "VERIFIED_ID",
        "whyThisOne": "What you'll know after watching."
      }
    }
  ],

  "role": "specialist",
  "caveats": "Optional, neutral, factual. Omit entirely if nothing to say.",
  "scopeNote": "Only present if spanning more than two top-level domains."
}
```

**Field notes**

- `sizeBucket` ∈ `<100k | 100k-500k | 500k-1M | 1M-5M | 5M-20M | >20M`.
  Never an exact subscriber count.
- `status` ∈ `active | archive` (archive = no uploads ~2yrs, back
  catalogue still valuable).
- `profile.*` — integers 0–4 inclusive: `evidenceBased`, `practical`,
  `energy`, `selfPromotion`, `depth`. Powers client-side similarity
  (weighted Euclidean distance).
- `signals` — fixed vocabulary only (validator rejects anything else):
  `credentialed`, `cites-research`, `practitioner`, `sells-course`,
  `sponsor-heavy`, `contested-claims`, `strong-ideological-frame`. Neutral
  labels, not verdicts.
- `categories[].strength` ∈ `primary | secondary`.
- `role` ∈ `specialist | generalist | critic`. Every category needs ≥1
  `critic`.
- `entryVideo.videoId` must be a real, verified YouTube video id (11
  chars, from the actual channel). Embeds always use
  `https://www.youtube-nocookie.com/embed/{videoId}`.

## Validator rules (`scripts/validate.mjs`)

**Fails the build on:**
duplicate category/creator ids or handles; a creator referencing a
nonexistent category id; a category with <5 creators; a category missing
a `role:"critic"`; a category missing any of beginner/intermediate/advanced
representation; missing required fields (`notFor` included); malformed
`channelUrl`; missing/unverified `entryVideo` on a `verified:true` creator;
a `why` under 20 characters; duplicate `why` strings within one creator;
`longDescription` under 200 characters; a `profile` axis outside 0–4;
a `signals` entry outside the fixed vocabulary; any `language` ≠ `"en"`;
placeholder text (`TBD`, `lorem`, `example`, case-insensitive).

**Warns on:** a creator spanning >2 top-level domains without
`scopeNote`; a creator `primary` in >4 categories.

**Reports:** creators per domain/category, thinnest 20 categories, role
distribution, size-bucket distribution.

`scripts/build-data.mjs` merges `data/creators/batch-*.json` →
`data/creators.json` (full), `data/index.json` (id, name, sizeBucket,
role, categories, shortDescription), `data/search-index.json`
(searchable fields for categories + creators). Also stamps each category
in `categories.json`-derived output with a computed creator `count`.

## Working style reminders

- Batches of 25 creators at a time in Phase 2. After each: write file →
  run `node scripts/validate.mjs` (once it exists) → commit → print a
  progress summary (running total, thin categories, domain balance).
- Track an explicit coverage tally while researching so thin categories
  get deliberately filled in later batches rather than discovered only at
  the end.
- Never fabricate to hit a quota. An honest gap goes in `UNVERIFIED.md`
  or is simply left short with a note in the state section below — not
  papered over with an invented creator.

---

## State of the project

*(Updated at the end of every phase/batch. A fresh session should read
this section first to know exactly where to resume.)*

- **Current phase**: Phase 1 complete. **Phase 2 is BLOCKED — see
  "Phase 2 blocker" below.** Phase 3 tooling (both scripts) is done
  ahead of schedule because it did not depend on the blocked work.

### Phase 2 blocker (read this first)

`youtube.com` is **blocked by this environment's network egress
policy**, along with `en.wikipedia.org`, `socialblade.com`,
`noembed.com`, and Invidious mirrors. The allowlist is tight enough
that `WebFetch` is unusable for creator research. The `WebSearch` tool
still works, because it runs server-side rather than through the
session's egress proxy.

Consequence: a creator's *existence and handle* can be corroborated
from search results, but an `entryVideo.videoId` **cannot be verified
as belonging to a given channel**. Search result titles do not name the
uploader, and searching a raw video id returns nothing. Verified
example of the trap: a search for Veritasium's Collatz video returned
`XcQat_ADbb0` ("The Hidden Logic of the 3x+1 Problem From Veritasium")
and `Lr6qc_9M0Ks` ("How accurate is Veritasium about…") — both *other
channels'* videos about it.

Writing entry videos on that basis would violate project rule 3 (the
brief's most important rule). Do **not** proceed with Phase 2 until one
of these is true:

1. `youtube.com` is added to the environment's egress allowlist
   (network policy is chosen at environment creation —
   https://code.claude.com/docs/en/claude-code-on-the-web); or
2. an oEmbed/API host is allowed (`noembed.com`, or `googleapis.com`
   plus a YouTube Data API key used **at research time only** — the
   "no API keys" rule governs the shipped site, which still ships as
   static JSON); or
3. the project owner explicitly relaxes the verification bar and
   accepts a documented change to the definition of done.

Awaiting the owner's decision as of this update.
- **Repo**: `kantorhorvathambrus-source/GrowthList` (new, dedicated repo;
  not to be confused with `kantorhorvathambrus-source/mancsterapia`, an
  unrelated existing project). Working directly on `main`.
- **Done**: `PLAN.md`, this `CLAUDE.md`, repo scaffold, and
  `data/categories.json` — exactly 200 categories across 16 domains,
  every `plan` present but empty (filled in Phase 3).
- **Also done (Phase 3, tooling half)**: `scripts/validate.mjs` and
  `scripts/build-data.mjs`. Both run on plain `node`, zero deps, and
  both are tested — every FAIL rule was exercised against deliberately
  broken fixtures and fires correctly. `node scripts/validate.mjs`
  currently exits 0 (200 categories, no creators yet, empty plans warn
  rather than fail so the validator is usable during Phase 2).
  Scripts accept an optional root dir argument, which is how the
  fixtures were tested: `node scripts/validate.mjs /path/to/fixture`.
- **Also done (Phase 4, structure)**: the complete front end — app
  shell, router, home, category, creator, and stack views,
  click-to-load embeds, theme toggle, search. Built and browser-tested
  against both the real (empty) dataset and a throwaway synthetic one.
  See "Phase 4 notes" below.

### VISUAL LAYER IS ON HOLD — do not write CSS

The project owner is designing the look separately and will supply a
design spec. Until that spec arrives:

- `css/style.css` is a **structural baseline only**. It contains no
  colour, background, `font-family`, shadow, gradient, or decorative
  declaration. Verified by:
  `grep -nE '(^|[^-])color\s*:|background|font-family|box-shadow|#[0-9a-fA-F]{3,6}|rgba?\(|accent-color|linear-gradient' css/style.css`
  which must match only the file's own header comment.
- **Do not add styling of any kind**, including "just a small fix to
  make it readable". Layout, spacing, overflow control, and the
  accessibility affordances (skip link, `visually-hidden`,
  `:focus-visible` via `currentColor`, reduced motion) are in scope;
  anything visual is not.
- `MARKUP.md` is the contract handed to the designer: every component's
  DOM, its class hooks, which elements repeat per item, which states
  need styling, and where content length varies. **Keep it in sync** —
  if a view's markup changes, update `MARKUP.md` in the same commit.
- The full pre-hold stylesheet is recoverable at commit `b2caba9`
  (`css/style.css`) if any of it proves worth keeping.
- Structural CSS may still gain rules that fix genuine layout bugs —
  e.g. `.cat-head__related a { margin-right: .5rem }` was restored
  because without it the related-skill links render as one run-on word.
  Spacing that carries meaning is structure, not decoration.
- **Not started**: Phase 2 (creators, 0/700, 0/28 batches — BLOCKED),
  Phase 3 remainder (filling the 200 four-week plans, which needs
  creators), Phase 5 (form), Phase 6 (polish).
- **Next action**: unblock Phase 2 (see above), or build Phase 5 (the
  Netlify form), which does not depend on creator data.

### Phase 4 notes

**Testing without committing fake data.** The UI was verified in
headless Chromium by copying the site to `/tmp/gl-test`, generating a
synthetic creator set there, and driving it with Playwright. The
synthetic data never enters this repo — `data/creators.json` is `[]`
and `grep -rl "test-creator" data/` must stay empty. Re-create the
fixture the same way rather than committing one.

Chromium lives at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(pass it as `executablePath`; the unversioned path in the environment
docs does not exist).

**Verified behaviour** (all passing, zero console errors):

- No third-party request of any kind before a click. After clicking
  play, the only external host contacted is `www.youtube-nocookie.com`,
  and the iframe src is
  `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0`.
- Search matches aliases: typing "stage fright" returns Public
  speaking. Arrow keys move the active option, Enter navigates, Escape
  clears.
- Level tabs and all four filters write to the query string via
  `replaceQuery`, so the back button steps between *views*, not between
  every filter change.
- Stack round-trips: three picks encode to
  `#/stack?ids=cHVibGljLXNwZWFraW5nLHNlbyxzdG9yeXRlbGxpbmc`, and
  reloading that URL restores the three chips.
- Empty states are honest everywhere — home, category, plan, and stack
  each say the data is not published yet rather than showing filler.
- No horizontal overflow at 390px. Dark theme verified by screenshot.

**Deliberate design decisions:**

1. **Thumbnails are never fetched.** YouTube serves thumbnails from
   `i.ytimg.com`, not from the nocookie domain, so loading one before
   the click would leak the visit exactly as an autoloaded iframe
   would. The placeholder is local CSS, and the real network request
   happens only on click. This is why `assets/placeholder-thumb.svg`
   from `PLAN.md` was never needed.
2. **Level tab counts exclude critics**, because critics render in the
   separate "other side" block. Counting them made the tab promise more
   creators than the list showed.
3. **`statePage()` vs `stateBlock()`** — a page that is nothing but an
   error uses `statePage`, which carries an `<h1>`, so every route has
   exactly one top-level heading.
4. **`js/components/theme-toggle.js` does not exist**; theme lives in
   `js/theme.js` (it is global chrome, not a view component). `PLAN.md`
   listed it under components.

### Build outputs and the first-load budget

`node scripts/build-data.mjs` writes four files. Measured with 200
categories and 0 creators:

| file | purpose | size |
|---|---|---|
| `categories-index.json` | home page: id, name, domain, blurb, aliases, count | 54 KB |
| `search-index.json` | search: categories + creators | 31 KB |
| `creators.json` | full records, lazy-loaded | grows with Phase 2 |
| `index.json` | light creator cards, lazy-loaded | grows with Phase 2 |

First load is **85 KB** against the ~500 KB budget, because the home
page never fetches the 240 KB `categories.json` (levels and plans are
read only in the category view). The build script prints this budget
and warns above 400 KB.

### Domain list (final — 16 domains, 200 categories)

Slug → count. These slugs are the only legal values of a category's
`domain` field, and the domain boundary is what the scope rule's
"more than two top-level domains" test is measured against.

`mindset` 13 · `fitness` 14 · `health` 14 · `communication` 13 ·
`career` 13 · `money` 13 · `business` 13 · `marketing` 13 · `tech` 11 ·
`programming` 14 · `creativity` 14 · `learning` 12 · `productivity` 12 ·
`relationships` 12 · `practical` 12 · `philosophy` 7

### Phase 1 notes / decisions

- Some aliases deliberately collide across categories (`saying no` →
  both `prioritization` and `setting-boundaries`; `logic` → both
  `critical-thinking` and `debate-and-argumentation`). Search is expected
  to return several matches for a genuinely ambiguous word — this is not
  a bug, and the validator must not treat cross-category alias overlap
  as an error.
- Deliberately kept as separate, non-duplicate pairs, each with distinct
  blurbs and level text: `note-taking` (capture from a live source) vs
  `personal-knowledge-management` (linking/synthesis system);
  `negotiation` (general) vs `salary-negotiation` (a specific,
  high-search career case); `difficult-conversations` (general/work) vs
  `couples-communication` (partner-specific repair);
  `strength-training` (getting strong) vs `hypertrophy-training`
  (training for size); `deep-work-and-focus` (attention capacity) vs
  `digital-minimalism` (relationship with technology).
- `data/categories.json` is ~240 KB. That fits the <500 KB first-load
  budget on its own but leaves little room, so Phase 3's build step must
  emit a slimmer home-page index (id, name, domain, blurb, aliases,
  creator count) and the full record — `levels` and `plan` — should be
  read only in the category view. Recorded here because it changes
  `build-data.mjs`'s outputs from what `PLAN.md` originally listed.

### Definition-of-done tracker

- [~] 200 categories, no near-duplicates, each with 5+ creators, three
      levels, a critic, and a four-week plan — *taxonomy + levels done
      (Phase 1); creator coverage and plans pending Phases 2–3*
- [ ] 700 verified unique creators with `notFor`, taste profile, signals,
      verified entry video per category mapping
- [ ] Expertise scope rule respected
- [ ] Every creator English-language, verified
- [ ] Click-to-load nocookie embeds, no third-party requests before user
      action
- [ ] Stack builder producing per-category specialists, shareable via URL
- [ ] "How did you hear about us" via Netlify Forms, no other data
      collected
- [ ] `node scripts/validate.mjs` exits clean
- [ ] Lighthouse 90+ across the board
- [ ] README, CLAUDE.md, UNVERIFIED.md written
