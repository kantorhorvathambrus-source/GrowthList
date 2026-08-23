# MARKUP.md — the DOM contract

Written for the design spec. `css/style.css` is currently a **structural
baseline only**: no colour, background, `font-family`, or shadow declarations
anywhere, so the spec has nothing to conflict with. Borders are declared
width-and-style only (inheriting `currentColor`) purely so component edges are
discernible while unstyled — the spec decides whether they survive.

Everything below is what the JavaScript actually emits. Class names and DOM
nesting are stable; if the spec needs a different hook, say so and the markup
will change rather than the spec working around it.

For each component: **DOM**, **repeats** (what must stay cheap), **states**
(what needs styling beyond the resting appearance), and **variable content**
(where text length swings).

---

## Global constraints

These are fixed by the brief and are not negotiable in the spec:

- **No external fonts, no CDN.** System font stack only. The current CSS
  declares no `font-family` at all, so the spec sets it.
- **Light and dark are both required.** The visitor's system preference is the
  default; an explicit choice stamps `data-theme="light"` or `data-theme="dark"`
  on `<html>` and is remembered in `localStorage`. So every colour needs
  defining under three conditions: bare `:root`, `@media (prefers-color-scheme:
  dark)` guarded as `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`.
- **Mobile-first, no horizontal overflow at 390px.** Currently verified clean.
- **Real focus styles.** `:focus-visible` currently has a `3px solid` outline
  using `currentColor`. Replace it, don't remove it.
- **`prefers-reduced-motion`** must be honoured by any animation the spec adds.
- First load is budgeted under ~500 KB total (currently 85 KB of data), so
  large decorative assets need to be weighed against that.

---

## 1. Page shell (`index.html`)

```html
<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="#/">
      <span class="brand__mark" aria-hidden="true"></span>
      <span class="brand__name">GrowthList</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <a href="#/">Skills</a>
      <a href="#/stack">Build your stack</a>
      <button id="theme-toggle" class="theme-toggle">
        <span class="theme-toggle__icon" aria-hidden="true"></span>
        <span class="theme-toggle__label">Theme</span>
      </button>
    </nav>
  </div>
</header>

<main id="main" class="wrap" tabindex="-1">
  <div id="app" aria-live="polite" aria-busy="true"> … view renders here … </div>
</main>

<footer class="site-footer"> <div class="wrap"> …4 <p> … </div> </footer>
```

- **Repeats:** none. One header, one footer, per page load.
- **States:**
  - `.skip-link` — invisible until `:focus`, then must be visible and legible
    over whatever sits behind it.
  - `.site-header` is `position: sticky; top: 0` in the old design; the spec
    decides whether it stays sticky (structural CSS no longer sets this).
  - `.theme-toggle` — hover, focus. Its `aria-label` and `title` change between
    "Switch to dark theme" / "Switch to light theme"; there is no pressed state.
  - `#app[aria-busy="true"]` is set during every view load — available as a
    hook if the spec wants a loading treatment on the whole region.
- **Variable content:** `#footer-snapshot` is one of `2026-08` (a `YYYY-MM`
  string) or the longer `no creator data published yet`. `.brand__mark` is an
  empty 1.1rem square — currently blank, intended as a logo slot.
- **Note:** `<main>` has `tabindex="-1"` and is focused on every route change,
  so keyboard focus lands there rather than resetting to the top of the
  document. Don't add a focus ring to `main` itself (`main:focus { outline:
  none }` is deliberate).

---

## 2. Page states — `stateBlock()` / `statePage()` (`js/utils.js`)

Used by every view for loading, empty, and error conditions.

```html
<!-- stateBlock: inline, inside a populated page -->
<div class="state state--loading|empty|error">
  <p><strong>Short title.</strong></p>
  <p>Longer explanation, may contain <code>…</code> and <a>…</a>.</p>
</div>

