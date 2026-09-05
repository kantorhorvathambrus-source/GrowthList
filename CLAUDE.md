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

   **The credentialed variant: a mapping made from a CV.** The halo
   effect is usually described as fame leaking across categories — she
   is excellent at X, so surely also at Y. It has a second form that is
   harder to catch because it feels like diligence rather than
   laziness: **the credential leaks instead of the fame.** The person
   genuinely is a leading scholar of the subject, so the mapping feels
   not merely defensible but obviously correct — and the evidence string
   ends up describing who they are rather than what this channel
   contains.
   The live case is Hans-Georg Moeller (`@carefreewandering`), a
   philosophy professor at the University of Macau and a well-known
   Western scholar of Daoism, and therefore the obvious first pick for
   `eastern-philosophy`. A keyword scan of **all 86 of his uploads** for
   Daoism, Taoism, Zhuangzi, Laozi, Confucian and Chinese returned
   **zero long-form hits**: the channel is contemporary social
   philosophy, and the Daoism is in his books. He is excluded and the
   reasoning is in `UNVERIFIED.md`.
   The test that catches it: **read the `evidence` string on its own and
   ask whether it describes videos or describes a person.** "A leading
   scholar of X" is a fact about the creator. "Four long-form videos on
   X, running 20–70 minutes" is a fact about the channel, and only the
   second kind is admissible.

   **The sharper test, once categories are shallow rather than empty:
   would this mapping count ONE body of work twice?** Not "is the
   creator competent in the second area" — competence is easy to argue
   for and the argument is usually true, which is what makes it a bad
   test. Ask instead whether the evidence for the second mapping is
   *different videos* from the evidence for the first.
   The case: Viktor Farcic (`@DevOpsToolkit`) genuinely covers delivery
   pipelines and Kubernetes infrastructure, and `cloud-computing` was
   sitting at one creator. But the evidence for both is **the same
   ninety-minute question-and-answer streams** — his subject is platform
   engineering, which this taxonomy splits in two. One mapping, and the
   reasoning went on his visitor-facing card rather than only into the
   log.
   This test gets harder to rationalise around than competence does,
   and it matters more as the depth pass runs: a creator who could
   plausibly land in four shallow categories is a far bigger temptation
   than one who fills a single empty one.

   **The same substitution happens with REPUTATION in place of a
   credential, and it is the more common case.** Jeff Su (`@JeffSu`,
   1M–5M) is widely known for workplace and career content, and
   `career-change`, `remote-work` and `workplace-politics` were all
   empty — three categories pulling at once. A keyword scan of **300
   uploads** for career, promotion, manager, workplace, politics,
   feedback, meeting, email and resume returned **one** long-form hit: a
   resume video, in a category that already had creators. The catalogue
   is short-form AI-tool tips.
   Keep this as the worked example precisely because **nothing dramatic
   happened**. The scan was one command, it settled the question, and
   the alternative was a mapping made from what I remembered about him.
   That is the halo effect handled as routine rather than as a
   judgement call — which is the only way it stays handled.
5. **English-language only**, everywhere: creators, UI copy, data.
   `language` is normally `"en"`. Country/accent do not matter and must
   not be used as an exclusion signal — only primary upload language does.

   **Named exception — language-acquisition categories.** A creator may
   have a non-English `language` if, and only if, every category it maps
   to is in `LANGUAGE_EXEMPT_CATEGORIES` (`scripts/validate.mjs`;
   currently `language-learning` alone). The reasoning, and it is not a
   loophole: in comprehensible-input and immersion teaching, **the target
   language IS the pedagogy**. Dreaming Spanish teaches Spanish in
   Spanish because hearing language you can almost follow is the method;
   an English-narrated version would be a different and worse resource.
   Excluding those channels would not enforce a language standard, it
   would remove the strongest material in the category. This is the
   owner's explicit decision, taken after the exclusion was flagged
   rather than worked around — **do not read a non-English record in
   `language-learning` as a rule violation.**

   The exemption is deliberately narrow and enforced, not honour-system:
   - a non-English creator mapping to **any** category outside the exempt
     list fails validation, so a Spanish channel cannot ride the
     exemption into `public-speaking`;
   - a non-English creator **must** carry a `languageNote` explaining
     that the target language is the method, or it fails;
   - `languageNote` renders on the creator card and detail page, so a
     visitor is told before they click, not after;
   - `gate-check.mjs` still warns on a language mismatch — it just
     compares against the record's declared `language` rather than
     assuming English.

   Extend `LANGUAGE_EXEMPT_CATEGORIES` only for another genuine
   language-acquisition category. It does not mean "foreign-language
   content is fine here"; everywhere else rule 5 stands as written.
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
11. **A critic per category is a TARGET, not a rule — changed at 200
    creators.** It was a validator failure until then, at which point
    **29 of 180 populated categories had one (16%)**. A rule violated by
    84% of its subjects is not a rule; it is noise that trains a reader
    to skim the warnings that matter, which costs the checks that work.
    The structural reason it was mis-specified: **a genuine critic of a
    field is perhaps ten times rarer than a good teacher of it** — 19
    exist across 200 creators, and requiring one per category was
    requiring ~120 more of the scarcest type.
    Reported in `coverage-report.mjs` as **"categories with a dissenting
    voice: 29 of 180"** — always with the denominator, never as a failure
    line, and never enumerating the 151 as problems.
    **What has NOT changed:** a weak or bad-faith critic is still worse
    than none, and filling the slot to make a number move is still the
    thing this rule exists to prevent. Relationships and philosophy were
    both tested for a critic and left empty on those grounds.

10. **A test must never touch a real config filename.** Anything that
    creates, writes, or deletes a config or secret file during a test
    uses a temp directory or a distinct name (`.env.leak-test`,
    `/tmp/gl-fixture/.env`) — never `.env`, never `netlify.toml`, never
    a real data file. Cleanup then deletes only the throwaway path.
    This rule exists because a leak test in this project created a fake
    `.env` and removed it with `rm -f .env`, which would have destroyed
    a real key file had one been present. It didn't, but only by luck.
    The same applies to `data/` — synthetic fixtures live in `/tmp`.
11. **Never fill a critic slot with a weak or bad-faith critic.** Every
    category is supposed to have one `role: "critic"`. Where no
    credible one exists after the research is done, the category ships
    **without** one and the gap is stated explicitly in the coverage
    report. The owner's ruling, verbatim in substance: a weak or
    bad-faith critic is worse than none. A "critic" is someone whose
    own body of work argues against the category's popular claims from
    a defensible position — not a rival seller, not a contrarian, and
    not someone whose only qualification is disagreeing loudly.
    Document each accepted gap in `data/critic-gaps.json` with the
    reason; `validate.mjs --final` treats a documented gap as reported,
    not as a failure, and an undocumented one still fails.
