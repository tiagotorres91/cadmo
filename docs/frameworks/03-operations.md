# Operations — keep it live, with a trail

> Development ends at delivery; operations never ends. It's a different discipline, with different roots (SRE and ITIL), and — as a service — it's a product in itself.

**Pillars:** Provision → Observe → Attend → Respond → Improve.

- **Provision** — staging mirrors production; deploys carry the verification harness (tests → build → publish → smoke) and refuse uncommitted work. Production is the client's environment — the provider operates underneath (scripts, gated deploys), never as an admin role in the client's UI.
- **Observe** — external uptime, error tracking, and every external data load recorded (when, which list, volume, diagnosis). What you can't see, you can't operate.
- **Attend** — a structured channel for corrections and requests, with status the author can follow — not a spreadsheet.
- **Respond** — incidents get four labels: *symptom → cause → correction → prevention*, and the prevention must leave the system **more diagnosable than before**. Blameless postmortems: the analysis targets process and system, not who erred.
- **Improve** — repetitive toil becomes automation; gaps get audited; reliability targets stay on the radar.

An incident doesn't require a spec (it's reactive) — but if the fix changes a business rule, the stable spec updates in the same commit.
