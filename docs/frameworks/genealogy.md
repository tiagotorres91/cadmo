# Genealogy — what Cadmo took from where

No off-the-shelf framework fits a lean operation running AI in production. Cadmo is a pragmatic hybrid: from each tradition, the practice that solves a problem you actually have — right-sized.

| Tradition | What Cadmo took | How it was adapted |
|---|---|---|
| **Spec-Driven Development** (GitHub Spec Kit) | spec → plan → verify; the spec is the source | steps by size (never a rigid three-file dance); the task board is richer than files in the repo |
| **AWS Kiro** | EARS acceptance criteria; a validation status on the spec | EARS only on critical criteria; steering became the project's context file |
| **Architecture Decision Records** (Nygard) | context → decision → consequences | added a *"when to reconsider"* trigger; retroactive ADRs for live decisions |
| **Anthropic** (agent engineering) | a verification harness; eval-driven AI features; a direct tool-loop over frameworks | harness declared per project; evals with history — "regression does not ship" |
| **BMAD** (multi-agent) | independent reviewer, exploratory fan-out, judge panels | on demand, never permanent roles — the agent adds value precisely by *not* inheriting the pair's biases |
| **XP** (Kent Beck) | pair programming; TDD in spirit; continuous integration | the pair is human + AI; "test first" becomes "criteria first" + eval-first for AI |
| **SRE** (Google) | blameless postmortems; toil elimination; reliability targets | the prevention must make the system *more diagnosable* than before |
| **ITIL** | severities/SLA, ticket flow, change management | the backbone of the support layer — without the bureaucracy |
| **PMBOK 8 / CPMAI / Standard for AI** (PMI) | value on entry and exit; risk; tailoring; AI go/no-go; data readiness; model cards | *tailoring* is PMI's own thesis — the right-sizing Cadmo always practiced, now with the vocabulary a corporate client respects |
| **Kanban** | continuous flow, a board, visualization | the daily operating rhythm |
| **Deming (PDCA)** | plan-do-check-act | runs at two levels — on the demand and on the method itself |
| **OpenSpec** | source-of-truth specs with a propose → apply → **archive** state machine | Cadmo's *absorption* (demand spec folded into stable specs on delivery) is the same instinct — we credit the convergence |
| **AWS AI-DLC** | adaptive rigor: decide which stages are worth it per context | this *is* right-sizing, with AWS's weight behind it — independent arrival at the same principle |
| **CMMI** (SEI) | staged maturity levels | five heavyweight levels became a [ladder](../maturity.md) a small team can climb |

**Honest overlaps** (July 2026): the spec-driven space is crowded and good — [Spec Kit](https://github.com/github/spec-kit), [OpenSpec](https://github.com/Fission-AI/OpenSpec), [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) and AWS's AI-DLC each solve parts of this well, some with far more tooling than Cadmo has today. BMAD ships an adversarial reviewer in its pipeline; OpenSpec archives specs into a source of truth; AI-DLC formalizes adaptive rigor. Cadmo is a *method*, not a tool — and it's designed to sit **above** an execution tool, not replace it (see the README's "use it with, not against").

**What's genuinely Cadmo's own** (not found assembled elsewhere): the exposure classification (system-describing = client-facing, operation-describing = internal); the prevention-that-diagnoses rule; spec and code in the same commit with a CI drift warning; the method-travels-in-the-repo collaboration; validation by MVP; and the assembly line (Application).

> **PMI note:** references to PMBOK, CPMAI and the Standard for AI are nominative (public frameworks). Cadmo's author is not a PMI member; the material was studied with the support of a PMI-affiliated specialist consultancy.
