# Worklist intent — what I would go looking for, before looking

## STATUS OF THIS FILE: INTENT, NOT FINDINGS

Everything below is what I *plan* to search for. None of it has been searched.

- **Nothing here is verified.** No channel has been resolved, no catalogue
  scanned, no video attributed. There was no API key in the container when
  this was written.
- **Nothing here is evidence.** If a creator is later mapped to one of these
  categories, the justification must be that creator's own catalogue, checked
  through `gate-check.mjs`. This file cannot support a mapping, partially or
  otherwise.
- **No creator named here has been vetted** — and by design I have named none
  as a candidate. Existing mapped creators are named, because the point of
  naming them is to show what a second mapping would have to *differ* from.
- **The validator must not read this file.** It is prose for a human. Nothing
  in it is schema, and no script should parse it.
- **My confidence ratings are predictions about supply, and this project has a
  measured record of getting those wrong.** `stoicism` was retired twice and
  then reopened by one `--small` round; the fill-rate claim about where supply
  fails was falsified before it shipped; six of the eight low-fill probe
  targets filled after I had reasoned they were thin. Treat every "unlikely"
  below as a hypothesis to be tested by searching, not a reason to skip the
  search.

**If a future session cites this file as a reason a record is correct, that
session has made an error.** The correct citation is always the record's own
evidence and the gate-check output.

---

## What is in scope

`node scripts/validate.mjs --final` fails on **231 coverage lines across 134
categories**. Every one is coverage; there are no other failures. The 134 split:

| Gap | Categories |
|---|---|
| Too few creators (target 2) | 76 |
| Has 2+ but missing a level tier | 54 |
| Has 2 but one is dormant | 4 |

Of the 76: **13 sit at zero creators**, 63 at one.

**There is no "Step D".** Categories carry only the Phase 1 `levels` prose —
three sentences describing what beginner, intermediate and advanced mean for
that subject. There are no per-level creator targets anywhere in the data, so
where I cite a declared level below it is that prose, not a target.