12. **Eight categories are higher-stakes, and there an empty category
    beats a mediocre one.** `data/high-stakes.json`, **owner-confirmed
    and in force**: `addiction-recovery`, `injury-rehab`,
    `back-pain-management`, `grief-and-loss`, `supplements-literacy`,
    `therapy-literacy`, `first-aid`, `camping-and-outdoor-skills`.
    In these: prefer a documented gap to an adjacent
    creator; expect `credentialed` or say plainly why the creator is
    trustworthy without it; state in `notFor` and `caveats` that this is
    education rather than assessment; and if a creator's framing
    discourages professional help, name it rather than soften it.
    `supplements-literacy` is the one **definitional** case — the
    category exists to teach someone to judge supplement claims, so a
    creator who sells supplements works against its purpose and is
    disqualified rather than merely flagged.
    **Three distinct rationales now sit in this file and they are not
    interchangeable.** Six categories are here because bad advice is
    costly over time; `first-aid` and `camping-and-outdoor-skills` are
    here for reasons of their own, both narrower, and neither
    generalises to the other.

    `camping-and-outdoor-skills` (batch 21) is **verification
    structurally unavailable** — and the owner was precise that this,
    not stress, is the load-bearing part. **Checking is impossible at
    the moment of use:** no signal, no second source, nobody to ask, and
    the consequence lands before reconsideration is possible. That is a
    tighter test than stress, and it is exactly why
    **`car-maintenance` and `home-repair-diy` were proposed and
    rejected** — those are bench-side, pausable and checkable, so the
    viewer keeps the ability to verify. The owner's ruling on that:
    *physical harm alone was always too loose a test — if it qualified,
    rule 12 would cover half the taxonomy.* Within the category, it is
    navigation and judgement about conditions that carry the risk; gear
    reviews and trail guides do not.

    `first-aid` was added in batch 19, owner-confirmed, and its
    rationale is **deliberately narrower than the other six and must not
    be generalised**. It is not that bad advice here is costly over
    time. It is that the content is recalled **under acute stress by
    someone with no capacity to evaluate it in the moment** — no time to
    check a second source, no attention left to notice that a presenter
    is confident rather than qualified. Everywhere else the visitor
    keeps some ability to judge what they were told; here the situation
    is precisely what removes it. The test before reaching for this
    reasoning again is not "does the subject sound serious" — it is
    **"is this acted on under stress, from memory, with evaluation
    impossible?"**

    **Neither of these two tests is "could someone get hurt."** Ask what
    the viewer's situation takes away: `first-aid` takes away attention,
    `camping-and-outdoor-skills` takes away access to any check at all.
    A category where the viewer can pause, re-read and ask somebody does
    not qualify however dangerous its subject.

    I originally proposed ten categories; the owner cut four
    (`fat-loss`, `anxiety-management`, `emotional-regulation`,
    `hormonal-health`) because applying it there would have bought my
    caution at the price of most of the mindset domain. **`gut-health`
    was proposed in batch 43 and declined on the same ground, and the
    reason generalises: the cost-over-time rationale is the loosest of
    the three and can be argued for most chronic-health categories.**
    If it carries `gut-health` it carries `fat-loss` and
    `hormonal-health` too, and then rule 12 covers the health domain
    instead of marking anything out within it. A test that selects
    everything selects nothing. Delayed diagnosis in `gut-health` is
    handled where it belongs — in the category's own beginner level,
    which now names the symptoms that mean stop self-managing, and in
    the creators' caveats. Treat this as the boundary marker for the
    cost-over-time rationale: it earns a rule 12 note only where the
    cost is specific to that subject rather than generic to chronic
    illness. All five go under rule 13 like everything else.
    **Do not add a category to this file without asking** — narrowing
    the candidate pool is the owner's call. Three times now the owner has
    had to trim or qualify my instinct here — but **do not read that as
    an instruction to stop proposing.** The owner's
    ruling on this is explicit: *"Keep proposing when you think it
    applies; I'd rather trim than miss."* The error in the other
    direction — failing to flag a category that genuinely warrants rule
    12 because a trim is anticipated — is **as costly and much harder to
    see**, because a proposal that was never made leaves no trace in the
    record while a trimmed one does. The asymmetry is the whole point:
    over-proposing is visible and cheap to correct, under-proposing is
    invisible and correctable by nobody. Propose it, say why, and let the
    owner decide.

13. **Commercial interest is disclosed, not silently excluded.** The
    project's normal handling is a signal — `sells-course`,
    `sponsor-heavy`, and now `commercial-conflict` for a creator who
    profits from the specific *decision* the content advises on rather
    than from selling teaching about it (a rehab chain discussing
    treatment, a broker discussing investing). Excluding on conflict
    alone is a stricter standard than this project applies anywhere
    else, and it hides the creator from a visitor who will meet them on
    YouTube regardless, without our caveat attached.
    **The test for exclusion: would this be included if a non-profit
    ran it?** If yes, the objection is conflict — include it with the
    signal and a caveat naming the conflict plainly. If no, the
    objection is content, and that is the reason to record.
    This rule exists because The Recovery Village was excluded on
    conflict, the owner challenged it, and re-examination showed the
    real disqualifier was that its long-form output is patient
    testimonials and admissions marketing. Right outcome, wrong reason.
19. **The taxonomy is uncapped; admission is funding-gated.** Owner's
    decision at 222 creators, replacing the 200-category target.
    **A new category may be added at any time, with no ceiling — provided
    it arrives holding at least 3 creators of its own.** `addedAt` on a
    category record marks it as admitted under this rule;
    `validate.mjs` **fails** any such category below 3. The original 197
    carry no `addedAt` and are grandfathered: they were specified before
    the rule and are being filled, not admitted.
    **Why gate rather than cap.** The two numbers are the same dial from
    opposite ends. 400 creators at the 1.43 mappings-per-creator ratio
    the scope rule produces is ~573 mappings; depth 3 across 197
    categories needs 591. **The creator cap does not fund the taxonomy
    that already exists**, so before this rule every added category was
    taking ~2.1 creators out of a budget already committed, while 16
    categories sat empty. An expanding taxonomy also pushes directly
    against rule 4 — more categories means more places a creator could
    plausibly be mapped, which is the pressure the second-or-later
    metric exists to watch.
    Under the gate, breadth pays its own way: a category cannot exist in
    a half-funded state, so growth never dilutes what is already here.
    **If breadth at current depth is wanted, the honest lever is a
    larger creator number, not more categories against a fixed one** —
    250 categories at depth 3 needs ~525 creators.

