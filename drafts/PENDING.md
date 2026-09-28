# Drafts waiting for the owner

Every draft that needs the owner's approval lives here, with the date it was
written, the item, and the exact text. An entry is removed in the commit that
applies it, or when the owner rejects it. Nothing here is live on the site.

Why this file exists: on 2026-09-28 two drafts (a description for Dave Lowell
and a caveat for Jennifer May) existed only in a chat transcript, and the next
session could not recover them.

---

## 2026-09-28 — The Plain Bagel: evidence strings (rule 4)

Both current strings describe the person ("A CFA analyst publishing…",
"delivered by a CFP professional"), not the channel. Drafts below describe
videos. Counts are from a title scan of the uploads playlist on 2026-09-28.

Measured: the uploads playlist returned 281 videos (channel statistics say
280); 244 run eight minutes or more.

- **`crypto-literacy`** — pattern over titles:
  `crypto|bitcoin|\bnft|blockchain|ethereum|stablecoin|\bftx\b|\bcoin\b|coinbase|binance|\btoken|\bdefi\b|web3|dogecoin|terra|luna|celsius`,
  21 of 281 titles matched, 20 of them eight minutes or more; every match
  was read and all are about crypto. Draft:
  > Across all uploads, 20 of the 244 videos of eight minutes or more are titled on crypto, running 8 to 61 minutes and dated 2018 to 2025: the risks of Bitcoin, NFTs, DeFi, the 2022 crash, the FTX collapse and its refund plan, exchange prosecutions, the Bitcoin spot ETF, US crypto regulation, tokenized stocks and Bitcoin treasury companies, plus long interviews with Aswath Damodaran and Ben Felix that cover crypto.
- **`tax-basics`** — pattern over titles:
  `\btax|\btfsa\b|\brrsp\b|\bfhsa\b|\bresp\b|capital gains|\bira\b|401\(?k`,
  4 of 244 long-form titles matched. Draft:
  > Across all uploads, 4 of the 244 videos of eight minutes or more are titled on tax, running 9 to 21 minutes: Canada’s exit tax, Canada’s 2024 capital-gains change, a proposed US tax on investors outside the US, and a 2018 explainer on registered accounts and tax efficiency.
  **Flag for the owner:** four videos, two of them Canada-specific policy
  changes and one US news, is thin evidence for a mapping. Worth
  re-examining under rule 4 before this string is applied, rather than
  after.

## 2026-09-28 — Eric Andrews: caveat names one sponsor of three

The current caveat names the subscription-retention sponsor (five videos,
2024). A description scan (`ordergroove|sponsor`) matched **12 of 98**,
including other sponsors the caveat does not name: "this video is sponsored
by Neo.Tax & ClearCo" (`9zx6xeQPKjg`) and a "3:07 sponsor: Bainbridge"
chapter with a bit.ly link (`8xfPvprL5qE`). None of the 11 videos in the
`saas-business` evidence matched. Draft replacement for the caveat's second
sentence:
> Twelve descriptions carry sponsorships — five from January to May 2024, including the churn-rate and CAC-payback lessons, by a subscription-retention software company (one says he worked there), and others by finance and modelling services; the entry video is not among them, and its description offers a related video and a free template before his paid programme.

*(Before applying, read the 12 in full: the pattern counts disclosed
sponsorship only, rule 24.)*

---

## 2026-09-28 — Home page and footer: two more "four-week plan" promises

Found while applying the approved `home.js` copy. Both are visitor-facing and
false while the plan band is hidden (`SHOW_PLAN = false`,
`js/views/category.js:25`).

- **`index.html:7`, meta description.** Current: "…with one entry-point video
  each and a four-week plan." Draft:
  > Pick a skill you want to improve at and get a short, honest list of YouTube creators worth watching for it, with one entry-point video each.
- **`index.html:164`, privacy footer.** Current lists "your progress through a
  four-week plan" among what the browser keeps. With the band hidden,
  `restorePlanState()` (`js/views/category.js:198`) finds no checkboxes and
  never writes, so nothing is stored. Draft:
  > Your browser does keep a few things locally, which never leave your device and never reach us: your light or dark preference, and what you have already seen or dismissed of the one question we ask.