**A note on the level gaps.** I checked these before assuming they were
labelling errors. In **49 of the 54**, every mapped creator carries an
identical `level` array — the category is staffed uniformly at one end. In 16,
a record's own `notFor` explicitly excludes the missing tier
(`kaneb`: *"Beginners, and anyone who needs a reason to care stated up
front"*). A regex scan for prose contradicting a flag returned 9 hits, all of
which **confirmed** the existing label. So these are not flags to add. They
are missing creators, and they need the API like everything else.

## Difficulty groups

| Group | Categories | What it means |
|---|---|---|
| **A** — high confidence | 19 | A trained profession teaches the entry tier of this on video |
| **B** — good confidence | 18 | The missing advanced tier genuinely exists as a body of work |
| **C** — moderate | 33 | Real supply, but the search has to aim below the commercial top |
| **D** — low | 24 | The field's long-form output is sales or motivation |
| **E** — evidence says stop | 17 | Searched twice already, or a documented gap |
| **F** — probably not fillable | 11 | The advanced tier likely does not exist for the subject |
| **G** — taxonomy questions | 8 | The category definition is the problem, not the roster |
| **dormant** | 4 | A live replacement for a quiet channel |

**19 + 18 + 33 + 24 + 17 + 11 + 8 + 4 = 134.** Every failing category appears
in exactly one group. Groups are ordered by how hard I think the work is, not
alphabetically, and the doubtful ones are groups E, F and G rather than being
buried.

---

# Group A — high confidence (19)

**The shared shape.** Every one of these is a category where the roster is
uniformly `[intermediate, advanced]` and the missing tier is **beginner**.
These are subjects with a real teaching profession — coaches, clinicians,
lecturers, working engineers — and an entry tier that demonstrably exists
because it is how people enter the field. The roster skewed expert because the
research went to depth first, not because beginners are unserved.

**What I want in all 19:** a creator whose catalogue is *built* for the
first-timer — defines terms on first use, shows the whole movement or the
whole query rather than the refinement, and whose own framing says "start
here". Long-form enough to explain rather than assert.

**What disqualifies in all 19:** a channel that is the existing creators'
material with easier vocabulary. If the second creator's evidence is the same
concepts at a lower reading level, that is one body of work twice
(rule 4) and I should not map it. It also disqualifies a channel whose
"beginner" content is a funnel to a paid programme with nothing standalone.

| Category | Domain | Now | Existing roster | What the beginner creator must add |
|---|---|---|---|---|
| `strength-training` | fitness | 3 | barbellmedicine, jeffnippard, juggernauttrainingsystems | Someone teaching the lifts to a person who has never held a bar — setup, bracing, bar path — not programme design |
| `hypertrophy-training` | fitness | 3 | barbellmedicine, jeffnippard, strongerbyscience | The mechanism explained before the literature: what growth is, what a set does, why proximity to failure matters |
| `powerlifting` | fitness | 2 | alexanderbromley, calgarybarbell | First meet, first total, the rulebook and commands — not peaking blocks |
| `cycling` | fitness | 2 | dylanjohnsoncycling, trainerroad | Riding, fit and gearing for a new rider; both current creators start at structured training |
| `rock-climbing` | fitness | 2 | hoopersbeta, latticetraining | Movement and gym-to-outdoor basics; both current are load management and finger training |
| `longevity` | health | 3 | medlifecrisis, peterattiamd, physionic | Plain-language "what actually moves the needle" — all three current are depth-4 research readers |
| `sports-nutrition` | health | 3 | eatforendurance, jordansullivan, strongerbyscience | Fuelling a first season: what to eat around training, without periodised macros |
| `stock-analysis` | money | 2 | aswathdamodaran, biws | Reading a filing for the first time. Damodaran's own `notFor` names the gap: *"a beginner on-ramp"* |
| `index-fund-investing` | money | 2 | benfelix, pensioncraft | What a fund is and how to buy one; both current are portfolio theory. **Jurisdiction-flagged** |
| `retirement-planning` | money | 2 | jamesshack, robberger | The vocabulary — account types, contributions, what compounds. **Jurisdiction-flagged** |
| `academic-writing` | learning | 2 | drandystapleton, gradcoach | The undergraduate essay, not the thesis or the viva |
| `databases-sql` | programming | 2 | databasestar, hnasr | First query, first join, what a table is; both current are internals and performance |
| `algorithms-and-data-structures` | programming | 2 | errichto, neetcode | Why a data structure exists at all, before interview patterns or contest technique |
| `testing-and-quality` | programming | 2 | arjancodes, modernsoftwareengineering | Writing a first test and watching it fail; both current are design philosophy |
| `self-hosting` | tech | 2 | lawrencesystems, technotim | First service on first box — both current assume networking fluency |
| `giving-feedback` | communication | 2 | managertools, radicalcandor | Someone not yet managing anyone: peer feedback, upward feedback. **Also in group G** |
| `existentialism` | philosophy | 2 | partiallyexaminedlife, weltgeist | A first pass at the primary texts with scaffolding; both current assume you have read them |
| `ethics` | philosophy | 3 | cosmicskeptic, kaneb, partiallyexaminedlife | The frameworks introduced from zero. `kaneb.notFor` explicitly says "Beginners" |
| `philosophy-of-mind` | philosophy | 2 | cosmicskeptic, kaneb | The problem stated before the positions — both current are 50–140 minute argument |

**Confidence: high, with one caveat I want on the record.** The reason I rate
these high is that an entry tier is where a field recruits, so material exists
almost by definition. The caveat is that "exists" and "exists as long-form
video we would stand behind" are different claims, and the second is the one
that matters. Philosophy is the weakest of the three sub-groups here: an
introductory philosophy channel is easy to find and hard to find *good*, and
the three philosophy rows may behave more like group C.

---

# Group B — good confidence (18)

**The shared shape.** The missing tier here is **advanced**, and I have
separated these from group F because in each of these the advanced tier is a
real, recognisable body of work that practitioners actually produce. A
competition coach, a specialist clinician, a working professional at the top
of the craft.

**What I want in all 18:** a creator addressing someone who already does this
competently and is trying to get better at the margin — the failure modes, the
edge cases, the disagreements within the field.

**What disqualifies in all 18:** "advanced" meaning *more intense* rather than
*more skilled*. A harder workout is not an advanced tier; a longer video is
not an advanced tier. Also disqualified: a specialist whose material only
makes sense to another specialist — the tier has to be reachable from
intermediate, or it serves nobody on this site.

| Category | Domain | Now | Existing roster | What the advanced creator must add |
|---|---|---|---|---|
| `javascript` | programming | 2 | thecodingtrain, webdevsimplified | The language's own semantics — the event loop, prototypes, memory — not another framework tutorial |
| `cloud-computing` | programming | 2 | beabetterdev, techworldwithnana | Architecture and cost under real load; both current teach the services individually |
| `linux-basics` | tech | 2 | freecodecamp, networkchuck | The system as a system: process model, init, namespaces. The category name may fight this — **see group G** |
| `graphic-design` | creativity | 2 | garethdavidstudio, satorigraphics | Typography and systems at professional standard; both current are depth-2 tool teaching |
| `music-production` | creativity | 2 | andrewhuang, inthemix | Arrangement and mixing decisions defended out loud, not feature walkthroughs |
| `brazilian-jiu-jitsu` | fitness | 2 | chewjitsu, stephankesting | Competition-level detail and the modern meta; both current are fundamentals-facing |
| `boxing-and-striking` | fitness | 2 | fighttips, tonyjeffries | Tactics and ring craft against a resisting opponent, beyond technique demonstration |
| `injury-rehab` | fitness | 2 | e3rehab, squatuniversity | **High-stakes (rule 12), and the depth-3 allocator already flags this pair as agreeing** — same role, 100% stance overlap. The third voice must disagree with them on something real, not add a third concurring clinician |
| `back-pain-management` | health | 2 | e3rehab, uprighthealth | **High-stakes.** Note e3rehab is in both this and injury-rehab. The new creator must not be a third source for the same load-management frame |
| `gut-health` | health | 2 | gastrogirl, guthealthmd | The diagnostic edge — when self-management stops being appropriate. Both current are patient-facing education |
| `skincare` | health | 2 | drdray, labmuffin | Formulation or procedural dermatology; both current are depth-3 consumer-facing |
| `hormonal-health` | health | 2 | drmaryclaire, mamadoctorjones | Endocrine depth beyond the two current clinical-education channels |
| `home-cooking-fundamentals` | practical | 4 | aragusea, brianlagerstrom, howtocookthat, internetshaquille | Professional technique — heat control, seasoning, timing — taught as craft. Deepest roster of any failing category, and all four sit at beginner/intermediate |
| `car-maintenance` | practical | 2 | chrisfix, projectfarm | Diagnosis rather than replacement: reading symptoms, electrical faults. Note projectfarm is also in home-repair-diy |
| `home-repair-diy` | practical | 2 | projectfarm, thisoldhouse | Structural and systems work at trade standard |
| `camping-and-outdoor-skills` | practical | 2 | hikingguy, homemadewanderlust | **High-stakes (rule 12) — and the rationale is specific**: verification is structurally unavailable at the moment of use. The advanced tier that matters is navigation and judging conditions, not gear. A gear-review channel does not fill this even if it is excellent |
| `resume-writing` | career | 2 | headlessheadhunter, selfmademillennial | Senior and executive documents, where the rules invert. **Jurisdiction-flagged** |
| `job-interviewing` | career | 2 | careervidz, selfmademillennial | Senior loops — panels, system design, negotiation-adjacent closing. selfmademillennial is in both this and resume-writing |

**Confidence: good, lower for the three high-stakes rows.** Rule 12 says an
empty category beats a mediocre one in `injury-rehab`,
`back-pain-management` and `camping-and-outdoor-skills`, so the bar is higher
there and a documented gap is the honest outcome if the third voice is
merely competent. I expect at least one of those three to end as a gap.

---

# Group C — moderate (33)

**The shared shape.** These are categories at **one creator** in fields where
I believe real teaching supply exists, but where the top of the search is
occupied by something else — a large commercial channel, a tool vendor, or a
motivational channel using the same words. CLAUDE.md's own rule applies
directly: **run `discover.mjs --small` before writing any of these off**,
because relevance ranking returns the channels that already won.

**What disqualifies across this group**, beyond rule 4: a channel whose
long-form is a webinar for a product; a channel whose catalogue is
conference talks by other people; and — the one I expect to hit most often —
a second creator teaching the same frame as the first. In a one-creator
category the temptation is to accept anyone credible, and the test that
catches it is whether the evidence would be *different videos*.

| Category | Domain | Existing | What the second creator must be |
|---|---|---|---|
| `ai-fundamentals` | tech | aiexplained | A teacher rather than a newsreader. aiexplained is a critic tracking releases; the gap is someone building the mental model. **Also in G** |
| `ui-ux-design` | creativity | nngroup | A practising designer showing the work. nngroup is an institution publishing research summaries |
| `mobile-development` | programming | philipplackner | A second platform, or a shipping-and-release voice. One platform is currently the whole category |
| `coffee-brewing` | practical | jameshoffmann | Anyone not standing in Hoffmann's shadow — the risk here is a channel that is explicitly derivative of him |
| `travel-planning` | practical | nomadicmatt | Logistics and planning method rather than destination content |
| `podcasting` | creativity | buzzsprout | **A non-vendor.** buzzsprout is a hosting company. CLAUDE.md records that discovery on this word returns podcasts rather than teaching |
| `data-literacy` | tech | crashcourse | Reading a chart or a study critically; crashcourse is a scripted educational institution |
| `privacy-and-opsec` | tech | naomibrockwell | A threat-model-first voice rather than a tool-recommendation voice |
| `workflow-automation` | productivity | n8n | **A non-vendor** — n8n is the tool's own channel |
| `research-skills` | learning | drandystapleton | Searching, reading and note discipline; current is PhD-survival framed |
| `teaching-and-explaining` | learning | misterwootube | Explanation as a craft, addressed to explainers. **Demand unmeasured** (rate-limited) |
| `deliberate-practice` | learning | benjaminkeep | A practitioner-coach showing practice design in a domain, not the research summary |
| `personal-knowledge-management` | productivity | tiagoforte | A method that is not the current one, and not a note-app review channel |
| `prioritization` | productivity | carlpullein | Someone not also in task-management-systems — carlpullein is in both |
| `negotiation` | communication | negotiationmastery | A second school. One institution is currently the whole category |
| `networking` | communication | thinkfasttalksmart | Practice rather than the university-lecture register |
| `couples-communication` | relationships | gottmaninstitute | A clinician not working from the Gottman frame, or the category is one method |
| `setting-boundaries` | relationships | terricole | A second therapeutic frame |
| `attachment-styles` | relationships | heidipriebe | A clinician — current is a depth-4 essayist, and attachment is a clinical literature |
| `rebuilding-trust` | relationships | estherperel | Someone addressing the repair process step by step; current is depth-4 and discursive |
| `caring-for-aging-parents` | relationships | dementiacareblazers | Non-dementia caregiving — the current record is dementia-specific and the category is broader |
| `grief-and-loss` | mindset | refugeingrief | **High-stakes.** A clinician or a second bereavement frame; prefer a documented gap to an adjacent wellness channel |
| `mortality-and-death` | philosophy | askamortician | The philosophical treatment; current is a death-industry practitioner |
| `habit-formation` | mindset | betterideas | Someone working from the behavioural literature; current is depth-2 self-improvement |
| `perfectionism` | mindset | perfectionismproject | A clinical voice — current is a single-topic self-help channel |
| `cognitive-biases` | mindset | wirelessphilosophy | Applied rather than academic. **Overlaps `decision-making` — see G** |
| `first-aid` | practical | prepmedic | **High-stakes, and already a documented gap** whose rule-18 test FAILED once and was corrected: the institutional end was over-probed and the individual-clinician end found prepmedic immediately. A second individual clinician is the target |
| `business-writing` | career | writingwithandrew | Someone teaching the documents — memo, brief, update — rather than prose style |
| `people-management` | career | managertools | **Not managertools again.** See G: one creator carries four categories |
| `product-management` | business | lennyspodcast | A practitioner teaching, not an interview show |
| `saas-business` | business | microconf | An operator; microconf is a conference. Also in bootstrapping |
| `freelancing` | career | thefutur | Someone outside the design trade — thefutur is design-industry framed |
| `workplace-politics` | career | ethanevans | A second senior-operator voice, or this stays at one |

**Confidence: moderate and genuinely uncertain.** The honest note is that
seven of these have a **vendor or institution** as their only creator —
buzzsprout, n8n, nngroup, gottmaninstitute, negotiationmastery, microconf,
crashcourse. `entity` exists precisely because a vendor and an individual read
as agreeing when they differ in kind, so in those seven the second creator
being an individual practitioner matters more than usual.

---

# Group D — low confidence (24)

**The shared shape, and why I rate these low.** CLAUDE.md records two measured
limits of `discover.mjs` that land almost entirely on this group:

> (5) Where the BUYER IS A BUSINESS the long-form is sales: `hiring-and-recruiting`
> returned a staffing agency, a recruiting-software vendor and an assessment
> platform. (6) Where the topic is a LIFE DECISION with no profession behind it
> the long-form is motivation.

Every category here is money, business or marketing. The people who know these
subjects best are usually monetising the knowledge directly, so the long-form
output is a pitch, and the free teaching is short. This is not a claim that
supply is absent — **that exact claim was falsified once already**
(`supply-fails-where-the-money-is`, stopped at the measurement before it
shipped), and the low-fill probe then filled six of eight such categories. It
is a claim that the *search* is harder and the rejection rate will be high.

**What disqualifies across this group:** a channel whose long-form is a
webinar, a funnel or a case-study reel for a service; a "day in the life"
channel; and anything where the teaching stops exactly where the paid product
begins. Rule 13 applies — commercial interest is disclosed, not excluded — so
the test is whether there is a standalone body of teaching at all.

**Eleven of these are jurisdiction-flagged (rule 16)**, marked `JUR`. For
those the second creator is not just "another good one" — coverage means a
creator for a market the current one does not serve, and `coverage-report.mjs`
already names AU, UK, CA and US as unserved across most of them.

| Category | Domain | Now | Existing | What I would look for |
|---|---|---|---|---|
| `tax-basics` `JUR` | money | 1 | theplainbagel | A practitioner in a *different* jurisdiction explaining the system, not filing tips |
| `debt-payoff` `JUR` | money | 1 | theramseyshow | A non-ideological voice — the current one is a strong single frame |
| `credit-and-loans` `JUR` | money | 1 | twocents | Anything not twocents, who also carries personal-budgeting |
| `real-estate-investing` `JUR` | money | 0 | — | The hardest money category: the field is almost entirely lead generation. Someone teaching the arithmetic and the failure modes |
| `insurance-basics` `JUR` | money | 0 | — | A non-broker explaining product types. A broker fails rule 13's decision-conflict test |
| `crypto-literacy` `JUR` | money | 1 | theplainbagel | A sceptical technical explainer; must not be a second theplainbagel mapping |
| `financial-independence` | money | 1 | jamesshack | A voice outside the current one's market, and outside the FIRE-influencer register |
| `startup-fundamentals` | business | 1 | ycombinator | **Not ycombinator again** — it carries this and venture-fundraising |
| `venture-fundraising` | business | 1 | ycombinator | An operator or an investor who is not the accelerator itself |
| `pricing-strategy` | business | 1 | impactpricing | A second pricing practitioner; narrow field, consultant-heavy |
| `buying-a-business` | business | 1 | acquiringminds | Someone teaching diligence rather than interviewing buyers |
| `operations-and-process` | business | 0 | — | CLAUDE.md records the trap here: `@TheOperationsRoom` is a military-history animation channel. **Pass `--for` on every probe** |
| `content-marketing` | marketing | 1 | exposureninja | A practitioner, not an agency channel |
| `brand-strategy` | marketing | 1 | brandmasteracademy | A working strategist; current is a course brand |
| `community-building` | marketing | 1 | cmx | An operator; cmx is an industry body |
| `copywriting` | marketing | 1 | alexcattoni | **Not alexcattoni again** — she carries this and email-marketing |
| `email-marketing` | marketing | 1 | alexcattoni | Lifecycle and deliverability, which is a different craft from copy |
| `social-media-growth` | marketing | 0 | — | The category most likely to return growth-hacking content. Needs a platform practitioner with a real catalogue |
| `sales-fundamentals` | marketing | 2 | 30mpc, sellbetter | **Missing beginner.** Someone selling for the first time; both current are B2B rep-facing |
| `cold-email-outreach` | marketing | 2 | 30mpc, sellbetter | **Missing beginner**, and staffed by the identical pair as sales-fundamentals — see G |
| `paid-ads` | marketing | 2 | darrentaylordigital, jonloomer | **Missing beginner.** First campaign, first budget |
| `marketing-analytics` | marketing | 2 | jonloomer, semrush | **Missing beginner**, and one of the two is a tool vendor |
| `bootstrapping` | business | 2 | gregisenberg, microconf | **Missing beginner.** Someone at the very start, pre-revenue |
| `business-strategy` | business | 2 | acquired, modernmba | **Missing beginner.** Both current are long-form case narrative; the gap is the concepts |

---

# Group E — evidence already says stop (17)

**These are not new research tasks.** Each has either been searched twice
under the close plan and recorded in `thin-gaps.searchedNotFound`, or is a
documented gap in `thin-gaps.gaps` carrying a rule-18 disconfirmation test.
Re-searching them without a new angle repeats work the project has already
paid for.

**What would change my mind, in every case: a new END of the field, not
another round.** Rule 18's named failure mode is a finding from one sub-area
applied to sub-areas never probed — that is exactly how the marketing note
died, and how `first-aid` was corrected from `absent-supply` to `mixed` when
the individual-clinician end was finally searched. So the useful question for
each of these is *which end has not been probed*, and `--small` counts as a
new angle because it asks a different question of the same results.

| Category | Now | Status | The unprobed end, if I can name one |
|---|---|---|---|
| `exam-preparation` | 1 | searched twice | Demand 1.5M — the highest in the whole worklist. Teacher-and-tutor end rather than study-technique end |
| `journaling` | 1 | searched twice | Demand 1.2M. Therapeutic-writing and expressive-writing clinicians |
| `deep-work-and-focus` | 1 | searched twice | Currently calnewport alone. The attention-research end |
| `self-discipline` | 1 | searched twice | Overlaps habit-formation and goal-setting — **may be a taxonomy problem, see G** |
| `sleep-quality` | 1 | searched twice, `--small` run | The `--small` round found only sleep-audio products. I would let this stand as a gap |
| `breathwork` | 1 | searched twice | CLAUDE.md names three unprobed ends: respiratory physiotherapy, wind instruments, clinical anxiety |
| `prompt-engineering` | 1 | searched twice | Moves fast enough that a re-search in six months is a different search |
| `dating-skills` | 1 | searched twice | The field is dominated by coaching funnels. Clinical or research-psychology end |
| `personal-budgeting` `JUR` | 1 | searched twice | Non-US consumer-finance educators |
| `salary-negotiation` `JUR` | 1 | searched twice | Recruiter-side and compensation-analyst end |
| `affiliate-marketing` | 1 | searched twice | Almost definitionally a funnel subject; I would let this stand |
| `ecommerce` | 1 | searched twice | Operator end rather than the platform-vendor end |
| `body-language` | 1 | documented gap, `mixed` | Demand 955k against one creator — and that creator is a critic debunking the field. **The honest read may be that the popular subject is not a real one**, which is a finding rather than a gap |
| `hiring-and-recruiting` | 0 | documented gap, `absent-supply` | The named case for discovery limit 5. In-house recruiter or IO-psychology end |
| `career-change` | 0 | documented gap, `mixed` | The named case for discovery limit 6 — returns TEDx, Forbes, Udacity, motivational speakers |
| `legal-for-founders` | 0 | documented gap, `mixed` | Practising lawyers on video, which is rare for liability reasons |
| `conversion-optimization` | 0 | documented gap, `absent-supply` | Demand 312. Agency-dominated; I would let this stand |

**Confidence that these are fillable: low, and deliberately so.** But note the
record: `stoicism` was in exactly this position twice and reopened on the
third round once `--small` hid the commercial top. **The rule is to run the
round, not to reason about whether it is worth running.** I have listed the
unprobed ends so a future session can aim rather than repeat.

---

# Group F — probably not fillable: the tier does not exist (11)

**This is the list I think is most useful to you**, and I want to state the
claim precisely, because it is easy to state it too strongly.

All eleven are categories with two or more creators that fail only on
**`no creator flagged "advanced"`**. My claim is not that nobody is excellent
at these subjects. It is that **the subject does not have a third tier that a
separate body of work is built for.** Decluttering has a beginner tier and a
competent tier; what would the advanced tier teach? A more thorough cupboard?

The validator asks every category for three tiers because the schema has three
slots, and the schema was specified in Phase 1 before any creator existed. In
these eleven I think **the three-tier assumption is wrong about the subject**,
and the coverage line is asking for something that cannot be supplied.

**If I am right, the correct outcome is not a creator. It is either a
documented gap saying the tier does not exist, or a schema change letting a
category declare two tiers.** The second is a scope decision and yours.

| Category | Now | Roster | Why I doubt an advanced tier exists |
|---|---|---|---|
| `decluttering-and-organizing` | 2 | clutterbug, theminimalmom | The skill is behavioural and finishes. Professional organising is a *service*, not a further tier of the viewer's skill |
| `procrastination` | 2 | betterideas, howtoadhd | You stop procrastinating or you do not. "Advanced procrastination" is close to a contradiction |
| `anxiety-management` | 2 | drtraceymarks, therapyinanutshell | The tier above self-management is *treatment*, which is care, not content. Both records are depth-2/3 clinicians already |
| `self-awareness` | 2 | patrickteahan, theschooloflife | No ladder. Deeper work here is therapy, not a more advanced video |
| `home-workouts` | 2 | chloeting, madfit | Both depth-1. The advanced tier of home training is *training*, which is `strength-training` — the category may top out by design |
| `posture-and-ergonomics` | 2 | oliviergirard, uprighthealth | A narrow corrective subject. Advanced posture work is clinical assessment, which is not transferable video |
| `task-management-systems` | 2 | carlpullein, simpletivity | Advanced here means a more elaborate system, which the productivity literature generally treats as the failure mode |
| `parenting-young-children` | 2 | goodinside, sarahockwellsmith | Parenting expertise is not tiered by the parent's skill; it is tiered by the child's age — which this taxonomy already does with a second category |
| `parenting-teenagers` | 2 | goodinside, sarahockwellsmith | Same, and staffed by the identical pair — **see G** |
| `breakups-and-divorce` | 2 | doctorramani, thematthewhussey | An event, not a practice. There is no advanced tier of having been left |
| `personal-style-and-grooming` | 2 | audreycoyne, gentlemansgazette | Advanced style is *bespoke tailoring* — a trade, and a different subject from the viewer developing taste |

**My confidence that these cannot be filled: moderate, not high.** I have been
wrong in this exact direction before — I argued `--small` was not worth running
on `self-discipline` and `deep-work-and-focus`, and was wrong about which
category would reopen. Naming which fields have a hidden expert tier is
predicting supply, and predicting supply is the thing this project is
repeatedly bad at. **So: run one round on each before accepting any of it.**
What I am confident about is narrower — that the *validator line* is the wrong
reason to go looking, because it will be satisfied by any channel willing to
call itself advanced.

---

# Group G — taxonomy questions, not research tasks (8)

**These are not gaps I can research my way out of.** In each the category's own
definition is doing the damage, and adding a creator would paper over it. Rule
4's sharper test — *would this mapping count one body of work twice?* — is the
one that keeps firing when I look at these.

| Category | Now | The question |
|---|---|---|
| `goal-setting` | 0 | Demand 7,000. What does this teach that `habit-formation`, `prioritization` and `self-discipline` do not? All four sit in the same two domains, and three of the four are already thin. I think this is one subject split four ways |
| `decision-making` | 0 | Demand 5,000, while `cognitive-biases` next door has a creator and demand 495. Are these two categories or one? A single creator would plausibly serve both — which under rule 4 means they may *be* one |
| `resilience` | 0 | Demand 118. This names an outcome, not a practice. You cannot watch a video and do resilience. It overlaps `emotional-regulation`, `anxiety-management` and `self-discipline`, all of which name something a viewer can actually do |
| `remote-work` | 0 | Demand 46 — the second-lowest in the taxonomy. This is a working *arrangement*, not a skill. What it covers is `deep-work-and-focus`, `meeting-facilitation` and `workflow-automation`, which all exist already |
| `delegation` | 1 | **Demand 20, the lowest in the entire taxonomy**, and carried by managertools, who also carries three other categories. On the numbers this is a sub-topic of `people-management` that was given its own shelf |
| `meeting-facilitation` | 1 | Demand 18,000, also carried by managertools. Better standing than `delegation`, but the same question: is it a category or a chapter? |
| `making-friends-as-an-adult` | 0 | Demand 66,000, so the appetite is real — but the field has no profession behind it. Genuine, and genuinely hard; the risk is it fills with generic social-skills content already covered by `networking` and `confidence-building` |
| `ai-ethics-and-risk` | 1 | Demand 73, carried by aiexplained — **the same creator as `ai-fundamentals`**, whose evidence for both is the same release-tracking commentary. This is the clearest single rule-4 double-count in the worklist |

## The eight clusters where failing categories share an entire roster

Computed, not recalled. Each of these is a set of categories whose mapped
creators are **identical**, which means the second creator for each must
differ from the same body of work — and raises the prior question of whether
they are one subject:

| Categories | Staffed entirely by |
|---|---|
| `people-management` · `meeting-facilitation` · `delegation` | managertools |
| `personal-budgeting` · `credit-and-loans` | twocents |
| `tax-basics` · `crypto-literacy` | theplainbagel |
| `startup-fundamentals` · `venture-fundraising` | ycombinator |
| `copywriting` · `email-marketing` | alexcattoni |
| `cold-email-outreach` · `sales-fundamentals` | 30mpc + sellbetter |
| `ai-fundamentals` · `ai-ethics-and-risk` | aiexplained |
| `parenting-young-children` · `parenting-teenagers` | goodinside + sarahockwellsmith |

**These are existing mappings and I am flagging, not proposing to unmap them** —
that is the separate finding you asked for rather than a cleanup pass. Some are
clearly legitimate: `tax-basics` and `crypto-literacy` are genuinely different
subjects that one explainer covers in different videos. Others are not obviously
so, and `ai-fundamentals`/`ai-ethics-and-risk` is the one I would look at first.
managertools carrying **four** categories is the single largest concentration.

---

# Dormant-channel replacements (4)

These pass on count and fail because one of the two creators is quiet. The
record is not wrong — `dormant` was written by `audit-status.mjs` re-querying
the API, which is the check working. What is needed is a live second voice, and
the dormant record stays, because the back catalogue is still worth listing.

| Category | Dormant creator | Note |
|---|---|---|
| `confidence-building` | Skillopedia | Also the highest-ranked confidence category in the close plan |
| `building-with-llms` | Andrej Karpathy | The back catalogue is exceptional; this is a supplement, not a replacement |
| `video-editing` | PremiumBeat by Shutterstock | The live one is a vendor channel — an individual practitioner is the gap |
| `bike-maintenance` | RJ The Bike Guy | **Also in `searchedNotFound`** — searched twice already, so treat as group E |

---

# What I am least sure about, and why

Three things I would rather flag now than have you find later.

1. **My group F claim is a supply prediction, and my record on those is bad.**
   Six of ten structural claims in the ledger were falsified, and every one was
   made without probing every sub-area. Group F is eleven such claims at once.
   I have written it because you asked for the doubtful list to be visible, not
   because I trust it.

2. **`topic-demand` is doing more work in this file than it should.** I used it
   to sort and, in group G, as part of the argument that a category may not be
   a real subject. It measures median views of the fifty most relevant videos —
   appetite among people already watching video on the topic. A score of 20 for
   `delegation` genuinely might mean the word is not how people search, rather
   than that nobody wants it. **44 of the 134 categories have no score at all**
   and two failed on rate limiting, so the ordering is partial.

3. **The three-tier assumption has never been tested against the subjects.**
   Group F is eleven categories, but the question is larger: 151 of the 231
   failures are missing-level lines, and the schema asks every category for
   three tiers because Phase 1 gave it three slots. Nobody has asked whether
   every subject has three. If a meaningful share do not, the coverage target
   itself is generating work that cannot be completed — and that is a
   definition-of-done question, not a research one.