18. **Four failed probes is not a finding.** A structural claim about a
    field — "the practitioners here publish in text, not video", "the
    certifying bodies use YouTube for campaigns rather than
    instruction" — is a real and valuable kind of result, and it is
    also the most flattering thing a search can produce, because it
    converts *not having found anything* into *having discovered
    something*. The two are indistinguishable from the inside.
    **A structural finding must survive a deliberate attempt to
    disprove it, not merely an absence of hits.** Before writing one
    down: name what would falsify it, then go looking for that
    specifically.
    The live near-miss is `git-and-version-control` in batch 22.
    Fireship returned zero long-form hits across 250 uploads, GitHub's
    channel is product marketing and podcasts, Coding Garden is
    four-hour livestreams — three failures in a row, and the
    text-not-video pattern was already established in marketing, so the
    conclusion was sitting there ready to be reached. **It would have
    been wrong.** One more round of probing found The Modern Coder,
    whose fundamentals video defines the working directory, staging
    area and repository as three places a file can be — exactly the
    mental model the category asks for.
    The two findings that *have* earned the label were tested this way:
    marketing survived a direct attempt to falsify it (Harry Dry has 4
    uploads, Seth Godin 7, and copyhackers, backlinko, CXL, HubSpot and
    Klaviyo do not resolve at all), and `first-aid` survived reading the
    large channels rather than only counting them — the American Red
    Cross has 2,180 uploads and its long-form is blood-donation
    interviews.
    **A real finding is one you tried to break.** An absence of hits is
    a report about your search, not about the world.

    **The named failure mode: a finding from one end of a domain,
    applied to ends you never searched.** This is the halo effect's
    sibling — there, evidence about a creator leaks across categories;
    here, evidence about a *sub-area* leaks across a domain. It is
    harder to see because the reasoning is sound at every step except
    the last one.
    What happened: the marketing text-not-video finding was made after
    probing the **SEO end**, where the vendor pattern is real and
    documented. It was then stated as a claim about *marketing*, a
    domain whose copywriting, sales and affiliate ends had **never been
    probed at all**. Three batches later, probing those ends found Alex
    Cattoni (848 uploads, a real copywriting curriculum), Pat Flynn
    (four 70–85 minute affiliate workshops) and 30 Minutes to
    President's Club — and the standing note built on the finding had to
    be retired.
    Nothing was wrong with the observation. What was wrong was the
    scope of the claim made from it.
    **So: a structural claim about a domain requires evidence from
    across that domain, not from the first sub-area you happened to
    search.** Before writing one down, list the domain's sub-areas and
    say which ones you actually probed. If the answer is one, the
    finding is about that one — name it that way, or go and search the
    others.

    **Enforced, not honour-system.** Every entry in
    `data/thin-gaps.json` carries
    `rule18: { testedAt, subAreas[], probed[], outcome, whatWasTried }`.
    `validate.mjs` treats a gap with **no** `rule18` block, or one whose
    `probed` does not cover its own `subAreas`, as **unfinished rather
    than documented** — the owner's ruling, and the right one: a gap
    nobody tried to disprove is indistinguishable from a search that
    stopped early. `coverage-report.mjs` prints the outcome and the
    sub-area count per gap.

    **A falsified finding keeps a `corrected` field** stating what the
    entry originally claimed and why that was wrong, rather than being
    quietly rewritten. Validated: `outcome: "falsified"` without
    `corrected` fails. The reason is that a silently edited entry loses
    the only thing that distinguishes *a measurement that moved* from
    *a claim that was always wrong* — and it is the second of those that
    a future reader needs to be warned about.

    **The ledger. `data/findings-ledger.json` holds every structural
    claim this project has made and what happened when it was tested.**
    `coverage-report.mjs` prints it **first**, before any coverage
    number — the owner's requirement, and the reasoning is that a
    directory which has never falsified one of its own findings has
    either been lucky or has not looked. **The final Phase 2 report
    leads with this ledger** — before any coverage number.

    **How to state it.** "Six of ten claims did not survive" is accurate
    and reads as an indictment of the dataset. It is a description of the
    process: **this project tested ten of its own claims and found six
    wrong — and the alternative was not six correct claims, it was six
    wrong ones nobody checked.** Report both figures together: how many
    were falsified, and **how many had reached visitors before being
    caught**. The second is the line between an internal process finding
    its own errors and a dataset that shipped them.
    **Currently 6 of 10 wrong, 4 of those 6 live on the site.** Do not
    round that off or lead with the kinder half.

    **Running score: 10 tested, 6 falsified, 4 of the 6 reached
    visitors. Every falsification was made without probing every
    sub-area, and three were inward-facing.**
    The worst was `badges-are-our-inclusion-rules`: the claim that
    `practitioner` saturates because *we require it*. It was **never
    probed at all** when made in batch 17, was repeated in every batch
    report through 25, and was **shipped to visitors on the colophon as
    a statement about our own rigour.** It is false — 29 of 196 creators
    carry no `practitioner` badge, and the share runs 100% in marketing
    and fitness to 14% in philosophy, where an inclusion rule would be
    near-uniform. All fifteen affected entries were reclassified from
    `selection` to `field` and moved to the category pages, and the
    colophon now reports the real finding: badges track how a subject is
    taught, not who we let in.
    **INWARD-FACING CLAIMS ARE A NAMED CLASS, AND THE MOST DANGEROUS
    ONE.** Rule 18 was written pointing outward — at domains, supply,
    categories. The failures that hurt most pointed inward: claims about
    our own criteria, rigour or process. They feel settled *because* they
    are about us, so they get repeated rather than queried.
    **Any statement of the form "we never X", "every creator has Y", "we
    only include Z", "typically N" is an empirical claim about the data
    and must be measured before it ships — and re-measured, because the
    data moves under it.** The cheapness is what makes it invisible: a
    claim answerable in one query is the one nobody thinks to run.
    Two have failed so far, both live on the site: the badge-inclusion
    claim (nine batches), and "typically two to four skills per creator"
    when the median is one and had been for months.
    **Enforced:** `validate.mjs` now asserts the site's self-descriptions
    as tests — every record API-verified, every creator with a size band
    and stamp, every mapping with an attributed entry video, the primary
    and total mapping caps. If the data stops matching the copy, the
    build fails rather than the copy quietly becoming false. The colophon
    computes its numbers instead of stating them.

    **Numbers sourced from a spec, not a query, must be marked as such
    at the point they are written.** The owner's addition, and the
    sharpest diagnosis of the whole sequence: rule 4's "2–4 categories"
    was a *target*. **The sentence never changed — only its job did.**
    It was written as an intention and later read as a description, which
    is why no review caught it: there was nothing to catch, only a
    provenance nobody could see.
    So in visitor-facing copy: a **measured** number is computed at
    render and cannot decay; a **target** number must carry a hedge
    ("we aim for", "never more than") that tells a reader it is an
    intention. `colophon.js` marks each one inline, and `validate.mjs`
    fails a modal-count stated as a literal rather than interpolated.
    **A claim that decays as the data moves is worse than one wrong at
    the start**, because only the second is caught by a first check.

        **The uniform-versus-spread detector**, kept because it is what
    caught the badge claim and it is cheap to apply to any future
    saturation claim: **a rule of ours produces near-uniformity across
    domains; a fact about the world produces variance.** `practitioner`
    ran 100% to 14% — a 86-point spread — which is not what a
    requirement looks like. `validate.mjs` fails any entry marked
    `cause: "selection"` whose signal varies by more than 50 points
    across domains.

17. **A badge everyone in a domain carries is a fact about the field or
    a fact about us — and the two belong on different pages.**
    `data/domain-notes.json` holds one entry per `(domain, signal)` that
    saturates. A signal is **saturated** at 70% of a domain's creators,
    and a domain under **4 creators is not measured at all** — 1 of 2 is
    50% and means nothing.
    Every entry carries `cause`, and **cause decides placement**:
    - `field` → `category-page`. Paid courses in fitness, commercial
      interest in marketing. This tells a visitor what they are walking
      into, so it earns space on a page about a skill.
    - `selection` → `build-page` (`#/how-this-list-was-built`).
      `practitioner` is at 100% in fitness, programming and productivity
      **because it is our own inclusion rule** — we do not list someone
      explaining a skill they have never practised. That is
      meta-commentary about how the list was built, and reading it in the
      middle of a page about learning a skill is a small tax on the
      visitor for a fact about our editorial process. It belongs with the
      rest of the rules.
    Getting the cause wrong is the same class of error as rule 14:
    presenting a limit of ours as a finding about the world. The
    validator **fails** any entry whose placement contradicts its cause,
    fails a `category-page` entry with no text of its own, fails a
    saturated signal with no entry under `--final`, and **warns whenever
    an entry's stored counts have drifted from live data** — so a note
    cannot quietly start lying as batches land. Questions that cannot be
    measured yet go in `open[]` rather than being guessed at.
    **Current state: 11 saturated signals — 3 field-caused on category
    pages, 8 selection-caused on the colophon. Marketing's
    `commercial-conflict` entry is `editorial` (n=2) and flagged for
    re-measurement; whether `sells-course` saturates in business is
    unanswerable at n=2 and logged open.**

16. **Jurisdiction is metadata, not a reason to raise the minimum.**
    `data/jurisdiction.json` names the categories where tax, law or
    regulation makes advice non-transferable, and any creator mapping to
    one **must** carry a `jurisdiction` field — validated, with
    `"general"` as the honest value when the content genuinely
    transfers. A `jurisdictionNote` says what specifically does and does
    not carry across. The owner's instruction was explicit: do **not**
    solve this by requiring more creators per category. Five US creators
    is not coverage for a UK visitor, and fifteen creators is not the
    fix — the fix is telling the visitor which ones apply to them.
    The card shows `"UK only"` and similar where it constrains the
    viewer, never on a `general` creator. The category page grows a
    country filter only where jurisdiction actually varies within that
    category, and a `general` creator survives every country filter.
    `coverage-report.mjs` names any flagged category with no creator for
    a major English-speaking market — a documented gap of a different
    kind, and one a passing creator count would otherwise hide.
    **Current state: run `coverage-report.mjs`, which recomputes it. As
    once written here: AU had no creator in 11 of 12 flagged categories,
    UK in 9, CA in 8, US in 7.**

