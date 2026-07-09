# A demand, end to end

One worked example of the Cadmo spine, using a deliberately ordinary feature: **CSV export** for a small invoicing app. Ordinary is the point — you'll recognize your own work in it. *(This walkthrough is an illustration, not a real client case — names and numbers are invented to show the shape. For the method deciding real things, see [`governance/`](../governance/), this repo's own artifacts.)*

The cast: a two-person consultancy maintains the app for a client; the AI pair does the building.

## The journey

| Step | Artifact | What happened |
|---|---|---|
| 1. The ask arrives | — | Client: *"we need to get the invoices into Excel for our accountant."* |
| 2. Value gate | [`value-gate.md`](value-gate.md) | 5 lines, 3 minutes. Verdict: GO — but it also caught that "Excel" really means *their accountant's import tool*, which needs semicolons. A spec written blind would have shipped the wrong delimiter. |
| 3. Spec | [`spec.md`](spec.md) | The rules in the client's language, critical criteria in EARS. The client validated **this page**, not a requirements PDF. |
| 4. Plan | [`plan.md`](plan.md) | Internal: the technical route, tasks, how to validate. The AI executes against this with human gates. |
| 5. Build | — | Small batches; each verified against the harness (tests + a real download in staging). |
| 6. Done | ✓ in the plan | The definition of done ran: tests pass, real flow tested in staging, criteria checked one by one, **"not tested: exports over 50k rows"** said out loud. |
| 7. Absorption | — | The demand's spec was folded into the app's stable spec (`docs/invoicing.md` gains an "Exports" section); the demand file is now history. |
| 8. Value check | back in the gate | Three weeks later: is the accountant actually using it? (Yes — 40 min/month saved. The gate's metric, realized.) |

## What to notice

- The **gate caught the real requirement** (the delimiter) before any code existed. That's the cheapest bug fix you'll ever make.
- The client validated a **one-page spec in their own language** — not a document they'd never read.
- The critical criterion in EARS became a test **almost word for word** (see the spec's criterion #2 and imagine the assertion — that's the trick).
- "Done" included **saying what wasn't tested.** That sentence is the cheapest trust-builder in the method.
- The spec **didn't live forever as a separate file** — it was absorbed into the system's stable documentation on delivery. One subject, one source.

## More walkthroughs

- **[incident.md](incident.md)** — the Operations pillar: an incident through the four labels (symptom → cause → correction → prevention), and why the prevention must leave the system *more diagnosable*.
- **[ai-feature.md](ai-feature.md)** — the Measure pillar: an AI feature gated by an eval, where "the demo looked great" is not evidence and a regression doesn't ship.
- **[eval-kit/](eval-kit/)** — the runnable version of that: a promptfoo config + a CI workflow that fails the PR on a regression. Copy the shape onto your own AI feature.
