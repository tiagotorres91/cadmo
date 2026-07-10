# Genealogy — what Cadmo took from where

No off-the-shelf framework fits a lean operation running AI in production. Cadmo is a pragmatic hybrid: from each tradition, the practice that solves a problem you actually have — right-sized.

| Tradition | What Cadmo took | How it was adapted |
|---|---|---|
| **Spec-Driven Development** (GitHub Spec Kit) | spec → plan → verify; the spec is the source | steps by size (never a rigid three-file dance); the task board is richer than files in the repo |
| **AWS Kiro** | EARS acceptance criteria; a validation status on the spec; event hooks | EARS only on critical criteria; steering became the project's context file; hooks became dev-environment guard-rails |
| **Architecture Decision Records** (Nygard) | context → decision → consequences | added a *"when to reconsider"* trigger; retroactive ADRs for live decisions |
| **Anthropic** (agent engineering) | a verification harness; eval-driven AI features; a direct tool-loop over frameworks | harness declared per project; evals with history — "regression does not ship" |
| **BMAD** (multi-agent) | independent reviewer, exploratory fan-out, judge panels, the process check at close | on demand, never permanent roles — the agent adds value precisely by *not* inheriting the pair's biases |
| **Stigmergy / blackboard systems** (distributed AI) | coordination through a shared environment, not direct messages | the repository is the coordination medium — issues, labels and file state carry the collaboration, with no standing orchestrator ([protocol](../collaboration-protocol.md)) |
| **XP** (Kent Beck) | pair programming; TDD in spirit; continuous integration | the pair is human + AI; "test first" becomes "criteria first" + eval-first for AI |
| **Agile / Scrum** | the definition of done; the retrospective | the DoD gained AI-specific items (say what you did NOT test; functional testing beyond green CI); the retro became an on-demand gap audit — no fixed ceremony |
| **Consumer-driven contracts / API-first** | integration contracts between systems | the endpoint's response returns the schema diff (ignored/missing columns) — the partner self-diagnoses instead of opening a ticket |
| **SRE** (Google) | blameless postmortems; toil elimination; reliability targets | the prevention must make the system *more diagnosable* than before |
| **ITIL** | severities/SLA, ticket flow, change management | the backbone of the support layer — without the bureaucracy |
| **PMBOK 8 / CPMAI / Standard for AI** (PMI) | value on entry and exit; risk; tailoring; AI go/no-go; data readiness; model cards | *tailoring* is PMI's own thesis — the right-sizing Cadmo always practiced, now with the vocabulary a corporate client respects |
| **Kanban** | continuous flow, a board, visualization | the daily operating rhythm |
| **Deming (PDCA)** | plan-do-check-act | runs at two levels — on the demand and on the method itself |
| **OpenSpec** | source-of-truth specs with a propose → apply → **archive** state machine | Cadmo's *absorption* (demand spec folded into stable specs on delivery) is the same instinct — we credit the convergence |
| **AWS AI-DLC** | adaptive rigor: decide which stages are worth it per context | this *is* right-sizing, with AWS's weight behind it — independent arrival at the same principle |
| **CMMI** (SEI) | staged maturity levels | five heavyweight levels became a [ladder](../maturity.md) a small team can climb |

**Honest overlaps** (July 2026): the spec-driven space is crowded and good — [Spec Kit](https://github.com/github/spec-kit), [OpenSpec](https://github.com/Fission-AI/OpenSpec), [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) and AWS's AI-DLC each solve parts of this well, some with far more tooling than Cadmo has today. BMAD ships an adversarial reviewer in its pipeline; OpenSpec archives specs into a source of truth; AI-DLC formalizes adaptive rigor. Cadmo is a *method*, not a tool — and it's designed to sit **above** an execution tool, not replace it (see the README's "use it with, not against").

**What's genuinely Cadmo's own** (not found assembled elsewhere): the exposure classification (system-describing = client-facing, operation-describing = internal); the prevention-that-diagnoses rule; spec and code in the same commit with CI drift enforcement; the method-travels-in-the-repo collaboration; validation by MVP; the assembly line (Application); the **official-source rule** (when a named official indicator exists, consume the official number — when a rule names a data source, compute from that source; never re-derive what belongs to someone else); **no-real-data verification techniques** (SQL probes inside `BEGIN…ROLLBACK`, round-trip e2e — resend the system's own data and assert identity, auth probes with inert payloads); and **layered institutional memory** (project map · behavioral memory · management board · specs — every fact has exactly one home).

> **PMI note:** references to PMBOK, CPMAI and the Standard for AI are nominative (public frameworks). Cadmo's author is not a PMI member; the material was studied with the support of a PMI-affiliated specialist consultancy.