15. **A retroactive mapping clears a higher bar than a first-pass one.**
    Re-mapping a creator already on file is cheaper than researching a
    new one, so there is a standing pull toward finding one more
    category in someone we already have. That is the halo effect wearing
    a new hat, and the incentive runs exactly against rule 4.
    A mapping added after its creator's own batch must carry
    `addedLater: { batch, trigger, whyNotAtFirstPass }` — validated, not
    optional. `trigger` says what specifically prompted revisiting the
    creator. `whyNotAtFirstPass` says why the evidence was not obvious
    the first time.
    **If the honest answer to `whyNotAtFirstPass` is "I was looking for
    a way to fill this category", the mapping does not belong.** A
    legitimate one reads like "the record was written during a
    communication pass and this is a management category" — out of
    scope then, not newly invented now.
    `coverage-report.mjs` tracks retroactive against first-pass
    mappings and prints every trigger, so the owner can tell at batch 40
    whether the ratio improved because the data was under-mapped or
    because the bar drifted. **Current state: run `coverage-report.mjs` — MAPPING PROVENANCE
    computes it. The snapshot once written here said 6 of 188 (3.2%);
    the numerator held while the denominator nearly doubled, so the real
    figure halved while the prose kept the old one, and all six were triggered by an empty
    category** — which is the pattern this rule exists to watch. Two of
    them (Cal Newport and Carl Pullein on inbox-and-email-systems) say
    so in their own records rather than dressing the trigger up.

14. **A documented gap must say whose fault it is.** Every entry in
    `data/thin-gaps.json` carries `gapCause` (`absent-supply` |
    `our-criteria` | `mixed`) and `countUnderLooserStandard`, so a
    category that is thin because our own rules rejected candidates is
    never mistaken for one that is thin because nothing good exists.
    The owner's requirement, and it is the difference between a limit
    of the field and a limit of ours.

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

### Category (`data/categories.json`, array — uncapped, see rule 19)

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
nonexistent category id; missing required fields (`notFor` included);
malformed `channelUrl`; missing/unverified `entryVideo` on a
`verified:true` creator; a `why` under 20 characters; duplicate `why`
strings within one creator; `longDescription` under 200 characters; a
`profile` axis outside 0–4; a `signals` entry outside the fixed
vocabulary; any `language` ≠ `"en"`; placeholder text.

`country` is **optional** — the API genuinely returns none for some
channels (Toastmasters, ReasonIO). `null` is the honest value; never a
guess.

**Placeholder detection** is two regexes, not one. Uppercase markers
(`TBD`, `TODO`, `FIXME`, `XXX`, `WIP`) are matched case-sensitively,
because "todo list" is a real category alias. Phrases (`lorem`,
`placeholder`, `example.com`, "example creator", "your … here") are
matched case-insensitively. A bare lowercase `example` is **not** a
placeholder — it is a word people legitimately write in a description.

**Coverage** (**2+** creators per category since batch 45, a `critic`
where one exists, all three levels) is
a property of the *finished* dataset. While batches are landing it
reports as **warnings**, and categories no batch has reached yet are
counted in one line rather than enumerated. Run
`node scripts/validate.mjs --final` to make coverage fail again — that
is the definition-of-done check, not the per-batch one.

**Warns on:** a creator spanning >2 top-level domains without
`scopeNote`; a creator `primary` in >4 categories; every coverage gap
(see above).

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

- **Current phase**: Phase 2 (creator research). **Batches 01–47 are
  written, gated, validated and committed.**
- **Repo**: `kantorhorvathambrus-source/GrowthList`, on `main`.
- **PHASE 2 CLOSING ARITHMETIC (measured at 233 creators, against
  ACTIVE creators — the paper count is 4 categories more generous).**
  Measured after batch 47: **97 of 197 at target with active
  creators**. **117 mappings still needed**, ≈109 creators, leaving ~54
  of the 400 cap for the depth-3 priority list.
  **ONE RATE, MEASURED: 2.27 creators/batch** (34 over batches 33–47).
  117 mappings ≈ 109 creators ≈ **48 batches.**
  The "5/batch discovery-assisted, 23 batches" figure is **WITHDRAWN**.
  It was never observed: discovery-sourced batches 44–45 ran at 2.50,
  the recall-sourced batch 46 at 3.00, the earlier mixed run at 2.27.
  **Discovery changes which creators are findable, not how many per
  batch** — that is the part that was measured, and it is real.
  Third pace projection, third failure, same shape each time: measure
  the mechanism, then assert the rate the mechanism was meant to
  produce. Do not offer an optimistic figure alongside the measured one;
  there has never been evidence for one.
  The work is not where the depth pass has been: **business 16,
  career 15, mindset 13, money 13, marketing 13** — 70 of the 121 —
  while health, philosophy and programming need 7 between them.
- **Creator count: 237 of 400.** Taxonomy 197 and **uncapped** (rule 19)
  — a new category may be added whenever it arrives with 3 creators.
- **Fitness is complete at 2+ across all 14 categories** (3 at depth 3).
- **182 of 197 categories populated; 15 empty.** Practical is 13/13.
  **Against the depth-2 target: 98 categories are done, 84 sit at 1,
  15 at 0.**
- **Depth pass started (batch 32).** With the goal at 3, the faster path
  is depth in populated categories, not the last 17 hard empties.
  Full: fitness, communication, creativity, learning, philosophy,
  **tech, programming**. Practical 12/13 — its only hole, `first-aid`,
  is a documented gap by design rather than unfinished work.
  Thinnest: **business 7/13**, productivity 7/9, marketing 10/13.
- **Untouched domains: none.**
- **Practical's only hole is `first-aid`**, a documented gap by design
  (rule 12) rather than unfinished work. The other three that were empty
  — `travel-planning`, `camping-and-outdoor-skills`,
  `personal-style-and-grooming` — are filled.
- **Health is the current depth pass (batch 42 on).** 12 categories.
  `gut-health` filled from the gastroenterology end in batch 43;
  `sports-nutrition`, `posture-and-ergonomics` and `meditation` reached
  2 in batch 44. Still at 1: **`breathwork`, `fat-loss` is at 2,
  `sleep-quality`**. Breathwork was probed at the physiology-lecture,
  Buteyko and coaching ends and produced nothing that was not a second
  copy of the frame already there; the respiratory-physiotherapy,
  wind-instrument and clinical-anxiety ends are unprobed. Sleep's
  long-form search is swamped by sleep-aid audio, which is a limit of
  the search, not a finding about the field.
- **Relationships has no critic anywhere** (rule 11 — flagged, not
  filled). `making-friends-as-an-adult` is the one empty category left in
  the domain.
- **Jurisdiction metadata is live** (rule 16). AU is unserved in 11 of
  12 flagged categories, UK in 9, CA in 8, US in 7.
