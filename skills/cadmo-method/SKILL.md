---
name: cadmo-method
description: >-
  Work the Cadmo way when building software with an AI pair — the human specifies and
  decides, the AI writes and verifies. Use at the START of any coding demand, feature,
  bug fix, or refactor to right-size the process — size the task, open the value gate,
  write the spec (acceptance criteria first, EARS for critical rules), respect the human
  gates (plan approved before building, staging before production), and run the definition
  of done against evidence. Trigger when asked to build or change something and do it
  properly, follow Cadmo, apply a value gate, write a spec, or check the definition of done.
license: CC BY 4.0
metadata:
  method: Cadmo
  homepage: https://github.com/tiagotorres91/cadmo
  version: "1.0"
---

# The Cadmo method

Cadmo is how you build software when **the AI writes and verifies, and a human specifies and decides** — sized so the rigor never becomes bureaucracy. This skill is the operating summary. Apply it from the *first* message of a demand, before any code. For the full pillars, follow the links at the bottom.

## The meta-principle: right-size everything

Every rule below scales to the task. *Too little process is chaos; too much is waste.* Before acting, classify the work — that choice drives everything else:

| Size | What it looks like | Ritual before code |
| --- | --- | --- |
| **Trivial** | a fix, a tweak, a rename | go direct — no gate, no spec |
| **Standard** | 3+ steps, touches a real flow | write acceptance criteria + a short plan |
| **New / relevant** | new capability or business rule | value gate → spec (client validates) → plan |

Right-sizing also applies to **which model runs which work**: fine judgment (architecture, the spec of something new, curation) belongs on the most capable tier; homogeneous execution against an already-decided plan can run cheaper/faster. If new design work landed on an execution tier, **name the mismatch** out loud — never pretend a smaller tier delivered the same quality.

## Opening choreography (do this BEFORE the first line of code)

This is a choreography of **opening**, not a checklist of closing. For anything above trivial, in order:

1. **Size it** → pick the ritual from the table above.
2. **Value gate** (new/relevant only) — ~5 lines: the measurable problem · why *this* solution vs. a cheaper alternative · the business metric that will prove value after delivery · data readiness (🟢/🟡/🔴) · GO / NO-GO. The verdict is the human's. → `cadmo/value-gate.md`
3. **Write acceptance criteria** — observable and specific, *before* any implementation. For critical rules (money, data, integrations, security), use EARS: **"WHEN <trigger>, THE SYSTEM SHALL <behavior>"** — each becomes a test almost word-for-word.
4. **Spec, in the client's language** (new/relevant) — 2–5 lines a non-developer validates, then the criteria, then out-of-scope, then which stable specs absorb this on delivery. → `cadmo/spec.md`. Pair it with an internal plan (tasks, constraints, how to validate) → `cadmo/plan.md`.
5. **Map the stable specs affected** — if a business rule changes, its spec changes *in the same commit* as the code. Drift is watched mechanically (`cadmo/spec-drift.mjs`), but the discipline covers the rest.

## Validation by MVP (the default)

Normal flow: **approve the spec as the client's proxy → build the MVP in staging → the client validates spec *and* MVP together.** Seeing beats reading. Reserve document-only prior validation for high-risk work (money, data, structural integration) or when explicitly asked.

## Gates (never skip, never self-authorize)

- **Plan approved before building.** Don't start construction on an unapproved plan.
- **Production ships only with explicit human approval.** Staging first when one exists.
- **Production is the client's environment** — operate underneath it (scripts/deploy with gates), never grant yourself admin-in-the-UI. A verification sub-agent must never touch a production database.

## Definition of done (check against evidence, not memory)

Before saying "done", run the checks — don't assume:

- [ ] Build and tests pass — run them, show the output.
- [ ] **Tested functionally** — the real flow (browser, curl, CLI run), not just linters. Type-check/lint/tests validate *code*, not *behavior*.
- [ ] Validated in staging before production (when one exists).
- [ ] Acceptance criteria checked one by one, quoted.
- [ ] A rule changed → its spec changed in the same commit.
- [ ] Anything untested is said **explicitly**: "I didn't test X."
- [ ] Touched auth / input / data / secrets → an adversarial security pass is due before shipping.
- [ ] Big change → an independent, fresh-context reviewer before the merge.

Then a **process check**: was there a plan before execution? criteria before code? spec in the commit? If any answer is no, say so plainly. This checklist exists to be failed honestly, not passed cosmetically. Finish with a verdict: **ready to ship** / **ready except <items>** / **not ready because <items>**.

## Two rules that keep the method self-improving

- **A repeated failure isn't re-disciplined, it's mechanized** — it becomes a CI check, a guard, or a generator so it can't recur.
- **One subject, one source** — a document that's superseded becomes marked history, never a second live copy.

## Read first in this project

If the project has been scaffolded with Cadmo, the local map is **`AGENTS.md`** at the repo root (or `CLAUDE.md` — same idea): what the project is, where specs/plans live, and the exact verify commands. Read it before working. The fill-in templates live under `cadmo/` (`value-gate.md`, `spec.md`, `plan.md`, `decision.md`) and the drift guard is `cadmo/spec-drift.mjs`.

## Go deeper (the full method)

- One-page method — https://github.com/tiagotorres91/cadmo/blob/main/docs/method.md
- Management (the value gate) — https://github.com/tiagotorres91/cadmo/blob/main/docs/frameworks/01-management.md
- Development (spec → tests → done) — https://github.com/tiagotorres91/cadmo/blob/main/docs/frameworks/02-development.md
- Operations (monitoring, incidents) — https://github.com/tiagotorres91/cadmo/blob/main/docs/frameworks/03-operations.md
- Collaboration (multi-dev) — https://github.com/tiagotorres91/cadmo/blob/main/docs/frameworks/04-collaboration.md
- Application (installing it on a new project) — https://github.com/tiagotorres91/cadmo/blob/main/docs/frameworks/05-application.md
- Multi-agent review, spec-drift, security surface — https://github.com/tiagotorres91/cadmo/tree/main/docs