<!-- statePage: the whole page is the state, so it carries the h1 -->
<h1>Page heading</h1>
<div class="state state--error"> …same… </div>
```

- **Repeats:** at most one or two per page, except `.state--empty` inside a
  list item (`<li>` wrapper) when filters match nothing.
- **States:** three variants via modifier class — `--loading`, `--empty`,
  `--error`. These are the primary hooks. The old design used a dashed border
  for empty/loading and a solid critic-coloured border for error.
  - `--loading` previously had a sweeping 2px animated bar via `::after`. That
    animation is removed; if the spec restores it, it must respect
    `prefers-reduced-motion`.
- **Variable content:** the body ranges from ~40 to ~220 characters and can
  wrap to 4 lines on mobile. Empty-state copy is deliberately long (it explains
  *why* something is missing), so don't design for one line.

---

## 3. Home (`js/views/home.js`)

### 3a. Hero + search

```html
<div class="hero">
  <h1>Pick a skill. Get a short, honest list.</h1>
  <p class="hero__lead">…~180 chars, contains <em>…</em>…</p>

  <div class="search" role="search">
    <label class="visually-hidden" for="search-input">Search skills</label>
    <div class="search__field">
      <input id="search-input" type="search" role="combobox"
             aria-expanded="false" aria-controls="search-results"
             aria-autocomplete="list" placeholder="Try “stage fright”, …">
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

  <p><button class="surprise" id="surprise">Surprise me →</button></p>
</div>
```

- **Repeats:** `.search__result` — **max 8**, rebuilt on every keystroke
  (debounced 140ms). Keep it cheap: no shadows or transitions that cost on
  rapid re-render.
- **States — this component has the most:**
  - `.search__field:focus-within` — the visible focus treatment lives on the
    wrapper, because the `<input>` itself has `outline: none`.
  - `.search__result[aria-selected="true"]` — the **keyboard-active** option,
    moved by ↑/↓. Must be visually distinct and must not rely on `:hover`.
  - `.search__result:hover` — pointer highlight, separate from the above.
  - `mark` inside the result name — highlights the matched substring. Needs a
    treatment that is not the browser default yellow.
  - `.search__results:empty { display: none }` is structural — keep it.
  - `#search-input` is `type="search"`; browsers add a clear button that may
    need normalising.
- **Variable content:**
  - Result name: **5–32 chars** (longest: "Privacy and operational security").
  - `.search__result-meta`: empty when the category name itself matched,
    otherwise `matched “<alias>”` where the alias is **2–30 chars**. Design for
    it being absent about half the time.

### 3b. Domain sections and the category grid — **the heaviest repeat on the site**

```html
<section class="domain" aria-labelledby="domain-mindset">
  <div class="domain__head">
    <h2 id="domain-mindset">Mindset &amp; psychology</h2>
    <span class="domain__count">13 skills</span>
  </div>
  <ul class="cat-grid">
    <li>
      <a class="cat-card" href="#/category/self-discipline">
        <span class="cat-card__name">Self-discipline</span>
        <p class="cat-card__blurb">…</p>
        <span class="cat-card__count">7 creators</span>
      </a>
    </li>
  </ul>
</section>
```

- **Repeats: 16 `.domain` sections containing 200 `.cat-card`s, all rendered
  in one pass on first paint.** This is the single thing to keep cheap.
  Per-card `box-shadow`, `filter`, `backdrop-filter`, or transitions on
  `box-shadow` will be felt; borders and background colours will not.
  Cards per domain: **7 min / 13 median / 14 max**.
- **States:**
  - `.cat-card:hover` and `:focus-visible` — the whole card is one `<a>`, so
    the focus ring goes around the card.
  - `.cat-card__count--zero` — an additional class when the count is 0, text
    reads "no creators listed yet" instead of "N creators". Currently the only
    semantic colour distinction on the home page. **Every card carries this
    class until Phase 2 data lands**, so its unstyled/plain appearance matters.
- **Variable content:**
  - `.cat-card__name`: **5–32 chars**, median 17. Wraps to 2 lines at the
    narrowest column.
  - `.cat-card__blurb`: **75–119 chars**, median 97 — reliably 2–3 lines. The
    grid is `1fr` / 2-col at 34rem / 3-col at 56rem, so cards in a row have
    uneven text height. Cards use `height: 100%` to equalise.
  - `.domain__count`: always short, `"N skills"`.

