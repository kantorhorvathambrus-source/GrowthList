# Taxonomy rebalance — proposal, not applied

Status: **awaiting the owner's decision.** Nothing in `categories.json`
has changed. Written after batch 09, from 99 creators and 156 real
mapping decisions.

## What the evidence says, and where it contradicts my earlier advice

I previously told the owner that the taxonomy was over-split and used
`python` / `javascript` / `web-frontend` / `backend-development` as the
example. **The mapping data says the opposite.** Measuring how often
creators map to two categories in the same domain:

| Domain | Populated | Co-occurring pairs | Possible | Density |
| --- | --- | --- | --- | --- |
| productivity | 10 | 16 | 45 | **36%** |
| communication | 13 | 21 | 78 | **27%** |
| learning | 12 | 9 | 66 | 14% |
| mindset | 12 | 5 | 66 | 8% |
| programming | 13 | 4 | 78 | **5%** |
| fitness | 8 | 1 | 28 | 4% |
| creativity | 14 | 0 | 91 | **0%** |

The technical domains are **not** over-split. Kevin Powell is CSS and
nothing else. Philipp Lackner is Android and nothing else. NeetCode is
algorithms and nothing else. Creativity has fourteen populated
categories and *zero* creators spanning two of them — the splits are
carrying real weight.

The over-splitting is concentrated in the soft-skill domains, where one
person legitimately teaches five adjacent things. Cal Newport alone maps
to deep-work, digital-minimalism, energy-management, time-blocking and
inbox-and-email. Carl Pullein maps to four of the same cluster.

A lexical check on blurbs and aliases was run first and **produced
almost nothing** — the highest Jaccard overlap between any two
same-domain categories was 0.14. The taxonomy's prose is well
differentiated; it is the *supply* that refuses to divide.

## The arithmetic reality, stated before the proposals

Merging categories that share creators removes mappings as well as
categories. It does **not** move the ratio.

- Ratio needed for 400 creators to cover 200 categories at 5 each:
  **2.50 mappings per creator**
- Current ratio: **1.58**
- The brief assumed roughly 2.50. The scope rule is why we do not have it.

At 400 creators and an unchanged ratio, ~126 categories reach five
creators and **~74 carry a gap** — before and after any merge. The seven
merges below free 7 slots and cost 8 mappings; net effect on coverage is
approximately zero.

**So the load-bearing decision is the owner's point 2 — carrying
documented gaps — not the rebalance.** Points 1 and 3 do not change the
count. That is the direct, predictable consequence of holding 200
categories, 400 creators and an unloosened scope rule simultaneously:
any two of the three are compatible, all three are not.

What merging *does* buy is **reachability**. Three categories served by
one person can never independently reach five. Merged, they become one
category that plausibly can. It converts structurally-impossible gaps
into ordinary unfinished research.

## Demand is not measured

There is no traffic, no search-volume data and no user research in this
project. Every "demand" judgement below is **my editorial opinion** and
should be weighed as such. Every "supply" judgement is evidenced by
research already done and is recorded in `UNVERIFIED.md` or the mapping
data.

## Ranked merge proposals

Ordered by strength of evidence.

| # | Proposal | Driver | Evidence | Frees / costs |
| --- | --- | --- | --- | --- |
| 1 | `time-blocking` + `energy-management` → **`deep-work-and-focus`** | **Supply** | All three are served by exactly one creator — the same one. Three mappings, one person. Neither can reach 5 alone. | +2 slots / −2 maps |
| 2 | `vocal-delivery` → **`public-speaking`** | **Supply** | One creator, who is already in public-speaking, charisma and conversation-skills. No researched creator teaches speaking voice as a standalone discipline; the voice specialists found were all singing teachers, which is a separate category in creativity. | +1 / −1 |
| 3 | `weekly-review` → **`task-management-systems`** | **Supply**, demand weak | 100% co-occurrence. Editorially, a weekly review is a ritual *inside* a task system, not a parallel skill — but that is my opinion, not data. | +1 / −1 |
| 4 | `spaced-repetition` → **`memory-techniques`** | **Supply** | Four creators across the two, no overlap lost — the only merge here that costs nothing. Spaced repetition is a named technique within the memory parent. | +1 / −0 |
| 5 | `active-listening` → **`conversation-skills`** | **Supply**, demand contested | 0 of 4 active-listening creators are exclusive to it. Against: "active listening" is established workplace-training vocabulary and people plausibly search it. Borderline — I would defer to the owner. | +1 / −2 |
| 6 | `giving-feedback` → **`difficult-conversations`** | **Supply**, demand contested | Both giving-feedback creators are also in difficult-conversations. Against: giving feedback is a distinct managerial skill with, in my judgement, real independent demand. Borderline. | +1 / −2 |

### Explicitly NOT merged, despite shared supply

These are the cases where **demand is high and supply is thin**, so per
the owner's instruction they stay and carry a gap:

| Kept separate | Why, despite the signal |
| --- | --- |
| `strength-training` / `hypertrophy-training` | 100% co-occurrence — both creators map to both. But the field itself draws this distinction sharply, and demand for each is high and independent. Thin supply is a research problem, not a taxonomy problem. |
| `calisthenics` / `home-workouts` | Mutually referenced, and home-workouts is empty. But home-workouts is minimal-equipment general training and calisthenics is skill progression; in my judgement home-workouts has the higher demand of the two. Empty because unresearched, not because it does not exist. |
| `prioritization` | Shares its one creator with task-management-systems. Kept because "what not to do" is, in my judgement, the highest-demand idea in that whole cluster. |
| `deliberate-practice` | One creator, shared with two other categories. Kept: distinct, well-known concept, and it now has a genuine critic. |
| All 14 creativity categories | Zero co-occurrence. No case to answer. |
| All 14 programming categories | 5% density. My earlier advice here was wrong. |

## Where the freed slots should go

**Recommendation: hold them.** Seven slots is not many, and proposing
new categories in the eleven untouched domains would be speculation
about supply — the exact failure this project is built to avoid. Health,
career, money, business, marketing, tech, relationships, practical and
philosophy have **zero** researched creators between them, so there is
no evidence for what is genuinely distinct there and what will collapse
into one supply pool the way productivity did.

Decide the seven merges now; allocate the freed slots after those
domains have had a pass and the supply is known. Philosophy is the
obvious candidate on paper — it has only 7 categories against 12–14
elsewhere — but that is a hunch, and a hunch is not a reason to add a
category.
