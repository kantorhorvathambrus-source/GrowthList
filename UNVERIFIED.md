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

## Unverified

_(none yet — every creator in the dataset so far resolved cleanly, and
every entry video passed the attribution gate.)_