### 3c. Explainer (below the fold)

```html
<section class="explainer">
  <h2>How to actually use this</h2>
  <div class="explainer__grid">
    <div><h3>…</h3><p>…~200 chars…</p></div>   <!-- ×3 -->
  </div>
</section>
```

- **Repeats:** exactly 3 columns (1 column below 46rem).
- **States:** none — static text.
- **Variable content:** fixed copy, ~160–210 chars per paragraph.

---

## 4. Category view (`js/views/category.js`)

```html
<p class="crumb"><a href="#/">All skills</a> › Communication &amp; social skills</p>

<div class="cat-head">
  <h1>Public speaking</h1>
  <p class="cat-head__blurb">…75–119 chars…</p>
  <p class="cat-head__related">Related: <a>…</a><a>…</a><a>…</a></p>
</div>

<div class="tabs" role="tablist">
  <button class="tab" role="tab" id="tab-beginner"
          aria-selected="true" tabindex="0" data-level="beginner">
    Beginner <span class="tab__count">(4)</span>
  </button>  <!-- ×3 -->
</div>

<div id="panel-levels" role="tabpanel" aria-labelledby="tab-beginner" tabindex="0">
  <div id="level-guidance">
    <div class="level-guidance"><p><strong>Beginner:</strong> …</p></div>
  </div>

  <form class="filters" id="filters">…see below…</form>
  <ul class="creator-list" id="creator-list">…creator cards…</ul>
</div>

<section class="other-side">…critic block, see 4c…</section>
<section class="plan">…see 4d…</section>
```

### 4a. Tabs

- **Repeats:** exactly 3.
- **States:** `.tab[aria-selected="true"]` is the selected tab — **this is the
  hook, not a `.is-active` class**. Also `:hover` and `:focus-visible`. Roving
  tabindex: the unselected tabs have `tabindex="-1"`, so only one is in the tab
  order; ←/→ move between them.
- **Variable content:** label is one of three fixed words plus `(N)`.

### 4b. Filters

```html
<form class="filters" id="filters" aria-label="Filter creators">
  <div class="filters__row">
    <div class="filters__group">
      <label for="filter-size">Channel size</label>
      <select id="filter-size">…7 options…</select>
    </div>
    <div class="filters__group">
      <label for="filter-format">Format</label>
      <select id="filter-format">…variable options…</select>
    </div>
    <div class="filters__group">
      <label for="filter-promo">Max self-promotion: <strong id="promo-value">4</strong>/4</label>
      <input id="filter-promo" type="range" min="0" max="4" step="1" value="4">
    </div>
    <button class="filters__reset" id="filters-reset">Reset filters</button>
  </div>
  <p class="filters__summary" id="filters-summary" role="status">Showing 4 of 11 creators.</p>
</form>
```

- **Repeats:** one filter bar per category page.
- **States:** native `<select>` and `<input type="range"]` need styling in both
  themes — the range previously used `accent-color`. `.filters__reset` is a
  text button (hover/focus). The row wraps at narrow widths.
- **Variable content:** `#filters-summary` swaps between "Showing N of M
  creators." and "No creators match. M available at other settings." The label
  text changes as the slider moves.

### 4c. Critic block — "the other side"

```html
<section class="other-side">
  <div class="other-side__head"><h2>The other side</h2></div>
  <p class="other-side__note">…~140 chars…</p>
  <ul class="creator-list">…creator cards…</ul>
</section>
```

- **Repeats:** one block per category, usually containing **1** creator card
  (occasionally 2–3).
- **States:** none of its own; it is a container.
- **Design intent (from the brief):** this must be *visually distinct* and not
  buried — it is the credibility device of the whole site. The previous design
  used a warm accent border and tinted background to separate it from the main
  list. The nested `.creator-card` inherits the section's treatment.
- Rendered **only** when a critic exists; absent entirely otherwise.

### 4d. Four-week plan

