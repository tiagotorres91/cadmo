# Compliance map — Cadmo artifacts to AI governance controls

**Prepared for: `<Client>`** · Method: Cadmo · Date: `<YYYY-MM-DD>`

> **Disclaimer — read first.** This document is a **mapping**, not an attestation. It shows how artifacts that Cadmo produces during normal work *support* and *help evidence* the control families of ISO/IEC 42001, the NIST AI Risk Management Framework, and the EU AI Act. It does **not certify** conformity, and it does **not guarantee** any legal or regulatory outcome. Conformity is assessed by the relevant body against the applicable text; certification is granted only by an accredited certifier. Use this map to see *where the evidence already lives* and *what a gap looks like* — then take it to your compliance owner or auditor for a formal reading.

Cadmo doesn't add a compliance layer on top of the work. The governed way of building (levels 3–4 of the [maturity ladder](maturity.md)) already emits the trail these frameworks ask for. This table makes that trail legible.

## The map

| Cadmo artifact | What it is | ISO/IEC 42001 (AIMS) | NIST AI RMF | EU AI Act |
|---|---|---|---|---|
| **[Value gate](../templates/value-gate.md)** | Business case + data-readiness verdict *before* work starts | Supports AI system objectives & risk assessment | Helps evidence **MAP** (context, purpose) & **GOVERN** | Supports risk-management system inputs (Art. 9) |
| **[Validated + signed spec](../templates/spec.md)** | Living documentation the client validates by version and signature | Supports documented requirements & operational planning | Helps evidence **GOVERN** (accountability) | Supports technical documentation (Art. 11) & transparency (Art. 13) |
| **[ADR / decision record](../templates/decision.md)** | Why a choice was made, and the trigger to reconsider | Supports documented decisions & change control | Helps evidence **GOVERN** (traceability) | Supports record-keeping of design choices (Art. 11–12) |
| **Data-readiness check** (value gate) | Explicit 🟢/🟡/🔴 on source, access, reliability | Supports data-quality & data-management controls | Helps evidence **MAP** & **MEASURE** (data validity) | Supports data governance (Art. 10) |
| **[Evals for AI features](../templates/eval.md)** | Measured behaviour before and after change, with history; regressions don't ship | Supports performance monitoring & measurement | Helps evidence **MEASURE** (test, evaluate) & continuous monitoring | Supports accuracy/robustness (Art. 15) & post-market monitoring (Art. 72) |
| **[SLO](../templates/slo.md) + error budget** | Declared reliability target with a burn policy | Supports operational performance objectives | Helps evidence **MEASURE** & **MANAGE** | Supports robustness & continuous monitoring (Art. 15) |
| **[Runbook](../templates/runbook.md)** | Runbook-as-code: trigger → diagnose → act → rollback → escalate | Supports operational response procedures | Helps evidence **MANAGE** (respond, recover) | Supports human oversight (Art. 14) & post-market monitoring (Art. 72) |
| **Incident record** (symptom → cause → correction → prevention) | Blameless postmortem that leaves the system more diagnosable | Supports nonconformity & corrective action | Helps evidence **MANAGE** (incident response) | Supports serious-incident handling & post-market monitoring (Art. 72–73) |
| **[Spec-drift check](spec-drift.md)** | CI fails when code changes and its spec doesn't | Supports document control staying current | Helps evidence **GOVERN** (documentation integrity) | Supports keeping technical documentation up to date (Art. 11) |
| **[Security surface protocol](security-surface.md)** | Secrets in vaults, least-privilege, fail-closed gates, tamper-evident trails | Supports information-security & access controls | Helps evidence **MANAGE** (risk treatment) | Supports logging & cybersecurity (Art. 12, Art. 15) |
| **AGENTS.md + [collaboration protocol](collaboration-protocol.md)** | Roles, conventions, and how humans and AI hand off | Supports roles, responsibilities & competence | Helps evidence **GOVERN** (roles, culture) | Supports human oversight & organizational measures (Art. 14, Art. 17) |

## How to read a gap

A blank cell isn't a violation — it's a prompt. If a control family your engagement is subject to has no artifact pointing at it, that's where to look next: either the artifact exists under another name, or the work to produce it hasn't been scoped yet. Bring the blanks to the compliance owner; they decide which are in scope and which are out.

## Scope note

This map covers artifacts Cadmo emits from *how software is built and operated*. It does **not** cover organizational obligations outside the build (legal basis for processing, DPIAs, conformity assessment procedures, registration, or fundamental-rights impact assessments) — those sit with `<Client>`'s legal and compliance functions. Cadmo's artifacts help *feed* those processes; they don't replace them.

*To reuse this map for another engagement, edit only the client name and date in the header line above. Nothing else in it is client-specific.*
