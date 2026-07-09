# An AI feature, end to end

The Measure pillar in one page — where "it looks good" is not evidence. When the product *is* AI (a search, a chat, a classifier), an assertion doesn't prove it works; an **eval** does. The rule: **no change to an AI feature ships without running the eval before and after, and a regression doesn't ship.**

*(Illustrative — anonymized.)*

## The feature

A knowledge-base search: a user asks a question, the system retrieves the most relevant documents. "Improve the search" is the demand.

## Why a gate, then a spec with a Data section

- **Value gate** — the metric isn't "better search", it's *"the right document appears in the top 5 for a known set of real questions"* (Recall@5). Measurable, so improvement is provable.
- **Spec** — an AI feature's spec carries a **Data** section the others don't: *source* (which documents, who owns them), *quality/bias* (are some topics thin?), and *refresh* (how the corpus stays current). It also names the **AI risks**: corpus drift, provider API changes, cost per query.

## The eval harness (this is the pillar)

Before touching anything, build (or reuse) a small benchmark: ~30 real questions, each with the document that *should* win. Score the current system: **Recall@5 = 0.71**. That number is now the gate.

```
$ node eval.mjs            # or your harness
  baseline  Recall@5 0.71  MRR 0.58   (30 questions)
```

Make the change (say, a better ranking). Re-run:

```
$ node eval.mjs
  candidate Recall@5 0.78  MRR 0.64   ↑ ships
```

If the candidate had scored **0.66**, it would **not** ship — even if three hand-tried questions looked great. Three cherry-picked wins are not evidence; the benchmark is. Every eval run is appended to a history, so a regression six months later is visible against every prior version.

## Definition of done, for AI

- [ ] Eval ran **before and after**; the after is ≥ the before (no regression)
- [ ] The benchmark itself was reviewed (are the 30 questions representative, or do they miss a topic?)
- [ ] Data section current (source, quality, refresh)
- [ ] Cost per query checked (a smarter model that doubles cost is a business decision, not a silent one)
- [ ] New failure modes named (what kind of question does it now get *wrong*?)

## The takeaway

For AI features, the harness *is* the truth. "The demo looked great" is how AI features regress into production — the eval is how they don't. Build the benchmark before the feature, and let the number, not the vibe, hold the gate.