```html
<section class="plan">
  <h2>The four-week plan</h2>
  <p class="plan__intro">…</p>
  <ul class="plan__weeks">
    <li class="plan__week">
      <h3>Week 1</h3>
      <ul class="plan__watch">Watch: <li><a href="#/creator/…">Name</a></li></ul>
      <label class="plan__check">
        <input type="checkbox" data-plan-key="category-id:week1">
        <span>Record yourself for two minutes and watch it back.</span>
      </label>
    </li>
  </ul>
</section>
```

- **Repeats:** exactly 4 `.plan__week` (2×2 grid above 46rem, stacked below).
- **States:**
  - `.plan__check input:checked + span` — the completed treatment. Currently
    line-through; the spec owns this. Checked state persists in `localStorage`
    per category.
  - Checkbox `:focus-visible` — the `<label>` wraps the input, so clicking the
    text toggles it.
  - Empty variant: when no plan exists the whole `<ul>` is replaced by a
    `.state--empty` block.
- **Variable content:** the exercise text runs **~50–130 chars**, 1–3 lines.
  `.plan__watch` holds 1–2 creator links, names up to ~30 chars.

---

## 5. Creator card (`js/components/creator-card.js`)

Two variants. **`creatorCard()`** — full, used in category lists and the stack:

```html
<li>
  <article class="creator-card">
    <div class="creator-card__head">
      <h3 class="creator-card__name"><a href="#/creator/…">Display Name</a></h3>
      <span class="creator-card__handle">@handle</span>
      <span class="pill pill--size">1M-5M</span>
      <span class="pill pill--critic">critic</span>      <!-- role-dependent -->
      <span class="pill">generalist</span>                <!-- role-dependent -->
      <span class="pill pill--archive">archive</span>     <!-- status-dependent -->
    </div>

    <ul class="tag-row">
      <li class="tag">long-form</li>              <!-- format tags -->
      <li class="tag tag--signal">cites research</li>  <!-- signals -->
    </ul>

    <p class="creator-card__why">…category-specific reason…</p>
    <p class="creator-card__notfor"><strong>Not for:</strong> …</p>
    <p class="creator-card__caveat">…optional, often absent…</p>

    <div class="embed">…see section 6…</div>
  </article>
</li>
```

**`creatorMini()`** — same head and `notFor`, no tags and no embed, used for
similar-creators and the stack generalist. Its optional note reuses
`.creator-card__caveat`.

- **Repeats:** up to **~15 per category page**, each containing a full embed
  block. Realistic target is 8–15. On the creator page, up to 4 minis.
- **States:**
  - `.creator-card__name a` — hover, focus.
  - Pills are static, but there are **four distinct kinds**: `.pill--size`
    (always present), `.pill--critic`, `.pill--archive`, and bare `.pill`
    (generalist, plus `strength` and country on the profile page). They need to
    read as different categories of information, not one uniform chip.
  - `.tag` vs `.tag--signal` — format tags versus the fixed signal vocabulary.
    Signals are **neutral labels, not verdicts**: `sells-course` and
    `contested-claims` must not be styled as warnings.
  - `.creator-card__notfor` — the honest downside line. Previously a left rule
    in the critic colour. Present on **every** card, never absent.
- **Variable content:**
  - Name: 3–30 chars. Handle: 3–30 chars, and the two sit on one baseline row
    that wraps with the pills.
  - `.creator-card__why`: **20–200 chars**, 1–3 lines.
  - `.creator-card__notfor`: one sentence, ~40–120 chars.
  - `.creator-card__caveat`: absent most of the time; when present, one
    sentence.
  - `.tag-row`: **1–5 format tags plus 0–7 signals**, so anywhere from 1 to 12
    chips — this row wraps hard on mobile. Signal labels are up to 24 chars
    ("strong ideological frame").

---

## 6. Video embed (`js/components/video-embed.js`)

**Privacy-critical. Read before restyling.** Nothing may be requested from any
third party before the visitor clicks — that includes thumbnails, which is why
there is no image here at all. The spec must not introduce a background image,
font, or icon loaded from a remote host.

Before click:

