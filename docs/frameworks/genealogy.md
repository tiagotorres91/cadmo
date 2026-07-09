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
| **CMMI** (SEI) | staged maturity levels | five heavyweight levels became a [ladder](../maturity.md) a small team can climb — level 0 ("vibe") named on purpose |

**What's Cadmo's own** (not from any tradition): the exposure classification (system-describing = client-facing, operation-describing = internal); the prevention-that-diagnoses rule; spec and code in the same commit with a CI drift warning; the method-travels-in-the-repo collaboration; validation by MVP; and the assembly line (Application).

> **PMI note:** references to PMBOK, CPMAI and the Standard for AI are nominative (public frameworks). Cadmo's author is not a PMI member; the material was studied with the support of a PMI-affiliated specialist consultancy.
