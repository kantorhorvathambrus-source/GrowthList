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

### Batch 07 — the programming domain

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@n3t_n1nj4` | "NET NINJA", 18 uploads | **A bass fishing channel.** It outranked the real Net Ninja (2,812 uploads, web development) in the affiliation search, because a two-word brand name matches anything. Caught by the ambiguity flag before anything was written, and the resolver now also warns on scale mismatch. |
| `@GitKraken` | GitKraken, 779 uploads, <100k | Vendor channel for a Git client. It does contain real Git-command content, but 112 of the last 200 uploads are under two minutes and the long-form is product webinars. Making a tool vendor the *only* creator in `git-and-version-control` would misrepresent the category. |

**`git-and-version-control` ships empty from this batch**, on the same
principle that left `exam-preparation` empty in batch 04 until a proper
candidate appeared in batch 06. A vendor funnel is not a teacher.

Handle traps found and resolved by the fallback in this batch:
`@ContinuousDelivery` and `@TheNetNinja` do not exist; the real channels
are `@modernsoftwareengineeringyt` (identity confirmed — its own
description names Dave Farley as host) and `@netninja`. Both required
hand-verification because the search returned ambiguous rankings.

### Batch 08 — the productivity domain

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@zapier` | Zapier, 3,864 uploads | Vendor channel for an automation product. Same call as GitKraken in batch 07: real content exists, but a tool vendor cannot be the sole creator in `workflow-automation` without misrepresenting the category. |
| `@chandootalks` | "Chandoo Talks", 1,414 uploads, IN | A lifestyle vlogger — home organisation, cooking, product reviews. Larger than the real `@chandoo_` (603 uploads, Excel and analytics), which is a useful reminder that **upload count is a warning signal, never a decider**. |
| `@CarlPullein` | "Mikel Arteta", 1 upload | Name trap. The real channel is `@carl_pullein` with 1,354 uploads — found by the affiliation fallback on "Time Sector System", his own published method. Rescue #8. |

**`workflow-automation` and `goal-setting` ship empty from this batch**,
alongside `git-and-version-control` from batch 07. Vendor channels and
adjacent-but-not-quite creators were both available; neither was taken.

### Batch 09 — fitness (first pass, 8 of 14 categories)

Handle traps found this batch, all with near-empty channels standing in
front of the real ones:

| Handle tried | What it actually is | Real channel |
| --- | --- | --- |
| `@SeanNalewanyj` | 2 uploads | `@sean_nalewanyj`, 672 uploads |
| `@TonyJeffries` | 3 uploads | `@tony_jeffries`, 1,212 uploads |
| `@DrIdz` | "Mvnko", 0 uploads | not resolved — exclusion stands |
| `@precisionstriking` | 0 uploads | not resolved |
| `@KeenanOnline` | 13 uploads | not resolved |

Two results the resolver refused to hand over, correctly:

- **Tony Jeffries** — `@tony_jeffries` (1,212 uploads, English) tied with
  `@tonyjeffrieshindi` (277 uploads, Hindi). Flagged ambiguous rather
  than picked. The Hindi channel would fail rule 5 regardless.
- **Magnus Midtbø** — the affiliation search ranked his real channel
  `@magmidt` (481 uploads) **last**, below unrelated climbing channels,
  because the affiliations supplied were topic words. A live
  demonstration of the affiliation-quality rule in CLAUDE.md: "climbing"
  is not an identifier. Not recorded; needs a re-run with a distinctive
  term.

**Fitness is 8 of 14 categories, not complete.** Still empty:
`powerlifting`, `running`, `mobility-and-flexibility`, `yoga`,
`boxing-and-striking`, `home-workouts`. Candidates exist and were
probed; they simply were not researched in this batch. That is
unfinished work, not a documented gap.

