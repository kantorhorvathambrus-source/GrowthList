# What `scripts/validate.mjs` actually enforces

Two of the four defects found in the batch-63 audit were **broken checks, not
broken data** — a `--final` flag that had never once run, and a guard whose
condition was `X && !X`. Neither showed up as a failure, because neither could
produce one. So the enforcement surface was unknown, and this is the audit that
establishes it.

**Method.** Every check below was driven by an input constructed to break it,
against a pristine copy of `data/` outside the repository (project rule 10 —
no test touches a real data or config filename). A check is marked *seen* only
where the harness produced its message. Nothing here is marked from reading the
code.

**Result: 98 call sites, 104 constructed inputs, every check seen failing.**
Two negative controls confirm the placeholder detector does not over-fire.

Harnesses: `/tmp` scratchpad, reproducible from this file's Method column —
they are throwaway fixtures by design and are not committed.

| # | Check (line) | Failure it exists to catch | Seen fail? |
|---|---|---|---|
| 1 | batch file shape (135) | a batch file that is not a JSON array | **yes** — wrote `{"not":"an array"}` |
| 2 | category id (149, 150, 155) | missing, duplicated, or non-kebab-case id | **yes** — all three |
| 3 | category fields (157, 159, 160, 163) | missing name/blurb/domain, empty aliases, bad relatedCategories, missing a level | **yes** — all four |
| 4 | category placeholder (166) | `TODO`/`lorem` left in a shipped category | **yes** — `blurb: "TODO write this"` |
| 5 | relatedCategories graph (189, 190) | a pointer to a category that does not exist, or to itself | **yes** — both |
| 6 | rule 19 funding gate (461) | a category admitted with fewer than 3 creators | **yes** — set `addedAt` on a thin category |
| 7 | creator id (206, 207) | missing or duplicated creator id | **yes** — both |
| 8 | creator required fields (216, 218) | missing name/descriptions/`notFor`, non-boolean `verified` | **yes** — both |
| 9 | handle + URL (221, 223, 228, 230) | malformed handle, duplicate handle, malformed URL, URL that disagrees with the handle | **yes** — all four |
| 10 | jurisdiction (243, 248) | a value outside the vocabulary; a mapping into a jurisdiction-sensitive category with no `jurisdiction` field | **yes** — both |
| 11 | language rule 5 (257, 261) | a non-English creator mapped outside the exempt categories; one with no `languageNote` | **yes** — both |
| 12 | scalar vocabularies (268, 270, 271, 272, 290, 291) | bad country, `dataAsOf`, `sizeBucket`, `status`, `role`, `entity` | **yes** — all six |
| 13 | longDescription floor (293) | under 200 characters | **yes** — set to `"too short"` |
| 14 | creator placeholder (295) | placeholder text anywhere in the record | **yes** — `TBD`, `FIXME`, `example.com`, `lorem` |
| 15 | empty caveats (297) | `caveats` present but blank, instead of omitted | **yes** — set to `"   "` |
| 16 | level (302, 304) | not an array; a level outside the vocabulary | **yes** — both |
| 17 | formatTags (309, 312) | empty array; an unrecognised tag *(warn)* | **yes** — both |
| 18 | profile (318, 323, 327) | missing object; an axis outside 0–4; an unknown axis | **yes** — all three, incl. the `5` the schema note says is caught repeatedly |
| 19 | signals (333, 336) | not an array; a signal outside the fixed vocabulary | **yes** — both |
| 20 | catalogue vs formatTags (284, 287) | a shorts-heavy channel with no `shorts` tag, and the reverse *(warn)* | **yes** — both |
| 21 | mapping shape (342, 345, 354, 356, 359) | empty categories, more than 6, missing id, unknown category, same category twice | **yes** — all five |
| 22 | mapping prose (364, 368, 370, 372, 375) | bad strength, missing `why`, `why` under 20 chars, duplicate `why`, missing `evidence` | **yes** — all five |
| 23 | entry video (403, 405, 406, 408, 410) | missing video, missing title/`whyThisOne`, malformed 11-char id, explicitly unverified | **yes** — all five |
| 24 | rule 15 `addedLater` (388, 390, 392, 395) | retroactive mapping with no provenance, bad batch, thin trigger or thin `whyNotAtFirstPass` | **yes** — all four |
| 25 | unverified creator (415) | `verified:false` with no `note` saying what could not be confirmed | **yes** |
| 26 | scope warnings (417, 419) | primary in more than 4 categories; spanning >2 domains with no `scopeNote` *(warn)* | **yes** — both |
| 27 | critic-gaps.json (441, 443) | a gap keyed to a non-existent category; a reason under 40 chars | **yes** — both |
| 28 | stale critic gap (506) | a category listed as a gap that now has a critic *(warn)* | **yes** — set `role: critic` and added the gap |
| 29 | coverage depth (481) | a category under 2 creators — *warn while filling, fail under `--final`* | **yes** — fires as `x` under `--final` |
| 30 | coverage liveness (483) | a category whose creator count is propped up by dormant channels | **yes** — under `--final` |
| 31 | coverage levels (498) | a category with no creator at some level | **yes** — under `--final` |
| 32 | untouched categories (502) | categories no batch has reached *(warn, counted not enumerated)* | **yes** — live output: `13 of 197 categories have no creators yet` |
| 33 | self-claims (536) | the site's own five claims about itself going false: every record API-verified; every creator with a size band and stamp; every mapping with an attributed video; the 4-primary and 6-total caps | **yes** — all five, one input each |
| 34 | mapping-cap hedge (568) | rule 4's spec number stated flat, so a target reads as a measurement | **yes** — *this is the guard that was `X && !X`*; now fires on both a removed hedge and a flat restatement, and stays quiet on an alternative hedge |
| 35 | modal count literal (573) | the modal mapping count typed instead of interpolated | **yes** — replaced `${facts.modal}` with `one` |
| 36 | undisclosed browser storage (606) | code writing a `localStorage` key the footer does not describe | **yes** — added a key; it named it |
| 37 | storage count in copy (611) | the footer stating a *count* of stored things, which decays | **yes** — added "We keep three things locally." |
| 38 | high-stakes shape (630, 631, 632, 634) | not a category id; a bare string entry; missing rationale; missing `visitorNote` | **yes** — all four |
| 39 | high-stakes note quality (638, 639, 641) | note too short; too long *(warn)*; written in the research voice instead of for a reader | **yes** — all three |
| 40 | stored derived count (664) | a `measured` block back in `domain-notes.json` — a second copy of a derived number | **yes** — restored `7/7`; **also FATAL in `build-data.mjs`** |
| 41 | typed measurement in copy (713) | a bare integer, `N of M`, `one in N`, `N <noun> in M`, or a spelled-out count in visitor prose, in **either** `domain-notes.json` or `colophon.js` | **yes** — one input per rule, five in all, plus a sixth proving it reads the JS file too |
| 42 | plan shape (759, 765, 766, 767) | missing plan object; a missing week; `watch` not an array; `do` not a string | **yes** — all four |
| 43 | plan content (775, 783, 785) | partially filled plan; `watch` outside 1–2 creators; empty `do` | **yes** — all three |
| 44 | plan references (789, 793) | a week pointing at an unknown creator, or one not mapped to that category | **yes** — both |
| 45 | plan entry level (800) | week 1 with no beginner-flagged creator | **yes** — stripped `beginner` from every record |
| 46 | empty plans (804) | plans not yet written *(warn)* | **yes** — live output: `197 of 197 categories have an empty plan` |