- **Domain standing notes: the arc, kept as history** (rule 17, now
  retired). They were split by cause: 4 field-caused notes on category
  pages, 15 selection-caused ones on the `#/how-this-list-was-built`
  colophon. Marketing's is `editorial`
  at n=2; `sells-course` in business is unanswerable at n=2, logged open.
  **Fifteen entries were reclassified in batch 26** after the claim
  underlying them was falsified — see the ledger.
  **The marketing note has been RETIRED** — written editorially at n=2,
  confirmed at n=6, falsified at n=9 (6 of 9, 67%) when rule 18's
  disconfirmation attempt found three practitioners working in video.
  Its full arc is kept in `domain-notes.json` under `retired` rather
  than deleted, because a note that was written, confirmed and then
  falsified is a more useful record than one that vanished.
  Batches 17–20 exercised the mechanism for real: every new domain
  surfaced saturated signals on its first pass and several stored counts
  drifted — all caught by the validator, none by noticing.
  **Both questions the owner asked are now answered from data.** Business
  `sells-course` is 3 of 5, **60% — it does not saturate**, so no note
  (caveat: one creator either way flips it). Marketing
  `commercial-conflict` is 5 of 6, **83% — the editorial note written at
  n=2 is confirmed by measurement** and its `basis` flipped from
  `editorial` to `measured`, with the provenance kept so the record shows
  it was a prediction first.
- **Categories with a dissenting voice: 30 of 181**, carried by 21
  critic creators out of 225. A target since 200 creators, not a
  validator rule — see rule 11.
- **DEPTH TARGET IS 2 PER CATEGORY**, restated from 3 at 231 creators
  (from 5 at 200 before that). Three restatements is itself the finding:
  each one chased a mapping ratio that was falling for a structural
  reason, not a fixable one. **A depth pass yields 1.00 by
  construction** — it names one thin category and fills it with a
  specialist who legitimately belongs only there, and rule 4's
  double-counting test forbids the second mapping that would lift the
  ratio. That was knowable before it was predicted otherwise; it is in
  the rule 18 ledger as `depth-pass-raises-the-ratio`.
  The arithmetic that settles the number: depth 3 across 197 categories
  needs 591 mappings against 326 held, and the creators left under the
  400 cap would have to arrive at a 1.56 ratio — higher than the project
  has ever sustained even when every category was empty.
  **Measure the distance per category, never as a total.** Mappings are
  not fungible: a category already at 4 does not help one at 0. The
  correct figure is `2×(categories at 0) + (categories at 1)` — 116
  mappings, about 108 creators at the current 1.08 marginal. I first
  reported this as 71 mappings and ~66 creators by subtracting the total
  from 197×2, which silently counted surplus depth as progress. The
  owner chose the target on the wrong number; the direction survives the
  correction and the number did not.
- **THE FORGOTTEN KNOWN — a class of its own.** The clear-before-write
  pattern was **already in this repository**, correct, in
  `build-data.mjs`, explained in that file's own comment. It did not
  transfer to a script written weeks later for the same job. That is
  not an unknown and not a wrong belief: it is a solved problem that
  did not travel. Distinct from the other classes — nothing was stale,
  no schema failed, no number was unproduced — and the owner's read is
  that it is probably **more common than either of us would guess**,
  because it leaves no trace. A stale fact drifts visibly; a forgotten
  known just quietly fails to appear in the next place it was needed.
  **Before writing a new script, grep the repo for the problem it
  solves.** The answer may already be here with its reasoning attached.
- **AN INEXPRESSIBLE GAP ESCALATES; IT NEVER GETS AN INVENTED VALUE.**
  The standard response wherever a closed vocabulary cannot say "we
  could not check": no placeholder, no best guess, no silently retained
  old value — **exit non-zero and name the record.**
  `audit-status.mjs` does this when a channel stops resolving, because
  `status` has no way to express the doubt. Where a gap *is* expressible
  the rule is the opposite and equally firm: leave it unset, as
  `derive-entity.mjs` does for its 73 ambiguous records. Wrong confident
  values are the thing both rules exist to prevent.
- **A SCRIPT THAT WRITES A DERIVED FIELD MUST CLEAR BEFORE IT WRITES.**
  Seventh instance of a stored fact that stopped being queried, and the
  first *inside the defence itself*: `derive-entity.mjs --write` only
  ever set `entity`, so tightening the vendor rule left records
  classified by the old rule untouched. **This is a property of any
  derivation script whose rules can change**, not an accident, so all
  five writers were swept.
  `build-data.mjs` already had it right — it deletes every `listed`
  entry in `probed.json` and regenerates. The pattern was known and
  simply not applied.
  Two weaker instances closed: `audit-catalogue.mjs` left a stale
  measurement looking current when a channel failed to resolve (now
  marked `unresolvedAt`), and `audit-status.mjs` did the same for
  `status` — which has a **closed vocabulary with no way to say "we
  could not check"**, so it cannot be left as a gap and instead
  **exits non-zero** and names the record. `resolve-creator --record`
  is append-only and exempt.
  **The test for any new writer: if a rule tightens, or a source goes
  away, does a confident value survive that nothing would now produce?**
- **EVERY NUMBER ABOUT OURSELVES NAMES ITS ARTIFACT —
  `data/claim-artifacts.json`.** The tooling sweep asked which rules
  never ran; this asks **which numbers never came from anywhere.** Two
  found with no producer at all. The contrast claim — 22 pairings, all
  passing AA — from a script that has never existed. And **"79% of every
  record is hand-written prose"**, which nothing has ever computed; the
  real figure is **65%**, and that number was load-bearing, because it
  was the stated reason the bottleneck was "the prose, not the quota".
  Four more are stale snapshots of numbers an artifact does recompute —
  among them "6 of 188 mappings are retroactive (3.2%)", where the
  numerator held while the denominator nearly doubled, so the true share
  halved while the prose kept the old one. Those now point at the
  artifact instead of restating it.
  **The rule: a number describing our records, our rigour or our process
  must name the thing that computes it, in the same sentence. If no
  artifact exists, build it or delete the number.**
  A measurement with no producer cannot be checked, cannot be corrected,
  and is the only kind of claim that never gets the chance to be wrong —
  logged in the ledger as its own class, `never-even-wrong`.
- **RULES THAT NEED MANUAL REPETITION ARE NOT IN FORCE —
  `data/procedure-audit.json`.** A distinct failure class from a stale
  fact: the rule existed, this file claimed it was in force, and it had
  never once run. **Four found. Two never ran at all** — "gate-check
  over every batch file" (the script took one path, so the rule meant
  45 hand invocations) and "contrast verified by script: 22 pairings,
  all passing AA" (**no such script had ever existed**; git has no
  record of one being added or deleted). One is mostly not followed —
  MARKUP.md co-commits, 2 of the last 16, including my own this batch.
  One was stale for 44 batches — the definition-of-done tracker still
  said 200 categories at 5 creators and 700 creators.
  **The test is not "is this rule good" but "can one command execute it,
  and is there evidence it ran".** A rule needing N manual repetitions
  will be executed zero times. Anything written here in the imperative
  gets that test before it is believed.
- **`entity` IS A SECOND AXIS ON EVERY RECORD — `scripts/derive-entity.mjs`.**
  `role` says what they do for the reader; `entity` says who is
  speaking: **individual / institution / vendor**. Split because it
  corrupted the depth-3 allocator, not for tidiness — a vendor and an
  individual teacher read as *agreeing* when they differ in kind.
  Derived from evidence, never guessed: an evidence ladder running from
  the creator naming themselves, through our own opening identity
  sentence, down to voice markers. **143 individual, 15 institution,
  2 vendor, and 73 deliberately UNSET** — a wrong value here corrupts
  the allocation this axis exists to protect, so ambiguity is left as a
  gap for judgement.
  In the allocator: **a vendor/non-vendor split disqualifies** an
  agreement finding; institution-versus-individual only **discounts** it.
  The first version disqualified both and suppressed the `injury-rehab`
  finding — the case that showed the test was worth having — over E3
  Rehab being a group practice and Squat University one clinician. They
  are not that category's widest disagreement; they are two rehab voices
  saying the same thing.
  **Four wrong rules were caught by reading the output, not by review:**
  `sells-course` treated as vendor evidence (E3 Rehab became a vendor
  beside Pianote); "hosting" matching a debating society *hosting*
  speakers; corporate voice alone making Cal Newport an institution; and
  `ORG_SELF` reading a professor's employer as their entity. Each was a
  confident wrong value, which is worse than a gap.
  **And the script had the defect it was written to fix:** `--write` only
  ever set `entity`, so tightening a rule left the old classifications
  in place — a stored fact that stopped being queried, introduced by me,
  in the tool built for that class. It clears before it writes now.