```html
<div class="embed">
  <div class="embed__frame" data-video="VIDEOID" data-title="…">
    <button class="embed__button" aria-label="Play “…” from Name">
      <span class="embed__play" aria-hidden="true"></span>
      <span class="embed__title">Verified video title</span>
    </button>
  </div>
  <p class="embed__why">What you'll know after watching.</p>
  <p class="embed__notice">Playing loads the video from YouTube, and YouTube may set cookies.</p>
</div>
```

After click, `.embed__button` is **replaced** by `<iframe>` inside the same
`.embed__frame`, and a `<p class="embed__fallback">` with a plain link is
inserted immediately after the frame.

- **Repeats:** one per creator card — so up to ~15 per category page and up to
  6 per creator profile.
- **States:**
  - `.embed__button:hover` / `:focus-visible` — it is a real button filling the
    whole 16:9 area.
  - `.embed__play` is an empty 3rem circle; the play triangle was previously
    drawn with CSS borders on `::after`. **It must stay CSS/inline-SVG, not a
    remote asset.**
  - `.embed__fallback` appears only after a click, for embed-disabled videos.
  - `.embed__frame` is `aspect-ratio: 16/9` with `overflow: hidden` —
    structural, keep.
- **Variable content:** `.embed__title` is a real YouTube title, **up to ~100
  chars**, and is the most likely thing to overflow. `.embed__notice` is fixed
  copy and must remain legible — it is a legal/privacy requirement, not
  decoration, so it can be small but not hidden.
- `.embed` is capped at `max-width: 30rem` so the placeholder doesn't dwarf the
  text explaining why to watch it. The spec may change the cap.

---

## 7. Creator profile (`js/views/creator.js`)

```html
<div class="profile__head">
  <h1>Display Name</h1>
  <div class="profile__meta">
    <span class="creator-card__handle">@handle</span>
    <span class="pill pill--size">1M-5M subscribers</span>
    <span class="pill pill--critic">critic</span>
    <span class="pill">US</span>
  </div>
  <p class="profile__desc">…longDescription, 200+ chars…</p>
  <p class="creator-card__notfor">…</p>
  <p class="creator-card__caveat">…optional…</p>
  <p><a class="button" href="https://www.youtube.com/@handle">Open channel on YouTube</a></p>
</div>

<h2>Taste profile</h2>
<p class="similar__note">…</p>
<ul class="axes">
  <li class="axis">
    <span>Evidence-based</span>
    <span class="axis__bar"><span class="axis__fill" style="width:75%"></span></span>
    <span class="axis__value">3/4</span>
  </li>  <!-- ×5 -->
</ul>

<h2>Where they're worth watching</h2>
<article class="mapping">
  <div class="mapping__head">
    <h3><a href="#/category/…">Public speaking</a></h3>
    <span class="pill">primary</span>
    <span class="creator-card__handle">Communication &amp; social skills</span>
  </div>
  <p>…why, 20–200 chars…</p>
  <p class="mapping__evidence"><strong>Why them:</strong> …</p>
  <div class="embed">…</div>
</article>  <!-- ×2–6 -->

<section class="similar">
  <h2>Similar creators</h2>
  <p class="similar__note">…</p>
  <ul class="creator-list">…creatorMini ×4…</ul>
</section>
```

- **Repeats:** exactly **5** `.axis` rows; **2–6** `.mapping` blocks (hard max
  6), each with an embed; up to **4** similar creators.
- **States:**
  - `.axis__fill` width is set inline by JS as a percentage of 4. The bar needs
    a track (`.axis__bar`) and fill treatment that works at **0%** — a zero
    value renders an invisible fill, so the track must carry the meaning.
  - `.button` — the outbound channel link. Hover, focus, and a `[disabled]`
    variant exists in CSS though unused here.
  - `.pill` with `strength` values `primary` / `secondary` — worth
    distinguishing.
  - A `.state--empty` "Not fully verified" block appears when
    `verified: false`, plus an optional `scopeNote` paragraph.
- **Variable content:**
  - `.profile__desc`: **200–600 chars**, the longest prose block on the site.
  - `.axis` label column is a fixed `8.5rem` grid track; labels are 5–14 chars
    ("Self-promotion" is the longest).
  - `.mapping__head` mixes a link, a pill, and a domain label on one baseline —
    wraps on mobile.