## Negative controls

The placeholder detector is two regexes on purpose — uppercase markers matched
case-sensitively, phrases case-insensitively — because `todo list` is a real
category alias and `example` is a word people write. Both hold:

| Input | Expected | Result |
|---|---|---|
| `"Not for you if you want a worked example of every case."` | no failure | **quiet** |
| `"Not a todo list app review channel."` | no failure | **quiet** |

## What this audit does not cover

Worth stating, because the rigour of the checked fields must not be read as
covering these:

- **`level`, `profile` and `role` are unfalsifiable by construction.** The
  validator enforces their *shape* — an integer in 0–4, a value in the
  vocabulary — and nothing can check whether a creator judged `depth: 4` is
  deep. These rest entirely on the writing. `data/field-audit.json` says the
  same; it has not changed.
- **Everything requiring the YouTube API** — handle resolution, entry-video
  attribution, `status` drift, catalogue shape — lives in `gate-check.mjs`,
  `audit-status.mjs` and `audit-catalogue.mjs`, not here. `validate.mjs`
  cannot tell a correct `videoId` from a well-formed wrong one.
- **Coverage is warn-until-`--final`.** Items 29–31 pass a normal run by
  design. They are the definition-of-done check, and until this audit's first
  commit that check could not be invoked at all.

## The standing question

Rule 20: *for every check, what would it look like if it were broken?* If the
answer is "the same", it is not a check. The two defects that prompted this
file both answered "the same". Every row above now has a constructed input
that makes it answer differently.

---

# Appendix A — the 23 → 231 discrepancy

An earlier report put `--final` at **23** coverage failures; it now reports
**231**. Three explanations were possible: 23 was never real, 231 is inflated by
the new checks, or both are right and the delta is legitimately new. This
settles it by measurement rather than argument.

**Method.** `ee9fe94` (the commit immediately before the positional-arg fix) was
extracted with `git archive` and run four ways, crossing validator against data.
`. --final` is used on the old tree because the documented form dies there —
that is the bug being controlled for.

| | validator | data | coverage failures |
|---|---|---|---|
| **A** | pre-fix (`ee9fe94`) | pre-fix | **231** |
| **B** | today | today | **231** |
| **C** | pre-fix | today | **231** |
| **D** | today | pre-fix | **253** |

**A and B are byte-for-byte identical** across all 231 lines. Not merely equal
in count — the same failures, in the same categories.

## Verdict: (a). 23 was never a real number.

The coverage failure set has not moved. C = B shows the data did not change it;
A = B shows the validator did not either.

**Where 23 came from, reproduced exactly.** The original audit ran:

```
node scripts/validate.mjs . --final 2>&1 | tail -25
```

`tail -25` returns 25 lines: 23 failure lines, a blank, and `FAILED`. The 23
visible lines were read as the total. Running that same pipe today still prints
23 — against a true total of 231.

This is the project's own recurring failure in miniature, and it belongs in the
record for that reason: **a number was taken from a truncated view of the
output and then used as a measurement.** It is the same shape as the badge
claim and the mapping-range claim — cheap to check, and nobody checked it. The
defence is the one already written down: a number about our own data names the
artifact that produced it. `tail -25` is not an artifact, it is a window.

## Classification of all 231

| Bucket | Count | |
|---|---|---|
| New check firing correctly | **0** | on current data |
| **New check firing on a fine record** | **0** | the bucket that would have mattered — it is empty |
| Pre-existing failure, previously unseen | **231** | every one |

All 231 are coverage, and 0 are non-coverage. The step-3 validator changes add
nothing to this count: on today's data they are silent.

Today's 231:

| Failure | Count |
|---|---|
| `no creator flagged "<level>"` | 151 |
| `only N creators, target 2` | 76 |
| `N creators but only M active` | 4 |

Across 134 distinct categories: 76 need new creators, 58 fail only on a missing
level flag.

## What D proves

D (today's validator, pre-fix data) = 253, which is A + 22. Those 22 are exactly
the defects this work was commissioned to fix:

- **19** stored `measured` counts in `domain-notes.json`
- **3** typed literals in visitor copy — `"29"`, `"one in seven"`, and
  `"four pages in five"`

Every one is a true positive against the pre-fix data, and every one is now
resolved, which is why B shows none of them. The new checks were run against
the data they were written for and caught exactly it, no more.

**Note the near-collision.** D − A = 22 and the reported figure was 23. They are
unrelated: 22 is the count of real defects the new checks find in old data, 23
is an artifact of `tail -25`. Two numbers one apart, from entirely different
causes — which is precisely the kind of coincidence that invites a wrong story
if the decomposition is not run.

---

# Appendix B — the unfalsifiable three

The table above closes with `level`, `profile` and `role` being unfalsifiable
by construction. That was a hole, not a finding. Each was probed for a real
check; three of four candidates died on measurement, which is recorded here so
nobody rebuilds them.

| Field | Candidate check | Outcome |
|---|---|---|
| `role` | `generalist` mapped to only one category | **rejected** — describes 8 of our 11 generalists, so it is the norm |
| `role` | `specialist` spanning >2 domains | **rejected** — one record, `wirelessphilosophy`, which already carries the required `scopeNote` |
| `level` | `advanced`-only with `profile.depth <= 1` | **rejected as coverage** — fires on 0 records, and can only catch a writer contradicting themselves; `level` and `depth` are written together, so their errors correlate |
| `profile` | `evidenceBased: 4` without `cites-research` | **rejected** — 8 records, all legitimate; a gardener can be evidence-based through trials without citing papers |
| `profile` | commercial signal with `selfPromotion <= 1` | **rejected as drafted** — flagged Computerphile and This Old House, both correct: `sponsor-heavy` means a third party pays, which is orthogonal to self-promotion |
| `profile` | **`sells-course` with `selfPromotion < 2`** | **adopted** — see below |

## The one check that survived (47, line 290)

| # | Check | Failure it catches | Seen fail? |
|---|---|---|---|
| 47 | `sells-course` vs `selfPromotion` (290) | a creator recorded as selling their own product while rated as never mentioning it — one of the two fields is wrong | **yes** — fires at 0 and at 1; quiet at 2; quiet on the `sponsor-heavy` shape that broke the first draft |

```
signals=["sells-course","practitioner"] selfPromotion=0
  x creator askvinh: carries "sells-course" but profile.selfPromotion is 0 —
    a creator selling their own product while never mentioning it is a
    contradiction; one of the two is wrong
signals=["sells-course"]                selfPromotion=1  -> 1 failure
signals=["sells-course"]                selfPromotion=2  -> 0 failures
signals=["sponsor-heavy","credentialed"] selfPromotion=1 -> 0 failures
```

**Why this one is real and the others were not.** `signals` is a closed
vocabulary tied to an observable fact that was checked at research time;
`profile` is a taste judgement. This is the only place in the schema where the
two meet, so it is the only place a wrong profile value can contradict
something recorded independently of it. The constraint is not vacuous: 131
records carry `sells-course` and all sit at 2 or above, while 48 records sit at
0–1 without it — the low end is populated, just never by someone selling.

## What remains human-only

`level`, `role`, and four of the five `profile` axes. The review step is
written into **CLAUDE.md**, under *The three fields nothing can check*, rather
than into a comment here — a procedure in a script's comment is not in force.

One consequence belongs with the Step C work specifically: the coverage check
prints `no creator flagged "beginner"` 151 times, and the cheapest way to clear
a line is to add the flag. **A coverage failure is not evidence about a
creator.** Clearing it by relabelling turns a visible gap into an invisible
falsehood. The instruction in CLAUDE.md is to leave the field unset and let the
line stand.