- **TWO DEFECT CLASSES, TWO DEFENCES — `data/schema-expressiveness.json`.**
  The first six were stored facts that stopped being queried; the
  defence is re-querying. `status` was different — wrong the day it was
  written because the SHAPE could not carry the truth — and the defence
  there is a one-minute test: *write the truest sentence about a real
  creator, then try to say it in the schema.* Swept every closed
  vocabulary. **`role` fails it**: Pianote, Buzzsprout, NNgroup and the
  Gastro Girl Podcast are organisations wearing the same word as a
  working dermatologist, 201 of 233 records say `specialist`, and the
  depth-3 "the two agree" test reads an institution and an individual
  as agreeing. **`signals` fails it**: absence cannot distinguish
  "checked, sells nothing" from "not recorded", and 81 records sit in
  that ambiguity. Both proposals are the owner's call — they are
  visitor-facing vocabulary changes needing existing records re-judged.
  `level` is partly limited and not worth fixing; `sizeBucket` and the
  open `formatTags` set pass.
- **CATALOGUE NUMBERS IN CREATOR PROSE ARE INTERPOLATED —
  `scripts/lib/catalogue-prose.mjs`.** The colophon fix applied to the
  place it was never applied: a record writes
  `{{shortCountWords|cap}} of the {{scannedWords}} most recent uploads`
  and `build-data.mjs` fills it from that record's own `catalogue`,
  fataling on an unknown placeholder. Word forms exist because the house
  style spells numbers out. **Required for new records. The existing 231
  are NOT retrofitted** — the cost is in `UNVERIFIED.md` and the owner
  accepted it knowingly.
- **THE GENERALISATION SWEEP IS DONE — `data/field-audit.json`.** Every
  displayed field, what produces it, and whether anything can catch it
  being wrong. **The question it started from was half wrong and the
  correction is the useful part.** I set out to find fields that had
  gone stale since research time. Nothing has: batch 01 was committed
  2026-09-01, today is 2026-09-05, and all 233 records read
  `dataAsOf: 2026-09` — correctly. `status` was never stale. It was
  **wrong the day it was written**, because a binary at 730 days could
  not say that Stronger By Science had already been silent eighteen
  months when we found it. So the sharper question, and the one the
  audit answers, is *which fields are produced by a rule that cannot
  express the truth* — and separately, which are unfalsifiable by
  construction and rest entirely on the writing (`level`, `profile`,
  `role`). Never let the rigour of the checked fields be read as
  covering those three.
  **Found wrong: 7 statuses, 2 renamed entry-video titles, 1 outgrown
  size band.** Found incomplete: 21 format-tag omissions.
  **A standing policy that the tooling made impossible:** "run
  gate-check over every batch file before any release" — the script
  took a single path, so it could only have been done by hand
  forty-five times, and never was. It takes `--all` now.
  **Pre-release, all three:** `gate-check.mjs --all`,
  `audit-status.mjs`, `audit-catalogue.mjs`. ~1,600 units of 10,000.
- **`catalogue` IS STORED ON EVERY RECORD — `scripts/audit-catalogue.mjs`.**
  231 of 233 records ship a countable claim about a channel's catalogue
  and not one was checkable, because the measurement lived only inside
  a sentence. The measurement is now stored beside the prose it was
  written from — the same pattern that catches drift in
  `domain-notes.json`. **The baseline starts at batch 45: this verifies
  no existing sentence, it means the next run can say which channels
  changed shape.** A regex over the 233 sentences was tried and
  abandoned — 16 flags, and the first two checked were both false
  positives, one of them accusing a record of hiding exactly what it
  states outright.
- **`status` IS RE-QUERIED, NOT REMEMBERED — `scripts/audit-status.mjs`.**
  It was written once at research time and never checked again, so a
  creator researched in batch 03 carried that word for forty batches
  while their channel did whatever it did. The first full audit at 231
  creators found **7 records disagreeing with the API**, five of them
  shipping `active` for channels silent 12–24 months — including
  Stronger By Science, the second creator in a category filled the
  batch before, and Andrej Karpathy. **Run it before any release.**
  The audit also exposed a gap in the rule itself: the threshold was a
  binary at 730 days, so a channel quiet for twenty-one months read as
  `active`, indistinguishable from one that posted this morning.
  **`dormant` now sits between them at 365 days** and renders as
  "Quiet for over a year". Sixth instance of a stored fact that had
  stopped being queried, and the first found in a field that ships.

- **THREE IS EARNED, AND SPENT DELIBERATELY.** The ~61 creators of
  headroom past depth 2 do not go to whichever category is being
  researched. `scripts/lib/depth3.mjs` ranks the claims, printed by the
  coverage report: **high-stakes** categories (rule 12) first, then
  **jurisdiction-split** ones (rule 16), then ones where **the two
  existing creators agree with each other** — same role, no critic,
  overlapping stance signals. That third test is the one that has to be
  computed rather than recalled: agreement is invisible from a category
  page, because both records look fine on their own. `injury-rehab` is
  the current worst case — E3 Rehab and Squat University, same role,
  100% stance overlap, and high-stakes on top.
- **Rule 17's classification machinery is RETIRED.** The saturation
  measurement stays in the coverage report; `cause`/`placement` and the
  category-page standing notes are gone. It never prevented an error and
  it manufactured one. Cost stated plainly: the true field-caused notes
  on fitness, marketing and three other domains went with it.
- **No further rule work** unless something ships false to visitors.
  Wants get noted and deferred to the end of Phase 2. Batch 18 added four —
  Ann Reardon on cooking and baking, Project Farm on car maintenance and
  home repair. **Relationships and philosophy have none anywhere** — both
  flagged under rule 11, neither filled.
- **Documented thin gaps: 3** (`addiction-recovery`, `first-aid`,
  `conversion-optimization`), **all carrying a rule 18 test** — the
  validator now treats an untested gap as unfinished.
  `first-aid` FAILED the test — its 13 probes were all institutions, the
  individual-clinician end was never searched, and searching it found
  PrepMedic at once. Rewritten from `absent-supply` to `mixed` with a
  `corrected` field. `addiction-recovery` SURVIVED: the clinician end
  turns out to be ASAM, archived since 2021 and addressed to physicians.
- **`copywriting` is populated** (Alex Cattoni). The batch-20 claim that
  its practitioners chose not to work in video was the same scope error
  as the marketing note and did not survive batch 23.
