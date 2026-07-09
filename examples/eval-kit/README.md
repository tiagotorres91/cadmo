# Eval kit — the Measure pillar, runnable

A worked example of an AI-feature eval: a fixed benchmark that scores the feature the same
way every time, so a change is proven by a number instead of a good demo. It fills in the
[`eval.md`](../../templates/eval.md) template with something you can actually run.

The feature under test is a billing support assistant. The lesson is the **shape**, not the
assistant — copy the shape onto your own AI feature.

> **promptfoo is external and optional.** It's an off-the-shelf eval CLI, **not** a
> dependency of this repo — Cadmo installs nothing. We use it here because it already does
> the boring parts (run cases, score asserts, keep history). Any harness that scores a
> frozen set before and after works just as well; a 40-line `eval.mjs` would too.

## Run it locally

```
export ANTHROPIC_API_KEY=...          # or the key your provider needs
npx promptfoo eval -c promptfooconfig.yaml
npx promptfoo view                     # optional: open the results in a browser
```

`npx` fetches promptfoo on demand — nothing is added to your project. Point the `providers`
in [`promptfooconfig.yaml`](promptfooconfig.yaml) at whatever model you actually use.

## The threshold gate

promptfoo **exits non-zero if any assert fails.** That exit code *is* the gate:

- **Deterministic asserts first** (`icontains`, `regex`, `latency`) — free, stable, no
  tokens. They catch most regressions. Put them on top.
- **`llm-rubric` last** — for what a string can't judge (is the answer faithful, does it
  refuse to invent a policy). It costs tokens and has run-to-run variance, so the example
  uses exactly one.

Run it before your change to get the baseline, run it after, and only ship if the score
holds. **A regression does not ship** — three cherry-picked questions looking good is not
evidence; the frozen set is.

## Cost — be honest

Only the `llm-rubric` assert spends tokens (the deterministic ones are free). This example
is 3 cases with **one** rubric each run: a few thousand tokens, well under US$0.01 on a
small model per run. Real benchmarks of 30–50 cases with rubrics still land in cents per
run — cheap enough to gate every PR, but **not zero**, so keep the rubric count minimal and
lean on deterministic asserts.

## History via CI

[`eval-ci.yml`](eval-ci.yml) is an **example GitHub workflow — copy it to
`.github/workflows/eval.yml`** in your project **and retarget the two paths marked
`<< retarget >>`** to where your eval config and AI feature actually live (copied verbatim
it points at this example's folder, which won't exist in your repo). It runs the eval on
every PR that touches the feature or the benchmark, fails the check on a regression (make
it a required check to enforce "does not ship"), and uploads the run as an artifact. Those
artifacts are your history: a regression six months from now is visible against every prior version.
