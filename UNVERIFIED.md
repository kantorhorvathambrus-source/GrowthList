# Unverified and excluded entries

Two lists, kept honestly:

- **Excluded** — a candidate that was researched against the YouTube Data
  API and then deliberately left out. The channel is real; it just does
  not belong in the dataset for the stated reason.
- **Unverified** — a creator that *is* in the dataset with
  `"verified": false`, because something about it could not be confirmed.
  Each needs a human to check the named field.

Everything here traces back to an actual API response. Nothing was
excluded on a hunch and nothing was included on one.

---

## Excluded

### Batch 01 — communication, creative writing, critical thinking

| Handle | Channel | Why it was excluded |
| --- | --- | --- |
| `@inbornvoice` | Inborn Voice | **Not English.** The uploads are Italian — "Intervista a Milena Origgi", "Corso di Vocal Coaching per Recitazione". The brief is English-only, and a viewer sent to a channel they cannot follow is worse than a shorter list. |
| `@vvanedwards` | Vanessa Van Edwards | **No usable entry video.** Of the 200 most recent uploads, 196 run two minutes or less; the only long-form items are two 57-minute AMAs. Every creator needs one entry-point video that represents the teaching, and there is nothing here that does. Worth revisiting if the channel resumes long-form. |

Also probed and dropped before research, because the handle did not lead
where the name implied:

| Handle tried | What the API actually returned |
| --- | --- |
| `@vinhgiang` | Does not exist. The real channel is `@askvinh`, found by search — the reason handles are probed rather than constructed. |
| `@VanessaVanEdwards` | Resolves, but the channel has **0 videos**. The active one is `@vvanedwards`. |
| `@firstround` | Resolves, but the channel has **0 videos**. |
| `@communicationcoach` | A different person (Sue Johnston), not the channel the name suggests. |
| `@theschooloflife` (lowercase) | A different, tiny channel — not The School of Life. |

### Batch 02 — communication, reasoning, feedback

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@chrisvoss` | **The Chris Voss Show** — a US interview/book podcast with **10,150 uploads** | Not the FBI negotiator of the same name. Every recent upload is titled "The Chris Voss Show Podcast – <guest>". A name match is not an identity match. **Correction:** this entry originally added "no channel for the negotiator was found", which was false — his channel was already in the dataset as `negotiationmastery` (`@NegotiationMastery`, "Chris Voss & The Black Swan Group") from batch 01. The wrong-channel finding stands; the claim that nothing existed for him does not. See `data/handle-rescues.json`. |
| `@JordanHarbingerShow` | The Jordan Harbinger Show, 725 uploads, median 81 min | Real, and large, but the visible catalogue is a general-interest interview show — cancer doctors, geopolitics, declassified history. Nothing in it supports a *networking* mapping, whatever the host is known for elsewhere. Halo effect avoided. |
| `@TED` | TED, 5,789 uploads | A corpus of talks *about ideas*, not a channel about speaking. Mapping TED to public-speaking on the strength of two or three talks that happen to be on the subject is exactly the halo the scope rule forbids. |
| `@crashcourse` | CrashCourse, 1,707 uploads across 60+ courses | Deferred, not rejected. The 200 most recent uploads are all Geology; confirming the Media Literacy and Statistics series needs a deeper scan, and it belongs in a learning-domain batch. |
| `@TheBehaviorPanel` | The Behavior Panel, 1.3k uploads, 1M–5M | Deferred. Popular body-language/"deception detection" content, which the `body-language` category exists partly to caution against. Including it needs a decision about whether to list contested material with a warning or leave it out. |

Handles probed in batch 02 that resolve but are **empty or the wrong
entity** — recorded so nobody spends the quota twice:

| Handle tried | What the API actually returned |
| --- | --- |
| `@duarteinc` | "Duartewood Inc." — an unrelated company. The real presentation firm is `@DuarteDesign`. |
| `@duarte` | A different channel with 1 video. |
| `@negotiations` | "Isoc Iq" — unrelated, 7 videos. |
| `@SpeakUpWithLaura`, `@Nudge`, `@behaviouralscience`, `@themothstories`, `@JordanTheresa`, `@socialskillscoach`, `@negotiationexperts`, `@theblackswangroup`, `@cambridgeunion`, `@NegotiationMasterclass`, `@thecommunicationcoach`, `@TheDecisionLab`, `@thoughtemporium`, `@dailystoicofficial` | All resolve, all have **0 videos**. |
| `@ScienceOfPeople`, `@ChrisVossOfficial`, `@BlackSwanLtd`, `@jordanharbinger`, `@robertcialdini`, `@influenceatwork`, `@intelligencesquared`, `@CambridgeUnionSociety`, `@manager-tools`, `@RyanHoliday`, `@ShaneAParrish`, `@MattAbrahams` | These handles do not exist. **That is not the same as the person having no channel** — see the correction below. |

**Correction — the "does not exist" list above was doing too much work.**
Four of those people were re-checked with the affiliation-search fallback
(`scripts/resolve-creator.mjs`) and all four have real channels under
handles that bear no resemblance to their names:

| Person | Handle that failed | Real channel, found via | Status |
| --- | --- | --- | --- |
| Chris Voss | `@chrisvoss` (wrong person), `@ChrisVossOfficial` | "Chris Voss Black Swan Group" → `@NegotiationMastery` | **Already in batch 01.** No creator was missing; the note claiming otherwise was wrong. |
| Robert Cialdini | `@robertcialdini`, `@influenceatwork`, `@Cialdini` | "Robert Cialdini Influence at Work" → `@teamcialdini` | Genuine find. For a persuasion top-up. |
| Shane Parrish | `@ShaneAParrish`, `@Farnamstreet` | "Shane Parrish Farnam Street" → `@farnamstreet3661` | Genuine find. For a learning batch. |
| Ryan Holiday | `@RyanHoliday` | "Ryan Holiday Daily Stoic" → `@dailystoic` | Genuine find. For a philosophy/mindset batch. |

Vanessa Van Edwards was also re-found this way, but she was never an
identity problem — `@vvanedwards` was located by handle probing in batch
01 and excluded for having no usable entry video. That exclusion stands.

**Every one of the four attempted rescues succeeded.** On this sample the
handle-only path missed three real channels it should have found. Full
records in `data/handle-rescues.json`.

### Batch 03 — the creativity domain

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@TheFutur` | The Futur, 2,270 uploads, 1M–5M | Its own description is "business strategy, personal branding, and how to scale your creative services" — pricing, selling, positioning. That is a business channel for designers, not a graphic-design channel. Belongs in a business/freelancing batch, not this one. |
| `@DesignCourse` | DesignCourse (Gary Simon), 1,495 uploads | Real UI/UX history, but the recent 200 uploads are dominated by AI-tooling commentary and demos rather than interface craft. Mapping it to `ui-ux-design` on the strength of the back catalogue would misdescribe what a viewer finds today. Revisit if the output shifts back. |
| `@Mizko` | Mizko, 204 uploads, AU | Same problem: a UX background, but the current catalogue is founder/career/AI content. Not enough interface-craft output to support the mapping. |
| `@PatFlynn` | Pat Flynn, 1,003 uploads | Known for podcasting, but the catalogue is online-business and passive-income content. Halo effect avoided. |