- **Rule 12 is now visible to visitors** (owner's call): each of the
  eight categories carries a short factual `visitorNote` rendered above
  the creator list, generated from `high-stakes.json` so the
  research-facing rationale cannot leak onto the site. `validate.mjs`
  fails a missing note and fails one written in the research voice.
- **Rule 12 now covers eight categories**, under three distinct and
  non-interchangeable rationales: six for cost-over-time, `first-aid`
  for acute recall, `camping-and-outdoor-skills` for verification being
  structurally unavailable. `car-maintenance` and `home-repair-diy`
  were proposed and rejected — bench-side work is checkable.
- **Affiliation fallback ledger: 11 rescues, 3 wrong, 0 written.**

### What is checked against memory rather than queried

Four instances of one defect, all caught by a check and none by looking:
the badge claim (nine batches), the mapping range (months), five drifted
measurements (batch 36), and a **complete second record researched and
written for a creator already in the dataset** (batch 41). The first
three produced false claims; the fourth produced **wasted research at a
point where research time is the binding constraint**, which makes the
class more expensive than it appeared.

**Swept at batch 42. What was being held in memory:**

1. **Which handles are already in the dataset** — the Sleep Doctor case.
   Fixed.
2. **Which handles have already been probed and REJECTED** — the larger
   hole, and silent: re-researching a channel rejected twenty batches ago
   produces no error at all, just cost. Hundreds of handles have been
   probed across 41 batches and the record was prose in `UNVERIFIED.md`,
   not queryable.
3. **Which handles resolve to nothing** — re-probed across batches. Cheap
   (1 unit) but pointless.

**The fix: `data/probed.json`**, cross-referenced automatically by
`check-handles.mjs`, which is the first command run on any candidate. It
reports `ALREADY IN THE DATASET`, `ALREADY REJECTED` or `KNOWN COLLISION`
with the reason and the batch. The *listed* half is **regenerated by
`build-data.mjs` on every build** — a hand-maintained list of who is
already in the dataset would be the same defect wearing a new hat. Only
rejections and collisions are appended by hand, in the batch that makes
them.

**Still memory-based, and accepted:** whether a creator already mapped to
a category should get another mapping. That one is judgement rather than
lookup, it is governed by rule 15's `addedLater`, and the coverage report
tracks retroactive mappings separately.

### Reputation drift — a finding, not an obstacle

`data/reputation-drift.json`, started at batch 34 on the owner's
instruction. **Every rejection of the shape "well-known name, catalogue
has moved on" gets an entry**, with what they are known for, what the
channel actually is now, and the scan that showed it — the number is the
point (*Sean Allen: 300 uploads scanned, 107 long-form hits, every one
the same weekly news roundup*).

Two reasons it is being kept. It is **the strongest evidence this
directory offers something a search engine cannot**: a person searching
"learn iOS" finds Sean Allen and has no way to learn that the teaching
moved behind a paywall and the channel is now a news show. And it may be
worth showing visitors — **that decision is deferred to the end of Phase
2, and no UI is to be built for it before then.**

The file also holds **handle collisions**, which are a separate finding:
9 person-name, 3 category-term, 3 acronym. The distinction matters
because `identityMatch` catches the first kind and structurally cannot
catch the second — hence `genericNameCollision()`.

Add to it in the same batch as the rejection, not later.

### Immediate next actions

1. Batch 03 onward. Check in with the owner every 5–6 batches, but
   update **this section after every single batch** regardless.
2. Per batch: probe candidate handles with `scripts/check-handles.mjs`
   → gather evidence with `scripts/evidence.mjs` → write
   `data/creators/batch-NN.json` → `node scripts/gate-check.mjs
   data/creators/batch-NN.json` (must be 0 failures) → `node
   scripts/validate.mjs` → `node scripts/build-data.mjs` → update
   `UNVERIFIED.md` and this section → commit → push.
3. Domain order so far: communication (01–02), then creativity,
   learning, mindset. Deliberately deferred candidates are named in
   `UNVERIFIED.md` — check it before researching, to avoid re-probing.
4. **Rotate the API key when Phase 2 finishes** — the owner stated this
   intent, and the key passed through the chat transcript to get here.
5. Phase 3's remaining work (200 four-week plans) needs creators to
   point at, so it comes after the dataset, not before.

**At the batch-06 check-in the owner wants two things, explicitly:**
(a) the critic-coverage report — which populated categories have a
critic, which will ship without one and why; and (b) the current
contents of `data/handle-rescues.json`, shown in full so the rescue list
is visible at a glance.

### The YouTube API key — `.env` in this container

`YOUTUBE_API_KEY` lives in **`/home/user/growthlist/.env`**, which is
gitignored. The original plan was a configured environment variable,
but it never reached `process.env` across two container restarts, so
the owner fell back to writing the file. `.env.example` carries the key
*name* only.

**The key currently in that file has passed through a chat transcript
and must be rotated once Phase 2 is done.** The owner has said they
will; if Phase 2 finishes and it has not happened, remind them.

- `scripts/lib/youtube.mjs` → `loadKey()` reads
  `process.env.YOUTUBE_API_KEY` first and falls back to the `.env`
  file. In this container the file is the live source.
- If the key is missing, **stop and say so.** Do not proceed with
  unverified research and do not substitute web search — search cannot
  verify video attribution (see "How Phase 2 verification works").
- Environment-variable changes need a fresh session or container
  restart. A key set mid-session will not appear in a running process —
  which is exactly how the env-var route failed here.
- **Never ask for a key in chat again.** It was unavoidable once; it
  should not be repeated. A key in a transcript is a key that must be
  rotated.
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

**Run the gate over the finished file, not just while picking.**
`node scripts/gate-check.mjs data/creators/batch-NN.json` re-resolves
every handle, re-fetches every `entryVideo`, and re-runs
`attributeVideo` against the creator's real `channelId`. It also
re-checks `title`, `durationMin`, `country` and `channelUrl` against
the API, because those are the fields that drift when a record is
typed by hand. **It earns its keep:** on batch 01 it caught three
titles that had been transcribed rather than copied — two straight
apostrophes where the real titles use `’`, and one truncated at
"…Speaking Career" when the API says "…Speaking Career with Josh
Shipp". Zero failures is the bar for committing a batch.

**Batch sizes are a ceiling, not a quota.** Batch 01 is 16 records
rather than 25 because only 16 candidates survived research. Two were
excluded outright (non-English; no usable long-form entry video) and
several probed handles turned out to be empty channels or different
people entirely. Write what the evidence supports, log the rest in
`UNVERIFIED.md`, and say the number plainly. Rule 1 outranks the
target.

**A name that matches the CATEGORY is more suspicious, not less.**
`identityMatch` catches person-name collisions, because a person's name
is specific enough that a description or upload titles can confirm it.
**Category words cannot do that work.** "Operations", "recovery",
"growth", "focus", "process" are generic enough that any channel in any
field carries them innocently, so a name match on a category term is
evidence of nothing.
The case: probing `@TheOperationsRoom` for `operations-and-process`
returned a 1M-subscriber channel called *The Operations Room* — **a
military-history animation channel** making battle maps of Pearl Harbor
and Midway. The handle matched the category term exactly, which is
precisely why it matched nothing useful.
`genericNameCollision()` in `scripts/lib/youtube.mjs` prints a warning,
surfaced by `check-handles.mjs --for <category-id>`. **Pass `--for`
whenever a handle was guessed from a category name rather than a
person's**, and read the uploads before believing any channel it flags.

**A failed handle is not an exclusion.** When a well-known person's
obvious handle does not resolve, or resolves to something that clearly
is not them (wrong content type, wildly wrong upload count, a bio that
never mentions them), run the second path before giving up:

```
node scripts/resolve-creator.mjs "Full Name" \
  --handle @obvious --handle @alsoTried \
  --affiliation "Their Firm" --affiliation "Their Book Title" \
  --record
```

Path 1 tries the handles at 1 unit each. Only when they all fail does
path 2 run — `search.list` for the name paired with each affiliation, at
**100 units per query**, which is why it must stay a fallback and why
`--affiliation` is mandatory rather than optional.

**The gate does not move on either path.** `identityMatch()` passes a
channel only when an affiliation term appears in its own description, or
recurs across at least two of its upload titles. A matching channel
*title* explicitly fails and is reported as "a name match is not an
identity match" — that is the exact trap that put a 10,150-upload book
podcast called "Chris Voss" in front of a search for the FBI negotiator.
This buys one more attempt at finding someone; it does not lower the
standard for keeping them.

The tool also checks whether the resolved channel is **already in the
dataset** under another handle, and says so. That check exists because
the batch-02 notes logged Chris Voss as "no channel found" while his
channel was already in batch 01 as `negotiationmastery`. An exclusion
note that contradicts your own data is worse than no note.

Every rescue — every case where path 2 found what path 1 missed — is
appended to `data/handle-rescues.json` with `--record`, so the miss rate
of the cheap path is measurable rather than assumed.

**Research efficiency rules** (the owner's call, none of them touch the
gate — the gate and the identity checks are unchanged):

- **Adaptive upload scanning.** `evidence.mjs` scans 50 uploads and
  escalates to 200 only when the first 50 hold fewer than 10 videos of
  8 minutes or more. Most channels declare their duration mix
  immediately; the 200-upload standard existed for shorts-heavy ones,
  and now applies only to them. `--deep` forces 200, `--quick` refuses
  to escalate.
- **Evidence in batches of 8–10 handles per call**, not 4.
- **No full scan on a candidate you will not write up.** Probe with
  `check-handles.mjs` (1 unit) to establish a channel exists and is the
  right entity; only run `evidence.mjs` once the creator has a category
  slot you actually intend to fill. Use `--quick` for triage.

The bottleneck was never quota — a batch costs 150–250 units of a
10,000 daily allowance. It is the volume of evidence output that has to
be read and the editorial prose that has to be written against it (65%
of record bytes are hand-written prose — measured at batch 45; the 79% this line carried for forty-four batches was produced by nothing). These rules cut the reading.

**GENERATE CANDIDATES BY QUERY, NOT BY RECALL — `scripts/discover.mjs`.**
For forty-three batches candidate handles came out of my own memory, and
by batch 43 that was producing dead channels, shorts-only channels,
wrong-audience channels and handle collisions at a rate that made the
reading the bottleneck: ~38 recalled probes and seven evidence dumps to
accept three creators. `discover.mjs` searches for LONG videos on a
topic, reports the channels behind them ranked by share of the results,
and labels each against `probed.json` before a single evidence call is
spent. Validated on `gut-health`, where I had ground truth: it returned
`@gastrogirl` at rank two — one of the two creators I had just accepted
— plus `@sameerislammd`, whose real handle three recalled guesses had
all missed.

**The policy it replaces was right in the context it was written for.**
`search.list` costs 100 units and was kept as a fallback because for
NAME RESOLUTION it is expensive per answer and often wrong. That is
true. I generalised it to CANDIDATE DISCOVERY, where 100 units buys
forty candidates at once, and never tested it there. **Fifth instance of
a rule validated in one sub-area and applied to one never tested** —
the same shape as the four in the rule 18 ledger, this time in a policy
rather than a claim.

**Where discovery works and where it does not.** It is strong when the
topic maps to a profession with a talking-head culture: gut-health
returned practising gastroenterologists immediately. It is weak in four
measured ways. (1) `videoDuration=long` means over twenty minutes, so a
small dense catalogue never ranks — Dr. Will Bulsiewicz (45 uploads,
median 15m) does not appear for gut-health while a 2,171-upload channel
does. (2) Where the topic word also names an audio product it returns
the product: `meditation` and `sleep-quality` come back as guided-audio
and sleep-music libraries. (3) Where the long-form is marketing it
returns marketing: `posture` returned clinic channels, an insurance
broker and two chair vendors. (4) Where the topic word names the MEDIUM
it returns instances of the medium: `podcasting` came back as Joe Rogan,
NPR, GQ and the Daily Beast rather than anyone teaching podcasting.
(5) Where the BUYER IS A BUSINESS the long-form is sales:
`hiring-and-recruiting` returned a staffing agency, a recruiting-software
vendor and an assessment platform. (6) Where the topic is a LIFE
DECISION with no profession behind it the long-form is motivation:
`career-change` returned TEDx, Forbes, Udacity and Mel Robbins.
**Limits 5 and 6 cover most of business and career**, which is where 70
of the remaining 118 mappings sit — so plan on recall plus
`check-handles` there, not on discovery.
**So it supplements recall, it does not replace it, and a category probed only this way has been probed at one
end** — which is a rule 18 obligation, not a caveat.

**A near-empty channel that passes the gate is not an answer.**
`resolveCreator` treats any handle-path match with fewer than
`MIN_CREDIBLE_UPLOADS` (10) uploads as a candidate rather than a result,
and keeps searching. This was found the hard way: `@SeanNalewanyj` has
**two** uploads, cleared the identity gate on name and affiliation, and
was returned as a confident match while his real 672-upload channel sat
at `@sean_nalewanyj`. The same shape recurs constantly — `@AndyStapleton`
(2), `@eddiewoo` (4), `@CarlPullein` (1), `@JamesClear` (5). Handle
squatters and abandoned accounts pass identity checks precisely because
they are named after the person.

**Affiliation terms must be distinctive proper nouns.** A book title, a
firm, a surname — not a topic word and not a job title. This is not
style advice; generic terms break the fallback in both directions at
once. "clinical psychologist" matched two upload titles on an unrelated
channel and resolved "Julie Smith" to the wrong person. "narcissism"
matched eleven channels, most of them clip farms reuploading the real
creator's content, while her own channel says "narcissistic
relationships" and so failed the substring entirely. Both were caught
before anything was written, and the resolver now ranks candidates and
refuses to record an ambiguous winner — but a bad affiliation still
wastes 100 quota units per query and produces a list you cannot use.

**Titles drift; re-gate before release.** Between two `gate-check` runs
a few days apart, Charisma on Command renamed video `-pkR_NCptqg` from
"The Only Video You Need On Small Talk" to "How to Not Suck At Small
Talk". Same id, different title. The gate caught it. Run
`gate-check.mjs` over **every** batch file before any release, not only
when a batch is first written.

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

**Contrast is verified by `scripts/check-contrast.mjs`** — 30 pairings
across both themes, 0 below WCAG AA. Re-run after any palette change.

This sentence used to claim "22 pairings, all passing AA, verified by
script" and **no such script had ever existed in this repository** —
git has no record of one being added or removed. A specific measured
result, asserted about our own rigour, produced by nothing. It is the
badge-claim failure in the design half of the project, and it was found
by the sweep for rules that require manual repetition, not by review.

The script reads `css/tokens.css` and resolves `var()` chains rather
than holding a copy of the palette. Its first version tested the
semantic aliases and reported two dark-theme failures; both were
phantoms, because **seven of those aliases are declared and referenced
by nothing** — `--bg-inverse`, `--text-on-dark`, `--text-muted-dark`,
`--link`, `--link-hover`, `--badge-ink`, `--bg-accent` — while the
bands colour themselves from raw scale steps. The pair list is now read
off `css/style.css`, and anything added to it must be traceable to a
rule that sets both a colour and its surface.

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

- [~] 197 categories, no near-duplicates, each with **2+ creators**
      (restated from 5 at batch 45 — see the depth arithmetic), three
      levels, a critic where one exists, and a four-week plan —
      *taxonomy and levels done; creator coverage and plans pending
      Phases 2–3*
- [ ] **400** verified unique creators with `notFor`, taste profile,
      signals, verified entry video per category mapping
      *(was 700; the cap was restated and this tracker was not updated
      for forty-four batches, which is why it is in the manual-repetition
      audit)*
- [ ] Expertise scope rule respected
- [ ] Every creator English-language, verified
- [x] Click-to-load nocookie embeds, no third-party requests before user
      action
- [x] Stack builder producing per-category specialists, shareable via URL
- [x] "How did you hear about us" via Netlify Forms, no other data
      collected
- [x] `node scripts/validate.mjs` exits clean *(233 creators; the
      parenthetical here said "on the current empty dataset" until
      batch 45)*
- [ ] Lighthouse 90+ across the board — *deliberately deferred to
      Phase 6; scoring an empty dataset would be meaningless*
- [~] README, CLAUDE.md, UNVERIFIED.md written — *CLAUDE.md and
      MARKUP.md current; README and UNVERIFIED.md are Phase 6*
