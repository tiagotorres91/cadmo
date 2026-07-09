# Eval — <ai-feature name>

For AI features only (search, chat, classifier, extraction). A deterministic feature
is proven by a test; an AI feature is proven by an **eval** — a fixed benchmark scored
before and after every change. Skip this file if the feature isn't AI.

**Feature:** <what the model does>  ·  **Pairs with:** `spec.md` (its Data section)

## What to measure
Pick the metric the value gate already named — it's the number that proves the feature works.
- Retrieval → **Recall@k**, MRR, nDCG (the right document appears in the top k).
- Classification → accuracy, precision/recall, F1.
- Open-ended generation → a **rubric** scored 0–1 (faithfulness, completeness, tone).

## Dataset (the minimal shape)
A small, real, frozen set — ~20–50 cases is enough to hold a gate. Each case:
`input` (a real question/prompt) + `expected` (the document that should win, the correct
label, or the rubric the answer must satisfy). Keep it in version control; review it for
coverage (does it miss a topic the feature must handle?).

## Assertions — deterministic first, rubric last
Order matters, cheapest and most reliable on top:
1. **Deterministic** — exact/contains/regex/JSON-schema/latency. Free, stable, no tokens. Prefer these.
2. **Model-graded (llm-rubric)** — only for what a string can't check (is the answer faithful?).
   Costs tokens and has variance; use as few as the feature truly needs.

## Threshold (the gate)
Baseline: **<metric> = <score>** on the frozen set (record the date and the version).
Rule: a candidate ships only if it is **≥ baseline**. **A regression does not ship** —
three hand-tried questions looking good is not evidence; the benchmark is.

## Cost (be honest)
~<N> cases × <M> model-graded asserts ≈ **<tokens>** per run ≈ **<$>**. A change that
improves the score but doubles cost per query is a business decision, not a silent one —
name it.

## History
Append every run (baseline + each candidate) to a log kept in the repo, or as a CI
artifact. A regression six months out must be visible against every prior version.

<!-- A worked, runnable example lives in examples/eval-kit/. -->
