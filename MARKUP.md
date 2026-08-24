# MARKUP.md — the DOM contract

**Status: the design system has landed.** `css/tokens.css` is the handoff
(palette, type scale, spacing, edges, focus, plus a dark-theme extension) and
`css/style.css` is the component layer built on it.

Two rules keep it maintainable:

1. **No literal colour, font stack, or type size in `style.css`.** Everything
   references a custom property, so retuning the palette is a `tokens.css`
   change and nothing else. Verify:
   `grep -nE '#[0-9a-fA-F]{3,6}|rgba?\(' css/style.css` → no matches.
2. **Components reference semantic aliases, never raw scale steps.** Use
   `--text-body`, `--text-muted`, `--accent-ink`, `--chip-ink`,
   `--chip-border`, `--badge-ink`, `--marker-fit`, `--marker-caveat`,
   `--band-ink-bg`, `--rule`. Writing `--warm-700` for text silently breaks
   dark mode — that happened once already and every card became unreadable.

Everything below is what the JavaScript actually emits. For each component:
**DOM**, **repeats** (what must stay cheap), **states**, and **variable
content** (where text length swings).

---

## Global constraints

- **No external fonts, no CDN.** `tokens.css` declares two self-hosted
  subsetted woff2 families. **The font files do not exist yet** — DESIGN.md
  lists font selection as an open item — so both `@font-face` rules are
  commented out rather than firing two 404s on every page load. The fallback
  stacks (Iowan/Palatino/Georgia, Arial Narrow) are the intended near-matches,
  so the site renders as designed today. To enable: drop the woff2 files into
  `/fonts/` and uncomment. Nothing else changes.
- **The display serif is headings only, never below 20px, never inside a card
  that repeats.** Card copy is `--font-body` / `--font-cond` only.
- **Light and dark** are both handled by remapping semantic aliases in
  `tokens.css` (`@media (prefers-color-scheme: dark)` guarded as
  `:root:not([data-theme="light"])`, plus `:root[data-theme="dark"]`).
  Component CSS carries no theme-specific rules.
- **Mobile-first, no horizontal overflow at 390px.** Verified.
- **Focus is never removed.** `--focus-ring` (3px wine-600, 2px offset), or
  `--focus-ring-dark` (wine-200) on ink, wine, and header/footer surfaces.
- **No shadow on any repeating card.** `--shadow-overlay` is for the search
  dropdown only.
- **Selection is never colour alone** — tabs use fill + 2px ink underline +
  `aria-selected`.
- First load is ~85 KB of data against a ~500 KB budget.

---

## Layout primitives

Every view is composed of full-bleed **bands** with hard transitions.

```html
<section class="band band--ink|--paper|--alt|--accent">
  <div class="rail rail--ink"><span>Rotated label</span></div>
  <div class="band-body"> …content… </div>
</section>
```

- `.rail` is a fixed `--rail-w: 64px` solid bar with a `writing-mode:
  vertical-rl` label. **Below 720px the band switches to `flex-direction:
  column` and the rail becomes a 44px horizontal label row.**
- `.band--ink` uses `--band-ink-bg`: `--ink` in light, `--wine-900` in dark
  (an ink band on an ink page would have no visible edge).
- Numbered sequences (`.num`, `01`/`02`/`03`) are the recurring organising
  device: domain heads, section heads, plan weeks, profile mappings.
- Other primitives: `.eyebrow`, `.micro`, `.hair` (1px rule), `.dot`
  (3px separator), `.orn` (ornament wrapper).

**Ornament** lives in `js/components/ornament.js`: `rings`, `orbit`,
`starburst`, `crosshair`, `halfFill`, plus `play` and `badgeMark` for card
marks. All inline SVG, `stroke: currentColor`, 1px hairlines. `ornamentFor(key)`
picks deterministically from the id so a band always gets the same mark.
**Never used inside a repeating card** — only band ornament (`.hero__orn`) and
the small `badgeMark`/`play` glyphs.