---

## 8. Stack builder (`js/views/stack.js`)

```html
<form class="stack__picker" id="stack-form">
  <div class="filters__group">
    <label for="stack-add">Add a skill</label>
    <select id="stack-add">
      <optgroup label="Mindset &amp; psychology">
        <option value="self-discipline">Self-discipline</option>  <!-- 200 total -->
      </optgroup>  <!-- ×16 -->
    </select>
  </div>
  <p class="filters__summary" id="stack-count" role="status">2 of 5 chosen.</p>
  <ul class="stack__chosen" id="stack-chosen">
    <li class="chip">Public speaking <button data-remove="…" aria-label="Remove …">×</button></li>
  </ul>
</form>

<div id="stack-result">
  <div class="stack__share">
    <label class="visually-hidden" for="stack-url">Shareable link</label>
    <input id="stack-url" type="text" readonly value="https://…#/stack?ids=…">
    <button class="button button--quiet" id="copy-url">Copy link</button>
    <span class="filters__summary" id="copy-status" role="status"></span>
  </div>

  <h2>Your stack</h2>
  <ul class="creator-list stack__result">
    <li><article class="creator-card">…one per pick…</article></li>
  </ul>

  <section class="similar">   <!-- only if a generalist covers 2+ picks -->
    <h2>One generalist, if you'd rather have fewer voices</h2>
    <ul class="creator-list">…creatorMini…</ul>
  </section>
</div>
```

- **Repeats:** the `<select>` holds **200 `<option>`s in 16 `<optgroup>`s** —
  native control, minimal styling surface. Up to **5** `.chip` and **5** result
  cards.
- **States:**
  - `#stack-add[disabled]` — the whole select is disabled at 5 picks.
  - Individual `<option>[disabled]` — already-picked skills are disabled rather
    than removed, so the list doesn't reflow.
  - `.chip button` — the remove control, hover/focus. It is a real button
    inside the chip, so the chip has two focusable-adjacent areas.
  - `.button--quiet` — the secondary button variant, used for "Copy link".
  - `#stack-url` is `readonly`, not disabled — it must still look selectable.
  - `#copy-status` fills in with "Link copied." or "Press Ctrl+C to copy."
- **Variable content:** the share URL is long and monospaced-by-default and
  will overflow its input; category names in chips are 5–32 chars.

---

## Class-hook summary

State hooks that are **attributes, not classes** — the spec must target these:

| Hook | Where | Meaning |
|---|---|---|
| `[aria-selected="true"]` | `.tab`, `.search__result` | selected tab / keyboard-active option |
| `[aria-expanded]` | `#search-input` | results list open |
| `[aria-busy="true"]` | `#app` | view loading |
| `[disabled]` | `#stack-add`, `<option>`, `.button` | unavailable |
| `:checked` | `.plan__check input` | exercise completed |
| `[data-theme]` | `<html>` | explicit light/dark override |

Modifier classes: `.state--loading|empty|error`, `.pill--size|critic|archive`,
`.tag--signal`, `.cat-card__count--zero`, `.button--quiet`,
`.stack__generalist`.

---

## What is deliberately unstyled right now

Removed with the visual layer, listed so nothing is lost:

- All colour tokens (the old palette used CSS custom properties named
  `--bg`, `--bg-raised`, `--bg-sunken`, `--border`, `--border-strong`,
  `--text`, `--text-muted`, `--text-faint`, `--accent`, `--accent-text`,
  `--accent-bg`, `--accent-ink`, `--critic`, `--critic-bg`, `--focus`,
  `--shadow` — reuse or replace freely).
- `font-family`, all type scale and weight, letter-spacing.
- The sticky header, all shadows, the loading sweep animation, the play-button
  triangle, the brand gradient mark, `accent-color` on form controls.
- Spacing scale tokens (`--space-1` … `--space-7`) — the structural CSS now
  uses literal `rem` values, which the spec can replace with tokens.

The previous full stylesheet is recoverable from git at commit `b2caba9`
(`css/style.css`) if any of it is worth keeping.