- **`js/views/home.js:155`, heading "Watching is not practising"** (eyebrow
  "01 — The honest part"). With the approved paragraph applied, the heading
  argues something the text below it no longer does. Options: keep it, or a
  neutral heading such as "Start with one video". Owner's call.
- **`README.md:4`** also promises the plan. README is served publicly (see the
  Netlify note in the session report). Draft: drop "— with a four-week plan so
  watching turns into practice" and end the sentence after "watching for it".

---

## 2026-09-28 — Topic maps: principle, storage, validator checks

**Status:** storage and the validator-check list were approved *as direction*
on 2026-09-28; not to be implemented until the owner says so.

**Principle (owner, 2026-09-28).** Sub-topics are defined from the practice
itself, never derived from the videos we already have. Videos are matched to
sub-topics afterwards, and a sub-topic with no good video is a documented gap
— not a reason to change the sub-topic.

**Storage.**
- `data/categories.json`, per category:
  `topics: [{ id, name, order, level, source }]` — `source` says where the
  sub-topic came from (the level text, the blurb, a named departure).
- Per creator mapping, next to `entryVideo`:
  `topicVideos: [{ topic, videoId, title, durationMin, whyThisOne,
  descriptionCheck: { at, result } }]`.
- Per mapping: `shelf: "core" | "practice"` for the language-learning practice
  shelf.
- `gate-check.mjs` walks `topicVideos` exactly as it walks `entryVideo`.

**Validator checks to move into `validate.mjs`** (flag case / pass case):
1. Rule 24 top-of-description scan, from a stored snippet of each description's
   first non-blank lines and first links. Flag: Eric Andrews' former entry
   `OwCATJh4lNg` (paid programme among the first two links). Pass:
   `hsXG8QSzaek`.
2. Evidence counts against a stored ≥8-minute count (`catalogue.longPct` is
   ≥20 minutes, `audit-catalogue.mjs:48`, so a new field is needed). Flag: a
   count that no longer matches. Pass: Dave Lowell's 89.
3. A stored pattern for every counted claim. Flag: a record whose evidence
   count has no stored pattern (Eric Andrews before 2026-09-28). Pass: a record
   that stores its pattern.
4. Evidence that describes a person rather than videos. Flag: The Plain Bagel's
   current strings. Pass: Jennifer May's "17 of the 218".
5. Entry-video title sharing no word with the category's name or aliases
   (warning). Flag: "Let's Talk About the AI Bubble" for `crypto-literacy`.
   Pass: Refold's entry for `language-learning`.
6. Visitor copy promising a feature the data lacks. Flag: "four-week plan" with
   0 plans written. Pass: the copy after the fixes above.
7. Placeholder scan extended to built JSON and JS strings. Flag: `TBD`. Pass:
   "todo list".

---

## 2026-09-28 — Several videos per creator in one category: rule 4 and rule 24

**Proposal only; not in CLAUDE.md.** Revised per the owner's decision j.

- **Still one mapping.** Extra videos add sub-topics, not depth: a creator with
  videos on five sub-topics is one voice in the category, not five.
- **A video counts for a sub-topic only if its own content covers it.** One
  video may serve two sub-topics only when it genuinely teaches both; the
  rule 4 test ("would this count one body of work twice?") applies per video.
- **No cap on how many sub-topics one creator covers.** One excellent teacher
  across every sub-topic beats two thin ones. **If one creator covers more
  than half of a category's sub-topics, the category page says so**, so the
  visitor knows the map is largely one voice.
- **"A gap beats a weak filler" applies per sub-topic** (the principle of
  rule 12, applied generally): a sub-topic with no good video is left empty
  and documented, not filled with the nearest available video.
- **Rule 24 runs per video.** Every `topicVideos` entry gets its own full read
  of the description, stored as `descriptionCheck`. The creator's own paid
  product "at the start" (first three non-blank lines or first two links)
  disqualifies that video; standing `sells-course` boilerplate further down
  stays a signal, not a bar.

---

## 2026-09-28 — Sub-topic list: Muscle building (`hypertrophy-training`)

**Approved by the owner with changes on 2026-09-28; final text below.** Not
yet written to the data (storage not implemented).

1. What muscle growth is, what drives it, how fast it realistically happens,
   and what happens when you stop training (muscle memory).