---

## 1. Page shell (`index.html`)

```html
<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">          <!-- ink, 4px wine bottom border -->
  <div class="wrap site-header__inner">
    <a class="brand" href="#/">
      <span class="brand__mark" aria-hidden="true"><svg>…concentric rings…</svg></span>
      <span class="brand__name">GrowthList</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <a href="#/">Skills</a>
      <a href="#/stack">Build your stack</a>
      <button id="theme-toggle" class="theme-toggle">
        <span class="theme-toggle__icon" aria-hidden="true"><svg>…half-fill…</svg></span>
        <span class="theme-toggle__label">Theme</span>
      </button>
    </nav>
  </div>
</header>

<main id="main" tabindex="-1">
  <div id="app" aria-live="polite" aria-busy="true"> …bands render here… </div>
</main>

<footer class="site-footer">          <!-- wine-900 -->
  <div class="wrap"> <p class="eyebrow">…</p> …4 <p>… </div>
</footer>
```

- **Repeats:** none.
- **States:** `.skip-link` hidden until `:focus`; `.theme-toggle` hover/focus,
  its `aria-label` and `title` swap between "Switch to dark/light theme";
  `#app[aria-busy="true"]` during every view load.
- **Note:** `<main>` is **not** `.wrap` — bands are full-bleed and each
  `.band-body` handles its own gutter. `<main>` has `tabindex="-1"` and is
  focused on every route change; `main:focus { outline: none }` is deliberate.
- **Variable content:** `#footer-snapshot` is `2026-08` or the longer
  `no creator data published yet`.
- **Footer eyebrow gotcha:** `--accent-ink` is wine-600 on paper, which is
  nearly invisible on wine-900. Every dark surface promotes eyebrows to
  wine-200 via the `.site-footer .eyebrow` / `.band--ink .eyebrow` rule. If a
  new dark surface is added, add it to that selector list.

---

## 2. Page states — `stateBlock()` / `statePage()` (`js/utils.js`)

```html
<div class="state state--loading|empty|error">
  <p class="state__title">Short title.</p>
  <p>Longer explanation, may contain <code>…</code> and <a>…</a>.</p>
</div>

<!-- statePage: the whole page is the state, so it carries the h1 -->
<h1>Page heading</h1>
<div class="state state--error"> …same… </div>
```

- **Repeats:** one or two per page; also inside an `<li>` when filters match
  nothing.
- **States:** `--loading` / `--empty` / `--error` differ by left border colour
  (`--rule`, `--marker-caveat`, `--wine-600`). `.band--ink .state` inverts to
  a `--warm-800` fill.
- **Variable content:** body runs ~40–220 chars. Empty-state copy is
  deliberately long because it explains *why* something is missing.

---

## 3. Home (`js/views/home.js`)

Three bands: **ink hero** → **paper catalogue** → **ink explainer**.

### 3a. Hero + search (ink band, rail "GrowthList")

```html
<div class="hero__inner">
  <p class="eyebrow">200 skills · 16 domains</p>
  <h1>Pick a skill. Get a short, honest list.</h1>
  <p class="lead">…~190 chars, contains <em>…</em>…</p>

  <div class="search" role="search">
    <div class="search__field">
      <span class="search__icon"><svg>…magnifier…</svg></span>
      <input id="search-input" type="search" role="combobox"
             aria-expanded="false" aria-controls="search-results"
             aria-autocomplete="list" placeholder="Try “stage fright”…">
    </div>
    <ul id="search-results" class="search__results" role="listbox">
      <li id="search-result-N" class="search__result" role="option"
          aria-selected="true|false" data-id="category-id">
        <span class="search__result-name">Public <mark>speak</mark>ing</span>
        <span class="search__result-meta">matched “stage fright”</span>
      </li>
    </ul>
  </div>
  <p class="search__hint">…</p>
  <p class="visually-hidden" id="search-status" role="status"></p>
  <div class="hero__actions"><button class="surprise" id="surprise">Surprise me →</button></div>
</div>
<div class="hero__orn" aria-hidden="true">…rings SVG…</div>
```