Handles probed in batch 03 that resolve but are **empty or the wrong
entity**:

| Handle tried | What the API actually returned |
| --- | --- |
| `@FlyingSaucer` | "Flying Saucer Draught Emporium" — a bar. Nothing to do with design. |
| `@SeanTucker` | "Sean Tucker-Loves-a-Vid" — not the photographer of that name; dropped rather than assumed. |
| `@tomheaton` | A 1-video channel. The photographer is `@ThomasHeatonPhoto`. |
| `@RogerLove` | 1 video. `@Vocalist` is a 6-video Polish channel. |
| `@drawabox`, `@youmustlisten`, `@TheDesignTribe`, `@LoganKenesis`, `@howtodrawcomics`, `@BobbyDuke` | All resolve, all have **0 videos**. |

## Unverified

_(none yet — every creator in the dataset so far resolved cleanly, and
every entry video passed the attribution gate.)_

### Batch 04 — the learning domain

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| ~~`@DreamingSpanish`~~ | Dreaming Spanish, 804 uploads, 500k–1M | **No longer excluded.** Declares `es` audio because it teaches Spanish *in* Spanish by comprehensible input. Originally excluded under rule 5 and flagged to the owner rather than quietly exempted; the owner then granted language-acquisition categories a named exemption, since target-language immersion is the pedagogy rather than a language mismatch. Re-verified through the identity gate and included in batch 04 with a `languageNote`. See rule 5 in CLAUDE.md. |
| `@Langfocus` | Langfocus, 486 uploads, 1M–5M | Comparative linguistics — whether Arabic speakers can read Persian, how Modern Hebrew differs from Biblical. Fascinating, and not about learning a language. Mapping it to `language-learning` would be a halo. |
| `@MedSchoolInsiders` | 485 uploads, 196 of 200 in the 3–19 min band | Well made, but the catalogue is medical-specialty and career strategy, not exam technique. Nothing found to support an `exam-preparation` mapping. |
| `@StudyWithJess` | Study With Jess, 675 uploads | Was a study-skills channel; has pivoted. 195 of the last 200 uploads are under two minutes and the bio now describes keynote work on resilience and career purpose. No current exam-preparation content. |
| `@AnthonyMetivier` | Resolves, 0 videos | Ran through `resolve-creator.mjs` with affiliations "Magnetic Memory Method", "memory palace". Nothing passed the identity gate. The exclusion stands. |

**`exam-preparation` is the one learning category still empty** after this
batch. Not padded — no candidate researched so far has a body of work that
supports it. Targeted for batch 05.

## When the obvious handle fails: the fallback search path

A person's obvious handle failing is **not** grounds to drop them. Before
an exclusion is logged, `scripts/resolve-creator.mjs` must have run the
second path: search the person's name paired with each thing uniquely
associated with them — a book title, the firm they founded, their
organisation, "official channel".

The gate does not move. A channel merely *named* after the person fails;
its own description or its recurring upload titles have to tie it to
them. Only after both paths fail does the exclusion stand.

Every case where the fallback was the path that found the real channel is
recorded in **`data/handle-rescues.json`**, so the rate at which the
first attempt alone would have missed someone is visible rather than
guessed at.

## Live-data drift

Titles are not stable. Between two runs of `gate-check.mjs` a few days
apart, Charisma on Command renamed `-pkR_NCptqg` from "The Only Video
You Need On Small Talk" to "How to Not Suck At Small Talk". The video id
never changed and the gate caught the mismatch. **Re-run
`scripts/gate-check.mjs` over every batch before any release** — a
stale title in the dataset is a small lie, and it is the kind that
compounds.
