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
10. **A test must never touch a real config filename.** Anything that
    creates, writes, or deletes a config or secret file during a test
    uses a temp directory or a distinct name (`.env.leak-test`,
    `/tmp/gl-fixture/.env`) — never `.env`, never `netlify.toml`, never
    a real data file. Cleanup then deletes only the throwaway path.
    This rule exists because a leak test in this project created a fake
    `.env` and removed it with `rm -f .env`, which would have destroyed
    a real key file had one been present. It didn't, but only by luck.
    The same applies to `data/` — synthetic fixtures live in `/tmp`.

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
- **CSS**: two stylesheets — `css/tokens.css` (the design handoff: palette,
  type scale, spacing, edges, focus, dark-theme extension) and
  `css/style.css` (the component layer). Class names follow the design
  handoff's own naming (`.cc`, `.claim`, `.band`, `.rail`, `.tags`,
  `.badge`) rather than a BEM scheme invented here. No framework, no
  preprocessor. See `MARKUP.md` for the full DOM contract.

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
        "whyThisOne": "What you'll know after watching.",
        "durationMin": 18
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
- `entryVideo.durationMin` — **optional** integer, whole minutes. The design
  calls for a "START HERE · 18 MIN" eyebrow; with the field absent the
  eyebrow degrades to "START HERE" rather than inventing a runtime. Only
  populate it from a verified source.

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

- **Current phase**: Phase 2 (creator research) — **about to start**.
  Phases 0, 1, 3-tooling, 4 and 5 are done. Phase 6 is deliberately not
  started: the owner's call is that Phase 2 is the product and
  everything else is packaging, so no README and no Lighthouse run
  until real data exists.
- **Repo**: `kantorhorvathambrus-source/GrowthList`, working on `main`.
  Not to be confused with `kantorhorvathambrus-source/mancsterapia`, an
  unrelated project.
- **Creator count: 0 of 700.** `data/creators.json` is `[]`. Nothing has
  ever been written from memory and nothing ever should be.

### Immediate next actions

1. Confirm `process.env.YOUTUBE_API_KEY` is readable (see below).
2. **Single-channel smoke test** — build one full record end to end and
   show the owner every field including nulls, so an honest gap is
   visible before scale.
3. **Batch 01 only (25 creators), then STOP** and show all 25 records
   for the owner's quality review. Do not start batches 02–28 until
   they have looked at batch 01 by eye.
4. After each batch: write the file, run `node scripts/validate.mjs`,
   commit, print a progress summary, and update this section.

### The YouTube API key — read from the ENVIRONMENT, not a file

**There is no `.env` file in this container and there never will be.**
`YOUTUBE_API_KEY` is set as a configured environment variable on the
Claude Code environment itself, so it arrives in `process.env`. Do not
go looking for `.env`, do not create one, and do not ask for the key to
be pasted into chat — a key in a transcript is a key that must be
rotated.

- `scripts/lib/youtube.mjs` → `loadKey()` reads
  `process.env.YOUTUBE_API_KEY` first and only falls back to a `.env`
  file if one happens to exist. That fallback is for use outside this
  container; here the environment variable is the whole story.
- If the key is missing, **stop and say so.** Do not proceed with
  unverified research and do not substitute web search — search cannot
  verify video attribution (see "How Phase 2 verification works").
- Environment-variable changes need a fresh session or container
  restart. A key set mid-session will not appear in a running process.
- The key is never printed. Every error in the client routes through
  `redact()` first, because API keys travel in the query string and an
  unredacted URL in a stack trace is a leaked credential.
- `scripts/check-secrets.mjs` plus `.githooks/pre-commit` block a commit
  containing a key-shaped string. In a fresh clone, enable the hook with
  `git config core.hooksPath .githooks`.

### How Phase 2 verification works

**The network position.** `youtube.com` and every related host
(`m.youtube.com`, `youtu.be`, `i.ytimg.com`, `yt3.ggpht.com`) are
blocked by the environment's egress policy — `curl` reports
`CONNECT tunnel failed, response 403`, and WebFetch reports
`EGRESS_BLOCKED`. So are `en.wikipedia.org`, `socialblade.com` and
`noembed.com`. **`www.googleapis.com` is allowed**, which is why the
Data API is the route. Do not request a `youtube.com` unblock without
being asked; the owner's decision is API-only first.