2. Effort: how close to failure a set needs to go.
3. How much weekly volume per muscle, and how to find your own range.
4. Progressive overload and tracking.
5. Program structure and frequency: full-body, upper/lower and other splits.
6. Exercise selection and technique for the muscle rather than the weight.
7. Protein and eating enough to grow.
8. Fatigue, mesocycles and deloads.

---

## 2026-09-28 — Sub-topic list: Language learning (method only)

**Approved by the owner with changes on 2026-09-28; final text below.** Every
sub-topic is about method, independent of any specific language.

1. How acquisition works: input versus study, and what each camp's evidence is.
2. Vocabulary and memory: frequency-first words and spaced repetition.
3. Listening: comprehensible input at your level, rising to difficult conditions.
4. Reading: from graded readers to native text.
5. How to approach grammar: explicit study versus acquiring it from input, and
   when each helps.
6. Output (speaking and writing): when to start, practice, pronunciation,
   feedback.
7. Structuring study and diagnosing a plateau.
8. Consistency, and maintaining several languages.

**Draft: neutral rewording of the level text** (`data/categories.json`,
`language-learning.levels.beginner`). Current: "Build core vocabulary and basic
grammar, get comprehensible input daily, and start speaking before you feel
ready." Draft:
> Build core vocabulary and basic grammar, get comprehensible input daily, and decide when to start speaking — early practice and a longer listening period both have serious advocates, and the choice is yours to make knowingly.

**Also flagged, same problem:** the category **blurb** takes the same side
("…through input, practice, and speaking earlier than feels comfortable").
Draft:
> Getting to genuine usability in another language through input and practice, with a clear view of where the methods disagree.

---

## 2026-09-28 — Sub-topic list: Critical thinking — ON HOLD

On hold until the owner decides the merge candidates below (the list depends
on whether `data-literacy`, `cognitive-biases` or `debate-and-argumentation`
become sub-topics of it). The draft from the session report, unchanged:

1. Claim, evidence and assumptions.
2. Argument structure and fallacies.
3. Evidence strength: correlation versus causation, base rates, study types.
4. Sources and incentives: who is saying it, and how to check.
5. Motivated reasoning in yourself.
6. Uncertainty and calibration, including "what would change my mind".
7. Contested questions, conspiracy thinking and one-sided scepticism.

---

## 2026-09-28 — Merge candidates (read-only analysis; nothing merged)

**The principle tested:** if one category is an *instance* of another — a
specific application of the same practice — it becomes a sub-topic of the
broader one. Overlap alone is not enough; two practices that share a step are
not instances of each other.

