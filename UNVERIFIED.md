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
