# Operations — keep it live, with a trail

> Development ends at delivery; operations never ends. It's a different discipline, with different roots (SRE and ITIL), and — as a service — it's a product in itself.

**Pillars:** Provision → Observe → Attend → Respond → Improve.

- **Provision** — staging mirrors production; deploys carry the verification harness (tests → build → publish → smoke) and refuse uncommitted work. Production is the client's environment — the provider operates underneath (scripts, gated deploys), never as an admin role in the client's UI. *Staging mirrors production* and *a deploy is something you run* are web-ish physics: where production is **granted** by an external gatekeeper instead, a ladder replaces the staging URL — see [mobile delivery](../mobile-delivery.md).
- **Observe** — external uptime, error tracking, and every external data load recorded (when, which list, volume, diagnosis). What you can't see, you can't operate.
- **Attend** — a structured channel for corrections and requests, with status the author can follow — not a spreadsheet.
- **Respond** — incidents get four labels: *symptom → cause → correction → prevention*, and the prevention must leave the system **more diagnosable than before**. Blameless postmortems: the analysis targets process and system, not who erred.
- **Improve** — repetitive toil becomes automation; gaps get audited; reliability targets stay on the radar.

**Security posture runs through all five pillars:** secrets live in vaults and never in code or transcripts; access is least-privilege and deny-by-default; authorization gates fail closed; sensitive actions leave tamper-evident trails. None of this gets less necessary as AI writes better code — the attack surface is mostly *around* the code (config, permissions, data flows), and that's operated, not generated. The full map — six surfaces, activation rules, and the scars — is the [security surface protocol](../security-surface.md).

An incident doesn't require a spec (it's reactive) — but if the fix changes a business rule, the stable spec updates in the same commit.

**Templates:** a [runbook](../../templates/runbook.md) (trigger → diagnose → act → rollback → escalate) for the Respond pillar, and an [SLO](../../templates/slo.md) (target + error budget + burn policy) for Observe/Improve. For regulated clients, [`docs/compliance-map.md`](../compliance-map.md) maps these artifacts to ISO/IEC 42001, NIST AI RMF and the EU AI Act control families — it *supports* evidence, it never claims certification.
