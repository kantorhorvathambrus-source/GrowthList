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
| `@chrisvoss` | **The Chris Voss Show** — a US interview/book podcast with **10,150 uploads** | Not the FBI negotiator of the same name. Every recent upload is titled "The Chris Voss Show Podcast – <guest>". A name match is not an identity match; no channel for the negotiator was found. |
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
| `@ScienceOfPeople`, `@ChrisVossOfficial`, `@BlackSwanLtd`, `@jordanharbinger`, `@robertcialdini`, `@influenceatwork`, `@intelligencesquared`, `@CambridgeUnionSociety`, `@manager-tools`, `@RyanHoliday`, `@ShaneAParrish`, `@MattAbrahams` | Do not exist. Where a real channel was found under a different handle it is in the dataset; otherwise the candidate was dropped rather than guessed at. |

## Unverified

_(none yet — every creator in the dataset so far resolved cleanly, and
every entry video passed the attribution gate.)_

## Live-data drift

Titles are not stable. Between two runs of `gate-check.mjs` a few days
apart, Charisma on Command renamed `-pkR_NCptqg` from "The Only Video
You Need On Small Talk" to "How to Not Suck At Small Talk". The video id
never changed and the gate caught the mismatch. **Re-run
`scripts/gate-check.mjs` over every batch before any release** — a
stale title in the dataset is a small lie, and it is the kind that
compounds.