**Why search alone is not enough.** WebSearch can corroborate that a
channel exists and roughly how big it is, but it cannot attribute a
video to a channel. Result titles do not name the uploader and
searching a raw video id returns nothing. Verified example: a search
for Veritasium's Collatz video returned `XcQat_ADbb0` and `Lr6qc_9M0Ks`,
both *other channels'* videos about it. Writing entry videos on that
basis is exactly the fabrication rule 3 forbids.

**The gate (`attributeVideo` in `scripts/lib/youtube.mjs`).** A video
may be used as an `entryVideo` only if `snippet.channelId` equals the
creator's channel id. A matching channel *title* is explicitly not
sufficient — titles are neither unique nor stable. Also rejected:
videos the API does not return (deleted or private), non-public videos,
and **videos with embedding disabled** — the owner's call, on the
grounds that a play button that does nothing is worse than a creator
with no entry video. `pickEntryVideo()` draws only from the channel's
own uploads playlist and returns `null` when nothing qualifies. A
creator with no attributable video keeps the mapping and omits the
video rather than inventing one.

**What the API can and cannot establish.** It gives identity
(`channelId`, handle, title), `sizeBucket` (from `subscriberCount`, or
`null` when `hiddenSubscriberCount` is set — never guess), `country`,
`status` via latest upload date, real video ids, titles and
`durationMin`. It does **not** give `shortDescription`,
`longDescription`, `notFor`, `why`, `evidence`, `profile`, `signals`,
`level` or `role` — those are editorial judgement, written in our own
words, and are where the scope rule (no halo effect) is enforced.

**Quota.** ~3 units per creator (`channels.list` 1, `playlistItems.list`
1, `videos.list` 1) against 10,000/day. `search.list` costs 100 and is
avoided. All 700 creators ≈ 2,100 units. On `QUOTA EXCEEDED` the client
throws and the correct response is to stop and resume the next day, not
to retry.

### Avatars — deliberately skipped

The design assumes 96px local avatars with a ~5% monogram fallback.
`yt3.ggpht.com` is blocked and the owner chose not to unblock it, so
**every card renders a monogram** and the design works that way.
`creator.avatar` is already supported the moment images exist.
Re-hosting creators' profile images is a separate decision, not a
default.

### Design system (landed)

The visual layer is implemented from the owner's handoff.

- `css/tokens.css` — the handoff verbatim, with two marked changes: the
  two `@font-face` rules are commented out (the woff2 subsets do not
  exist yet and would 404 twice per load), and a **dark-theme
  extension** is appended. DESIGN.md specifies a light base only; the
  brief requires both. **The dark theme still needs design sign-off.**
- `css/style.css` — the component layer. Two hard rules:
  1. **No literal colour, font stack, or type size.** Verify:
     `grep -nE '#[0-9a-fA-F]{3,6}|rgba?\(' css/style.css` → no matches.
  2. **Never reference a raw scale step for text** (`--warm-700`,
     `--wine-600`). Use the semantic aliases: `--text-body`,
     `--text-muted`, `--accent-ink`, `--chip-ink`, `--chip-border`,
     `--badge-ink`, `--marker-fit`, `--marker-caveat`, `--band-ink-bg`,
     `--rule`. Raw steps silently break dark mode — this happened once
     and every card dropped to ~1.5:1.
- `js/components/ornament.js` — the geometric set as inline SVG using
  `stroke: currentColor`. Never inside a repeating card.
- `MARKUP.md` is the DOM contract and is current. **Keep it in sync** —
  markup change and `MARKUP.md` change go in the same commit.

Contrast is verified by script, not by eye: 22 text/background pairings
across both themes, all passing WCAG AA. Re-run after any palette change.

### Phase 5 notes (the Netlify form)

- **The footer form must stay static HTML in `index.html`.** Netlify's
  build bot scans deployed HTML to register forms; a JS-injected form is
  never detected and its submissions vanish silently. That copy is also
  the one that works with JavaScript disabled.
- The prompt copy is generated by `formMarkup(prefix)`. **Keep the name
  attributes in sync with `index.html`**: `form-name`, `bot-field`,
  `source`, `note`.
- **Netlify detection is a same-origin `HEAD` probe for the
  `x-nf-request-id` header**, cached per session — deliberately *not* a
  hostname check, since Netlify Dev serves from localhost. Off Netlify
  both placements are removed rather than left to POST into a 404.