- **Repeats:** `.search__result` — **max 8**, rebuilt per keystroke (debounced
  140ms). No shadows or transitions here.
- **States:**
  - `.search__field:focus-within` carries the focus ring; the `<input>` has
    `outline: none`.
  - `.search__result[aria-selected="true"]` — keyboard-active option (↑/↓),
    fill **plus** a 4px wine left border, so it is not colour-only.
  - `.search__result:hover` — separate from the above.
  - `mark` — matched substring, wine + underline, not browser yellow.
  - `.search__results:empty { display: none }` is structural.
  - **`.surprise` on a dark band**: `--text` is near-black, so
    `.band--ink .surprise` overrides to `--paper`. Any new button placed on a
    dark band needs the same treatment (this shipped broken once — the label
    was invisible).
- **Variable content:** result name **5–32 chars**;
  `.search__result-meta` is absent about half the time (only shown when an
  alias matched), alias **2–30 chars**.
- `.hero__orn` is `position: absolute`, hidden below 900px.

### 3b. Domain groups and the category grid — **the heaviest repeat**

```html
<section class="domain">
  <div class="domain__head">
    <span class="domain__title"><span class="num">01</span><h2>Mindset &amp; psychology</h2></span>
    <span class="domain__count">13 skills</span>
  </div>
  <ul class="cat-grid">
    <li>
      <a class="cat-card" href="#/category/self-discipline">
        <span class="cat-card__name">Self-discipline</span>
        <span class="cat-card__blurb">…</span>
        <span class="cat-card__count">7 creators</span>
      </a>
    </li>
  </ul>
</section>
```

- **Repeats: 16 domains × 200 filled tiles, one paint.** Tiles are
  `--bg-alt` fills separated by a `--gutter-tile` (2px) hairline of paper, so
  they read as one block. **No shadow, no transform, no transition beyond
  colour** — this is the screen where cost shows. Cards per domain: 7/13/14
  (min/median/max).
- **States:** `.cat-card:hover` inverts to a wine fill with paper text (blurb
  and count switch to wine-200); `:focus-visible` rings the whole tile since
  the card is one `<a>`. `.cat-card__count--zero` reads "None listed yet" in
  muted text — **every tile carries it until Phase 2 data lands**.