### Batch 11 — health (first pass, 10 of 14 categories)

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@DrEricBerg` | "Dr. Berg - официальный русскоязычный", 2,731 uploads, 5M–20M | **A Russian-language channel.** The handle most people would try leads to his Russian-language presence, which fails rule 5. His English channel was not pursued: his catalogue is heavily contested-claims territory and there are better-credentialed candidates in every category he touches. |
| `@examinecom` | Examine.com, 8 uploads | Real and highly regarded as a text resource, but eight videos is not a channel. Nothing to map. |
| `@AlcoholMastery` | 1 upload | Empty. `addiction-recovery` remains unfilled rather than filled with this. |
| `@dietitian`, `@ThomasDeLauer` | 3 and 0 uploads | Empty or near-empty handles. |
| `@DrJenGunter` | 32 uploads, <100k | Real, well-credentialed, but too thin a catalogue to support a mapping in any of the health categories. |

**Health is 10 of 14.** Still empty: `fat-loss`, `sports-nutrition`,
`gut-health`, `addiction-recovery`. `@abbeysharp` did not resolve on the
obvious handle and is the priority target for the first three — the
affiliation fallback has not been run on her yet. Unfinished, not
decided.

### Batch 12 — addiction-recovery under rule 12, and the career domain opened

`addiction-recovery` is the project's **first documented thin gap**
(`data/thin-gaps.json`). It ships at 2 creators, not 5, deliberately.

Rejected on **conflict of interest rather than quality**:

| Handle | What it is | Why rejected |
| --- | --- | --- |
| `@TheRecoveryVillage` | A physician-led rehab chain, 760 uploads | The credential is real, but a company that profits from admissions publishing guidance about seeking treatment is the textbook conflict rule 12 exists for. |
| `@AllenCarrsEasyway` | Commercial cessation method, 719 uploads | 172 of 200 uploads under two minutes, no clinical credential, and its own description claims 50 million users — marketing, not evidence. |
| `@NIDAnews` | An unrelated Arabic-language news channel | Handle trap. |
| `@AlcoholMastery` | 1 upload | Empty. |

Other batch-12 exclusions:

| Handle | Why |
| --- | --- |
| `@BigInterview` | 196 of 200 uploads under two minutes — a training-product funnel with almost no substantive video. Same call as GitKraken and Zapier. |
| `@DrGraceLee` | 1,049 uploads, describes herself as "neuroscientist and executive mentor". Career-influence advice framed on a neuroscience credential, with no evidence the advice derives from that research. Credential-borrowing, so left out pending a closer look. |

**The Futur returns.** Excluded from `graphic-design` in batch 03 as "a
business channel for designers, not a graphic-design channel" — and it
is now the right creator for `freelancing` and `consulting`, exactly
where that note predicted it belonged.

### Batch 13 — career (10 of 13)

| Handle | What the API returned | Why it was excluded |
| --- | --- | --- |
| `@advicewitherin` | AdviceWithErin, 977 uploads, 1M–5M | 191 of 200 uploads under two minutes, only 2 past twenty. Real career advice, but almost no substance to point at — the same thin-content standard as GitKraken and Big Interview. |
| `@LennysPodcast` | 1,782 uploads, 500k–1M | Substantial long-form, but the episodes are named after guests and the subject is product management rather than any career category here. No mapping the evidence supports. |
| `@TheRemoteJobCoach`, `@MattMochary` | 0 uploads each | Empty. `remote-work` stays unfilled rather than take these. |

Three career categories remain: `career-change`, `remote-work`,
`workplace-politics`. Unfinished, not decided.

**Manager Tools was extended rather than duplicated.** It was already in
batch 02 for `giving-feedback` and `difficult-conversations`; its
two-thousand-episode archive genuinely covers one-to-ones, delegation
and meeting prewiring, so three mappings were added to the existing
record with their own evidence and entry videos. Adding a second
management creator to cover ground this one already covers would have
been padding.

### Batch 14 — tech (8 of 11)

Three categories left open: `prompt-engineering`, `building-with-llms`,
`data-literacy`. Unfinished, not decided — the AI-tooling categories in
particular move fast enough that candidates need a fresh look rather
than a guess.

`@simonclark` was probed for `data-literacy` (PhD atmospheric physics,
climate-literacy channel, 707 uploads) and set aside: 31 of 50 recent
uploads are under two minutes, and the subject is climate science rather
than reading charts and studies critically. Adjacent, not the category.

First use of the **`commercial-conflict`** signal added in batch 12:
Lawrence Systems is a managed IT provider recommending tooling it sells
and deploys, and NetworkChuck trains for a certification company while
advising on what certifications to pursue. Both are disclosed on their
own channels; both are included with the signal and a caveat rather than
excluded, which is rule 13 working as intended.

### Batch 15 — money (9 of 12), and a first grounded read on the domain

Open: `debt-payoff`, `real-estate-investing`, `insurance-basics`.

**Supply finding, since the owner asked for a grounded view before
cutting anything here:** money is the best-credentialed domain
researched so far. CFA charterholders, licensed portfolio managers, a
practising financial planner and an NYU finance professor all publish
seriously, at length, for free. That is the opposite of what I expected,
and it argues against cutting money categories on supply grounds.

The domain also splits hard by jurisdiction in a way no other domain
does. Ben Felix and The Plain Bagel are Canadian; James Shack and
PensionCraft are UK; Two Cents is US. Tax wrappers, pensions, credit
scoring and account types are not transferable, so several money
categories may need creators per jurisdiction rather than five in total.
Worth the owner knowing before the final coverage assessment.

Deliberately not taken:

| Handle | Why |
| --- | --- |
| `@GrahamStephan`, `@AndreiJikh`, `@MinorityMindset` | Large channels, but the recurring content is wealth-signalling and real-estate promotion, and several run paid programmes on the strategies being advocated. Not excluded on conflict — under rule 13 that would be a `commercial-conflict` signal — but on content: the substantive teaching is thin relative to the promotion. |
| `@CalebHammer` | 4,772 uploads of confrontational audits of individuals' finances. Genuinely popular, and it is entertainment built on other people's distress rather than instruction. |
| `@TheRamseyShow` | 11,574 uploads. A single prescriptive method presented as the answer, with well-known disagreement from the evidence-based end of the field. Would need `contested-claims` and `strong-ideological-frame`; deferred rather than rejected, and it would suit `debt-payoff` if taken. |
| `@ErinTalksMoney` | 169 of 200 uploads under two minutes. Thin. |
| `@ClearValueTax`, `@RobBerger`, `@TheMoneyGuyShow` | 0, 1 and 0 uploads — handle traps. The real Money Guy Show is `@MoneyGuyShow`. |

### The marketing domain — an evidenced finding, not a prediction

The owner asked for a second pass at the practitioner end before cutting
anything, and specifically raised the possibility that marketing's best
work is not in video at all. **That is close to what the evidence
shows, with one important qualification.**

Independent practitioner channels, by upload count:

| Practitioner | Standing | Uploads |
| --- | --- | --- |
| Rand Fishkin | founded Moz, then SparkToro | **1** |
| Aleyda Solis | independent SEO consultant | **10** |
| Ann Handley | marketing-writing author | **15** |
| Byron Sharp | academic behind *How Brands Grow* | **0** |
| Julian Shapiro | growth writer | **0** |
| Adam Erhart, Rory Vaden | marketing educators | **0** each |

Channels with real volume, by owner:

| Channel | Uploads | What it is |
| --- | --- | --- |
| Moz | 1,130 | SEO software vendor |
| Think with Google | 966 | Google's own ads-education arm |
| Kit (ConvertKit) | 812 | email platform vendor |
| StoryBrand | 509 | a framework consultancy selling that framework |
| Ahrefs | 420 | SEO software vendor |
| SparkToro | 89 | audience-research tool vendor |

**The qualification matters.** The independent voices are not absent
from video — they appear as *guests on vendor-hosted series*. Moz's
Whiteboard Friday is the clearest case: a weekly slot given to a
different named external practitioner each week, which is closer to a
rolling conference than to product marketing. So the honest finding is
not "the good material is not in video" but something more specific:

> **In marketing, the practitioners publish text and the vendors publish
> video. Where practitioner thinking does reach video, it is almost
> always on a platform owned by a company selling tooling for the thing
> being discussed.**

The practical consequence is that filling the marketing domain to
standard is possible, but nearly every creator in it will carry a
`commercial-conflict` signal — which under rule 13 is a disclosure
rather than a disqualification, but is a real characteristic of the
domain and should be stated on the category pages rather than discovered
by a visitor.

**Recommendation: do not cut the marketing categories.** The content
exists. What does not exist is a conflict-free version of it, and that
is a fact about the industry rather than a gap in our research. The
categories most at risk remain `affiliate-marketing` and
`cold-email-outreach`, where the supply is course-sellers rather than
tool vendors — a worse position, and one I would still expect to end as
documented gaps.

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

## Batch 17 — relationships: excluded, with reasons

**Excluded on content, not on conflict.** Each of these resolved to a real
channel that is genuinely the person, and was then read.

- **Jimmy on Relationships** (`@jimmyonrelationships`, 1M–5M, 774 uploads).
  Large, and the long-form is substantial — nineteen videos over twenty
  minutes in the scanned two hundred. Excluded because the framing is the
  thing `attachment-styles` is defined against: the recurring titles sort
  people into narcissists, trauma bonds and avoidants as fixed types
  ("I kept Attracting Narcissists until I did THIS", "How to Detach from a
  Trauma Bond"). The category blurb asks for the labels *not* to be used as
  a personality test, and this catalogue is built on using them that way.
  No credential; the channel's own description gives the origin as his own
  affair and its aftermath.
- **Dr. Kim Sage** (`@DrKimSage`, 100k–500k, 718 uploads). A licensed
  clinical psychologist in California, so the credential is real. Excluded
  on the shape of the catalogue: it is a self-diagnosis funnel — "10 signs
  you have 'traumatic intelligence'", "6 signs you're a high-masking
  autistic woman with ADHD", "10 signs you're too alert". Inviting a
  viewer to self-identify with clinical categories from a list of signs is
  the failure mode `therapy-literacy` exists to guard against, and a
  credential does not offset it.
- **Janet Lansbury** (`@janetlansbury`, 45 uploads). The RIE parenting work
  is well regarded and it is almost entirely *not on YouTube*: of 45
  uploads only one runs eight minutes or more, and the median is two. Her
  actual body of work is a podcast. This is the same finding as the
  marketing pass — where a practitioner publishes outside video, the
  honest answer is to say so rather than list a channel that does not
  carry the work.

**Handle traps caught by probing.** Each of these resolved to *something*,
which is exactly why the handle is never trusted on its name alone:

- `@thecoachlee` → "Bald History", 0 uploads. A name collision.
- `@PositiveParentingSolutions` → a British creator, not Amy McCready's US
  organisation. A name match is not an identity match.
- `@TheSecureRelationship` → Julie Menanno, but 6 uploads — below the
  ten-upload floor for a working presence, so not her real channel or not
  yet one.
- `@matthewhussey` (1 upload), `@drbeckyatgoodinside` (1), `@LisaDamour`
  (3), `@gettheguy` (a different person entirely), `@alanrobarge` (0),
  `@PositiveApproachtoCare` (0), `@LovingBravely` (0). The real channels
  for Hussey and Kennedy were found at `@TheMatthewHussey` and
  `@goodinside` and are listed; the others were not found.

**No channel found** for Terri Cole's obvious handles (the real one is
`@terri_cole` and she is listed), Nedra Tawwab, Lisa Damour, John Delony,
Mark Manson, Julie Smith, Teepa Snow and Cinema Therapy.

**Not researched to a decision this batch**, and still open:
`@TheHolisticPsychologist` and `@CrappyChildhoodFairy` — both large, both
carrying contested-claims risk that needs reading rather than a guess.

## Batch 18 — practical: what was left out and why

Four of the thirteen practical categories are still empty, and the
reasons differ:

- **`first-aid`** — **searched to a decision; now a documented gap and a
  rule 12 category** (owner-confirmed after batch 19). Thirteen handles
  probed across the certifying and public-health bodies. The finding is
  structural rather than incidental: **these organisations use YouTube
  for campaigns, not instruction.** British Red Cross — 502 uploads,
  median one minute, and its only three long-form videos are about
  listening and social division. American Red Cross (`@redcross`, 2,180
  uploads) — the long-form is blood-donation interviews. NHS — 478
  uploads, one long-form video, a BSL winter-health leaflet. `@sja` has
  5 uploads, `@ProTrainings` 5, `@firstaidforfree` 20.
  The reason is defensible rather than negligent: certification requires
  hands-on assessment, so the course is the product and video is its
  marketing. Full entry in `data/thin-gaps.json`.
- **`travel-planning`**, **`camping-and-outdoor-skills`**,
  **`personal-style-and-grooming`** — candidates probed and resolved
  (`@NoraDunn`, `@TheOutdoorGearReview`, `@Gentlemansgazette`,
  `@audreycoyne`, `@realmenrealstyle`, `@beardbrand`) but not yet read
  closely enough to write up. Unfinished research, not a decided gap.

**Handle traps this batch:** `@ChrisFixIt` resolves to a 0-upload channel
called "Chris_Fix_it"; the real one is `@ChrisFix`. `@WolterWorld`, 0
uploads. `@TheFoodTheory`, 3. Probed and dropped rather than guessed at.

**Commercial interest disclosed rather than used as an exclusion**
(rule 13): Park Tool is a tool manufacturer teaching you to use its own
tools, and This Old House is a commercial television brand. Both carry
the conflict on the card. Applying the test — would this be included if
a non-profit ran it? — the answer for both is plainly yes, because the
instruction is sound and the conflict is visible in the video itself.

## Batch 19 — philosophy: the instructive exclusion

**Hans-Georg Moeller / Carefree Wandering** (`@carefreewandering`, 86
uploads, median 23 minutes) is a professor of philosophy at the
University of Macau and one of the better-known Western scholars of
Daoism. On credentials alone he would be the obvious first pick for
`eastern-philosophy`.

He is not listed, because his channel is not about that. A keyword scan
of **all 86 uploads** for Daoism, Taoism, Zhuangzi, Laozi, Confucian and
Chinese returned **zero long-form hits**. The channel is contemporary
social philosophy — identity, profilicity, AI, German politics. His
Daoism work exists in books and university lectures, not here.

This is rule 4 doing the job it exists for. Mapping him to
`eastern-philosophy` would have been a mapping made from a CV rather than
from a body of work, and it is exactly the shape the halo effect takes
when the credential is real.

**Handle traps:** `@philosophyoverdose` resolves to a 2-upload channel
called "IKEBANA CHRONICLES"; `@Einzelgangermusic` to a 10-upload channel
under a different name (the real one is `@Einzelganger`);
`@unsolicitedadvice`, `@DougSmith`, `@closertotruth`,
`@HistoryofPhilosophy` and `@absurdbeing` all resolve to channels with
0–1 uploads. Seven traps in one domain.

**Read and set aside:** `@thelivingphilosophy` (100k–500k, IE) has real
long-form but the recent catalogue drifts steadily into Jungian and
esoteric territory — metashamanic Nietzsche, menstrual futurism — which
is a different thing from the philosophy this domain's categories
describe. `@academyofideas` and `@DailyStoic` are both large and both
carry a strong frame that needs reading before a judgement, not a guess.

**Critic gap:** philosophy has no critic, and the obvious shape of one —
somebody taking apart commercialised Stoicism, which the `stoicism`
blurb explicitly warns about — has not turned up. Weltgeist's "Self-help
is dead. Read this instead." is the nearest thing and it is one video,
not a body of work. Left empty under rule 11.

## Batch 20 — business and marketing: the text-not-video finding, measured

The batch-16 marketing finding was that independent practitioners in
this field publish in newsletters and blogs, and the video supply is
vendor-hosted. Batch 20 probed it directly and it held, with numbers:

- **Harry Dry (Marketing Examples)** — arguably the best-known
  independent copywriting practitioner working today. `@marketingexamples`
  resolves. **Four uploads.** His work is a newsletter.
- **Seth Godin** — `@sethgodin`, **seven uploads**.
- `@copyhackers`, `@backlinko`, `@CXLInstitute`, `@HubSpot`,
  `@KlaviyoHQ`, `@JebBlount` — **none resolve at all.**

What does resolve at scale in marketing is, without exception, a vendor
or an agency: Semrush, Ahrefs, Moz, Exposure Ninja, Neil Patel. The
measured result is now on the record: **`commercial-conflict` in
marketing is 5 of 6, 83%** — the editorially-written standing note has
been confirmed by measurement rather than left as a prediction.

**`copywriting` is therefore still empty and this is why.** It is not
that the category was skipped. It is that the discipline's best
practitioners have made a deliberate choice not to work in video, and
the alternative is listing an agency selling copywriting services under
a category about learning to write. Not yet logged in `thin-gaps.json`
because the search is not finished — the vendor end has not been read to
a decision.

**Handle traps:** `@productschool` → "Werner Müller", 1 upload. `@SVPG`
→ "Thomas Traveler", 0 uploads. `@SMBSuccess` → a Korean-language
channel. `@Paramedic` → a Russian travel channel. `@AdamErhart`, 0
uploads. Five more in one batch.

**Two gate catches worth recording**, both of which would have shipped
as small lies:
- MicroConf's growth-ceiling talk has **embedding disabled**, so the
  play button would have done nothing. Replaced with a different entry
  video from the same channel.
- I completed a truncated Exposure Ninja title as "…How You Rank". The
  API says "…How You Show Up in Search". This is exactly the failure
  mode rule 3 exists for, and it happened again on batch 20 — titles get
  **copied from the API, never completed from context**.

## Batch 23 — the marketing finding, tested and partly falsified

Rule 18 says a structural finding must survive a deliberate attempt to
disprove it. Batch 23 was that attempt for the marketing text-not-video
claim, and **the strong form of it did not survive.**

Three independent practitioners publishing substantially in video:

- **Alex Cattoni** — 848 uploads, 25 long-form in the recent 200, a
  median around 11 minutes, and a genuine beginner's introduction to
  copywriting. She is a working copywriter, not a vendor or an agency.
- **Pat Flynn** — four affiliate workshops of 70 to 85 minutes.
- **30 Minutes to President's Club** — working B2B sellers publishing
  full sequences with reply rates, 15 of 50 recent uploads over 20
  minutes.

None of the three carries `commercial-conflict`, and adding them moved
the measurement from **5 of 6 (83%) to 6 of 9 (67%)** — below the
saturation threshold. **The marketing standing note has been retired**,
with its full arc kept in `data/domain-notes.json` rather than deleted:
written editorially at n=2, confirmed at n=6, falsified at n=9.

**What still stands** is the weak form, and it is still evidenced: Harry
Dry has 4 uploads, Seth Godin has 7, and copyhackers, backlinko, CXL,
HubSpot and Klaviyo do not resolve. The SEO end of this domain really is
vendor-hosted. What is false is the generalisation from those cases to
the discipline as a whole.

**The lesson is about the order of operations, not about marketing.** The
original finding was made after probing the SEO end, where the vendor
pattern is real, and then extended to a domain that had never been probed
at its copywriting and sales end. Three batches later the extension was
tested and failed. Nothing was wrong with the observation; what was wrong
was treating a finding about one part of a domain as a finding about the
domain.

**Rejected this batch:** `@markpollard` (49 uploads, archived since 2023,
and its single long-form video is about a car part rather than brand
strategy), `@amyporterfield` (1,342 uploads but 40 of the recent 50 are
under two minutes, and the long-form is a course funnel).
`brand-strategy` and `conversion-optimization` remain empty with no
candidate found — unfinished, not decided.

## Batch 24 — the rule 18 audit of every standing structural finding

The owner asked for rule 18 to be run against the structural findings
still on the record, particularly any documented gap resting on "the
supply does not exist" rather than "the supply exists and fails our bar."

**Result: one of two absent-supply findings was falsified, by the same
failure mode as the marketing note.**

### `first-aid` — FALSIFIED and rewritten

Thirteen probes had produced the gap, and **every one of them was an
institution**: Red Cross, NHS, St John Ambulance, ProTrainings, First
Aid For Free. The individual-clinician end was never searched. Searching
it found **PrepMedic** immediately — a critical-care flight paramedic
with 353 uploads and 44 long-form videos matching bystander first-aid
terms, including a 33-minute explanation of life-saving medications
aimed explicitly at bystanders and a check of a viral haemostatic spray
against the published science. He is now listed.

The narrower claim survives and is still evidenced: **the certifying
bodies do not teach on video**, for the defensible reason that
certification requires hands-on assessment. What was wrong was
generalising from that to the whole field. `gapCause` moves from
`absent-supply` to `mixed`, and the entry carries a `corrected` field
saying so rather than being quietly edited.

### `addiction-recovery` — SURVIVED

Tested the same way, at the end that had not been probed: credentialed
addiction clinicians rather than treatment providers or recovery
testimony. `@AddictionMedicine` is the American Society of Addiction
Medicine — 49 uploads, **archived since February 2021**, and the
long-form is conference plenaries addressed to physicians rather than to
anyone in recovery. `@DrKAddiction`, `@DrAdiJaffe`, `@gabormate`,
`@recoveryelevator` and `@sobrietyengine` do not resolve;
`@Dr_Gabor_Mate` resolves to a Czech channel with one upload. The gap
holds, and now holds having been tested rather than assumed.

### The two categories the owner flagged were already filled

`affiliate-marketing` and `cold-email-outreach` were predicted to fail on
the same reasoning that collapsed — but batch 23's disconfirmation
attempt reached them first. Both are populated (Pat Flynn; 30 Minutes to
President's Club) and neither was ever written up as a gap. Worth stating
plainly: the prediction was right about the reasoning and wrong about the
outcome, because the reasoning had already been corrected.

**Score for rule 18 across two batches: two findings tested, both were
scope errors of the same shape, both caught. One finding tested and
survived.** The rule's value is not that it produces new creators — it is
that a finding nobody tried to break is indistinguishable from a search
that stopped early.

## Batch 25 — the full rule 18 sweep, and the critic claims tested

The owner's instruction was to run rule 18 against **every** standing
structural claim, not only the flagged ones, and to treat an untested
gap as unfinished. Both are now enforced mechanically:
`data/thin-gaps.json` entries carry
`rule18: { testedAt, subAreas[], probed[], outcome, whatWasTried }`, and
`validate.mjs` fails a gap whose `probed` does not cover its own
`subAreas`.

### Claims tested this batch

**`brand-strategy` — FALSIFIED, category now filled.** The batch-23
claim that no candidate existed came from probing brand *consultancies*
and *individual strategists*, most of which do not resolve. The
never-searched end was training businesses that interview practitioners.
Brand Master Academy is there: 39–63 minute conversations with April
Dunford, Bobby Moesta, Blair Enns and Laura Ries, plus a repositioning
case study. Listed.

**`conversion-optimization` — SURVIVED, and written the right way round.**
This is the first gap documented *after* the two corrections, so all
four sub-areas were probed before the claim was made rather than after:
consultancies (`@speero` 0 uploads, `@Widerfunnel` 2,
`@conversionrateexperts` 0), tool vendors (Optimizely 106 uploads with 2
long-form; AB Tasty 97 with 4, all webinars), independent practitioners
(none resolve), and behavioural science. `@cxl` is a handle trap
resolving to an unrelated Arabic-language channel with 4,529 uploads.
**The near-miss is recorded rather than used:** Nudgestock, Ogilvy's
behavioural science festival, has 239 uploads with 20 of 49 over twenty
minutes and speakers including Charles Spence and Roger Martin. It is
genuinely good and it is *not* conversion optimisation — behaviour
change and creativity are adjacent, not the same. Mapping it would have
been the credentialed halo effect in a new dress.

**The relationships critic gap — SURVIVED.** The end never searched was
credentialed clinicians who critique the mental-health content industry.
Mickey Atkins is the near-miss: a therapist and social worker, 595
uploads, median 74 minutes, with a substantive 37-minute debunk of Dr.
Amen and a critique of televised couples therapists. She is not listed,
and the reason is rule 11 rather than quality — her critical work is a
small part of a very long catalogue that is mostly reality-television
commentary and a running feud with a political commentator, so as a
*critic slot for relationships* she would be thin. `@DrToddGrande` and
`@unlearningtherapy` do not resolve. Dr Syl is a psychiatrist with real
explainers but is a specialist, not a critic.

**The philosophy critic gap — SURVIVED.** Philosophy Tube was the
strongest untested candidate: 1M–5M, 15 of 50 recent uploads over twenty
minutes. Read, and rejected on subject rather than quality — the
long-form is political and social essay (conversion therapy, birth
rates, colonialism), not criticism of philosophy content or of the
self-help use of philosophy. `@cuckphilosophy` does not resolve. The
Living Philosophy drifts into Jungian and esoteric territory.

### Score across three batches

Five structural claims tested. **Three falsified** — marketing
text-not-video, first-aid absent-supply, brand-strategy no-candidate —
**all three the same scope error**: a finding from one end of a domain
applied to ends never searched. **Four survived**: addiction-recovery,
conversion-optimization, and the two critic gaps.

A test that falsifies everything is not a test. A test that falsifies
three of seven, all in one direction, is a measurement of a specific
habit.

## Batch 27 — the inward sweep

The owner's point, and it is sharper than the correction that prompted
it: rule 18 had been pointed **outward** — at domains, supply,
categories. The two failures that reached visitors pointed **inward**, at
claims about our own process. Those feel settled precisely because they
are about us.

Every self-description in `CLAUDE.md`, the colophon and the footer was
run as a query.

### FALSIFIED — "typically two to four skills per creator"

Stated on the colophon and as the default in rule 4. The actual
distribution:

| mappings | creators | share |
|---|---|---|
| 1 | 121 | 62% |
| 2 | 61 | 31% |
| 3 | 12 | 6% |
| 4 | 1 | 1% |
| 5 | 1 | 1% |

**Median 1, mean 1.47. Only 38% fall inside the claimed band.** The ratio
was 1.58 at 143 creators and has drifted *down* since — the claim got
steadily more wrong and was never re-run. Rule 4's "2–4" was always a
design intent; the error was restating an intent to visitors as a
description. The colophon now says most creators appear under one skill,
and **computes the median rather than asserting it**.

### SURVIVED — everything else, and it is worth listing what was checked

- Every creator record `verified: true` — **196 of 196.**
- Every creator carries a size band and the month it was taken — **196 of
  196.**
- Every mapping has an attributed entry video — **288 of 288.**
- No creator over four `primary` mappings, or over six total — **0
  violations.**
- "No affiliate links anywhere on this site" — no affiliate or tracking
  parameter appears in any shipped file. The only outbound hosts
  referenced anywhere in the code are `youtube-nocookie.com` and
  `youtube.com`.
- "We set no cookies and run no analytics" — true, and no third-party
  beacon of any kind. **But incomplete:** the site does use
  `localStorage` and `sessionStorage` for plan progress and for
  dismissing the survey prompt. Not a cookie and never sent anywhere,
  but a visitor reading "no cookies" would not expect it. **The footer
  now says so.**

### The five checks are now tests, not prose

`validate.mjs` asserts each self-description against the data. If the
data stops matching the copy, the build fails rather than the copy
quietly becoming false. The uniform-versus-spread detector is also
enforced: any entry marked `cause: "selection"` whose signal varies more
than 50 points across domains fails, because a rule of ours produces
near-uniformity and a fact about the world produces variance.

**Ledger: 9 claims tested, 5 falsified. Two of the five were
inward-facing, and both were live on the site.**

## Batch 28 — the enforcement caught its own author

The owner's addition to the inward class: a number that came from a
**spec** rather than a query must be marked at the point it is written,
because a target and a description are the same sentence once the design
document is a few weeks old. Rule 4's "2–4 categories" never changed —
only its job did.

Implemented: measured numbers in visitor copy are computed at render and
cannot decay; target numbers carry a hedge that tells a reader they are
an intention. `validate.mjs` fails a modal count written as a literal.

**And then the new enforcement immediately falsified a claim written one
exchange earlier.** The footer said the browser keeps **two** things
locally. The code writes **five** distinct stores: theme preference, plan
progress, categories seen this session, whether the form endpoint exists,
and the survey dismissal state.

The cause is exactly the pattern named two batches ago, at the smallest
possible scale: **I grepped `localStorage` and never looked at
`sessionStorage`.** One sub-area probed, a claim made about both.

The fix is not a corrected count — a count decays the moment a sixth
store is added. The footer now names the *kinds* of thing stored, and
`validate.mjs` holds a registry mapping every store in the code to a
described kind. A new store fails the build until the footer is updated,
and a count reappearing in that sentence fails too.

**Ledger: 10 claims tested, 6 falsified.** Three of the six were
inward-facing. The most recent was caught by a check written in the same
batch, minutes after it existed — which is the argument for enforcement
over care.

## Batch 29 — business and productivity, with three rejections worth naming

Two creators listed: Shopify Masters (`ecommerce`) and n8n
(`workflow-automation`). Both are vendor channels, both included with the
conflict on the record under rule 13, and in both cases the reason is
that the substance survives the test — would this be listed if a
non-profit ran it? Yes: twenty-one long-form founder case studies in one,
twenty-five long-form builds in the other.

**Rejected, and the reasons differ:**

- **The Operations Room** (`@TheOperationsRoom`, 1M–5M, 211 uploads) —
  a complete name collision. It is a **military-history animation
  channel**: Pearl Harbor, Midway, Operation Anaconda. Probed because
  the handle looked exactly like an operations-and-process channel.
- **MyWifeQuitHerJob** (`@MyWifeQuitHerJob`, 500k–1M, 1,247 uploads) —
  Steve Chou is a real ecommerce operator, and the catalogue is not
  teaching. The long-form is opportunity listicles: "8 Claude AI Side
  Hustles That Each Make $100K/Yr", "9 UNSEXY Products Quietly Making
  $10M+ on TikTok Shop". The `ecommerce` category is about sourcing,
  margins and logistics; this is about what to sell this month.
  Rejected on content, not on the commercial interest.
- **SocialTalent** (`@SocialTalent`, 487 uploads) — the channel
  description is a pitch for an AI recruiting product, and only two of
  the fifty recent uploads are long-form, both webinars. The
  `hiring-and-recruiting` category stays empty and **unfinished** —
  the recruiter-practitioner and academic ends have not been probed, so
  under rule 18 this is not yet a documented gap.

**Drift caught by the validator, not by review:**
`productivity/sells-course` fell from 86% to 75% as the domain grew, and
`programming/sells-course` sits at 71%. Both are still above the
threshold; both are now one creator from falling below it. The standing
notes stay for now and the watch note on the programming entry records
why they are being kept rather than defended.

## Batch 30 — Jeff Su rejected, and why the rejection is the point

`journaling` filled with the Bullet Journal channel — the method's
originator, and unusually for the genre almost entirely about the
reasoning rather than the decoration.

**Jeff Su rejected** (`@JeffSu`, 1M–5M, 313 uploads), and this is a
useful case. He is well known for workplace and career content, and
`career-change`, `remote-work` and `workplace-politics` are all empty, so
the pull to map him was strong. A keyword scan of **300 uploads** for
career, promotion, manager, workplace, politics, feedback, meeting, email
and resume returned **one** long-form hit — a resume video, in a category
that already has creators. The catalogue is short-form AI-tool tips.

Reputation said career channel; the body of work said otherwise. That is
rule 4 in its ordinary form, and it is worth logging precisely because
nothing dramatic happened: the scan took one command, and the alternative
was a mapping made from what I remembered about him.

Also probed and rejected: `@Jeff_Su` resolves to a different account with
0 uploads, `@Buffer` to a 0-upload channel called "piozzo", `@AshleyStahl`
to "Ashley Flaman" with 8. Three more name traps.

## Batch 31 — business-strategy, and the collision guard earning its keep

Acquired listed for `business-strategy`. The fit is unusually clean: the
Trader Joe's episode is subtitled *counter positioning* and is genuinely
about why a larger competitor cannot copy a model without damaging its
own, which is the category's question stated exactly. Caveats recorded
plainly — the frame is an investor's throughout, the sponsors include
institutions that also appear as episode subjects, and narrative history
makes outcomes look more inevitable than they were.

**`@StrategyU` rejected, and the new guard flagged it before I read it:**

```
OK  @StrategyU  StrategyU  <100k  US  88 vids
    NAME MATCHES THE CATEGORY TERM (strategy) — more suspicion, not less.