- Only `source` and `note` are ever sent. Verified end-to-end against a
  mock Netlify server.
- Testing needs a server that stamps `x-nf-request-id` and accepts POST;
  a plain `python3 -m http.server` correctly hides the form, which looks
  like a bug but is not.

### Phase 4 notes (the interface)

**Testing without committing fake data.** The UI is verified in headless
Chromium by copying the site to `/tmp/gl-test`, generating a synthetic
creator set *there*, and driving it with Playwright. Synthetic data
never enters this repo — `data/creators.json` must stay `[]` until real
records exist, and `grep -rl "test-creator" data/` must return nothing.

Chromium lives at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(pass as `executablePath`; the unversioned path in the environment docs
does not exist).

**Verified behaviour** (all passing, zero console errors):

- No third-party request before a click. After clicking play the only
  external host is `www.youtube-nocookie.com`.
- Search matches aliases ("stage fright" → Public speaking); arrow keys
  move the active option, Enter navigates, Escape clears.
- Level tabs and all four filters write to the query string via
  `replaceQuery`, so the back button steps between *views*.
- Stack round-trips: three picks encode to a shareable URL that restores
  three chips on reload.
- Empty states are honest everywhere.
- No horizontal overflow at 390/700/1100px.

**Deliberate decisions:**

1. **Thumbnails are never fetched.** YouTube serves them from
   `i.ytimg.com`, so loading one pre-click would leak the visit exactly
   as an autoloaded iframe would. The placeholder is the design's wine
   affordance, which is why no thumbnail asset is needed at all.
2. **Level tab counts exclude critics**, who render in their own band.
3. **`statePage()` vs `stateBlock()`** — a page that is nothing but an
   error uses `statePage`, which carries an `<h1>`.
4. Theme lives in `js/theme.js`, not a component file.

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
page never fetches the 240 KB `categories.json` — levels and plans are
read only in the category view. The build script prints the budget and
warns above 400 KB. **Re-check this once creators land**, since
`creators.json` grows to roughly 700 records.

### Domain list (final — 16 domains, 200 categories)

These slugs are the only legal values of a category's `domain` field,
and the domain boundary is what the scope rule's "more than two
top-level domains" test is measured against.

`mindset` 13 · `fitness` 14 · `health` 14 · `communication` 13 ·
`career` 13 · `money` 13 · `business` 13 · `marketing` 13 · `tech` 11 ·
`programming` 14 · `creativity` 14 · `learning` 12 · `productivity` 12 ·
`relationships` 12 · `practical` 12 · `philosophy` 7

### Phase 1 notes / decisions

- Some aliases deliberately collide across categories (`saying no` →
  both `prioritization` and `setting-boundaries`). Search returning
  several matches for an ambiguous word is correct, and the validator
  must not treat cross-category alias overlap as an error.
- Deliberately separate, non-duplicate pairs: `note-taking` vs
  `personal-knowledge-management`; `negotiation` vs
  `salary-negotiation`; `difficult-conversations` vs
  `couples-communication`; `strength-training` vs
  `hypertrophy-training`; `deep-work-and-focus` vs
  `digital-minimalism`.
- `philosophy` has only 7 categories because actionable philosophy
  categories run out; padding it would have meant the vague entries the
  brief bans.

### Definition-of-done tracker

- [~] 200 categories, no near-duplicates, each with 5+ creators, three
      levels, a critic, and a four-week plan — *taxonomy and levels done;
      creator coverage and plans pending Phases 2–3*
- [ ] 700 verified unique creators with `notFor`, taste profile, signals,
      verified entry video per category mapping
- [ ] Expertise scope rule respected
- [ ] Every creator English-language, verified
- [x] Click-to-load nocookie embeds, no third-party requests before user
      action
- [x] Stack builder producing per-category specialists, shareable via URL
- [x] "How did you hear about us" via Netlify Forms, no other data
      collected
- [x] `node scripts/validate.mjs` exits clean *(passes on the current
      empty dataset; coverage rules only bite once creators exist)*
- [ ] Lighthouse 90+ across the board — *deliberately deferred to
      Phase 6; scoring an empty dataset would be meaningless*
- [~] README, CLAUDE.md, UNVERIFIED.md written — *CLAUDE.md and
      MARKUP.md current; README and UNVERIFIED.md are Phase 6*