**Phase 1's recorded reasons.** Today's `CLAUDE.md:2527` ("Phase 1 notes /
decisions") lists the pairs without reasons. The reasons were written in the
Phase 1 commit itself, `8f49b65` (2026-08-22, "Phase 1: 200-category taxonomy
across 16 domains"), in `CLAUDE.md` as added by that commit, and were later
trimmed:
> Deliberately kept as separate, non-duplicate pairs, each with distinct blurbs and level text: `note-taking` (capture from a live source) vs `personal-knowledge-management` (linking/synthesis system); `negotiation` (general) vs `salary-negotiation` (a specific, high-search career case); `difficult-conversations` (general/work) vs `couples-communication` (partner-specific repair); `strength-training` (getting strong) vs `hypertrophy-training` (training for size); `deep-work-and-focus` (attention capacity) vs `digital-minimalism` (relationship with technology).

Three of the nine groups below have a recorded reason (1, 2 and 8); the other
six were never discussed. (Found by fetching the full history: the clone was
shallow, starting at batch 30.)

Definitions quoted are each category's `blurb` in `data/categories.json`.

1. **`negotiation` / `salary-negotiation`** — Phase 1 (`8f49b65`): "negotiation
   (general) vs salary-negotiation (a specific, high-search career case)".
   Phase 1 itself called it a *specific case* — an instance — and kept it
   separate for search demand, not because the practice differs. Negotiation: "Reaching agreements that hold, by understanding
   interests and leverage rather than out-talking people." Salary: "Negotiating
   pay and terms with the leverage and market information you actually have."
   Same practice, one application: **an instance.** **Recommend: sub-topic of
   `negotiation`**, keeping "salary negotiation" as a search alias. Cost to
   weigh: `salary-negotiation` carries a jurisdiction flag
   (`data/jurisdiction.json:39`, "Pay data, norms and disclosure law are
   local") and `negotiation` does not, so the flag would have to move to the
   sub-topic's videos.
2. **`strength-training` / `powerlifting` / `hypertrophy-training`** — Phase 1
   (`8f49b65`): "strength-training (getting strong) vs hypertrophy-training
   (training for size)"; powerlifting not mentioned. Strength: "Getting genuinely stronger with barbell and dumbbell
   work under a structured, progressive program." Powerlifting: "Maximising
   squat, bench, and deadlift for competition, with technique and peaking as
   the core skills." Hypertrophy: "…specifically to add muscle size." Powerlifting
   is strength training applied to three lifts and a meet: **an instance** →
   **recommend sub-topic of `strength-training`** (peaking becomes its own
   sub-topic). Hypertrophy has a different goal (size, not strength): **not an
   instance → keep.**
3. **`critical-thinking` / `data-literacy` / `research-skills` /
   `debate-and-argumentation`** — no Phase 1 record. Critical thinking:
   "Evaluating claims and arguments carefully…". Data literacy: "Reading charts,
   statistics, and studies critically enough to notice when the number isn't
   saying what it seems" — evaluating one kind of claim: **an instance →
   recommend sub-topic of `critical-thinking`** (it moves from `tech` to
   `learning`). Research skills: "Finding, assessing, and synthesising sources"
   — finding and synthesising are practices critical thinking does not include:
   **keep.** Debate: "Constructing and stress-testing arguments, and disagreeing
   productively" — constructing and disagreeing are production, not evaluation:
   **keep.**
4. **`cognitive-biases` / `critical-thinking`** — no Phase 1 record. Biases:
   "Recognising the predictable ways your own reasoning goes wrong, and building
   habits that partly correct for them." Overlaps one critical-thinking step
   ("notice motivated reasoning in yourself", intermediate level) but also covers
   everyday decisions, which critical thinking does not: **shared step, not an
   instance → keep**, and link the two.
5. **`cybersecurity-basics` / `privacy-and-opsec`** — no Phase 1 record.
   Security: "Protecting your accounts, devices, and data against the attacks
   that actually happen to ordinary people." Privacy: "Reducing how much of your
   life is collected and linkable…". Different goals: **keep.**
6. **`self-discipline` / `habit-formation`** — no Phase 1 record.
   Self-discipline: "Acting on what you decided when you no longer feel like it,
   without relying on willpower alone." Habits: "Making a behaviour automatic
   enough that it no longer needs a decision each day." Habit formation is one
   route to self-discipline, not an application of it, so the principle does not
   fire. **Recommend: keep, but put `self-discipline` through rule 22** — its
   definition reads as an outcome ("acting on what you decided") more than a
   practice, and it is one of the six categories searched twice and not found.
7. **`leadership` / `people-management`** — no Phase 1 record. Leadership:
   "Setting direction and building trust so a group does good work…". People
   management: "The practical craft of one-to-ones, performance, hiring, and
   difficult personnel decisions." Different practices that share an audience:
   **keep.** (`delegation` was already retired into `people-management`,
   `_redirects:18`.)
8. **`note-taking` / `personal-knowledge-management`** — Phase 1 (`8f49b65`):
   "note-taking (capture from a live source) vs personal-knowledge-management
   (linking/synthesis system)" — the same component-versus-system reading as
   below. Notes: "Capturing information from lectures, meetings,
   and books in a form that's actually useful later." PKM: "Building a notes
   system that connects ideas and produces output…". Note-taking is a component
   (the capture step) of PKM rather than an application of it, and serves a
   different reader (a student in a lecture). **Recommend: keep**; low
   confidence.
9. **`ai-fundamentals` / `prompt-engineering` / `building-with-llms`** — no
   Phase 1 record. Fundamentals: "Understanding how modern machine learning
   systems actually work, well enough to judge claims about them." Prompting:
   "Getting reliable results from language models through structure, context,
   and systematic iteration." Building: "Turning language models into working
   applications: retrieval, tools, evaluation, and cost control." Prompting is a
   step inside building, but an end user prompts without building anything:
   **keep all three.**

**Summary: 3 sub-topic recommendations** (salary → negotiation, powerlifting →
strength training, data literacy → critical thinking), **5 keeps**, and
**1 rule 22 question** (self-discipline).