```

Reading the uploads confirmed the warning was worth acting on. Only two
of forty-nine uploads run over eight minutes, and both are about
*consulting careers* — how elite firms run a process, whether case
interviews should exist — not about business strategy. The name matched
the category perfectly and the content did not overlap it at all.

This is the second time in two batches that a channel named after a
category turned out to be about something else. The guard is now doing
the noticing rather than luck.

## Batch 32 — pivot to depth, and three reputation rejections

With the depth goal restated to 3, the higher-yield work is depth in the
180 populated categories rather than the last 17 empties, where supply is
genuinely worst. Batch 32 starts that pass in programming, where 14 of 14
categories sit below 3.

**Rejected, all three for the same reason — reputation without a current
body of work:**

- **Dr. Todd Grande** (`@DrGrande`, 4,102 uploads). Note the handle: an
  earlier batch recorded `@DrToddGrande` as "does not resolve", and the
  real channel was found this batch. He is genuinely credentialed and was
  a plausible relationships critic. The recent catalogue is **true-crime
  case commentary** with tabloid titles. Rejected — and it confirms the
  earlier decision not to force a critic into that slot.
- **Theo / t3.gg** (`@t3dotgg`, 1,150 uploads, 30 of 50 over twenty
  minutes). Known as a web-frontend educator. The current catalogue is
  **AI model commentary and reaction** — "NVIDIA Just Lost Their Lead",
  "Which AI Models Are Worth Using". Rejected for `web-frontend`.
- **Vanessa Lau** (`@VanessaLau`, 588 uploads). Known for social-media
  growth teaching; the channel is now founder vlogs and travel diaries.

Three well-known names, three categories that needed filling, and in each
case the scan settled it in one command. This is the Jeff Su pattern
repeating, which suggests it is the normal case rather than a notable one.

## Batch 33 — the first mapping declined under scope pressure

The Cherno (`game-development`), DevOps Toolkit (`devops-and-ci`),
sentdex (`machine-learning-engineering`). Three creators, three mappings,
**0% second-or-later** — the depth pass is not yet inflating the ratio.

**One mapping was available and declined, which is the number worth
watching.** Viktor Farcic's catalogue covers both delivery pipelines and
Kubernetes/cloud infrastructure, and `cloud-computing` sits at 1 creator.
The evidence for both, though, is *the same ninety-minute question-and-
answer streams* — his subject is platform engineering, which our taxonomy
splits in two. Mapping both would count one body of work twice. That is
the exact pressure rule 15 anticipates once the binding constraint stops
being "is there an empty category" and becomes the scope rule itself.
Recorded in his `caveats` on the live card rather than only here.

**Code Monkey rejected** (`@CodeMonkeyUnity`, 500k–1M, 1,669 uploads).
A professional indie developer and a plausible second game-development
creator. Nineteen long-form videos in 250 uploads, and most are Unity
Asset Store roundups and Steam-marketing interviews rather than teaching.
Median upload length is two minutes.

## Batch 34 — the depth pass is rejection-bound, not effort-bound

Errichto (`algorithms-and-data-structures`), Be A Better Dev
(`cloud-computing`), KodeKloud (`system-design`). Marginal ratio 1.00,
second-or-later share 0%. Three batches into the depth pass the scope
rule is holding and the bar is not drifting.

**But the batch size is not what was targeted, and the reason is worth
stating rather than treated as slowness.** Batches 32–34 probed 40
handles and evidenced 14 channels to list 9 creators. The rejections are
running at roughly two for every three listings, and almost all have one
shape: **a well-known name whose current catalogue is no longer what the
reputation says.**

- **Sean Allen** — 534 uploads, 107 long-form, and *every one* is the
  same weekly iOS news roundup ("X, Y, Z & More"). The Swift teaching
  lives in his paid courses. `mobile-development` stays at 1.
- **Code Monkey**, **Theo**, **Vanessa Lau**, **Dr. Todd Grande** — same
  pattern in the previous batch.
- **`@davegray`** resolves to a *different* Dave Gray — "Possibilitarian
  at School of the Possible", a visual-thinking podcast — not the
  web-development educator. Another name collision, and the sixth in
  four batches.

The honest read on pace: at these standards the depth pass yields three
to four per batch, not eight to ten, because the well-known candidates
in populated categories are disproportionately channels that pivoted.
Getting to eight would mean either loosening what counts as a body of
work, or spending the probe budget on less famous channels — the second
is the right answer and is slower per candidate, not faster.

## Batch 35 — the second mapping that passed the test

Andrej Karpathy (`machine-learning-engineering`, `building-with-llms`)
and Jack Herrington (`web-frontend`). Marginal 1.50, second-or-later
share 33% — the first batch of the depth pass where a creator took two
categories.

**It is worth showing why that one passed where Farcic's failed**, since
these are the two data points the scope-pressure metric now exists to
compare.

Karpathy's two mappings rest on **entirely different videos**. The
machine-learning-engineering mapping is the Zero to Hero sequence —
micrograd, five makemore parts, GPT from scratch, the tokenizer, GPT-2
reproduced — roughly eighteen hours of building things from an empty
file. The building-with-llms mapping is a separate strand aimed at people
who *use* these systems: a 131-minute account of his own daily practice
and a 60-minute introduction for non-specialists. No video supports both
claims.

Farcic's failed on exactly that point: his delivery-pipeline and
Kubernetes evidence was **the same ninety-minute Q&A streams**. Same
competence in two areas, one body of work.

The test is doing what it should — permitting a second mapping when the
evidence is genuinely separate, refusing one when it is the same material
described twice.

## Batch 36 — fitness depth, and `sports-nutrition` filled

Stronger By Science (`hypertrophy-training`, `sports-nutrition`), Calgary
Barbell (`powerlifting`), Swim Smooth (`swimming-technique`). Marginal
1.33, second-or-later share 25%.

**Stronger By Science took two categories and it passes the test on the
same grounds Karpathy did.** The hypertrophy mapping rests on the
training-literature episodes — warming up and muscle growth, weakly
supported growth beliefs, hyperplasia, muscle memory. The sports-nutrition
mapping rests on an entirely different set: a 91-minute episode on basal
metabolic rate, and short pieces on excess protein, on whether muscle
gain raises metabolism, on low-carb diets and growth. Different videos,
different claims.

**Calgary Barbell was the refusal in this batch.** `strength-training`
sits at 2 and he would fit it comfortably — but his strength content *is*
his powerlifting content under a broader name, which is one body of work
counted twice. One mapping, and the reasoning is on his card.

`sports-nutrition` was one of the 17 empty categories and is now
populated by a channel that reads the literature rather than selling
supplements — which for that category specifically is the difference
between a listing and a liability.

## Batch 37 — fitness depth, and an unfinished observation about endurance sports

Juggernaut Training Systems (`strength-training`), Minus The Gym
(`calisthenics`). Two creators — the honest yield after probing eleven
fitness channels.

**A second refusal of the Calgary Barbell shape.** Juggernaut's catalogue
is powerlifting-specific programming and would map to `powerlifting`
comfortably. It is mapped to `strength-training` only: the powerlifting
material is the same body of work under a narrower name, and that
category is already served by a channel whose *whole* catalogue is the
sport. Two batches, two refusals of this kind — it is becoming the common
case rather than the notable one.

**Rejected:** The Run Experience (logged as reputation drift — 300
uploads scanned, nine long-form teaching hits, catalogue now race recaps
and challenge vlogs, dormant since January 2025); Global Cycling Network
(9,183 uploads, four long-form teaching hits in 200 — a media brand
rather than an instructional one); megsquats (nine long-form hits in 200,
mixed with lifestyle content).

**An observation I am NOT recording as a finding.** All three rejections
are endurance or general-fitness channels shaped as entertainment brands
rather than teaching ones, and `running` and `cycling` both remain at 1.
That is three channels. Under rule 18 that is a report about my search,
not about the field — the coaching-practitioner and physiology-research
ends of both sports are unprobed. `running` and `cycling` stay
**unfinished**, not documented.

## Batch 38 — the withheld observation was wrong, which is why it was withheld

Strength Running (`running`), TrainerRoad (`cycling`). Both categories
move from 1 to 2.

Last batch I noted a tempting pattern — three endurance channels
rejected, all shaped as entertainment brands rather than teaching ones —
and explicitly declined to record it as a finding on the grounds that
three channels is a report about my search, not about the field. The
unprobed ends were named: coaching practitioners and physiology.

**Probing those ends took one batch and found both.** Strength Running is
a coach publishing plan construction, VO2 max periodisation and
endurance-specific strength work. TrainerRoad publishes an hour-plus
weekly coaching podcast on cycling physiology, including episodes arguing
against the popular reading of zone two.

Had that observation been written up as a structural finding, it would
now be the fourth falsification in the ledger — and it would have been
made from three channels, which is fewer than either the marketing claim
(one sub-area) or the first-aid claim (thirteen institutional probes)
rested on. **The rule caught it before it was written rather than after
it shipped**, which is the first time that has happened in this project.

Worth noting the shape of what was found: neither is a person with a
camera. One is a coaching business, one is a software company. The
teaching end of endurance sport is commercial, and both cards say so.

## Batch 39 — martial arts filled; the mobility genre's founder has left it

Stephan Kesting (`brazilian-jiu-jitsu`), fightTIPS
(`boxing-and-striking`). Both categories move from 1 to 2.

**The Ready State rejected, and it is the starkest drift case yet.** Dr.
Kelly Starrett is a physical therapist, a three-time bestselling author,
and the person whose MobilityWOD work largely created the online mobility
genre. `mobility-and-flexibility` sits at 2 and he would have been the
obvious third.

A scan of 300 uploads for mobility, hip, shoulder, ankle, pain, stretch,
squat and range returned **four long-form hits — and two of the four are
a 65-minute account of a hippo attack on the Zambezi River.** The channel
is now a general wellness and interview podcast; the median upload is one
minute. Two genuine mobility videos remain in the recent catalogue.

Eleventh drift entry. The pattern now has enough cases to say something
specific: **the drift is almost always toward podcast, news or vlog
formats, and the teaching either moves behind a paywall or stops.** That
is a claim about the eleven cases in the file and nothing more — the
denominator is unknown, since channels that did *not* drift were never
systematically counted.

## Batch 40 — fitness complete at 2+, and one inclusion that needed a hard caveat

Lattice Training (`rock-climbing`), Chloe Ting (`home-workouts`). **All 14
fitness categories now hold at least 2 creators**; three are at the target
of 3.

**Chloe Ting is the difficult one and the reasoning should be visible.**
The workouts are competent — full-length, no equipment, structured
intervals, free. The packaging is not: two-week challenges titled around
a "glow up" and a "snatched waist" promise visible body recomposition on
a timeline that is not physiologically available to most people, and
imply spot fat reduction, which does not occur.

Handled under rule 13's logic rather than by exclusion: the content is
sound, the claim attached to it is not, so it carries `contested-claims`
and a caveat that names the problem in terms — *"the titles promise what
the workouts cannot deliver… take the sessions and leave the promises."*
The `notFor` is written for the person this actually harms: someone who
will be discouraged when two weeks does not produce the advertised
change.

The alternative was leaving `home-workouts` at 1. A shorter list is not a
better one when the thing being withheld is a free, no-equipment library
and the reader has been told exactly what is wrong with it.

## Batch 41 — a critic for longevity, and a duplicate the validator caught

Medlife Crisis (`longevity`, **critic**). One creator — the batch was
meant to be two.

**The validator caught me adding Sleep Doctor twice.** Dr. Michael Breus
has been in the dataset since batch 11, mapped to `sleep-quality`, and I
researched and wrote a second full record for him thirty batches later
without noticing. My pre-write duplicate check has been a manual list of
handles typed from memory, and `@thesleepdoctor` was not on it. The
`duplicate handle` rule failed the build; nothing shipped.

This is the second time an automated check has caught something review
did not, in six batches. Both were the same class of error — a stored
fact I had stopped querying.

**Medlife Crisis is a genuine critic**, which matters because they are
the scarcest role in the project: 20 critic creators across 223. Rohin
Francis is a practising consultant cardiologist whose stated premise is
that there is a great deal of bad science on YouTube, and 109 of his 173
uploads run over eight minutes. He turns it inward as readily as outward
— videos on who is to blame for medical complications, and on a patient
who taught him humility, are about the limits of his own profession.

**`gut-health` stays empty and unfinished.** Probed: the influencer end,
where `@gutfeelings` (712 uploads) turned out to be exactly what the
category blurb warns against — "These Tiny Seeds Repair Your Gut Lining
Fast", "10-Minute Gut Reset", an argument that FODMAP protocols do not
work. The gastroenterology and research ends are unprobed, so this is a
report about my search, not the field.

## Batch 42 — health, and the first use of the queried handle list

Dr Dray (`skincare`, 1→2) and Mama Doctor Jones (`hormonal-health`,
1→2, **critic**). Two creators, two mappings — marginal ratio 1.00,
second-or-later share 0%.

**`data/probed.json` paid for itself on its first batch.** The
pre-write check is no longer a list typed from memory: `check-handles`
now reads 247 handles — 223 in the dataset, 24 rejected or collided —
and labels each candidate `ALREADY IN THE DATASET`, `ALREADY REJECTED`
or `KNOWN COLLISION` before any research is done. The Sleep Doctor
duplicate that cost a full record in batch 41 would have been refused
at the first probe.

**Dr Dray is the awkward kind of good source.** Board-certified
dermatologist, 5255 uploads, and the volume is the problem as much as
the credential is the recommendation — a catalogue that large is not
curated, and the entry video was chosen to be a question a beginner
actually has rather than the most-viewed thing on the channel. She
carries `commercial-conflict`: the product-recommendation videos are a
real part of the catalogue and the badge says so.

**Mama Doctor Jones is a critic, which is why she is here.** Health is
the domain where the dissenting-voice count matters most and it is the
one where the incentive to sell runs hardest against dissent. Her
premise is that fertility and hormone influencers are wrong on the
facts, and she says so with citations; the entry video is exactly that
argument. `hormonal-health` had one creator and no dissent.

**No structural claim is made about health from two probes.** Ten of
its twelve categories sit at 1 or 0 and the domain has had one batch.
Rule 18 applies to the gaps here as much as anywhere: `gut-health`
stays an unfinished search, not a finding about the field.

**Rule 17 residue removed from the coverage report.** The saturation
table was still printing a `cause` column of `undefined` and a
placement of `MISSING — rule 17` for signals with no entry — labels for
a rule retired two batches earlier. The measurement stays, the
classification columns are gone, and the table now says plainly what
the numbers are still for: drift detection in the validator.

## Batch 43 — three conflicts, disclosed

Dr. Spencer Nadolsky (`fat-loss`, 1→2), The Gastro Girl Podcast
(`gut-health`, **0→1**) and Dr. Will Bulsiewicz (`gut-health`, 1→2).
Three creators, three mappings — marginal ratio 1.00, second-or-later
share 0%.

`gut-health` filled from the gastroenterology end that batch 41
recorded as unprobed. Seven handles, four resolved, two listable.
That is rule 18 operating normally, not a result: naming the unprobed
sub-areas is what the rule requires, and nothing false shipping is the
expected consequence of following it rather than an achievement.
Recorded here because the ledger should show the rule being used, and
not written up as a finding.

**Both gut-health creators have a conflict and neither is hidden.**
Bulsiewicz founded a supplement company in this exact subject and the
entry video's own description opens with a link to his paid
constipation course; he carries `commercial-conflict`,
`sells-course` and `strong-ideological-frame`, and the caveat says the
teaching is good and the selling is constant, both at once. Gastro
Girl's problem is the opposite and worth stating: the host is not a
clinician, so the interviewing is sympathetic rather than adversarial
and nobody gets pushed. Rule 13's test decided both — a non-profit
running either of these would be listed without hesitation.

**Nadolsky is the tightest conflict the project has listed.** The
subject is weight-loss medication and a hundred and forty-seven of his
last two hundred uploads are short videos funnelling to a free guide
from an obesity-care company he is attached to. The eight long
episodes carry no such link, read named randomised trials with the
researchers who ran them, and turn at one point on what a waterfall
plot shows that a line graph hides. The entry video is one of those
eight, deliberately. This is what rule 13 is for, and the caveat names
the funnel rather than gesturing at it.

**A title check paid off again.** "The Truth About Obesity Genetics
that No One is Talking About" was my first choice of entry video for
Nadolsky. Reading the description rather than the title: it is
thirty-nine minutes on Bardet-Biedl syndrome, a rare ciliopathy. A
reasonable entry point for `fat-loss` on the strength of its title, and
completely wrong on the strength of its content.

**Fifteen rejections recorded, and the shape of them has changed.**
Until now the rejection ledger was almost entirely reputation drift.
This batch added dead channels (`@drjud`, last upload 2022), wrong
audiences (`@Physiotutors` states it teaches physiotherapists, not
patients), funnels (`@ConorHarris`, whose every long-form description
is a single link to his own program and whose "evidence-based" title
carries no citation), and one refusal worth explaining: Plum Village is
substantial, sells nothing, and has a median video length of eighty
minutes — and is still not listable, because a monastery's archive of
retreat talks and ceremonies has no entry point for someone learning
to meditate. Length is not the same as teaching.

**`meditation` and `posture-and-ergonomics` stay at 1, and that is an
unfinished search, not a finding.** Probed for meditation: the guided
end (overlaps Tara Brach), the secular-technique end (`@drjud` dead,
`@UnifiedMindfulness` shorts), the tradition end (Plum Village). Not
probed: the clinical-trials end, the Insight/IMS teacher circuit,
non-English instruction. For posture: the biomechanics-coach end
(Conor Harris) and the clinician end (E3 Rehab and Squat University are
both already in the dataset, and a third mapping for either would be
the double-counting rule 4 forbids). Not probed: occupational-health
and workplace-ergonomics research, which is the end the category is
actually named after.

**Rule 12 for `gut-health`: proposed, and declined.** The owner's
reason is better than my proposal. The cost-over-time rationale is the
loosest of the three and can be argued for most chronic-health
categories — `fat-loss` and `hormonal-health` were trimmed off rule 12
on exactly this ground, and admitting `gut-health` would readmit them
and leave rule 12 covering the health domain rather than marking
anything out inside it. A test that selects everything selects
nothing. The delayed-diagnosis point is real and now sits where it
belongs: the category's beginner level names the symptoms that mean
stop self-managing, and both creators' caveats carry their own
conflicts. Recorded in CLAUDE.md as the boundary marker for the
cost-over-time rationale.

**Marginal ratio for batches 33–43: 1.08** across 25 creators and 27
mappings; the dataset stands at 1.42 over 228 creators and 323
mappings. The creator-300 recomputation the owner asked for is still
seventy-two creators away.

## Batch 44 — first batch generated by query instead of recall

Eat for Endurance (`sports-nutrition`, 1→2), Olivier Girard
(`posture-and-ergonomics`, 1→2) and Declutter The Mind (`meditation`,
1→2). Three creators, three mappings — marginal 1.00, second-or-later
share 0%. All three take a category from 1 to the new target of 2.

**The target is now 2, and one of the numbers I gave for it was
wrong.** I told the owner depth 2 was 71 mappings and ~66 creators
away, by subtracting the total held from 197 × 2. That silently counts
surplus depth as progress: a category already at 4 does not help one
at 0. Measured per category — `2×(at 0) + (at 1)` — the real distance
is **116 mappings, about 108 creators.** The decision was taken on the
wrong number. Its direction survives the correction: depth 2 is
reachable inside the 400 cap with about 61 creators left over, and
depth 3 was never reachable at all. The number did not survive, and
`validate.mjs` now measures it per category so it cannot be reported
that way again.

**Discovery by query, tested rather than promised.** `discover.mjs`
searches for long videos on a topic and reports the channels behind
them, labelled against `probed.json`. It found all three of this
batch's creators, none of which recall had produced across two prior
health batches. It also gave a clean measurement of its own limits:
strong for `sports-nutrition` and `gut-health`, useless for
`meditation` and `sleep-quality` where the topic word names an audio
product, and near-useless for `posture` where the long-form is clinic
marketing, an insurance broker and two chair vendors. Olivier Girard
came out of that noisy list at six hits — the mechanism worked, but it
worked by surfacing one usable name among forty.

**All three carry something worth stating plainly.** Claire
Shorenstein is a board-certified sports dietitian whose episodes run to
ninety minutes and who names the trends in her own field she thinks are
overdone; she sells coaching to athletes. Olivier Girard is a working
ergonomist covering the half of `posture-and-ergonomics` that the
category name promises and nothing here delivered — and he reviews the
equipment, which is a direct conflict even when the reviews are
critical. Declutter The Mind has no named teacher and no credential
anywhere on the channel; it earns its place on structure alone, a
library of uniform fifteen-minute secular sittings indexed by the state
you arrive in. Its own entry-video description calls a fifteen-minute
meditation ten minutes, which is in the caveat because it is the kind
of sloppiness a reader should be able to see.

**Two refusals that make the standard consistent.** Yuttadhammo
Bhikkhu — 2,257 uploads, a genuine monastic teacher — was refused on
exactly the ground Plum Village was refused in batch 43: a weekly
two-hour livestream archive has no entry point. And the Buteyko Clinic
was refused for `breathwork` not because it is bad but because it is
the same tradition Oxygen Advantage already carries. A second copy of
the frame already present is not a second voice.

**`breathwork` stays at 1 and `sleep-quality` stays at 1, both
unfinished searches.** Breathwork probed: the physiology-lecture end,
the Buteyko end, the coaching end. Unprobed: respiratory
physiotherapy, wind-instrument and singing breath training, the
clinical-anxiety end. Sleep probed: one query, swamped by sleep-aid
audio. That is a limit of the search, not a report about the field.

**Where the headroom goes is now computed, not chosen.**
`lib/depth3.mjs` ranks categories at exactly 2 by whether a third voice
changes anything: high-stakes first, then jurisdiction-split, then the
ones where the two existing creators agree with each other. The last
test earns its keep immediately — `injury-rehab` comes top with E3
Rehab and Squat University at the same role and 100% stance overlap,
which is invisible from the category page because both records are
individually fine.

## Batch 45 — a field that ships to visitors had gone stale

Josh Wright (`piano`, 1→2) and TomoFujitaMusic (`guitar`, 1→2). Two
creators, two mappings — marginal 1.00, second-or-later share 0%.
Both take a category from 1 to the target.

**The batch's real output is the status audit.** Chasing a singing
coach for `singing`, discovery returned Madeleine Harvey: fifty of
fifty recent uploads in the three-to-nineteen-minute band, median
thirteen minutes, all technique — and a last upload of December 2024.
The tool reported her as `active`, because `status` was a binary at
730 days and she was 643 days quiet.

Two separate defects behind one symptom. **The threshold could not
express what a reader needs**: on a site whose proposition is "go and
learn from this person", a year of silence is a fact, and a two-state
field cannot carry it. `dormant` now sits between `active` and
`archive` at 365 days and renders as "Quiet for over a year".

**And `status` was written once and never re-queried.** It has shipped
to visitors since batch 01. The first audit of all 231 records found
**seven disagreeing with the API** — five claiming `active` for
channels silent between twelve and twenty-four months, two overstating
`archive` for channels that were merely quiet. The five wrong ones
include Andrej Karpathy, and **Stronger By Science, the other creator
in `sports-nutrition` — the category filled to 2 in the batch before
this one.** That category has two entries and one active channel, and
nothing in the process would have said so.

This is the sixth instance of a stored fact that stopped being
queried, and the first found in a field the site actually displays.
The previous five cost research time or produced internal claims; this
one had been telling visitors something untrue. `audit-status.mjs`
re-queries the whole dataset for about two units per creator and is
now a pre-release step.

**On the two creators.** Both fill a category whose single occupant was
an institution: Pianote is a subscription school and JustinGuitar is a
curriculum. Josh Wright is a performing classical pianist teaching
named repertoire and the technique underneath it, from recorded
private lessons. Tomo Fujita's whole position is that learners
memorise shapes without hearing intervals, and he is unusually direct
about what learning from YouTube leaves out — a thirty-five-minute
conversation on exactly that, which is a strange and useful thing to
find on the medium it criticises.

**I nearly wrote a credential neither channel asserts.** Tomo Fujita's
description says "musician, author, and educator" and names no
institution; Josh Wright's asserts no teaching qualification. Both
records say so, and neither carries `credentialed`. The case for each
is the playing, which is on the channel to judge.

**Discovery's fourth measured limit: `podcasting`.** The query returned
podcasts — Joe Rogan, NPR, GQ, the Daily Beast — rather than anyone
teaching podcasting. When the topic word names the medium, the search
returns instances of the medium. Same family as the audio-product
limit, and the category stays at 1.

## The generalisation sweep — and the question it corrected

Run at batch 45 rather than at the end of Phase 2, on the owner's
instruction, after `status` was found shipping wrong.

**The question I was given was half wrong, and finding that out is the
useful part.** The brief was: which displayed fields were written once
at research time and never re-queried, and have therefore gone stale?
The answer is none of them, because nothing has had time to. Batch 01
was committed on 2026-09-01 and today is 2026-09-05. All 233 records
read `dataAsOf: 2026-09` — I suspected that meant the field carried no
information, and git says it is simply true.

So `status` was never stale. **It was wrong the day it was written.**
Stronger By Science's last upload was February 2025 and it was
researched this month; the rule was a binary at 730 days and had no way
to say "silent for a year and a half". That is a different defect from
ageing, and it needs a different question: not *what has gone out of
date*, but **what is produced by a rule that cannot express the
truth** — and separately, what is unfalsifiable by construction.

**What the sweep found wrong.** Seven statuses. Two entry-video titles
renamed by their creators since we recorded them, both shipping a title
that no longer existed. One creator who had outgrown their subscriber
band. All three classes were already covered by checks that existed —
which is the part worth sitting with.

**A standing policy the tooling made impossible.** CLAUDE.md has said
since early on: run `gate-check` over *every* batch file before any
release, not only when a batch is first written. The script accepted
one file path. Carrying out that policy meant invoking it forty-five
times by hand, so it was never carried out, and the two renamed titles
sat there. A rule the tooling makes impractical is not a rule. It takes
`--all` now, and the full sweep over 328 entry videos costs 240 units.

**The class nothing could check.** 231 of 233 records ship a countable
claim about a channel's catalogue — "thirty-four of the fifty most
recent uploads are under two minutes", "median fifteen minutes". Not
one was verifiable, because the measurement existed only inside a
sentence. `audit-catalogue.mjs` now stores it beside the prose, the
same way `domain-notes.json` stores the counts whose drift the
validator already catches. **The baseline starts today. This verifies
no existing sentence** — it means the next run can say which channels
have changed shape since.

**A detector I built and threw away.** I tried to check the prose
retrospectively with a regex looking for records whose language leans
long-form while the channel is now mostly short. It produced sixteen
flags. The first two I checked were both false positives, and one of
them — Dr. Spencer Nadolsky — was flagged for concealing that his
channel is mostly shorts, which is a thing his record says outright in
its second sentence. A bad detector is a new source of false claims,
not a check on the old ones, so it is recorded in `field-audit.json`
under what was not done rather than shipped.

**And the fields that no instrument will ever reach.** `level`,
`profile` and `role` are editorial judgements. Nothing can verify that
a channel is "intermediate" or that its self-promotion is 3 rather than
4. They are named in the audit specifically so the rigour of the
checked fields is never read as covering them.

**Depth is now counted twice.** 98 categories meet the target of 2 on
paper; **94 meet it with active creators**, and the second is the
honest one. The four that lose it — `confidence-building`,
`sports-nutrition`, `building-with-llms`, `video-editing` — each have
two entries and one live channel. `sports-nutrition` is the one that
started this: filled to 2 in batch 44, and one of the two had been
silent since February 2025.

## Rules that could not be run, and the cost of fixing the prose

### 1. A rule nobody can run is a false claim about our own process

Four rules in CLAUDE.md require manual repetition. **Two had never run
once.**

**"Run gate-check over every batch file before any release."** The
script took a single path. Executing the rule meant forty-five hand
invocations, so it was never executed. Its first real run found two
entry-video titles renamed at the source and one outgrown size band —
none of which could have survived a single earlier full run.

**"Contrast is verified by script: 22 pairings across both themes, all
passing WCAG AA."** No such script has ever existed in this repository.
`git log --all --name-only` has no record of one being added or
deleted. It was never there. A specific measured number, asserted about
our own rigour, produced by nothing — the badge-claim failure in the
design half of the project.

I wrote it (`scripts/check-contrast.mjs`) rather than deleting the
claim. The substance held: **0 pairings below AA.** The number did not:
**30, not 22.**

And the script's own first version reported two dark-theme failures
that were phantoms. It tested the semantic aliases in `tokens.css`, and
**seven of those aliases are declared and referenced by nothing** —
the bands colour themselves from raw scale steps. A checker built from
the token list invents pairings that do not exist. That is the third
detector I have written this session that produced false positives
before it produced a true one; the pair list is now read off
`style.css` and every entry must trace to a rule setting both a colour
and its surface.

Two more: **MARKUP.md co-commits, 2 of the last 16** touching markup,
including my own `dormant` label this batch — recorded as an open gap,
because whether a JS change is a markup change cannot be decided
mechanically. And the **definition-of-done tracker was stale for
forty-four batches**, still claiming 200 categories at 5 creators each
and 700 creators, and still describing validate.mjs as passing "on the
current empty dataset" with 233 creators in it.

The test that separates these from real rules is not whether the rule
is good. It is: **can one command execute it, and is there evidence it
ran.**

### 2. The second defect class, and the one-minute test that catches it

The first six defects were stored facts that stopped being queried, and
the defence is re-querying. `status` was not that. It was wrong the day
it was written, because the shape could not carry the truth. The
defence is a different question, and it is cheap: *write the truest
sentence about a real creator, then try to say it in the schema.*

**`role` fails that test.** Pianote is a subscription school,
Buzzsprout a hosting company, NNgroup a consultancy, the Gastro Girl
Podcast a patient-education firm. All four carry `specialist`, the same
word as a working dermatologist, and 201 of 233 records carry it. The
cost is not cosmetic: the depth-3 priority test flags a category when
its two creators "agree" — same role, overlapping stance signals — so
**an institution and an individual read as agreeing** when that may be
the widest disagreement in the category.

**`signals` fails it too.** Absence cannot distinguish "we checked and
this creator sells nothing" from "nobody looked". 81 of 233 records sit
in that ambiguity and no reader can tell which.

Both fixes are visitor-facing vocabulary changes requiring existing
records to be re-judged, so both are proposals, not changes.
`sizeBucket` passes. `level` is partly limited and not worth fixing.
`formatTags` — the one vocabulary deliberately left **open** — is the
only one with no expressiveness failure at all, which is worth noticing.

### 3. What interpolating the prose numbers costs

**Done, and required for new records.**
`scripts/lib/catalogue-prose.mjs` gives a record placeholders —
`{{shortCountWords|cap}} of the {{scannedWords}} most recent uploads` —
and `build-data.mjs` fills them from that record's own `catalogue`
block, fataling on an unknown name. Word forms exist because the house
style spells numbers out. Proven end to end on Dr. Spencer Nadolsky,
whose shipped sentence now reads "Of the fifty most recent uploads,
thirty-seven run two minutes or less" with every number derived.

**The retrofit of the other 231: I recommend against it, and here is
the arithmetic.**

305 sentences carry a countable catalogue claim:

| shape | count | interpolable |
|---|---|---|
| median length | 127 | yes |
| total upload count | 46 | yes |
| N of the scan window | 45 | yes, if the windows match |
| a specific video's length | 62 | **no** — not a catalogue statistic |
| other | 25 | mostly no |

So roughly 218 of 305 could be interpolated in principle. Three things
make the real cost much higher than that ratio suggests.

**The scan windows disagree.** Records were written from 50-upload
scans and 200-upload scans, and `catalogue` stores one window. Nadolsky
was written from 200 — "a hundred and forty-seven of the two hundred
most recent" — and converting him to the stored 50-window changed what
the sentence *says*, not just its digits. His next sentence, "eight
episodes over twenty minutes", is a 200-window fact that is simply
false of a 50-window and had to be rewritten to drop the count. **One
record took a paragraph rewrite, not a substitution.**

**The 62 specific-video lengths are not catalogue statistics.** "Ninety
minutes on iron deficiency" is a fact about one video. Storing those
means a per-video store and a per-video re-check, which is a second
system, not an extension of this one.

**And the numbers are spelled out inside varied English.** "Sixty-five
of the last two hundred", "around a hundred and twenty", "every one of
the fifty". Substitution has to preserve casing, hyphenation and
grammatical agreement across 231 hand-written voices.

Realistically that is **231 records re-read and largely re-written, at
roughly the cost of writing them the first time** — comparable to
fifty batches of research, to protect claims that are four days old on
a project where nothing has yet had time to drift.

**Recommendation: do not retrofit. Accept it knowingly.** The exposure
is bounded and now measurable: `audit-catalogue.mjs` holds a dated
baseline for all 233 records, so the *next* run reports which channels
have changed shape, and any record it flags gets rewritten with
placeholders at that point. The retrofit then happens incrementally,
paid for only where the prose has actually gone wrong, instead of all
at once for prose that is mostly still true.

## The entity axis, and a claim that was never even wrong

### `role` split — because it corrupted the allocator

`entity` now sits beside `role` on every record: **individual /
institution / vendor.** Not for vocabulary accuracy. `role` said a
subscription piano school and a working piano teacher were the same
kind of voice, and the depth-3 allocator reads that as *agreement* —
in the one place where it is the widest disagreement a category has.

Derived from evidence rather than assigned: an evidence ladder from
the creator naming themselves in their own description, through our
own opening identity sentence, down to voice markers. **143
individual, 15 institution, 2 vendor, 73 deliberately unset.** A wrong
value here corrupts the allocation the axis exists to protect, so
ambiguity stays a gap.

**Four wrong rules, all caught by reading the output rather than by
review.** `sells-course` accepted as vendor evidence, which made E3
Rehab — practising physical therapists publishing free protocols — a
vendor beside Pianote. "hosting" matching the Oxford Union *hosting*
prominent speakers. Corporate voice alone making Cal Newport an
institution because his description says "our" and never "I". And a
pattern reading a professor's employer as their entity, which turned
three individuals into universities. Every one produced a *confident
wrong value*, which is worse than a gap.

**And the script had the exact defect it was written to fix.**
`--write` only ever set `entity`; it never cleared. So when I tightened
the vendor rule, records classified by the old rule kept their old
value — a stored fact that stopped being queried, introduced by me,
today, inside the tool built for that class. It clears before it writes
now.

**In the allocator**, a vendor/non-vendor split disqualifies an
agreement finding; institution-versus-individual only discounts it. My
first version disqualified both and **suppressed the `injury-rehab`
finding** — the case that proved the test worth having — over E3 Rehab
being a group practice and Squat University one clinician. They are not
that category's widest disagreement. They are two rehab voices saying
the same thing, and the test should say so.

**A debugging note against myself.** I spent three probes chasing a
phantom bug because I checked `@ahrefs` when the record says
`@AhrefsCom` — a handle from memory instead of from the record, while
debugging the axis added because memory was the problem.

### `signals`: not re-judged, stated as a limitation

Eighty-one records carry no commercial badge and the schema cannot say
whether that means "checked, sells nothing" or "nobody looked". The
colophon now says so in terms — *read an absent badge as silence, not
as a clean bill of health* — with the count **interpolated at render**,
because a literal number in visitor copy is the thing the validator
already forbids.

### The claim that was never even wrong

The ledger now separates three failures, because they need different
defences:

- **stale stored fact** — true when written, stopped being queried.
  Six instances. Defence: re-query on a schedule.
- **schema cannot express it** — wrong the day it was written. Two.
  Defence: write the truest sentence about a real subject, then try to
  say it in the schema.
- **never even wrong** — no process ever produced it. Defence: name the
  artifact, or delete the number.

"Contrast is verified by script: 22 pairings, all passing AA" is the
first of the third kind. It **survived every previous sweep**, because
rule 18 looks for claims that were tested and failed, and this one
could not be tested — there was nothing to test it against. It took a
different question, about which rules require manual repetition, to
surface it at all.

**So I asked that question of every number CLAUDE.md asserts about
us.** A second one has no producer: **"79% of every record is
hand-written prose."** Nothing has ever computed a prose share. The
real figure is **65%** — and that number was load-bearing, since it was
the stated reason the bottleneck is "the prose, not the quota". The
conclusion happens to survive; it rested on nothing.

Four more are stale snapshots of numbers an artifact *does* recompute.
The sharpest is "6 of 188 mappings are retroactive (3.2%)": the
numerator held at 6 while the denominator nearly doubled to 326, so the
true share halved to 1.9% while the sentence kept the old one. Those
now point at the artifact instead of restating it.

**The standing rule:** a number describing our records, our rigour or
our process must name the thing that computes it, in the same sentence.
If no artifact exists, build it or delete the number.

## Derivation scripts, swept — and what Phase 2 has left

### Clear before you write

The entity script shipping with the defect it was built to fix is the
seventh instance, and the owner is right that it is not coincidence:
**it is a property of any derivation script whose rules can change.**
If `--write` only ever sets a field, then tightening a rule leaves
behind exactly the records the old rule got wrong — stale confident
values, produced by logic that no longer exists.

All five writers swept:

- **`derive-entity.mjs`** — had it. Fixed: clears, then writes.
- **`build-data.mjs`** — **already correct.** It deletes every `listed`
  entry in `probed.json` and regenerates from the dataset. The pattern
  was known and documented in that file's own comment; it simply was
  not applied to the newer script.
- **`audit-catalogue.mjs`** — weaker instance. A channel that failed to
  resolve kept its stored measurement, dated to the last successful
  run and indistinguishable from one just taken. Now marked
  `unresolvedAt`, and a later successful measure clears the marker.
- **`audit-status.mjs`** — same shape, and it **cannot be fixed the
  same way**: `status` has a closed vocabulary with no value meaning
  "we could not check". A gap is not expressible, so it escalates
  instead — the run exits non-zero and names the record.
- **`resolve-creator --record`** — append-only log, not a derived field.
  Exempt.

The test for any future writer: **if a rule tightens, or a source goes
away, does a confident value survive that nothing would now produce?**

### The 79% is the entry that should worry us most

Recorded in the ledger accordingly. It was not a wrong number in a
description — it was **the stated reason the bottleneck was prose
rather than quota**, and that framing shaped weeks of decisions about
pace, batch size and where effort went. I never questioned it because
it sounded like the output of a measurement.

The conclusion happens to survive, on evidence found later and by
accident: batch 43 spent ~38 recalled handle probes and seven evidence
dumps to accept three creators, which showed the bottleneck was
candidate generation — neither prose nor quota. The conclusion outlived
the number given as its reason, which is luck, not process.

**`never-even-wrong` is the hardest of the three classes**, and the
ledger now says why. The other instances were checkable and unchecked.
This one had nothing to check against. Rule 18 hunts for claims that
were tested and failed, so a claim no process ever produced is
invisible to it *by construction* — it took changing the question
entirely, to "which rules require manual repetition", to surface it.
The defence cannot be a better test. It has to be a requirement at the
point of writing: **name the artifact in the same sentence as the
number.**

### What is left to close Phase 2

Measured against **active** creators, which is four categories less
generous than the paper count:

| | |
|---|---|
| Categories with no active creator | 18 |
| Categories with one | 85 |
| **Mappings still needed** | **121** |
| Creators, at the current 1.08 marginal | **≈113** |
| Left under the 400 cap afterwards | 54 |

**At the measured recent rate — 30 creators over batches 33–45, 2.31
per batch — that is 49 batches. At the 5 per batch that
discovery-assisted work should support, 23.** Twenty-three is the
target; forty-nine is what happens if discovery stops paying, and I
have been wrong about a pace projection twice, so weight it as you did
last time.

**The remaining work is not where the depth pass has been.** Business
needs 16, career 15, mindset 13, money 13, marketing 13 — **70 of the
121 between five domains** — while health, philosophy and programming
need seven between them. The last four batches have been health,
creativity and music. That should change.

## Batch 46 — business and career, where the work actually is

Firm Learning (`consulting`, 1→2), Impact Pricing (`pricing-strategy`,
**0→1**) and Coaching for Leaders (`leadership`, 1→2). Three creators,
three mappings — marginal 1.00, second-or-later share 0%.

**Two of the three deliberately pair an individual against an
institution**, which is the entity axis doing the job it was added for.
`consulting` was held by The Futur, a training business; it now also
has someone who did the job. `leadership` was held by Harvard Business
Review; it now also has a practitioner with eight hundred numbered
episodes. Neither pairing would have registered as diversity under
`role` alone — all four records say `specialist`.

**Discovery failed on these domains, and the failure is measurable.**
Business and career are dominated by two things the search returns
instead of teaching: vendor marketing and motivational content.
`hiring-and-recruiting` returned a staffing agency, a recruiting-software
vendor and an assessment platform. `career-change` returned TEDx,
Forbes, Udacity and Mel Robbins. That is the fifth and sixth measured
limit — **where the buyer is a business, the long-form is sales; where
the topic is a life decision with no profession behind it, the
long-form is motivation.** All three creators in this batch came from
recall instead, every candidate query-verified before any research.

**`pricing-strategy` opens at 1, not 2.** Impact Pricing is 43 of 50
uploads over twenty minutes with a median of thirty-two, on a subject
usually handled in listicles. The obvious second, Willingness to Pay,
is a consultancy's clip channel — 43 of 50 uploads *under* two minutes.
A category at 1 is honest; a category at 2 padded with a clip feed is
not.

**Work It Daily is the interesting rejection.** Genuinely substantial —
fourteen of forty-nine uploads over twenty minutes, several past forty
— but its centre is job search and LinkedIn profiles, and
`job-interviewing` is already at 2 while the `resume-writing` blurb is
about the document itself. Recorded with the reason, because it would
be a good fit for a job-search category we do not have.

**The interpolation mechanism produced its first error, and it was
mine.** Firm Learning's sentence rendered as "the median is one
minutes". A placeholder that can only emit a bare numeral pushes
grammatical agreement onto whoever writes the sentence — which is how a
mechanism built to remove hand-typed facts starts introducing errors of
its own. Fixed in the mechanism, not the sentence: `{{medianPhrase}}`
carries its unit and pluralises.

**Depth after this batch: 96 of 197 at target with active creators**,
100 on paper. 118 mappings still needed.

## Batch 47 — one creator, and the reason is the finding

Modern MBA (`business-strategy`, 1→2). One creator, one mapping.

**Forty-nine of fifty uploads over twenty minutes, median thirty-eight,
across a catalogue of only eighty-two.** Industry-structure teardowns:
why nobody makes money renting cars, why US airlines stopped competing
on service, where cinema revenue actually comes from. It reads the
financials outward to find where the margin sits and which incentive
makes the obvious fix irrational — a genuine complement to Acquired,
which tells the story of the company that won. Every sampled episode
opens with a paid sponsor read, which is in the caveat, and no author
or credential is named anywhere on the channel.

**Nine candidates evaluated, one listed.** That ratio is the point of
the batch, not an aside. In order: Slidebean had pivoted entirely from
startup fundraising to consumer-tech explainers. a16z is substantial —
38 of 50 uploads over twenty minutes — but publishes AI trend
commentary rather than how to raise money, from a firm invested in the
market it discusses. Wholesale Ted is AI side-hustle listicles. How
Money Works is current-affairs commentary, not a personal-finance
skill. Andrew LaCivita is strong on job search, which is already at 2.
The Futur Academy is the same organisation already listed. Keeper is a
tax-software vendor. Carta, Heather Smith and ClearValue Tax are
handle collisions with near-empty channels.

### The rate correction, and I should have made it a batch earlier

The owner asked me to factor recall speed into the next estimate. The
measurement says something worse than "recall is slower":

| source | batches | creators/batch |
|---|---|---|
| discovery-sourced (44–45) | 2 | 2.50 |
| recall-sourced (46) | 1 | 3.00 |
| earlier mixed (33–43) | 11 | 2.27 |
| **all 33–47** | **15** | **2.27** |

**Discovery has not raised the rate at all.** The "5–6 per batch,
about 23 batches" figure I offered was never observed at any point in
this project under any method. It was a projection with a mechanism
attached, and the mechanism was real — discovery does find creators
recall misses; all three of batch 44 came from it after two prior
health batches had not produced them. But finding *different*
candidates is not finding them *faster*, and I asserted the second
while having measured only the first.

**Third pace projection, third failure, identical shape every time:**
measure the mechanism, then assert the rate the mechanism was supposed
to produce. In the ledger as `discovery-raises-the-batch-rate`. The
right response is not to discount the optimistic figure harder — it is
to stop producing one. **CLAUDE.md now carries a single rate, the
measured 2.27, and the 23-batch target is withdrawn.**

**Where that leaves Phase 2: 97 of 197 at target with active creators,
117 mappings still needed, ≈109 creators, ≈48 batches at the measured
rate.** No optimistic alternative is offered because there has never
been evidence for one.