- **Variable content:** name **5–32 chars** (longest: "Privacy and operational
  security"); blurb **75–119 chars**, reliably 2–3 lines. Tiles are
  `display: flex; flex-direction: column` with the blurb `flex: 1`, so counts
  align to the bottom regardless of blurb length.
- Grid: 1 col → 2 at 34rem → 3 at 62rem.

### 3c. Explainer (ink band)

Three `.explainer__item`s, each an `.eyebrow` + `h3` + `p`. Static copy,
~160–210 chars per paragraph. 1 column below 46rem.

---

## 4. Category view (`js/views/category.js`)

Four bands: **ink header** → **paper creators** → **ink "the other side"** →
**alt plan**.

```html
<!-- band 1: ink, rail = domain name -->
<p class="crumb"><a href="#/">All skills</a> › Communication &amp; social skills</p>
<h1>Public speaking</h1>
<p class="lead">…75–119 chars…</p>
<p class="cat-head__related">Related: <a>…</a><a>…</a><a>…</a></p>
<div class="hero__orn">…deterministic ornament…</div>

<!-- band 2: paper, rail "Creators" -->
<div class="tabs" role="tablist">
  <button class="tab" role="tab" id="tab-beginner" aria-selected="true"
          tabindex="0" data-level="beginner">Beginner <span class="tab__count">(4)</span></button>
</div>
<div id="panel-levels" role="tabpanel" aria-labelledby="tab-beginner" tabindex="0">
  <div id="level-guidance">
    <div class="level-guidance"><p class="micro claim__label">beginner</p><p>…</p></div>
  </div>
  <form class="filters" id="filters">…</form>
  <ul class="creator-list creator-list--grid" id="creator-list">…cards…</ul>
</div>
```

### 4a. Tabs

- Exactly 3. **`[aria-selected="true"]` is the hook** — fill + 2px ink
  underline + wine text, never colour alone. Roving tabindex: unselected tabs
  are `tabindex="-1"`; ←/→ move between them.
- Counts exclude critics, because critics render in their own band.

### 4b. Filters

`.filters` is an `--bg-alt` block with a 2px ink top border. Two `<select>`s,
a range input (`accent-color: --wine-600`), a text reset button, and a
`role="status"` summary. Wraps at narrow widths.

- **Variable content:** `#filters-summary` swaps between "Showing N of M
  creators." and "No creators match. M available at other settings."

### 4c. The critic — "the other side" (ink band, rail "The other side")

The credibility device of the site, so it gets its own full band rather than a
nested box. Contains a `.sec-head` (`03` + h2), a note, and a `.creator-list`.

**Cards invert inside it**: `--wine-800` fill (the token documented as "card
fill on dark"), wine-400 left border, wine-200 text, wine-900 badges, and the
video affordance flips to a wine-400 fill with wine-900 text. All of that is
handled by `.other-side .cc …` rules — the card markup is identical.

Rendered only when a critic exists; absent entirely otherwise.

### 4d. Four-week plan (alt band, rail "Practice")

```html
<ul class="plan__weeks">
  <li class="plan__week">
    <span class="plan__marker"><span>01</span></span>
    <div class="plan__body">
      <ul class="plan__watch"><span class="micro">Watch</span> <li><a>Name</a></li></ul>
      <label class="plan__check">
        <input type="checkbox" data-plan-key="category-id:week1">
        <span>Record yourself for two minutes and watch it back.</span>
      </label>
    </div>
  </li>
</ul>
```

- **Repeats:** exactly 4, single column, joined by a **connecting line** — a
  1px `::before` running down the marker column, clipped at the first and last
  markers so it starts and ends on the numbers. The `.plan__marker` has a
  `--bg` fill so the line passes behind it cleanly.
- **States:** `.plan__check input:checked + span` strikes through and mutes;
  state persists per category in `localStorage`. The `<label>` wraps the input
  and is `min-height: var(--tap-min)`.
- **Variable content:** exercise text ~50–130 chars; 1–2 creator links.
- Empty variant replaces the whole list with a `.state--empty`.

---

## 5. Creator card (`js/components/creator-card.js`) — the core repeating component

Slot order is fixed and identical at every density, so a density switch is a
class change, never different markup:

**avatar → name → size label → format tags → why here → not for → badges → video**

```html
<li>
  <article class="cc cc--accent">
    <div class="cc-head">
      <span class="avatar avatar--monogram" role="img" aria-label="Name">MD</span>
      <div class="cc-head__body">
        <h3 class="cc-name"><a href="#/creator/…">Display Name</a></h3>
        <p class="cc-meta">
          <span class="micro">1M–5M subs</span>
          <span class="dot"></span><span class="micro">Large</span>
          <span class="dot"></span><span class="micro">Critic</span>
        </p>
        <ul class="tags"><li>long-form</li><li class="tags__more">+2</li></ul>
      </div>
    </div>

    <div class="hair"></div>

    <div class="claim">
      <i></i><div><p class="micro claim__label">Why here</p><p>…</p></div>
    </div>
    <div class="claim claim--caveat">
      <i></i><div><p class="micro claim__label">Not for</p><p>…</p></div>
    </div>

    <ul class="badges"><li class="badge"><svg/>Cites research</li></ul>

    <div class="embed">…see §6…</div>
  </article>
</li>
```

`creatorMini()` emits `.cc.cc--compact` — same slots, no tags, no badges, no
embed. Used for similar-creators and the stack generalist.

- **Repeats:** up to ~15 per category page, each with an embed; 4 minis on a
  profile. `box-shadow: var(--shadow-none)` is explicit here.
- **Layout:** `.creator-list--grid` is `repeat(auto-fill, minmax(360px, 1fr))`.
  Cards are flex columns and `.creator-list .embed { margin-top: auto }`, so
  the video affordance pins to the bottom and sits on one baseline across a
  row regardless of sentence length.
- **States:** `.cc-name a` hover/focus. The two `.claim` markers differ by
  colour **and** label ("Why here" / "Not for"), so they don't rely on colour
  alone.
- **Avatars:** the dataset has **no avatar field yet**, so every card renders
  `.avatar--monogram` (initials, wine fill). `.avatar--alt` (warm-200 fill,
  warm-800 text) alternates by a hash of the creator id — stable per creator
  and independent of list position, so filtering never restyles a card. When
  `creator.avatar` exists it renders an `<img>` with `width`/`height` set, so
  the box never reflows.
- **Overflow caps:** the design shows 1–3 tags and 0–3 badges; the data allows
  5 and 7. Surplus collapses into a `+N` chip (with the full list in `title`)
  rather than wrapping to a fourth row. The profile page shows all of them.
- **Variable content:** name 3–30; `why` **20–200 chars**; `notFor` one
  sentence ~40–120; `caveats` usually absent.

---

## 6. Video affordance (`js/components/video-embed.js`)

**Privacy-critical.** Nothing is requested from any third party before the
click — including thumbnails, which YouTube serves from `i.ytimg.com`, not
the nocookie domain. Never introduce a remote image, font, or icon here.

Per the design, the wine block **is** the affordance, not a grey placeholder.

```html
<div class="embed">
  <div class="embed__frame" data-video="VIDEOID" data-title="…">
    <button class="embed__button" aria-label="Play “…” from Name">
      <span class="embed__ring"><svg>▶</svg></span>
      <span class="embed__text">
        <span class="embed__eyebrow">Start here · 18 min</span>
        <span class="embed__title">Verified video title</span>
      </span>
    </button>
  </div>
  <p class="embed__why">…</p>
  <p class="embed__notice">Playing loads the video from YouTube, and YouTube may set cookies.</p>
</div>
```

After click: `.embed__button` is replaced by an `<iframe>`, the frame gains
`.embed__frame--playing` (which applies `aspect-ratio: 16/9`), and a
`.embed__fallback` link is inserted after it.

- **Repeats:** one per card — up to ~15 per category page, 6 per profile.
- **States:** `.embed__button` hover (wine-700) and focus (`--focus-ring-dark`,
  because it sits on a wine fill). `.embed__fallback` appears only after a
  click, for embed-disabled videos.
- **`durationMin` is optional.** With it the eyebrow reads "Start here · 18
  min"; without, just "Start here" — a runtime is never invented. The field is
  not yet in the dataset; adding it is a schema addition in `CLAUDE.md`.
- **Variable content:** `.embed__title` is a real YouTube title up to ~100
  chars and is `white-space: nowrap; text-overflow: ellipsis` — it truncates by
  design so the block keeps a fixed height across a row.
- `.embed__notice` is a legal/privacy requirement, not decoration. It may be
  small; it may not be removed.

---

## 7. Creator profile (`js/views/creator.js`)

Three bands: **ink header** (avatar, name, meta, description, channel button)
→ **paper profile** → **alt similar**.

```html
<ul class="axes">
  <li class="axis">
    <span class="axis__label">Evidence-based</span>
    <span class="axis__bar"><span class="axis__fill" style="width:75%"></span></span>
    <span class="axis__value">3/4</span>
  </li>  <!-- ×5 -->
</ul>

<article class="mapping">
  <div class="mapping__head">
    <span class="num">01</span>
    <h3><a href="#/category/…">Public speaking</a></h3>
    <span class="micro">primary</span>
    <span class="micro">Communication &amp; social skills</span>
  </div>
  <p>…why…</p>
  <p class="mapping__evidence"><strong>Why them:</strong> …</p>
  <div class="embed">…</div>
</article>  <!-- ×2–6 -->
```

- **Repeats:** exactly 5 axes; 2–6 mappings (hard max 6), each with an embed;
  up to 4 similar creators.
- **States:** `.axis__fill` width is set inline as a percentage of 4. **A zero
  value renders an invisible fill**, so `.axis__bar` carries a `--rule` track
  that holds the meaning. Below 30rem the label moves to its own row.
- **Variable content:** `longDescription` **200–600 chars** — the longest prose
  on the site. The axis label column is a fixed `9.5rem` track; longest label
  is "Self-promotion".
- The "not for", "caveats", and "scopeNote" all render as `.claim` blocks so
  they read consistently with the cards.

---

## 8. Stack builder (`js/views/stack.js`)

Two bands: **ink header** → **paper picker + result**.

- `<select id="stack-add">` holds **200 `<option>`s in 16 `<optgroup>`s**.
  Already-picked options are `disabled` rather than removed, so the list never
  reflows. The whole select is `disabled` at 5 picks.
- `.chip` × up to 5, each with a remove `<button>` (min 24px).
- `.stack__share` is an `--bg-alt` block with a 4px wine left border holding a
  `readonly` URL input, a `.button--quiet` copy button, and a `role="status"`.
- Result rows are `.cc.cc--accent` with a `.stack__row-head` carrying the
  `01`–`05` numeral, then the standard `.claim` pair and the video affordance.
- **Variable content:** the share URL is long and monospaced and will overflow
  its input; chip labels are 5–32 chars.

---

## State-hook summary

Hooks that are **attributes, not classes**:

| Hook | Where | Meaning |
|---|---|---|
| `[aria-selected="true"]` | `.tab`, `.search__result` | selected tab / keyboard-active option |
| `[aria-expanded]` | `#search-input` | results list open |
| `[aria-busy="true"]` | `#app` | view loading |
| `[disabled]` | `#stack-add`, `<option>`, `.button` | unavailable |
| `:checked` | `.plan__check input` | exercise completed |
| `[data-theme]` | `<html>` | explicit light/dark override |

Modifier classes: `.state--loading|empty|error`, `.cc--accent`, `.cc--compact`,
`.band--paper|alt|ink|accent`, `.rail--ink`, `.avatar--monogram`,
`.avatar--alt`, `.claim--caveat`, `.tags__more`, `.cat-card__count--zero`,
`.button--quiet`, `.embed__frame--playing`.

---

## Dark theme — an extension, not part of the handoff

DESIGN.md specifies a light base only. The brief requires light **and** dark,
so `tokens.css` carries a clearly-marked extension block that remaps the
semantic aliases onto tokens the scale already provides for dark surfaces
(`--wine-800` "card fill on dark", `--wine-200` "eyebrows and secondary text
on dark"). **Needs design sign-off.** If dark is unwanted, delete that block
and the toggle in `js/theme.js` — no component CSS references it directly.

All 22 measured text/background pairings pass WCAG AA in **both** themes
(most are AAA). The measurement script lives in the session notes; re-run it
after any palette change.

---

## Known gaps against the design

1. **No avatar images.** The dataset has no avatar field and the design assumes
   96px local files with a ~5% monogram fallback. Today it is 100% monograms.
   `creator.avatar` is already supported when the data exists.
2. **No video durations.** "START HERE · 18 MIN" degrades to "START HERE"
   until `entryVideo.durationMin` exists.
3. **Subscriber labels are ranges, not counts.** The design mock shows
   "340K SUBS"; the brief forbids exact counts, so cards show
   "1M–5M subs · Large" from the bucket instead.
4. **Fonts not chosen** — see Global constraints.
5. **Remaining screens** in the design prompt (home/category/profile/stack
   compositions) were built from the two approved foundations rather than from
   rendered mocks, so composition choices above the component level are open
   to correction.
