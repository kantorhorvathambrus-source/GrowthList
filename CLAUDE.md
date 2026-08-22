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

- **Current phase**: Phase 1 complete. Phase 2 (creator research) not
  started.
- **Repo**: `kantorhorvathambrus-source/GrowthList` (new, dedicated repo;
  not to be confused with `kantorhorvathambrus-source/mancsterapia`, an
  unrelated existing project). Working directly on `main`.
- **Done**: `PLAN.md`, this `CLAUDE.md`, repo scaffold, and
  `data/categories.json` — exactly 200 categories across 16 domains,
  every `plan` present but empty (filled in Phase 3).
- **Not started**: Phase 2 (creators, 0/700, 0/28 batches),
  Phase 3 (build/validate/plans), Phase 4 (interface), Phase 5 (form),
  Phase 6 (polish).
- **Next action**: Phase 2, batch 01 — research and verify 25 creators,
  write `data/creators/batch-01.json`, update this section, commit.

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
